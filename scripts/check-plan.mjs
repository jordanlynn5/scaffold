// Real slice-3 check. Requires migration 0004 and a running app.
// node --env-file=.env.local scripts/check-plan.mjs [base address]
// Uses disposable accounts and the app's PLAN_MODEL; never touches your goal.
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { checkPlan } from '../lib/ai/plan-shape.ts';
import { todayInZone, addDays } from '../lib/dates.ts';

const base = process.argv[2] ?? 'http://localhost:3000';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const users = [];
const check = (label, condition) => { assert.ok(condition, label); console.log(`PASS  ${label}`); };
const avg = (plan) => plan.tasks.reduce((sum, t) => sum + t.minutes, 0) / plan.tasks.length;
async function builder(experience, timezone) {
  const stamp = `${Date.now()}-${users.length}`;
  const email = `scaffold.plan.${stamp}@gmail.com`;
  const password = `plan-${stamp}-Aa1!`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true,
    user_metadata: { timezone, whatsapp: '+34600000009', whatsapp_consent: false } });
  if (error) throw error;
  const id = data.user.id;
  users.push(id);
  const { data: project, error: projectError } = await admin.from('projects').insert({
    user_id: id, onboarding_step: 'done', wish: 'Become a better illustrator', experience,
    outcome: 'Feel proud sharing my drawings with friends', obstacle: 'I scroll Instagram instead of drawing',
  }).select('id').single();
  if (projectError) throw projectError;
  const jar = new Map();
  const browser = createServerClient(url, key, { cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (cookies) => cookies.forEach(({ name, value }) => jar.set(name, value)),
  }});
  const login = await browser.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  const cookie = [...jar].map(([n, v]) => `${n}=${v}`).join('; ');
  async function request(body) {
    const response = await fetch(`${base}/api/plan`, { method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify(body) });
    return { status: response.status, ...await response.json() };
  }
  return { id, project: project.id, browser, cookie, request };
}
async function tasks(project) {
  const { data, error } = await admin.from('tasks').select('*').eq('project_id', project).order('position');
  if (error) throw error;
  return data;
}
try {
  const anonymous = await fetch(`${base}/api/plan`, { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate' }) });
  check('logged-out generation is refused', anonymous.status === 401);
  const novice = await builder('Complete beginner, never drawn before.', 'Pacific/Kiritimati');
  const expert = await builder('I have drawn daily for ten years and teach illustration; I want advanced deliberate practice.', 'America/Los_Angeles');
  const first = await novice.request({ action: 'generate' });
  check('a real beginner plan is generated and saved', first.status === 200 && first.revision === 1);
  const plan = checkPlan(first.plan);
  check('five milestones, 14 small tasks, whys and if–then plans pass validation', plan.tasks.length === 14);
  check('draft tasks have no dates', (await tasks(novice.project)).every((t) => t.scheduled_date === null));
  const saved = await novice.request({ action: 'generate' });
  check('reopening returns exactly the saved draft', isDeepStrictEqual(saved.plan, first.plan) && saved.revision === 1);
  const page = await (await fetch(`${base}/onboarding/plan`, { headers: { cookie: novice.cookie } })).text();
  check('the review screen restores the saved plan', page.includes(plan.tasks[0].title.replaceAll('&', '&amp;')) && page.includes('I commit to this plan'));
  const experienced = await expert.request({ action: 'generate' });
  check('a real experienced plan is generated', experienced.status === 200);
  checkPlan(experienced.plan);
  check(`experienced tasks are longer (${avg(plan).toFixed(1)} vs ${avg(experienced.plan).toFixed(1)} min)`, avg(experienced.plan) > avg(plan));
  const otherTasks = await novice.browser.from('tasks').select('id').eq('project_id', expert.project);
  check('another person’s tasks are hidden', !otherTasks.error && otherTasks.data.length === 0);
  const denied = await novice.browser.rpc('commit_draft_plan', { p_user_id: expert.id, p_revision: 1 });
  check('the browser cannot call the privileged commit routine', Boolean(denied.error));
  const revised = await novice.request({ action: 'generate', revision: first.revision,
    changes: 'Please make every task exactly five minutes. I need a gentler start.' });
  check('asking for changes replaces the draft', revised.status === 200 && revised.revision === 2);
  checkPlan(revised.plan);
  check('the requested shorter task length is reflected', revised.plan.tasks.every((t) => t.minutes === 5));
  const stale = await novice.request({ action: 'commit', revision: 1 });
  check('an old browser tab cannot commit an unseen revision', stale.status === 409);
  const beforeCommit = todayInZone('Pacific/Kiritimati');
  const committed = await novice.request({ action: 'commit', revision: revised.revision });
  check('the builder can commit the latest draft', committed.status === 200 && committed.committed);
  const dated = await tasks(novice.project);
  check('all 14 dates are consecutive starting today in the builder’s zone', dated.length === 14 && dated.every((t, i) => t.scheduled_date === addDays(beforeCommit, i)));
  const repeated = await novice.request({ action: 'commit', revision: revised.revision });
  check('repeating commit preserves every date', repeated.status === 200 && JSON.stringify((await tasks(novice.project)).map((t) => t.scheduled_date)) === JSON.stringify(dated.map((t) => t.scheduled_date)));
  const blocked = await novice.request({ action: 'generate', revision: revised.revision, changes: 'Change the whole plan.' });
  check('a committed plan cannot be silently replaced', blocked.status === 409);
  const home = await (await fetch(base, { headers: { cookie: novice.cookie } })).text();
  check('Home now shows today’s real task', home.includes(dated[0].title.replaceAll('&', '&amp;')) && !home.includes('Every dream house starts with a plan'));
  const theirs = await tasks(expert.project);
  check('committing one plan leaves another person’s draft undated', theirs.every((t) => t.scheduled_date === null));
} finally {
  for (const id of users) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) console.error('Could not remove disposable plan account', id, error.message);
  }
}
console.log('All live plan checks passed. Disposable accounts removed.');
