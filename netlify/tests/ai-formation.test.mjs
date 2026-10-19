import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../functions/ai-formation.mjs';
const originalFetch = globalThis.fetch;
const code = 'test-only-code-at-least-20-characters';
const input = { mode: 'half', players: Array.from({ length: 22 }, (_, i) => ({ id: `p${i}`, stats: [2, 2, 2, 2], preferences: [], goalkeeper: i < 2, availableQuarters: [0, 1, 2, 3] })) };
const output = { quarters: Array.from({ length: 4 }, () => ({ a: { formation: '4-3-3', players: input.players.slice(0, 11).map(p => p.id) }, b: { formation: '4-3-3', players: input.players.slice(11).map(p => p.id) }, reason: '균형을 고려했어요.' })) };
const setup = () => { process.env.GEMINI_API_KEY = 'test-key'; process.env.AI_ACCESS_CODE = code; process.env.AI_FREE_TIER_CONFIRMED = 'true'; };
const request = (body = input, token = code) => new Request('https://example.netlify.app/.netlify/functions/ai-formation', { method: 'POST', headers: { Authorization: `Bearer ${token}`, Origin: 'https://example.netlify.app' }, body: JSON.stringify(body) });
afterEach(() => { globalThis.fetch = originalFetch; delete process.env.GEMINI_API_KEY; delete process.env.AI_ACCESS_CODE; delete process.env.AI_FREE_TIER_CONFIRMED; });
test('fails closed without operator configuration and blocks unauthorized requests', async () => {
  assert.equal((await handler(request())).status, 503);
  setup(); assert.equal((await handler(request(input, 'wrong'))).status, 401);
});
test('rejects invalid input before calling Gemini', async () => {
  setup(); globalThis.fetch = () => { throw new Error('must not call'); };
  assert.equal((await handler(request({ ...input, players: [] }))).status, 400);
});
test('calls fixed model once and returns validated four-quarter result', async () => {
  setup(); let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++; assert.match(url, /gemini-2.5-flash-lite:generateContent$/);
    assert.equal(options.headers['x-goog-api-key'], 'test-key');
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(output) }] } }] });
  };
  const response = await handler(request()); assert.equal(response.status, 200);
  assert.equal((await response.json()).result.quarters.length, 4); assert.equal(calls, 1);
});
test('quota response never retries or falls through to another model', async () => {
  setup(); let calls = 0; globalThis.fetch = async () => { calls++; return new Response('', { status: 429 }); };
  assert.equal((await handler(request())).status, 429); assert.equal(calls, 1);
});
test('invalid model output is never returned as a usable plan', async () => {
  setup(); const bad = structuredClone(output); bad.quarters[0].b.players[0] = 'p0';
  globalThis.fetch = async () => Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(bad) }] } }] });
  assert.equal((await handler(request())).status, 502);
});
