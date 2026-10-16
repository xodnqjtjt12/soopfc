import { generatePlan, POSITIONS, normalizeProfile, exchangePlayers } from './formationEngine';
const makePlayers = count => Array.from({ length: count }, (_, i) => ({ id: String(i), stats: [i % 5 + 1, (i * 3) % 5 + 1, 3, 4], statScale: 5, preferences: [POSITIONS[i % 5], ''], goalkeeper: i < 4 }));
test('converts legacy ratings once and defaults missing ratings to 2', () => {
  const converted = normalizeProfile({ stats: [1, 5, 8, 10] });
  expect(converted.stats).toEqual([1, 3, 4, 5]);
  expect(normalizeProfile(converted)).toEqual(converted);
  expect(normalizeProfile().stats).toEqual([2, 2, 2, 2]);
  expect(normalizeProfile({ statScale: 5, stats: [1, 2, 4, 5] }).stats).toEqual([1, 2, 4, 5]);
});
const seeded = () => { let value = 42; return () => { value = (value * 16807) % 2147483647; return value / 2147483647; }; };
test.each([22, 23, 26, 35, 50])('four quarters use unique players and distribute participation fairly: %i players', count => {
  const players = makePlayers(count);
  const plan = generatePlan(players, 'half', seeded());
  expect(plan.quarters).toHaveLength(4);
  plan.quarters.forEach(q => {
    expect(q.a.slots).toHaveLength(11);
    expect(q.b.slots).toHaveLength(11);
    const ids = [...q.a.slots, ...q.b.slots].map(s => s.playerId).concat(q.bench);
    expect(new Set(ids).size).toBe(count);
    expect(ids).toHaveLength(count);
    [q.a, q.b].forEach(team => expect(team.slots.filter(s => s.position === '골키퍼')).toHaveLength(1));
  });
  const counts = Object.values(plan.counts);
  expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  expect(counts.reduce((a, b) => a + b, 0)).toBe(88);
});
test('rejects fewer than 22 players', () => expect(() => generatePlan(makePlayers(21))).toThrow());
test('fixed mode preserves teams with 22 participants', () => {
  const plan = generatePlan(makePlayers(22), 'fixed', seeded());
  const first = plan.quarters[0].a.slots.map(s => s.playerId).sort();
  plan.quarters.forEach(q => expect(q.a.slots.map(s => s.playerId).sort()).toEqual(first));
});
test('two available goalkeepers are split between teams', () => {
  const players = makePlayers(22).map((p, i) => ({ ...p, goalkeeper: i < 2 }));
  generatePlan(players, 'quarter', seeded()).quarters.forEach(q => {
    [q.a, q.b].forEach(team => {
      const gk = team.slots.find(s => s.position === '골키퍼');
      expect(players.find(p => p.id === gk.playerId).goalkeeper).toBe(true);
    });
  });
});
test.each(['a', 'b', 'bench'])('manual exchange with %s preserves players, positions and other quarters', team => {
  const plan = generatePlan(makePlayers(26), 'half', seeded());
  const snapshot = JSON.stringify(plan);
  const from = { team: 'a', index: 0 }, to = { team, index: 1 };
  const original = plan.quarters[0];
  const targetId = team === 'bench' ? original.bench[1] : original[team].slots[1].playerId;
  const edited = exchangePlayers(plan, 0, from, to);
  expect(edited.quarters[0].a.slots[0].playerId).toBe(targetId);
  expect(edited.quarters[0].a.slots[0].position).toBe('골키퍼');
  expect(edited.quarters.slice(1)).toEqual(plan.quarters.slice(1));
  const q = edited.quarters[0];
  expect(new Set([...q.a.slots, ...q.b.slots].map(s => s.playerId).concat(q.bench)).size).toBe(26);
  Object.entries(edited.counts).forEach(([id, count]) => expect(count).toBe(edited.quarters.filter(round => [...round.a.slots, ...round.b.slots].some(s => s.playerId === id)).length));
  expect(JSON.stringify(plan)).toBe(snapshot);
});
test('locked players cannot be exchanged as source or destination', () => {
  const plan = generatePlan(makePlayers(26), 'half', seeded());
  plan.quarters[0].a.slots[0].locked = true;
  const locked = { team: 'a', index: 0 }, other = { team: 'b', index: 0 };
  expect(() => exchangePlayers(plan, 0, locked, other)).toThrow('고정');
  expect(() => exchangePlayers(plan, 0, other, locked)).toThrow('고정');
});
