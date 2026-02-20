import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../App';
import { format, subHours, isAfter } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as S from './LiveCss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const POSITIONS = {
  GK: '골키퍼',
  CB: '수비수',
  CDM: '수비형 미드필더',
  CM: '중앙 미드필더',
  CAM: '공격형 미드필더',
  LW: '왼쪽 윙어',
  RW: '오른쪽 윙어',
  ST: '스트라이커',
  FW: '공격수'
};

const formatDate = (dateString, display = false) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  if (!display) {
    const kstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const year = kstDate.getFullYear();
    const month = String(kstDate.getMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
  return format(date, 'yyyy-MM-dd HH:mm');
};

const normalizeTeamName = (name) => name ? name.trim().toLowerCase() : '';

const calculateTotalScores = (quarters) => {
  const teamStats = {};
  quarters.forEach(q => {
    if (!q.teams) return;
    const quarterScores = {};
    q.teams.forEach(team => {
      const teamName = team.name;
      const normalizedTeamName = normalizeTeamName(teamName);
      const goals = (q.goalAssistPairs?.filter(p => normalizeTeamName(p.goal.team) === normalizedTeamName).length || 0);
      const opponentTeam = q.teams.find(t => normalizeTeamName(t.name) !== normalizedTeamName);
      const ownGoalsFor = opponentTeam ? (q.ownGoals?.filter(og => normalizeTeamName(og.team) === normalizeTeamName(opponentTeam.name)).length || 0) : 0;
      quarterScores[teamName] = goals + ownGoalsFor;
    });

    q.teams.forEach(team => {
      if (!teamStats[team.name]) teamStats[team.name] = { goals: 0 };
      teamStats[team.name].goals += quarterScores[team.name] || 0;
    });
  });

  const teams = Object.keys(teamStats);
  let winner = null;
  if (teams.length === 2) {
    const [team1, team2] = teams;
    if (teamStats[team1].goals > teamStats[team2].goals) winner = team1;
    else if (teamStats[team2].goals > teamStats[team1].goals) winner = team2;
  }
  return { teamStats, winner };
};

const Live = () => {
  const [lineups, setLineups] = useState([]);
  const [captainStats, setCaptainStats] = useState({});
  const [recentMatches, setRecentMatches] = useState([]);
  const [headToHeadStats, setHeadToHeadStats] = useState({});
  const [error, setError] = useState('');
  const [cheers, setCheers] = useState([]);
  const [lineupRevealTime, setLineupRevealTime] = useState(null);
  const [allExistingPlayers, setAllExistingPlayers] = useState([]);
  const [competitionPoints, setCompetitionPoints] = useState({
    topGoalScorer: [],
    topAssistProvider: [],
    topWinRate: [],
    topCleanSheet: [],
    topPowerRanking: [],
    topAttackPoints: [],
    topMomCount: [],
  });
  const [loading, setLoading] = useState(true);
  const [previousCheers, setPreviousCheers] = useState([]);
  const [activeTeasers, setActiveTeasers] = useState({}); // { teaserTeamName: { victimCaptain: string, timestamp: number } }

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        fetchLineups(),
        fetchAllExistingPlayers()
      ]);
      setLoading(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    if (lineups.length > 0) {
      fetchMatches();
      setupCheerListener();
      const matchDate = lineups[0]?.date ? new Date(lineups[0].date) : null;
      if (matchDate && !isNaN(matchDate.getTime())) {
        const revealTime = subHours(matchDate, 8);
        setLineupRevealTime(revealTime);
      }
    }
  }, [lineups]);

  useEffect(() => {
    if (allExistingPlayers.length > 0 && lineups.length > 0) {
      fetchCompetitionPoints();
    }
  }, [allExistingPlayers, lineups]);

  const fetchAllExistingPlayers = async () => {
    try {
      const playersSnap = await getDocs(collection(db, 'players'));
      const existingPlayerNicks = playersSnap.docs.map(doc => doc.id);
      setAllExistingPlayers(existingPlayerNicks);
    } catch (err) {
      console.error('Error fetching players:', err.message);
    }
  };

  const fetchLineups = async () => {
    try {
      const q = query(collection(db, 'live'), orderBy('date', 'desc'));
      const teamsSnap = await getDocs(q);
      const lineupsData = [];
      for (const teamDoc of teamsSnap.docs) {
        const playersSnap = await getDocs(collection(db, 'live', teamDoc.id, 'players'));
        const players = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        lineupsData.push({
          teamName: teamDoc.id,
          captain: teamDoc.data().captain || '',
          color: teamDoc.data().color || '#3182f6',
          date: teamDoc.data().date || '',
          players
        });
      }
      setLineups(lineupsData);
      if (lineupsData.length > 0) fetchCaptainStats(lineupsData.map(team => team.captain));
    } catch (err) {
      setError('라인업 정보를 불러올 수 없습니다.');
    }
  };

  const fetchCaptainStats = async (captains) => {
    const stats = {};
    for (const captain of captains) {
      if (!captain) continue;
      const playerDoc = await getDoc(doc(db, 'players', captain));
      if (playerDoc.exists()) {
        const data = playerDoc.data();
        stats[captain] = {
          goals: data.goals || 0,
          assists: data.assists || 0,
          cleanSheets: data.cleanSheets || 0,
          matches: data.matches || 0,
          winRate: data.winRate || 0,
          win: data.win || 0,
          draw: data.draw || 0,
          lose: data.lose || 0,
          powerRanking: data.momScore || 0,
          attackPoints: (data.goals || 0) + (data.assists || 0),
          momTop3Count: data.momTop3Count || 0
        };
      }
    }
    setCaptainStats(stats);
  };

  const fetchCompetitionPoints = async () => {
    const lineupPlayerNicks = lineups.flatMap(team => team.players.map(player => player.nick));
    const playersSnap = await getDocs(collection(db, 'players'));
    let playersData = playersSnap.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        attackPoints: (doc.data().goals || 0) + (doc.data().assists || 0),
        powerRanking: doc.data().momScore || 0,
        momTop3Count: doc.data().momTop3Count || 0
      }))
      .filter(player => lineupPlayerNicks.includes(player.id));

    const getTopN = (arr, key, isHigherBetter = true) => {
      const sorted = [...arr].sort((a, b) => isHigherBetter ? (b[key] || 0) - (a[key] || 0) : (a[key] || 0) - (b[key] || 0));
      if (sorted.length === 0) return [];

      const topPlayers = sorted.slice(0, 2).map(p => ({ ...p, value: p[key] || 0 }));
      if (topPlayers.length === 2) {
        const diff = Math.abs(topPlayers[0].value - topPlayers[1].value);
        const threshold = key === 'powerRanking' ? 0.05 : (key === 'momTop3Count' ? 1 : 2);
        topPlayers[0].isHot = diff <= threshold;
      }
      return topPlayers;
    };

    setCompetitionPoints({
      topGoalScorer: getTopN(playersData, 'goals'),
      topAssistProvider: getTopN(playersData, 'assists'),
      topWinRate: getTopN(playersData, 'winRate'),
      topCleanSheet: getTopN(playersData, 'cleanSheets'),
      topPowerRanking: getTopN(playersData, 'powerRanking'),
      topAttackPoints: getTopN(playersData, 'attackPoints'),
      topMomCount: getTopN(playersData, 'momTop3Count')
    });
  };

  const fetchMatches = async () => {
    const captains = lineups.map(team => team.captain).filter(Boolean);
    if (captains.length < 2) return;

    const matchesSnapshot = await getDocs(query(collection(db, 'matches'), orderBy('date', 'desc')));
    const h2hStats = {};
    const [c1, c2] = captains;
    const pairKey = [c1, c2].sort().join('_vs_');

    h2hStats[pairKey] = { [c1]: { wins: 0, draws: 0, losses: 0 }, [c2]: { wins: 0, draws: 0, losses: 0 }, history: [] };

    matchesSnapshot.docs.forEach(doc => {
      const match = doc.data();
      if (!match.quarters?.length) return;
      const participants = {};
      match.quarters[0].teams.forEach(t => t.players.forEach(p => {
        if (p.name === c1 || p.name === c2) participants[p.name] = t.name;
      }));

      if (participants[c1] && participants[c2] && participants[c1] !== participants[c2]) {
        const { teamStats, winner } = calculateTotalScores(match.quarters);
        const s1 = teamStats[participants[c1]]?.goals || 0;
        const s2 = teamStats[participants[c2]]?.goals || 0;
        if (winner === participants[c1]) { h2hStats[pairKey][c1].wins++; h2hStats[pairKey][c2].losses++; }
        else if (winner === participants[c2]) { h2hStats[pairKey][c2].wins++; h2hStats[pairKey][c1].losses++; }
        else { h2hStats[pairKey][c1].draws++; h2hStats[pairKey][c2].draws++; }

        h2hStats[pairKey].history.push({
          date: match.date,
          score: `${s1} : ${s2}`,
          teams: [{ name: participants[c1], score: s1, captain: c1 }, { name: participants[c2], score: s2, captain: c2 }],
          winner: winner === participants[c1] ? c1 : winner === participants[c2] ? c2 : null
        });
      }
    });

    setHeadToHeadStats(h2hStats);
    setRecentMatches(h2hStats[pairKey]?.history.slice(0, 5) || []);
  };

  const setupCheerListener = () => {
    const matchId = `match_${format(new Date(), 'yyyyMMdd')}`;
    return onSnapshot(doc(db, 'cheers', matchId), (docSnap) => {
      if (docSnap.exists()) {
        const newData = docSnap.data().teams || [];

        setPreviousCheers(prev => {
          if (prev.length > 0) {
            newData.forEach(team => {
              const oldTeam = prev.find(p => p.name === team.name);
              const otherTeams = newData.filter(o => o.name !== team.name);

              otherTeams.forEach(other => {
                const oldOther = prev.find(p => p.name === other.name);
                if (oldTeam && oldOther) {
                  // If team was behind/equal to other and now is strictly ahead
                  if (oldTeam.cheers <= oldOther.cheers && team.cheers > other.cheers) {
                    const victimCaptain = lineups.find(l => l.teamName === other.name)?.captain;
                    if (victimCaptain) {
                      setActiveTeasers(teasers => ({
                        ...teasers,
                        [team.name]: { victimCaptain, id: Date.now() }
                      }));
                      // Automatically remove after 1.5 seconds
                      setTimeout(() => {
                        setActiveTeasers(teasers => {
                          const next = { ...teasers };
                          delete next[team.name];
                          return next;
                        });
                      }, 1500);
                    }
                  }
                }
              });
            });
          }
          return newData;
        });
        setCheers(newData);
      } else {
        const initial = lineups.map(t => ({ name: t.teamName, cheers: 0 }));
        setCheers(initial);
        setPreviousCheers(initial);
      }
    });
  };

  const cheerForTeam = async (teamName) => {
    const matchId = `match_${format(new Date(), 'yyyyMMdd')}`;
    const docRead = await getDoc(doc(db, 'cheers', matchId));
    let current = docRead.exists() ? docRead.data().teams : lineups.map(t => ({ name: t.teamName, cheers: 0 }));
    const updated = current.map(t => t.name === teamName ? { ...t, cheers: (t.cheers || 0) + 1 } : t);
    await setDoc(doc(db, 'cheers', matchId), { teams: updated }, { merge: true });
  };

  const getGraphData = () => {
    if (!lineups.length || !lineups.every(t => captainStats[t.captain])) return null;
    return {
      labels: ['골', '도움', '클린시트', '출장수'],
      datasets: lineups.map(t => ({
        label: t.captain,
        data: [captainStats[t.captain].goals, captainStats[t.captain].assists, captainStats[t.captain].cleanSheets, captainStats[t.captain].matches],
        backgroundColor: t.color + 'cc',
        borderColor: t.color,
        borderWidth: 0,
        borderRadius: 8
      }))
    };
  };

  if (loading) return <S.Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</S.Container>;

  const totalCheers = cheers.reduce((sum, t) => sum + (t.cheers || 0), 0);
  const isLineupVisible = lineupRevealTime && isAfter(new Date(), lineupRevealTime);

  return (
    <S.Container>
      <S.GlobalFontStyle />
      <S.MatchHeader>
        <h2>경기 라인업</h2>
        <p>오늘의 매치업과 실시간 선수 명단을 확인하세요.</p>
      </S.MatchHeader>

      <S.MatchVS>
        {lineups.map((team, idx) => (
          <React.Fragment key={idx}>
            <S.TeamContainer>
              <S.TeamInfo>
                <S.TeamName>{team.teamName}</S.TeamName>
                <S.TeamStats>
                  {captainStats[team.captain] && `${captainStats[team.captain].win}승 ${captainStats[team.captain].draw}무 ${captainStats[team.captain].lose}패`}
                </S.TeamStats>
              </S.TeamInfo>
            </S.TeamContainer>
            {lineups.length === 2 && idx === 0 && (
              <S.VSIndicator>
                <S.VSText>VS</S.VSText>
                <S.MatchDate>{formatDate(team.date, true)}</S.MatchDate>
              </S.VSIndicator>
            )}
          </React.Fragment>
        ))}
      </S.MatchVS>

      <S.CheerSection>
        <h3>어느 팀이 승리할까요?</h3>

        <S.CheerConfrontation>
          {lineups.map((team, i) => {
            const cheerData = cheers.find(c => c.name === team.teamName);
            const pct = totalCheers ? (cheerData?.cheers / totalCheers) : (1 / (lineups.length || 1));
            const teaser = activeTeasers[team.teamName];

            return (
              <S.CaptainCheerWrapper key={i}>
                {teaser && (
                  <S.SpeechBubble>
                    <span>{teaser.victimCaptain}</span> 따잇!!
                  </S.SpeechBubble>
                )}
                <S.CaptainAvatar scale={pct} color={team.color}>
                  <img src={`/players/${team.captain}.png`} onError={e => e.target.src = '/profile_default.svg'} alt={team.captain} />
                </S.CaptainAvatar>
                <S.CaptainCheerName>{team.captain}</S.CaptainCheerName>
                <S.CheerButton color={team.color} onClick={() => cheerForTeam(team.teamName)}>
                  응원하기
                </S.CheerButton>
              </S.CaptainCheerWrapper>
            );
          })}
        </S.CheerConfrontation>

        <S.CheerGauge>
          {cheers.map((t, i) => {
            const pct = totalCheers ? (t.cheers / totalCheers) * 100 : 100 / (cheers.length || 1);
            return (
              <S.GaugeBar key={i} color={lineups.find(u => u.teamName === t.name)?.color || '#e5e8eb'} width={`${pct}%`}>
                <S.GaugeText percentage={pct}>{Math.round(pct)}%</S.GaugeText>
              </S.GaugeBar>
            );
          })}
        </S.CheerGauge>
      </S.CheerSection>

      <S.Section>
        <S.SectionTitle>매치 라인업</S.SectionTitle>
        {isLineupVisible ? (
          <S.LineupContainer>
            {lineups.map((team, i) => (
              <S.TeamLineup key={i}>
                <S.TeamLineupHeader>{team.teamName}</S.TeamLineupHeader>
                <S.PlayerGrid>
                  {team.players.map(p => (
                    <S.PlayerCard key={p.id}>
                      {p.nick === team.captain && <S.CaptainBadge>C</S.CaptainBadge>}
                      <S.PlayerImage src={`/players/${p.nick}.png`} onError={e => e.target.src = '/profile_default.svg'} />
                      <S.PlayerName>
                        {p.nick}
                        {!allExistingPlayers.includes(p.nick) && <span className="debut">NEW</span>}
                      </S.PlayerName>
                      <S.PlayerPosition>{POSITIONS[p.position] || p.position}</S.PlayerPosition>
                    </S.PlayerCard>
                  ))}
                </S.PlayerGrid>
              </S.TeamLineup>
            ))}
          </S.LineupContainer>
        ) : (
          <S.LineupMessage>
            라인업은 경기 8시간 전인 {lineupRevealTime ? formatDate(lineupRevealTime, true) : '--:--'}에 공개됩니다.
          </S.LineupMessage>
        )}
      </S.Section>

      {lineups.length > 1 && (
        <S.Section>
          <S.SectionTitle>주장 커리어 비교</S.SectionTitle>
          <S.StatsSection>
            {['goals', 'assists', 'cleanSheets', 'matches', 'winRate'].map((key, i) => (
              <S.StatRow key={i}>
                <S.StatLabel>
                  {key === 'goals' ? '골' : key === 'assists' ? '도움' : key === 'cleanSheets' ? '클린시트' : key === 'matches' ? '출장수' : '승률'}
                </S.StatLabel>
                {lineups.map((team, idx) => {
                  const val = captainStats[team.captain]?.[key] || 0;
                  return (
                    <S.TeamStatValue key={idx} color={team.color}>
                      {key === 'winRate' ? Math.round(val) : val}{key === 'winRate' ? '%' : ''}
                    </S.TeamStatValue>
                  );
                })}
              </S.StatRow>
            ))}
            {getGraphData() && (
              <S.ChartContainer>
                <Bar data={getGraphData()} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
                }} />
              </S.ChartContainer>
            )}
          </S.StatsSection>
        </S.Section>
      )}

      <S.Section>
        <S.SectionTitle>주요 매치업 포인트</S.SectionTitle>
        <S.CompetitionPointsContainer>
          {Object.entries({
            '득점왕 경쟁': competitionPoints.topGoalScorer,
            '도움왕 경쟁': competitionPoints.topAssistProvider,
            '공격포인트 경쟁': competitionPoints.topAttackPoints,
            '승률 1위 유지': competitionPoints.topWinRate,
            '클린시트 경쟁': competitionPoints.topCleanSheet,
            '파워랭킹 경쟁': competitionPoints.topPowerRanking,
            'MOM 최다': competitionPoints.topMomCount
          }).map(([title, pts], i) => pts.length > 0 && (
            <S.CompetitionItem key={i}>
              <S.CompetitionTitle>
                {title} {pts[0]?.isHot && <span>HOT</span>}
              </S.CompetitionTitle>
              <S.CompetitionDetail>
                <div className="player">
                  <img src={`/players/${pts[0].id}.png`} onError={e => e.target.src = '/profile_default.svg'} alt="" />
                  <div className="info">
                    <div className="nick">{pts[0].id}</div>
                    <div className="score">
                      {pts[0].value.toFixed(pts[0].powerRanking ? 1 : 0)}
                      {title.includes('승률') ? '%' : ''}
                    </div>
                  </div>
                </div>
                {pts.length === 2 ? (
                  <>
                    <div className="vs">VS</div>
                    <div className="player">
                      <div className="info" style={{ textAlign: 'right' }}>
                        <div className="nick">{pts[1].id}</div>
                        <div className="score">
                          {pts[1].value.toFixed(pts[1].powerRanking ? 1 : 0)}
                          {title.includes('승률') ? '%' : ''}
                        </div>
                      </div>
                      <img src={`/players/${pts[1].id}.png`} onError={e => e.target.src = '/profile_default.svg'} alt="" />
                    </div>
                  </>
                ) : (
                  <div className="info" style={{ textAlign: 'right' }}>
                    <div className="score" style={{ color: '#3182f6', fontSize: '18px', fontWeight: '800' }}>RANK 1</div>
                  </div>
                )}
              </S.CompetitionDetail>
            </S.CompetitionItem>
          ))}
        </S.CompetitionPointsContainer>
      </S.Section>

      {recentMatches.length > 0 && (
        <S.Section>
          <S.SectionTitle>상대 전적 (최근 5경기)</S.SectionTitle>
          <S.HeadToHead>
            <S.HeadToHeadTitle>통산 기록</S.HeadToHeadTitle>
            <S.HeadToHeadStats>
              <S.HeadToHeadTeam>
                <div className="name">{lineups[0].captain}</div>
                <div className="record">{headToHeadStats[Object.keys(headToHeadStats)[0]]?.[lineups[0].captain]?.wins}승</div>
              </S.HeadToHeadTeam>
              <S.HeadToHeadVS>VS</S.HeadToHeadVS>
              <S.HeadToHeadTeam>
                <div className="name">{lineups[1]?.captain}</div>
                <div className="record">{headToHeadStats[Object.keys(headToHeadStats)[0]]?.[lineups[1]?.captain]?.wins}승</div>
              </S.HeadToHeadTeam>
            </S.HeadToHeadStats>
          </S.HeadToHead>
          <S.MatchList>
            {recentMatches.map((m, i) => (
              <S.MatchItem key={i}>
                <S.MatchInfo>{formatDate(m.date, true).split(' ')[0]}</S.MatchInfo>
                <S.MatchTeams>
                  <span className={m.winner === m.teams[0].captain ? 'winner' : ''}>{m.teams[0].captain}</span>
                  <S.MatchScore>{m.score}</S.MatchScore>
                  <span className={m.winner === m.teams[1].captain ? 'winner' : ''}>{m.teams[1].captain}</span>
                </S.MatchTeams>
              </S.MatchItem>
            ))}
          </S.MatchList>
        </S.Section>
      )}
    </S.Container>
  );
};

export default Live;