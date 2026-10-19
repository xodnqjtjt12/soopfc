// Shared by the browser and the server. Only anonymous IDs cross the AI boundary.
const shapes = {
  '4-3-3': ['골키퍼', '윙백', '센터백', '센터백', '윙백', '중앙미드필더', '중앙미드필더', '중앙미드필더', '윙', '공격수', '윙'],
  '4-4-2': ['골키퍼', '윙백', '센터백', '센터백', '윙백', '윙', '중앙미드필더', '중앙미드필더', '윙', '공격수', '공격수'],
  '4-2-3-1': ['골키퍼', '윙백', '센터백', '센터백', '윙백', '중앙미드필더', '중앙미드필더', '윙', '중앙미드필더', '윙', '공격수'],
};
const positions = [...new Set(Object.values(shapes).flat())];
function validateInput(input) {
  if (!input || !['half', 'quarter', 'fixed'].includes(input.mode) || !Array.isArray(input.players) || input.players.length < 22 || input.players.length > 60) throw new Error('참석자는 22~60명으로 설정해 주세요.');
  const ids = new Set();
  input.players.forEach(p => {
    if (!p || !/^p\d{1,2}$/.test(p.id) || ids.has(p.id) || !Array.isArray(p.stats) || p.stats.length !== 4 || p.stats.some(n => !Number.isInteger(n) || n < 1 || n > 5)
      || !Array.isArray(p.preferences) || p.preferences.length > 2 || p.preferences.some(v => !positions.includes(v)) || typeof p.goalkeeper !== 'boolean'
      || !Array.isArray(p.availableQuarters) || new Set(p.availableQuarters).size !== p.availableQuarters.length || p.availableQuarters.some(q => !Number.isInteger(q) || q < 0 || q > 3)) throw new Error('선수 설정을 확인해 주세요.');
    ids.add(p.id);
  });
  if ([0, 1, 2, 3].some(q => input.players.filter(p => p.availableQuarters.includes(q)).length < 22)) throw new Error('각 쿼터에 출전 가능한 선수가 22명 이상 필요해요.');
  return { mode: input.mode, players: input.players.map(({ id, stats, preferences, goalkeeper, availableQuarters }) => ({ id, stats, preferences, goalkeeper, availableQuarters })) };
}
function validateOutput(output, input) {
  if (!output || !Array.isArray(output.quarters) || output.quarters.length !== 4) throw new Error('AI가 4쿼터를 완성하지 못했어요.');
  const counts = Object.fromEntries(input.players.map(p => [p.id, 0]));
  const quarters = output.quarters.map((q, index) => {
    const used = new Set();
    const teams = Object.fromEntries(['a', 'b'].map(team => {
      const value = q?.[team];
      if (!value || !Object.hasOwn(shapes, value.formation) || !Array.isArray(value.players) || value.players.length !== 11) throw new Error('AI 포메이션 형식이 올바르지 않아요.');
      const slots = value.players.map((id, i) => {
        const player = input.players.find(p => p.id === id);
        if (!player || used.has(id) || !player.availableQuarters.includes(index)) throw new Error('AI 결과에 중복 또는 출전 불가 선수가 있어요.');
        used.add(id); counts[id]++;
        return { position: shapes[value.formation][i], playerId: id, locked: false };
      });
      return [team, { formation: value.formation, slots }];
    }));
    if (typeof q.reason !== 'string' || !q.reason.trim() || q.reason.length > 800) throw new Error('AI 편성 이유를 확인하지 못했어요.');
    return { ...teams, reason: q.reason.trim(), bench: input.players.filter(p => p.availableQuarters.includes(index) && !used.has(p.id)).map(p => p.id), unavailable: input.players.filter(p => !p.availableQuarters.includes(index)).map(p => p.id) };
  });
  // With identical availability, equal appearances are a hard requirement.
  if (input.players.every(p => p.availableQuarters.length === 4) && Math.max(...Object.values(counts)) - Math.min(...Object.values(counts)) > 1) throw new Error('AI 결과의 출전 횟수가 고르지 않아요.');
  return { quarters, counts, mode: input.mode, source: 'gemini' };
}
module.exports = { shapes, validateInput, validateOutput };
