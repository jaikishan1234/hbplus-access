import { User } from 'firebase/auth';

export const AUTHORIZED_EMAIL_DOMAIN = '@hbplus.fit';
const DEVELOPMENT_EMAIL_DOMAIN = '@gmail.com';

export function isAuthorizedUser(user: User): boolean {
  const email = user.email?.trim().toLowerCase();
  const atIndex = email?.lastIndexOf('@') ?? -1;
  const emailDomain = atIndex >= 0 ? email?.slice(atIndex) : undefined;
  const authorizedDomains = __DEV__
    ? [AUTHORIZED_EMAIL_DOMAIN, DEVELOPMENT_EMAIL_DOMAIN]
    : [AUTHORIZED_EMAIL_DOMAIN];

  return Boolean(
    user.emailVerified &&
      atIndex > 0 &&
      email?.indexOf('@') === atIndex &&
      emailDomain &&
      authorizedDomains.includes(emailDomain),
  );
}
