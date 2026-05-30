import 'server-only';
import { SignJWT } from 'jose';
import { serverEnv } from '@/lib/env';
import { auth } from './nextauth';
import { DEFAULT_ROLE, type UserRole } from './roles';

const secret = new TextEncoder().encode(serverEnv.AUTH_API_JWT_SECRET);
const TOKEN_TTL = '5m';

export interface ApiTokenClaims {
  id: string;
  role: UserRole;
  email?: string | null;
}

/** Mint a short-lived HS256 JWT the Fastify API verifies (sub/role/email claims). */
export function mintApiToken(claims: ApiTokenClaims): Promise<string> {
  const payload: Record<string, unknown> = { role: claims.role };
  if (claims.email) payload.email = claims.email;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.id)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secret);
}

/** Token for the current session, or null when anonymous. For server-side API calls. */
export async function getApiToken(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return mintApiToken({
    id: session.user.id,
    role: session.user.role ?? DEFAULT_ROLE,
    email: session.user.email,
  });
}
