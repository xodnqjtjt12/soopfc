import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../App';
import * as S from './Topcss';

const UpdatedPlayerList = ({ players, statKey, statName, searchResult, searchResultRef, onPlayerClick }) => {
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
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
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
            onClick={() => onPlayerClick(player)}
            style={{ cursor: 'pointer' }}
          >
            <S.RankContainer isTopThree={isTopThree} rankColor={rankColor} isSearchResult={isSearchResult}>
              {player.rank}
            </S.RankContainer>
            <S.PlayerName isTopThree={isTopThree} isSearchResult={isSearchResult}>
              {player.name}
            </S.PlayerName>
            <S.StatValue isTopThree={isTopThree} rankColor={rankColor} isSearchResult={isSearchResult}>
              {player[statKey]} <S.StatLabel>{statName}</S.StatLabel>
            </S.StatValue>
          </S.PlayerItem>
        );
      })}
    </S.PlayerListContainer>
  );
};

const TopGoalScorer = () => {
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchRank, setSearchRank] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null); // setLastUpdated 정의
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const searchResultRef = useRef(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const q = query(collection(db, 'players'), orderBy('goals', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAllPlayers(data);
        setPlayers(data.slice(0, 10));
      } catch (err) {
        setError('수비 데이터 불러오는데 문제가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
        const latestPlayer = players[0];
        if (latestPlayer && latestPlayer.updatedAt) {
          setLastUpdated(new Date(latestPlayer.updatedAt.seconds * 1000)); // setLastUpdated 사용
        }
      }
    };
    fetchPlayers();
  }, [players]);

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
          prev = p.goals;
        } else if (p.goals !== prev) {
          currentRank += skip + 1;
          skip = 0;
          prev = p.goals;
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

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
  };

  const closePopup = () => {
    setSelectedPlayer(null);
  };

  return (
    <S.Container>
      <S.Header>득점왕 TOP 10</S.Header>
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
            statKey="goals"
            statName=""
            searchResult={searchResult}
            searchResultRef={searchResultRef}
            onPlayerClick={handlePlayerClick}
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
      {/* {selectedPlayer && (
        <S.PopupOverlay onClick={closePopup}>
          <S.PopupContent onClick={(e) => e.stopPropagation()}>
            <S.PopupHeader>
              <S.PopupTitle>{selectedPlayer.name}</S.PopupTitle>
              <S.CloseButton onClick={closePopup}>X</S.CloseButton>
            </S.PopupHeader>
            <S.PopupBody>
              <S.PopupStat>등번호: {selectedPlayer.backNumber || 'N/A'}</S.PopupStat>
              <S.PopupStat>포지션: {selectedPlayer.position || 'N/A'}</S.PopupStat>
              <S.PopupStat>경기 수: {selectedPlayer.games || 0}</S.PopupStat>
              <S.PopupStat>득점: {selectedPlayer.goals || 0}</S.PopupStat>
              <S.PopupStat>도움: {selectedPlayer.assists || 0}</S.PopupStat>
              <S.PopupStat>출전 기록: {selectedPlayer.appearances || 0}</S.PopupStat>
              <S.PopupStat>출전 시간(분): {selectedPlayer.minutes || 0}</S.PopupStat>
              <S.PopupStat>패스 성공률: {(selectedPlayer.passSuccessRate || 0).toFixed(2)}%</S.PopupStat>
              <S.PopupStat>패스 시도: {selectedPlayer.passAttempts || 0}</S.PopupStat>
              <S.PopupStat>패스 성공: {selectedPlayer.passSuccess || 0}</S.PopupStat>
              <S.PopupStat>유효 슈팅: {selectedPlayer.shotsOnTarget || 0}</S.PopupStat>
              <S.PopupStat>프리킥: {selectedPlayer.freeKicks || 0}</S.PopupStat>
              <S.PopupStat>페널티킥: {selectedPlayer.penalties || 0}</S.PopupStat>
              <S.PopupStat>퇴장: {selectedPlayer.redCards || 0}</S.PopupStat>
            </S.PopupBody>
            <S.PopupFooter>
              <S.GradeButton onClick={closePopup}>기록 닫기</S.GradeButton>
            </S.PopupFooter>
          </S.PopupContent>
        </S.PopupOverlay>
      )} */}
    </S.Container>
  );
};

export default TopGoalScorer;