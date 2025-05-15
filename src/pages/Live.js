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
  GK: '골키퍼',
  CB: '중앙 수비수',
  MF: '미드필더',
  FW: '공격수'
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

const Live = () => {
  const [lineups, setLineups] = useState([]);
  const [captainStats, setCaptainStats] = useState({});
  const [recentMatches, setRecentMatches] = useState([]);
  const [headToHeadStats, setHeadToHeadStats] = useState({ captainA: { wins: 0, draws: 0, losses: 0 }, captainB: { wins: 0, draws: 0, losses: 0 } });
  const [error, setError] = useState('');
  const [cheers, setCheers] = useState({ teamA: { cheers: 0 }, teamB: { cheers: 0 } });
  const [lineupRevealTime, setLineupRevealTime] = useState(null);

  useEffect(() => {
    fetchLineups();
    setupCheerListener();
  }, []);

  useEffect(() => {
    if (lineups.length >= 2) {
      fetchMatches();
      // 라인업 공개 시간 계산
      const matchDate = lineups[0]?.date ? new Date(lineups[0].date) : null;
      if (matchDate && !isNaN(matchDate.getTime())) {
        const revealTime = subHours(matchDate, 4); // 경기 시간 4시간 전
        setLineupRevealTime(revealTime);
        console.log('라인업 공개 시간:', formatTime(revealTime), '현재 시간:', formatTime(new Date()));
      } else {
        console.log('유효한 경기 시간이 없음:', matchDate);
      }
    }
  }, [lineups]);

  // 라인업 데이터 가져오기
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
      setLineups(lineupsData.slice(0, 2));
      console.log('가져온 라인업:', lineupsData);

      if (lineupsData.length >= 2) {
        await fetchCaptainStats(lineupsData[0].captain, lineupsData[1].captain);
      }
    } catch (err) {
      console.error('라인업 가져오기 오류:', err.message, err.code);
      setError('라인업 불러오기 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // 주장 통계 가져오기
  const fetchCaptainStats = async (captainA, captainB) => {
    try {
      const stats = {};
      for (const captain of [captainA, captainB]) {
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
            lose: data.lose || 0
          };
        } else {
          stats[captain] = { goals: 0, assists: 0, cleanSheets: 0, matches: 0, winRate: 0, win: 0, draw: 0, lose: 0 };
        }
      }
      setCaptainStats(stats);
      console.log('주장 통계:', stats);
    } catch (err) {
      console.error('주장 통계 가져오기 오류:', err.message, err.code);
      setError('주장 통계 불러오기 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // 최근 경기 데이터 및 상대 전적 가져오기
  const fetchMatches = async () => {
    try {
      const captainA = lineups[0]?.captain;
      const captainB = lineups[1]?.captain;
      if (!captainA || !captainB) {
        setRecentMatches([]);
        setHeadToHeadStats({ captainA: { wins: 0, draws: 0, losses: 0 }, captainB: { wins: 0, draws: 0, losses: 0 } });
        console.log('주장이 없어 경기 데이터를 가져오지 않음:', { captainA, captainB });
        return;
      }

      console.log('주장 확인:', { captainA, captainB });

      const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const matchesData = [];
      const headToHead = { captainA: { wins: 0, draws: 0, losses: 0 }, captainB: { wins: 0, draws: 0, losses: 0 } };

      for (const matchDoc of snap.docs) {
        const match = matchDoc.data();
        const { date, quarters } = match;
        console.log(`경기 데이터 확인 (날짜: ${date}):`, match);

        if (!quarters || !Array.isArray(quarters) || quarters.length < 4) {
          console.log(`경기 스킵: 쿼터 부족 (quarters: ${quarters?.length})`);
          continue;
        }

        let hasBothCaptains = false;
        let isCaptainASideA = true; // 주장 A가 팀 A인지 추적
        const quarterScores = Array(4).fill().map(() => ({ teamA: 0, teamB: 0 }));
        let totalTeamAGoals = 0;
        let totalTeamBGoals = 0;
        let teamAName = '';
        let teamBName = '';

        // 1-4쿼터 확인
        for (let i = 0; i < Math.min(4, quarters.length); i++) {
          const quarter = quarters[i];
          if (!quarter || !quarter.teams || quarter.teams.length < 2) {
            console.log(`쿼터 ${i + 1} 스킵: 팀 데이터 부족`, quarter);
            continue;
          }

          const teamA = quarter.teams[0];
          const teamB = quarter.teams[1];
          if (!teamA.players || !teamB.players) {
            console.log(`쿼터 ${i + 1} 스킵: 선수 데이터 없음`);
            continue;
          }

          // 첫 쿼터에서 팀 이름 저장
          if (i === 0) {
            teamAName = teamA.name || 'Team A';
            teamBName = teamB.name || 'Team B';
            console.log(`팀 이름 설정: ${teamAName} vs ${teamBName}`);
          }

          // 주장 존재 확인
          const teamACaptain = teamA.players.some(p => p.id === captainA || p.name === captainA || p.nick === captainA);
          const teamBCaptain = teamB.players.some(p => p.id === captainB || p.name === captainB || p.nick === captainB);
          const teamACaptainAlt = teamA.players.some(p => p.id === captainB || p.name === captainB || p.nick === captainB);
          const teamBCaptainAlt = teamB.players.some(p => p.id === captainA || p.name === captainA || p.nick === captainA);

          console.log(`쿼터 ${i + 1} 주장 체크:`, {
            teamACaptain,
            teamBCaptain,
            teamACaptainAlt,
            teamBCaptainAlt,
            teamAPlayers: teamA.players.map(p => ({ id: p.id, name: p.name, nick: p.nick })),
            teamBPlayers: teamB.players.map(p => ({ id: p.id, name: p.name, nick: p.nick }))
          });

          if (teamACaptain && teamBCaptain) {
            hasBothCaptains = true;
            isCaptainASideA = true;
          } else if (teamACaptainAlt && teamBCaptainAlt) {
            hasBothCaptains = true;
            isCaptainASideA = false;
          }

          if (hasBothCaptains) {
            // 쿼터별 스코어 계산
            if (quarter.goalAssistPairs && Array.isArray(quarter.goalAssistPairs)) {
              quarter.goalAssistPairs.forEach(pair => {
                if (pair.goal && pair.goal.team) {
                  const goalTeam = normalizeTeamName(pair.goal.team);
                  const teamANameNorm = normalizeTeamName(teamA.name);
                  const teamBNameNorm = normalizeTeamName(teamB.name);
                  console.log(`골 데이터:`, { goalTeam, teamANameNorm, teamBNameNorm });
                  if (goalTeam === teamANameNorm) {
                    quarterScores[i].teamA += 1;
                    totalTeamAGoals += 1;
                  } else if (goalTeam === teamBNameNorm) {
                    quarterScores[i].teamB += 1;
                    totalTeamBGoals += 1;
                  }
                }
              });
              console.log(`쿼터 ${i + 1} 스코어: ${quarterScores[i].teamA}:${quarterScores[i].teamB}`);
            }
          }
        }

        if (hasBothCaptains) {
          const matchData = {
            date,
            teamA: teamAName,
            teamB: teamBName,
            quarters: quarterScores.map(q => `${q.teamA}:${q.teamB}`),
            totalScore: `${totalTeamAGoals}:${totalTeamBGoals}`
          };
          matchesData.push(matchData);
          console.log('경기 추가:', matchData);

          // 상대 전적 계산
          if (totalTeamAGoals > totalTeamBGoals) {
            if (isCaptainASideA) {
              headToHead.captainA.wins += 1;
              headToHead.captainB.losses += 1;
            } else {
              headToHead.captainB.wins += 1;
              headToHead.captainA.losses += 1;
            }
          } else if (totalTeamAGoals < totalTeamBGoals) {
            if (isCaptainASideA) {
              headToHead.captainA.losses += 1;
              headToHead.captainB.wins += 1;
            } else {
              headToHead.captainB.losses += 1;
              headToHead.captainA.wins += 1;
            }
          } else {
            headToHead.captainA.draws += 1;
            headToHead.captainB.draws += 1;
          }
          console.log('상대 전적 업데이트:', headToHead);
        } else {
          console.log('경기 제외: 양 팀 주장이 모두 참여하지 않음');
        }
      }

      setRecentMatches(matchesData.slice(0, 5));
      setHeadToHeadStats(headToHead);
      console.log('최종 경기 데이터:', matchesData);
      console.log('최종 상대 전적:', headToHead);
    } catch (err) {
      console.error('경기 데이터 가져오기 오류:', err.message, err.code);
      setError('경기 기록 불러오기 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // 응원 데이터 실시간 리스너 설정
  const setupCheerListener = () => {
    const matchId = `match_${format(new Date(), 'yyyyMMdd')}`;
    const cheerRef = doc(db, 'cheers', matchId);
    onSnapshot(cheerRef, (doc) => {
      if (doc.exists()) {
        setCheers(doc.data());
      } else {
        setCheers({
          teamA: { name: lineups[0]?.teamName || '태스키', cheers: 0 },
          teamB: { name: lineups[1]?.teamName || '그레이', cheers: 0 }
        });
      }
    }, (err) => {
      console.error('응원 데이터 리스너 오류:', err);
      setError('응원 데이터 불러오기 중 오류가 발생했습니다.');
    });
  };

  // 팀 응원 처리
  const cheerForTeam = async (team) => {
    const matchId = `match_${format(new Date(), 'yyyyMMdd')}`;
    const cheerRef = doc(db, 'cheers', matchId);
    try {
      const docSnap = await getDoc(cheerRef);
      const currentCheers = docSnap.exists() ? docSnap.data() : {
        teamA: { name: lineups[0]?.teamName || '태스키', cheers: 0 },
        teamB: { name: lineups[1]?.teamName || '그레이', cheers: 0 }
      };
      currentCheers[team].cheers += 1;
      await setDoc(cheerRef, currentCheers);
    } catch (err) {
      console.error('응원 처리 오류:', err);
      setError('응원 처리 중 오류가 발생했습니다.');
    }
  };

  // 주장 비교 그래프 데이터 생성
  const getGraphData = () => {
    if (!lineups[0] || !lineups[1] || !captainStats[lineups[0].captain] || !captainStats[lineups[1].captain]) {
      return null;
    }
    const captainA = lineups[0].captain;
    const captainB = lineups[1].captain;
    return {
      labels: ['골', '어시스트', '클린시트', '출장수'],
      datasets: [
        {
          label: captainA,
          data: [
            captainStats[captainA].goals,
            captainStats[captainA].assists,
            captainStats[captainA].cleanSheets,
            captainStats[captainA].matches
          ],
          backgroundColor: lineups[0].color + '80',
          borderColor: lineups[0].color,
          borderWidth: 1
        },
        {
          label: captainB,
          data: [
            captainStats[captainB].goals,
            captainStats[captainB].assists,
            captainStats[captainB].cleanSheets,
            captainStats[captainB].matches
          ],
          backgroundColor: lineups[1].color + '80',
          borderColor: lineups[1].color,
          borderWidth: 1
        }
      ]
    };
  };

  // 그래프 옵션
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

  if (lineups.length < 2) {
    return <S.Container>데이터를 불러오는 중입니다...</S.Container>;
  }

  const teamA = lineups[0];
  const captainA = teamA.captain;
  const teamB = lineups[1];
  const captainB = teamB.captain;

  const totalCheers = (cheers.teamA?.cheers || 0) + (cheers.teamB?.cheers || 0);
  const teamACheerCount = cheers.teamA?.cheers || 0;
  const teamBCheerCount = cheers.teamB?.cheers || 0;
  const teamACheerPercentage = totalCheers ? (teamACheerCount / totalCheers) * 100 : 50;
  const teamBCheerPercentage = totalCheers ? (teamBCheerCount / totalCheers) * 100 : 50;

  // 라인업 공개 여부 확인
  const now = new Date();
  const isLineupVisible = lineupRevealTime && isAfter(now, lineupRevealTime);

  return (
    <S.Container>
      <S.MatchHeader>
        <h2>경기 라인업</h2>
      </S.MatchHeader>

      <S.MatchVS>
        <S.TeamContainer>
          <S.TeamInfo>
            <S.TeamName>{teamA.teamName}</S.TeamName>
            <S.TeamStats>
              {captainStats[captainA] && (
                <>{captainStats[captainA].win}승 {captainStats[captainA].draw}무 {captainStats[captainA].lose}패</>
              )}
            </S.TeamStats>
          </S.TeamInfo>

          <S.VSIndicator>
            <S.VSText>VS</S.VSText>
            <S.MatchDate>
              {teamA.date && format(new Date(teamA.date), 'yyyy-MM-dd HH:mm')}
            </S.MatchDate>
          </S.VSIndicator>

          <S.TeamInfo>
            <S.TeamName>{teamB.teamName}</S.TeamName>
            <S.TeamStats>
              {captainStats[captainB] && (
                <>{captainStats[captainB].win}승 {captainStats[captainB].draw}무 {captainStats[captainB].lose}패</>
              )}
            </S.TeamStats>
          </S.TeamInfo>
        </S.TeamContainer>
      </S.MatchVS>

      <S.CheerSection>
        <h3>응원하는 팀을 눌러주세요!</h3>
        <div>
          <S.CheerButton color={teamA.color} onClick={() => cheerForTeam('teamA')}>
            {teamA.teamName} 응원하기
          </S.CheerButton>
          <S.CheerButton color={teamB.color} onClick={() => cheerForTeam('teamB')}>
            {teamB.teamName} 응원하기
          </S.CheerButton>
        </div>
        <S.CheerGauge>
          {/* 팀 A 응원 수: 팀 A 게이지 바의 오른쪽 경계에 동적으로 위치 */}
          <S.GaugeText 
            style={{ 
              position: 'absolute', 
               left: `calc(${teamACheerPercentage}% - 25px)`,
    color: "#ffffff",
    transition: 'left 0.5s ease-in-out',
    paddingLeft: '1px',
  }}
          >
            {teamACheerCount}
          </S.GaugeText>
          {/* 팀 A 게이지 바 */}
          <S.GaugeBar 
            color={teamA.color} 
            width={`${teamACheerPercentage}%`} 
            style={{ transition: 'width 0.5s ease-in-out' }} 
          />
          {/* 팀 B 게이지 바 */}
          <S.GaugeBar 
            color={teamB.color} 
            width={`${teamBCheerPercentage}%`} 
            style={{ transition: 'width 0.5s ease-in-out' }} 
          />
          {/* 팀 B 응원 수: 팀 B 게이지 바의 왼쪽 경계에 동적으로 위치 */}
          <S.GaugeText 
            style={{ 
              position: 'absolute', 
              left: `${100 - teamBCheerPercentage}%`, 
              color: "#ffffff", 
              transform: 'translateX(-100%)', 
              transition: 'left 0.5s ease-in-out',
              paddingRight: '5px'
            }}
          >
            {teamBCheerCount}
          </S.GaugeText>
        </S.CheerGauge>
      </S.CheerSection>

      <S.Section>
        <S.SectionTitle>라인업</S.SectionTitle>
        {isLineupVisible ? (
          <S.LineupContainer>
            <S.TeamLineup hasBorder={true}>
              <S.TeamLineupHeader>
                {teamA.teamName}
              </S.TeamLineupHeader>
              <S.PlayerList>
                {teamA.players.map((player) => (
                  <S.PlayerItem key={player.id}>
                    <S.PlayerName isCaptain={player.nick === teamA.captain}>
                      {player.nick}
                    </S.PlayerName>
                    <S.PlayerPosition>{POSITIONS[player.position]}</S.PlayerPosition>
                  </S.PlayerItem>
                ))}
              </S.PlayerList>
            </S.TeamLineup>
            <S.TeamLineup>
              <S.TeamLineupHeader>
                {teamB.teamName}
              </S.TeamLineupHeader>
              <S.PlayerList>
                {teamB.players.map((player) => (
                  <S.PlayerItem key={player.id}>
                    <S.PlayerName isCaptain={player.nick === teamB.captain}>
                      {player.nick}
                    </S.PlayerName>
                    <S.PlayerPosition>{POSITIONS[player.position]}</S.PlayerPosition>
                  </S.PlayerItem>
                ))}
              </S.PlayerList>
            </S.TeamLineup>
          </S.LineupContainer>
        ) : (
          <S.LineupMessage>
            {lineupRevealTime ? `${formatTime(lineupRevealTime)} 라인업 공개 예정입니다.` : '라인업 공개 시간이 설정되지 않았습니다.'}
          </S.LineupMessage>
        )}
      </S.Section>

      {captainStats[captainA] && captainStats[captainB] && (
        <S.Section>
          <S.SectionTitle>주장 비교</S.SectionTitle>
          <S.StatsSection>
            <S.StatRow>
              <S.TeamStatValue isTeamA={true} color={teamA.color}>
                {captainStats[captainA].goals}
              </S.TeamStatValue>
              <S.StatLabel>골</S.StatLabel>
              <S.TeamStatValue isTeamA={false}>
                {captainStats[captainB].goals}
              </S.TeamStatValue>
            </S.StatRow>
            <S.StatRow>
              <S.TeamStatValue isTeamA={true} color={teamA.color}>
                {captainStats[captainA].assists}
              </S.TeamStatValue>
              <S.StatLabel>어시스트</S.StatLabel>
              <S.TeamStatValue isTeamA={false}>
                {captainStats[captainB].assists}
              </S.TeamStatValue>
            </S.StatRow>
            <S.StatRow>
              <S.TeamStatValue isTeamA={true} color={teamA.color}>
                {captainStats[captainA].cleanSheets}
              </S.TeamStatValue>
              <S.StatLabel>클린시트</S.StatLabel>
              <S.TeamStatValue isTeamA={false}>
                {captainStats[captainB].cleanSheets}
              </S.TeamStatValue>
            </S.StatRow>
            <S.StatRow>
              <S.TeamStatValue isTeamA={true} color={teamA.color}>
                {captainStats[captainA].matches}
              </S.TeamStatValue>
              <S.StatLabel>출장수</S.StatLabel>
              <S.TeamStatValue isTeamA={false}>
                {captainStats[captainB].matches}
              </S.TeamStatValue>
            </S.StatRow>
            <S.StatRow>
              <S.TeamStatValue isTeamA={true} color={teamA.color}>
                {captainStats[captainA].winRate}%
              </S.TeamStatValue>
              <S.StatLabel>승률</S.StatLabel>
              <S.TeamStatValue isTeamA={false}>
                {captainStats[captainB].winRate}%
              </S.TeamStatValue>
            </S.StatRow>
            <S.ChartContainer>
              <Bar data={getGraphData()} options={graphOptions} />
            </S.ChartContainer>
          </S.StatsSection>
        </S.Section>
      )}

      <S.Section>
        <S.PreviousMatchesTitle>최근 양팀 맞대결</S.PreviousMatchesTitle>
        {captainStats[captainA] && captainStats[captainB] && (
          <S.HeadToHead>
            <S.HeadToHeadTitle>상대 전적</S.HeadToHeadTitle>
            <S.HeadToHeadStats>
              <S.HeadToHeadTeam>{captainA} {headToHeadStats.captainA.wins}승 {headToHeadStats.captainA.draws}무 {headToHeadStats.captainA.losses}패</S.HeadToHeadTeam>
              <S.HeadToHeadVS>vs</S.HeadToHeadVS>
              <S.HeadToHeadTeam>{captainB} {headToHeadStats.captainB.wins}승 {headToHeadStats.captainB.draws}무 {headToHeadStats.captainB.losses}패</S.HeadToHeadTeam>
            </S.HeadToHeadStats>
          </S.HeadToHead>
        )}
        <S.MatchList>
          {recentMatches.length ? recentMatches.map((match, index) => (
            <S.MatchItem key={index}>
              <S.MatchTeams>
                <S.MatchTeam>{match.teamA}</S.MatchTeam>
                <S.MatchScore>
                  {match.quarters.join(' / ')} ({match.totalScore})
                </S.MatchScore>
                <S.MatchTeam>{match.teamB}</S.MatchTeam>
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
    </S.Container>
  );
};

export default Live;