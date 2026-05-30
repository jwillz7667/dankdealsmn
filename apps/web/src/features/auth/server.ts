import 'server-only';

// Server-only public surface for the auth feature.
export { handlers, auth, signIn, signOut } from './nextauth';
export { getCurrentUser, requireUser, requireAdmin } from './guards';
export { getApiToken, mintApiToken, type ApiTokenClaims } from './api-token';
export { type UserRole, DEFAULT_ROLE, isAdminRole } from './roles';
