// Pure checks; no network, accounts or AI spend.
// node scripts/check-plan-shape.mjs (Node 24+)
import assert from 'node:assert/strict';
import { checkPlan, stages } from '../lib/ai/plan-shape.ts';
import { todayInZone, addDays } from '../lib/dates.ts';

const plan = {
  milestones: stages.map((stage) => ({ title: `Build ${stage}` })),
  tasks: Array.from({ length: 14 }, () => ({
    milestone: 1, title: 'Draw five shapes', how_to: 'Draw five shapes, two minutes each.',
    count: 5, minutes_per_item: 2, minutes: 10, why: 'Practice a simple outline in a short sitting.',
  })),
  if_then_plans: [{ if: 'I reach for Instagram', then: 'I put the phone away and draw one shape' }],
};
assert.equal(checkPlan(plan).tasks.length, 14);
for (const [label, mutate] of [
  ['a 40-minute task', (p) => { Object.assign(p.tasks[0], { count: 5, minutes_per_item: 8, minutes: 40 }); }],
  ['a ten-minute label for thirty minutes of work', (p) => { Object.assign(p.tasks[0], { count: 5, minutes_per_item: 6, minutes: 10 }); }],
  ['four milestones', (p) => { p.milestones.pop(); }],
  ['thirteen tasks', (p) => { p.tasks.pop(); }],
  ['a blank why', (p) => { p.tasks[0].why = ' '; }],
  ['no if–then plan', (p) => { p.if_then_plans = []; }],
  ['an unknown milestone', (p) => { p.tasks[0].milestone = 6; }],
  ['tasks out of roadmap order', (p) => { p.tasks[1].milestone = 2; }],
]) {
  const bad = structuredClone(plan);
  mutate(bad);
  assert.throws(() => checkPlan(bad));
  console.log(`PASS  rejects ${label}`);
}
assert.equal(todayInZone('Pacific/Kiritimati', new Date('2026-10-18T23:30:00Z')), '2026-10-19');
assert.equal(todayInZone('America/Los_Angeles', new Date('2026-10-18T00:30:00Z')), '2026-10-17');
assert.equal(addDays('2026-10-24', 1), '2026-10-25');
assert.equal(addDays('2026-10-25', 1), '2026-10-26');
assert.equal(addDays('2026-12-31', 1), '2027-01-01');
assert.equal(addDays('2028-02-28', 1), '2028-02-29');
console.log('PASS  calendar dates handle time zones, daylight saving, new years and leap days');
