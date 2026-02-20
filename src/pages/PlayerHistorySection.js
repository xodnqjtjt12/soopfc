import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../App';
import {
  ArrowLeft,
  Trophy,
  Users,
  BarChart2,
  History,
  Award,
  Target,
  Star,
  Activity
} from 'lucide-react';
import * as PHS from './PlayerHistorySectionCss';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PlayerHistorySection = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGraphs, setShowGraphs] = useState(false);
  const [selectedStat, setSelectedStat] = useState('goals');
  const [rankingData, setRankingData] = useState({});
  const [totalRankingData, setTotalRankingData] = useState({});
  const [rankingDataLoading, setRankingDataLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [bestPartners, setBestPartners] = useState({
    given: { name: '', count: 0 },
    received: { name: '', count: 0 },
    teamMate: { name: '', count: 0 },
    cleanSheet: { name: '', count: 0 }
  });
  const [totalStats, setTotalStats] = useState({
    goals: 0,
    assists: 0,
    matches: 0,
    cleanSheets: 0,
    attackPoints: 0,
    top3: 0,
    top8: 0
  });

  const getCurrentSeason = () => {
    const now = new Date();
    return now.getFullYear().toString(); // 현재 2026
  };

  const currentSeason = getCurrentSeason();
  const years = ['2022', '2023', '2024', '2025', currentSeason];

  const statOptions = [
    { value: 'goals', label: '득점', color: '#8884d8' },
    { value: 'assists', label: '어시스트', color: '#82ca9d' },
    { value: 'attackPoints', label: '공격포인트', color: '#f59e0b' },
    { value: 'cleanSheets', label: '클린시트', color: '#ffc658' },
    { value: 'matches', label: '출장수', color: '#ff8042' },
    { value: 'personalPoints', label: '개인승점', color: '#0088fe' },
    { value: 'momScore', label: 'MOM점수', color: '#9c27b0' },
    { value: 'winRate', label: '승률(%)', color: '#00C49F' },
    { value: 'momTop3Count', label: 'MOM TOP 3', color: '#FF6B6B' },
    { value: 'momTop8Count', label: 'MOM TOP 8', color: '#4ECDC4' }
  ];

  const totalStatOptions = [
    { value: 'goals', label: '득점', color: '#8884d8' },
    { value: 'assists', label: '어시스트', color: '#82ca9d' },
    { value: 'matches', label: '출장수', color: '#ff8042' },
    { value: 'cleanSheets', label: '클린시트', color: '#ffc658' },
    { value: 'top3', label: 'MOM TOP 3', color: '#FF6B6B' },
    { value: 'top8', label: 'MOM TOP 8', color: '#4ECDC4' }
  ];

  const statRankingToCheck = ['goals', 'assists', 'cleanSheets', 'matches', 'momTop3Count', 'momTop8Count'];

  useEffect(() => {
    let interval;
    if (rankingDataLoading) {
      setLoadingPercent(0);
      interval = setInterval(() => {
        setLoadingPercent((prev) => (prev >= 100 ? 100 : prev + 1));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [rankingDataLoading]);

  useEffect(() => {
    if (historyData.length > 0) {
      const totals = historyData.reduce(
        (acc, record) => ({
          goals: acc.goals + (record.goals || 0),
          assists: acc.assists + (record.assists || 0),
          matches: acc.matches + (record.matches || 0),
          cleanSheets: acc.cleanSheets + (record.cleanSheets || 0),
          attackPoints: acc.attackPoints + ((record.goals || 0) + (record.assists || 0)),
          top3: acc.top3 + (record.momTop3Count || 0),
          top8: acc.top8 + (record.momTop8Count || 0)
        }),
        { goals: 0, assists: 0, matches: 0, cleanSheets: 0, attackPoints: 0, top3: 0, top8: 0 }
      );
      setTotalStats(totals);
    }
  }, [historyData]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const data = [];

      try {
        const playerRef = doc(db, 'players', playerId);
        const playerDoc = await getDoc(playerRef);
        const currentPlayerData = playerDoc.exists() ? playerDoc.data() : {};

        for (const year of years) {
          if (year === currentSeason) {
            // 2026년(현재 시즌) → players 컬렉션 실시간 데이터
            data.push({
              year,
              goals: currentPlayerData.goals || 0,
              assists: currentPlayerData.assists || 0,
              attackPoints: (currentPlayerData.goals || 0) + (currentPlayerData.assists || 0),
              cleanSheets: currentPlayerData.cleanSheets || 0,
              matches: currentPlayerData.matches || 0,
              win: currentPlayerData.win || 0,
              draw: currentPlayerData.draw || 0,
              lose: currentPlayerData.lose || 0,
              winRate: Math.round(currentPlayerData.winRate || 0),
              personalPoints: currentPlayerData.personalPoints || 0,
              momScore: currentPlayerData.momScore || 0,
              momTop3Count: currentPlayerData.momTop3Count || 0,
              momTop8Count: currentPlayerData.momTop8Count || 0
            });
          } else {
            // 2025년 포함 모든 과거 연도 → history 서브컬렉션
            const historyRef = doc(db, 'players', playerId, 'history', year);
            const historyDoc = await getDoc(historyRef);

            if (historyDoc.exists()) {
              const hData = historyDoc.data();
              data.push({
                year,
                goals: hData.goals || 0,
                assists: hData.assists || 0,
                attackPoints: (hData.goals || 0) + (hData.assists || 0),
                cleanSheets: hData.cleanSheets || 0,
                matches: hData.matches || 0,
                win: hData.win || 0,
                draw: hData.draw || 0,
                lose: hData.lose || 0,
                winRate: Math.round(hData.winRate || 0),
                personalPoints: hData.personalPoints || 0,
                momScore: hData.momScore || 0,
                momTop3Count: hData.momTop3Count || 0,
                momTop8Count: hData.momTop8Count || 0
              });
            } else {
              data.push({
                year,
                goals: 0,
                assists: 0,
                attackPoints: 0,
                cleanSheets: 0,
                matches: 0,
                win: 0,
                draw: 0,
                lose: 0,
                winRate: 0,
                personalPoints: 0,
                momScore: 0,
                momTop3Count: 0,
                momTop8Count: 0
              });
            }
          }
        }

        const sorted = data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        setHistoryData(sorted);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('기록을 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [playerId]);

  useEffect(() => {
    const fetchRankingData = async () => {
      setRankingDataLoading(true);
      const rankData = {};

      for (const year of years) {
        rankData[year] = {};

        try {
          if (year === currentSeason) {
            // 2026년(현재 시즌) → players 컬렉션 실시간 랭킹
            const playersRef = collection(db, 'players');
            const playersSnapshot = await getDocs(playersRef);

            statRankingToCheck.forEach(stat => {
              const playerStats = [];

              playersSnapshot.forEach(doc => {
                const playerData = doc.data();
                if ((playerData[stat] || 0) > 0) {
                  playerStats.push({
                    id: doc.id,
                    value: playerData[stat] || 0
                  });
                }
              });

              playerStats.sort((a, b) => b.value - a.value);

              const ranks = [];
              let currentRank = 1;
              let currentValue = null;
              let playersAtCurrentValue = 0;

              playerStats.forEach((player, index) => {
                if (player.value !== currentValue) {
                  currentRank += playersAtCurrentValue;
                  currentValue = player.value;
                  playersAtCurrentValue = 1;
                } else {
                  playersAtCurrentValue++;
                }
                ranks.push({
                  id: player.id,
                  value: player.value,
                  rank: currentRank
                });
              });

              const top3 = ranks.filter(item => item.rank <= 3);
              const playerRank = ranks.find(item => item.id === playerId)?.rank || null;

              rankData[year][stat] = { top3, playerRank };
            });
          } else {
            // 2025년 포함 과거 연도 → history 서브컬렉션
            const yearlyData = [];
            const playersRef = collection(db, 'players');
            const playersSnapshot = await getDocs(playersRef);

            for (const playerDoc of playersSnapshot.docs) {
              const historyRef = doc(db, 'players', playerDoc.id, 'history', year);
              const historyDoc = await getDoc(historyRef);

              if (historyDoc.exists()) {
                const historyData = historyDoc.data();
                if ((historyData.matches || 0) > 0) {
                  statRankingToCheck.forEach(stat => {
                    if (!yearlyData[stat]) yearlyData[stat] = [];
                    yearlyData[stat].push({
                      id: playerDoc.id,
                      value: historyData[stat] || 0
                    });
                  });
                }
              }
            }

            statRankingToCheck.forEach(stat => {
              if (yearlyData[stat]) {
                yearlyData[stat].sort((a, b) => b.value - a.value);

                const ranks = [];
                let currentRank = 1;
                let currentValue = null;
                let playersAtCurrentValue = 0;

                yearlyData[stat].forEach((player, index) => {
                  if (player.value !== currentValue) {
                    currentRank += playersAtCurrentValue;
                    currentValue = player.value;
                    playersAtCurrentValue = 1;
                  } else {
                    playersAtCurrentValue++;
                  }
                  ranks.push({
                    id: player.id,
                    value: player.value,
                    rank: currentRank
                  });
                });

                const top3 = ranks.filter(item => item.rank <= 3);
                const playerRank = ranks.find(item => item.id === playerId)?.rank || null;

                rankData[year][stat] = { top3, playerRank };
              } else {
                rankData[year][stat] = { top3: [], playerRank: null };
              }
            });
          }
        } catch (err) {
          console.error(`Error fetching ranking data for ${year}:`, err);
          statRankingToCheck.forEach(stat => {
            rankData[year][stat] = { top3: [], playerRank: null };
          });
        }
      }

      setRankingData(rankData);
      setRankingDataLoading(false);
    };

    if (!loading && historyData.length > 0) {
      fetchRankingData();
    }
  }, [historyData, loading, playerId]);

  useEffect(() => {
    const fetchTotalRankingData = async () => {
      const totalRankData = {};
      const statsToCheck = ['goals', 'assists', 'matches', 'cleanSheets', 'attackPoints', 'top3', 'top8'];

      try {
        const playersRef = collection(db, 'players');
        const playersSnapshot = await getDocs(playersRef);
        const playerTotals = {};

        for (const playerDoc of playersSnapshot.docs) {
          const pid = playerDoc.id;
          playerTotals[pid] = {
            goals: 0, assists: 0, matches: 0, cleanSheets: 0,
            attackPoints: 0, top3: 0, top8: 0
          };

          const playerData = playerDoc.data();
          playerTotals[pid].goals += playerData.goals || 0;
          playerTotals[pid].assists += playerData.assists || 0;
          playerTotals[pid].matches += playerData.matches || 0;
          playerTotals[pid].cleanSheets += playerData.cleanSheets || 0;
          playerTotals[pid].attackPoints += (playerData.goals || 0) + (playerData.assists || 0);
          playerTotals[pid].top3 += playerData.momTop3Count || 0;
          playerTotals[pid].top8 += playerData.momTop8Count || 0;

          for (const year of years.filter(y => y !== currentSeason)) {
            const historyRef = doc(db, 'players', pid, 'history', year);
            const historyDoc = await getDoc(historyRef);
            if (historyDoc.exists()) {
              const data = historyDoc.data();
              playerTotals[pid].goals += data.goals || 0;
              playerTotals[pid].assists += data.assists || 0;
              playerTotals[pid].matches += data.matches || 0;
              playerTotals[pid].cleanSheets += data.cleanSheets || 0;
              playerTotals[pid].attackPoints += (data.goals || 0) + (data.assists || 0);
              playerTotals[pid].top3 += data.momTop3Count || 0;
              playerTotals[pid].top8 += data.momTop8Count || 0;
            }
          }
        }

        statsToCheck.forEach(stat => {
          const playerStats = Object.entries(playerTotals)
            .map(([id, totals]) => ({
              id,
              value: totals[stat]
            }))
            .filter(player => player.value > 0);

          playerStats.sort((a, b) => b.value - a.value);

          const ranks = [];
          let currentRank = 1;
          let currentValue = null;
          let playersAtCurrentValue = 0;

          playerStats.forEach((player, index) => {
            if (player.value !== currentValue) {
              currentRank += playersAtCurrentValue;
              currentValue = player.value;
              playersAtCurrentValue = 1;
            } else {
              playersAtCurrentValue++;
            }
            ranks.push({
              id: player.id,
              value: player.value,
              rank: currentRank
            });
          });

          const top3 = ranks.filter(item => item.rank <= 3);
          const playerRank = ranks.find(item => item.id === playerId)?.rank || null;

          totalRankData[stat] = { top3, playerRank };
        });

        setTotalRankingData(totalRankData);
      } catch (err) {
        console.error('Error fetching total ranking data:', err);
      }
    };

    if (!loading && historyData.length > 0) {
      fetchTotalRankingData();
    }
  }, [historyData, loading, playerId]);

  useEffect(() => {
    const fetchBestPartners = async () => {
      try {
        const matchesRef = collection(db, 'matches');
        const matchesQuery = query(matchesRef, orderBy('date', 'desc'));
        const matchesSnapshot = await getDocs(matchesQuery);

        const givenCounts = {};
        const receivedCounts = {};
        const teamMateCounts = {};
        const cleanSheetCounts = {};

        let isDefender = false;
        const defensivePositions = ['CB1', 'CB2', 'LB', 'RB', 'LWB', 'RWB'];

        matchesSnapshot.forEach(doc => {
          const match = doc.data();
          if (match.date && new Date(match.date).getFullYear() === parseInt(currentSeason)) {
            match.quarters.forEach(quarter => {
              quarter.teams.forEach(team => {
                const player = team.players.find(p => p.name.toLowerCase() === playerId.toLowerCase());
                if (player && defensivePositions.includes(player.position)) {
                  isDefender = true;
                }
              });
            });
          }
        });

        matchesSnapshot.forEach(doc => {
          const match = doc.data();
          if (match.date && new Date(match.date).getFullYear() === parseInt(currentSeason)) {
            match.quarters.forEach(quarter => {
              const playerTeam = quarter.teams.find(team =>
                team.players.some(p => p.name.toLowerCase() === playerId.toLowerCase())
              );
              if (playerTeam) {
                playerTeam.players.forEach(player => {
                  if (player.name.toLowerCase() !== playerId.toLowerCase()) {
                    teamMateCounts[player.name] = (teamMateCounts[player.name] || 0) + 1;
                  }
                });
              }

              if (isDefender && playerTeam) {
                const opponentTeams = quarter.teams.filter(t => t.name !== playerTeam.name);
                const opponentGoals = quarter.goalAssistPairs.filter(p =>
                  opponentTeams.some(t => (p.goal?.team || '').trim().toLowerCase() === (t.name || '').trim().toLowerCase())
                ).length;

                if (opponentGoals === 0) {
                  playerTeam.players.forEach(player => {
                    if (player.name.toLowerCase() !== playerId.toLowerCase()) {
                      cleanSheetCounts[player.name] = (cleanSheetCounts[player.name] || 0) + 1;
                    }
                  });
                }
              }

              (quarter.goalAssistPairs || []).forEach(pair => {
                if (pair.assist?.player?.toLowerCase() === playerId.toLowerCase() && pair.goal?.player) {
                  const goalPlayer = pair.goal.player;
                  givenCounts[goalPlayer] = (givenCounts[goalPlayer] || 0) + 1;
                }
                if (pair.goal?.player?.toLowerCase() === playerId.toLowerCase() && pair.assist?.player) {
                  const assistPlayer = pair.assist.player;
                  receivedCounts[assistPlayer] = (receivedCounts[assistPlayer] || 0) + 1;
                }
              });
            });
          }
        });

        const givenMax = Object.entries(givenCounts).reduce((max, [name, count]) =>
          count > max.count ? { name, count } : max, { name: '', count: 0 });

        const receivedMax = Object.entries(receivedCounts).reduce((max, [name, count]) =>
          count > max.count ? { name, count } : max, { name: '', count: 0 });

        const teamMateMax = Object.entries(teamMateCounts).reduce((max, [name, count]) =>
          count > max.count ? { name, count } : max, { name: '', count: 0 });

        const cleanSheetMax = Object.entries(cleanSheetCounts).reduce((max, [name, count]) =>
          count > max.count ? { name, count } : max, { name: '', count: 0 });

        setBestPartners({
          given: givenMax,
          received: receivedMax,
          teamMate: teamMateMax,
          cleanSheet: cleanSheetMax
        });
      } catch (err) {
        console.error('Error fetching best partners:', err);
      }
    };

    if (!loading && historyData.length > 0) {
      fetchBestPartners();
    }
  }, [loading, historyData, playerId]);

  const toggleGraphs = () => setShowGraphs(!showGraphs);

  const getMaxValue = (statKey) => {
    const max = Math.max(...historyData.map(item => item[statKey] || 0));
    return max === 0 ? 10 : Math.ceil(max * 1.2);
  };

  const hasData = historyData.some(record => record.matches > 0);

  if (loading) {
    return (
      <PHS.OuterWrapper>
        <PHS.LoadingContainer>
          <img src="/mom.png" alt="Loading" className="spinner-logo" />
          <div className="progress-bar">
            <div className="fill" style={{ width: '60%' }} />
          </div>
          <p>선수 기록을 불러오는 중입니다...</p>
        </PHS.LoadingContainer>
      </PHS.OuterWrapper>
    );
  }

  return (
    <PHS.OuterWrapper>
      <PHS.Container>
        <PHS.HeaderSection>
          <PHS.HeaderLeft>
            <PHS.TitleContainer>
              <PHS.BackButton onClick={() => navigate('/total', { state: { playerName: playerId } })}>
                <ArrowLeft size={20} />
              </PHS.BackButton>
              <PHS.Title>{playerId}</PHS.Title>
            </PHS.TitleContainer>
            <PHS.Subtitle>시즌별 성과 및 성장 추이를 한눈에 확인하세요</PHS.Subtitle>
          </PHS.HeaderLeft>
        </PHS.HeaderSection>

        {error && <p style={{ color: '#f04452', fontWeight: 600 }}>{error}</p>}

        <PHS.Section>
          <PHS.SectionTitleWrapper>
            <Target size={20} />
            <h3>올타임 통합 기록 (통산)</h3>
          </PHS.SectionTitleWrapper>
          <PHS.SummaryCardContainer>
            <PHS.SummaryCard>
              <span className="label">통산 출장수</span>
              <span className="value">{totalStats.matches}경기</span>
            </PHS.SummaryCard>
            <PHS.SummaryCard>
              <span className="label">통산 득점</span>
              <span className="value">{totalStats.goals}골</span>
            </PHS.SummaryCard>
            <PHS.SummaryCard>
              <span className="label">통산 도움</span>
              <span className="value">{totalStats.assists}도움</span>
            </PHS.SummaryCard>
            <PHS.SummaryCard>
              <span className="label">통산 공격포인트</span>
              <span className="value">{totalStats.attackPoints}포인트</span>
            </PHS.SummaryCard>
            <PHS.SummaryCard>
              <span className="label">통산 클린시트</span>
              <span className="value">{totalStats.cleanSheets}회</span>
            </PHS.SummaryCard>
            <PHS.SummaryCard>
              <span className="label">MOM TOP 3</span>
              <span className="value">{totalStats.top3}회</span>
            </PHS.SummaryCard>
            <PHS.SummaryCard>
              <span className="label">MOM TOP 8</span>
              <span className="value">{totalStats.top8}회</span>
            </PHS.SummaryCard>
          </PHS.SummaryCardContainer>
        </PHS.Section>

        <PHS.Section>
          <PHS.SectionTitleWrapper>
            <History size={20} />
            <h3>시즌별 통합 기록</h3>
          </PHS.SectionTitleWrapper>
          <PHS.TableCard>
            <PHS.TableWrapper>
              <PHS.ModernTable>
                <thead>
                  <tr>
                    <PHS.ModernTh>연도</PHS.ModernTh>
                    <PHS.ModernTh>득점</PHS.ModernTh>
                    <PHS.ModernTh>도움</PHS.ModernTh>
                    <PHS.ModernTh>클린시트</PHS.ModernTh>
                    <PHS.ModernTh>출장</PHS.ModernTh>
                    <PHS.ModernTh>승/무/패</PHS.ModernTh>
                    <PHS.ModernTh>승률</PHS.ModernTh>
                    <PHS.ModernTh>개인승점</PHS.ModernTh>
                    <PHS.ModernTh>MOM점수</PHS.ModernTh>
                    <PHS.ModernTh>TOP 3</PHS.ModernTh>
                    <PHS.ModernTh>TOP 8</PHS.ModernTh>
                  </tr>
                </thead>
                <tbody>
                  {[...historyData].reverse().map((record) => (
                    <tr key={record.year}>
                      <PHS.ModernTd className={record.year === currentSeason ? 'highlight-year' : ''}>
                        {record.year}{record.year === currentSeason ? ' (현재)' : ''}
                      </PHS.ModernTd>
                      <PHS.ModernTd>{record.goals}</PHS.ModernTd>
                      <PHS.ModernTd>{record.assists}</PHS.ModernTd>
                      <PHS.ModernTd>{record.cleanSheets}</PHS.ModernTd>
                      <PHS.ModernTd>{record.matches}</PHS.ModernTd>
                      <PHS.ModernTd>
                        <span className="win">{record.win}</span>/
                        <span className="draw">{record.draw}</span>/
                        <span className="lose">{record.lose}</span>
                      </PHS.ModernTd>
                      <PHS.ModernTd>{record.winRate}%</PHS.ModernTd>
                      <PHS.ModernTd>{record.personalPoints}</PHS.ModernTd>
                      <PHS.ModernTd>{record.momScore}</PHS.ModernTd>
                      <PHS.ModernTd>{record.momTop3Count}</PHS.ModernTd>
                      <PHS.ModernTd>{record.momTop8Count}</PHS.ModernTd>
                    </tr>
                  ))}
                </tbody>
              </PHS.ModernTable>
            </PHS.TableWrapper>
          </PHS.TableCard>
        </PHS.Section>

        {!hasData ? (
          <PHS.Section>
            <p style={{ textAlign: 'center', padding: '40px', color: '#8b95a1' }}>이 선수의 기록이 존재하지 않습니다.</p>
          </PHS.Section>
        ) : (
          <>
            <PHS.Section>
              <PHS.SectionTitleWrapper>
                <Activity size={20} />
                <h3>종합 공격 기여도</h3>
              </PHS.SectionTitleWrapper>
              <PHS.TableCard>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={historyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis
                      dataKey="year"
                      stroke="#495057"
                      style={{ fontSize: '14px', fontWeight: 500 }}
                    />
                    <YAxis
                      stroke="#495057"
                      style={{ fontSize: '14px', fontWeight: 500 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="goals"
                      stroke="#5f7fff"
                      strokeWidth={2}
                      name="득점"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="assists"
                      stroke="#51cf66"
                      strokeWidth={2}
                      name="어시스트"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attackPoints"
                      stroke="#ff6b6b"
                      strokeWidth={2}
                      name="공격포인트"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </PHS.TableCard>
            </PHS.Section>

            <PHS.Section>
              <PHS.SectionTitleWrapper>
                <Trophy size={20} />
                <h3>수상 기록</h3>
              </PHS.SectionTitleWrapper>

              {rankingDataLoading ? (
                <PHS.LoadingContainer style={{ minHeight: '200px' }}>
                  <img src="/mom.png" alt="Loading" className="spinner-logo" style={{ width: '80px', height: '80px' }} />
                  <p style={{ fontSize: '14px' }}>수상 기록 분석 중... {loadingPercent}%</p>
                </PHS.LoadingContainer>
              ) : (
                <PHS.AwardsGrid>
                  {/* 통산(All-Time) 수상 기록 */}
                  {Object.keys(totalRankingData).length > 0 &&
                    Object.values(totalRankingData).some(rankInfo => rankInfo.playerRank && rankInfo.playerRank <= 3) && (
                      <PHS.AwardCard>
                        <PHS.AwardYearHeader>
                          <span>👑 올타임 기록 (통산)</span>
                        </PHS.AwardYearHeader>
                        {Object.entries(totalRankingData).map(([stat, rankInfo]) => {
                          if (!rankInfo.playerRank || rankInfo.playerRank > 3) return null;

                          const val = rankInfo.top3.find(i => i.id === playerId)?.value || 0;
                          if (val <= 0) return null;

                          const labels = {
                            goals: '득점', assists: '도움', matches: '출장',
                            cleanSheets: '클린시트', attackPoints: '공격포인트',
                            top3: 'MOM TOP 3', top8: 'MOM TOP 8'
                          };

                          const rankStyles = {
                            1: { icon: '🏆', bg: '#fff9db', label: '1위' },
                            2: { icon: '🥈', bg: '#f1f3f5', label: '2위' },
                            3: { icon: '🥉', bg: '#fff4e6', label: '3위' }
                          };

                          const style = rankStyles[rankInfo.playerRank];

                          return (
                            <PHS.AwardBadge key={stat} bgColor={style.bg}>
                              <div className="icon-box">{style.icon}</div>
                              <div className="text-stack">
                                <span className="label">{labels[stat] || stat} {style.label}</span>
                                <span className="value">{val}{stat === 'matches' ? '경기' : (stat === 'attackPoints' ? '포인트' : '회')} 기록</span>
                              </div>
                            </PHS.AwardBadge>
                          );
                        })}
                      </PHS.AwardCard>
                    )}

                  {years
                    .filter(year => {
                      if (!rankingData[year]) return false;
                      return statRankingToCheck.some(stat => {
                        const rankInfo = rankingData[year][stat];
                        return rankInfo?.top3?.find(item => item.id === playerId && item.rank <= 3 && item.value > 0);
                      });
                    })
                    .map(year => (
                      <PHS.AwardCard key={year}>
                        <PHS.AwardYearHeader>
                          <span>{year}년 시즌</span>
                        </PHS.AwardYearHeader>
                        {statRankingToCheck.map((stat) => {
                          const playerItem = rankingData[year][stat]?.top3.find(item => item.id === playerId);
                          if (!playerItem || playerItem.rank > 3 || playerItem.value <= 0) return null;

                          const labels = {
                            goals: '득점', assists: '도움', cleanSheets: '클린시트',
                            matches: '출장', momTop3Count: 'TOP 3', momTop8Count: 'TOP 8'
                          };

                          const rankStyles = {
                            1: { icon: '🥇', bg: '#fff9db', label: '1위' },
                            2: { icon: '🥈', bg: '#f1f3f5', label: '2위' },
                            3: { icon: '🥉', bg: '#fff4e6', label: '3위' }
                          };

                          const style = rankStyles[playerItem.rank];

                          return (
                            <PHS.AwardBadge key={stat} bgColor={style.bg}>
                              <div className="icon-box">{style.icon}</div>
                              <div className="text-stack">
                                <span className="label">{labels[stat]} {style.label}</span>
                                <span className="value">{playerItem.value}{stat === 'matches' ? '경기' : '회'} 기록</span>
                              </div>
                            </PHS.AwardBadge>
                          );
                        })}
                      </PHS.AwardCard>
                    ))}
                </PHS.AwardsGrid>
              )}
            </PHS.Section>

            <PHS.Section>
              <PHS.GraphToggleButton onClick={toggleGraphs}>
                {showGraphs ? <BarChart2 size={18} /> : <Activity size={18} />}
                {showGraphs ? '분석 차트 닫기' : '성장 추이 확인하기'}
              </PHS.GraphToggleButton>

              {showGraphs && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <PHS.ChartCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <h3>지표별 성장 추이</h3>
                      <PHS.StatSelector>
                        {statOptions.map(option => (
                          <PHS.StatButton
                            key={option.value}
                            onClick={() => setSelectedStat(option.value)}
                            active={selectedStat === option.value}
                            color={option.color}
                          >
                            {option.label}
                          </PHS.StatButton>
                        ))}
                      </PHS.StatSelector>
                    </div>

                    <div style={{ width: '100%', height: '400px' }}>
                      <ResponsiveContainer>
                        <LineChart data={historyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f4f6" />
                          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} domain={[0, getMaxValue(selectedStat)]} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                            itemStyle={{ fontWeight: 700 }}
                          />
                          <Line
                            type="monotone"
                            dataKey={selectedStat}
                            stroke={statOptions.find(opt => opt.value === selectedStat)?.color || '#3182f6'}
                            strokeWidth={3}
                            dot={{ r: 6, fill: 'white', strokeWidth: 3 }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </PHS.ChartCard>

                  <PHS.ChartCard>
                    <h3>승/무/패 밸런스</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                      <ResponsiveContainer>
                        <LineChart data={historyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f4f6" />
                          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b95a1', fontSize: 12 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
                          <Legend verticalAlign="top" align="right" height={36} />
                          <Line type="monotone" dataKey="win" name="승" stroke="#3182f6" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="draw" name="무" stroke="#adb5bd" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="lose" name="패" stroke="#f04452" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </PHS.ChartCard>
                </div>
              )}
            </PHS.Section>

            <PHS.Section>
              <PHS.SectionTitleWrapper>
                <Users size={20} />
                <h3>베스트 파트너 ({currentSeason} 시즌)</h3>
              </PHS.SectionTitleWrapper>
              <PHS.PartnerGrid>
                <PHS.PartnerCard>
                  <div className="avatar"><img src={`/players/${bestPartners.teamMate.name}.png`} alt="" onError={(e) => e.target.src = '/mom.png'} /></div>
                  <div className="content">
                    <span className="label">가장 많이 함께 뛴 동료</span>
                    <span className="name">{bestPartners.teamMate.name || '기록 없음'}</span>
                    <span className="count">{bestPartners.teamMate.count}쿼터</span>
                  </div>
                </PHS.PartnerCard>
                <PHS.PartnerCard>
                  <div className="avatar"><img src={`/players/${bestPartners.given.name}.png`} alt="" onError={(e) => e.target.src = '/mom.png'} /></div>
                  <div className="content">
                    <span className="label">나의 도움으로 득점한 선수</span>
                    <span className="name">{bestPartners.given.name || '기록 없음'}</span>
                    <span className="count">{bestPartners.given.count}골</span>
                  </div>
                </PHS.PartnerCard>
                <PHS.PartnerCard>
                  <div className="avatar"><img src={`/players/${bestPartners.received.name}.png`} alt="" onError={(e) => e.target.src = '/mom.png'} /></div>
                  <div className="content">
                    <span className="label">가장 많은 도움을 준 선수</span>
                    <span className="name">{bestPartners.received.name || '기록 없음'}</span>
                    <span className="count">{bestPartners.received.count}도움</span>
                  </div>
                </PHS.PartnerCard>
                {bestPartners.cleanSheet.name && (
                  <PHS.PartnerCard>
                    <div className="avatar"><img src={`/players/${bestPartners.cleanSheet.name}.png`} alt="" onError={(e) => e.target.src = '/mom.png'} /></div>
                    <div className="content">
                      <span className="label">함께 클린시트를 만든 선수</span>
                      <span className="name">{bestPartners.cleanSheet.name}</span>
                      <span className="count">{bestPartners.cleanSheet.count}회</span>
                    </div>
                  </PHS.PartnerCard>
                )}
              </PHS.PartnerGrid>
            </PHS.Section>
          </>
        )}
      </PHS.Container>
    </PHS.OuterWrapper>
  );
};

export default PlayerHistorySection;