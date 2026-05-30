/** User roles, mirrored from the Prisma `Role` enum (kept as a string union so
 *  the web app never imports the Prisma client outside the Auth.js adapter). */
export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export const DEFAULT_ROLE: UserRole = 'CUSTOMER';

const USER_ROLES: readonly UserRole[] = ['CUSTOMER', 'DRIVER', 'ADMIN'];

/** Narrowing guard for untrusted claim values (JWT payloads, adapter rows). */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}

export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role === 'ADMIN';
}
