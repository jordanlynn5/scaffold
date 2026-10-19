// Slice 4: disposable accounts, real completion route and private storage.
// node --env-file=.env.local scripts/check-completion.mjs [base address]
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { todayInZone, addDays } from '../lib/dates.ts';
const base = process.argv[2] ?? 'http://localhost:3000';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const users = [];
const photos = [];
const unwrap = ({ data, error }) => { if (error) throw error; return data; };
const pass = (name, yes) => { assert.ok(yes, name); console.log(`PASS  ${name}`); };
async function builder() {
  const stamp = `${Date.now()}-${users.length}`;
  const email = `scaffold.completion.${stamp}@gmail.com`, password = `Complete-${stamp}-Aa1!`;
  const user = unwrap(await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { timezone: 'Pacific/Kiritimati' } })).user;
  users.push(user.id);
  unwrap(await db.from('profiles').update({ weekly_target: 1 }).eq('id', user.id));
  const project = unwrap(await db.from('projects').insert({ user_id: user.id, status: 'active', onboarding_step: 'done', wish: 'Draw with confidence', outcome: 'Share drawings', committed_at: new Date().toISOString() }).select('id').single());
  const milestone = unwrap(await db.from('milestones').insert({ project_id: project.id, position: 1, stage_name: 'Groundwork', title: 'Start drawing', status: 'current' }).select('id').single());
  const tasks = unwrap(await db.from('tasks').insert([1,2,3].map(position => ({ project_id: project.id, milestone_id: milestone.id, position, title: `Draw ${position} lines`, how_to: 'Draw slowly', count: 1, minutes_per_item: 5, minutes: 5, why: 'Build confidence', scheduled_date: addDays(todayInZone('Pacific/Kiritimati'), position - 1) }))).select('id'));
  const jar = new Map();
  const browser = createServerClient(url, key, { cookies: { getAll: () => [...jar].map(([name,value]) => ({name,value})), setAll: values => values.forEach(({name,value}) => jar.set(name,value)) } });
  unwrap(await browser.auth.signInWithPassword({email,password}));
  const cookie = [...jar].map(([n,v]) => `${n}=${v}`).join('; ');
  async function complete(taskId, note = '', photo) {
    const body = new FormData(); body.set('taskId', taskId); body.set('note', note);
    if (photo) body.set('photo', photo, 'proof.png');
    const response = await fetch(`${base}/api/tasks/complete`, {method:'POST',headers:{cookie,origin:base},body});
    return { status:response.status, ...await response.json() };
  }
  return { id:user.id, project: project.id, tasks, browser, cookie, complete };
}
try {
  const anonymous = await fetch(`${base}/api/tasks/complete`, {method:'POST',body:new FormData()});
  pass('anonymous completion refused', anonymous.status === 401);
  const a = await builder(), b = await builder();
  const foreign = await b.complete(a.tasks[0].id);
  pass('another builder cannot complete your task', foreign.status !== 200);
  const png = new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4GkAAAAASUVORK5CYII=', 'base64')], {type:'image/png'});
  const first = await a.complete(a.tasks[0].id, 'Practised slow lines', png);
  pass('completion with photo succeeds', first.status === 200 && !first.photoWarning);
  const task = unwrap(await db.from('tasks').select('*').eq('id', a.tasks[0].id).single());
  const proof = unwrap(await db.from('proofs').select('*').eq('task_id', task.id).single());
  if (proof.photo_path) photos.push(proof.photo_path);
  pass('task has a done time', task.status === 'done' && task.done_at);
  pass('proof saves note, photo and source', proof.note === 'Practised slow lines' && proof.photo_path?.startsWith(`${a.id}/`) && proof.source === 'app');
  const week = unwrap(await db.from('week_records').select('*').eq('user_id', a.id).single());
  pass('week counts one completed day', week.done_count === 1 && week.hit);
  pass('weekly target creates one pending celebration', first.celebrations.length === 1);
  const again = await a.complete(task.id, 'Should not replace original');
  pass('repeated completion changes nothing', again.alreadyDone && again.celebrations.length === 0 && JSON.stringify(unwrap(await db.from('tasks').select('*').eq('id', task.id).single())) === JSON.stringify(task) && JSON.stringify(unwrap(await db.from('proofs').select('*').eq('task_id', task.id).single())) === JSON.stringify(proof) && JSON.stringify(unwrap(await db.from('week_records').select('*').eq('user_id', a.id).single())) === JSON.stringify(week));
  const home = await (await fetch(base, {headers:{cookie:a.cookie}})).text();
  pass('Home reload shows saved completion and note', home.includes('Today’s brick is laid') && home.includes('Practised slow lines'));
  unwrap(await db.from('tasks').update({scheduled_date: todayInZone('Pacific/Kiritimati')}).in('id', a.tasks.slice(1).map(t=>t.id)));
  const failed = await a.complete(a.tasks[1].id, 'Still did the task', new Blob(['bad image'], {type:'application/octet-stream'}));
  pass('failed photo leaves completion and note saved', failed.status === 200 && failed.photoWarning && unwrap(await db.from('tasks').select('status').eq('id',a.tasks[1].id).single()).status === 'done');
  pass('multiple tasks on one day count as one day', unwrap(await db.from('week_records').select('done_count').eq('user_id',a.id).single()).done_count === 1);
  const race = await Promise.all([a.complete(a.tasks[2].id), a.complete(a.tasks[2].id)]);
  pass('simultaneous duplicate requests complete exactly once', race.every(r => r.status === 200) && race.filter(r => r.alreadyDone).length === 1);
  const hidden = unwrap(await b.browser.from('proofs').select('*').eq('task_id',task.id));
  pass('proof rows are private', hidden.length === 0);
  const forbidden = await b.browser.storage.from('proofs').download(proof.photo_path);
  pass('proof photos are private', Boolean(forbidden.error));
  const direct = await a.browser.rpc('complete_task', {p_user_id:a.id,p_task_id:task.id,p_note:'',p_source:'app'});
  pass('browser cannot call privileged database routine', Boolean(direct.error));

} finally {
  if (photos.length) unwrap(await db.storage.from('proofs').remove(photos));
  for (const id of users) unwrap(await db.auth.admin.deleteUser(id));
}
console.log('Completion checks passed; disposable accounts and photos removed.');
