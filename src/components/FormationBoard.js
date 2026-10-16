import React, { useRef, useState } from 'react';
import './FormationBoard.css';

export const PITCH_LAYOUTS = {
  '4-3-3': [[50,88],[14,68],[38,72],[62,72],[86,68],[25,47],[50,53],[75,47],[18,24],[50,17],[82,24]],
  '4-4-2': [[50,88],[14,69],[38,72],[62,72],[86,69],[14,43],[38,48],[62,48],[86,43],[35,20],[65,20]],
  '4-2-3-1': [[50,88],[14,69],[38,72],[62,72],[86,69],[35,53],[65,53],[18,33],[50,34],[82,33],[50,15]],
};

export default function FormationBoard({ quarter, named, roster, source, onSelect, onExchange, onFormationChange, readOnly = false }) {
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const key = loc => `${loc.team}:${loc.index}`;
  const targetAt = (x, y) => {
    const element = document.elementFromPoint(x, y)?.closest('[data-fm-slot]');
    if (!element) return null;
    const [team, index] = element.dataset.fmSlot.split(':');
    return { team, index: Number(index) };
  };
  const cancel = () => { gesture.current = null; setDrag(null); setOver(null); };
  const token = (loc, id, position, locked, coordinate) => {
    const selected = source && key(source) === key(loc);
    const number = roster.find(p => p.id === id)?.backNumber ?? '·';
    return <button key={key(loc)} type="button" data-fm-slot={key(loc)} disabled={readOnly}
      aria-label={`${loc.team === 'bench' ? '휴식' : loc.team.toUpperCase() + '팀'} ${position || ''} ${named(id)}${locked ? ' 고정됨' : ''}`}
      aria-pressed={Boolean(selected)}
      className={`${coordinate ? 'fm-field-player' : 'fm-bench-player'} ${selected ? 'picked' : ''} ${over === key(loc) ? 'fm-drop-over' : ''} ${locked ? 'fm-locked' : ''}`}
      style={coordinate ? { left: `${coordinate[0]}%`, top: `${coordinate[1]}%` } : undefined}
      onPointerDown={e => {
        if (e.button !== 0 || !e.isPrimary) return;
        suppressClick.current = false;
        if (locked) return;
        gesture.current = { loc, id, x: e.clientX, y: e.clientY, moved: false, pointer: e.pointerId };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        const g = gesture.current;
        if (!g || g.pointer !== e.pointerId) return;
        if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) < 8) return;
        g.moved = true;
        setDrag({ name: named(g.id), x: e.clientX, y: e.clientY });
        const target = targetAt(e.clientX, e.clientY);
        setOver(target ? key(target) : null);
      }}
      onPointerUp={e => {
        const g = gesture.current;
        if (!g || g.pointer !== e.pointerId) return;
        if (g.moved) {
          suppressClick.current = true;
          const target = targetAt(e.clientX, e.clientY);
          if (target && key(target) !== key(g.loc)) onExchange(g.loc, target);
        }
        cancel();
      }}
      onPointerCancel={() => { suppressClick.current = true; cancel(); }}
      onLostPointerCapture={cancel}
      onClick={() => {
        if (suppressClick.current) { suppressClick.current = false; return; }
        onSelect(loc);
      }}>
      {coordinate && <span className="fm-shirt" aria-hidden="true">{number}</span>}
      <strong>{named(id)}{locked ? ' 🔒' : ''}</strong>
      {position && <small>{position}</small>}
    </button>;
  };
  return <>
    {!readOnly && <p className="fm-drag-hint">선수를 다른 선수 위로 끌어서 교환하세요. 두 명을 차례로 눌러도 돼요.</p>}
    <div className="fm-teams fm-field-teams">{['a', 'b'].map(team => <section className={`fm-team fm-team-${team} fm-field-team`} key={team}>
      <h2><span><i className="fm-team-dot" />{team.toUpperCase()}팀</span>{readOnly ? <small>{quarter[team].formation}</small> : <select aria-label={`${team.toUpperCase()}팀 포메이션`} value={quarter[team].formation} onChange={e => onFormationChange(team, e.target.value)}><option value="auto">자동 추천</option>{Object.keys(PITCH_LAYOUTS).map(shape => <option key={shape}>{shape}</option>)}</select>}</h2>
      <div className="fm-football-pitch">
        <div className="fm-field-lines" aria-hidden="true"><div className="fm-half-line" /><div className="fm-center-circle" /><div className="fm-penalty fm-penalty-top" /><div className="fm-penalty fm-penalty-bottom" /><div className="fm-goal-area fm-penalty-top" /><div className="fm-goal-area fm-penalty-bottom" /></div>
        {quarter[team].slots.map((slot, index) => token({ team, index }, slot.playerId, slot.position, slot.locked, (PITCH_LAYOUTS[quarter[team].formation] || PITCH_LAYOUTS['4-3-3'])[index]))}
      </div>
    </section>)}</div>
    <section className="fm-rest"><h3>이번 쿼터 휴식 · {quarter.bench.length}명</h3><div className="fm-bench-list">{quarter.bench.length ? quarter.bench.map((id, index) => token({ team: 'bench', index }, id, null, false)) : <p>모두 출전해요.</p>}</div></section>
    {quarter.unavailable?.length > 0 && <section className="fm-unavailable"><h3>이번 쿼터 참여 불가 · {quarter.unavailable.length}명</h3><p>{quarter.unavailable.map(named).join(' · ')}</p></section>}
    {drag && <div className="fm-drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">{drag.name}</div>}
  </>;
}
