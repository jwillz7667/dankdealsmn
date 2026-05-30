import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { serverEnv } from '@/lib/env';
import { sendMagicLinkEmail } from './email';
import { DEFAULT_ROLE, isUserRole } from './roles';

// Edge-safe base config: providers, pages, and callbacks only — no database
// adapter (Prisma can't run on the edge). The full instance in `nextauth.ts`
// composes this with the adapter; `middleware.ts` consumes it directly.
const providers: NextAuthConfig['providers'] = [];

// Google is disabled until the Google Cloud consent screen is configured;
// register it only when both credentials are present.
if (serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      // Both Google and the magic link verify ownership of the same email, so
      // linking them to one account is safe and avoids OAuthAccountNotLinked.
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (serverEnv.RESEND_API_KEY) {
  providers.push(
    Resend({
      apiKey: serverEnv.RESEND_API_KEY,
      from: serverEnv.EMAIL_FROM,
      sendVerificationRequest: sendMagicLinkEmail,
    }),
  );
}

export const authConfig = {
  trustHost: true,
  secret: serverEnv.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
    verifyRequest: '/signin/verify',
    error: '/signin',
  },
  providers,
  callbacks: {
    // Used by middleware for matched routes (see middleware matcher): require a session.
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? DEFAULT_ROLE;
      }
      return token;
    },
    session({ session, token }) {
      // Claims come back through the @auth/core JWT index signature (typed
      // `unknown`), so validate them at this boundary rather than trusting a
      // module augmentation that pnpm's dual @auth/core versions defeat.
      if (typeof token.id === 'string') session.user.id = token.id;
      session.user.role = isUserRole(token.role) ? token.role : DEFAULT_ROLE;
      return session;
    },
  },
} satisfies NextAuthConfig;
