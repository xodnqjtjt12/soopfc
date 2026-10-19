import { generatePlan, POSITIONS, normalizeProfile, exchangePlayers, changeFormation, placeTeam, quarterShortages } from './formationEngine';
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
test('availability is enforced and unavailable players are distinct from resting players', () => {
  const players = makePlayers(26).map((p, i) => ({ ...p, availableQuarters: i < 4 ? [0, 1] : i < 8 ? [2, 3] : [0, 1, 2, 3] }));
  const plan = generatePlan(players, 'half', seeded());
  plan.quarters.forEach((round, q) => {
    expect(round.bench).toEqual([]);
    expect(round.unavailable).toHaveLength(4);
    const active = [...round.a.slots, ...round.b.slots].map(s => s.playerId);
    active.forEach(id => expect(players.find(p => p.id === id).availableQuarters).toContain(q));
    expect(new Set([...active, ...round.bench, ...round.unavailable]).size).toBe(26);
  });
  expect(Object.values(plan.counts).reduce((a, b) => a + b, 0)).toBe(88);
});
test('insufficient availability reports the affected quarter before generating a plan', () => {
  const players = makePlayers(22); players[0].availableQuarters = [1, 2, 3];
  expect(quarterShortages(players)).toEqual([1, 0, 0, 0]);
  expect(() => generatePlan(players)).toThrow('1Q 1명 부족');
});
test('manual formation change preserves members, rest, other team and all-quarter scope', () => {
  const players = makePlayers(26), plan = { ...generatePlan(players, 'half', seeded()), roster: players };
  const edited = changeFormation(plan, 0, 'a', '4-4-2', true);
  edited.quarters.forEach((round, q) => {
    expect(round.a.formation).toBe('4-4-2');
    expect(round.a.slots.map(s => s.playerId).sort()).toEqual(plan.quarters[q].a.slots.map(s => s.playerId).sort());
    expect(round.b).toEqual(plan.quarters[q].b);
    expect(round.bench).toEqual(plan.quarters[q].bench);
  });
});
test('incompatible locked roles reject a formation change without partial edits', () => {
  const players = makePlayers(22), plan = { ...generatePlan(players, 'half', seeded()), roster: players };
  const teamPlayers = players.filter(p => plan.quarters[1].a.slots.some(s => s.playerId === p.id));
  plan.quarters[1].a = placeTeam(teamPlayers, '4-4-2');
  plan.quarters[1].a.slots.filter(s => s.position === '공격수').forEach(s => { s.locked = true; });
  const before = JSON.stringify(plan);
  expect(() => changeFormation(plan, 0, 'a', '4-3-3', true)).toThrow('2Q');
  expect(JSON.stringify(plan)).toBe(before);
});
test('compatible locked players keep their position and same slot when possible', () => {
  const players = makePlayers(22), plan = { ...generatePlan(players, 'half', seeded()), roster: players };
  const locked = plan.quarters[0].a.slots[3]; locked.locked = true;
  const edited = changeFormation(plan, 0, 'a', '4-4-2');
  expect(edited.quarters[0].a.slots[3]).toEqual(locked);
});
