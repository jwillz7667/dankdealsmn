import { PrismaClient } from './generated/client/index.js';

export * from './generated/client/index.js';
export { Prisma } from './generated/client/index.js';

// Singleton — avoids exhausting connections during dev hot-reload and serverless.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
