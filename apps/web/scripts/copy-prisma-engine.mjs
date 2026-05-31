// Vercel bundles the Auth.js Prisma adapter into a serverless (AWS Lambda)
// function, but Next's file tracing follows static requires only — it never
// sees Prisma's query-engine binary, which is loaded by a runtime path lookup.
// So we copy the generated engine(s) into apps/web/.prisma/client, one of the
// directories Prisma searches relative to the function cwd (/var/task/apps/web).
// next.config.mjs then includes this dir via outputFileTracingIncludes.
//
// Runs before `next build` (see package.json). Idempotent and safe to run when
// the engine isn't generated yet (logs and exits 0 rather than failing builds).
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = dirname(dirname(fileURLToPath(import.meta.url))); // apps/web
const srcDir = join(appDir, '..', '..', 'packages', 'db', 'generated', 'client');
const destDir = join(appDir, '.prisma', 'client');

if (!existsSync(srcDir)) {
  console.warn(`[copy-prisma-engine] source not found (${srcDir}); did prisma generate run? skipping.`);
  process.exit(0);
}

const engines = readdirSync(srcDir).filter((f) => /^libquery_engine-.*\.node$/.test(f));
if (engines.length === 0) {
  console.warn(`[copy-prisma-engine] no query-engine binaries in ${srcDir}; skipping.`);
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
for (const engine of engines) {
  cpSync(join(srcDir, engine), join(destDir, engine));
}
console.log(`[copy-prisma-engine] copied ${engines.length} engine(s) to ${destDir}: ${engines.join(', ')}`);

if (!engines.some((f) => f.includes('rhel-openssl'))) {
  console.warn('[copy-prisma-engine] WARNING: no rhel-openssl engine present — Vercel runtime will fail.');
}
