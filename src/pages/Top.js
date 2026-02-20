import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../App';
import * as Styles from './Top10Css';
import LoadingScreen from '../components/LoadingScreen';
import { Crown, X, Search } from 'lucide-react';

// 포지션 통일 함수
const unifyPosition = (position) => {
  const positionMap = {
    'CB1': 'CB', 'CB2': 'CB',
    'CDM1': 'CDM', 'CDM2': 'CDM',
    'CM1': 'CM', 'CM2': 'CM',
  };
  return positionMap[position] || position;
};

const TOP = () => {
  const [players, setPlayers] = useState([]);
  const [searchNickname, setSearchNickname] = useState('');
  const [fullRankingSearch, setFullRankingSearch] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);
  const [showMorePopup, setShowMorePopup] = useState(null);
  const [positions, setPositions] = useState({});
  const [sortKey, setSortKey] = useState('momScore');
  const [currentYear, setCurrentYear] = useState(null);
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true); // Add loading state

  // 스크롤 관련 refs
  const fullRankingRef = useRef(null);
  const statsScrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Carousel Button Visibility
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  // 현재 시즌 판단
  const getCurrentSeason = () => {
    const now = new Date();
    return now.getFullYear().toString();
  };

  const availableYears = useMemo(() => {
    const startYear = 2022;
    const current = parseInt(getCurrentSeason());
    const years = [];
    for (let y = startYear; y <= current; y++) {
      years.push(y.toString());
    }
    return years;
  }, []);

  useEffect(() => {
    if (availableYears.length > 0 && !currentYear) {
      setCurrentYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, currentYear]);

  // 사진 자동 로딩 컴포넌트
  const PlayerAvatar = ({ name, className, style }) => {
    const imageUrl = `/players/${name}.png`;
    return (
      <img
        src={imageUrl}
        alt={name}
        className={className}
        style={style}
        onError={(e) => {
          e.target.src = '/profile_default.svg';
        }}
      />
    );
  };

  useEffect(() => {
    if (!currentYear) return;

    const fetchAllData = async () => {
      setLoading(true); // Start loading
      try {
        let playerData = [];
        let positionMap = {};
        const isCurrentSeason = currentYear === getCurrentSeason();

        if (isCurrentSeason) {
          const [playerSnap, matchesSnap] = await Promise.all([
            getDocs(collection(db, 'players')),
            getDocs(query(collection(db, 'matches'))),
          ]);

          playerData = playerSnap.docs.map((doc) => doc.data());

          const playerPositions = {};
          matchesSnap.forEach((matchDoc) => {
            const matchData = matchDoc.data();
            const matchYear = matchData.date
              ? new Date(matchData.date).getFullYear().toString()
              : null;

            if (matchYear !== currentYear) return;

            const quarters = matchData.quarters || [];
            quarters.forEach((quarter) => {
              quarter.teams.forEach((team) => {
                team.players.forEach((player) => {
                  if (!playerPositions[player.name]) {
                    playerPositions[player.name] = {};
                  }
                  const unifiedPos = unifyPosition(player.position);
                  playerPositions[player.name][unifiedPos] =
                    (playerPositions[player.name][unifiedPos] || 0) + 1;
                });
              });
            });
          });

          for (const name in playerPositions) {
            const counts = Object.entries(playerPositions[name]);
            if (counts.length > 0) {
              const sorted = counts.sort((a, b) => b[1] - a[1]);
              positionMap[name] = sorted[0][0];
            }
          }
        } else {
          const snap = await getDocs(collection(db, 'players'));
          const yearlyDataPromises = snap.docs.map(async (playerDoc) => {
            const historyRef = doc(db, 'players', playerDoc.id, 'history', currentYear);
            const historyDoc = await getDoc(historyRef);
            if (historyDoc.exists()) {
              const historyData = historyDoc.data();
              if ((historyData.matches || 0) > 0) {
                return {
                  ...historyData,
                  name: playerDoc.data().name || playerDoc.id,
                };
              }
            }
            return null;
          });

          const yearlyData = (await Promise.all(yearlyDataPromises)).filter(Boolean);
          playerData = yearlyData.map((data) => ({
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
        }

        setHasData(playerData.length > 0);
        setPlayers(playerData);
        setPositions(positionMap);
      } catch (err) {
        console.error(`Error fetching data for ${currentYear}:`, err);
        setHasData(false);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchAllData();
  }, [currentYear]);

  // ... (rest of logic)




  const processedPlayers = useMemo(() => {
    return players.map((player) => ({
      ...player,
      attackPoints: (player.goals || 0) + (player.assists || 0),
      position: positions[player.name] || null,
    }));
  }, [players, positions]);

  const statsCategories = useMemo(() => {
    if (!hasData) return [];

    const calculateRankings = (key, unit, title) => {
      const sortedPlayers = [...processedPlayers]
        .filter((p) => p[key] > 0)
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
      calculateRankings('momScore', '점', '파워랭킹'),
      calculateRankings('matches', '경기', '출장수'),
      calculateRankings('goals', '골', '득점'),
      calculateRankings('assists', '개', '도움'),
      calculateRankings('attackPoints', 'P', '공격포인트'),
      calculateRankings('cleanSheets', '회', '클린시트'),
      calculateRankings('momTop3Count', '회', 'TOP 3'),
      calculateRankings('momTop8Count', '회', 'TOP 8'),
      calculateRankings('personalPoints', '점', '개인승점'),
    ];
  }, [processedPlayers, hasData]);

  // Handle Carousel Scroll Buttons
  useEffect(() => {
    const handleScroll = () => {
      if (statsScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = statsScrollRef.current;
        setShowLeftBtn(scrollLeft > 0);
        setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const ref = statsScrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      handleScroll();
    }
    return () => ref && ref.removeEventListener('scroll', handleScroll);
  }, [statsScrollRef.current, statsCategories]);

  const scrollCarousel = (direction) => {
    if (statsScrollRef.current) {
      const scrollAmount = 300;
      statsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const sortedAndFilteredPlayers = useMemo(() => {
    const sorted = [...processedPlayers].sort((a, b) => {
      const aValue = a[sortKey] || 0;
      const bValue = b[sortKey] || 0;
      if (bValue === aValue) return (b.matches || 0) - (a.matches || 0);
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
      return rankedPlayers.filter((player) =>
        player.name.toLowerCase().includes(nicknameLower)
      );
    }
    return rankedPlayers;
  }, [processedPlayers, sortKey, fullRankingSearch]);

  const handleNavClick = (direction) => {
    const currentIndex = availableYears.indexOf(currentYear);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (direction === 'left') {
      newIndex--;
      if (newIndex < 0) return;
    } else {
      newIndex++;
      if (newIndex >= availableYears.length) return;
    }
    setCurrentYear(availableYears[newIndex]);
  };

  const handleSearch = () => {
    if (!searchNickname.trim()) return;
    handlePlayerClick(searchNickname);
  };

  const handlePlayerClick = (nickname) => {
    const nicknameLower = nickname.toLowerCase();

    const getRank = (key) => {
      const category = statsCategories.find((c) => c.id === key);
      if (!category) return { rank: '-', value: 0 };
      const player = category.players.find((p) => p.name.toLowerCase() === nicknameLower);
      return player ? { rank: player.rank, value: player.value } : { rank: '-', value: 0 };
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

    setPlayerStats({ name: nickname, ...stats });
    setShowPopup(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleMouseDown = (e) => {
    if (e.pointerType === 'touch') return; // Ignore touch pointers
    isDragging.current = true;
    startX.current = e.pageX - fullRankingRef.current.offsetLeft;
    scrollLeft.current = fullRankingRef.current.scrollLeft;
  };
  const handleMouseLeave = () => { isDragging.current = false; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e) => {
    if (!isDragging.current || e.pointerType === 'touch') return;
    e.preventDefault();
    const x = e.pageX - fullRankingRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    fullRankingRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentYear) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}>시즌 정보를 불러오는 중...</div>;
  }

  return (
    <Styles.Container>
      <Styles.GlobalFontStyle />
      <Styles.ContentWrapper>
        <Styles.Header>
          <Styles.HeaderLeft>
            <Styles.NavArrow
              disabled={currentYear === availableYears[0]}
              onClick={() => handleNavClick('left')}
            >
              ❮
            </Styles.NavArrow>
            <Styles.Title>{currentYear}</Styles.Title>
            <Styles.NavArrow
              disabled={currentYear === availableYears[availableYears.length - 1]}
              onClick={() => handleNavClick('right')}
            >
              ❯
            </Styles.NavArrow>
          </Styles.HeaderLeft>
        </Styles.Header>

        <Styles.SearchContainer className="top-search">
          <Styles.SearchInputWrapper>
            <Styles.SearchInput
              value={searchNickname}
              onChange={(e) => setSearchNickname(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="닉네임 검색"
            />
            <Search size={18} color="#adb5bd" className="search-icon" />
          </Styles.SearchInputWrapper>
          <Styles.SearchButton onClick={handleSearch}>검색</Styles.SearchButton>
        </Styles.SearchContainer>
      </Styles.ContentWrapper>

      {hasData ? (
        <>
          <Styles.CarouselContainer>
            {showLeftBtn && (
              <Styles.CarouselButton direction="left" onClick={() => scrollCarousel('left')}>
                ❮
              </Styles.CarouselButton>
            )}

            <Styles.StatsContainer>
              <Styles.StatsScroll ref={statsScrollRef}>
                {statsCategories.map((category) => {
                  const first = category.players[0];
                  const rest = category.players.slice(1, 4);

                  return (
                    <Styles.CarouselItem key={category.id}>
                      <Styles.CategoryTitle>{category.title}</Styles.CategoryTitle>
                      <Styles.StatsCard>
                        {/* 1st Place Badge Decoupled */}
                        {first && (
                          <Styles.HeroBadgeImage
                            src="/medal.png"
                            alt="1st Place"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}

                        {first ? (
                          <>
                            <Styles.HeroSection onClick={() => handlePlayerClick(first.name)}>
                              <Styles.HeroProfileWrapper>
                                <Styles.HeroImage src={`/players/${first.name}.png`}
                                  onError={(e) => { e.target.src = '/profile_default.svg'; }}
                                  alt={first.name} />
                              </Styles.HeroProfileWrapper>
                              <Styles.HeroName>{first.name}</Styles.HeroName>
                              <Styles.HeroStatContainer>
                                <Styles.HeroStat>{first.value}</Styles.HeroStat>
                                <Styles.HeroUnit>{category.unit}</Styles.HeroUnit>
                              </Styles.HeroStatContainer>
                            </Styles.HeroSection>

                            <Styles.ListSection>
                              {rest.map((player) => (
                                <Styles.ListItem key={player.name} onClick={() => handlePlayerClick(player.name)}>
                                  <Styles.RankNumber>{player.rank}</Styles.RankNumber>
                                  <Styles.MiniProfile src={`/players/${player.name}.png`}
                                    onError={(e) => { e.target.src = '/profile_default.svg'; }}
                                    alt={player.name} />
                                  <Styles.ItemInfo>
                                    <Styles.ItemName>{player.name}</Styles.ItemName>
                                  </Styles.ItemInfo>
                                  <Styles.ItemStat>{player.value}{category.unit}</Styles.ItemStat>
                                </Styles.ListItem>
                              ))}
                            </Styles.ListSection>
                          </>
                        ) : (
                          <Styles.NoDataMessage>기록 없음</Styles.NoDataMessage>
                        )}
                        <Styles.CardFooter onClick={() => setShowMorePopup({ selectedCategory: category, categories: statsCategories })}>
                          더보기
                        </Styles.CardFooter>
                      </Styles.StatsCard>
                    </Styles.CarouselItem>
                  );
                })}
              </Styles.StatsScroll>
            </Styles.StatsContainer>

            {showRightBtn && (
              <Styles.CarouselButton direction="right" onClick={() => scrollCarousel('right')}>
                ❯
              </Styles.CarouselButton>
            )}
          </Styles.CarouselContainer>

          <Styles.FullRankingSection>
            <Styles.FullRankingHeader>
              <Styles.FullRankingTitle>전체 순위표</Styles.FullRankingTitle>
              <Styles.SearchContainer className="table-search">
                <Styles.SearchInputWrapper>
                  <Styles.SearchInput
                    value={fullRankingSearch}
                    onChange={(e) => setFullRankingSearch(e.target.value)}
                    placeholder="닉네임 검색"
                  />
                  <Search size={16} color="#adb5bd" className="search-icon" />
                </Styles.SearchInputWrapper>
              </Styles.SearchContainer>
            </Styles.FullRankingHeader>
            <Styles.FullRankingContainer
              ref={fullRankingRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <Styles.FullRankingTable>
                <thead>
                  <tr>
                    <Styles.TableHeader notClickable>순위</Styles.TableHeader>
                    <Styles.TableHeader style={{ textAlign: 'left', paddingLeft: '16px' }} notClickable>선수</Styles.TableHeader>
                    <Styles.TableHeader onClick={() => setSortKey('matches')} active={sortKey === 'matches'}>출장</Styles.TableHeader>
                    <Styles.TableHeader onClick={() => setSortKey('goals')} active={sortKey === 'goals'}>득점</Styles.TableHeader>
                    <Styles.TableHeader onClick={() => setSortKey('assists')} active={sortKey === 'assists'}>도움</Styles.TableHeader>
                    <Styles.TableHeader onClick={() => setSortKey('attackPoints')} active={sortKey === 'attackPoints'}>공격P</Styles.TableHeader>
                    <Styles.TableHeader onClick={() => setSortKey('cleanSheets')} active={sortKey === 'cleanSheets'}>클린시트</Styles.TableHeader>
                    <Styles.TableHeader onClick={() => setSortKey('momScore')} active={sortKey === 'momScore'}>파워랭킹</Styles.TableHeader>
                    <Styles.TableHeader onClick={() => setSortKey('momTop3Count')} active={sortKey === 'momTop3Count'}>TOP3</Styles.TableHeader>
                    <Styles.TableHeader onClick={() => setSortKey('momTop8Count')} active={sortKey === 'momTop8Count'}>TOP8</Styles.TableHeader>
                    <Styles.TableHeader onClick={() => setSortKey('personalPoints')} active={sortKey === 'personalPoints'}>승점</Styles.TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredPlayers.length > 0 ? (
                    sortedAndFilteredPlayers.map((player) => (
                      <Styles.TableRow key={player.name}>
                        <Styles.RankCell>{player.rank}</Styles.RankCell>
                        <Styles.PlayerCell>
                          <Styles.PlayerInfoWrapper onClick={() => handlePlayerClick(player.name)}>
                            <Styles.PlayerAvatarSmall
                              src={`/players/${player.name}.png`}
                              onError={(e) => { e.target.src = '/profile_default.svg'; }}
                            />
                            <Styles.PlayerTextStack>
                              <Styles.PlayerNameText>{player.name}</Styles.PlayerNameText>
                              <Styles.PlayerTeamText>{player.position || 'Player'}</Styles.PlayerTeamText>
                            </Styles.PlayerTextStack>
                          </Styles.PlayerInfoWrapper>
                        </Styles.PlayerCell>
                        <Styles.StatCell highlight={sortKey === 'matches'}>{player.matches}</Styles.StatCell>
                        <Styles.StatCell highlight={sortKey === 'goals'}>{player.goals}</Styles.StatCell>
                        <Styles.StatCell highlight={sortKey === 'assists'}>{player.assists}</Styles.StatCell>
                        <Styles.StatCell highlight={sortKey === 'attackPoints'}>{player.attackPoints}</Styles.StatCell>
                        <Styles.StatCell highlight={sortKey === 'cleanSheets'}>{player.cleanSheets}</Styles.StatCell>
                        <Styles.StatCell highlight={sortKey === 'momScore'}>{player.momScore}</Styles.StatCell>
                        <Styles.StatCell highlight={sortKey === 'momTop3Count'}>{player.momTop3Count}</Styles.StatCell>
                        <Styles.StatCell highlight={sortKey === 'momTop8Count'}>{player.momTop8Count}</Styles.StatCell>
                        <Styles.StatCell highlight={sortKey === 'personalPoints'}>{player.personalPoints}</Styles.StatCell>
                      </Styles.TableRow>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                        데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Styles.FullRankingTable>
            </Styles.FullRankingContainer>
          </Styles.FullRankingSection>
        </>
      ) : (
        <Styles.NoDataMessage>해당 시즌 데이터가 없습니다.</Styles.NoDataMessage>
      )}

      {/* Popups */}
      {showPopup && playerStats && (
        <Styles.PlayerPopupOverlay onClick={() => setShowPopup(false)}>
          <Styles.PopupContent onClick={(e) => e.stopPropagation()}>
            <Styles.PopupHeader>
              <Styles.PopupTitle>
                {/* Updated Image Style: Full Rectangular Image */}
                <div style={{ marginRight: '16px' }}>
                  <PlayerAvatar name={playerStats.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px' }} />
                </div>
                <div>
                  <Styles.PopupName>{playerStats.name}</Styles.PopupName>
                  <Styles.PopupSubtitle>{currentYear} Season</Styles.PopupSubtitle>
                </div>
              </Styles.PopupTitle>
              <Styles.CloseButton onClick={() => setShowPopup(false)}>
                <X size={24} strokeWidth={1.5} />
              </Styles.CloseButton>
            </Styles.PopupHeader>
            <Styles.StatsGrid>
              {Object.entries(playerStats).filter(([key]) => key !== 'name').map(([key, data]) => {
                const labelMap = {
                  matches: '출장', goals: '득점', assists: '도움',
                  attackPoints: '공격P', cleanSheets: '클린시트', momScore: '파워랭킹',
                  momTop3Count: 'TOP3', momTop8Count: 'TOP8', personalPoints: '개인승점'
                };
                if (!labelMap[key]) return null;
                const isFirst = data.rank === 1;
                return (
                  <Styles.StatBox key={key} isFirst={isFirst}>
                    <Styles.BoxLabel isFirst={isFirst}>{labelMap[key]}</Styles.BoxLabel>
                    <Styles.BoxValue isFirst={isFirst}>{data.value}</Styles.BoxValue>
                    <Styles.BoxRank isFirst={isFirst}>
                      {isFirst ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Crown size={14} fill="#fab005" color="#fab005" />
                          <span style={{ color: '#fab005', fontWeight: 'bold' }}>1위</span>
                        </div>
                      ) : (
                        `${data.rank}위`
                      )}
                    </Styles.BoxRank>
                  </Styles.StatBox>
                )
              })}
            </Styles.StatsGrid>
          </Styles.PopupContent>
        </Styles.PlayerPopupOverlay>
      )}

      {showMorePopup && (
        <Styles.PopupOverlay onClick={() => setShowMorePopup(null)}>
          <Styles.ListPopupContent onClick={(e) => e.stopPropagation()}>
            <Styles.PopupHeader>
              <Styles.PopupName>{showMorePopup.selectedCategory.title} 순위</Styles.PopupName>
              <Styles.CloseButton onClick={() => setShowMorePopup(null)}>
                <X size={24} strokeWidth={1.5} />
              </Styles.CloseButton>
            </Styles.PopupHeader>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <Styles.PopupNavArrow direction="left" onClick={() => {
                const el = document.getElementById('popup-tab-scroll');
                if (el) el.scrollBy({ left: -150, behavior: 'smooth' });
              }}>‹</Styles.PopupNavArrow>

              <Styles.CategoryTabScroll id="popup-tab-scroll">
                {showMorePopup.categories.map(cat => (
                  <Styles.CategoryTab
                    key={cat.id}
                    active={cat.id === showMorePopup.selectedCategory.id}
                    onClick={() => setShowMorePopup(prev => ({ ...prev, selectedCategory: cat }))}
                  >
                    {cat.title}
                  </Styles.CategoryTab>
                ))}
              </Styles.CategoryTabScroll>

              <Styles.PopupNavArrow direction="right" onClick={() => {
                const el = document.getElementById('popup-tab-scroll');
                if (el) el.scrollBy({ left: 150, behavior: 'smooth' });
              }}>›</Styles.PopupNavArrow>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {showMorePopup.selectedCategory.players.map((player) => (
                <Styles.ListItem key={player.name} style={{ padding: '12px 0' }} onClick={() => handlePlayerClick(player.name)}>
                  <Styles.RankNumber>
                    {player.rank === 1 ? (
                      <Crown size={24} fill="#fab005" color="#fab005" />
                    ) : (
                      player.rank
                    )}
                  </Styles.RankNumber>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', marginRight: '12px' }}>
                    <PlayerAvatar name={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <Styles.ItemInfo>
                    <Styles.ItemName style={{ fontSize: '15px' }}>{player.name}</Styles.ItemName>
                    <div style={{ fontSize: '12px', color: '#868e96' }}>{player.position || '-'}</div>
                  </Styles.ItemInfo>
                  <Styles.ItemStat style={{ fontSize: '16px', color: '#339af0' }}>
                    {player.value} {showMorePopup.selectedCategory.unit}
                  </Styles.ItemStat>
                </Styles.ListItem>
              ))}
            </div>
          </Styles.ListPopupContent>
        </Styles.PopupOverlay>
      )}

      <Styles.ScrollTopButton onClick={scrollToTop}>↑</Styles.ScrollTopButton>
    </Styles.Container>
  );
};

export default TOP;