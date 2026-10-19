const { validateInput, validateOutput } = require('./aiFormationContract');
// Memory only: no credentials or AI requests are persisted in browser storage.
const cache = new Map();
export async function generateAIPlan(roster, mode, accessCode) {
  const input = validateInput({ mode, players: roster.map((p, i) => ({ id: `p${i}`, stats: p.stats, preferences: p.preferences.filter(Boolean), goalkeeper: !!p.goalkeeper, availableQuarters: p.availableQuarters || [0, 1, 2, 3] })) });
  if (!accessCode.trim()) throw new Error('AI 이용 코드를 입력해 주세요.');
  const key = JSON.stringify(input);
  let raw = cache.get(key);
  if (!raw) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch('/.netlify/functions/ai-formation', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessCode.trim()}` }, body: key, signal: controller.signal });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || (response.status === 429 ? 'AI 호출 한도에 도달했어요. 기본 편성을 이용해 주세요.' : 'AI 서버를 사용할 수 없어요. Netlify 연결 설정을 확인해 주세요.'));
      raw = data?.result;
      validateOutput(raw, input);
      if (cache.size >= 5) cache.clear();
      cache.set(key, raw);
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('AI 응답 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.');
      throw error;
    } finally { clearTimeout(timer); }
  }
  const result = validateOutput(raw, input);
  const realId = id => roster[Number(id.slice(1))].id;
  result.quarters.forEach(q => {
    q.reason = q.reason.replace(/\bp(\d{1,2})\b/g, (id, index) => roster[Number(index)]?.name || id);
    ['a', 'b'].forEach(team => q[team].slots.forEach(s => { s.playerId = realId(s.playerId); }));
    q.bench = q.bench.map(realId); q.unavailable = q.unavailable.map(realId);
  });
  result.counts = Object.fromEntries(Object.entries(result.counts).map(([id, count]) => [realId(id), count]));
  return { ...result, roster };
}
