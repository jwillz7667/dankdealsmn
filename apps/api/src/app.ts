import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import autoload from '@fastify/autoload';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { ZodError } from 'zod';
import { loadConfig, type AppConfig } from './shared/config.js';
import { AppError } from './shared/errors.js';
import { contextPlugin } from './plugins/context.js';
import { authPlugin } from './plugins/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export type AppServer = FastifyInstance & { withTypeProvider: () => unknown };

export async function buildApp(configOverride?: AppConfig): Promise<FastifyInstance> {
  const config = configOverride ?? loadConfig();

  const app = Fastify({
    logger:
      config.NODE_ENV === 'development'
        ? { level: 'info', transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss' } } }
        : { level: 'info' },
    trustProxy: true,
    disableRequestLogging: false,
  }).withTypeProvider<ZodTypeProvider>();

  // Zod as the validator + serializer for every route.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(sensible);
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: config.WEB_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Shared services first, then auth (depends on services), then rate-limit (may use redis).
  await app.register(contextPlugin, { config });
  await app.register(authPlugin);
  await app.register(rateLimit, {
    global: true,
    max: 120,
    timeWindow: '1 minute',
    redis: app.services.redis ?? undefined,
    allowList: (req) => req.url === '/health',
  });

  if (config.NODE_ENV !== 'production') {
    await app.register(swagger, {
      openapi: {
        info: { title: 'DankDeals API', version: '0.1.0' },
        servers: [{ url: `http://localhost:${config.API_PORT}` }],
      },
      transform: jsonSchemaTransform,
    });
    await app.register(swaggerUi, { routePrefix: '/docs' });
  }

  // Feature routes (each features/<x>/*.routes.ts exports a Fastify plugin).
  // dirNameRoutePrefix:false → each route file owns its full path; the folder is
  // organizational only (so health.routes.ts → /health, not /health/health).
  await app.register(autoload, {
    dir: join(__dirname, 'features'),
    matchFilter: (path) => path.endsWith('.routes.js') || path.endsWith('.routes.ts'),
    dirNameRoutePrefix: false,
    options: {},
  });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof AppError) {
      return reply
        .status(err.statusCode)
        .send({ error: { code: err.code, message: err.message, details: err.details ?? undefined } });
    }
    // Zod validation failures (body/query/params) → 400 with field details.
    const zodErr = (err as { validation?: unknown }).validation
      ? err
      : err instanceof ZodError
        ? err
        : null;
    if (zodErr) {
      return reply.status(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'Request validation failed',
          details: (err as { validation?: unknown }).validation ?? (err as ZodError).issues,
        },
      });
    }
    if ((err as { statusCode?: number }).statusCode === 429) {
      return reply
        .status(429)
        .send({ error: { code: 'RATE_LIMITED', message: 'Too many requests, slow down.' } });
    }

    req.log.error({ err }, 'unhandled error');
    return reply
      .status(500)
      .send({ error: { code: 'INTERNAL', message: 'Something went wrong on our end.' } });
  });

  app.setNotFoundHandler((req, reply) => {
    reply
      .status(404)
      .send({ error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.url} not found` } });
  });

  return app;
}
