import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../App';
import { FaArrowLeft, FaChartLine, FaTrophy, FaMedal, FaAward } from 'react-icons/fa';
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
  const [rankingDataLoading, setRankingDataLoading] = useState(true);
  const [bestPartners, setBestPartners] = useState({
    given: { name: '', count: 0 },
    received: { name: '', count: 0 },
    teamMate: { name: '', count: 0 },
    cleanSheet: { name: '', count: 0 }
  });

  const years = ['2022', '2023', '2024', '2025'];

  const statOptions = [
    { value: 'goals', label: '득점', color: '#8884d8' },
    { value: 'assists', label: '어시스트', color: '#82ca9d' },
    { value: 'cleanSheets', label: '클린시트', color: '#ffc658' },
    { value: 'matches', label: '출장수', color: '#ff8042' },
    { value: 'personalPoints', label: '개인승점', color: '#0088fe' },
    { value: 'momScore', label: 'MOM점수', color: '#9c27b0' },
    { value: 'winRate', label: '승률(%)', color: '#00C49F' }
  ];

  const statRankingToCheck = ['goals', 'assists', 'cleanSheets', 'matches', 'personalPoints'];

  const normalizeTeamName = (name) => {
    return name ? name.trim().toLowerCase() : '';
  };

  // 연도별 통계 랭킹 조회 (동률 순위 처리 추가)
  useEffect(() => {
    const fetchRankingData = async () => {
      setRankingDataLoading(true);
      const rankData = {};
      
      for (const year of years) {
        rankData[year] = {};
        
        try {
          if (year === '2025') {
            const playersRef = collection(db, 'players');
            const playersSnapshot = await getDocs(playersRef);
            
            statRankingToCheck.forEach(stat => {
              const playerStats = [];
              
              playersSnapshot.forEach(doc => {
                const playerData = doc.data();
                if (playerData[stat] > 0) {
                  playerStats.push({
                    id: doc.id,
                    value: playerData[stat] || 0
                  });
                }
              });
              
              // 값 기준으로 내림차순 정렬
              playerStats.sort((a, b) => b.value - a.value);
              
              // 동률 순위 계산
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

              // 상위 3명 추출 (동률 포함 가능)
              const top3 = ranks.slice(0, Math.min(3, ranks.length));
              const playerRank = ranks.find(item => item.id === playerId)?.rank || null;
              
              rankData[year][stat] = {
                top3,
                playerRank
              };
            });
          } else {
            const yearPlayersRef = collection(db, 'yearlyStats', year, 'players');
            const yearPlayersSnapshot = await getDocs(yearPlayersRef);
            
            if (yearPlayersSnapshot.empty) {
              const playersRef = collection(db, 'players');
              const playersSnapshot = await getDocs(playersRef);
              
              const yearlyPlayerStats = [];
              
              for (const playerDoc of playersSnapshot.docs) {
                const historyRef = doc(db, 'players', playerDoc.id, 'history', year);
                const historyDoc = await getDoc(historyRef);
                
                if (historyDoc.exists()) {
                  const historyData = historyDoc.data();
                  if (historyData.matches > 0) {
                    statRankingToCheck.forEach(stat => {
                      if (!yearlyPlayerStats[stat]) yearlyPlayerStats[stat] = [];
                      
                      yearlyPlayerStats[stat].push({
                        id: playerDoc.id,
                        value: historyData[stat] || 0
                      });
                    });
                  }
                }
              }
              
              statRankingToCheck.forEach(stat => {
                if (yearlyPlayerStats[stat]) {
                  yearlyPlayerStats[stat].sort((a, b) => b.value - a.value);
                  
                  // 동률 순위 계산
                  const ranks = [];
                  let currentRank = 1;
                  let currentValue = null;
                  let playersAtCurrentValue = 0;

                  yearlyPlayerStats[stat].forEach((player, index) => {
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

                  const top3 = ranks.slice(0, Math.min(3, ranks.length));
                  const playerRank = ranks.find(item => item.id === playerId)?.rank || null;
                  
                  rankData[year][stat] = {
                    top3,
                    playerRank
                  };
                } else {
                  rankData[year][stat] = { top3: [], playerRank: null };
                }
              });
            } else {
              statRankingToCheck.forEach(stat => {
                const playerStats = [];
                
                yearPlayersSnapshot.forEach(doc => {
                  const playerData = doc.data();
                  if (playerData[stat] > 0) {
                    playerStats.push({
                      id: doc.id,
                      value: playerData[stat] || 0
                    });
                  }
                });
                
                playerStats.sort((a, b) => b.value - a.value);
                
                // 동률 순위 계산
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

                const top3 = ranks.slice(0, Math.min(3, ranks.length));
                const playerRank = ranks.find(item => item.id === playerId)?.rank || null;
                
                rankData[year][stat] = {
                  top3,
                  playerRank
                };
              });
            }
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

  // 연도별 데이터 조회
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = [];
        
        for (const year of years.filter(y => y !== '2025')) {
          const historyRef = doc(db, 'players', playerId, 'history', year);
          const historyDoc = await getDoc(historyRef);

          if (historyDoc.exists()) {
            data.push({
              year,
              ...historyDoc.data(),
            });
          } else {
            data.push({
              year,
              goals: 0,
              assists: 0,
              cleanSheets: 0,
              matches: 0,
              win: 0,
              draw: 0,
              lose: 0,
              winRate: 0,
              personalPoints: 0,
              momScore: 0,
            });
          }
        }
        
        const playerRef = doc(db, 'players', playerId);
        const playerDoc = await getDoc(playerRef);
        
        if (playerDoc.exists()) {
          const currentData = playerDoc.data();
          data.push({
            year: '2025',
            goals: currentData.goals || 0,
            assists: currentData.assists || 0,
            cleanSheets: currentData.cleanSheets || 0,
            matches: currentData.matches || 0,
            win: currentData.win || 0,
            draw: currentData.draw || 0,
            lose: currentData.lose || 0,
            winRate: currentData.winRate || 0,
            personalPoints: currentData.personalPoints || 0,
            momScore: currentData.momScore || 0,
          });
        } else {
          data.push({
            year: '2025',
            goals: 0,
            assists: 0,
            cleanSheets: 0,
            matches: 0,
            win: 0,
            draw: 0,
            lose: 0,
            winRate: 0,
            personalPoints: 0,
            momScore: 0,
          });
        }

        const sorted = data
          .sort((a, b) => parseInt(a.year) - parseInt(b.year))
          .map(record => ({
            ...record,
            winRate: Math.round(record.winRate),
          }));

        setHistoryData(sorted);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('기록을 가져오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [playerId]);

  // 최고의 파트너 조회
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

        const defensivePositions = ['CB1', 'CB2', 'LB', 'RB', 'LWB', 'RWB'];
        let isDefender = false;

        matchesSnapshot.forEach(doc => {
          const match = doc.data();
          if (match.date && new Date(match.date).getFullYear() === 2025) {
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
          if (match.date && new Date(match.date).getFullYear() === 2025) {
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

              if (isDefender) {
                const playerTeam = quarter.teams.find(team => 
                  team.players.some(p => p.name.toLowerCase() === playerId.toLowerCase())
                );
                if (playerTeam) {
                  const opponentTeams = quarter.teams.filter(t => t.name !== playerTeam.name);
                  const opponentGoals = quarter.goalAssistPairs.filter(p => 
                    opponentTeams.some(t => normalizeTeamName(p.goal.team) === normalizeTeamName(t.name))
                  ).length;
                  if (opponentGoals === 0) {
                    playerTeam.players.forEach(player => {
                      if (player.name.toLowerCase() !== playerId.toLowerCase()) {
                        cleanSheetCounts[player.name] = (cleanSheetCounts[player.name] || 0) + 1;
                      }
                    });
                  }
                }
              }

              (quarter.goalAssistPairs || []).forEach(pair => {
                if (pair.assist.player?.toLowerCase() === playerId.toLowerCase() && pair.goal.player) {
                  const goalPlayer = pair.goal.player;
                  givenCounts[goalPlayer] = (givenCounts[goalPlayer] || 0) + 1;
                }
                if (pair.goal.player?.toLowerCase() === playerId.toLowerCase() && pair.assist.player) {
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
        setBestPartners({
          given: { name: '', count: 0 },
          received: { name: '', count: 0 },
          teamMate: { name: '', count: 0 },
          cleanSheet: { name: '', count: 0 }
        });
      }
    };

    if (!loading && historyData.length > 0) {
      fetchBestPartners();
    }
  }, [loading, historyData, playerId]);

  const toggleGraphs = () => {
    setShowGraphs(!showGraphs);
  };

  const getMaxValue = (statKey) => {
    const max = Math.max(...historyData.map(item => item[statKey]));
    return max === 0 ? 10 : Math.ceil(max * 1.2);
  };

  const renderRankingBadge = (year, stat, value) => {
    if (!rankingData[year] || !rankingData[year][stat]) {
      return null;
    }
    
    const rankInfo = rankingData[year][stat];
    const statLabels = {
      goals: '득점',
      assists: '어시스트',
      cleanSheets: '클린시트',
      matches: '출장',
      personalPoints: '개인승점'
    };
    
    const playerRank = rankInfo.top3.find(item => item.id === playerId)?.rank;
    
    if (!playerRank || value === 0) return null;
    
    let icon, color, text;
    
    switch(playerRank) {
      case 1:
        icon = <FaTrophy style={{ color: 'gold', marginRight: '4px' }} />;
        color = 'gold';
        text = `${year}년 ${statLabels[stat]}왕`;
        break;
      case 2:
        icon = <FaMedal style={{ color: 'silver', marginRight: '4px' }} />;
        color = 'silver';
        text = `${year}년 ${statLabels[stat]} 2위`;
        break;
      case 3:
        icon = <FaAward style={{ color: '#cd7f32', marginRight: '4px' }} />;
        color = '#cd7f32';
        text = `${year}년 ${statLabels[stat]} 3위`;
        break;
      default:
        return null;
    }
    
    return (
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        color: color,
        marginTop: '4px'
      }}>
        {icon} {text}
      </div>
    );
  };

  if (loading) {
    return (
      <PHS.OuterWrapper>
        <PHS.Container>
          <p>로딩 중...</p>
        </PHS.Container>
      </PHS.OuterWrapper>
    );
  }

  const hasData = historyData.some(record => record.matches > 0);

  return (
    <PHS.OuterWrapper>
      <PHS.Container>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <PHS.Button onClick={() => navigate('/total')} style={{ marginRight: '10px' }}>
            <FaArrowLeft /> 
          </PHS.Button>
          <h2>{playerId} 연도별 기록</h2>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <PHS.HistoryTable>
          <thead>
            <tr>
              <PHS.HistoryTableHeader>연도</PHS.HistoryTableHeader>
              <PHS.HistoryTableHeader>득점</PHS.HistoryTableHeader>
              <PHS.HistoryTableHeader>어시스트</PHS.HistoryTableHeader>
              <PHS.HistoryTableHeader>클린시트</PHS.HistoryTableHeader>
              <PHS.HistoryTableHeader>출장수</PHS.HistoryTableHeader>
              <PHS.HistoryTableHeader>승/무/패</PHS.HistoryTableHeader>
              <PHS.HistoryTableHeader>승률</PHS.HistoryTableHeader>
              <PHS.HistoryTableHeader>개인승점</PHS.HistoryTableHeader>
              <PHS.HistoryTableHeader>MOM점수</PHS.HistoryTableHeader>
            </tr>
          </thead>
          <tbody>
            {[...historyData].reverse().map((record) => (
              <PHS.HistoryTableRow 
                key={record.year}
                style={record.year === '2025' ? { backgroundColor: 'rgba(66, 134, 244, 0.1)' } : {}}
              >
                <PHS.HistoryTableCell>
                  {record.year === '2025' ? record.year + ' (현재)' : record.year}
                </PHS.HistoryTableCell>
                <PHS.HistoryTableCell>
                  {record.goals}
                  {renderRankingBadge(record.year, 'goals', record.goals)}
                </PHS.HistoryTableCell>
                <PHS.HistoryTableCell>
                  {record.assists}
                  {renderRankingBadge(record.year, 'assists', record.assists)}
                </PHS.HistoryTableCell>
                <PHS.HistoryTableCell>
                  {record.cleanSheets}
                  {renderRankingBadge(record.year, 'cleanSheets', record.cleanSheets)}
                </PHS.HistoryTableCell>
                <PHS.HistoryTableCell>
                  {record.matches}
                  {renderRankingBadge(record.year, 'matches', record.matches)}
                </PHS.HistoryTableCell>
                <PHS.HistoryTableCell>
                  {record.win}/{record.draw}/{record.lose}
                </PHS.HistoryTableCell>
                <PHS.HistoryTableCell>
                  {record.winRate}%
                </PHS.HistoryTableCell>
                <PHS.HistoryTableCell>
                  {record.personalPoints}
                  {renderRankingBadge(record.year, 'personalPoints', record.personalPoints)}
                </PHS.HistoryTableCell>
                <PHS.HistoryTableCell>{record.momScore}</PHS.HistoryTableCell>
              </PHS.HistoryTableRow>
            ))}
          </tbody>
        </PHS.HistoryTable>

        {!hasData ? (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            이 선수의 기록이 없습니다.
          </p>
        ) : (
          <>
            <PHS.RankingSummary>
              <PHS.SectionTitle>수상 기록</PHS.SectionTitle>
              {rankingDataLoading ? (
                <div className="loading">발롱도르에서 트로피 가져오는중...</div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}
                >
                  {years
                    .filter(year => {
                      if (!rankingData[year]) return false;
                      return statRankingToCheck.some(stat => {
                        if (rankingData[year][stat]) {
                          const playerRank = rankingData[year][stat].top3.find(item => item.id === playerId)?.rank;
                          return playerRank && playerRank <= 3 && rankingData[year][stat].top3.find(item => item.id === playerId)?.value > 0;
                        }
                        return false;
                      });
                    })
                    .map(year => (
                      <div key={year} style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                        padding: '12px',
                        width: '200px',
                        flexShrink: 0
                      }}>
                        <h4 style={{
                          margin: '0 0 8px 0',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          paddingBottom: '4px',
                          fontSize: '16px',
                          color: '#ffffff'
                        }}>
                          {year}년 수상 기록
                        </h4>
                        <div>
                          {statRankingToCheck.map((stat, index) => {
                            if (!rankingData[year][stat]) return null;
                            const playerItem = rankingData[year][stat].top3.find(item => item.id === playerId);
                            if (!playerItem) return null;
                            const rank = playerItem.rank;
                            const statValue = playerItem.value;
                            
                            if (statValue <= 0 || rank > 3) return null;
                            
                            const statLabels = {
                              goals: '득점',
                              assists: '어시스트',
                              cleanSheets: '클린시트',
                              matches: '출장',
                              personalPoints: '개인승점'
                            };
                            
                            let icon, color, text;
                            
                            switch(rank) {
                              case 1:
                                icon = <FaTrophy style={{ color: 'gold' }} />;
                                color = 'gold';
                                text = `${statLabels[stat]}왕 (${statValue})`;
                                break;
                              case 2:
                                icon = <FaMedal style={{ color: 'silver' }} />;
                                color = 'silver';
                                text = `${statLabels[stat]} 2위 (${statValue})`;
                                break;
                              case 3:
                                icon = <FaAward style={{ color: '#cd7f32' }} />;
                                color = '#cd7f32';
                                text = `${statLabels[stat]} 3위 (${statValue})`;
                                break;
                              default:
                                return null;
                            }
                            
                            return (
                              <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '6px',
                                color,
                                fontSize: '14px'
                              }}>
                                <span style={{ marginRight: '6px' }}>{icon}</span>
                                <span>{text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </PHS.RankingSummary>

            <PHS.GraphToggleButton onClick={toggleGraphs}>
              <FaChartLine style={{ marginRight: '8px' }} />
              {showGraphs ? '그래프 닫기' : '성장 추이 그래프 보기'}
            </PHS.GraphToggleButton>

            {showGraphs && (
              <PHS.GraphSection>
                <h3>연도별 성장 추이</h3>
                
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

                <PHS.GraphContainer>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={historyData}
                      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, getMaxValue(selectedStat)]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={selectedStat}
                        name={statOptions.find(opt => opt.value === selectedStat)?.label || selectedStat}
                        stroke={statOptions.find(opt => opt.value === selectedStat)?.color || '#8884d8'}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </PHS.GraphContainer>

                <PHS.GraphContainer>
                  <h3>승/무/패 비율</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={historyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="win" name="승" stroke="#FFD700" strokeWidth={2} />
                      <Line type="monotone" dataKey="draw" name="무" stroke="rgb(172, 176, 185)" strokeWidth={2} />
                      <Line type="monotone" dataKey="lose" name="패" stroke="rgb(244, 67, 54)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </PHS.GraphContainer>

                <PHS.GraphContainer>
                  <h3>종합 공격 기여도</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={historyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="goals" name="득점" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="assists" name="어시스트" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </PHS.GraphContainer>
                
                <PHS.GraphContainer>
                  <h3>이번 시즌(2025) 개인 기록 요약</h3>
                  <PHS.SummaryCardContainer>
                    {historyData.find(item => item.year === '2025')?.matches > 0 ? (
                      statOptions.map(stat => {
                        const currentYearData = historyData.find(item => item.year === '2025');
                        return (
                          <PHS.SummaryCard key={stat.value}>
                            <div style={{ color: stat.color, fontSize: '22px', fontWeight: 'bold' }}>
                              {currentYearData[stat.value]}
                              {stat.value === 'winRate' ? '%' : ''}
                            </div>
                            <div style={{ marginTop: '4px', fontSize: '13px', color: '#aaa' }}>
                              {stat.label}
                            </div>
                          </PHS.SummaryCard>
                        );
                      })
                    ) : (
                      <p>2025년 기록이 없습니다.</p>
                    )}
                  </PHS.SummaryCardContainer>
                </PHS.GraphContainer>

                <PHS.GraphContainer>
                  <h3>내 최고의 파트너 (2025)</h3>
                  <PHS.PartnerContainer>
                    <PHS.PartnerCard>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#82ca9d' }}>
                        {bestPartners.given.name || '없음'} ({bestPartners.given.count}회)
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#aaa' }}>
                        가장 많이 어시스트한 파트너
                      </div>
                    </PHS.PartnerCard>
                    <PHS.PartnerCard>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8884d8' }}>
                        {bestPartners.received.name || '없음'} ({bestPartners.received.count}회)
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#aaa' }}>
                        가장 많이 어시스트 받은 파트너
                      </div>
                    </PHS.PartnerCard>
                    <PHS.PartnerCard>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00C49F' }}>
                        {bestPartners.teamMate.name || '없음'} ({bestPartners.teamMate.count}쿼터)
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#aaa' }}>
                        같은 팀 많이 한 파트너
                      </div>
                    </PHS.PartnerCard>
                    <PHS.PartnerCard>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc658' }}>
                        {bestPartners.cleanSheet.name || '없음'} ({bestPartners.cleanSheet.count}회)
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#aaa' }}>
                        같이 클린 시트 많이 한 파트너
                      </div>
                    </PHS.PartnerCard>
                  </PHS.PartnerContainer>
                </PHS.GraphContainer>
              </PHS.GraphSection>
            )}
          </>
        )}
      </PHS.Container>
    </PHS.OuterWrapper>
  );
};

export default PlayerHistorySection;