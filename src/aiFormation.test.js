import { generateAIPlan } from './aiFormation';
const { validateInput, validateOutput } = require('./aiFormationContract');
const roster = Array.from({ length: 22 }, (_, i) => ({ id: `real-${i}`, name: `비공개이름${i}`, stats: [2, 3, 4, 5], preferences: ['센터백', ''], goalkeeper: i < 2, availableQuarters: [0, 1, 2, 3] }));
const input = { mode: 'half', players: roster.map((p, i) => ({ ...p, id: `p${i}`, preferences: ['센터백'] })) };
const result = () => ({ quarters: Array.from({ length: 4 }, () => ({ a: { formation: '4-3-3', players: input.players.slice(0, 11).map(p => p.id) }, b: { formation: '4-4-2', players: input.players.slice(11).map(p => p.id) }, reason: '항목별 능력치 균형을 고려했어요.' })) });
test('request whitelist strips personal details and rejects invalid constraints', () => {
  expect(JSON.stringify(validateInput(input))).not.toContain('비공개');
  expect(() => validateInput({ ...input, players: [...input.players, input.players[0]] })).toThrow();
  expect(() => validateInput({ ...input, players: input.players.map((p, i) => i ? p : { ...p, availableQuarters: [] }) })).toThrow();
});
test('validates duplicates, unknown IDs, unavailable players and shapes', () => {
  expect(validateOutput(result(), input).counts.p0).toBe(4);
  for (const invalid of ['p0', 'unknown']) {
    const output = result(); output.quarters[0].b.players[0] = invalid;
    expect(() => validateOutput(output, input)).toThrow();
  }
  const output = result(); output.quarters[0].a.formation = '__proto__';
  expect(() => validateOutput(output, input)).toThrow();
  expect(() => validateOutput(result(), { ...input, players: input.players.map((p, i) => i ? p : { ...p, availableQuarters: [1, 2, 3] }) })).toThrow();
});
test('AI transport hides names and real IDs, maps results and reuses identical requests', async () => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ result: result() }) }));
  const plan = await generateAIPlan(roster, 'half', 'test-access-code');
  const body = fetch.mock.calls[0][1].body;
  expect(body).not.toContain('비공개'); expect(body).not.toContain('real-');
  expect(plan.quarters[0].a.slots[0].playerId).toBe('real-0');
  expect(plan.source).toBe('gemini');
  await generateAIPlan(roster, 'half', 'test-access-code');
  expect(fetch).toHaveBeenCalledTimes(1);
});
test('quota errors leave fallback to user without extra requests', async () => {
  global.fetch = jest.fn(async () => ({ ok: false, status: 429, json: async () => null }));
  await expect(generateAIPlan(roster, 'fixed', 'test-access-code')).rejects.toThrow('한도');
  expect(fetch).toHaveBeenCalledTimes(1);
});
