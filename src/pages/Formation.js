import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { POSITIONS, STATS, generatePlan, totals, normalizeProfile, exchangePlayers, changeFormation, quarterShortages } from '../formationEngine';
import FormationBoard from '../components/FormationBoard';
import FormationSharePreview from '../components/FormationSharePreview';
import FormationMatchDay from '../components/FormationMatchDay';
import FormationPlayerPicker from '../components/FormationPlayerPicker';
import { createManualPlan, isQuarterComplete, isPlanComplete, assignManualPlayer, fillManualQuarters, copyQuarter, refreshPlan, changePartialFormation } from '../manualFormation';
import './Formation.css';
import { generateAIPlan } from '../aiFormation';

const KEY = 'soopfc-formation-v1';
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
function readDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(KEY)) || {};
    draft.profiles = Object.fromEntries(Object.entries(draft.profiles || {}).map(([id, p]) => [id, normalizeProfile(p)]));
    if (draft.plan?.roster) draft.plan.roster = draft.plan.roster.map(normalizeProfile);
    return draft;
  } catch { return {}; }
}
export default function Formation() {
  const [draft] = useState(readDraft);
  const [players, setPlayers] = useState([]);
  const [profiles, setProfiles] = useState(draft.profiles || {});
  const [selected, setSelected] = useState(draft.selected || []);
  const [mode, setMode] = useState(draft.mode || 'half');
  const [plan, setPlan] = useState(draft.plan || null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [quarter, setQuarter] = useState(0);
  const [source, setSource] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shareTeam, setShareTeam] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastRoster, setLastRoster] = useState(draft.lastRoster || draft.plan?.roster?.map(p => p.id) || []);
  const [availability, setAvailability] = useState(draft.availabilityDate === TODAY ? draft.availability || {} : {});
  const [availabilityEditor, setAvailabilityEditor] = useState(null);
  const [allQuarters, setAllQuarters] = useState(false);
  const [matchDay, setMatchDay] = useState(false);
  const [guests, setGuests] = useState(draft.guestDate === TODAY ? draft.guests || [] : []);
  const [guestForm, setGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestStats, setGuestStats] = useState([2, 2, 2, 2]);
  const [guestPosition, setGuestPosition] = useState('');
  const [guestGoalkeeper, setGuestGoalkeeper] = useState(false);
  const [picker, setPicker] = useState(null);
  const [copyTargets, setCopyTargets] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiCode, setAiCode] = useState('');
  const buildAI = async () => {
    setAiBusy(true); setMessage('AI가 4쿼터 팀과 포메이션을 구상하고 있어요…');
    try {
      const result = await generateAIPlan(attendees, mode, aiCode);
      setPlan(result); setHistory([]); setLastRoster(attendees.map(p => p.id));
      setQuarter(0); setSource(null); setMessage('AI 편성을 완성했어요. 출전 횟수와 배치를 확인하고 직접 수정할 수 있어요.');
    } catch (error) { setMessage(error.message); }
    finally { setAiBusy(false); }
  };
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([getDocs(collection(db, 'players')), getDocs(collection(db, 'formationProfiles'))])
      .then(([listResult, savedResult]) => {
        if (cancelled) return;
        if (listResult.status !== 'fulfilled') throw new Error('players');
        const list = listResult.value;
        setPlayers(list.docs.map(d => ({ id: d.id, name: d.data().name || '이름 없음', backNumber: d.data().backNumber ?? null })).sort((a, b) => a.name.localeCompare(b.name, 'ko')));
        if (savedResult.status === 'fulfilled') setProfiles(previous => ({ ...Object.fromEntries(savedResult.value.docs.map(d => [d.id, normalizeProfile(d.data())])), ...previous }));
        else setMessage('저장된 능력치를 읽지 못했어요. 기기에 보관된 값 또는 기본 2점으로 표시해요.');
      }).catch(() => { if (!cancelled) setMessage('선수 정보를 불러오지 못했어요. 연결과 DB 읽기 권한을 확인해 주세요.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ profiles, selected, mode, plan, lastRoster, availability, availabilityDate: TODAY, guests, guestDate: TODAY })); }
    catch { setMessage('이 기기에 임시 저장하지 못했어요.'); }
  }, [profiles, selected, mode, plan, lastRoster, availability, guests]);
  const profile = id => ({ stats: [2, 2, 2, 2], statScale: 5, preferences: ['중앙미드필더', ''], goalkeeper: false, ...profiles[id] });
  const roster = [...players, ...guests].map(p => ({ ...p, ...profile(p.id), availableQuarters: availability[p.id] || [0, 1, 2, 3] }));
  const attendees = selected.map(id => roster.find(p => p.id === id)).filter(Boolean);
  const shortages = quarterShortages(attendees);
  const searchResults = query.trim() ? roster.filter(p => p.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) && !selected.includes(p.id)) : [];
  const named = id => !id ? '빈자리' : roster.find(p => p.id === id)?.name || plan?.roster?.find(p => p.id === id)?.name || '삭제된 선수';
  const update = (id, change) => setProfiles(p => ({ ...p, [id]: { ...profile(id), ...change } }));
  const addGuest = e => {
    e.preventDefault(); const name = guestName.trim();
    if (!name) return;
    if (roster.some(p => p.name.trim() === name)) { setMessage('같은 이름이 있어요. 구분할 수 있는 별칭을 입력해 주세요.'); return; }
    const id = `guest:${window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
    setGuests(previous => [...previous, { id, name, isGuest: true }]);
    setProfiles(previous => ({ ...previous, [id]: { stats: guestStats, statScale: 5, preferences: [guestPosition, ''], goalkeeper: guestGoalkeeper } }));
    setSelected(ids => [...ids, id]); setGuestName(''); setGuestStats([2, 2, 2, 2]); setGuestPosition(''); setGuestGoalkeeper(false); setGuestForm(false);
    setMessage(`${name} 용병을 오늘 참석자에 추가했어요. 회원 기록에는 등록되지 않아요.`);
  };
  const startManual = () => {
    setPlan(createManualPlan(attendees)); setHistory([]); setLastRoster(attendees.map(p => p.id));
    setQuarter(0); setSource(null); setMessage('빈자리를 눌러 선수를 고르거나 대기 선수를 끌어 넣으세요.');
  };
  const build = () => {
    try {
      const result = generatePlan(roster.filter(p => selected.includes(p.id)), mode);
      setPlan({ ...result, roster: roster.filter(p => selected.includes(p.id)) });
      setHistory([]); setLastRoster(roster.filter(p => selected.includes(p.id)).map(p => p.id));
      setQuarter(0); setSource(null); setMessage('편성했어요. 선수를 누르면 자리 교환과 고정이 가능해요.');
    } catch (e) { setMessage(e.message); }
  };
  const current = plan?.quarters[quarter];
  const planRoster = plan?.roster || roster;
  const complete = isPlanComplete(plan);
  const rememberEdit = next => {
    if (next === plan) return;
    setHistory(previous => [...previous.slice(-19), { plan, quarter }]);
    setPlan(next);
  };
  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setPlan(previous.plan); setQuarter(previous.quarter);
    setHistory(items => items.slice(0, -1)); setSource(null); setPicker(null);
    setMessage('직전 수정으로 되돌렸어요.');
  };
  const loadLastRoster = () => {
    const valid = [...new Set(lastRoster)].filter(id => roster.some(p => p.id === id));
    const added = valid.filter(id => !selected.includes(id)).length;
    setSelected(ids => [...new Set([...ids, ...valid])]); setQuery('');
    setMessage(`${added}명을 추가했어요. 최근 편성 명단에서 현재 등록된 선수만 불러왔어요.`);
  };
  const exchange = (from, to) => {
    try {
      rememberEdit(refreshPlan(exchangePlayers(plan, quarter, from, to)));
      setMessage('자리를 교환했어요. 출전 횟수와 밸런스를 확인해 주세요.');
    } catch (e) { setMessage(e.message); }
    setSource(null);
  };
  const swap = target => {
    const id = target.team === 'bench' ? current.bench[target.index] : current[target.team].slots[target.index].playerId;
    if (!id && !source) { setPicker(target); return; }
    if (!source) { setSource(target); return; }
    if (source.team === target.team && source.index === target.index) { setSource(null); return; }
    exchange(source, target);
  };
  const toggleLock = () => {
    if (!source || source.team === 'bench') return;
    const copy = JSON.parse(JSON.stringify(plan));
    const slot = copy.quarters[quarter][source.team].slots[source.index]; slot.locked = !slot.locked;
    rememberEdit(copy); setSource(null);
  };
  const fill = indices => {
    try { rememberEdit(fillManualQuarters(plan, indices)); setSource(null); setMessage('직접 배치한 선수를 유지하고 빈자리를 채웠어요.'); }
    catch (e) { setMessage(e.message); }
  };
  const assign = (target, id) => {
    try { rememberEdit(assignManualPlayer(plan, quarter, target.team, target.index, id)); setSource(null); setPicker(null); }
    catch (e) { setMessage(e.message); }
  };
  const copy = () => {
    const targets = copyTargets.filter(q => q !== quarter);
    if (!targets.length) return;
    if (!window.confirm(`${targets.map(q => `${q + 1}Q`).join(', ')}의 기존 배치를 덮어쓸까요? 출전 불가 선수는 빈자리로 남겨요. 되돌리기가 가능해요.`)) return;
    rememberEdit(copyQuarter(plan, quarter, targets)); setCopyTargets([]); setSource(null);
    setMessage('쿼터를 복사했어요. 출전 불가 선수의 빈자리를 확인해 주세요.');
  };
  const reposition = () => {
    let copy = plan;
    try {
      ['a', 'b'].forEach(team => { copy = isQuarterComplete(copy.quarters[quarter]) ? changeFormation(copy, quarter, team, copy.quarters[quarter][team].formation) : changePartialFormation(copy, quarter, team, copy.quarters[quarter][team].formation, false); });
      rememberEdit(copy); setSource(null); setMessage('팀·휴식 인원과 고정한 포지션을 유지하고 자리를 다시 배치했어요.');
    } catch (e) { setMessage(e.message); }
  };
  const selectFormation = (team, shape) => {
    try {
      rememberEdit((allQuarters ? complete : isQuarterComplete(current)) ? changeFormation(plan, quarter, team, shape, allQuarters) : changePartialFormation(plan, quarter, team, shape, allQuarters));
      setSource(null); setMessage(`${team.toUpperCase()}팀 ${allQuarters ? '전체 쿼터' : `${quarter + 1}Q`} 포메이션을 변경했어요.`);
    } catch (e) { setMessage(e.message); }
  };
  const saveProfiles = async () => {
    setSaving(true);
    try {
      await Promise.all(Object.entries(profiles).filter(([id]) => players.some(p => p.id === id)).map(([id, data]) => setDoc(doc(db, 'formationProfiles', id), data)));
      setMessage('선수 능력치를 DB에 저장했어요.');
    } catch { setMessage('DB 저장에 실패했어요. 입력 내용은 이 기기에 임시 보관돼요.'); }
    finally { setSaving(false); }
  };
  const savePlan = async () => {
    if (!complete) { setMessage('4쿼터의 빈자리를 모두 채운 뒤 확정해 주세요.'); return; }
    setSaving(true);
    try {
      const ref = doc(collection(db, 'formationPlans'));
      await setDoc(ref, { ...plan, createdAt: serverTimestamp() });
      setMessage('4쿼터 편성을 DB에 저장했어요.');
    } catch { setMessage('DB 저장에 실패했어요. 편성은 이 기기에 임시 보관돼요.'); }
    finally { setSaving(false); }
  };
  const counts = Object.fromEntries(planRoster.map(p => [p.id, plan ? plan.quarters.filter(q => [...q.a.slots, ...q.b.slots].some(s => s.playerId === p.id)).length : 0]));
  const aTotals = current ? totals(current.a.slots, planRoster) : [];
  const bTotals = current ? totals(current.b.slots, planRoster) : [];
  if (matchDay && plan) return <FormationMatchDay plan={plan} quarter={quarter} setQuarter={setQuarter} named={named} onClose={() => setMatchDay(false)} />;
  return <main className="formation">
    <header><span className="fm-eyebrow">SOOP FC · MATCH DAY</span><h1>오늘의 팀 짜기</h1><p>참석자만 고르면, 4쿼터 준비 끝.</p></header>
    <div role="status" className="fm-message">{message}</div>
    {!plan ? <fieldset className="fm-input-section" disabled={aiBusy} aria-busy={aiBusy}>
      <div className="fm-section-title"><h2>누가 함께 뛰나요?</h2><span>{attendees.length}명</span></div>
      {lastRoster.length > 0 && <div className="fm-last-roster"><button disabled={loading} onClick={loadLastRoster}>지난 명단 불러오기</button><small>이 기기의 최근 편성 · 이미 추가한 선수는 유지돼요</small></div>}
      <input className="fm-search" aria-label="선수 검색" placeholder="이름을 검색해서 참석자를 추가하세요" value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={() => setGuestForm(value => !value)}>+ 용병 추가</button>
      {guestForm && <form className="fm-guest-form" onSubmit={addGuest}><label>용병 이름<input required maxLength={30} autoFocus value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="이름 또는 별칭" /></label><details><summary>추가 설정 · 기본 능력치 2점</summary>{STATS.map((label, i) => <label key={label}>{label}<input aria-label={`용병 ${label}`} type="number" min="1" max="5" value={guestStats[i]} onChange={e => setGuestStats(values => values.map((v, j) => j === i ? Math.max(1, Math.min(5, Number(e.target.value) || 2)) : v))} /></label>)}<label>선호 포지션<select value={guestPosition} onChange={e => setGuestPosition(e.target.value)}><option value="">선택 안 함</option>{POSITIONS.map(p => <option key={p}>{p}</option>)}</select></label><label><input type="checkbox" checked={guestGoalkeeper} onChange={e => setGuestGoalkeeper(e.target.checked)} />골키퍼 가능</label></details><div className="fm-tools"><button type="button" onClick={() => setGuestForm(false)}>취소</button><button className="fm-primary" type="submit">오늘 참석자로 추가</button></div><small>당일 용병으로 보관하고, 회원 기록은 만들지 않아요.</small></form>}
      {query.trim() && !loading && <div className="fm-search-results" aria-label="선수 검색 결과">
        {searchResults.length ? searchResults.map(p => <button key={p.id} aria-label={`${p.name} 참석자 추가`} onClick={() => { setSelected(ids => ids.includes(p.id) ? ids : [...ids, p.id]); setQuery(''); }}><strong>{p.name}</strong><span>+ 추가</span></button>) : <p role="status">추가할 선수가 없어요. 이름을 확인하거나 이미 추가된 참석자를 확인해 주세요.</p>}
      </div>}
      <div className="fm-tools"><button disabled={!attendees.length} onClick={() => { setSelected([]); setEditing(null); }}>참석자 비우기</button><button disabled={saving} onClick={saveProfiles}>능력치 DB 저장</button></div>
      {loading && <p>선수 목록을 불러오는 중이에요…</p>}
      {!loading && !players.length && <p>등록된 선수가 없거나 목록을 불러오지 못했어요.</p>}
      {!loading && players.length > 0 && !attendees.length && <div className="fm-empty"><strong>오늘 함께 뛸 선수를 추가해 주세요</strong><p>위에서 이름을 검색하고 누르면 여기에 모여요.</p></div>}
      <div className="fm-players">{attendees.map(p => <div className="fm-player" key={p.id}>
        <div className="fm-attendee-info"><strong>{p.name}{p.isGuest && <small className="fm-guest-badge">용병</small>}</strong><small>{profiles[p.id] ? p.preferences.filter(Boolean).join(' · ') : '능력치 미입력 · 기본 2점'}</small></div>
        {p.availableQuarters.length !== 4 && <small className="fm-availability-badge">{p.availableQuarters.length ? `${p.availableQuarters.map(q => q + 1).join('·')}Q 가능` : '전 쿼터 불가'}</small>}
        <button aria-label={`${p.name} 출전 설정`} onClick={() => setAvailabilityEditor(availabilityEditor === p.id ? null : p.id)}>출전 설정</button>
        <button aria-label={`${p.name} 능력치 수정`} onClick={() => setEditing(editing === p.id ? null : p.id)}>능력치 {editing === p.id ? '닫기' : '수정'}</button>
        <button aria-label={`${p.name} 참석자 제외`} onClick={() => { setSelected(ids => ids.filter(id => id !== p.id)); if (editing === p.id) setEditing(null); }}>제외</button>
        {availabilityEditor === p.id && <div className="fm-availability-editor"><p>뛸 수 없는 쿼터만 꺼 주세요. 실제 출전은 자동 배정돼요.</p><div>{[0, 1, 2, 3].map(q => <button key={q} aria-label={`${p.name} ${q + 1}Q 출전 가능`} aria-pressed={p.availableQuarters.includes(q)} onClick={() => setAvailability(previous => ({ ...previous, [p.id]: p.availableQuarters.includes(q) ? p.availableQuarters.filter(index => index !== q) : [...p.availableQuarters, q].sort() }))}>{q + 1}Q {p.availableQuarters.includes(q) ? '✓' : '—'}</button>)}</div></div>}
        {editing === p.id && <div className="fm-editor">{STATS.map((stat, i) => <div className="fm-stat" key={stat}><span>{stat} <small>1~5</small></span><button aria-label={`${stat} 낮추기`} disabled={p.stats[i] <= 1} onClick={() => update(p.id, { stats: p.stats.map((v, j) => j === i ? v - 1 : v) })}>−</button><b>{p.stats[i]}</b><button aria-label={`${stat} 높이기`} disabled={p.stats[i] >= 5} onClick={() => update(p.id, { stats: p.stats.map((v, j) => j === i ? v + 1 : v) })}>+</button></div>)}
          {[0, 1].map(i => <label key={i}>선호 {i + 1}순위<select value={p.preferences[i] || ''} onChange={e => update(p.id, { preferences: p.preferences.map((v, j) => j === i ? e.target.value : v) })}><option value="">선택 안 함</option>{POSITIONS.map(pos => <option key={pos} disabled={p.preferences[1 - i] === pos}>{pos}</option>)}</select></label>)}
          <label><input type="checkbox" checked={p.goalkeeper} onChange={e => update(p.id, { goalkeeper: e.target.checked })} />골키퍼 가능</label>
        </div>}
      </div>)}</div>
      <details className="fm-settings"><summary>편성 설정</summary><label>팀 변경<select value={mode} onChange={e => setMode(e.target.value)}><option value="half">2쿼터 후 재편성</option><option value="quarter">매 쿼터 재편성</option><option value="fixed">팀 최대한 유지</option></select></label><p>11대11 · 4쿼터 · 균등 출전 우선. 교체 인원에 따라 팀이 일부 조정될 수 있어요.</p></details>
      {attendees.length >= 22 && shortages.some(Boolean) && <p role="alert" className="fm-warning">{shortages.map((n, q) => n ? `${q + 1}Q ${n}명 부족` : '').filter(Boolean).join(' · ')}. 출전 설정이나 참석자를 확인해 주세요.</p>}
      <details className="fm-settings"><summary>AI 편성 이용 설정</summary><label>AI 이용 코드<input type="password" autoComplete="off" value={aiCode} onChange={e => setAiCode(e.target.value)} placeholder="운영자에게 받은 코드" /></label><p>이름을 제외한 능력치·선호 포지션·출전 설정만 Gemini에 보내요. 무료 서비스의 입력과 응답은 Google 제품 개선에 사용될 수 있어요. 코드는 이 기기에 저장하지 않아요.</p></details>
      <div className="fm-bottom"><span>{attendees.length}명 참석</span><button disabled={loading || !attendees.length} onClick={startManual}>직접 배치하기</button><button disabled={loading || shortages.some(Boolean)} onClick={build}>4쿼터 팀 짜기</button><button className="fm-primary" disabled={loading || shortages.some(Boolean) || !aiCode.trim()} onClick={buildAI}>{aiBusy ? 'AI 편성 중…' : 'AI로 팀 짜기'}</button></div>
    </fieldset> : <>
      <div className="fm-tools"><button onClick={() => { setPlan(null); setSource(null); setHistory([]); }}>← 참석자 수정</button><span>{planRoster.length}명 · 11대11</span></div>
      <div className="fm-tabs" role="tablist">{[0, 1, 2, 3].map(i => <button key={i} role="tab" aria-selected={quarter === i} className={quarter === i ? 'active' : ''} onClick={() => { setQuarter(i); setSource(null); }}>{i + 1}Q</button>)}</div>
      <div className="fm-tools" aria-label="편성 수정과 공유"><button disabled={!history.length} onClick={undo}>↶ 수정 되돌리기</button><button disabled={!complete} onClick={() => setShareTeam('a')}>공유 이미지 보기</button><button disabled={!complete} onClick={() => { setSource(null); setMatchDay(true); }}>경기 당일 보기</button></div>
      {!complete && <div className="fm-manual-status" role="status"><strong>{quarter + 1}Q · A팀 {current.a.slots.filter(s => s.playerId).length}/11 · B팀 {current.b.slots.filter(s => s.playerId).length}/11</strong><p>4쿼터를 모두 채우면 확정·공유할 수 있어요.</p><button onClick={() => fill([quarter])}>이 쿼터 빈자리 자동 채우기</button><button onClick={() => fill([0, 1, 2, 3].filter(q => q !== quarter && !isQuarterComplete(plan.quarters[q])))}>나머지 쿼터 자동 완성</button></div>}
      <details className="fm-settings"><summary>이 쿼터 복사하기</summary><p>대상 쿼터의 기존 배치를 바꿔요. 출전 불가인 선수는 빈자리로 남겨요.</p>{[0, 1, 2, 3].filter(q => q !== quarter).map(q => <label key={q}><input type="checkbox" checked={copyTargets.includes(q)} onChange={() => setCopyTargets(values => values.includes(q) ? values.filter(v => v !== q) : [...values, q])} />{q + 1}Q</label>)}<button disabled={!copyTargets.some(q => q !== quarter)} onClick={copy}>선택한 쿼터로 복사</button></details>
      <label className="fm-all-quarters"><input type="checkbox" checked={allQuarters} onChange={e => setAllQuarters(e.target.checked)} />포메이션 변경 시 해당 팀의 전체 쿼터에 적용</label>
      {planRoster.some(p => !profiles[p.id]) && <p className="fm-warning">미입력 선수는 기본 2점이에요. 정확한 편성을 위해 능력치를 입력해 주세요.</p>}
      {['a', 'b'].some(team => !current[team].slots.some(s => s.position === '골키퍼' && planRoster.find(p => p.id === s.playerId)?.goalkeeper)) && <p className="fm-warning">골키퍼 배치를 확인해 주세요. 가능 선수가 부족하거나 직접 수정한 배치일 수 있어요.</p>}
      <FormationBoard key={quarter} quarter={current} named={named} roster={planRoster} source={source} onSelect={swap} onExchange={exchange} onFormationChange={selectFormation} />
      {source && <div className="fm-selection"><span>교환할 선수나 빈자리를 누르세요.</span>{source.team !== 'bench' && <><button onClick={toggleLock}>고정 / 해제</button><button onClick={() => assign(source, null)}>배치 해제</button></>}<button onClick={() => setSource(null)}>취소</button></div>}
      {picker && <FormationPlayerPicker title={`${picker.team.toUpperCase()}팀 · ${current[picker.team].slots[picker.index].position}`} players={planRoster.filter(p => current.bench.includes(p.id))} onPick={id => assign(picker, id)} onClose={() => setPicker(null)} />}
      <details className="fm-settings"><summary>밸런스와 편성 이유 보기</summary>{plan.source === 'gemini' ? <><p>Gemini가 생성한 최초 편성 이유예요. 수동 수정 후에는 실제 배치와 다를 수 있어요.</p><p>{current.reason}</p></> : <p>능력치와 선호 포지션을 이용한 기본 자동 계산 설명이에요.</p>}<table><thead><tr><th>능력치 합계</th><th>A팀</th><th>B팀</th><th>차이</th></tr></thead><tbody>{STATS.map((s, i) => <tr key={s}><th>{s}</th><td>{aTotals[i]}</td><td>{bTotals[i]}</td><td>{Math.abs(aTotals[i] - bTotals[i])}</td></tr>)}</tbody></table><p>공격·수비·지능·피지컬 차이를 줄이는 팀 조합을 탐색하고, 선호 포지션과 포지션별 능력치에 맞춰 포메이션을 골랐어요. 수동 수정 후에는 현재 배치의 합계를 표시해요.</p>{['a', 'b'].map(team => !current[team].slots.some(s => s.position === '골키퍼' && planRoster.find(p => p.id === s.playerId)?.goalkeeper) && <p className="fm-warning" key={team}>{team.toUpperCase()}팀은 골키퍼 가능 선수가 골키퍼 자리에 없어요. 직접 지정해 주세요.</p>)}</details>
      <details className="fm-settings"><summary>선수별 출전 횟수 보기</summary>{planRoster.map(p => <div className="fm-count" key={p.id}><span>{p.name}</span><b>{counts[p.id]} / 4쿼터</b></div>)}</details>
      <div className="fm-bottom"><button onClick={reposition}>이 쿼터 자리 재배치</button><button className="fm-primary" disabled={saving || !complete} onClick={savePlan}>{saving ? '저장 중…' : '편성 확정·저장'}</button></div>
    </>}
    {shareTeam && <FormationSharePreview plan={plan} initialTeam={shareTeam} onClose={() => setShareTeam(null)} />}
  </main>;
}
