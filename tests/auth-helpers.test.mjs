import assert from 'node:assert/strict';
import test from 'node:test';

globalThis.__DEV__ = true;

const { isAuthorizedUser } = await import('../src/utils/domainValidation.ts');
const { resolveUserRole } = await import('../src/utils/roleResolution.ts');

function makeUser(email, emailVerified = true) {
  return { email, emailVerified };
}

test('authorizes a verified @hbplus.fit email', () => {
  assert.equal(isAuthorizedUser(makeUser('person@hbplus.fit')), true);
});

test('rejects an unrelated email domain', () => {
  assert.equal(isAuthorizedUser(makeUser('person@example.com')), false);
});

test('rejects malformed or missing email addresses', () => {
  assert.equal(isAuthorizedUser(makeUser('person@hbplus.fit@other.com')), false);
  assert.equal(isAuthorizedUser(makeUser('not-an-email')), false);
  assert.equal(isAuthorizedUser(makeUser(null)), false);
});

test('rejects an unverified authorized-domain email', () => {
  assert.equal(isAuthorizedUser(makeUser('person@hbplus.fit', false)), false);
});

test('resolves the exact admin claim to admin', () => {
  assert.equal(resolveUserRole({ role: 'admin' }), 'admin');
});

test('defaults a missing role claim to user', () => {
  assert.equal(resolveUserRole({}), 'user');
});

test('defaults a different role value to user', () => {
  assert.equal(resolveUserRole({ role: 'owner' }), 'user');
});
