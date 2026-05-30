import { z } from 'zod';

/**
 * Environment is validated once at boot. Any missing/invalid var crashes the
 * process immediately with a readable message (fail fast — see CLAUDE.md § Security).
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // `PORT` is injected by the platform (Railway). It takes precedence over the
  // explicit `API_PORT` so the service binds to the port the proxy routes to.
  PORT: z.coerce.number().int().positive().optional(),
  API_PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),

  // Comma-separated list of allowed browser origins.
  WEB_ORIGIN: z
    .string()
    .default('http://localhost:3000')
    .transform((s) => s.split(',').map((o) => o.trim()).filter(Boolean)),

  // HS256 secret shared with the web app to verify per-user JWTs.
  AUTH_API_JWT_SECRET: z.string().min(16),
  // Trusted server-to-server bearer token (Auth.js user sync, internal jobs).
  API_SERVICE_TOKEN: z.string().min(16),

  // Cloudflare R2 (S3-compatible). Optional in dev; required for uploads.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default('dankdeals-media'),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('DankDeals <orders@dankdealsmn.com>'),
});

export type AppConfig = z.infer<typeof EnvSchema>;

let cached: AppConfig | undefined;

export function loadConfig(): AppConfig {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid API environment:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function isUploadsConfigured(config: AppConfig): boolean {
  return Boolean(
    config.R2_ACCOUNT_ID &&
      config.R2_ACCESS_KEY_ID &&
      config.R2_SECRET_ACCESS_KEY &&
      config.R2_PUBLIC_BASE_URL,
  );
}
