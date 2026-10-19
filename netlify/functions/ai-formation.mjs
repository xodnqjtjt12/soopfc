import { createHash, timingSafeEqual } from 'node:crypto';
import contract from '../../src/aiFormationContract.js';
const { validateInput, validateOutput, shapes } = contract;
const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const digest = value => createHash('sha256').update(value).digest();
export default async function handler(request) {
  if (request.method !== 'POST') return reply(405, { error: 'POST 요청만 지원해요.' });
  // Fail closed: the operator must explicitly confirm an unbilled Gemini project.
  if (process.env.AI_FREE_TIER_CONFIRMED !== 'true' || !process.env.GEMINI_API_KEY || !process.env.AI_ACCESS_CODE || process.env.AI_ACCESS_CODE.length < 20) return reply(503, { error: '무료 AI 연결 설정이 아직 완료되지 않았어요. 기본 편성을 이용해 주세요.' });
  if (!timingSafeEqual(digest(request.headers.get('authorization') || ''), digest(`Bearer ${process.env.AI_ACCESS_CODE}`))) return reply(401, { error: 'AI 이용 코드가 올바르지 않아요.' });
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return reply(403, { error: '이 사이트에서 요청해 주세요.' });
  let input;
  try {
    const text = await request.text();
    if (text.length > 40000) return reply(413, { error: '요청이 너무 커요.' });
    input = validateInput(JSON.parse(text));
  } catch { return reply(400, { error: '참석자와 출전 설정을 확인해 주세요.' }); }
  const team = { type: 'OBJECT', properties: { formation: { type: 'STRING', enum: Object.keys(shapes) }, players: { type: 'ARRAY', items: { type: 'STRING' }, minItems: 11, maxItems: 11 } }, required: ['formation', 'players'] };
  const schema = { type: 'OBJECT', properties: { quarters: { type: 'ARRAY', minItems: 4, maxItems: 4, items: { type: 'OBJECT', properties: { a: team, b: team, reason: { type: 'STRING' } }, required: ['a', 'b', 'reason'] } } }, required: ['quarters'] };
  const prompt = `You are a football coach. Build four quarters of 11v11. Each player appears at most once per quarter and only in availableQuarters (zero based). Choose team membership, formation, positions and resting players yourself. Balance attack/defense/intelligence/physical separately; prioritize equal appearances and preferred roles. When everyone is available all four quarters, appearance counts must differ by at most one. Use eligible goalkeepers in goal when possible. mode fixed: preserve teams where possible; half: remix after quarter 2; quarter: remix each quarter. players arrays MUST follow the exact position order for their formation: ${JSON.stringify(shapes)}. For each quarter give a concise Korean reason explaining team balance, formation and rest. Only reference anonymous player IDs; do not invent names or data. Input: ${JSON.stringify(input)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    // Fixed model; never switch providers/models or retry automatically.
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', responseSchema: schema, maxOutputTokens: 6500, temperature: 0.3 } }), signal: controller.signal });
    if (!response.ok) return reply(response.status === 429 ? 429 : 502, { error: response.status === 429 ? 'Gemini 무료 호출 한도에 도달했어요. 기본 편성을 이용해 주세요.' : 'AI 응답을 받지 못했어요. 기본 편성을 이용하거나 잠시 후 다시 시도해 주세요.' });
    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason !== 'STOP') return reply(502, { error: 'AI가 편성을 완성하지 못했어요. 다시 시도하거나 기본 편성을 이용해 주세요.' });
    const result = JSON.parse(candidate.content.parts.filter(p => !p.thought).map(p => p.text || '').join(''));
    validateOutput(result, input);
    return reply(200, { result });
  } catch {
    return reply(502, { error: 'AI 결과를 검증하지 못했거나 응답 시간이 초과됐어요. 기본 편성을 이용해 주세요.' });
  } finally { clearTimeout(timer); }
}
// Platform-enforced, shared across instances. Counts all requests, including failures.
export const config = { rateLimit: { action: 'rate_limit', aggregateBy: ['domain'], windowSize: 60, windowLimit: 3 } };
