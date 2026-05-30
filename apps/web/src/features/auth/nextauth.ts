import 'server-only';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@dankdeals/db';
import { authConfig } from './auth.config';

// Node-only Auth.js instance: the edge-safe base config plus the Prisma adapter
// (which links OAuth accounts and stores magic-link verification tokens). The
// generated client is structurally compatible with the adapter's expected type.
const adapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
});
