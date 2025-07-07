import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../App';
import { format, subHours, isAfter } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as S from './LiveCss';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 포지션 한글 매핑
const POSITIONS = {
  GK: 'GK',
  RB: 'RB',
  LB: 'LB',
  CB: 'CB',
  CDM: 'CDM',
  CM: 'CM',
  CAM: 'CAM',
  LW: 'LW',
  RW: 'RW',
  ST: 'ST',
  FW: 'FW'
};

// 날짜 포맷팅 함수
const formatDate = dateString => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`;
};

// 시간 포맷팅 함수 (HH:mm)
const formatTime = date => {
  if (!date || isNaN(date.getTime())) return '';
  return format(date, 'HH:mm');
};

// 팀 이름 정규화
const normalizeTeamName = (name) => {
  return name ? name.trim().toLowerCase() : '';
};

// 전체 스코어 계산 함수 (VodPage.js 로직 기반)
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
            if (!teamStats[team.name]) {
                teamStats[team.name] = { goals: 0 };
            }
            teamStats[team.name].goals += quarterScores[team.name] || 0;
        });
    });

    const teams = Object.keys(teamStats);
    let winner = null;
    if (teams.length === 2) {
        const [team1, team2] = teams;
        if (teamStats[team1].goals > teamStats[team2].goals) {
            winner = team1;
        } else if (teamStats[team2].goals > teamStats[team1].goals) {
            winner = team2;
        }
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
    topPowerRanking: []
  });

  useEffect(() => {
    fetchLineups();
    setupCheerListener();
    fetchAllExistingPlayers();
  }, []);

  const fetchAllExistingPlayers = async () => {
    try {
      const playersSnap = await getDocs(collection(db, 'players'));
      const existingPlayerNicks = playersSnap.docs.map(doc => doc.id);
      setAllExistingPlayers(existingPlayerNicks);
    } catch (err) {
      console.error('Error fetching all existing players:', err.message);
    }
  };

  useEffect(() => {
    if (lineups.length > 0) {
      fetchMatches();
      const matchDate = lineups[0]?.date ? new Date(lineups[0].date) : null;
      if (matchDate && !isNaN(matchDate.getTime())) {
        const revealTime = subHours(matchDate, 8);
        setLineupRevealTime(revealTime);
      } else {
        console.log('유효한 경기 시간이 없음:', matchDate);
      }
    }
  }, [lineups]);

  useEffect(() => {
    if (allExistingPlayers.length > 0 && lineups.length > 0) {
      fetchCompetitionPoints();
    }
  }, [allExistingPlayers, lineups]);

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
          color: teamDoc.data().color || '#000000',
          date: teamDoc.data().date || '',
          players
        });
      }
      setLineups(lineupsData);

      if (lineupsData.length > 0) {
        await fetchCaptainStats(lineupsData.map(team => team.captain));
      }
    } catch (err) {
      console.error('라인업 가져오기 오류:', err.message, err.code);
      setError('라인업 불러오기 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const fetchCaptainStats = async (captains) => {
    try {
      const stats = {};
      for (const captain of captains) {
        if (!captain) continue;
        const playerRef = doc(db, 'players', captain);
        const playerDoc = await getDoc(playerRef);
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
            powerRanking: data.powerRanking || 0
          };
        } else {
          stats[captain] = { goals: 0, assists: 0, cleanSheets: 0, matches: 0, winRate: 0, win: 0, draw: 0, lose: 0, powerRanking: 0 };
        }
      }
      setCaptainStats(stats);
    } catch (err) {
      console.error('주장 통계 가져오기 오류:', err.message, err.code);
      setError('주장 통계 불러오기 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const fetchCompetitionPoints = async () => {
    try {
      const playersSnap = await getDocs(collection(db, 'players'));
      let playersData = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate powerRanking for each player based on Total.js's xG logic
      playersData = playersData.map((player) => {
        const matches = player.matches || 1;
        const normalizedGoals = (player.goals || 0) / matches;
        const normalizedAssists = (player.assists || 0) / matches;
        const normalizedCleanSheets = (player.cleanSheets || 0) / matches;
        const normalizedWinRate = (player.winRate || 0) / 100;
        const normalizedPoints = (player.personalPoints || 0) / matches;

        const calculatedPowerRanking =
          0.4 * normalizedGoals +
          0.3 * normalizedAssists +
          0.2 * normalizedCleanSheets +
          0.05 * normalizedWinRate +
          0.05 * normalizedPoints;

        return { ...player, powerRanking: calculatedPowerRanking };
      });

      // Normalize powerRanking to a 0-1 scale, similar to Total.js's xG
      const maxPowerRanking = Math.max(...playersData.map((p) => p.powerRanking), 1);
      playersData = playersData.map((player) => ({
        ...player,
        powerRanking: Math.min((player.powerRanking / maxPowerRanking), 1.0),
      }));

      const getTopN = (arr, key, n = 2, isHigherBetter = true) => {
        const sorted = [...arr].sort((a, b) => {
          if (isHigherBetter) return (b[key] || 0) - (a[key] || 0);
          return (a[key] || 0) - (b[key] || 0);
        });
        if (sorted.length < n) return sorted;
        const topPlayers = sorted.slice(0, n);
        const diff = Math.abs((topPlayers[0][key] || 0) - (topPlayers[1][key] || 0));
        if (diff <= 0.05 && key === 'powerRanking') { // Adjust diff threshold for powerRanking
          return topPlayers;
        } else if (diff <= 2 && key !== 'powerRanking') {
          return topPlayers;
        }
        return [];
      };

      const topGoalScorer = getTopN(playersData, 'goals');
      const topAssistProvider = getTopN(playersData, 'assists');
      const topWinRate = getTopN(playersData, 'winRate');
      const topCleanSheet = getTopN(playersData, 'cleanSheets');
      const topPowerRanking = getTopN(playersData, 'powerRanking');

      setCompetitionPoints({
        topGoalScorer,
        topAssistProvider,
        topWinRate,
        topCleanSheet,
        topPowerRanking
      });

    } catch (err) {
      console.error('관전 포인트 데이터 가져오기 오류:', err.message);
    }
  };

  const fetchMatches = async () => {
    try {
        const captains = lineups.map(team => team.captain).filter(Boolean);
        if (captains.length < 2) {
            setRecentMatches([]);
            setHeadToHeadStats({});
            return;
        }

        const matchesQuery = query(collection(db, 'matches'), orderBy('date', 'desc'));
        const matchesSnapshot = await getDocs(matchesQuery);

        const h2hStats = {};
        const captain1 = captains[0];
        const captain2 = captains[1];
        const pairKey = [captain1, captain2].sort().join('_vs_');

        h2hStats[pairKey] = {
            [captain1]: { wins: 0, draws: 0, losses: 0 },
            [captain2]: { wins: 0, draws: 0, losses: 0 },
            history: []
        };

        matchesSnapshot.docs.forEach(doc => {
            const match = doc.data();
            if (!match.quarters || match.quarters.length === 0) return;

            const matchParticipants = {};
            match.quarters[0].teams.forEach(team => {
                team.players.forEach(player => {
                    if (player.name === captain1 || player.name === captain2) {
                        matchParticipants[player.name] = team.name;
                    }
                });
            });

            if (matchParticipants[captain1] && matchParticipants[captain2] && matchParticipants[captain1] !== matchParticipants[captain2]) {
                const { teamStats, winner } = calculateTotalScores(match.quarters);
                const team1Name = matchParticipants[captain1];
                const team2Name = matchParticipants[captain2];
                const score1 = teamStats[team1Name]?.goals || 0;
                const score2 = teamStats[team2Name]?.goals || 0;

                let resultText = '';
                if (winner === team1Name) {
                    h2hStats[pairKey][captain1].wins++;
                    h2hStats[pairKey][captain2].losses++;
                    resultText = `${captain1} 승`;
                } else if (winner === team2Name) {
                    h2hStats[pairKey][captain2].wins++;
                    h2hStats[pairKey][captain1].losses++;
                    resultText = `${captain2} 승`;
                } else {
                    h2hStats[pairKey][captain1].draws++;
                    h2hStats[pairKey][captain2].draws++;
                    resultText = '무승부';
                }

                h2hStats[pairKey].history.push({
                    date: match.date,
                    result: resultText,
                    score: `${score1} : ${score2}`,
                    teams: [{ name: team1Name, score: score1 }, { name: team2Name, score: score2 }]
                });
            }
        });

        setHeadToHeadStats(h2hStats);
        const recent = h2hStats[pairKey]?.history.slice(0, 5) || [];
        setRecentMatches(recent);

    } catch (err) {
        console.error('경기 데이터 가져오기 오류:', err.message);
        setError('경기 기록 불러오기 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const setupCheerListener = () => {
    const matchId = `match_${format(new Date(), 'yyyyMMdd')}`;
    const cheerRef = doc(db, 'cheers', matchId);
    onSnapshot(cheerRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCheers(data.teams || []);
      } else {
        const defaultCheers = lineups.map(team => ({
          name: team.teamName,
          cheers: 0
        }));
        setCheers(defaultCheers);
      }
    }, (err) => {
      console.error('응원 데이터 리스너 오류:', err);
      setError('응원 데이터 불러오기 중 오류가 발생했습니다.');
    });
  };

  const cheerForTeam = async (teamName) => {
    const matchId = `match_${format(new Date(), 'yyyyMMdd')}`;
    const cheerRef = doc(db, 'cheers', matchId);
    try {
      const docSnap = await getDoc(cheerRef);
      const currentCheers = docSnap.exists() && docSnap.data().teams
        ? docSnap.data().teams
        : lineups.map(team => ({ name: team.teamName, cheers: 0 }));
      
      const updatedCheers = currentCheers.map(team =>
        team.name === teamName ? { ...team, cheers: (team.cheers || 0) + 1 } : team
      );
      
      await setDoc(cheerRef, { teams: updatedCheers }, { merge: true });
    } catch (err) {
      console.error('응원 처리 오류:', err);
      setError('응원 처리 중 오류가 발생했습니다.');
    }
  };

  const getGraphData = () => {
    if (lineups.length === 0 || !lineups.every(team => captainStats[team.captain])) {
      return null;
    }

    return {
      labels: ['골', '어시스트', '클린시트', '출장수'],
      datasets: lineups.map((team, index) => ({
        label: team.captain,
        data: [
          captainStats[team.captain].goals,
          captainStats[team.captain].assists,
          captainStats[team.captain].cleanSheets,
          captainStats[team.captain].matches
        ],
        backgroundColor: team.color + '80',
        borderColor: team.color,
        borderWidth: 1
      }))
    };
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 14 } }
      },
      title: { display: true, text: '주장 통계 비교', font: { size: 16 } }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  if (error) {
    return <S.ErrorMessage>{error}</S.ErrorMessage>;
  }

  if (lineups.length === 0) {
    return <S.Container>데이터를 불러오는 중입니다...</S.Container>;
  }

  const totalCheers = cheers.reduce((sum, team) => sum + (team.cheers || 0), 0);
  const cheerPercentages = cheers.map(team =>
    totalCheers ? ((team.cheers || 0) / totalCheers) * 100 : (100 / (cheers.length || 1))
  );

  const now = new Date();
  const isLineupVisible = lineupRevealTime && isAfter(now, lineupRevealTime);

  return (
    <S.Container>
      <S.MatchHeader>
        <h2>경기 라인업</h2>
      </S.MatchHeader>

      <S.MatchVS>
        {lineups.map((team, index) => (
          <React.Fragment key={index}>
            <S.TeamContainer>
              <S.TeamInfo>
                <S.TeamName>{team.teamName}</S.TeamName>
                <S.TeamStats>
                  {captainStats[team.captain] && (
                    <>{captainStats[team.captain].win}승 {captainStats[team.captain].draw}무 {captainStats[team.captain].lose}패</>
                  )}
                </S.TeamStats>
              </S.TeamInfo>
            </S.TeamContainer>
            {lineups.length === 2 && index === 0 && (
              <S.VSIndicator>
                <S.VSText>VS</S.VSText>
                <S.MatchDate>
                  {team.date && format(new Date(team.date), 'yyyy-MM-dd HH:mm')}
                </S.MatchDate>
              </S.VSIndicator>
            )}
          </React.Fragment>
        ))}
      </S.MatchVS>
      {lineups.length === 3 && (
        <S.MatchDateBelow>
          {lineups[0].date && format(new Date(lineups[0].date), 'yyyy-MM-dd HH:mm')}
        </S.MatchDateBelow>
      )}

      <S.CheerSection>
        <h3>응원하는 팀을 눌러주세요!</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {lineups.map((team, index) => (
            <S.CheerButton
              key={index}
              color={team.color}
              onClick={() => cheerForTeam(team.teamName)}
            >
              {team.teamName} 응원하기
            </S.CheerButton>
          ))}
        </div>
        <S.CheerGauge>
          {cheers.map((team, index) => (
            <S.GaugeBar
              key={index}
              color={lineups.find(t => t.teamName === team.name)?.color || '#000000'}
              width={`${cheerPercentages[index]}%`}
              percentage={cheerPercentages[index]}
            >
              <S.GaugeText percentage={cheerPercentages[index]}>
                {team.cheers || 0}
              </S.GaugeText>
            </S.GaugeBar>
          ))}
        </S.CheerGauge>
      </S.CheerSection>

      <S.Section>
        <S.SectionTitle>라인업</S.SectionTitle>
        {isLineupVisible ? (
          <S.LineupContainer style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {lineups.map((team, index) => (
              <S.TeamLineup key={index} hasBorder={index < lineups.length - 1}>
                <S.TeamLineupHeader>
                  {team.teamName}
                </S.TeamLineupHeader>
                <S.PlayerList>
                  {team.players.map((player, playerIndex) => (
                    <S.PlayerItem key={player.id} index={playerIndex}>
                      <S.PlayerName isCaptain={player.nick === team.captain}>
                        {player.nick}
                        {!allExistingPlayers.includes(player.nick) && (
                          <span style={{ marginLeft: '5px', color: '#FF4500', fontWeight: 'bold' }}>
                            (데뷔) 🔥
                          </span>
                        )}
                      </S.PlayerName>
                      <S.PlayerPosition>{POSITIONS[player.position]}</S.PlayerPosition>
                    </S.PlayerItem>
                  ))}
                </S.PlayerList>
              </S.TeamLineup>
            ))}
          </S.LineupContainer>
        ) : (
          <S.LineupMessage>
            {lineupRevealTime ? `${formatTime(lineupRevealTime)} 라인업 공개 예정입니다.` : '라인업 공개 시간이 설정되지 않았습니다.'}
          </S.LineupMessage>
        )}
      </S.Section>

      {lineups.length > 0 && Object.keys(captainStats).length > 0 && (
        <S.Section>
          <S.SectionTitle>주장 비교</S.SectionTitle>
          <S.StatsSection>
            <S.StatRow>
              {lineups.map((team, index) => (
                <S.TeamStatValue key={index} isTeamA={index === 0} color={team.color}>
                  {captainStats[team.captain]?.goals || 0}
                </S.TeamStatValue>
              ))}
              <S.StatLabel>골</S.StatLabel>
            </S.StatRow>
            <S.StatRow>
              {lineups.map((team, index) => (
                <S.TeamStatValue key={index} isTeamA={index === 0} color={team.color}>
                  {captainStats[team.captain]?.assists || 0}
                </S.TeamStatValue>
              ))}
              <S.StatLabel>어시스트</S.StatLabel>
            </S.StatRow>
            <S.StatRow>
              {lineups.map((team, index) => (
                <S.TeamStatValue key={index} isTeamA={index === 0} color={team.color}>
                  {captainStats[team.captain]?.cleanSheets || 0}
                </S.TeamStatValue>
              ))}
              <S.StatLabel>클린시트</S.StatLabel>
            </S.StatRow>
            <S.StatRow>
              {lineups.map((team, index) => (
                <S.TeamStatValue key={index} isTeamA={index === 0} color={team.color}>
                  {captainStats[team.captain]?.matches || 0}
                </S.TeamStatValue>
              ))}
              <S.StatLabel>출장수</S.StatLabel>
            </S.StatRow>
            <S.StatRow>
              {lineups.map((team, index) => (
                <S.TeamStatValue key={index} isTeamA={index === 0} color={team.color}>
                  {captainStats[team.captain]?.winRate || 0}%
                </S.TeamStatValue>
              ))}
              <S.StatLabel>승률</S.StatLabel>
            </S.StatRow>
            <S.ChartContainer>
              <Bar data={getGraphData()} options={graphOptions} />
            </S.ChartContainer>
          </S.StatsSection>
        </S.Section>
      )}

      <S.Section>
        <S.SectionTitle>관전 포인트</S.SectionTitle>
        <S.CompetitionPointsContainer>
          {competitionPoints.topGoalScorer.length > 1 && (
            <S.CompetitionItem>
              <S.CompetitionTitle>득점왕 경쟁</S.CompetitionTitle>
              <S.CompetitionDetail>
                {competitionPoints.topGoalScorer[0].id} {competitionPoints.topGoalScorer[0].goals}골 vs {competitionPoints.topGoalScorer[1].id} {competitionPoints.topGoalScorer[1].goals}골
              </S.CompetitionDetail>
            </S.CompetitionItem>
          )}
          {competitionPoints.topAssistProvider.length > 1 && (
            <S.CompetitionItem>
              <S.CompetitionTitle>도움왕 경쟁</S.CompetitionTitle>
              <S.CompetitionDetail>
                {competitionPoints.topAssistProvider[0].id} {competitionPoints.topAssistProvider[0].assists}도움 vs {competitionPoints.topAssistProvider[1].id} {competitionPoints.topAssistProvider[1].assists}도움
              </S.CompetitionDetail>
            </S.CompetitionItem>
          )}
          {competitionPoints.topWinRate.length > 1 && (
            <S.CompetitionItem>
              <S.CompetitionTitle>승률 1위 유지</S.CompetitionTitle>
              <S.CompetitionDetail>
                {competitionPoints.topWinRate[0].id} {competitionPoints.topWinRate[0].winRate}% vs {competitionPoints.topWinRate[1].id} {competitionPoints.topWinRate[1].winRate}%
              </S.CompetitionDetail>
            </S.CompetitionItem>
          )}
          {competitionPoints.topCleanSheet.length > 1 && (
            <S.CompetitionItem>
              <S.CompetitionTitle>클린시트 경쟁</S.CompetitionTitle>
              <S.CompetitionDetail>
                {competitionPoints.topCleanSheet[0].id} {competitionPoints.topCleanSheet[0].cleanSheets}클린시트 vs {competitionPoints.topCleanSheet[1].id} {competitionPoints.topCleanSheet[1].cleanSheets}클린시트
              </S.CompetitionDetail>
            </S.CompetitionItem>
          )}
          {competitionPoints.topPowerRanking.length > 1 && (
            <S.CompetitionItem>
              <S.CompetitionTitle>파워랭킹 경쟁</S.CompetitionTitle>
              <S.CompetitionDetail>
                {competitionPoints.topPowerRanking[0].id} {competitionPoints.topPowerRanking[0].powerRanking}점 vs {competitionPoints.topPowerRanking[1].id} {competitionPoints.topPowerRanking[1].powerRanking}점
              </S.CompetitionDetail>
            </S.CompetitionItem>
          )}
          {Object.values(competitionPoints).every(arr => arr.length < 2) && (
            <S.NoCompetitionMessage>현재 치열한 경쟁이 없습니다.</S.NoCompetitionMessage>
          )}
        </S.CompetitionPointsContainer>
      </S.Section>

      {lineups.length > 1 && (
        <S.Section>
          <S.PreviousMatchesTitle>최근 5경기 맞대결</S.PreviousMatchesTitle>
          {Object.values(headToHeadStats).map((stats, index) => {
              const captain1Name = Object.keys(stats).find(k => k !== 'history');
              const captain2Name = Object.keys(stats).find(k => k !== 'history' && k !== captain1Name);
              if (!captain1Name || !captain2Name) return null;
              const captain1Stats = stats[captain1Name];
              const captain2Stats = stats[captain2Name];

              return (
                  <S.HeadToHead key={index}>
                      <S.HeadToHeadTitle>상대 전적</S.HeadToHeadTitle>
                      <S.HeadToHeadStats>
                          <S.HeadToHeadTeam>
                              {captain1Name} {captain1Stats.wins}승 {captain1Stats.draws}무 {captain1Stats.losses}패
                          </S.HeadToHeadTeam>
                          <S.HeadToHeadVS>vs</S.HeadToHeadVS>
                          <S.HeadToHeadTeam>
                              {captain2Name} {captain2Stats.wins}승 {captain2Stats.draws}무 {captain2Stats.losses}패
                          </S.HeadToHeadTeam>
                      </S.HeadToHeadStats>
                  </S.HeadToHead>
              );
          })}
          <S.MatchList>
            {recentMatches.length > 0 ? recentMatches.map((match, index) => (
              <S.MatchItem key={index}>
                <S.MatchTeams>
                  {match.result} ({match.score})
                </S.MatchTeams>
                <S.MatchInfo>
                  <S.MatchDateInfo>{formatDate(match.date)}</S.MatchDateInfo>
                </S.MatchInfo>
              </S.MatchItem>
            )) : (
              <S.MatchItem>
                <S.MatchTeams>맞대결 기록이 없습니다.</S.MatchTeams>
              </S.MatchItem>
            )}
          </S.MatchList>
        </S.Section>
      )}
    </S.Container>
  );
};

export default Live;
