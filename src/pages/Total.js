import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../App';
import LoadingScreen from '../components/LoadingScreen';
import {
  TrendingUp, Search, Trophy, Medal, Star, Shield,
  ChevronRight, Activity, Zap, Info, User
} from 'lucide-react';

import * as S from './TotalCss';

// Helper to calculate FIFA-style overall rating based on stats
const calculateRating = (playerInfo) => {
  if (!playerInfo) return 0;
  const goalWeight = 2.5;
  const assistWeight = 2;
  const cleanSheetWeight = 2;
  const winWeight = 1.5;
  const momScoreWeight = 0.02;

  const baseRating = 50;
  const calculatedRating = baseRating +
    ((playerInfo.goals || 0) * goalWeight) +
    ((playerInfo.assists || 0) * assistWeight) +
    ((playerInfo.cleanSheets || 0) * cleanSheetWeight) +
    ((playerInfo.win || 0) * winWeight) +
    ((playerInfo.momScore || 0) * momScoreWeight);

  return Math.min(99, Math.floor(calculatedRating));
};

// 선수 칭호 계산
const getPlayerTitles = (playerInfo) => {
  const titles = [];
  const { goals = 0, assists = 0, cleanSheets = 0, matches = 0, personalPoints = 0, momScore = 0, winRate = 0 } = playerInfo;

  if (goals >= 15) titles.push('SOOP FC 메시');
  else if (goals >= 10) titles.push('득점기계');
  else if (goals >= 5) titles.push('골잡이');

  if (assists >= 10) titles.push('SOOP FC 이니에스타');
  else if (assists >= 5) titles.push('키패서');

  if (cleanSheets >= 15) titles.push('클린 시트의 주역');
  else if (cleanSheets >= 10) titles.push('수비의 리더');
  else if (cleanSheets >= 5) titles.push('뒷공간 지킴이');

  if (matches >= 20) titles.push('SOOP FC 레전드');
  else if (matches >= 10) titles.push('SOOP FC 참석왕');
  else if (matches >= 5) titles.push('꾸준함의 아이콘');

  if (personalPoints >= 20) titles.push('승점의 화신');
  else if (personalPoints >= 10) titles.push('팀의 핵심');

  if (momScore >= 900) titles.push('MOM의 제왕');
  else if (momScore >= 800) titles.push('경기의 MVP');

  if (winRate >= 70) titles.push('승리 제조기');
  else if (winRate >= 50) titles.push('믿을 수 있는 승부사');

  if (titles.length === 0) titles.push('SOOP FC 유망주');
  return titles.slice(0, 3);
};

// 레벨업 메시지 헬퍼 함수
const getLevelUpMessage = (playerInfo) => {
  const thresholds = [
    { val: playerInfo.goals || 0, targets: [5, 10, 15], titles: ['골잡이', '득점기계', 'SOOP FC 메시'], unit: '골' },
    { val: playerInfo.assists || 0, targets: [5, 10], titles: ['키패서', 'SOOP FC 이니에스타'], unit: '개의 어시스트' },
    { val: playerInfo.cleanSheets || 0, targets: [5, 10, 15], titles: ['뒷공간 지킴이', '수비의 리더', '클린 시트의 주역'], unit: '클린시트' },
    { val: playerInfo.matches || 0, targets: [5, 10, 20], titles: ['꾸준함의 아이콘', 'SOOP FC 참석왕', 'SOOP FC 레전드'], unit: '경기' },
    { val: playerInfo.personalPoints || 0, targets: [10, 20], titles: ['팀의 핵심', '승점의 화신'], unit: '승점' },
    { val: playerInfo.momScore || 0, targets: [800, 900, 1000], titles: ['경기의 MVP', 'MOM의 제왕', 'GOAT'], unit: '점' }
  ];

  for (const t of thresholds) {
    for (let i = 0; i < t.targets.length; i++) {
      if (t.val < t.targets[i]) {
        const diff = t.targets[i] - t.val;
        if (diff <= 3) {
          return `추가 ${diff}${t.unit}만 더하면 '${t.titles[i]}' 칭호를 얻을 수 있습니다!`;
        }
        break;
      }
    }
  }
  return null;
};

