import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import {
  Container,
  MainContent,
  PageTitle,
  FilterBar,
  SelectWrapper,
  MatchSection,
  MatchHeader,
  QuarterSection,
  QuarterHeader,
  QuarterContent,
  FieldContainer,
  FieldView,
  GoalArea,
  PenaltyArea,
  GoalPost,
  PlayerCard,
  PlayerInfo,
  TeamsContainer,
  TeamCard,
  TeamName,
  Formation,
  PlayersList,
  PlayerItem,
  StatsList,
  StatItem,
  StatTitle,
  StatValue,
  LoadingIndicator,
  EmptyState,
  Badge,
  ScoreBox,
} from './MatchStatsCss';

// 포지션 미러맵 (왼쪽 ↔ 오른쪽)
const MIRROR_POSITION = {
  LB: 'RB', RB: 'LB',
  LW: 'RW', RW: 'LW',
  LWB: 'RWB', RWB: 'LWB',
  LM: 'RM', RM: 'LM'
};

// Chevron Icon
const ChevronIcon = ({ isOpen }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// Format date
const formatDate = dateString => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`;
};

// Formation positions
const FORMATIONS = {
  '4-3-3': {
    desktop: [
      { position: 'GK', left: '5%', top: '50%' },
      { position: 'RB', left: '20%', top: '80%' },
      { position: 'CB1', left: '20%', top: '40%' },
      { position: 'CB2', left: '20%', top: '60%' },
      { position: 'LB', left: '20%', top: '20%' },
      { position: 'CM1', left: '40%', top: '30%' },
      { position: 'CM2', left: '40%', top: '50%' },
      { position: 'CM3', left: '40%', top: '70%' },
      { position: 'RW', left: '60%', top: '80%' },
      { position: 'ST', left: '60%', top: '50%' },
      { position: 'LW', left: '60%', top: '20%' },
    ],
    mobile: [
      { position: 'GK', top: '5%', left: '50%', transform: 'translate(-50%, 0)' },
      { position: 'RB', top: '20%', left: '20%' },
      { position: 'CB1', top: '20%', left: '40%' },
      { position: 'CB2', top: '20%', left: '60%' },
      { position: 'LB', top: '20%', left: '80%' },
      { position: 'CM1', top: '30%', left: '30%' },
      { position: 'CM2', top: '30%', left: '50%' },
      { position: 'CM3', top: '30%', left: '70%' },
      { position: 'RW', top: '38%', left: '20%' },
      { position: 'ST', top: '38%', left: '50%' },
      { position: 'LW', top: '38%', left: '80%' },
    ],
  },
  '4-4-2': {
    desktop: [
      { position: 'GK', left: '5%', top: '50%' },
      { position: 'RB', left: '20%', top: '80%' },
      { position: 'CB1', left: '20%', top: '40%' },
      { position: 'CB2', left: '20%', top: '60%' },
      { position: 'LB', left: '20%', top: '20%' },
      { position: 'RM', left: '35%', top: '80%' },
      { position: 'CM1', left: '35%', top: '40%' },
      { position: 'CM2', left: '35%', top: '60%' },
      { position: 'LM', left: '35%', top: '20%' },
      { position: 'ST1', left: '45%', top: '40%' },
      { position: 'ST2', left: '45%', top: '60%' },
    ],
    mobile: [
      { position: 'GK', top: '5%', left: '50%', transform: 'translate(-50%, 0)' },
      { position: 'RB', top: '20%', left: '20%' },
      { position: 'CB1', top: '20%', left: '40%' },
      { position: 'CB2', top: '20%', left: '60%' },
      { position: 'LB', top: '20%', left: '80%' },
      { position: 'RM', top: '35%', left: '20%' },
      { position: 'CM1', top: '35%', left: '40%' },
      { position: 'CM2', top: '35%', left: '60%' },
      { position: 'LM', top: '35%', left: '80%' },
      { position: 'ST1', top: '48%', left: '40%' },
      { position: 'ST2', top: '48%', left: '60%' },
    ],
  },
  '3-5-2': {
    desktop: [
      { position: 'GK', left: '5%', top: '50%' },
      { position: 'CB1', left: '20%', top: '30%' },
      { position: 'CB2', left: '20%', top: '50%' },
      { position: 'CB3', left: '20%', top: '70%' },
      { position: 'RWB', left: '35%', top: '15%' },
      { position: 'CM1', left: '35%', top: '35%' },
      { position: 'CM2', left: '35%', top: '50%' },
      { position: 'CM3', left: '35%', top: '65%' },
      { position: 'LWB', left: '35%', top: '85%' },
      { position: 'ST1', left: '45%', top: '40%' },
      { position: 'ST2', left: '45%', top: '60%' },
    ],
    mobile: [
      { position: 'GK', top: '5%', left: '50%', transform: 'translate(-50%, 0)' },
      { position: 'CB1', top: '20%', left: '30%' },
      { position: 'CB2', top: '20%', left: '50%' },
      { position: 'CB3', top: '20%', left: '70%' },
      { position: 'RWB', top: '35%', left: '15%' },
      { position: 'CM1', top: '35%', left: '35%' },
      { position: 'CM2', top: '35%', left: '50%' },
      { position: 'CM3', top: '35%', left: '65%' },
      { position: 'LWB', top: '35%', left: '85%' },
      { position: 'ST1', top: '48%', left: '40%' },
      { position: 'ST2', top: '48%', left: '60%' },
    ],
  },
  '4-2-3-1': {
    desktop: [
      { position: 'GK', left: '5%', top: '50%' },
      { position: 'RB', left: '20%', top: '80%' },
      { position: 'CB1', left: '20%', top: '40%' },
      { position: 'CB2', left: '20%', top: '60%' },
      { position: 'LB', left: '20%', top: '20%' },
      { position: 'CDM1', left: '35%', top: '40%' },
      { position: 'CDM2', left: '35%', top: '60%' },
      { position: 'RW', left: '45%', top: '80%' },
      { position: 'CAM', left: '45%', top: '50%' },
      { position: 'LW', left: '45%', top: '20%' },
      { position: 'ST', left: '48%', top: '50%' },
    ],
    mobile: [
      { position: 'GK', top: '5%', left: '50%', transform: 'translate(-50%, 0)' },
      { position: 'RB', top: '20%', left: '20%' },
      { position: 'CB1', top: '20%', left: '40%' },
      { position: 'CB2', top: '20%', left: '60%' },
      { position: 'LB', top: '20%', left: '80%' },
      { position: 'CDM1', top: '35%', left: '40%' },
      { position: 'CDM2', top: '35%', left: '60%' },
      { position: 'RW', top: '40%', left: '20%' },
      { position: 'CAM', top: '40%', left: '50%' },
      { position: 'LW', top: '40%', left: '80%' },
      { position: 'ST', top: '48%', left: '50%' },
    ],
  },
};

// Get formation positions
const getFormationPositions = (formation, isMobile) =>
  FORMATIONS[formation]?.[isMobile ? 'mobile' : 'desktop'] || FORMATIONS['4-3-3'][isMobile ? 'mobile' : 'desktop'];

// Render formation
const renderFormation = (team, isHomeTeam, isMobile, highlightedPlayer, highlightPlayer, side, goalAssistPairs) => {
  if (!team?.players?.length) return (
    <div className="absolute inset-0 flex items-center justify-center text-white">
      {isHomeTeam ? '홈' : '어웨이'} 팀 선수 데이터 없음
    </div>
  );

  // clone and transform coordinates, then mirror only the position key for away
  const positions = getFormationPositions(team.formation, isMobile).map(pos => {
    const newPos = { ...pos };
    if (!isMobile) {
      const leftValue = parseFloat(newPos.left) || 0;
      if (isHomeTeam) {
        newPos.left = `${Math.min(leftValue * 0.5, 48)}%`;
      } else {
        const reversedLeft = 100 - leftValue;
        newPos.left = leftValue === 5 ? '85%' : `${50 + (reversedLeft * 0.35)}%`;
      }
    } else {
      if (!isHomeTeam) {
        if (newPos.position === 'GK') newPos.top = '89%';
        else if (newPos.position.includes('CB') || newPos.position.includes('RB') || newPos.position.includes('LB'))
          newPos.top = '80%';
        else if (newPos.position.includes('CM') || newPos.position.includes('RM') || newPos.position.includes('LM'))
          newPos.top = '70%';
        else if (newPos.position.includes('ST') || newPos.position.includes('RW') || newPos.position.includes('LW'))
          newPos.top = '58%';
        else if (newPos.position === 'CAM') newPos.top = '62%';
        else if (newPos.position.includes('CDM')) newPos.top = '74%';
        else if (newPos.position === 'RWB' || newPos.position === 'LWB') newPos.top = '70%';
        newPos.left = `${100 - (parseFloat(newPos.left) || 0)}%`;
      }
    }
    if (!isHomeTeam) {
      newPos.position = MIRROR_POSITION[newPos.position] || newPos.position;
    }
    return newPos;
  });

  return team.players.map((player, i) => {
    const pos = positions.find(p => p.position === player.position) || positions[i % positions.length];
    const goals = goalAssistPairs?.filter(g => g.goal.player === player.name).length || 0;
    const assists = goalAssistPairs?.filter(a => a.assist.player === player.name).length || 0;

    return (
      <PlayerCard
        key={`${side}-${i}`}
        style={{ left: pos.left, top: pos.top, transform: pos.transform }}
        highlighted={highlightedPlayer?.name === player.name}
        highlightType={highlightedPlayer?.type}
        onClick={() => highlightPlayer(player.name, 'goal')}
      >
        <div className="avatar">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt={player.name} />
          ) : (
            <div className="avatar-placeholder">{player.position}</div>
          )}
        </div>
        <div className="number">{player.backNumber}</div>
        <div className="name">
          {player.name}
          {goals > 0 && <span className="goal-icon" style={{ marginLeft: '4px' }}>⚽{goals}</span>}
          {assists > 0 && <span className="assist-icon" style={{ marginLeft: '4px' }}>👟{assists}</span>}
        </div>
      </PlayerCard>
    );
  });
};

const DesktopFormation = ({ teams, highlightedPlayer, highlightPlayer, goalAssistPairs }) => {
  if (!teams || teams.length < 2) {
    return <div className="w-full h-full flex items-center justify-center text-white">팀 데이터 부족</div>;
  }
  return (
    <div className="w-full h-full grid grid-cols-2 relative">
      <div className="relative border-r border-white border-opacity-50">
        {renderFormation(teams[0], true, false, highlightedPlayer, highlightPlayer, 'home', goalAssistPairs)}
      </div>
      <div className="relative">
        {renderFormation(teams[1], false, false, highlightedPlayer, highlightPlayer, 'away', goalAssistPairs)}
      </div>
    </div>
  );
};

const MobileFormation = ({ teams, highlightedPlayer, highlightPlayer, goalAssistPairs }) => {
  if (!teams || teams.length < 2) {
    return <div className="w-full h-full flex items-center justify-center text-white">팀 데이터 부족</div>;
  }
  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-1">
        {renderFormation(teams[0], true, true, highlightedPlayer, highlightPlayer, 'home', goalAssistPairs)}
      </div>
      <div className="relative flex-1 border-t border-white border-opacity-50">
        {renderFormation(teams[1], false, true, highlightedPlayer, highlightPlayer, 'away', goalAssistPairs)}      </div>
    </div>
  );
};

const displayTeams = quarters => {
  if (!quarters?.length) return <span>팀 정보 없음</span>;
  const teamNames = quarters.reduce((acc, q) => {
    q.teams.forEach(t => { if (t.name && !acc.includes(t.name)) acc.push(t.name); });
    return acc;
  }, []);
  return teamNames.length ? (
    teamNames.map((name, i) => (
      <React.Fragment key={i}>
        <span className="font-bold">{name}</span>
        {i < teamNames.length - 1 && <span className="mx-2">VS</span>}
      </React.Fragment>
    ))
  ) : <span>팀 정보 없음</span>;
};

const calculateTotalScores = quarters => {
  const scores = quarters.reduce((acc, q) => {
    q.goalAssistPairs.forEach(p => {
      if (p.goal.team) acc[p.goal.team] = (acc[p.goal.team] || 0) + 1;
    });
    return acc;
  }, {});
  const teams = Object.keys(scores);
  const maxGoals = Math.max(...Object.values(scores));
  const winner = maxGoals > 0 ? teams.find(t => scores[t] === maxGoals) : null;
  return { scores, winner };
};

function VodPage() {
  const [matches, setMatches] = useState([]);
  const [filterDate, setFilterDate] = useState('all');
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState([]);
  const [openQuarters, setOpenQuarters] = useState({});
  const [highlightedPlayer, setHighlightedPlayer] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { fetchMatches(); }, []);
  useEffect(() => {
    setFiltered(filterDate === 'all' ? matches : matches.filter(m => m.date === filterDate));
  }, [filterDate, matches]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const { date, quarters = [] } = doc.data();
        return {
          id: doc.id,
          date,
          quarters: quarters.map(q => {
            const teams = (q.teams || []).map((t, ti) => {
              const players = (t.players || []).map(p => ({
                ...p,
                position: p.position || 'GK',
                goals: q.goalAssistPairs?.filter(g => g.goal.player === p.name).length || 0,
                assists: q.goalAssistPairs?.filter(a => a.assist.player === p.name).length || 0,
              }));
              return {
                name: t.name || `팀 ${String.fromCharCode(65 + ti)}`,
                formation: t.formation || '4-3-3',
                players
              };
            });
            return { teams, goalAssistPairs: q.goalAssistPairs || [] };
          })
        };
      });
      setMatches(data);
      setFiltered(data);
      setDates([...new Set(data.map(m => m.date))].sort().reverse());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleQuarter = (matchId, idx) => {
    setOpenQuarters(prev => ({ ...prev, [`${matchId}-${idx}`]: !prev[`${matchId}-${idx}`] }));
    setHighlightedPlayer(null);
  };

  const calculateScores = (pairs, teams) =>
    teams.map(t => ({ name: t.name, goals: pairs.filter(p => p.goal.team === t.name).length }));

  const highlightPlayer = (name, type) => setHighlightedPlayer({ name, type });

  return (
    <Container>
      <MainContent>
        <PageTitle>경기 기록</PageTitle>
        <FilterBar>
          <SelectWrapper>
            <select value={filterDate} onChange={e => setFilterDate(e.target.value)}>
              <option value="all">모든 날짜</option>
              {dates.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
            </select>
          </SelectWrapper>
        </FilterBar>

        {loading ? (
          <LoadingIndicator>로딩 중...</LoadingIndicator>
        ) : filtered.length ? filtered.map(match => {
          const { scores, winner } = calculateTotalScores(match.quarters);
          const scoreDisplay = Object.entries(scores).map(([team, goals]) => `${team}: ${goals}`).join(' vs ');
          const result = winner ? `(${winner} 승)` : '(무승부)';
          return (
            <MatchSection key={match.id}>
              <MatchHeader>
                <Badge type="home">{formatDate(match.date)}</Badge>
                <div className="team-info">{displayTeams(match.quarters)}</div>
                <div className="score-info">{`${scoreDisplay} ${result}`}</div>
              </MatchHeader>
              {match.quarters.map((q, i) => {
                const isOpen = openQuarters[`${match.id}-${i}`];
                const scores = calculateScores(q.goalAssistPairs, q.teams);
                return (
                  <QuarterSection key={i} className={isOpen ? 'open' : ''}>
                    <QuarterHeader onClick={() => toggleQuarter(match.id, i)} className={isOpen ? 'open' : ''}>
                      <span>쿼터 {i + 1}</span>
                      <ChevronIcon isOpen={isOpen} />
                    </QuarterHeader>
                    <QuarterContent className={isOpen ? 'open' : ''}>
                      <ScoreBox>
                        {scores.map((s, si) => (
                          <React.Fragment key={si}>
                            <div className={`team team-${si}`}>
                              {si === 0 ? (
                                <>
                                  <div className="name">{s.name}</div>
                                  <div className="score-value">{s.goals}</div>
                                </>
                              ) : (
                                <>
                                  <div className="score-value">{s.goals}</div>
                                  <div className="name">{s.name}</div>
                                </>
                              )}
                            </div>
                            {si < scores.length - 1 && <span className="separator">VS</span>}
                          </React.Fragment>
                        ))}
                      </ScoreBox>
                      <FieldContainer>
                        <FieldView>
                          <GoalArea className="top" />
                          <GoalArea className="bottom" />  
                          <PenaltyArea className="top" />  
                          <PenaltyArea className="bottom" />  
                          <GoalPost className="top" />  
                          <GoalPost className="bottom" />  
                          {isMobile ? (
                            <MobileFormation
                              teams={q.teams}
                              highlightedPlayer={highlightedPlayer}
                              highlightPlayer={highlightPlayer}
                              goalAssistPairs={q.goalAssistPairs}
                            />
                          ) : (
                            <DesktopFormation
                              teams={q.teams}
                              highlightedPlayer={highlightedPlayer}
                              highlightPlayer={highlightPlayer}
                              goalAssistPairs={q.goalAssistPairs}
                            />
                          )}
                        </FieldView>
                      </FieldContainer>
                      <TeamsContainer>
                        {q.teams.map((t, ti) => (
                          <TeamCard key={ti}>
                            <TeamName>
                              {t.name}
                              <Badge type={ti === 0 ? 'home' : 'away'} />
                            </TeamName>
                            <Formation>포메이션: {t.formation}</Formation>
                            <PlayersList>
                              {t.players.map((p, pi) => (
                                <PlayerItem key={pi}>
                                  <span className="number">{p.backNumber}</span>
                                  <span className="name">{p.name}</span>
                                  <span className="position">{p.position}</span>
                                </PlayerItem>
                              ))}  
                            </PlayersList>
                          </TeamCard>
                        ))}
                      </TeamsContainer>
                      <StatsList>
                        <StatTitle>공격 포인트</StatTitle>
                        {q.goalAssistPairs.length ? (
                          q.goalAssistPairs.map((p, pi) => (
                            <StatItem key={pi} onClick={() => highlightPlayer(p.goal.player, 'goal')}>
                              <StatValue>
                                <div>
                                  <span>골: {p.goal.player}</span>
                                  <span className="goal-icon">⚽</span>
                                </div>
                                <div>
                                  <span>어시: {p.assist.player || '없음'}</span>
                                  {p.assist.player && (
                                    <span
                                      className="assist-icon"
                                      onClick={e => { e.stopPropagation(); highlightPlayer(p.assist.player, 'assist'); }}
                                    >
                                      👟
                                    </span>
                                  )}
                                </div>
                              </StatValue>
                            </StatItem>
                          ))
                        ) : (
                          <EmptyState>골-어시 기록 없음</EmptyState>
                        )}
                      </StatsList>
                    </QuarterContent>
                  </QuarterSection>
                );
              })}
            </MatchSection>
          );
        }) : (
          <EmptyState>등록된 경기가 없습니다.</EmptyState>
        )}
      </MainContent>
    </Container>
  );
}

export default VodPage;
