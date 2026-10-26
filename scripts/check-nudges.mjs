// Slice 6: the daily nudge.
// node --env-file=.env.local scripts/check-nudges.mjs [base address] [--real you@example.com] [--email-only]
//
// Always: the channel rule at its edges, the due window, one scheduled nudge
// a day, the bell refusing callers without the secret, and the WhatsApp
// address refusing forged messages. Needs `npm run dev` (or a live address).
// With --real and your Resend account email: one real email through the
// bell, using a disposable account that is removed afterwards. WhatsApp is
// tested only when WHATSAPP_SENDING=on and that account has a number.
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { chooseChannel, whatsappBlocked } from '../lib/nudges/channel.ts';
import { isDue, clockInZone } from '../lib/nudges/due.ts';

const args = process.argv.slice(2);
const realIndex = args.indexOf('--real');
const realEmail = realIndex >= 0 ? args[realIndex + 1] : null;
const base = args.find((a, i) => !a.startsWith('--') && (realIndex < 0 || i !== realIndex + 1)) ?? 'http://localhost:3000';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const unwrap = ({ data, error }) => { if (error) throw error; return data; };
const pass = (name, yes) => { assert.ok(yes, name); console.log(`PASS  ${name}`); };
const users = [];

// --- The channel rule (pure) ---
const now = new Date('2026-10-22T09:00:00Z');
const ago = (hours) => new Date(now.getTime() - hours * 3600_000).toISOString();
const ON = true;
const person = (o = {}) => ({ whatsapp: '+34600000000', whatsapp_consent: true, whatsapp_joined_at: ago(48), whatsapp_last_inbound_at: ago(23), ...o });
pass('WhatsApp when last message was 23 hours ago and joined 2 days ago', chooseChannel(person(), now, ON) === 'whatsapp');
pass('email when last message was 25 hours ago', chooseChannel(person({ whatsapp_last_inbound_at: ago(25) }), now, ON) === 'email' && whatsappBlocked(person({ whatsapp_last_inbound_at: ago(25) }), now, ON) === 'quiet');
pass('email at exactly the 24-hour reply boundary', whatsappBlocked(person({ whatsapp_last_inbound_at: ago(24) }), now, ON) === 'quiet');
pass('email at exactly the 72-hour join boundary', whatsappBlocked(person({ whatsapp_joined_at: ago(72) }), now, ON) === 'not-joined');
pass('email when joined 4 days ago, even with a recent message', chooseChannel(person({ whatsapp_joined_at: ago(96) }), now, ON) === 'email' && whatsappBlocked(person({ whatsapp_joined_at: ago(96) }), now, ON) === 'not-joined');
pass('email without WhatsApp consent', whatsappBlocked(person({ whatsapp_consent: false }), now, ON) === 'no-consent');
pass('email for everyone while WhatsApp sending is switched off', whatsappBlocked(person(), now, false) === 'switched-off' && chooseChannel(person(), now, false) === 'email');
pass('email without a number', whatsappBlocked(person({ whatsapp: null }), now, ON) === 'no-number');
pass('email when never joined', whatsappBlocked(person({ whatsapp_joined_at: null }), now, ON) === 'not-joined');

// --- The due window (pure) ---
const at = (iso) => new Date(iso);
pass('due at the chosen time in the person’s zone', isDue('09:00:00', 'Europe/Madrid', at('2026-10-22T07:00:00Z')));
pass('due 30 minutes later, for half-hour time zones', isDue('09:00', 'Asia/Kolkata', at('2026-10-22T04:00:00Z')));
pass('not due an hour later', !isDue('09:00', 'Europe/Madrid', at('2026-10-22T08:00:00Z')));
pass('not due a minute early', !isDue('09:00', 'Europe/Madrid', at('2026-10-22T06:59:00Z')));
pass('the date is the person’s own date', clockInZone('Pacific/Kiritimati', at('2026-10-22T12:00:00Z')).date === '2026-10-23');

async function disposable(label, extra = {}) {
  const stamp = `${Date.now()}-${users.length}`;
  const user = unwrap(await db.auth.admin.createUser({ email: `scaffold.nudge.${label}.${stamp}@gmail.com`, password: `Nudge-${stamp}-Aa1!`, email_confirm: true, user_metadata: { timezone: 'UTC' } })).user;
  users.push(user.id);
  if (Object.keys(extra).length) unwrap(await db.from('profiles').update(extra).eq('id', user.id));
  return user.id;
}

