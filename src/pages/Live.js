import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy, addDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../App';
import { format } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as S from './LiveCss';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

// 팀 이름 정규화
const normalizeTeamName = (name) => {
  return name ? name.trim().toLowerCase() : '';
};

const Live = () => {
  const [lineups, setLineups] = useState([]);
  const [captainStats, setCaptainStats] = useState({});
  const [recentMatches, setRecentMatches] = useState([]);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [cheers, setCheers] = useState({ teamA: { cheers: 0 }, teamB: { cheers: 0 } });
  const [teamStats, setTeamStats] = useState({});

  useEffect(() => {
    fetchLineups();
    fetchMatches();
    setupChatListener();
    setupCheerListener();
  }, []);

  useEffect(() => {
    if (lineups.length >= 2) {
      calculateTeamStats();
    }
  }, [lineups, recentMatches]);

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
      console.log('Fetched lineups:', lineupsData);

      if (lineupsData.length >= 2) {
        await fetchCaptainStats(lineupsData[0].captain, lineupsData[1].captain);
      }
    } catch (err) {
      console.error('Error fetching lineups:', err.message, err.code);
      setError('라인업 불러오기 중 오류가 발생했습니다: ' + err.message);
    }
  };

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
      console.log('Captain stats:', stats);
    } catch (err) {
      console.error('Error fetching captain stats:', err.message, err.code);
      setError('주장 통계 불러오기 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const fetchMatches = async () => {
    try {
      const teamAName = lineups[0]?.teamName || '태스키';
      const teamBName = lineups[1]?.teamName || '그레이';
      const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const matchesData = [];
      
      for (const doc of snap.docs) {
        const { date, teams = [], goalAssistPairs = [] } = doc.data();
        const teamNames = teams.map(t => normalizeTeamName(t.name));
        if (teamNames.includes(normalizeTeamName(teamAName)) && teamNames.includes(normalizeTeamName(teamBName))) {
          const scores = teams.map(t => ({
            name: t.name,
            goals: goalAssistPairs.filter(p => normalizeTeamName(p.goal.team) === normalizeTeamName(t.name)).length
          }));
          const teamAScore = scores.find(s => normalizeTeamName(s.name) === normalizeTeamName(teamAName))?.goals || 0;
          const teamBScore = scores.find(s => normalizeTeamName(s.name) === normalizeTeamName(teamBName))?.goals || 0;
          
          matchesData.push({
            homeTeam: teamAName,
            awayTeam: teamBName,
            homeScore: teamAScore,
            awayScore: teamBScore,
            date
          });
        }
      }
      
      setRecentMatches(matchesData.slice(0, 5));
      console.log('Fetched matches:', matchesData);
    } catch (err) {
      console.error('Error fetching matches:', err.message, err.code);
      setError('경기 기록 불러오기 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const calculateTeamStats = () => {
    const teamAName = lineups[0]?.teamName || '태스키';
    const teamBName = lineups[1]?.teamName || '그레이';
    const stats = {
      [teamAName]: { wins: 0, draws: 0, losses: 0 },
      [teamBName]: { wins: 0, draws: 0, losses: 0 }
    };

    recentMatches.forEach(match => {
      const teamAScore = match.homeScore;
      const teamBScore = match.awayScore;
      if (teamAScore > teamBScore) {
        stats[teamAName].wins += 1;
        stats[teamBName].losses += 1;
      } else if (teamAScore < teamBScore) {
        stats[teamBName].wins += 1;
        stats[teamAName].losses += 1;
      } else {
        stats[teamAName].draws += 1;
        stats[teamBName].draws += 1;
      }
    });

    setTeamStats(stats);
  };

  const setupChatListener = () => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messageData.slice(0, 10));
    }, (err) => {
      console.error('Error listening to messages:', err);
      setError('채팅 메시지 불러오기 중 오류가 발생했습니다.');
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        timestamp: new Date().toISOString(),
        user: '익명'
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('메시지 전송 중 오류가 발생했습니다.');
    }
  };

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
      console.error('Error listening to cheers:', err);
      setError('응원 데이터 불러오기 중 오류가 발생했습니다.');
    });
  };

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
      console.error('Error cheering for team:', err);
      setError('응원 처리 중 오류가 발생했습니다.');
    }
  };

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
  const teamB = lineups[1];
  const captainA = teamA.captain;
  const captainB = teamB.captain;

  const totalCheers = (cheers.teamA?.cheers || 0) + (cheers.teamB?.cheers || 0);
  const teamACheerPercentage = totalCheers ? ((cheers.teamA?.cheers || 0) / totalCheers) * 100 : 50;
  const teamBCheerPercentage = totalCheers ? ((cheers.teamB?.cheers || 0) / totalCheers) * 100 : 50;

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
                <>{captainStats[captainA].win}승 · {captainStats[captainA].draw}무 {captainStats[captainA].lose}패</>
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
                <>{captainStats[captainB].win}승 · {captainStats[captainB].draw}무 {captainStats[captainB].lose}패</>
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
          <S.GaugeBar color={teamA.color} width={`${teamACheerPercentage}%`} />
          <S.GaugeBar color={teamB.color} width={`${teamBCheerPercentage}%`} />
        </S.CheerGauge>
      </S.CheerSection>

      <S.Section>
        <S.SectionTitle>라인업</S.SectionTitle>
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
        <S.MatchList>
          {recentMatches.length ? recentMatches.map((match, index) => {
            const isTeamAWinner = match.homeScore > match.awayScore;
            const isTeamBWinner = match.awayScore > match.homeScore;
            return (
              <S.MatchItem key={index}>
                <S.MatchTeams>
                  <S.MatchTeam isWinner={isTeamAWinner}>
                    {match.homeTeam}
                  </S.MatchTeam>
                  <S.MatchScore>
                    {match.homeScore} : {match.awayScore}
                  </S.MatchScore>
                  <S.MatchTeam isWinner={isTeamBWinner}>
                    {match.awayTeam}
                  </S.MatchTeam>
                </S.MatchTeams>
                <S.MatchInfo>
                  <S.MatchDateInfo>{formatDate(match.date)}</S.MatchDateInfo>
                </S.MatchInfo>
              </S.MatchItem>
            );
          }) : (
            <S.MatchItem>
              <S.MatchTeams>맞대결 기록이 없습니다.</S.MatchTeams>
            </S.MatchItem>
          )}
        </S.MatchList>
      </S.Section>

      <S.ChatSection>
        <S.ChatTitle>실시간 채팅</S.ChatTitle>
        <S.ChatMessages>
          {messages.map((msg) => (
            <S.ChatMessage key={msg.id}>
              <strong>{msg.user}: </strong>{msg.text}
              <div style={{ fontSize: '12px', color: '#888' }}>
                {formatDate(msg.timestamp)}
              </div>
            </S.ChatMessage>
          ))}
        </S.ChatMessages>
        <S.ChatInputContainer>
          <S.ChatInput
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <S.ChatButton onClick={sendMessage}>전송</S.ChatButton>
        </S.ChatInputContainer>
      </S.ChatSection>
    </S.Container>
  );
};

export default Live;