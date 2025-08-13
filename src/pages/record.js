import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../App';
import * as S from './recordCss';

// 포지션 통일 함수
const unifyPosition = (position) => {
  const positionMap = {
    'CB1': 'CB',
    'CB2': 'CB',
    'CDM1': 'CDM',
    'CDM2': 'CDM',
    'CM1': 'CM',
    'CM2': 'CM',
  };
  return positionMap[position] || position;
};

// 가장 많이 사용한 포지션 계산 (캐싱된 포지션 사용)
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

// 선수 데이터 가져오기 (최적화된 버전)
const fetchPlayerData = async () => {
  const years = ['2022', '2023', '2024', '2025'];
  const playerStats = {};
  const yearlyStats = {};
  const careerStats = {};
  const playerPositionsCache = {}; // 포지션 캐싱
  const statsToRank = ['goals', 'assists', 'cleanSheets', 'matches', 'momScore', 'personalPoints'];

  // 선수 기본 데이터와 포지션 캐싱
  const playersRef = collection(db, 'players');
  const playersSnapshot = await getDocs(playersRef);
  const playerDocs = playersSnapshot.docs;

  // 포지션 데이터 수집 (matches 컬렉션에서)
  const quartersQuery = collection(db, 'matches');
  const quartersSnapshot = await getDocs(quartersQuery);
  quartersSnapshot.forEach((matchDoc) => {
    const quarters = matchDoc.data().quarters || [];
    quarters.forEach((quarter) => {
      quarter.teams.forEach((team) => {
        team.players.forEach((player) => {
          const unifiedPos = unifyPosition(player.position);
          playerPositionsCache[player.name] = playerPositionsCache[player.name] || {};
          playerPositionsCache[player.name][unifiedPos] = (playerPositionsCache[player.name][unifiedPos] || 0) + 1;
        });
      });
    });
  });

  // 연도별 및 통산 데이터 초기화
  playerDocs.forEach((playerDoc) => {
    const pid = playerDoc.id;
    const pos = playerDoc.data().position || 'N/A';
    careerStats[pid] = {
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      matches: 0,
      momScore: 0,
      personalPoints: 0,
      position: pos
    };
    years.forEach((year) => {
      yearlyStats[year] = yearlyStats[year] || {};
      yearlyStats[year][pid] = {
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        matches: 0,
        momScore: 0,
        personalPoints: 0,
        position: pos
      };
    });
  });

  // 2025년 데이터 수집
  playerDocs.forEach((playerDoc) => {
    const pid = playerDoc.id;
    const data = playerDoc.data();
    yearlyStats['2025'][pid] = {
      goals: data.goals || 0,
      assists: data.assists || 0,
      cleanSheets: data.cleanSheets || 0,
      matches: data.matches || 0,
      momScore: data.momScore || 0,
      personalPoints: data.personalPoints || 0,
      position: data.position || 'N/A'
    };
    careerStats[pid].goals += data.goals || 0;
    careerStats[pid].assists += data.assists || 0;
    careerStats[pid].cleanSheets += data.cleanSheets || 0;
    careerStats[pid].matches += data.matches || 0;
    careerStats[pid].momScore += data.momScore || 0;
    careerStats[pid].personalPoints += data.personalPoints || 0;
  });

  // 과거 연도 데이터 병렬 수집
  const historyPromises = years
    .filter((year) => year !== '2025')
    .flatMap((year) =>
      playerDocs.map((playerDoc) =>
        getDoc(doc(db, 'players', playerDoc.id, 'history', year)).then((historyDoc) => ({
          pid: playerDoc.id,
          year,
          data: historyDoc.exists() ? historyDoc.data() : null
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

  // 연도별 랭킹 계산
  for (const year of years) {
    playerStats[year] = {};
    statsToRank.forEach((stat) => {
      const rankings = Object.entries(yearlyStats[year])
        .map(([id, stats]) => ({
          player: id,
          position: stats.position,
          season: year,
          count: stats[stat]
        }))
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

      playerStats[year][stat] = rankings;
    });
  }

  // 통산 랭킹 계산
  const careerRankings = {};
  statsToRank.forEach((stat) => {
    const rankings = Object.entries(careerStats)
      .map(([id, st]) => ({
        player: id,
        position: st.position,
        period: '2022~2025',
        count: st[stat]
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

  // 단일 시즌 최다 기록 계산
  const seasonRankings = {};
  statsToRank.forEach((stat) => {
    let allSeasonStats = [];
    years.forEach((year) => {
      const yearStats = playerStats[year][stat];
      allSeasonStats = allSeasonStats.concat(yearStats);
    });

    allSeasonStats.sort((a, b) => b.count - a.count);
    const topStats = allSeasonStats.slice(0, 10);

    let currentRank = 1;
    let previousCount = null;
    topStats.forEach((item, index) => {
      if (index > 0 && item.count === previousCount) {
        item.rank = currentRank;
      } else {
        currentRank = index + 1;
        item.rank = currentRank;
      }
      previousCount = item.count;
    });

    seasonRankings[stat] = topStats;
  });

  // 기타 기록 생성 (명예의 전당)
  const otherRecords = [];
  const topByYear = {};
  years.forEach((y) => {
    topByYear[y] = {};
    ['goals', 'matches'].forEach((stat) => {
      const arr = playerStats[y][stat];
      if (arr && arr[0]) topByYear[y][stat] = arr[0].player;
    });
  });

  const labelMap = {
    goals: '득점왕',
    matches: '출장왕'
  };

  // 연속 기록 자동화
  ['goals', 'matches'].forEach((stat) => {
    const players = new Set(Object.values(topByYear).map((yearData) => yearData[stat]).filter(Boolean));
    players.forEach((player) => {
      let streak = 1;
      let streakStartYear = null;
      for (let i = 0; i < years.length; i++) {
        const currentYear = years[i];
        const nextYear = years[i + 1];

        if (topByYear[currentYear][stat] === player) {
          if (streak === 1) streakStartYear = currentYear;
          if (nextYear && topByYear[nextYear][stat] === player) {
            streak++;
          } else {
            if (streak >= 2) {
              otherRecords.push({
                position: careerStats[player].position,
                title: `${streak}년 연속 ${labelMap[stat]}`,
                player,
                period: `${streakStartYear}~${currentYear}`,
                stats: {
                  matches: careerStats[player].matches,
                  goals: careerStats[player].goals,
                  assists: careerStats[player].assists
                }
              });
            }
            streak = 1;
            streakStartYear = null;
          }
        }
      }
    });
  });

  // 새로운 클럽 기록 추가 (10-10, 20-20, 30-30 등)
  const clubs = [
    { min: 10, max: 19, title: '10-10 클럽 가입' },
    { min: 20, max: 29, title: '20-20 클럽 가입' },
    { min: 30, max: 39, title: '30-30 클럽 가입' },
  ];

  clubs.forEach((club) => {
    Object.entries(careerStats).forEach(([pid, stats]) => {
      if (
        stats.goals >= club.min && stats.goals <= club.max &&
        stats.assists >= club.min && stats.assists <= club.max
      ) {
        otherRecords.push({
          position: stats.position,
          title: club.title,
          player: pid,
          period: '2022~2025',
          stats: {
            matches: stats.matches,
            goals: stats.goals,
            assists: stats.assists
          }
        });
      }
    });
  });

  return {
    goals: { season: seasonRankings.goals, career: careerRankings.goals },
    assists: { season: seasonRankings.assists, career: careerRankings.assists },
    cleanSheets: { season: seasonRankings.cleanSheets, career: careerRankings.cleanSheets },
    matches: { season: seasonRankings.matches, career: careerRankings.matches },
    momScore: { season: seasonRankings.momScore, career: careerRankings.momScore },
    personalPoints: { season: seasonRankings.personalPoints, career: careerRankings.personalPoints },
    other: otherRecords,
    careerStats,
    yearlyStats,
    playerPositionsCache
  };
};

// 선수별 기록 검색 함수
const fetchPlayerRecords = (playerName, recordData) => {
  const statsToRank = ['goals', 'assists', 'cleanSheets', 'matches', 'momScore', 'personalPoints'];
  const playerRecords = {
    career: [],
    season: [],
    other: []
  };

  // 통산 기록
  statsToRank.forEach((stat) => {
    const allCareerStats = Object.entries(recordData.careerStats)
      .map(([id, st]) => ({
        player: id,
        position: st.position,
        period: '2022~2025',
        count: st[stat]
      }))
      .sort((a, b) => b.count - a.count);

    let currentRank = 1;
    let previousCount = null;
    allCareerStats.forEach((item, index) => {
      if (index > 0 && item.count === previousCount) {
        item.rank = currentRank;
      } else {
        currentRank = index + 1;
        item.rank = currentRank;
      }
      previousCount = item.count;
    });

    const careerRecord = allCareerStats.find((record) => record.player.toLowerCase() === playerName.toLowerCase());
    if (careerRecord && careerRecord.count > 0) {
      playerRecords.career.push({
        stat,
        rank: careerRecord.rank,
        count: careerRecord.count,
        period: careerRecord.period
      });
    }
  });

  // 단일 시즌 기록
  statsToRank.forEach((stat) => {
    Object.keys(recordData.yearlyStats).forEach((year) => {
      const allSeasonStats = Object.entries(recordData.yearlyStats[year])
        .map(([id, stats]) => ({
          player: id,
          position: stats.position,
          season: year,
          count: stats[stat]
        }))
        .sort((a, b) => b.count - a.count);

      let currentRank = 1;
      let previousCount = null;
      allSeasonStats.forEach((item, index) => {
        if (index > 0 && item.count === previousCount) {
          item.rank = currentRank;
        } else {
          currentRank = index + 1;
          item.rank = currentRank;
        }
        previousCount = item.count;
      });

      const seasonRecord = allSeasonStats.find((record) => record.player.toLowerCase() === playerName.toLowerCase());
      if (seasonRecord && seasonRecord.count > 0) {
        playerRecords.season.push({
          stat,
          rank: seasonRecord.rank,
          count: seasonRecord.count,
          season: seasonRecord.season
        });
      }
    });
  });

  // 기타 기록 (클럽 기록 포함)
  playerRecords.other = recordData.other.filter((record) => record.player.toLowerCase() === playerName.toLowerCase());

  return playerRecords;
};

const Record = () => {
  const [activeTab, setActiveTab] = useState('goals');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [recordData, setRecordData] = useState({
    goals: { season: [], career: [] },
    assists: { season: [], career: [] },
    matches: { season: [], career: [] },
    cleanSheets: { season: [], career: [] },
    momScore: { season: [], career: [] },
    personalPoints: { season: [], career: [] },
    other: [],
    playerPositionsCache: {}
  });
  const [loading, setLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [modalPosition, setModalPosition] = useState('N/A');

  useEffect(() => {
    const loadData = async () => {
      const interval = setInterval(() => {
        setLoadingPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 30);

      const data = await fetchPlayerData();
      setRecordData(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') return;
    const playerRecords = fetchPlayerRecords(searchQuery, recordData);
    const position = calculateMostFrequentPosition(searchQuery, recordData.playerPositionsCache);
    setModalType('search');
    setModalData({ player: searchQuery, records: playerRecords });
    setModalPosition(position);
  };

  const openModal = (type, data) => {
    setModalType(type);
    setModalData(data);
    if (type === 'player' || type === 'search') {
      const position = calculateMostFrequentPosition(data.player, recordData.playerPositionsCache);
      setModalPosition(position);
    } else {
      setModalPosition('N/A');
    }
  };

  const closeModal = () => {
    setModalData(null);
    setModalType(null);
    setModalPosition('N/A');
  };

  const getLabel = (tab) => {
    const labels = {
      goals: '골',
      assists: '어시스트',
      cleanSheets: '클린시트',
      matches: '경기',
      momScore: '파워랭킹',
      personalPoints: '승점'
    };
    return labels[tab] || '';
  };

  const renderCategoryCards = () => {
    if (activeTab === 'other') {
      const filtered = recordData.other.filter((record) =>
        record.player.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return filtered.length > 0 ? (
        filtered.map((record, index) => (
          <S.CategoryCard key={`${record.player}-${record.title}-${record.period}`} onClick={() => openModal('player', record)}>
            <S.CategoryTitle>{record.title}</S.CategoryTitle>
          </S.CategoryCard>
        ))
      ) : (
        <S.NoResults>검색 결과가 없습니다.</S.NoResults>
      );
    }

    const careerTitle = `통산 최다 ${getLabel(activeTab)}`;
    const seasonTitle = `단일 시즌 최다 ${getLabel(activeTab)}`;
    return (
      <>
        <S.CategoryCard onClick={() => openModal('career', recordData[activeTab].career)}>
          <S.CategoryTitle>{careerTitle}</S.CategoryTitle>
        </S.CategoryCard>
        <S.CategoryCard onClick={() => openModal('season', recordData[activeTab].season)}>
          <S.CategoryTitle>{seasonTitle}</S.CategoryTitle>
        </S.CategoryCard>
      </>
    );
  };

  if (loading) {
    return (
      <S.LoadingContainer>
        <S.Football />
        <S.LoadingText>기록을 불러오는 중...</S.LoadingText>
        <S.LoadingPercentage>{loadingPercent}%</S.LoadingPercentage>
      </S.LoadingContainer>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <S.Title>기록실</S.Title>
        <S.SearchContainer>
          <S.SearchIconWrapper>
            <Search size={20} />
          </S.SearchIconWrapper>
          <S.SearchInput
            type="text"
            placeholder="선수 이름을 검색하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </S.SearchContainer>
        <S.TabContainer>
          <S.Tab active={activeTab === 'goals'} onClick={() => handleTabChange('goals')}>득점</S.Tab>
          <S.Tab active={activeTab === 'assists'} onClick={() => handleTabChange('assists')}>어시스트</S.Tab>
          <S.Tab active={activeTab === 'cleanSheets'} onClick={() => handleTabChange('cleanSheets')}>클린시트</S.Tab>
          <S.Tab active={activeTab === 'matches'} onClick={() => handleTabChange('matches')}>출장</S.Tab>
          <S.Tab active={activeTab === 'momScore'} onClick={() => handleTabChange('momScore')}>MOM</S.Tab>
          <S.Tab active={activeTab === 'personalPoints'} onClick={() => handleTabChange('personalPoints')}>개인 승점</S.Tab>
          <S.Tab active={activeTab === 'other'} onClick={() => handleTabChange('other')}>명예의 전당</S.Tab>
        </S.TabContainer>
      </S.Header>

      <S.CategoryContainer>
        {renderCategoryCards()}
      </S.CategoryContainer>

      {modalData && modalType === 'player' && (
        <S.ModalOverlay onClick={closeModal}>
          <S.ModalContent isOther={activeTab === 'other'} onClick={(e) => e.stopPropagation()}>
            <S.CloseButton onClick={closeModal}>×</S.CloseButton>
            <S.WinnerBadge>🏆</S.WinnerBadge>
            <h2 style={{ marginBottom: '16px' }}>{modalData.title}</h2>
            <p>선수: <strong>{modalData.player}</strong></p>
            <p>포지션: {modalPosition}</p>
            <p>기간: {modalData.period}</p>
            {modalData.stats && (
              <S.StatsContainer>
                <S.StatItem>경기수: {modalData.stats.matches}경기</S.StatItem>
                <S.StatItem>득점: {modalData.stats.goals}골</S.StatItem>
                <S.StatItem>어시스트: {modalData.stats.assists}어시스트</S.StatItem>
              </S.StatsContainer>
            )}
            {modalData.count !== undefined && (
              <p>기록: <strong>{modalData.count} {getLabel(activeTab)}</strong></p>
            )}
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {modalData && (modalType === 'career' || modalType === 'season') && (
        <S.ModalOverlay onClick={closeModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.CloseButton onClick={closeModal}>×</S.CloseButton>
            <h2 style={{ marginBottom: '16px' }}>
              {modalType === 'career' ? `통산 최다 ${getLabel(activeTab)}` : `단일 시즌 최다 ${getLabel(activeTab)}`}
            </h2>
            <S.RankingList>
              {modalData.map((record, index) => (
                <S.RankingItem key={index} onClick={() => openModal('player', { ...record, title: `${record.rank}위 - ${record.player}` })}>
                  <S.RankingPlayer>
                    {record.rank}위 - {record.player} ({modalType === 'season' ? `${record.season}${record.season === '2025' ? ' (현재 시즌)' : ''}` : record.period})
                  </S.RankingPlayer>
                  <S.RankingCount>{record.count} {getLabel(activeTab)}</S.RankingCount>
                </S.RankingItem>
              ))}
            </S.RankingList>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {modalData && modalType === 'search' && (
        <S.ModalOverlay onClick={closeModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.CloseButton onClick={closeModal}>×</S.CloseButton>
            <h2 style={{ marginBottom: '16px' }}>{modalData.player}의 기록</h2>
            <p>포지션: {modalPosition}</p>
            
            <S.PlayerRecordSection>
              <S.PlayerRecordTitle>통산 기록</S.PlayerRecordTitle>
              {modalData.records.career.length > 0 ? (
                modalData.records.career.map((record, index) => (
                  <S.PlayerRecordItem key={index}>
                    {getLabel(record.stat)}: {record.count} {getLabel(record.stat)} ({record.rank}위, {record.period})
                  </S.PlayerRecordItem>
                ))
              ) : (
                <S.PlayerRecordItem>기록 없음</S.PlayerRecordItem>
              )}
            </S.PlayerRecordSection>

            <S.PlayerRecordSection>
              <S.PlayerRecordTitle>단일 시즌 기록</S.PlayerRecordTitle>
              {modalData.records.season.length > 0 ? (
                modalData.records.season.map((record, index) => (
                  <S.PlayerRecordItem key={index}>
                    {getLabel(record.stat)}: {record.count} {getLabel(record.stat)} ({record.rank}위, {record.season}{record.season === '2025' ? ' (현재 시즌)' : ''})
                  </S.PlayerRecordItem>
                ))
              ) : (
                <S.PlayerRecordItem>기록 없음</S.PlayerRecordItem>
              )}
            </S.PlayerRecordSection>

            <S.PlayerRecordSection>
              <S.PlayerRecordTitle>명예의 전당</S.PlayerRecordTitle>
              {modalData.records.other.length > 0 ? (
                modalData.records.other.map((record, index) => (
                  <S.PlayerRecordItem key={`${record.player}-${record.title}-${record.period}`}>
                    <S.WinnerRecord>
                      {record.title} ({record.period})
                      {record.stats && (
                        <S.StatsContainer>
                          <S.StatItem>경기수: {record.stats.matches}경기</S.StatItem>
                          <S.StatItem>득점: {record.stats.goals}골</S.StatItem>
                          <S.StatItem>어시스트: {record.stats.assists}어시스트</S.StatItem>
                        </S.StatsContainer>
                      )}
                    </S.WinnerRecord>
                  </S.PlayerRecordItem>
                ))
              ) : (
                <S.PlayerRecordItem>기록 없음</S.PlayerRecordItem>
              )}
            </S.PlayerRecordSection>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default Record;