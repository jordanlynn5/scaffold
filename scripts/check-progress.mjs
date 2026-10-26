// Slice 5: the house, Progress, streak and the weekly celebration.
// Needs `npm run dev` running. Uses disposable accounts and removes them.
// node --env-file=.env.local scripts/check-progress.mjs [base address]
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { todayInZone, addDays } from '../lib/dates.ts';
import { deriveHouse, slotsLaid, streakWeeks, STAGE_SLOTS } from '../lib/progress/derive.ts';

const base = process.argv[2] ?? 'http://localhost:3000';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const zone = 'Pacific/Kiritimati';
const today = todayInZone(zone);
const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
const monday = addDays(today, -((weekday + 6) % 7));
const users = [];
const unwrap = ({ data, error }) => { if (error) throw error; return data; };
const pass = (name, yes) => { assert.ok(yes, name); console.log(`PASS  ${name}`); };
const stagesOf = (counts, doneCounts, statuses = []) => counts.map((n, i) => ({
  position: i + 1, status: statuses[i] ?? 'upcoming',
  tasks: Array.from({ length: n }, (_, j) => ({ status: j < (doneCounts[i] ?? 0) ? 'done' : 'upcoming' })),
}));

// The arithmetic, without the database.
{
  const h = deriveHouse(stagesOf([5, 5, 4, 0, 0], [3]));
  pass('bricks laid equals done tasks', h.bricksLaid === 3);
  pass('current stage is the first unfinished one', h.stage === 1 && Math.abs(h.fill - 0.6) < 1e-9);
  const moved = deriveHouse(stagesOf([5, 5, 4, 0, 0], [5, 2]));
  pass('a finished stage hands over to the next', moved.stage === 2 && moved.bricksLaid === 7 && moved.stages[0].finished);
  const end = deriveHouse(stagesOf([5, 5, 4, 0, 0], [5, 5, 4]));
  pass('the last planned stage is not assumed finished', end.stage === 3 && end.fill < 1 && slotsLaid(51, 3, 3, end.fill) < 51);
  pass('a milestone marked done counts as finished', deriveHouse(stagesOf([2, 2, 0, 0, 0], [1], ['done'])).stage === 2);
  pass('the current stage never looks complete early', slotsLaid(12, 1, 1, 1) === 11 && slotsLaid(12, 1, 1, 1, true) === 12);
  pass('each stage has the agreed slots', STAGE_SLOTS.join() === '12,12,51,12,12');
  const shown = [1, 2, 3, 4, 5].map((d) => { const h = deriveHouse(stagesOf([5, 5], [d])); return slotsLaid(12, 1, h.stage, h.fill); });
  pass('every task in a 5-task stage adds to the drawing', shown.every((n, i) => i === 0 || n > shown[i - 1]));
  const w = (offset, hit) => ({ week_start: addDays(monday, -7 * offset), hit });
  pass('streak counts consecutive hit weeks', streakWeeks([w(0, true), w(1, true), w(2, false), w(3, true)], monday) === 2);
  pass('streak runs through last week when this week is not hit yet', streakWeeks([w(0, false), w(1, true), w(2, true)], monday) === 2);
  pass('a gap ends the streak', streakWeeks([w(2, true)], monday) === 0);
}

