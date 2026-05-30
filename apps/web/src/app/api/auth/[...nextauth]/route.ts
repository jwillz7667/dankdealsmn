import { handlers } from '@/features/auth/server';

// Prisma adapter requires the Node.js runtime.
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
