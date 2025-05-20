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

// 가장 많이 사용한 포지션 계산
const calculateMostFrequentPosition = async (playerName) => {
  const quartersQuery = collection(db, 'matches');
  const quartersSnapshot = await getDocs(quartersQuery);
  const playerPositions = {};

  quartersSnapshot.forEach((matchDoc) => {
    const quarters = matchDoc.data().quarters || [];
    quarters.forEach((quarter) => {
      quarter.teams.forEach((team) => {
        team.players.forEach((player) => {
          if (player.name === playerName) {
            const unifiedPos = unifyPosition(player.position);
            playerPositions[unifiedPos] = (playerPositions[unifiedPos] || 0) + 1;
          }
        });
      });
    });
  });

  const positionCounts = Object.entries(playerPositions);
  if (positionCounts.length === 0) return 'N/A';

  const sortedPositions = positionCounts.sort((a, b) => b[1] - a[1]);
  const maxCount = sortedPositions[0][1];
  const mostFrequent = sortedPositions
    .filter(([_, count]) => count === maxCount)
    .map(([pos]) => pos);

  return mostFrequent.join(', ');
};

// 선수 데이터 가져오기
const fetchPlayerData = async () => {
  const years = ['2022', '2023', '2024', '2025'];
  const playerStats = {};
  const statsToRank = ['goals', 'assists', 'cleanSheets', 'matches', 'momScore', 'personalPoints'];

  // 연도별 데이터 수집
  for (const year of years) {
    const yearlyStats = {};

    if (year === '2025') {
      const playersRef = collection(db, 'players');
      const playersSnapshot = await getDocs(playersRef);
      playersSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        yearlyStats[docSnap.id] = {
          goals: data.goals || 0,
          assists: data.assists || 0,
          cleanSheets: data.cleanSheets || 0,
          matches: data.matches || 0,
          momScore: data.momScore || 0,
          personalPoints: data.personalPoints || 0,
          position: data.position || 'N/A'
        };
      });
    } else {
      const playersRef = collection(db, 'players');
      const playersSnapshot = await getDocs(playersRef);
      for (const playerDoc of playersSnapshot.docs) {
        const historyRef = doc(db, 'players', playerDoc.id, 'history', year);
        const historyDoc = await getDoc(historyRef);
        const pos = playerDoc.data().position || 'N/A';
        if (historyDoc.exists()) {
          const d = historyDoc.data();
          yearlyStats[playerDoc.id] = {
            goals: d.goals || 0,
            assists: d.assists || 0,
            cleanSheets: d.cleanSheets || 0,
            matches: d.matches || 0,
            momScore: d.momScore || 0,
            personalPoints: d.personalPoints || 0,
            position: pos
          };
        } else {
          yearlyStats[playerDoc.id] = {
            goals: 0,
            assists: 0,
            cleanSheets: 0,
            matches: 0,
            momScore: 0,
            personalPoints: 0,
            position: pos
          };
        }
      }
    }

    // 연도별 랭킹 계산 (최대 10명)
    playerStats[year] = {};
    statsToRank.forEach(stat => {
      const rankings = Object.entries(yearlyStats)
        .map(([id, stats]) => ({
          player: id,
          position: stats.position,
          season: year,
          count: stats[stat]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // 최대 10명

      // 공동 순위 처리
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

  // 통산 데이터 수집
  const careerStats = {};
  const playersRef = collection(db, 'players');
  const playersSnapshot = await getDocs(playersRef);
  for (const playerDoc of playersSnapshot.docs) {
    const pid = playerDoc.id;
    careerStats[pid] = {
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      matches: 0,
      momScore: 0,
      personalPoints: 0,
      position: playerDoc.data().position || 'N/A'
    };
    for (const y of years.filter(y => y !== '2025')) {
      const hRef = doc(db, 'players', pid, 'history', y);
      const hDoc = await getDoc(hRef);
      if (hDoc.exists()) {
        const d = hDoc.data();
        careerStats[pid].goals += d.goals || 0;
        careerStats[pid].assists += d.assists || 0;
        careerStats[pid].cleanSheets += d.cleanSheets || 0;
        careerStats[pid].matches += d.matches || 0;
        careerStats[pid].momScore += d.momScore || 0;
        careerStats[pid].personalPoints += d.personalPoints || 0;
      }
    }
    const pd = playerDoc.data();
    careerStats[pid].goals += pd.goals || 0;
    careerStats[pid].assists += pd.assists || 0;
    careerStats[pid].cleanSheets += pd.cleanSheets || 0;
    careerStats[pid].matches += pd.matches || 0;
    careerStats[pid].momScore += pd.momScore || 0;
    careerStats[pid].personalPoints += pd.personalPoints || 0;
  }

  // 통산 랭킹 계산
  const careerRankings = {};
  statsToRank.forEach(stat => {
    const rankings = Object.entries(careerStats)
      .map(([id, st]) => ({
        player: id,
        position: st.position,
        period: '2022~2025',
        count: st[stat]
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 공동 순위 처리
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

  // 단일 시즌 최다 기록 계산 (최소 10개 보장)
  const seasonRankings = {};
  statsToRank.forEach(stat => {
    let allSeasonStats = [];
    years.forEach(year => {
      const yearStats = playerStats[year][stat];
      allSeasonStats = allSeasonStats.concat(yearStats);
    });

    // count 기준 내림차순 정렬
    allSeasonStats.sort((a, b) => b.count - a.count);

    // 최소 10개 보장
    const topStats = allSeasonStats.slice(0, 10);

    // 공동 순위 처리
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

  // 기타 기록 생성 (n년 연속 득점/출장만)
  const otherRecords = [];
  const topByYear = {};
  years.forEach(y => {
    topByYear[y] = {};
    ['goals', 'matches'].forEach(stat => {
      const arr = playerStats[y][stat];
      if (arr && arr[0]) topByYear[y][stat] = arr[0].player;
    });
  });
  const labelMap = {
    goals: '득점왕',
    matches: '출장'
  };
  ['goals', 'matches'].forEach(stat => {
    for (let i = 0; i < years.length - 1; i++) {
      const y1 = years[i], y2 = years[i + 1];
      if (topByYear[y1][stat] && topByYear[y1][stat] === topByYear[y2][stat]) {
        otherRecords.push({
          position: careerStats[topByYear[y1][stat]].position,
          title: `2년 연속 ${labelMap[stat]}`,
          player: topByYear[y1][stat],
          period: `${y1}~${y2}`
        });
      }
      // 3년 연속 체크
      if (i < years.length - 2) {
        const y3 = years[i + 2];
        if (
          topByYear[y1][stat] &&
          topByYear[y1][stat] === topByYear[y2][stat] &&
          topByYear[y2][stat] === topByYear[y3][stat]
        ) {
          otherRecords.push({
            position: careerStats[topByYear[y1][stat]].position,
            title: `3년 연속 ${labelMap[stat]}`,
            player: topByYear[y1][stat],
            period: `${y1}~${y3}`
          });
        }
      }
    }
  });

  return {
    goals: {
      season: seasonRankings.goals,
      career: careerRankings.goals
    },
    assists: {
      season: seasonRankings.assists,
      career: careerRankings.assists
    },
    cleanSheets: {
      season: seasonRankings.cleanSheets,
      career: careerRankings.cleanSheets
    },
    matches: {
      season: seasonRankings.matches,
      career: careerRankings.matches
    },
    momScore: {
      season: seasonRankings.momScore,
      career: careerRankings.momScore
    },
    personalPoints: {
      season: seasonRankings.personalPoints,
      career: careerRankings.personalPoints
    },
    other: otherRecords,
    careerStats // 선수별 통산 데이터 추가
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

  // 통산 기록 (Top 10 외 포함)
  statsToRank.forEach(stat => {
    const allCareerStats = Object.entries(recordData.careerStats)
      .map(([id, st]) => ({
        player: id,
        position: st.position,
        period: '2022~2025',
        count: st[stat]
      }))
      .sort((a, b) => b.count - a.count);

    // 순위 계산
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

    const careerRecord = allCareerStats.find(record => record.player.toLowerCase() === playerName.toLowerCase());
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
  statsToRank.forEach(stat => {
    const seasonRecords = recordData[stat].season.filter(record => record.player.toLowerCase() === playerName.toLowerCase());
    seasonRecords.forEach(record => {
      playerRecords.season.push({
        stat,
        rank: record.rank,
        count: record.count,
        season: record.season
      });
    });
  });

  // 기타 기록
  playerRecords.other = recordData.other.filter(record => record.player.toLowerCase() === playerName.toLowerCase());

  return playerRecords;
};

const Record = () => {
  const [activeTab, setActiveTab] = useState('goals');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null); // 'career', 'season', 'player', 'search'
  const [recordData, setRecordData] = useState({
    goals: { season: [], career: [] },
    assists: { season: [], career: [] },
    matches: { season: [], career: [] },
    cleanSheets: { season: [], career: [] },
    momScore: { season: [], career: [] },
    personalPoints: { season: [], career: [] },
    other: []
  });
  const [loading, setLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [modalPosition, setModalPosition] = useState('N/A');

  useEffect(() => {
    const loadData = async () => {
      // 퍼센트 애니메이션
      const interval = setInterval(() => {
        setLoadingPercent(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 30); // 3초 동안 100% 도달

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

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;
    const playerRecords = fetchPlayerRecords(searchQuery, recordData);
    const position = await calculateMostFrequentPosition(searchQuery);
    setModalType('search');
    setModalData({ player: searchQuery, records: playerRecords });
    setModalPosition(position);
  };

  const openModal = async (type, data) => {
    setModalType(type);
    setModalData(data);
    if (type === 'player' || type === 'search') {
      const position = await calculateMostFrequentPosition(data.player);
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
      momScore: '점',
      personalPoints: '승점'
    };
    return labels[tab] || '';
  };

  const renderCategoryCards = () => {
    if (activeTab === 'other') {
      const filtered = recordData.other.filter(record =>
        record.player.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return filtered.length > 0 ? (
        filtered.map((record, index) => (
          <S.CategoryCard key={index} onClick={() => openModal('player', record)}>
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
        <S.LoadingSpinner />
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
          <S.Tab active={activeTab === 'other'} onClick={() => handleTabChange('other')}>기타</S.Tab>
        </S.TabContainer>
      </S.Header>

      <S.CategoryContainer>
        {renderCategoryCards()}
      </S.CategoryContainer>

      {modalData && modalType === 'player' && (
        <S.ModalOverlay onClick={closeModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.CloseButton onClick={closeModal}>×</S.CloseButton>
            <h2 style={{ marginBottom: '16px' }}>{modalData.title}</h2>
            <p>선수: <strong>{modalData.player}</strong></p>
            <p>포지션: {modalPosition}</p>
            <p>기간: {modalData.period}</p>
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
              <S.PlayerRecordTitle>기타 기록</S.PlayerRecordTitle>
              {modalData.records.other.length > 0 ? (
                modalData.records.other.map((record, index) => (
                  <S.PlayerRecordItem key={index}>
                    {record.title} ({record.period})
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