async function signedIn(userId) {
  const link = unwrap(await db.auth.admin.generateLink({ type: 'magiclink', email: unwrap(await db.auth.admin.getUserById(userId)).user.email }));
  const jar = new Map();
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (values) => values.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  unwrap(await client.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: 'magiclink' }));
  return { client, cookie: [...jar].map(([name, value]) => `${name}=${value}`).join('; ') };
}

try {
  // --- One scheduled nudge a day (database rule) ---
  const id = await disposable('log');
  unwrap(await db.from('nudge_log').insert({ user_id: id, sent_on: '2026-10-22', trigger: 'scheduled' }));
  const second = await db.from('nudge_log').insert({ user_id: id, sent_on: '2026-10-22', trigger: 'scheduled' });
  pass('a second scheduled nudge on the same day is refused', second.error?.code === '23505');
  const manual = await db.from('nudge_log').insert({ user_id: id, sent_on: '2026-10-22', trigger: 'manual' });
  pass('"Send my nudge now" is not blocked by the scheduled one', !manual.error);
  pass('next day’s scheduled nudge is allowed', !(await db.from('nudge_log').insert({ user_id: id, sent_on: '2026-10-23', trigger: 'scheduled' })).error);

  // The nudge waits on Home, including after today's task is done.
  const { date: today } = clockInZone('UTC');
  const fresh = new Date().toISOString();
  const project = unwrap(await db.from('projects').insert({ user_id: id, status: 'active', onboarding_step: 'done', wish: 'Draw with confidence', outcome: 'Sketch my friends', committed_at: fresh }).select('id').single());
  const milestone = unwrap(await db.from('milestones').insert({ project_id: project.id, position: 1, stage_name: 'Groundwork', title: 'Basic shapes', status: 'current' }).select('id').single());
  const task = unwrap(await db.from('tasks').insert({ project_id: project.id, milestone_id: milestone.id, position: 1, scheduled_date: today, title: 'Draw five ovals', how_to: 'Draw five ovals, two minutes each.', count: 5, minutes_per_item: 2, minutes: 10, why: 'Heads start as ovals.' }).select('id').single());
  const line = 'Make a little room for your sketches today.';
  unwrap(await db.from('nudge_log').insert({ user_id: id, sent_on: today, trigger: 'manual', line, channel: 'email', provider_id: 'saved-line-fixture' }));
  const viewer = await signedIn(id);
  const home = () => fetch(base, { headers: { cookie: viewer.cookie } }).then(r => r.text());
  pass('Home shows the saved email line beside today’s task', (await home()).includes(line));
  unwrap(await db.rpc('complete_task', { p_user_id: id, p_task_id: task.id, p_note: '', p_source: 'app' }));
  pass('Home keeps the same email line after completing today’s task', (await home()).includes(line));
  const outsider = await signedIn(await disposable('privacy'));
  pass('another account cannot read the nudge', unwrap(await outsider.client.from('nudge_log').select('id').eq('user_id', id)).length === 0);
  pass('a browser cannot insert nudges', Boolean((await viewer.client.from('nudge_log').insert({ user_id: id, sent_on: today, trigger: 'manual' })).error));

  // --- The bell refuses strangers ---
  const noSecret = await fetch(`${base}/api/cron/tick`, { method: 'POST' });
  pass('the bell without the secret is refused', noSecret.status === 401);
  const wrongSecret = await fetch(`${base}/api/cron/tick`, { method: 'POST', headers: { Authorization: 'Bearer not-the-secret' } });
  pass('the bell with a wrong secret is refused', wrongSecret.status === 401);

  // --- The WhatsApp address refuses forgeries ---
  const inboundUrl = `${(process.env.APP_URL ?? '').replace(/\/$/, '')}/api/whatsapp/inbound`;
  const fields = { From: 'whatsapp:+34600000000', Body: 'join test', NumMedia: '0' };
  const sign = (token) => createHmac('sha1', token).update(inboundUrl + Object.keys(fields).sort().map((k) => k + fields[k]).join('')).digest('base64');
  const unsigned = await fetch(`${base}/api/whatsapp/inbound`, { method: 'POST', body: new URLSearchParams(fields) });
  pass('a WhatsApp message with no signature is refused', unsigned.status === 403);
  const forged = await fetch(`${base}/api/whatsapp/inbound`, { method: 'POST', headers: { 'X-Twilio-Signature': sign('a-guessed-token') }, body: new URLSearchParams(fields) });
  pass('a WhatsApp message signed with the wrong token is refused', forged.status === 403);

  // A correctly signed message records the join and the last-message time.
  const number = `+3460${String(Date.now()).slice(-7)}`;
  const joiner = await disposable('join', { whatsapp: number });
  const joinFields = { From: `whatsapp:${number}`, Body: 'join test', NumMedia: '0' };
  const goodSig = createHmac('sha1', process.env.TWILIO_AUTH_TOKEN).update(inboundUrl + Object.keys(joinFields).sort().map((k) => k + joinFields[k]).join('')).digest('base64');
  const signed = await fetch(`${base}/api/whatsapp/inbound`, { method: 'POST', headers: { 'X-Twilio-Signature': goodSig }, body: new URLSearchParams(joinFields) });
  const joined = unwrap(await db.from('profiles').select('whatsapp_joined_at, whatsapp_last_inbound_at').eq('id', joiner).single());
  pass('a real Twilio message records the join and last-message time', signed.status === 200 && joined.whatsapp_joined_at && joined.whatsapp_last_inbound_at);

  // --- Real sends through the real bell ---
  if (realEmail) {
    const whatsappOn = process.env.WHATSAPP_SENDING === 'on' && !args.includes('--email-only');
    const owner = whatsappOn ? unwrap(await db.from('profiles').select('whatsapp').eq('email', realEmail).single()) : { whatsapp: null };
    if (whatsappOn) assert.ok(owner.whatsapp, 'your account needs a WhatsApp number when WhatsApp sending is on');
    const { date, minute } = clockInZone('UTC');
    const nudge_time = `${String(Math.floor(minute / 60)).padStart(2, '0')}:00`;
    const fresh = new Date().toISOString();
    // With WhatsApp switched on, one account is reachable there; the other is
    // "quiet" and gets email. With it off, only the email account is used.
    const viaWhatsApp = whatsappOn ? await disposable('wa', { nudge_time, whatsapp: owner.whatsapp, whatsapp_consent: true, whatsapp_joined_at: fresh, whatsapp_last_inbound_at: fresh, email: realEmail, name: 'Check' }) : null;
    const viaEmail = await disposable('email', { nudge_time, whatsapp: owner.whatsapp, whatsapp_consent: true, whatsapp_joined_at: fresh, whatsapp_last_inbound_at: whatsappOn ? null : fresh, email: realEmail, name: 'Check' });
    const ids = [viaWhatsApp, viaEmail].filter(Boolean);
    for (const userId of ids) {
      const project = unwrap(await db.from('projects').insert({ user_id: userId, status: 'active', onboarding_step: 'done', wish: 'Draw faces with confidence', outcome: 'Sketch my friends', committed_at: fresh }).select('id').single());
      const milestone = unwrap(await db.from('milestones').insert({ project_id: project.id, position: 1, stage_name: 'Groundwork', title: 'Basic shapes', status: 'current' }).select('id').single());
      unwrap(await db.from('tasks').insert({ project_id: project.id, milestone_id: milestone.id, position: 1, scheduled_date: date, title: 'Draw five ovals for heads', how_to: 'Draw five ovals, two minutes each. (This is a test nudge from the build check.)', count: 5, minutes_per_item: 2, minutes: 10, why: 'Heads start as ovals.' }));
    }
    const ring = () => fetch(`${base}/api/cron/tick`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` } });
    const first = await ring();
    pass('the bell with the secret is accepted', first.status === 200);
    const logs = unwrap(await db.from('nudge_log').select('user_id, channel, provider_id').in('user_id', ids));
    const em = logs.find((l) => l.user_id === viaEmail);
    if (whatsappOn) {
      const wa = logs.find((l) => l.user_id === viaWhatsApp);
      pass(`a real WhatsApp nudge returned a Twilio message id (${wa?.provider_id})`, wa?.channel === 'whatsapp' && /^(SM|MM)/.test(wa.provider_id ?? ''));
    } else {
      console.log('SKIP  WhatsApp send (email-only check)');
    }
    pass(`a real email nudge returned a Resend id (${em?.provider_id})`, em?.channel === 'email' && em.provider_id);
    await ring();
    const after = unwrap(await db.from('nudge_log').select('id').in('user_id', ids));
    pass('ringing the bell again sends nothing more today', after.length === ids.length);
  } else {
    console.log('SKIP  real sends (run with --real your@email to send an email)');
  }
} finally {
  for (const id of users) unwrap(await db.auth.admin.deleteUser(id));
  console.log(`Cleaned up ${users.length} disposable accounts.`);
}
