// src/pages/OverallRankings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../App';
import * as S from './Topcss'; // 스타일드 컴포넌트를 Topcss.js에서 가져옴

const UpdatedPlayerList = ({ players, statKey, statName, searchResult, searchResultRef }) => {
  const playersWithRank = React.useMemo(() => {
    let currentRank = 1;
    let prevValue = null;
    let skipCount = 0;

    return players.map((player, index) => {
      const value = player[statKey];
      if (index === 0) {
        prevValue = value;
        return { ...player, rank: currentRank };
      }
      if (value === prevValue) {
        skipCount++;
        return { ...player, rank: currentRank };
      } else {
        currentRank += skipCount + 1;
        skipCount = 0;
        prevValue = value;
        return { ...player, rank: currentRank };
      }
    });
  }, [players, statKey]);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // 금색
      case 2:
        return '#C0C0C0'; // 은색
      case 3:
        return '#CD7F32'; // 동색
      default:
        return '#f0f0f0';
    }
  };

  return (
    <S.PlayerListContainer>
      {playersWithRank.map((player) => {
        const isTopThree = player.rank <= 3;
        const rankColor = getRankColor(player.rank);
        const isSearchResult = searchResult && player.id === searchResult.id;

        return (
          <S.PlayerItem
            key={player.id}
            isTopThree={isTopThree}
            rankColor={rankColor}
            isSearchResult={isSearchResult}
            ref={isSearchResult ? searchResultRef : null}
          >
            <S.RankContainer isTopThree={isTopThree} rankColor={rankColor} isSearchResult={isSearchResult}>
              {player.rank}
            </S.RankContainer>
            <S.PlayerName isTopThree={isTopThree} isSearchResult={isSearchResult}>
              {player.name}
            </S.PlayerName>
            {/* <S.TeamName>{player.team}</S.TeamName> */}
            <S.StatValue isTopThree={isTopThree} rankColor={rankColor} isSearchResult={isSearchResult}>
              {player[statKey]} <S.StatLabel>{statName}</S.StatLabel>
            </S.StatValue>
          </S.PlayerItem>
        );
      })}
    </S.PlayerListContainer>
  );
};

const MomRanking = () => {
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchRank, setSearchRank] = useState(null);

  const searchResultRef = useRef(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const q = query(collection(db, 'players'), orderBy('momScore', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAllPlayers(data);
        setPlayers(data.slice(0, 10));
      } catch (err) {
        setError('경기수 데이터를 불러오는 중에 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (searchResult && searchResultRef.current) {
      searchResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchResult]);

  const handleSearch = async () => {
    if (!searchName.trim()) {
      alert('선수 이름을 입력해주세요.');
      return;
    }
    try {
      const q = query(collection(db, 'players'), where('name', '==', searchName.trim()));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        alert('해당 이름의 선수를 찾을 수 없습니다.');
        setSearchResult(null);
        setSearchRank(null);
        setPlayers(allPlayers.slice(0, 10));
        return;
      }
      const foundPlayer = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

      let currentRank = 1;
      let prev = null;
      let skip = 0;
      for (let i = 0; i < allPlayers.length; i++) {
        const p = allPlayers[i];
        if (i === 0) {
          prev = p.momScore;
        } else if (p.momScore !== prev) {
          currentRank += skip + 1;
          skip = 0;
          prev = p.momScore;
        } else {
          skip++;
        }
        if (p.id === foundPlayer.id) break;
      }

      setSearchResult(foundPlayer);
      setSearchRank(currentRank);

      const topTenIds = allPlayers.slice(0, 10).map((p) => p.id);
      const newList = [...allPlayers.slice(0, 10)];
      if (!topTenIds.includes(foundPlayer.id)) {
        newList.push(foundPlayer);
      }
      setPlayers(newList);
    } catch (err) {
      console.error('검색 오류:', err);
      alert('검색 중 오류가 발생했습니다.');
    }
  };

  return (
    <S.Container>
      <S.Header>MOM TOP10</S.Header>
      <S.SearchContainer>
        <S.SearchInput
          placeholder="선수 이름으로 검색"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <S.SearchButton onClick={handleSearch}>검색</S.SearchButton>
      </S.SearchContainer>
      {loading && <S.Message>로딩 중...</S.Message>}
      {error && <S.Message type="error">{error}</S.Message>}
      {!loading && !error && players.length === 0 && <S.Message>데이터가 없습니다.</S.Message>}
      {!loading && !error && players.length > 0 && (
        <>
          <UpdatedPlayerList
            players={players}
            statKey="momScore"
            statName=""
            searchResult={searchResult}
            searchResultRef={searchResultRef}
          />
          {searchResult && searchRank > 10 && (
            <>
              <S.Divider />
              <S.SearchResultLabel>
                검색하신 "{searchResult.name}" 선수는 현재 {searchRank}위 입니다.
              </S.SearchResultLabel>
            </>
          )}
        </>
      )}
    </S.Container>
  );
};

export default MomRanking;