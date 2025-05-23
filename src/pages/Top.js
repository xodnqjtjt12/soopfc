import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../App';
import * as Styles from './Top10Css';

// 메달 컴포넌트
const Medal = ({ rank }) => {
  const images = {
    1: '/trophy.png', // 금
    2: '/2.png',      // 은
    3: '/3.png',      // 동
  };
  const src = images[rank] || '';

  return <Styles.Medal src={src} rank={rank} alt={`Rank ${rank} Medal`} />;
};

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
const calculateMostFrequentPosition = async (playerName, year) => {
  if (year !== '2025') return null;

  const quartersQuery = query(collection(db, 'matches'));
  const quartersSnapshot = await getDocs(quartersQuery);
  const playerPositions = {};

  quartersSnapshot.forEach((matchDoc) => {
    const matchData = matchDoc.data();
    const matchYear = matchData.date ? new Date(matchData.date).getFullYear().toString() : null;
    if (matchYear !== year) return;

    const quarters = matchData.quarters || [];
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

const TOP = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchNickname, setSearchNickname] = useState('');
  const [fullRankingSearch, setFullRankingSearch] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);
  const [showMorePopup, setShowMorePopup] = useState(null);
  const [positions, setPositions] = useState({});
  const [sortKey, setSortKey] = useState('matches');
  const [currentYear, setCurrentYear] = useState('2025');
  const [hasData, setHasData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const fullRankingRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    fetchPlayers(currentYear);

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentYear]);

  const fetchPlayers = async (year) => {
    try {
      let playerData = [];

      if (year === '2025') {
        const snap = await getDocs(collection(db, 'players'));
        playerData = snap.docs.map((doc) => doc.data());
        setHasData(playerData.length > 0);
      } else {
        const snap = await getDocs(collection(db, 'players'));
        const yearlyDataPromises = snap.docs.map(async (playerDoc) => {
          const historyRef = doc(db, 'players', playerDoc.id, 'history', year);
          const historyDoc = await getDoc(historyRef);
          if (historyDoc.exists()) {
            const historyData = historyDoc.data();
            if (historyData.matches > 0) {
              return {
                ...historyData,
                name: playerDoc.data().name,
              };
            }
          }
          return null;
        });

        const yearlyData = (await Promise.all(yearlyDataPromises)).filter(data => data !== null);
        playerData = yearlyData.map(data => ({
          ...data,
          goals: data.goals || 0,
          assists: data.assists || 0,
          cleanSheets: data.cleanSheets || 0,
          matches: data.matches || 0,
          win: data.win || 0,
          draw: data.draw || 0,
          lose: data.lose || 0,
          winRate: data.winRate || 0,
          personalPoints: data.personalPoints || 0,
          momScore: data.momScore || 0,
          momTop3Count: data.momTop3Count || 0,
          momTop8Count: data.momTop8Count || 0,
        }));
        setHasData(playerData.length > 0);
      }

      setPlayers(playerData);
      setFilteredPlayers(playerData);

      const latestPlayer = playerData[0];
      if (latestPlayer && latestPlayer.updatedAt) {
        setLastUpdated(new Date(latestPlayer.updatedAt.seconds * 1000));
      }

      const positionMap = {};
      for (const player of playerData) {
        const pos = await calculateMostFrequentPosition(player.name, year);
        positionMap[player.name] = pos;
      }
      setPositions(positionMap);
    } catch (err) {
      console.error(`Error fetching players for ${year}:`, err);
      setHasData(false);
    }
  };

  const calculateStats = () => {
    if (!hasData) return [];

    const playerData = players.map(player => ({
      ...player,
      attackPoints: (player.goals || 0) + (player.assists || 0),
      position: positions[player.name] || null,
    }));

    const calculateRankings = (key, unit, title) => {
      const sortedPlayers = [...playerData]
        .filter(p => p[key] > 0)
        .sort((a, b) => {
          if (b[key] === a[key]) {
            return (b.matches || 0) - (a.matches || 0);
          }
          return b[key] - a[key];
        });

      let currentRank = 1;
      let currentValue = sortedPlayers[0]?.[key] || 0;
      const rankedPlayers = sortedPlayers.map((player, index) => {
        if (index > 0 && player[key] < currentValue) {
          currentRank = index + 1;
          currentValue = player[key];
        }
        return {
          rank: currentRank,
          name: player.name,
          position: player.position,
          value: player[key],
          matches: player.matches || 0,
        };
      });

      return {
        id: key,
        title,
        unit,
        players: rankedPlayers,
      };
    };

    return [
      calculateRankings('matches', '경기', '출장수'),
      calculateRankings('goals', '골', '득점'),
      calculateRankings('assists', '개', '도움'),
      calculateRankings('attackPoints', 'P', '공격포인트'),
      calculateRankings('cleanSheets', '회', '클린시트'),
      calculateRankings('momScore', '점', '파워랭킹'),
      calculateRankings('momTop3Count', '회', 'TOP 3'),
      calculateRankings('momTop8Count', '회', 'TOP 8'),
      calculateRankings('personalPoints', '점', '개인승점'),
    ];
  };

  const statsCategories = calculateStats();

  const handleNavClick = (direction) => {
    const years = ['2022', '2023', '2024', '2025'];
    const currentIndex = years.indexOf(currentYear);
    let newIndex;

    if (direction === 'left') {
      newIndex = currentIndex - 1;
      if (newIndex < 0) return;
    } else {
      newIndex = currentIndex + 1;
      if (newIndex >= years.length) return;
    }

    setCurrentYear(years[newIndex]);
  };

  const handleSearch = () => {
    if (!searchNickname.trim()) return;
    const nicknameLower = searchNickname.toLowerCase();
    const playerData = players.map(player => ({
      ...player,
      attackPoints: (player.goals || 0) + (player.assists || 0),
    }));

    const getRank = (key) => {
      const sortedPlayers = [...playerData]
        .filter(p => p[key] > 0)
        .sort((a, b) => {
          if (b[key] === a[key]) return (b.matches || 0) - (a.matches || 0);
          return b[key] - a[key];
        });

      let currentRank = 1;
      let currentValue = sortedPlayers[0]?.[key] || 0;
      const rankedPlayers = sortedPlayers.map((player, index) => {
        if (index > 0 && player[key] < currentValue) {
          currentRank = index + 1;
          currentValue = player[key];
        }
        return { ...player, rank: currentRank };
      });

      const player = rankedPlayers.find(p => p.name.toLowerCase() === nicknameLower);
      return player ? { rank: player.rank, value: player[key] } : { rank: '-', value: 0 };
    };

    const stats = {
      matches: getRank('matches'),
      goals: getRank('goals'),
      assists: getRank('assists'),
      attackPoints: getRank('attackPoints'),
      cleanSheets: getRank('cleanSheets'),
      momScore: getRank('momScore'),
      momTop3Count: getRank('momTop3Count'),
      momTop8Count: getRank('momTop8Count'),
      personalPoints: getRank('personalPoints'),
    };

    setPlayerStats({ name: searchNickname, ...stats });
    setShowPopup(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleMoreClick = (category) => {
    setShowMorePopup({
      selectedCategory: category,
      categories: statsCategories,
    });
  };

  const handleCategoryChange = (category) => {
    setShowMorePopup(prev => ({
      ...prev,
      selectedCategory: category,
    }));
  };

  const sortedPlayers = () => {
    const playerData = players.map(player => ({
      ...player,
      attackPoints: (player.goals || 0) + (player.assists || 0),
      position: positions[player.name] || null,
    }));

    const sorted = [...playerData].sort((a, b) => {
      const aValue = a[sortKey] || 0;
      const bValue = b[sortKey] || 0;
      if (bValue === aValue) {
        return (b.matches || 0) - (a.matches || 0);
      }
      return bValue - aValue;
    });

    let currentRank = 1;
    let currentValue = sorted[0]?.[sortKey] || 0;
    const rankedPlayers = sorted.map((player, index) => {
      if (index > 0 && player[sortKey] < currentValue) {
        currentRank = index + 1;
        currentValue = player[sortKey];
      }
      return { ...player, rank: currentRank };
    });

    if (fullRankingSearch.trim()) {
      const nicknameLower = fullRankingSearch.toLowerCase();
      return rankedPlayers.filter(player => player.name.toLowerCase() === nicknameLower);
    }
    return rankedPlayers;
  };

  const handleSort = (key) => {
    setSortKey(key);
  };

  const handleFullRankingSearch = () => {
    if (!fullRankingSearch.trim()) {
      setFilteredPlayers(players);
      return;
    }
    const nicknameLower = fullRankingSearch.toLowerCase();
    const filtered = players.filter(player => player.name.toLowerCase() === nicknameLower);
    setFilteredPlayers(filtered);
  };

  const handleFullRankingKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFullRankingSearch();
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - fullRankingRef.current.offsetLeft;
    scrollLeft.current = fullRankingRef.current.scrollLeft;
    fullRankingRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    fullRankingRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    fullRankingRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - fullRankingRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    fullRankingRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    startX.current = e.touches[0].pageX - fullRankingRef.current.offsetLeft;
    scrollLeft.current = fullRankingRef.current.scrollLeft;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const x = e.touches[0].pageX - fullRankingRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    fullRankingRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPositionVisible = currentYear === '2025';

  return (
    <Styles.Container>
      {lastUpdated && (
        <div
          style={{
            textAlign: 'right',
            width: '100%',
            fontSize: '14px',
            color: '#4e5968',
            marginTop: '-24px',
            marginBottom: '40px',
          }}
        >
          마지막 업데이트: {lastUpdated.toLocaleDateString('ko-KR')} {lastUpdated.toLocaleTimeString('ko-KR')}
        </div>
      )}
      <Styles.Header>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Styles.NavArrow
            disabled={currentYear === '2022'}
            onClick={() => handleNavClick('left')}
          >
            ❮
          </Styles.NavArrow>
          <Styles.Title>{currentYear}시즌</Styles.Title>
          <Styles.NavArrow
            disabled={currentYear === '2025'}
            onClick={() => handleNavClick('right')}
          >
            ❯
          </Styles.NavArrow>
        </div>
        <Styles.SearchContainer>
          <Styles.SearchInput
            value={searchNickname}
            onChange={(e) => setSearchNickname(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="닉네임 입력"
          />
          <Styles.SearchButton onClick={handleSearch}>검색</Styles.SearchButton>
        </Styles.SearchContainer>
      </Styles.Header>

      {hasData ? (
        <>
          <Styles.StatsContainer>
            <Styles.StatsScroll>
              {statsCategories.length > 0 ? (
                statsCategories.map((category) => (
                  <Styles.StatsCard key={category.id}>
                    <Styles.StatsTitle>{category.title}</Styles.StatsTitle>
                    <Styles.RankingList>
                      {category.players.slice(0, 4).map((player) => (
                        <Styles.RankingItem key={`${category.id}-${player.rank}-${player.name}`}>
                          <Styles.RankWrapper>
                            <Styles.Rank isNumber={player.rank > 3}>
                              {player.rank === 1 && <Medal rank={1} />}
                              {player.rank === 2 && <Medal rank={2} />}
                              {player.rank === 3 && <Medal rank={3} />}
                              {player.rank > 3 && player.rank}
                            </Styles.Rank>
                          </Styles.RankWrapper>
                          <Styles.PlayerInfo>
                            <Styles.PlayerName>{player.name}</Styles.PlayerName>
                            {isPositionVisible && player.position && (
                              <Styles.PlayerPosition>{player.position}</Styles.PlayerPosition>
                            )}
                          </Styles.PlayerInfo>
                          <Styles.PlayerStat>
                            {player.value}
                            {category.unit}
                          </Styles.PlayerStat>
                        </Styles.RankingItem>
                      ))}
                    </Styles.RankingList>
                    <Styles.SeeMore onClick={() => handleMoreClick(category)}>더보기</Styles.SeeMore>
                  </Styles.StatsCard>
                ))
              ) : (
                <Styles.NoDataMessage>해당 연도에는 기록하지 않았습니다.</Styles.NoDataMessage>
              )}
            </Styles.StatsScroll>
          </Styles.StatsContainer>

          <Styles.FullRankingSection>
            <Styles.FullRankingTitle>전체 순위</Styles.FullRankingTitle>
            <Styles.FullRankingSearchContainer>
              <Styles.SearchInput
                value={fullRankingSearch}
                onChange={(e) => setFullRankingSearch(e.target.value)}
                onKeyDown={handleFullRankingKeyDown}
                placeholder="닉네임 검색"
              />
              <Styles.SearchButton onClick={handleFullRankingSearch}>검색</Styles.SearchButton>
            </Styles.FullRankingSearchContainer>
            {sortedPlayers().length > 0 ? (
              <Styles.FullRankingContainer
                ref={fullRankingRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
              >
                <Styles.FullRankingTable>
                  <thead>
                    <tr>
                      <Styles.TableHeader active={sortKey === 'rank'} onClick={() => handleSort('rank')}>
                        등수
                      </Styles.TableHeader>
                      <Styles.TableHeader active={sortKey === 'name'} onClick={() => handleSort('name')}>
                        이름
                      </Styles.TableHeader>
                      {isPositionVisible && (
                        <Styles.TableHeader active={sortKey === 'position'} onClick={() => handleSort('position')}>
                          포지션
                        </Styles.TableHeader>
                      )}
                      <Styles.TableHeader active={sortKey === 'matches'} onClick={() => handleSort('matches')}>
                        출장수
                      </Styles.TableHeader>
                      <Styles.TableHeader active={sortKey === 'goals'} onClick={() => handleSort('goals')}>
                        득점
                      </Styles.TableHeader>
                      <Styles.TableHeader active={sortKey === 'assists'} onClick={() => handleSort('assists')}>
                        도움
                      </Styles.TableHeader>
                      <Styles.TableHeader active={sortKey === 'attackPoints'} onClick={() => handleSort('attackPoints')}>
                        공격포인트
                      </Styles.TableHeader>
                      <Styles.TableHeader active={sortKey === 'cleanSheets'} onClick={() => handleSort('cleanSheets')}>
                        클린시트
                      </Styles.TableHeader>
                      <Styles.TableHeader active={sortKey === 'momScore'} onClick={() => handleSort('momScore')}>
                        파워랭킹
                      </Styles.TableHeader>
                      <Styles.TableHeader active={sortKey === 'momTop3Count'} onClick={() => handleSort('momTop3Count')}>
                        TOP 3
                      </Styles.TableHeader>
                      <Styles.TableHeader active={sortKey === 'momTop8Count'} onClick={() => handleSort('momTop8Count')}>
                        TOP 8
                      </Styles.TableHeader>
                      <Styles.TableHeader active={sortKey === 'personalPoints'} onClick={() => handleSort('personalPoints')}>
                        개인승점
                      </Styles.TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers().map((player, index) => (
                      <Styles.TableRow key={index}>
                        <Styles.FixedTableCell>{player.rank}</Styles.FixedTableCell>
                        <Styles.FixedTableCell>{player.name}</Styles.FixedTableCell>
                        {isPositionVisible && (
                          <Styles.FixedTableCell>{player.position || '-'}</Styles.FixedTableCell>
                        )}
                        <Styles.TableCellStat>{player.matches || 0}</Styles.TableCellStat>
                        <Styles.TableCellStat>{player.goals || 0}</Styles.TableCellStat>
                        <Styles.TableCellStat>{player.assists || 0}</Styles.TableCellStat>
                        <Styles.TableCellStat>{player.attackPoints || 0}</Styles.TableCellStat>
                        <Styles.TableCellStat>{player.cleanSheets || 0}</Styles.TableCellStat>
                        <Styles.TableCellStat>{player.momScore || 0}</Styles.TableCellStat>
                        <Styles.TableCellStat>{player.momTop3Count || 0}</Styles.TableCellStat>
                        <Styles.TableCellStat>{player.momTop8Count || 0}</Styles.TableCellStat>
                        <Styles.TableCellStat>{player.personalPoints || 0}</Styles.TableCellStat>
                      </Styles.TableRow>
                    ))}
                  </tbody>
                </Styles.FullRankingTable>
              </Styles.FullRankingContainer>
            ) : (
              <Styles.NoDataMessage>
                {fullRankingSearch.trim() ? '해당 선수를 찾을 수 없습니다.' : '해당 연도에는 기록하지 않았습니다.'}
              </Styles.NoDataMessage>
            )}
          </Styles.FullRankingSection>
        </>
      ) : (
        <Styles.NoDataMessage>해당 연도에는 기록하지 않았습니다.</Styles.NoDataMessage>
      )}

      {showPopup && playerStats && (
        <Styles.PopupOverlay onClick={() => setShowPopup(false)}>
          <Styles.PopupContent onClick={(e) => e.stopPropagation()}>
            <Styles.PopupInner>
              <Styles.PopupHeader>
                <Styles.PopupTitle>{playerStats.name}님의 {currentYear} 순위</Styles.PopupTitle>
                <Styles.CloseButton onClick={() => setShowPopup(false)}>×</Styles.CloseButton>
              </Styles.PopupHeader>
              <Styles.StatsContainerInner>
                <Styles.StatsColumn>
                  <Styles.StatItem>
                    <Styles.StatLabel>출장수</Styles.StatLabel>
                    <Styles.StatValueWrapper>
                      <Styles.StatValue>{playerStats.matches.value} 경기</Styles.StatValue>
                    </Styles.StatValueWrapper>
                    <Styles.StatRank>순위: {playerStats.matches.rank}</Styles.StatRank>
                  </Styles.StatItem>
                  <Styles.StatItem>
                    <Styles.StatLabel>득점</Styles.StatLabel>
                    <Styles.StatValueWrapper>
                      <Styles.StatValue>{playerStats.goals.value} 골</Styles.StatValue>
                    </Styles.StatValueWrapper>
                    <Styles.StatRank>순위: {playerStats.goals.rank}</Styles.StatRank>
                  </Styles.StatItem>
                  <Styles.StatItem>
                    <Styles.StatLabel>도움</Styles.StatLabel>
                    <Styles.StatValueWrapper>
                      <Styles.StatValue>{playerStats.assists.value} 개</Styles.StatValue>
                    </Styles.StatValueWrapper>
                    <Styles.StatRank>순위: {playerStats.assists.rank}</Styles.StatRank>
                  </Styles.StatItem>
                </Styles.StatsColumn>
                <Styles.StatsColumn>
                  <Styles.StatItem>
                    <Styles.StatLabel>공격포인트</Styles.StatLabel>
                    <Styles.StatValueWrapper>
                      <Styles.StatValue>{playerStats.attackPoints.value} P</Styles.StatValue>
                    </Styles.StatValueWrapper>
                    <Styles.StatRank>순위: {playerStats.attackPoints.rank}</Styles.StatRank>
                  </Styles.StatItem>
                  <Styles.StatItem>
                    <Styles.StatLabel>클린시트</Styles.StatLabel>
                    <Styles.StatValueWrapper>
                      <Styles.StatValue>{playerStats.cleanSheets.value} 회</Styles.StatValue>
                    </Styles.StatValueWrapper>
                    <Styles.StatRank>순위: {playerStats.cleanSheets.rank}</Styles.StatRank>
                  </Styles.StatItem>
                  <Styles.StatItem>
                    <Styles.StatLabel>파워랭킹</Styles.StatLabel>
                    <Styles.StatValueWrapper>
                      <Styles.StatValue>{playerStats.momScore.value} 점</Styles.StatValue>
                    </Styles.StatValueWrapper>
                    <Styles.StatRank>순위: {playerStats.momScore.rank}</Styles.StatRank>
                  </Styles.StatItem>
                </Styles.StatsColumn>
                <Styles.StatsColumn>
                  <Styles.StatItem>
                    <Styles.StatLabel>TOP 3</Styles.StatLabel>
                    <Styles.StatValueWrapper>
                      <Styles.StatValue>{playerStats.momTop3Count.value} 회</Styles.StatValue>
                    </Styles.StatValueWrapper>
                    <Styles.StatRank>순위: {playerStats.momTop3Count.rank}</Styles.StatRank>
                  </Styles.StatItem>
                  <Styles.StatItem>
                    <Styles.StatLabel>TOP 8</Styles.StatLabel>
                    <Styles.StatValueWrapper>
                      <Styles.StatValue>{playerStats.momTop8Count.value} 회</Styles.StatValue>
                    </Styles.StatValueWrapper>
                    <Styles.StatRank>순위: {playerStats.momTop8Count.rank}</Styles.StatRank>
                  </Styles.StatItem>
                  <Styles.StatItem>
                    <Styles.StatLabel>개인승점</Styles.StatLabel>
                    <Styles.StatValueWrapper>
                      <Styles.StatValue>{playerStats.personalPoints.value} 점</Styles.StatValue>
                    </Styles.StatValueWrapper>
                    <Styles.StatRank>순위: {playerStats.personalPoints.rank}</Styles.StatRank>
                  </Styles.StatItem>
                </Styles.StatsColumn>
              </Styles.StatsContainerInner>
              <Styles.PopupFooter>
                <Styles.SecondaryButton onClick={() => setShowPopup(false)}>닫기</Styles.SecondaryButton>
              </Styles.PopupFooter>
            </Styles.PopupInner>
          </Styles.PopupContent>
        </Styles.PopupOverlay>
      )}

      {showMorePopup && (
        <Styles.PopupOverlay onClick={() => setShowMorePopup(null)}>
          <Styles.TossPopup onClick={(e) => e.stopPropagation()}>
            <Styles.TossHeader>
              <Styles.TossTitle>{showMorePopup.selectedCategory.title} {currentYear}시즌 상위 순위</Styles.TossTitle>
              <Styles.TossCloseButton onClick={() => setShowMorePopup(null)}>×</Styles.TossCloseButton>
            </Styles.TossHeader>
            <Styles.CategoryButtonContainer>
              <Styles.CategoryButtonScroll>
                {showMorePopup.categories.map((category) => (
                  <Styles.CategoryButton
                    key={category.id}
                    active={showMorePopup.selectedCategory.id === category.id}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category.title}
                  </Styles.CategoryButton>
                ))}
              </Styles.CategoryButtonScroll>
            </Styles.CategoryButtonContainer>
            <Styles.TossList>
              {showMorePopup.selectedCategory.players.map((player) => (
                <Styles.TossListItem key={`${showMorePopup.selectedCategory.id}-${player.rank}-${player.name}`}>
                  <Styles.TossRankWrapper>
                    <Styles.TossRank isNumber={player.rank > 3}>
                      {player.rank === 1 && <Medal rank={1} />}
                      {player.rank === 2 && <Medal rank={2} />}
                      {player.rank === 3 && <Medal rank={3} />}
                      {player.rank > 3 && player.rank}
                    </Styles.TossRank>
                  </Styles.TossRankWrapper>
                  <Styles.TossPlayerInfo>
                    <Styles.TossPlayerName>{player.name}</Styles.TossPlayerName>
                    {isPositionVisible && player.position && (
                      <Styles.TossPlayerPosition>{player.position}</Styles.TossPlayerPosition>
                    )}
                  </Styles.TossPlayerInfo>
                  <Styles.TossPlayerStat>
                    {player.value}
                    {showMorePopup.selectedCategory.unit}
                  </Styles.TossPlayerStat>
                </Styles.TossListItem>
              ))}
            </Styles.TossList>
          </Styles.TossPopup>
        </Styles.PopupOverlay>
      )}

      {showScrollTop && (
        <Styles.ScrollTopButton onClick={scrollToTop}>
          ↑
        </Styles.ScrollTopButton>
      )}
    </Styles.Container>
  );
};

export default TOP;