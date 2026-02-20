import React, { useState, useEffect } from 'react';
import { Search, Trophy, Medal, Hash, Shield, Star, Footprints, HelpingHand, Crown, Shirt, X } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../App';
import * as S from './recordCss';
import LoadingScreen from '../components/LoadingScreen';

// 포지션 통일 함수
const unifyPosition = (position) => {
  const positionMap = {
    'CB1': 'CB', 'CB2': 'CB',
    'CDM1': 'CDM', 'CDM2': 'CDM',
    'CM1': 'CM', 'CM2': 'CM',
  };
  return positionMap[position] || position;
};

// 숫자 포맷팅 함수 (예: 1,000)
const formatNumber = (num) => {
  return num !== undefined && num !== null ? num.toLocaleString() : '0';
};

// 가장 많이 사용한 포지션 계산
const calculateMostFrequentPosition = (playerName, playerPositionsCache) => {
  const positions = playerPositionsCache[playerName] || {};
  const positionCounts = Object.entries(positions);
  if (positionCounts.length === 0) return 'N/A';
  const sortedPositions = positionCounts.sort((a, b) => b[1] - a[1]);
  const maxCount = sortedPositions[0][1];
  const mostFrequent = sortedPositions
    .filter(([_, count]) => count === maxCount)
    .map(([pos]) => pos);
  return mostFrequent.join(', ');
};

// 선수 아바타 컴포넌트
const PlayerAvatar = ({ name, size = 48, folder = 'players' }) => {
  return (
    <img
      src={`/${folder}/${name}.png`}
      alt={name}
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        borderRadius: '50%',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6'
      }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/profile_default.svg';
      }}
    />
  );
};

const getCurrentSeason = () => {
  const now = new Date();
  return now.getFullYear().toString(); // 2026
};

