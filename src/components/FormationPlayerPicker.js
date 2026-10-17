import React, { useEffect, useRef, useState } from 'react';

export default function FormationPlayerPicker({ title, players, onPick, onClose }) {
  const [query, setQuery] = useState('');
  const panel = useRef(null), input = useRef(null);
  useEffect(() => {
    const previous = document.activeElement, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; input.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const matches = players.filter(p => p.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <div className="fm-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><section className="fm-picker" role="dialog" aria-modal="true" aria-labelledby="fm-picker-title" ref={panel} onKeyDown={e => {
    if (e.key === 'Escape') onClose();
    if (e.key !== 'Tab') return;
    const items = [...panel.current.querySelectorAll('button,input')];
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }}><div className="fm-section-title"><h2 id="fm-picker-title">{title}</h2><button onClick={onClose}>선택 닫기</button></div><input ref={input} aria-label="배치 대기 선수 검색" placeholder="이름 검색" value={query} onChange={e => setQuery(e.target.value)} /><div className="fm-picker-list">{matches.map(p => <button key={p.id} onClick={() => onPick(p.id)}>{p.name}{p.isGuest ? ' · 용병' : ''}</button>)}</div>{!matches.length && <p>선택할 수 있는 선수가 없어요.</p>}</section></div>;
}