const computeRankings = (docs, statKey, rankKeyName) => {
  const sortedDocs = [...docs].sort((a, b) => {
    const valueA = a.data()[statKey] || 0;
    const valueB = b.data()[statKey] || 0;
    return valueB - valueA;
  });

  let currentRank = 0;
  let prevValue = null;
  return sortedDocs.map((doc, index) => {
    const value = doc.data()[statKey] || 0;
    if (value !== prevValue) {
      currentRank = index + 1;
      prevValue = value;
    }
    return { id: doc.id, ...doc.data(), [rankKeyName]: currentRank };
  });
};

const unifyPosition = (position) => {
  const map = { 'CB1': 'CB', 'CB2': 'CB', 'CDM1': 'CDM', 'CDM2': 'CDM', 'CM1': 'CM', 'CM2': 'CM' };
  return map[position] || position;
};

const calculateMostFrequentPosition = async (playerName) => {
  const q = query(collection(db, 'matches'));
  const snap = await getDocs(q);
  const posTable = {};

  snap.forEach(doc => {
    (doc.data().quarters || []).forEach(q => {
      q.teams.forEach(t => {
        t.players.forEach(p => {
          if (p.name === playerName) {
            const up = unifyPosition(p.position);
            posTable[up] = (posTable[up] || 0) + 1;
          }
        });
      });
    });
  });

  const sorted = Object.entries(posTable).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : 'N/A';
};

