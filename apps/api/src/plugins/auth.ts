import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import type { Role } from '../infrastructure/prisma.js';
import { AppError } from '../shared/errors.js';

export interface AuthContext {
  userId: string;
  role: Role;
  email?: string;
  /** True when the caller authenticated with the internal service token. */
  service: boolean;
}

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthContext | null;
  }
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest) => Promise<void>;
    requireRole: (...roles: Role[]) => (req: FastifyRequest) => Promise<void>;
    requireService: (req: FastifyRequest) => Promise<void>;
  }
}

// Claims minted by the web app (Auth.js → short-lived HS256 JWT).
const ClaimsSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(['CUSTOMER', 'DRIVER', 'ADMIN']).default('CUSTOMER'),
  email: z.string().email().optional(),
});

function bearer(req: FastifyRequest): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

export const authPlugin = fp(
  function auth(app: FastifyInstance, _opts, done) {
    const secret = new TextEncoder().encode(app.services.config.AUTH_API_JWT_SECRET);
    const serviceToken = app.services.config.API_SERVICE_TOKEN;

    // Populate request.auth for every request (null when anonymous). Never throws.
    app.addHook('onRequest', async (req) => {
      req.auth = null;
      const token = bearer(req);
      if (!token) return;

      if (token === serviceToken) {
        req.auth = { userId: 'service', role: 'ADMIN', service: true };
        return;
      }

      try {
        const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
        const claims = ClaimsSchema.parse(payload);
        req.auth = { userId: claims.sub, role: claims.role, email: claims.email, service: false };
      } catch {
        // Invalid/expired token → treated as anonymous; guards below enforce access.
      }
    });

    // Guards are async so Fastify awaits them as onRequest hooks: a rejection
    // (thrown AppError) routes to the error handler, and a resolve advances the
    // chain. A *synchronous* guard that returns undefined never signals
    // completion to Fastify's hook runner, so authorized requests would hang.
    // eslint-disable-next-line @typescript-eslint/require-await -- async by design: Fastify must see a promise (see comment above)
    app.decorate('requireAuth', async (req: FastifyRequest) => {
      if (!req.auth) throw AppError.unauthorized();
    });

    app.decorate(
      'requireRole',
      (...roles: Role[]) =>
        // eslint-disable-next-line @typescript-eslint/require-await -- async by design: Fastify must see a promise (see comment above)
        async (req: FastifyRequest) => {
          if (!req.auth) throw AppError.unauthorized();
          if (!roles.includes(req.auth.role)) throw AppError.forbidden();
        },
    );

    // eslint-disable-next-line @typescript-eslint/require-await -- async by design: Fastify must see a promise (see comment above)
    app.decorate('requireService', async (req: FastifyRequest) => {
      if (!req.auth?.service) throw AppError.forbidden('Service token required');
    });

    done();
  },
  { name: 'auth', dependencies: ['context'] },
);
