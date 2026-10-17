import { SHAPES, canPlayQuarter, fit } from './formationEngine';

const slotsOf = q => [...q.a.slots, ...q.b.slots];
export const isQuarterComplete = q => slotsOf(q).every(s => s.playerId);
export const isPlanComplete = plan => Boolean(plan && plan.quarters.every(isQuarterComplete));
export function refreshPlan(plan) {
  plan.quarters.forEach((q, index) => {
    const assigned = new Set(slotsOf(q).map(s => s.playerId).filter(Boolean));
    q.bench = plan.roster.filter(p => canPlayQuarter(p, index) && !assigned.has(p.id)).map(p => p.id);
    q.unavailable = plan.roster.filter(p => !canPlayQuarter(p, index)).map(p => p.id);
  });
  plan.counts = Object.fromEntries(plan.roster.map(p => [p.id, plan.quarters.filter(q => slotsOf(q).some(s => s.playerId === p.id)).length]));
  return plan;
}
export function createManualPlan(roster) {
  const team = () => ({ formation: '4-3-3', slots: SHAPES['4-3-3'].map(position => ({ position, playerId: null, locked: false })) });
  return refreshPlan({ roster, mode: 'manual', quarters: [0, 1, 2, 3].map(() => ({ a: team(), b: team(), bench: [], unavailable: [] })) });
}
export function assignManualPlayer(plan, quarter, team, index, playerId) {
  const copy = JSON.parse(JSON.stringify(plan));
  const round = copy.quarters[quarter], slot = round[team]?.slots[index];
  if (!slot) throw new Error('배치할 자리를 확인해 주세요.');
  if (slot.locked) throw new Error('고정된 선수를 먼저 해제해 주세요.');
  if (playerId !== null) {
    const player = copy.roster.find(p => p.id === playerId);
    if (!player || !canPlayQuarter(player, quarter)) throw new Error('이 쿼터에 출전할 수 없는 선수예요.');
    if (slotsOf(round).some(s => s.playerId === playerId && s !== slot)) throw new Error('이미 이 쿼터에 배치된 선수예요.');
  }
  slot.playerId = playerId; slot.locked = false;
  return refreshPlan(copy);
}
export function fillManualQuarters(plan, indices) {
  const copy = JSON.parse(JSON.stringify(plan));
  indices.forEach(qi => {
    const q = copy.quarters[qi];
    if (isQuarterComplete(q)) return;
    if (copy.roster.filter(p => canPlayQuarter(p, qi)).length < 22) throw new Error(`${qi + 1}Q 출전 가능 인원이 22명 미만이에요.`);
    const used = new Set(slotsOf(q).map(s => s.playerId).filter(Boolean));
    const pool = copy.roster.filter(p => canPlayQuarter(p, qi) && !used.has(p.id));
    const empty = ['a', 'b'].flatMap(team => q[team].slots.map(slot => ({ team, slot })).filter(x => !x.slot.playerId));
    empty.sort((a, b) => Number(b.slot.position === '골키퍼') - Number(a.slot.position === '골키퍼'));
    empty.forEach(({ team, slot }) => {
      const other = team === 'a' ? 'b' : 'a';
      const totals = t => q[t].slots.reduce((sum, s) => {
        const p = copy.roster.find(p => p.id === s.playerId);
        return sum.map((v, i) => v + (p?.stats[i] || 0));
      }, [0, 0, 0, 0]);
      const own = totals(team), opposing = totals(other);
      const score = p => fit(p, slot.position) - (copy.counts[p.id] || 0) * 3
        - p.stats.reduce((sum, v, i) => sum + Math.max(0, own[i] + v - opposing[i]), 0) * .15;
      pool.sort((a, b) => score(b) - score(a));
      slot.playerId = pool.shift().id;
    });
    // Improve balance by swapping only auto-filled slots; direct placements stay intact.
    const cost = () => {
      const sum = team => q[team].slots.reduce((values, slot) => values.map((v, i) => v + copy.roster.find(p => p.id === slot.playerId).stats[i]), [0, 0, 0, 0]);
      const a = sum('a'), b = sum('b');
      return a.reduce((total, v, i) => total + (v - b[i]) ** 2, 0)
        - slotsOf(q).reduce((total, slot) => total + fit(copy.roster.find(p => p.id === slot.playerId), slot.position) * 2, 0);
    };
    for (let pass = 0; pass < 20; pass++) {
      let best = cost(), pair = null;
      for (let i = 0; i < empty.length; i++) for (let j = i + 1; j < empty.length; j++) {
        const a = empty[i].slot, b = empty[j].slot;
        [a.playerId, b.playerId] = [b.playerId, a.playerId];
        const candidate = cost();
        if (candidate < best - .001) { best = candidate; pair = [i, j]; }
        [a.playerId, b.playerId] = [b.playerId, a.playerId];
      }
      if (!pair) break;
      const a = empty[pair[0]].slot, b = empty[pair[1]].slot;
      [a.playerId, b.playerId] = [b.playerId, a.playerId];
    }
    refreshPlan(copy);
  });
  return refreshPlan(copy);
}
export function copyQuarter(plan, source, targets) {
  const copy = JSON.parse(JSON.stringify(plan));
  [...new Set(targets)].filter(q => q !== source).forEach(q => {
    if (![0, 1, 2, 3].includes(q)) throw new Error('복사할 쿼터를 확인해 주세요.');
    copy.quarters[q] = JSON.parse(JSON.stringify(plan.quarters[source]));
    slotsOf(copy.quarters[q]).forEach(slot => {
      const player = copy.roster.find(p => p.id === slot.playerId);
      if (!player || !canPlayQuarter(player, q)) { slot.playerId = null; slot.locked = false; }
    });
  });
  return refreshPlan(copy);
}
export function changePartialFormation(plan, quarter, team, requested, allQuarters) {
  const copy = JSON.parse(JSON.stringify(plan));
  (allQuarters ? [0, 1, 2, 3] : [quarter]).forEach(q => {
    const previous = copy.quarters[q][team];
    const shape = requested === 'auto' ? previous.formation : requested;
    if (!SHAPES[shape]) throw new Error('포메이션을 확인해 주세요.');
    const slots = SHAPES[shape].map(position => ({ position, playerId: null, locked: false }));
    const assigned = previous.slots.filter(s => s.playerId).sort((a, b) => Number(b.locked) - Number(a.locked));
    const pending = [];
    assigned.forEach(s => {
      const index = slots.findIndex(target => !target.playerId && target.position === s.position);
      if (index < 0) {
        if (s.locked) throw new Error(`${q + 1}Q 고정한 포지션이 새 포메이션에 부족해요.`);
        pending.push(s); return;
      }
      slots[index] = { ...s };
    });
    pending.forEach(s => { slots.find(target => !target.playerId).playerId = s.playerId; });
    copy.quarters[q][team] = { formation: shape, slots };
  });
  return refreshPlan(copy);
}
