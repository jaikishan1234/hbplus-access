import { User } from 'firebase/auth';

export const AUTHORIZED_EMAIL_DOMAIN = '@hbplus.fit';

export function isAuthorizedUser(user: User): boolean {
  const email = user.email?.trim().toLowerCase();

  return Boolean(user.emailVerified && email?.endsWith(AUTHORIZED_EMAIL_DOMAIN));
}
