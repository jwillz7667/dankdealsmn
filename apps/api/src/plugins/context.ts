import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../infrastructure/prisma.js';
import { Mailer } from '../infrastructure/mail.js';
import { R2Storage } from '../infrastructure/r2.js';
import { createRedis } from '../infrastructure/redis.js';
import { type AppConfig, isUploadsConfigured } from '../shared/config.js';

export interface AppServices {
  config: AppConfig;
  prisma: typeof prisma;
  mailer: Mailer;
  storage: R2Storage | null;
  redis: ReturnType<typeof createRedis>;
}

declare module 'fastify' {
  interface FastifyInstance {
    services: AppServices;
  }
}

/** Builds shared singletons once and decorates the instance with `services`. */
export const contextPlugin = fp(
  function context(app: FastifyInstance, opts: { config: AppConfig }, done) {
    const { config } = opts;
    const redis = createRedis(config);

    const services: AppServices = {
      config,
      prisma,
      mailer: new Mailer(config),
      storage: isUploadsConfigured(config) ? new R2Storage(config) : null,
      redis,
    };

    app.decorate('services', services);

    app.addHook('onClose', async () => {
      await prisma.$disconnect();
      if (redis) redis.disconnect();
    });

    done();
  },
  { name: 'context' },
);
