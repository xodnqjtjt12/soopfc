import React, { useEffect, useRef } from 'react';
import FormationBoard from './FormationBoard';

export default function FormationMatchDay({ plan, quarter, setQuarter, named, onClose }) {
  const exit = useRef(null);
  useEffect(() => {
    const previous = document.activeElement, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; exit.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <main className="formation fm-matchday">
    <div className="fm-matchday-heading"><div><span className="fm-eyebrow">SOOP FC · MATCH DAY</span><h1>지금은 {quarter + 1}쿼터</h1></div><button ref={exit} onClick={onClose}>편집으로 돌아가기</button></div>
    <div className="fm-tabs" aria-label="경기 쿼터">{[0, 1, 2, 3].map(q => <button key={q} aria-pressed={q === quarter} className={q === quarter ? 'active' : ''} onClick={() => setQuarter(q)}>{q + 1}Q</button>)}</div>
    <FormationBoard quarter={plan.quarters[quarter]} named={named} roster={plan.roster} readOnly />
    <div className="fm-matchday-next"><button disabled={quarter === 0} onClick={() => setQuarter(q => q - 1)}>이전 쿼터</button><button className="fm-primary" disabled={quarter === 3} onClick={() => setQuarter(q => q + 1)}>{quarter === 3 ? '마지막 쿼터' : '다음 쿼터 →'}</button></div>
  </main>;
}
