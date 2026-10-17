import { createManualPlan, assignManualPlayer, fillManualQuarters, copyQuarter, isPlanComplete, changePartialFormation, refreshPlan } from './manualFormation';
import { exchangePlayers } from './formationEngine';
const players = () => Array.from({ length: 26 }, (_, i) => ({ id: i < 24 ? String(i) : `guest:${i}`, name: `선수${i}`, isGuest: i >= 24, stats: [2, 3, 2, 3], preferences: ['', ''], goalkeeper: i < 2, availableQuarters: [0, 1, 2, 3] }));
test('manual draft starts empty and supports guests without duplicate assignments', () => {
  const plan = createManualPlan(players());
  expect(plan.quarters[0].bench).toHaveLength(26);
  expect(isPlanComplete(plan)).toBe(false);
  const edited = assignManualPlayer(plan, 0, 'a', 9, 'guest:24');
  expect(edited.quarters[0].a.slots[9].playerId).toBe('guest:24');
  expect(edited.quarters[0].bench).not.toContain('guest:24');
  expect(() => assignManualPlayer(edited, 0, 'b', 9, 'guest:24')).toThrow('이미');
  expect(assignManualPlayer(edited, 0, 'a', 9, null).quarters[0].bench).toContain('guest:24');
  expect(plan.quarters[0].a.slots[9].playerId).toBeNull();
});
test('auto completion retains all direct assignments and partitions every player', () => {
  let plan = assignManualPlayer(createManualPlan(players()), 0, 'b', 9, 'guest:25');
  plan = fillManualQuarters(plan, [0, 1, 2, 3]);
  expect(isPlanComplete(plan)).toBe(true);
  expect(plan.quarters[0].b.slots[9].playerId).toBe('guest:25');
  plan.quarters.forEach(q => expect(new Set([...q.a.slots, ...q.b.slots].map(s => s.playerId).concat(q.bench, q.unavailable)).size).toBe(26));
});
test('copy clears unavailable players and leaves the source unchanged', () => {
  const roster = players(); roster[24].availableQuarters = [0, 1];
  const plan = assignManualPlayer(createManualPlan(roster), 0, 'a', 9, 'guest:24');
  const copy = copyQuarter(plan, 0, [1, 2]);
  expect(copy.quarters[1].a.slots[9].playerId).toBe('guest:24');
  expect(copy.quarters[2].a.slots[9].playerId).toBeNull();
  expect(copy.quarters[2].unavailable).toContain('guest:24');
  expect(copy.quarters[0]).toEqual(plan.quarters[0]);
  expect(() => assignManualPlayer(copy, 2, 'b', 0, 'guest:24')).toThrow('출전');
});
test('drag to an empty slot updates the waiting list and counts', () => {
  const plan = createManualPlan(players());
  const edited = refreshPlan(exchangePlayers(plan, 0, { team: 'bench', index: 0 }, { team: 'a', index: 0 }));
  expect(edited.quarters[0].a.slots[0].playerId).toBe('0');
  expect(edited.quarters[0].bench).toHaveLength(25);
  expect(edited.counts['0']).toBe(1);
});
test('incomplete formation switches retain placed players and reject incompatible locks', () => {
  let plan = assignManualPlayer(createManualPlan(players()), 0, 'a', 9, 'guest:24');
  plan = changePartialFormation(plan, 0, 'a', '4-4-2', false);
  expect(plan.quarters[0].a.slots.filter(s => s.playerId)).toHaveLength(1);
  expect(plan.quarters[0].a.slots.find(s => s.playerId === 'guest:24').position).toBe('공격수');
  plan = assignManualPlayer(plan, 0, 'a', 10, 'guest:25');
  plan.quarters[0].a.slots[9].locked = true; plan.quarters[0].a.slots[10].locked = true;
  expect(() => changePartialFormation(plan, 0, 'a', '4-3-3', false)).toThrow('고정');
});
test('auto completion rejects shortages without changing the draft', () => {
  const plan = createManualPlan(players().slice(0, 21));
  expect(() => fillManualQuarters(plan, [0, 1])).toThrow('22명');
  expect(plan.quarters[0].a.slots.every(s => s.playerId === null)).toBe(true);
});