const Total = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [playerName, setPlayerName] = useState('');
  const [playerInfo, setPlayerInfo] = useState(null);
  const [playerRankings, setPlayerRankings] = useState(null);
  const [error, setError] = useState('');
  const [topSearchedPlayers, setTopSearchedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'players')));
        const docs = snap.docs;

        const maxStats = {
          goals: Math.max(...docs.map(d => d.data().goals || 0), 1),
          assists: Math.max(...docs.map(d => d.data().assists || 0), 1),
          cleanSheets: Math.max(...docs.map(d => d.data().cleanSheets || 0), 1),
          matches: Math.max(...docs.map(d => d.data().matches || 0), 1),
          winRate: Math.max(...docs.map(d => d.data().winRate || 0), 1),
          momScore: Math.max(...docs.map(d => d.data().momScore || 0), 1),
          personalPoints: Math.max(...docs.map(d => d.data().personalPoints || 0), 1),
        };

        setPlayerRankings({
          goals: computeRankings(docs, 'goals', 'rank'),
          assists: computeRankings(docs, 'assists', 'rank'),
          cleanSheets: computeRankings(docs, 'cleanSheets', 'rank'),
          matches: computeRankings(docs, 'matches', 'rank'),
          winRate: computeRankings(docs, 'winRate', 'rank'),
          mom: computeRankings(docs, 'momScore', 'rank'),
          personalPoints: computeRankings(docs, 'personalPoints', 'rank'),
          maxStats,
          docs: docs
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();

    const unsubscribe = onSnapshot(query(collection(db, 'searchCounts'), orderBy('count', 'desc'), limit(5)), (snap) => {
      setTopSearchedPlayers(snap.docs.map(d => ({ name: d.id, count: d.data().count })));
    });

    return () => unsubscribe();
  }, []);

  // 플레이어 히스토리 페이지에서 돌아온 경우 자동 검색
  useEffect(() => {
    if (location.state?.playerName && playerRankings) {
      setPlayerName(location.state.playerName);
      performSearch(location.state.playerName);
    }
  }, [location.state, playerRankings]);

  const performSearch = async (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setSearching(true);
    setError('');

    try {
      const searchRef = doc(db, 'searchCounts', trimmedName);
      const sDoc = await getDoc(searchRef);
      if (sDoc.exists()) await updateDoc(searchRef, { count: sDoc.data().count + 1 });
      else await setDoc(searchRef, { count: 1 });

      const pDoc = await getDoc(doc(db, 'players', trimmedName));
      if (pDoc.exists()) {
        const data = pDoc.data();
        const pos = await calculateMostFrequentPosition(trimmedName);
        const overall = calculateRating(data);

        const matches = data.matches || 1;
        const normalizedGoals = (data.goals || 0) / matches;
        const normalizedAssists = (data.assists || 0) / matches;
        const normalizedCleanSheets = (data.cleanSheets || 0) / matches;
        const normalizedWinRate = (data.winRate || 0) / 100;
        const normalizedPoints = (data.personalPoints || 0) / matches;

        let rawXG = (0.4 * normalizedGoals + 0.3 * normalizedAssists + 0.2 * normalizedCleanSheets + 0.05 * normalizedWinRate + 0.05 * normalizedPoints);

        const allStats = playerRankings.docs.map(d => {
          const pd = d.data();
          const pm = pd.matches || 1;
          return (0.4 * (pd.goals || 0) / pm + 0.3 * (pd.assists || 0) / pm + 0.2 * (pd.cleanSheets || 0) / pm + 0.05 * (pd.winRate || 0) / 100 + 0.05 * (pd.personalPoints || 0) / pm);
        });
        const maxXG = Math.max(...allStats, 1);
        const war = Math.min((rawXG / maxXG), 1.0);

        setPlayerInfo({
          ...data,
          name: pDoc.id,
          overall,
          position: pos,
          isFlipped: false,
          xA: isNaN((data.assists || 0) / matches) ? '0.000' : ((data.assists || 0) / matches).toFixed(3),
          xG: isNaN((data.goals || 0) / matches) ? '0.000' : ((data.goals || 0) / matches).toFixed(3),
          war: war.toFixed(3),
          ranks: {
            goals: playerRankings.goals.find(p => p.id === pDoc.id)?.rank || '-',
            assists: playerRankings.assists.find(p => p.id === pDoc.id)?.rank || '-',
            cleanSheets: playerRankings.cleanSheets.find(p => p.id === pDoc.id)?.rank || '-',
            matches: playerRankings.matches.find(p => p.id === pDoc.id)?.rank || '-',
            winRate: playerRankings.winRate.find(p => p.id === pDoc.id)?.rank || '-',
            mom: playerRankings.mom.find(p => p.id === pDoc.id)?.rank || '-',
            personalPoints: playerRankings.personalPoints.find(p => p.id === pDoc.id)?.rank || '-',
          }
        });
      } else {
        setError('선수를 찾을 수 없습니다.');
        setPlayerInfo(null);
      }
    } catch (err) {
      console.error(err);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(playerName);
  };

  if (loading) return <LoadingScreen />;

  const levelUpMsg = playerInfo ? getLevelUpMessage(playerInfo) : null;
  const titles = playerInfo ? getPlayerTitles(playerInfo) : [];

  return (
    <S.OuterWrapper>
      <S.Container>
        <S.TitleContainer>
          <S.Title>내 스탯 보기</S.Title>
        </S.TitleContainer>

        <S.SearchForm onSubmit={handleSearch}>
          <S.SearchInputWrapper>
            <S.Input
              placeholder="닉네임 검색"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <Search size={18} color="#adb5bd" className="search-icon" />
          </S.SearchInputWrapper>
        </S.SearchForm>

        {playerInfo && (
          <S.RankBannerContainer>
            <S.RankMessage>
              <div className="header"><Shield size={14} className="icon" /> 클린시트</div>
              <div className="content">현재 <span className="highlight">{playerInfo.ranks.cleanSheets}위</span>입니다! ({playerInfo.cleanSheets || 0}회)</div>
            </S.RankMessage>
            <S.RankMessage>
              <div className="header"><Trophy size={14} className="icon" /> 개인승점</div>
              <div className="content">현재 <span className="highlight">{playerInfo.ranks.personalPoints}위</span>입니다! ({playerInfo.personalPoints || 0}점)</div>
            </S.RankMessage>
            <S.RankMessage>
              <div className="header"><Star size={14} className="icon" /> MOM 점수</div>
              <div className="content">현재 <span className="highlight">{playerInfo.ranks.mom}위</span>입니다! ({playerInfo.momScore || 0}점)</div>
            </S.RankMessage>
            <S.RankMessage>
              <div className="header"><Medal size={14} className="icon" /> 경기 수</div>
              <div className="content">현재 <span className="highlight">{playerInfo.ranks.matches}위</span>입니다! ({playerInfo.matches || 0}경기)</div>
            </S.RankMessage>
          </S.RankBannerContainer>
        )}

        {error && <div style={{ color: '#f04452', fontWeight: 600, padding: '0 4px', marginBottom: '16px' }}>{error}</div>}

        <S.MainLayout>
          {/* Main Card Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '32px' }}>
            {playerInfo ? (
              <>
                <S.FlipCardContainer>
                  <S.FlipCardInner
                    isFlipped={playerInfo.isFlipped}
                    onClick={() => setPlayerInfo({ ...playerInfo, isFlipped: !playerInfo.isFlipped })}
                  >
                    <S.CardFront isFlipped={playerInfo.isFlipped}>
                      <S.PlayerAvatarWrapper>
                        <img
                          src={`/card/${playerInfo.name}.png`}
                          onError={(e) => { e.target.src = '/profile_default.svg'; e.target.style.objectFit = 'contain'; }}
                          alt={playerInfo.name}
                        />
                      </S.PlayerAvatarWrapper>
                    </S.CardFront>

                    <S.CardBack isFlipped={playerInfo.isFlipped}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <Activity size={20} color="#3182f6" />
                        <span style={{ fontSize: '18px', fontWeight: 800 }}>Detailed Statistics</span>
                      </div>

                      <S.DetailedStats>
                        {[
                          { label: '매치 수', value: `${playerInfo.matches || 0}경기 (${playerInfo.ranks.matches}위)`, percentage: ((playerInfo.matches || 0) / playerRankings.maxStats.matches) * 100 },
                          { label: '득점', value: `${playerInfo.goals || 0} 골 (${playerInfo.ranks.goals}위)`, percentage: ((playerInfo.goals || 0) / playerRankings.maxStats.goals) * 100 },
                          { label: '도움', value: `${playerInfo.assists || 0} 어시 (${playerInfo.ranks.assists}위)`, percentage: ((playerInfo.assists || 0) / playerRankings.maxStats.assists) * 100 },
                          { label: '클린시트', value: `${playerInfo.cleanSheets || 0} (${playerInfo.ranks.cleanSheets}위)`, percentage: ((playerInfo.cleanSheets || 0) / playerRankings.maxStats.cleanSheets) * 100 },
                          { label: '승률', value: `${(playerInfo.winRate || 0).toFixed(1)}% (${playerInfo.ranks.winRate}위)`, percentage: ((playerInfo.winRate || 0) / playerRankings.maxStats.winRate) * 100 },
                          { label: '개인승점', value: `${playerInfo.personalPoints || 0} (${playerInfo.ranks.personalPoints}위)`, percentage: ((playerInfo.personalPoints || 0) / playerRankings.maxStats.personalPoints) * 100 },
                          { label: 'MOM점수', value: `${playerInfo.momScore || 0}점 (${playerInfo.ranks.mom}위)`, percentage: ((playerInfo.momScore || 0) / playerRankings.maxStats.momScore) * 100 },
                        ].map(s => (
                          <S.StatRow key={s.label}>
                            <S.StatHeader>
                              <span className="label">{s.label}</span>
                              <span className="value">{s.value}</span>
                            </S.StatHeader>
                            <S.StatBarContainer>
                              <S.StatBar percentage={Math.max(s.percentage, (s.percentage > 0 ? 5 : 0))} />
                            </S.StatBarContainer>
                          </S.StatRow>
                        ))}

                        <S.StatRow style={{ marginTop: '4px' }}>
                          <S.StatHeader>
                            <span className="label">승/무/패</span>
                            <span className="value">
                              <span style={{ color: '#3182f6' }}>{playerInfo.win || 0}</span> / {playerInfo.draw || 0} / <span style={{ color: '#f04452' }}>{playerInfo.lose || 0}</span>
                            </span>
                          </S.StatHeader>
                          <S.WinLossBar>
                            <div style={{ width: `${((playerInfo.win || 0) / (playerInfo.matches || 1)) * 100}%`, background: '#3182f6' }} />
                            <div style={{ width: `${((playerInfo.draw || 0) / (playerInfo.matches || 1)) * 100}%`, background: '#adb5bd' }} />
                            <div style={{ width: `${((playerInfo.lose || 0) / (playerInfo.matches || 1)) * 100}%`, background: '#f04452' }} />
                          </S.WinLossBar>
                        </S.StatRow>
                      </S.DetailedStats>

                      <S.AdvancedStatGrid>
                        <S.AdvancedStatItem>
                          <span className="val">{playerInfo.xA}</span>
                          <span className="lab">xA</span>
                        </S.AdvancedStatItem>
                        <S.AdvancedStatItem>
                          <span className="val">{playerInfo.xG}</span>
                          <span className="lab">xG</span>
                        </S.AdvancedStatItem>
                        <S.AdvancedStatItem>
                          <span className="val">{playerInfo.war}</span>
                          <span className="lab">WAR</span>
                        </S.AdvancedStatItem>
                      </S.AdvancedStatGrid>

                      {levelUpMsg && (
                        <S.LevelUpMessage>
                          {levelUpMsg}
                        </S.LevelUpMessage>
                      )}

                      <div style={{ marginTop: '20px' }}>
                        <S.HistoryButton to={`/player-history/${playerInfo.name}`}>
                          기록 더보기
                          <ChevronRight size={16} />
                        </S.HistoryButton>
                      </div>
                    </S.CardBack>
                  </S.FlipCardInner>
                </S.FlipCardContainer>

                <div style={{ textAlign: 'left', width: '100%', maxWidth: '440px', paddingLeft: '8px' }}>
                  <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#191f28', margin: '0 0 12px' }}>{playerInfo.name}</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {titles.map(t => (
                      <S.TitleBadge key={t}>
                        {t}
                      </S.TitleBadge>
                    ))}
                  </div>
                  <p style={{ fontSize: '15px', color: '#8b95a1', marginTop: '16px', fontWeight: 600, letterSpacing: '0.5px' }}>SOOP FC PROFESSIONAL PLAYER</p>
                </div>
              </>
            ) : (
              <div style={{
                height: '500px',
                width: '100%',
                maxWidth: '440px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                borderRadius: '32px',
                color: '#adb5bd',
                gap: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
              }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={40} strokeWidth={1.5} color="#cbd5e1" />
                </div>
                <p style={{ fontWeight: 600, fontSize: '16px' }}>닉네임을 검색하여 스탯 카드를 확인해 보세요.</p>
              </div>
            )}
          </div>

          {/* Sidebar Section */}
          <S.SideSection>
            <S.TopPlayersCard>
              <S.SectionTitle>
                <TrendingUp size={18} color="#f04452" />
                인기 급상승 선수
              </S.SectionTitle>
              {topSearchedPlayers.map((p, i) => (
                <S.TopPlayerItem key={p.name} onClick={() => { setPlayerName(p.name); performSearch(p.name); }}>
                  <span className="rank">{i + 1}</span>
                  <span className="name">{p.name}</span>
                  <span className="count">{p.count}회</span>
                </S.TopPlayerItem>
              ))}
            </S.TopPlayersCard>

            <div style={{ background: '#eaf2ff', padding: '24px', borderRadius: '24px', color: '#3182f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Zap size={20} fill="#3182f6" />
                <span style={{ fontWeight: 800 }}>Notice</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                매 경기 종료 후 스탯이 실시간으로 업데이트됩니다.
                <br />나의 랭킹과 상세 지표를 확인해보세요!
              </p>
            </div>
          </S.SideSection>
        </S.MainLayout>
      </S.Container>
    </S.OuterWrapper>
  );
};

export default Total;