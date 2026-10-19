export const POSITIONS = ['공격수', '중앙미드필더', '윙', '윙백', '센터백', '골키퍼'];
export const STATS = ['공격', '수비', '지능', '피지컬'];
export const canPlayQuarter = (player, quarter) => !Array.isArray(player.availableQuarters) || player.availableQuarters.includes(quarter);
export function quarterShortages(players) {
  return [0, 1, 2, 3].map(q => Math.max(0, 22 - players.filter(p => canPlayQuarter(p, q)).length));
}
export function exchangePlayers(plan, quarterIndex, from, to) {
  const original = plan.quarters[quarterIndex];
  const valid = loc => loc && ['a', 'b', 'bench'].includes(loc.team) && Number.isInteger(loc.index)
    && loc.index >= 0 && loc.index < (loc.team === 'bench' ? original.bench.length : original[loc.team].slots.length);
  if (!valid(from) || !valid(to)) throw new Error('교환할 선수를 확인해 주세요.');
  if (from.team === to.team && from.index === to.index) return plan;
  const locked = loc => loc.team !== 'bench' && original[loc.team].slots[loc.index].locked;
  if (locked(from) || locked(to)) throw new Error('고정된 선수를 먼저 해제해 주세요.');
  const copy = JSON.parse(JSON.stringify(plan));
  const q = copy.quarters[quarterIndex];
  const get = loc => loc.team === 'bench' ? q.bench[loc.index] : q[loc.team].slots[loc.index].playerId;
  const put = (loc, id) => { if (loc.team === 'bench') q.bench[loc.index] = id; else q[loc.team].slots[loc.index].playerId = id; };
  const a = get(from), b = get(to); put(from, b); put(to, a);
  const ids = Object.keys(plan.counts || Object.fromEntries([...q.a.slots, ...q.b.slots].map(s => [s.playerId, 0])));
  copy.counts = Object.fromEntries(ids.map(id => [id, copy.quarters.filter(round => [...round.a.slots, ...round.b.slots].some(s => s.playerId === id)).length]));
  return copy;
}
export function normalizeProfile(profile = {}) {
  const legacy = profile.statScale !== 5;
  return {
    ...profile,
    stats: Array.from({ length: 4 }, (_, i) => {
      const value = Number(profile.stats?.[i]);
      return Number.isFinite(value) && value >= 1
        ? Math.max(1, Math.min(5, Math.round(legacy ? value / 2 : value))) : 2;
    }),
    statScale: 5,
  };
}
export const SHAPES = {
  '4-3-3': ['골키퍼', '윙백', '센터백', '센터백', '윙백', '중앙미드필더', '중앙미드필더', '중앙미드필더', '윙', '공격수', '윙'],
  '4-4-2': ['골키퍼', '윙백', '센터백', '센터백', '윙백', '윙', '중앙미드필더', '중앙미드필더', '윙', '공격수', '공격수'],
  '4-2-3-1': ['골키퍼', '윙백', '센터백', '센터백', '윙백', '중앙미드필더', '중앙미드필더', '윙', '중앙미드필더', '윙', '공격수'],
};
const weights = { 공격수: [4, 0, 1, 2], 윙: [3, 1, 2, 3], 중앙미드필더: [2, 2, 4, 1], 윙백: [1, 3, 2, 3], 센터백: [0, 4, 2, 3], 골키퍼: [0, 4, 3, 2] };
export function fit(player, position) {
  return player.stats.reduce((s, v, i) => s + v * weights[position][i], 0) / 9
    + (player.preferences[0] === position ? 4 : player.preferences[1] === position ? 2 : 0)
    + (position === '골키퍼' ? (player.goalkeeper ? 30 : -50) : 0);
}
export function placeTeam(players, requested = 'auto', previousSlots = []) {
  let best;
  Object.entries(SHAPES).filter(([name]) => requested === 'auto' || name === requested).forEach(([formation, positions]) => {
    const remaining = [...players];
    const slots = positions.map(position => ({ position, playerId: null, locked: false }));
    for (const [oldIndex, locked] of previousSlots.entries()) {
      if (!locked.locked) continue;
      const index = slots[oldIndex]?.position === locked.position && !slots[oldIndex].playerId ? oldIndex : slots.findIndex(s => !s.playerId && s.position === locked.position);
      const playerIndex = remaining.findIndex(p => p.id === locked.playerId);
      if (index < 0 || playerIndex < 0) return;
      slots[index] = { ...slots[index], playerId: locked.playerId, locked: true };
      remaining.splice(playerIndex, 1);
    }
    slots.forEach(slot => {
      if (slot.playerId) return;
      const position = slot.position;
      remaining.sort((a, b) => fit(b, position) - fit(a, position));
      slot.playerId = remaining.shift().id;
    });
    const score = slots.reduce((s, slot) => s + fit(players.find(p => p.id === slot.playerId), slot.position), 0);
    if (!best || score > best.score) best = { formation, slots, score };
  });
  if (!best) throw new Error('고정한 선수의 포지션이 새 포메이션에 부족해요. 고정을 해제한 뒤 다시 선택해 주세요.');
  return { formation: best.formation, slots: best.slots };
}
export function changeFormation(plan, quarterIndex, team, formation, allQuarters = false) {
  const copy = JSON.parse(JSON.stringify(plan));
  const indices = allQuarters ? [0, 1, 2, 3] : [quarterIndex];
  indices.forEach(q => {
    const previous = copy.quarters[q][team];
    try {
      copy.quarters[q][team] = placeTeam(copy.roster.filter(p => previous.slots.some(s => s.playerId === p.id)), formation, previous.slots);
    } catch (e) { throw new Error(`${q + 1}Q: ${e.message}`); }
  });
  return copy;
}
export function totals(slots, players) {
  return slots.reduce((sum, slot) => sum.map((v, i) => v + (players.find(p => p.id === slot.playerId)?.stats[i] || 0)), [0, 0, 0, 0]);
}
function splitScore(a, b) {
  const sums = team => team.reduce((s, p) => s.map((v, i) => v + p.stats[i]), [0, 0, 0, 0]);
  const x = sums(a), y = sums(b);
  return x.reduce((s, v, i) => s + (v - y[i]) ** 2, 0)
    + (!a.some(p => p.goalkeeper) ? 5000 : 0) + (!b.some(p => p.goalkeeper) ? 5000 : 0);
}
export function generatePlan(players, mode = 'half', random = Math.random) {
  if (players.length < 22) throw new Error('11대11 편성에는 최소 22명이 필요해요.');
  const shortages = quarterShortages(players);
  if (shortages.some(Boolean)) throw new Error(shortages.map((count, q) => count ? `${q + 1}Q ${count}명 부족` : '').filter(Boolean).join(' · '));
  const counts = Object.fromEntries(players.map(p => [p.id, 0]));
  const quarters = [];
  let memberships = {};
  for (let q = 0; q < 4; q++) {
    const eligible = players.filter(p => canPlayQuarter(p, q));
    const remainingChances = p => [0, 1, 2, 3].filter(index => index >= q && canPlayQuarter(p, index)).length;
    const ranked = eligible.map(p => ({ p, tie: random() })).sort((a, b) => counts[a.p.id] - counts[b.p.id] || remainingChances(a.p) - remainingChances(b.p) || a.tie - b.tie);
    const active = ranked.slice(0, 22).map(x => x.p);
    // Preserve two available goalkeepers when doing so does not break equal participation.
    eligible.filter(p => p.goalkeeper && !active.includes(p)).forEach(gk => {
      if (active.filter(p => p.goalkeeper).length >= 2) return;
      const replacement = [...active].reverse().find(p => !p.goalkeeper && counts[p.id] === counts[gk.id]);
      if (replacement) active[active.indexOf(replacement)] = gk;
    });
    const remix = q === 0 || mode === 'quarter' || (mode === 'half' && q === 2);
    let a = [], b = [];
    if (!remix) {
      a = active.filter(p => memberships[p.id] === 'a');
      b = active.filter(p => memberships[p.id] === 'b');
      active.filter(p => !memberships[p.id]).forEach(p => (a.length <= b.length ? a : b).push(p));
      while (a.length > 11) b.push(a.pop());
      while (b.length > 11) a.push(b.pop());
    } else {
      let best = Infinity;
      for (let attempt = 0; attempt < 200; attempt++) {
        const shuffled = active.map(p => ({ p, tie: random() })).sort((x, y) => x.tie - y.tie).map(x => x.p);
        const left = shuffled.slice(0, 11), right = shuffled.slice(11);
        const score = splitScore(left, right);
        if (score < best) { best = score; a = left; b = right; }
      }
    }
    a.forEach(p => { memberships[p.id] = 'a'; });
    b.forEach(p => { memberships[p.id] = 'b'; });
    active.forEach(p => { counts[p.id]++; });
    quarters.push({ a: placeTeam(a), b: placeTeam(b), bench: eligible.filter(p => !active.includes(p)).map(p => p.id), unavailable: players.filter(p => !canPlayQuarter(p, q)).map(p => p.id) });
  }
  return { quarters, mode, counts };
}
