import { z } from 'zod';

/**
 * Server-only environment for the web app. Validated once on first import and
 * cached. Anything missing fails fast with a readable message (see CLAUDE.md §
 * Security). Set SKIP_ENV_VALIDATION=1 to bypass during tooling that doesn't
 * boot the auth stack (e.g. a CI typecheck without secrets).
 *
 * Never imported from a Client Component — these are secrets.
 */
const ServerEnvSchema = z.object({
  // Auth.js session signing secret.
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  // Reserved for sharing the session cookie across subdomains in production.
  AUTH_COOKIE_DOMAIN: z.string().optional(),
  // Google OAuth credentials. Optional: when either is absent the Google
  // provider is not registered (disabled until the Google Cloud consent screen
  // is configured). Magic-link email then carries sign-in on its own.
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  // Resend (magic-link email). Optional: when absent, only OAuth is offered.
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).default('DankDeals <orders@dankdealsmn.com>'),
  // Shared HS256 secret used to mint short-lived per-user JWTs the API verifies.
  AUTH_API_JWT_SECRET: z.string().min(16, 'AUTH_API_JWT_SECRET must be at least 16 characters'),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

function load(): ServerEnv {
  if (process.env.SKIP_ENV_VALIDATION) {
    return process.env as unknown as ServerEnv;
  }
  const parsed = ServerEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid web server environment:\n${issues}`);
  }
  return parsed.data;
}

export const serverEnv: ServerEnv = load();

/** Magic-link email is only available when Resend is configured. */
export const isEmailAuthEnabled: boolean = Boolean(serverEnv.RESEND_API_KEY);

/** Google OAuth is only offered when both credentials are present. */
export const isGoogleAuthEnabled: boolean = Boolean(
  serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET,
);
