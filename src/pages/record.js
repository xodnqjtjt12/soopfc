import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import * as S from './recordCss';

const Record = () => {
  const [activeTab, setActiveTab] = useState('goals');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [recordData, setRecordData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [playersSnapshot, matchesSnapshot] = await Promise.all([
          getDocs(collection(db, 'players')),
          getDocs(collection(db, 'matches'))
        ]);

        const players = {};
        playersSnapshot.forEach(doc => {
          players[doc.id] = doc.data();
        });

        const matches = matchesSnapshot.docs.map(doc => doc.data());

        // Process data in a structured way
        const processedData = processAllData(players, matches);
        setRecordData(processedData);

      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const processAllData = (players, matches) => {
    const years = ['2022', '2023', '2024', '2025'];
    const statsToRank = ['goals', 'assists', 'cleanSheets', 'matches', 'momScore', 'personalPoints'];
    
    // Initialize stats containers
    const yearlyStats = {};
    const careerStats = {};
    const playerPositions = {};

    years.forEach(year => { yearlyStats[year] = {}; });

    Object.keys(players).forEach(id => {
      careerStats[id] = { goals: 0, assists: 0, cleanSheets: 0, matches: 0, momScore: 0, personalPoints: 0, position: players[id].position || 'N/A' };
      playerPositions[id] = {};
    });

    // Aggregate stats from matches
    matches.forEach(match => {
        const year = new Date(match.date).getFullYear().toString();
        if (!years.includes(year)) return;

        match.quarters.forEach(quarter => {
            quarter.teams.forEach(team => {
                team.players.forEach(p => {
                    if (players[p.name]) { // Ensure player exists
                        const unifiedPos = p.position.replace(/\d/g, '');
                        playerPositions[p.name][unifiedPos] = (playerPositions[p.name][unifiedPos] || 0) + 1;
                    }
                });
            });
        });
    });

    // Populate yearly and career stats
    Object.keys(players).forEach(id => {
        const pData = players[id];
        // 2025 data
        yearlyStats['2025'][id] = { ...pData, position: pData.position || 'N/A' };
        Object.keys(careerStats[id]).forEach(stat => {
            if(stat !== 'position') careerStats[id][stat] += pData[stat] || 0;
        });

        // History data
        if (pData.history) {
            Object.keys(pData.history).forEach(year => {
                if (yearlyStats[year]) {
                    yearlyStats[year][id] = { ...pData.history[year], position: pData.position || 'N/A' };
                     Object.keys(careerStats[id]).forEach(stat => {
                        if(stat !== 'position') careerStats[id][stat] += pData.history[year][stat] || 0;
                    });
                }
            });
        }
    });

    // Calculate rankings
    const rankings = {};
    years.forEach(year => {
        rankings[year] = {};
        statsToRank.forEach(stat => {
            rankings[year][stat] = getRankings(yearlyStats[year], stat, year);
        });
    });

    rankings['career'] = {};
    statsToRank.forEach(stat => {
        rankings['career'][stat] = getRankings(careerStats, stat, '2022-2025');
    });
    
    // Most frequent position
    const mostFrequentPositions = {};
    Object.keys(playerPositions).forEach(name => {
        const positions = playerPositions[name];
        if (Object.keys(positions).length > 0) {
            mostFrequentPositions[name] = Object.keys(positions).reduce((a, b) => positions[a] > positions[b] ? a : b);
        } else {
            mostFrequentPositions[name] = players[name]?.position || 'N/A';
        }
    });

    return { rankings, yearlyStats, careerStats, mostFrequentPositions };
  };

  const getRankings = (statsObject, stat, period) => {
      if (!statsObject) return [];
      const sorted = Object.entries(statsObject)
          .map(([id, stats]) => ({ player: id, count: stats[stat] || 0, position: stats.position, period }))
          .filter(s => s.count > 0)
          .sort((a, b) => b.count - a.count);

      let rank = 1;
      return sorted.map((s, i) => {
          if (i > 0 && sorted[i-1].count > s.count) {
              rank = i + 1;
          }
          return { ...s, rank };
      });
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') return;
    const playerRecords = getPlayerRecords(searchQuery, recordData);
    setModalType('search');
    setModalData({ player: searchQuery, records: playerRecords });
  };

  const getPlayerRecords = (playerName, data) => {
      if (!data) return { career: [], season: [], other: [] };
      const { rankings, mostFrequentPositions } = data;
      const playerRecords = { career: [], season: [] };
      const lowerPlayerName = playerName.toLowerCase();

      statsToRank.forEach(stat => {
          const careerRank = rankings.career[stat].find(r => r.player.toLowerCase() === lowerPlayerName);
          if(careerRank) playerRecords.career.push({ ...careerRank, stat });

          years.forEach(year => {
              const seasonRank = rankings[year][stat].find(r => r.player.toLowerCase() === lowerPlayerName);
              if(seasonRank) playerRecords.season.push({ ...seasonRank, stat });
          });
      });
      playerRecords.position = mostFrequentPositions[playerName] || 'N/A';
      return playerRecords;
  };

  const openModal = (type, data) => {
    setModalType(type);
    setModalData(data);
  };

  const closeModal = () => {
    setModalData(null);
    setModalType(null);
  };

  const statsToRank = ['goals', 'assists', 'cleanSheets', 'matches', 'momScore', 'personalPoints'];
  const years = ['2022', '2023', '2024', '2025'];

  const filteredData = useMemo(() => {
    if (!recordData) return { season: [], career: [] };
    const { rankings } = recordData;
    
    const season = statsToRank.flatMap(stat => 
        years.flatMap(year => rankings[year][stat])
    ).sort((a,b) => b.count - a.count).slice(0,10);

    const career = rankings.career[activeTab]?.slice(0, 10) || [];

    return { season, career };

  }, [recordData, activeTab]);

  if (loading) {
    return (
      <S.LoadingContainer>
        <S.Football />
        <S.LoadingText>기록을 불러오는 중...</S.LoadingText>
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
          {statsToRank.map(tab => (
            <S.Tab key={tab} active={activeTab === tab} onClick={() => handleTabChange(tab)}>{getLabel(tab)}</S.Tab>
          ))}
        </S.TabContainer>
      </S.Header>

      <S.CategoryContainer>
        <S.CategoryCard onClick={() => openModal('career', filteredData.career)}>
            <S.CategoryTitle>통산 최다 {getLabel(activeTab)}</S.CategoryTitle>
        </S.CategoryCard>
        <S.CategoryCard onClick={() => openModal('season', filteredData.season)}>
            <S.CategoryTitle>단일 시즌 최다 기록</S.CategoryTitle>
        </S.CategoryCard>
      </S.CategoryContainer>

      {modalData && (modalType === 'career' || modalType === 'season') && (
        <S.ModalOverlay onClick={closeModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.CloseButton onClick={closeModal}>×</S.CloseButton>
            <h2>{modalType === 'career' ? `통산 최다 ${getLabel(activeTab)}` : '단일 시즌 최다 기록'}</h2>
            <S.RankingList>
              {modalData.map((record, index) => (
                <S.RankingItem key={index}>
                  <S.RankingPlayer>
                    {record.rank}위 - {record.player} ({record.period})
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
            <h2>{modalData.player}의 기록</h2>
            <p>포지션: {modalData.records.position}</p>
            <S.PlayerRecordSection>
              <S.PlayerRecordTitle>통산 기록</S.PlayerRecordTitle>
              {modalData.records.career.map((record, index) => (
                <S.PlayerRecordItem key={index}>
                  {getLabel(record.stat)}: {record.count} ({record.rank}위)
                </S.PlayerRecordItem>
              ))}
            </S.PlayerRecordSection>
            <S.PlayerRecordSection>
              <S.PlayerRecordTitle>시즌별 기록</S.PlayerRecordTitle>
              {modalData.records.season.map((record, index) => (
                <S.PlayerRecordItem key={index}>
                  {record.season} {getLabel(record.stat)}: {record.count} ({record.rank}위)
                </S.PlayerRecordItem>
              ))}
            </S.PlayerRecordSection>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default Record;
