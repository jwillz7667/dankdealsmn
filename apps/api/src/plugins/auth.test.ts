import Fastify, { type FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AppServices } from './context.js';
import { AppError } from '../shared/errors.js';
import { authPlugin } from './auth.js';

const SECRET = 'test-jwt-secret';
const SERVICE_TOKEN = 'test-service-token';

function mintJwt(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(SECRET));
}

// The auth plugin reads only these two config values; this stand-in satisfies
// authPlugin's `dependencies: ['context']` without booting Prisma/Redis/R2.
const fakeContext = fp(
  function context(app: FastifyInstance, _opts, done) {
    const services = {
      config: { AUTH_API_JWT_SECRET: SECRET, API_SERVICE_TOKEN: SERVICE_TOKEN },
    } as unknown as AppServices;
    app.decorate('services', services);
    done();
  },
  { name: 'context' },
);

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify();
  await app.register(fakeContext);
  await app.register(authPlugin);
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof AppError) return reply.status(err.statusCode).send({ code: err.code });
    return reply.status(500).send({ code: 'INTERNAL' });
  });

  // Mirrors the real registration: a guard added directly as an onRequest hook.
  await app.register((scope, _opts, done) => {
    scope.addHook('onRequest', scope.requireRole('ADMIN'));
    scope.get('/admin/ping', () => ({ ok: true }));
    done();
  });
  await app.register((scope, _opts, done) => {
    scope.addHook('onRequest', scope.requireAuth);
    scope.get('/me', (req) => ({ userId: req.auth?.userId }));
    done();
  });

  await app.ready();
  return app;
}

// A hook that neither resolves nor throws stalls Fastify's runner forever, so
// these "lets … through" cases fail by test timeout if the guards regress to
// synchronous, non-`done`-calling functions.
describe('auth guards used as onRequest hooks', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await buildApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('rejects an anonymous admin request with 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/ping' });
    expect(res.statusCode).toBe(401);
  });

  it('lets the service token through to an admin route without hanging', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/admin/ping',
      headers: { authorization: `Bearer ${SERVICE_TOKEN}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });

  it('lets an ADMIN JWT through to an admin route without hanging', async () => {
    const token = await mintJwt({ sub: 'u1', role: 'ADMIN' });
    const res = await app.inject({
      method: 'GET',
      url: '/admin/ping',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('forbids a CUSTOMER JWT from an admin route with 403', async () => {
    const token = await mintJwt({ sub: 'u2', role: 'CUSTOMER' });
    const res = await app.inject({
      method: 'GET',
      url: '/admin/ping',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('lets an authenticated user through requireAuth without hanging', async () => {
    const token = await mintJwt({ sub: 'u3', role: 'CUSTOMER' });
    const res = await app.inject({
      method: 'GET',
      url: '/me',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ userId: 'u3' });
  });
});
