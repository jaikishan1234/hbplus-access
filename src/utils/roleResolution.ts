export type UserRole = 'admin' | 'user';

export function resolveUserRole(claims: unknown): UserRole {
  if (typeof claims === 'object' && claims !== null && 'role' in claims) {
    const role = (claims as { role?: unknown }).role;
    return role === 'admin' ? 'admin' : 'user';
  }

  return 'user';
}
