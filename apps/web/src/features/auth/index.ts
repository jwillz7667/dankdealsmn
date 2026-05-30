// Client-safe public surface. Server-only entrypoints (auth(), guards, token
// minting) live in `./server` so they're never pulled into a client bundle.
export { AuthProvider } from './AuthProvider';
export { AccountButton } from './AccountButton';
export { SignInForm } from './SignInForm';
export { SignOutButton } from './SignOutButton';
export { type UserRole, DEFAULT_ROLE, isAdminRole } from './roles';
