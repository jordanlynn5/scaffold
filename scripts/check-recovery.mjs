// No email is sent. Exercises a real one-use recovery token on a disposable
// account and confirms the password update permits a fresh login.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const browser = createClient(url, anon, { auth: { persistSession: false } });
const base = process.argv[2] ?? 'https://scaffold-theta-three.vercel.app';
let id;
try {
  const email = `scaffold.recovery.${Date.now()}@gmail.com`;
  const created = await admin.auth.admin.createUser({ email, password: 'Old-Recovery-Test-Aa1!', email_confirm: true });
  if (created.error) throw created.error;
  id = created.data.user.id;
  const generated = await admin.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo: `${base}/auth/callback` } });
  if (generated.error) throw generated.error;
  const destination = new URL(generated.data.properties.action_link).searchParams.get('redirect_to');
  console.log(destination === `${base}/auth/callback` ? 'PASS recovery redirect points to the live app' : `CONFIGURATION NEEDED: recovery redirect is ${destination}`);
  const recovered = await browser.auth.verifyOtp({ token_hash: generated.data.properties.hashed_token, type: 'recovery' });
  assert.equal(recovered.error, null);
  assert.equal(recovered.data.user.id, id);
  console.log('PASS recovery token authenticates the correct disposable account');
  const updated = await browser.auth.updateUser({ password: 'New-Recovery-Test-Aa1!' });
  assert.equal(updated.error, null);
  await browser.auth.signOut();
  const old = await browser.auth.signInWithPassword({ email, password: 'Old-Recovery-Test-Aa1!' });
  assert.ok(old.error);
  const fresh = await browser.auth.signInWithPassword({ email, password: 'New-Recovery-Test-Aa1!' });
  assert.equal(fresh.error, null);
  console.log('PASS old password is rejected and the new password logs in');
  const replay = await admin.auth.verifyOtp({ token_hash: generated.data.properties.hashed_token, type: 'recovery' });
  assert.ok(replay.error);
  console.log('PASS the recovery token cannot be reused');
} finally {
  if (id) {
    const removed = await admin.auth.admin.deleteUser(id);
    if (removed.error) throw removed.error;
    console.log('PASS disposable recovery account removed');
  }
}
