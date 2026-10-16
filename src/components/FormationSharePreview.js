import React, { useEffect, useRef, useState } from 'react';
import { createFormationImage, downloadImageBlob } from '../formationImage';

export default function FormationSharePreview({ plan, initialTeam, onClose }) {
  const [team, setTeam] = useState(initialTeam);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef(null);
  const close = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  useEffect(() => {
    let cancelled = false, url;
    setImage(null); setError(''); setSaved(false); setZoomed(false);
    createFormationImage(plan, team, id => plan.roster.find(p => p.id === id)?.name || '선수')
      .then(result => {
        if (cancelled) return;
        url = URL.createObjectURL(result.blob);
        setImage({ ...result, url, team });
      }).catch(() => { if (!cancelled) setError('이미지를 만들지 못했어요. 닫고 다시 시도해 주세요.'); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [plan, team]);
  const ready = image?.team === team;
  return <div className="fm-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="fm-share-dialog" role="dialog" aria-modal="true" aria-labelledby="fm-share-title" ref={dialog}
      onKeyDown={e => {
        if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
        if (e.key !== 'Tab') return;
        const buttons = [...dialog.current.querySelectorAll('button:not(:disabled)')];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }}>
      <div className="fm-share-heading"><h2 id="fm-share-title">공유 이미지 미리보기</h2><button ref={close} onClick={onClose} aria-label="공유 미리보기 닫기">닫기</button></div>
      <p>선수 이름과 배치를 확인한 뒤 톡방에 올려주세요.</p>
      <div className="fm-tabs" aria-label="공유할 팀">{['a', 'b'].map(t => <button key={t} className={t === team ? 'active' : ''} aria-pressed={t === team} onClick={() => setTeam(t)}>{t.toUpperCase()}팀</button>)}</div>
      <div className="fm-preview-tools"><button disabled={!ready} aria-pressed={zoomed} onClick={() => setZoomed(value => !value)}>{zoomed ? '전체 보기' : '이름 크게 보기'}</button></div>
      <div className={`fm-share-image ${zoomed ? 'fm-share-zoomed' : ''}`}>{error ? <p role="alert">{error}</p> : ready ? <img src={image.url} alt={`${team.toUpperCase()}팀 1~4쿼터 포메이션 공유 이미지`} /> : <p role="status">이미지를 준비하고 있어요…</p>}</div>
      <div className="fm-share-footer"><span role="status">{saved ? '다운로드한 PNG를 톡방에 공유해 주세요.' : '4쿼터 한 장 · PNG'}</span><button className="fm-primary" disabled={!ready} onClick={() => { downloadImageBlob(image.blob, image.filename); setSaved(true); }}>{team.toUpperCase()}팀 이미지 저장 ↓</button></div>
    </section>
  </div>;
}