const fetchPlayerData = async () => {
  const currentYear = getCurrentSeason(); // 2026
  const years = ['2022', '2023', '2024', '2025', currentYear];

  const playerStats = {};
  const yearlyStats = {};
  const careerStats = {};
  const playerPositionsCache = {};
  const statsToRank = ['goals', 'assists', 'cleanSheets', 'matches', 'momScore', 'personalPoints'];

  // 1. 모든 선수 기본 정보 가져오기
  const playersRef = collection(db, 'players');
  const playersSnapshot = await getDocs(playersRef);
  const playerDocs = playersSnapshot.docs;

  // 2. 포지션 캐시
  const quartersQuery = collection(db, 'matches');
  const quartersSnapshot = await getDocs(quartersQuery);
  quartersSnapshot.forEach((matchDoc) => {
    const matchData = matchDoc.data();
    const quarters = matchData.quarters || [];
    quarters.forEach((quarter) => {
      quarter.teams.forEach((team) => {
        team.players.forEach((player) => {
          const unifiedPos = unifyPosition(player.position);
          playerPositionsCache[player.name] = playerPositionsCache[player.name] || {};
          playerPositionsCache[player.name][unifiedPos] =
            (playerPositionsCache[player.name][unifiedPos] || 0) + 1;
        });
      });
    });
  });

  // 3. Init Stats
  playerDocs.forEach((playerDoc) => {
    const pid = playerDoc.id;
    const pos = playerDoc.data().position || 'N/A';
    careerStats[pid] = {
      goals: 0, assists: 0, cleanSheets: 0, matches: 0, momScore: 0, personalPoints: 0, position: pos,
    };
    years.forEach((year) => {
      yearlyStats[year] = yearlyStats[year] || {};
      yearlyStats[year][pid] = {
        goals: 0, assists: 0, cleanSheets: 0, matches: 0, momScore: 0, personalPoints: 0, position: pos,
      };
    });
  });

  // 4. Current Season Data
  playerDocs.forEach((playerDoc) => {
    const pid = playerDoc.id;
    const data = playerDoc.data();
    yearlyStats[currentYear][pid] = {
      goals: data.goals || 0,
      assists: data.assists || 0,
      cleanSheets: data.cleanSheets || 0,
      matches: data.matches || 0,
      momScore: data.momScore || 0,
      personalPoints: data.personalPoints || 0,
      position: data.position || 'N/A',
    };
    careerStats[pid].goals += data.goals || 0;
    careerStats[pid].assists += data.assists || 0;
    careerStats[pid].cleanSheets += data.cleanSheets || 0;
    careerStats[pid].matches += data.matches || 0;
    careerStats[pid].momScore += data.momScore || 0;
    careerStats[pid].personalPoints += data.personalPoints || 0;
  });

  // 5. History Data
  const historyPromises = years
    .filter((year) => year !== currentYear)
    .flatMap((year) =>
      playerDocs.map((playerDoc) =>
        getDoc(doc(db, 'players', playerDoc.id, 'history', year)).then((historyDoc) => ({
          pid: playerDoc.id,
          year,
          data: historyDoc.exists() ? historyDoc.data() : null,
        }))
      )
    );

  const historyResults = await Promise.all(historyPromises);

  historyResults.forEach(({ pid, year, data }) => {
    if (data) {
      yearlyStats[year][pid].goals = data.goals || 0;
      yearlyStats[year][pid].assists = data.assists || 0;
      yearlyStats[year][pid].cleanSheets = data.cleanSheets || 0;
      yearlyStats[year][pid].matches = data.matches || 0;
      yearlyStats[year][pid].momScore = data.momScore || 0;
      yearlyStats[year][pid].personalPoints = data.personalPoints || 0;

      careerStats[pid].goals += data.goals || 0;
      careerStats[pid].assists += data.assists || 0;
      careerStats[pid].cleanSheets += data.cleanSheets || 0;
      careerStats[pid].matches += data.matches || 0;
      careerStats[pid].momScore += data.momScore || 0;
      careerStats[pid].personalPoints += data.personalPoints || 0;
    }
  });

  // 6. Yearly Rankings
  for (const year of years) {
    playerStats[year] = {};
    statsToRank.forEach((stat) => {
      const rankings = Object.entries(yearlyStats[year])
        .map(([id, stats]) => ({
          player: id,
          position: stats.position,
          season: year,
          count: stats[stat],
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Rank logic
      let currentRank = 1;
      let previousCount = null;
      rankings.forEach((item, index) => {
        if (index > 0 && item.count === previousCount) {
          item.rank = currentRank;
        } else {
          currentRank = index + 1;
          item.rank = currentRank;
        }
        previousCount = item.count;
      });

      playerStats[year][stat] = rankings;
    });
  }

  // 7. Career Rankings
  const careerRankings = {};
  statsToRank.forEach((stat) => {
    const rankings = Object.entries(careerStats)
      .map(([id, st]) => ({
        player: id,
        position: st.position,
        period: '2022~현재',
        count: st[stat],
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    let currentRank = 1;
    let previousCount = null;
    rankings.forEach((item, index) => {
      if (index > 0 && item.count === previousCount) {
        item.rank = currentRank;
      } else {
        currentRank = index + 1;
        item.rank = currentRank;
      }
      previousCount = item.count;
    });

    careerRankings[stat] = rankings;
  });

  return {
    playerStats, // Yearly Stats { '2025': { goals: [], ... } }
    careerRankings, // Career Stats Top 10 { goals: [], ... }
    yearlyStatsRaw: yearlyStats, // Full Yearly Stats for Search
    careerStatsRaw: careerStats, // Full Career Stats for Search
    playerPositionsCache,
    years
  };
};

const getKeyPlayer = (list) => {
  if (!list || list.length === 0) return null;
  return list[0];
};

const Record = () => {
  const [loading, setLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [recordData, setRecordData] = useState(null);

  // UI States
  const [selectedSeason, setSelectedSeason] = useState('career'); // 'career' or '2026', '2025'...
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const interval = setInterval(() => {
        setLoadingPercent((prev) => (prev >= 100 ? 100 : prev + 1));
      }, 30);
      const data = await fetchPlayerData();
      setRecordData(data);
      setLoading(false);
      clearInterval(interval);
    };
    loadData();
  }, []);

  const closeModal = () => {
    setModalData(null);
    setModalType(null);
  };

  const openModal = (title, list) => {
    setModalType(title);
    setModalData(list);
  };

  // Helper to get current view data
  const getCurrentData = () => {
    if (!recordData) return null;
    if (selectedSeason === 'career') {
      return recordData.careerRankings;
    } else {
      return recordData.playerStats[selectedSeason] || {};
    }
  };

  // Unit Helper
  const getUnit = (key) => {
    const map = {
      goals: '골',
      assists: '개',
      matches: '경기',
      cleanSheets: '회', // Changed to 'times'
      momScore: '점', // Changed from Times
      personalPoints: '점'
    }
    return map[key] || '';
  }

  const getSubTitle = (key) => {
    const map = {
      goals: '득점왕',
      assists: '도움왕',
      matches: '철인',
      cleanSheets: '수비왕', // Changed from Goalkeeper
      momScore: 'MVP',
      personalPoints: '승점왕'
    };
    return map[key] || '';
  }

  if (loading || !recordData) {
    return <LoadingScreen />;
  }

  const currentStats = getCurrentData();
  const topScorer = getKeyPlayer(currentStats?.goals);
  const availableSeasons = ['career', ...[...recordData.years].reverse()]; // ['career', '2026', '2025'...]

  // Icons mapping
  const iconMap = {
    assists: <Footprints size={24} style={{ transform: 'rotate(-90deg)' }} />, // Rotate to look like kick
    matches: <Shirt size={24} />,
    cleanSheets: <Shield size={24} />,
    momScore: <Star size={24} />,
    personalPoints: <Medal size={24} />
  };

  // Grid Items Configuration
  const gridItems = [
    { key: 'assists', title: '최다 도움', color: '#339af0' },
    { key: 'cleanSheets', title: '클린시트', color: '#40c057' },
    { key: 'matches', title: '최다 출장', color: '#7950f2' },
    { key: 'momScore', title: '최다 MOM', color: '#fab005' },
  ];

  return (
    <S.Container>

      {/* Header */}
      <S.Header>
        <S.HeaderLeft>
          <S.Title>명예의 전당 (Hall of Fame)</S.Title>
          <S.Subtitle>SCOOP FC의 역대 최고 기록들을 한눈에 확인하세요.</S.Subtitle>
        </S.HeaderLeft>
        <S.HeaderRight>
          {/* Filter */}
          <S.FilterContainer>
            {availableSeasons.map(season => (
              <S.FilterButton
                key={season}
                active={selectedSeason === season}
                onClick={() => setSelectedSeason(season)}
              >
                {season === 'career' ? '통산' : season}
              </S.FilterButton>
            ))}
          </S.FilterContainer>
          {/* Search */}
          <S.SearchInputContainer>
            <S.SearchInputWrapper>
              <S.SearchInput
                placeholder="닉네임 검색"
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    const name = e.target.value.trim();
                    if (!name) return;
                    // Assuming 'players' and 'yearlyStats' are available in scope or passed as props
                    // This part of the code was not provided in the original context,
                    // so I'm making an assumption based on the instruction's provided code.
                    // If 'players' and 'yearlyStats' are not globally available,
                    // this will need to be adjusted by the user.
                    const players = Object.keys(recordData.careerStatsRaw).map(id => ({ id: id, name: id })); // Mock players array
                    const yearlyStats = recordData.yearlyStatsRaw; // Use the fetched yearlyStatsRaw
                    const p = players.find((x) => x.name === name);
                    if (p) {
                      // The original instruction's `handlePlayerClick` is not defined in the provided context.
                      // I'm replacing it with the logic that was previously in the `onKeyDown` handler
                      // to open the player detail modal, which seems to be the intended behavior.
                      setModalType('player_detail');
                      setModalData({
                        name: p.name,
                        career: recordData.careerStatsRaw[p.id],
                        yearly: recordData.yearlyStatsRaw
                      });
                    } else {
                      alert('선수를 찾을 수 없습니다.');
                    }
                  }
                }}
              />
              <Search size={18} color="#adb5bd" className="search-icon" />
            </S.SearchInputWrapper>
          </S.SearchInputContainer>
        </S.HeaderRight>
      </S.Header>

      <S.DashboardGrid>
        {/* Hot Record (Hero) - Goals */}
        <S.HeroCardWrapper onClick={() => openModal(`${selectedSeason === 'career' ? '통산' : selectedSeason} 최다 득점`, currentStats?.goals)}>
          <S.HeroCard>
            <S.HeroHeader>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <S.HotRecordBadge>HOT RECORD</S.HotRecordBadge>
                <S.HeroTitle>
                  {selectedSeason === 'career' ? '통산' : selectedSeason} 최다 득점
                </S.HeroTitle>
              </div>
              <S.HeroIcon>
                <Crown size={20} fill="#fab005" stroke="none" />
              </S.HeroIcon>
            </S.HeroHeader>

            <S.HeroContent>
              {topScorer ? (
                <>
                  <S.HeroImageWrapper>
                    {/* Changed Image Structure */}
                    <S.HeroImage src={`/players2/${topScorer.player}.png`} onError={(e) => e.target.src = '/profile_default.svg'} />
                  </S.HeroImageWrapper>
                  <S.HeroPlayerName>
                    {topScorer.player}
                    <S.HeroPlayerPosition>{calculateMostFrequentPosition(topScorer.player, recordData.playerPositionsCache)}</S.HeroPlayerPosition>
                  </S.HeroPlayerName>
                  <S.HeroStatValue>
                    {formatNumber(topScorer.count)}
                    <span>골</span>
                  </S.HeroStatValue>
                </>
              ) : (
                <div style={{ color: '#adb5bd' }}>기록 없음</div>
              )}
            </S.HeroContent>

            {topScorer && currentStats?.goals?.length > 1 && (
              <S.HeroFooter>
                {topScorer.count === currentStats.goals[1].count ? (
                  <span>공동 1위: {currentStats.goals[1].player} ({formatNumber(currentStats.goals[1].count)}골)</span>
                ) : (
                  <span>2위: {currentStats.goals[1].player} ({formatNumber(currentStats.goals[1].count)}골)</span>
                )}
                <span>전체 순위 보기 &gt;</span>
              </S.HeroFooter>
            )}
          </S.HeroCard>
        </S.HeroCardWrapper>

        {/* Grid Items */}
        {gridItems.map((item) => {
          const topPlayer = getKeyPlayer(currentStats?.[item.key]);

          return (
            <S.GridCard key={item.key} onClick={() => openModal(`${selectedSeason === 'career' ? '통산' : selectedSeason} ${item.title}`, currentStats?.[item.key])}>
              <S.GridHeader>
                <div>
                  <S.GridTitle>{selectedSeason === 'career' ? '통산' : ''} {item.title}</S.GridTitle>
                  <S.GridSubtitle>{getSubTitle(item.key)}</S.GridSubtitle>
                </div>
                <S.GridIcon style={{ backgroundColor: `${item.color}1a`, color: item.color }}>
                  {/* Clone element to force fill color if needed, or rely on currentColor fill in icons */}
                  {React.cloneElement(iconMap[item.key], { fill: item.color, stroke: 'none' })}
                </S.GridIcon>
              </S.GridHeader>

              <S.GridContent>
                {topPlayer ? (
                  <>
                    <S.GridProfileWrapper>
                      <S.GridProfile src={`/players/${topPlayer.player}.png`} onError={(e) => e.target.src = '/profile_default.svg'} />
                      {/* Removed MiniRankBadge */}
                    </S.GridProfileWrapper>
                    <S.GridInfo>
                      <S.GridPlayerName>{topPlayer.player}</S.GridPlayerName>
                      <S.GridStatValue color={item.color}>
                        {formatNumber(topPlayer.count)}
                        <span>{getUnit(item.key)}</span>
                      </S.GridStatValue>
                    </S.GridInfo>
                  </>
                ) : (
                  <div style={{ color: '#adb5bd', fontSize: '14px' }}>기록 없음</div>
                )}
              </S.GridContent>
            </S.GridCard>
          );
        })}
      </S.DashboardGrid>

      {/* Modal */}
      {/* Modal */}
      {modalData && (
        <S.ModalOverlay onClick={closeModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            {modalType === 'player_detail' ? (
              /* Player Detail Modal Content */
              <div>
                <S.ModalHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <PlayerAvatar name={modalData.name} size={64} />
                    <S.ModalTitle>{modalData.name}</S.ModalTitle>
                  </div>
                  <S.CloseButton onClick={closeModal}>
                    <X size={24} strokeWidth={1.5} />
                  </S.CloseButton>
                </S.ModalHeader>

                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '2px solid #f1f3f5', paddingBottom: '8px' }}>통산 기록</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {['goals', 'assists', 'cleanSheets', 'matches', 'momScore', 'personalPoints'].map(stat => {
                    // Calculate Rank
                    const sorted = Object.entries(recordData.careerStatsRaw).sort((a, b) => b[1][stat] - a[1][stat]);
                    const rank = sorted.findIndex(([pid]) => pid === modalData.name) + 1;
                    const labels = { goals: '골', assists: '어시스트', cleanSheets: '클린시트', matches: '경기', momScore: '파워랭킹', personalPoints: '승점' };

                    return (
                      <div key={stat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                        <span style={{ color: '#495057' }}>{labels[stat]}:</span>
                        <span style={{ fontWeight: '600' }}>{formatNumber(modalData.career[stat])} ({rank}위)</span>
                      </div>
                    );
                  })}
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '2px solid #f1f3f5', paddingBottom: '8px' }}>단일 시즌 기록</h3>
                <S.TableWrapper>
                  <S.RecordTableWrapper>
                    <S.RecordTable>
                      <thead>
                        <tr>
                          <S.TableHeader>시즌</S.TableHeader>
                          <S.TableHeader>경기</S.TableHeader>
                          <S.TableHeader>골</S.TableHeader>
                          <S.TableHeader>도움</S.TableHeader>
                          <S.TableHeader>클린</S.TableHeader>
                          <S.TableHeader>MOM</S.TableHeader>
                          <S.TableHeader>승점</S.TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {recordData.years.slice().reverse().map(year => {
                          const stats = modalData.yearly[year]?.[modalData.name];
                          if (!stats) return null;

                          const getRank = (key) => {
                            const yearData = recordData.yearlyStatsRaw?.[year];
                            if (!yearData) return '-';
                            const sorted = Object.entries(yearData).sort((a, b) => b[1][key] - a[1][key]);
                            const rank = sorted.findIndex(([pid]) => pid === modalData.name) + 1;
                            return rank > 0 ? `${rank}위` : '-';
                          };

                          return (
                            <S.TableRow key={year}>
                              <S.TableCell className="season">{year}</S.TableCell>
                              <S.TableCell>
                                {stats.matches}
                                <div className="rank">({getRank('matches')})</div>
                              </S.TableCell>
                              <S.TableCell>
                                {stats.goals}
                                <div className="rank">({getRank('goals')})</div>
                              </S.TableCell>
                              <S.TableCell>
                                {stats.assists}
                                <div className="rank">({getRank('assists')})</div>
                              </S.TableCell>
                              <S.TableCell>
                                {stats.cleanSheets}
                                <div className="rank">({getRank('cleanSheets')})</div>
                              </S.TableCell>
                              <S.TableCell>
                                {formatNumber(stats.momScore)}
                                <div className="rank">({getRank('momScore')})</div>
                              </S.TableCell>
                              <S.TableCell>
                                {formatNumber(stats.personalPoints)}
                                <div className="rank">({getRank('personalPoints')})</div>
                              </S.TableCell>
                            </S.TableRow>
                          );
                        })}
                      </tbody>
                    </S.RecordTable>
                  </S.RecordTableWrapper>
                </S.TableWrapper>
              </div>
            ) : (
              /* Standard Ranking Modal */
              <>
                <S.ModalHeader>
                  <S.ModalTitle>{modalType}</S.ModalTitle>
                  <S.CloseButton onClick={closeModal}>
                    <X size={24} strokeWidth={1.5} />
                  </S.CloseButton>
                </S.ModalHeader>
                <S.RankList>
                  {modalData.map((record, index) => (
                    <S.RankItem key={index}>
                      <S.RankNum>
                        {record.rank === 1 ? (
                          <Crown size={24} fill="#fab005" color="#fab005" />
                        ) : (
                          record.rank
                        )}
                      </S.RankNum>
                      <PlayerAvatar
                        name={record.player}
                        size={40}
                        folder={modalType?.includes('최다 득점') ? 'players2' : 'players'}
                      />
                      <S.RankName>
                        {record.player}
                        <div style={{ fontSize: '12px', color: '#adb5bd', fontWeight: 400 }}>
                          {selectedSeason === 'career' ? '2022~현재' : `${selectedSeason} 시즌`}
                        </div>
                      </S.RankName>
                      <S.RankValue>{formatNumber(record.count)}</S.RankValue>
                    </S.RankItem>
                  ))}
                </S.RankList>
              </>
            )}
          </S.ModalContent >
        </S.ModalOverlay >
      )}

    </S.Container >
  );
};

export default Record;