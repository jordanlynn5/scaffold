// No emails, accounts or passwords are changed by this check.
import assert from 'node:assert/strict';
const base = process.argv[2] ?? 'http://localhost:3000';
for (const [query, expected] of [
  ['', '/reset-password'],
  ['?code=invalid-test-code', '/reset-password?error=browser'],
  ['?error=access_denied&error_code=otp_expired', '/reset-password?error=expired'],
]) {
  const response = await fetch(`${base}/auth/callback${query}`, { redirect: 'manual' });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), `${base}${expected}`);
  console.log(`PASS callback ${query || '(fragment-only or empty)'} → ${expected}`);
}
console.log('Recovery callback checks passed.');
