import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@/features/auth/roles';

// Augment Auth.js types so `session.user.id` / `role` and the JWT claims are typed.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    role?: UserRole;
  }
}

declare module 'next-auth/adapters' {
  interface AdapterUser {
    role?: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