async function builder(target) {
  const stamp = `${Date.now()}-${users.length}`;
  const email = `scaffold.progress.${stamp}@gmail.com`, password = `Progress-${stamp}-Aa1!`;
  const user = unwrap(await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { timezone: zone } })).user;
  users.push(user.id);
  unwrap(await db.from('profiles').update({ weekly_target: target, timezone: zone }).eq('id', user.id));
  const project = unwrap(await db.from('projects').insert({ user_id: user.id, status: 'active', onboarding_step: 'done', wish: 'Draw with confidence', outcome: 'Share drawings', committed_at: new Date().toISOString() }).select('id').single());
  const names = ['Groundwork', 'Foundation', 'Walls', 'Roof', 'Finishing'];
  const milestones = unwrap(await db.from('milestones').insert(names.map((stage_name, i) => ({ project_id: project.id, position: i + 1, stage_name, title: `Milestone ${i + 1}`, status: i ? 'upcoming' : 'current' }))).select('id, position').order('position'));
  // Three tasks in Groundwork, two in Foundation.
  const tasks = unwrap(await db.from('tasks').insert([1, 1, 1, 2, 2].map((m, i) => ({ project_id: project.id, milestone_id: milestones[m - 1].id, position: i + 1, title: `Task ${i + 1}`, how_to: 'Draw slowly', count: 1, minutes_per_item: 5, minutes: 5, why: 'Build confidence', scheduled_date: addDays(today, i + 1) }))).select('id, position').order('position'));
  const jar = new Map();
  const browser = createServerClient(url, key, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: (values) => values.forEach(({ name, value }) => jar.set(name, value)) } });
  unwrap(await browser.auth.signInWithPassword({ email, password }));
  const cookie = [...jar].map(([n, v]) => `${n}=${v}`).join('; ');
  // Like a real plan, one task sits on today: move earlier ones back a day.
  const complete = async (taskId) => {
    unwrap(await db.from('tasks').update({ scheduled_date: addDays(today, -1) }).eq('project_id', project.id).eq('scheduled_date', today).neq('id', taskId));
    unwrap(await db.from('tasks').update({ scheduled_date: today }).eq('id', taskId));
    const body = new FormData(); body.set('taskId', taskId);
    const response = await fetch(`${base}/api/tasks/complete`, { method: 'POST', headers: { cookie, origin: base }, body });
    return { status: response.status, ...(await response.json()) };
  };
  const page = async (path) => (await (await fetch(`${base}${path}`, { headers: { cookie } })).text()).replace(/<!-- -->/g, '');
  const owed = async () => unwrap(await db.from('pending_celebrations').select('id, kind, shown_at').eq('user_id', user.id));
  return { id: user.id, tasks, complete, page, owed, cookie };
}

try {
  // Reaching the target celebrates exactly once.
  const a = await builder(1);
  const first = await a.complete(a.tasks[0].id);
  pass('the task that reaches the target returns a weekly celebration', first.status === 200 && first.celebrations.length === 1 && first.celebrations[0].kind === 'weekly');
  const again = await a.complete(a.tasks[0].id);
  const next = await a.complete(a.tasks[1].id);
  pass('repeating it or doing more that week returns no second celebration', again.celebrations.length === 0 && next.celebrations.length === 0 && (await a.owed()).length === 1);
  const home = await a.page('/');
  pass('Home shows the celebration and the small house', home.includes('Congratulations, you hit your weekly target!') && home.includes('Stage 1 of 5: Groundwork') && home.includes('See progress'));
  const seen = await fetch(`${base}/api/celebrations/seen`, { method: 'POST', headers: { cookie: a.cookie, origin: base, 'content-type': 'application/json' }, body: JSON.stringify({ id: first.celebrations[0].id }) });
  pass('closing it marks it shown', seen.status === 200 && (await a.owed())[0].shown_at);
  pass('a shown celebration does not come back', !(await a.page('/progress')).includes('Congratulations, you hit your weekly target!'));

  // Lowering the target never celebrates by itself.
  const b = await builder(3);
  const one = await b.complete(b.tasks[0].id);
  pass('below target there is no celebration', one.status === 200 && one.celebrations.length === 0);
  unwrap(await db.from('profiles').update({ weekly_target: 1 }).eq('id', b.id));
  pass('lowering the target below the done count owes nothing', (await b.owed()).length === 0 && !(await b.page('/')).includes('Congratulations'));
  const two = await b.complete(b.tasks[1].id);
  pass('the next task marked done brings the celebration', two.celebrations.length === 1);

  // Progress: stage hand-over, bricks, streak, roadmap.
  await b.complete(b.tasks[2].id);
  unwrap(await db.from('week_records').insert([1, 2].map((n) => ({ user_id: b.id, week_start: addDays(monday, -7 * n), target: 1, done_count: 1, hit: true }))));
  unwrap(await db.from('week_records').insert({ user_id: b.id, week_start: addDays(monday, -21), target: 1, done_count: 0, hit: false }));
  const progress = await b.page('/progress');
  pass('Progress shows the next stage once Groundwork is done', progress.includes('Stage 2 of 5: Foundation'));
  pass('Progress shows bricks laid', progress.includes('3 bricks laid'));
  pass('Progress shows the streak', progress.includes('3 weeks on target in a row'));
  pass('Progress shows the roadmap and houses built', progress.includes('Roadmap') && progress.includes('Milestone 5') && progress.includes('Houses built'));
} finally {
  for (const id of users) await db.auth.admin.deleteUser(id);
  console.log(`Removed ${users.length} test accounts.`);
}
