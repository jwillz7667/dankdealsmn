/** Deterministic, URL-safe slug. Mirrors the seed's slugify so slugs are stable. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Appends a short numeric suffix to disambiguate when a slug already exists. */
export function withSuffix(slug: string, n: number): string {
  return n <= 1 ? slug : `${slug}-${n}`;
}
