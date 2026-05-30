import type { ApiErrorBody } from './types';

// Default to the Railway-hosted API behind its custom domain. Override with
// NEXT_PUBLIC_API_URL (e.g. http://localhost:4000 for local dev, or the
// *.up.railway.app URL when no custom domain is attached).
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'https://api.dankdealsmn.com').replace(
  /\/$/,
  '',
);

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  /** Bearer token for authenticated calls (per-user JWT or service token). */
  token?: string;
  /** Next.js cache directive. Defaults to no-store for correctness. */
  cache?: RequestCache;
  /** Next.js revalidation config (ISR) — opt in per call for cacheable reads. */
  next?: { revalidate?: number | false; tags?: string[] };
  signal?: AbortSignal;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (opts.token) headers.authorization = `Bearer ${opts.token}`;

  const init: RequestInit & { next?: RequestOptions['next'] } = {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: opts.signal,
  };
  // `next` and `cache` are mutually exclusive in Next's fetch. Prefer `next`.
  if (opts.next) init.next = opts.next;
  else init.cache = opts.cache ?? 'no-store';

  const res = await fetch(`${API_URL}${path}`, init);

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data: unknown = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const err = (data as ApiErrorBody | undefined)?.error;
    throw new ApiError(
      res.status,
      err?.code ?? 'HTTP_ERROR',
      err?.message ?? `Request failed with status ${res.status}`,
      err?.details,
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, body, opts),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, body, opts),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, undefined, opts),
};

/** Build a querystring from a record, dropping null/undefined/empty values. */
export function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === '') continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}
