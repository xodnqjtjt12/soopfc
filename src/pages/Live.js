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
  CB: '수비수',
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
  const [headToHeadStats, setHeadToHeadStats] = useState({});
  const [error, setError] = useState('');
  const [cheers, setCheers] = useState([]);
  const [lineupRevealTime, setLineupRevealTime] = useState(null);

  useEffect(() => {
    fetchLineups();
    setupCheerListener();
  }, []);

  useEffect(() => {
    if (lineups.length > 0) {
      fetchMatches();
      const matchDate = lineups[0]?.date ? new Date(lineups[0].date) : null;
      if (matchDate && !isNaN(matchDate.getTime())) {
        const revealTime = subHours(matchDate, 5);
        setLineupRevealTime(revealTime);
        console.log('라인업 공개 시간:', formatTime(revealTime), '현재 시간:', formatTime(new Date()));
      } else {
        console.log('유효한 경기 시간이 없음:', matchDate);
      }
    }
  }, [lineups]);

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
      console.log('가져온 라인업:', lineupsData);

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

  const fetchMatches = async () => {
    try {
      const captains = lineups.map(team => team.captain).filter(Boolean);
      if (captains.length < 2) {
        setRecentMatches([]);
        setHeadToHeadStats({});
        console.log('주장이 부족하여 경기 데이터를 가져오지 않음:', captains);
        return;
      }

      console.log('주장 확인:', captains);

      const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const matchesData = [];
      const headToHead = {};

      for (let i = 0; i < captains.length; i++) {
        for (let j = i + 1; j < captains.length; j++) {
          const captainA = captains[i];
          const captainB = captains[j];
          const pairKey = `${captainA}_vs_${captainB}`;
          headToHead[pairKey] = {
            captainA: { name: captainA, wins: 0, draws: 0, losses: 0 },
            captainB: { name: captainB, wins: 0, draws: 0, losses: 0 }
          };
        }
      }

      for (const matchDoc of snap.docs) {
        const match = matchDoc.data();
        const { date, quarters } = match;
        console.log(`경기 데이터 확인 (날짜: ${date}):`, match);

        if (!quarters || !Array.isArray(quarters) || quarters.length < 4) {
          console.log(`경기 스킵: 쿼터 부족 (quarters: ${quarters?.length})`);
          continue;
        }

        const teamScores = {};
        const teamNames = {};

        for (let i = 0; i < Math.min(4, quarters.length); i++) {
          const quarter = quarters[i];
          if (!quarter || !quarter.teams || quarter.teams.length < 2) {
            console.log(`쿼터 ${i + 1} 스킵: 팀 데이터 부족`, quarter);
            continue;
          }

          quarter.teams.forEach((team, idx) => {
            if (i === 0) {
              teamNames[idx] = team.name || `Team${idx + 1}`;
              teamScores[teamNames[idx]] = 0;
            }
            if (!team.players) {
              console.log(`쿼터 ${i + 1} 팀 ${idx} 스킵: 선수 데이터 없음`);
              return;
            }
          });

          if (quarter.goalAssistPairs && Array.isArray(quarter.goalAssistPairs)) {
            quarter.goalAssistPairs.forEach(pair => {
              if (pair.goal && pair.goal.team) {
                const goalTeam = normalizeTeamName(pair.goal.team);
                Object.values(teamNames).forEach(teamName => {
                  if (normalizeTeamName(teamName) === goalTeam) {
                    teamScores[teamName] = (teamScores[teamName] || 0) + 1;
                  }
                });
              }
            });
          }
        }

        const matchTeams = Object.values(teamNames);
        const matchCaptains = matchTeams.map(teamName => {
          const team = lineups.find(t => normalizeTeamName(t.teamName) === normalizeTeamName(teamName));
          return team ? team.captain : null;
        }).filter(Boolean);

        if (matchCaptains.length < 2) {
          console.log('경기 제외: 참여한 주장이 2명 미만');
          continue;
        }

        const matchData = {
          date,
          teams: matchTeams.map((teamName, idx) => ({
            name: teamName,
            score: teamScores[teamName] || 0
          }))
        };
        matchesData.push(matchData);
        console.log('경기 추가:', matchData);

        for (let i = 0; i < matchCaptains.length; i++) {
          for (let j = i + 1; j < matchCaptains.length; j++) {
            const captainA = matchCaptains[i];
            const captainB = matchCaptains[j];
            const pairKey = `${captainA}_vs_${captainB}`;
            if (!headToHead[pairKey]) continue;

            const teamAName = matchTeams[i];
            const teamBName = matchTeams[j];
            const scoreA = teamScores[teamAName] || 0;
            const scoreB = teamScores[teamBName] || 0;

            if (scoreA > scoreB) {
              headToHead[pairKey].captainA.wins += 1;
              headToHead[pairKey].captainB.losses += 1;
            } else if (scoreA < scoreB) {
              headToHead[pairKey].captainA.losses += 1;
              headToHead[pairKey].captainB.wins += 1;
            } else {
              headToHead[pairKey].captainA.draws += 1;
              headToHead[pairKey].captainB.draws += 1;
            }
          }
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
      
      await setDoc(cheerRef, { teams: updatedCheers });
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
    totalCheers ? ((team.cheers || 0) / totalCheers) * 100 : (100 / cheers.length)
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

      {lineups.length > 1 && (
        <S.Section>
          <S.PreviousMatchesTitle>최근 맞대결</S.PreviousMatchesTitle>
          {Object.keys(headToHeadStats).length > 0 && (
            <S.HeadToHead>
              <S.HeadToHeadTitle>상대 전적</S.HeadToHeadTitle>
              {Object.entries(headToHeadStats).map(([pairKey, stats], index) => (
                <S.HeadToHeadStats key={index}>
                  <S.HeadToHeadTeam>
                    {stats.captainA.name} {stats.captainA.wins}승 {stats.captainA.draws}무 {stats.captainA.losses}패
                  </S.HeadToHeadTeam>
                  <S.HeadToHeadVS>vs</S.HeadToHeadVS>
                  <S.HeadToHeadTeam>
                    {stats.captainB.name} {stats.captainB.wins}승 {stats.captainB.draws}무 {stats.captainB.losses}패
                  </S.HeadToHeadTeam>
                </S.HeadToHeadStats>
              ))}
            </S.HeadToHead>
          )}
          <S.MatchList>
            {recentMatches.length ? recentMatches.map((match, index) => (
              <S.MatchItem key={index}>
                <S.MatchTeams style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {match.teams.map((team, idx) => (
                    <div key={idx}>
                      <S.MatchTeam>{team.name}</S.MatchTeam>
                      <S.MatchScore>{team.score}</S.MatchScore>
                    </div>
                  ))}
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