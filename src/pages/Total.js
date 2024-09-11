import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../App';
import styled, { keyframes } from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f0f0;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
`;

const Input = styled.input`
  padding: 15px;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
`;

const Button = styled.button`
  padding: 15px;
  font-size: 18px;
  color: white;
  background-color: #3182ce;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color: #2c5282;
    transform: translateY(-2px);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PlayerData = styled.div`
  margin-top: 30px;
  background-color: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  animation: ${fadeIn} 0.5s ease-out;
`;

const PlayerName = styled.h3`
  color: #2d3748;
  margin-bottom: 20px;
  font-size: 24px;
`;

const StatItem = styled.div`
  margin-bottom: 30px;
`;

const StatLabel = styled.span`
  font-weight: bold;
  font-size: 18px;
  color: #4a5568;
  display: block;
  margin-bottom: 10px;
`;

const StatBarContainer = styled.div`
  position: relative;
  height: 40px;
  background-color: #edf2f7;
  border-radius: 20px;
  overflow: hidden;
`;

const statAnimation = keyframes`
  0% { width: 0; }
  100% { width: ${props => props.percentage}%; }
`;

const StatBar = styled.div`
  height: 100%;
  border-radius: 20px;
  animation: ${statAnimation} 1.5s ease-out forwards;
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const GoalsStatBar = styled(StatBar)`
  background: linear-gradient(90deg, #ff416c, #ff4b2b);
  animation: ${statAnimation} 1.5s ease-out forwards, ${pulseAnimation} 2s infinite;
`;

const AssistsStatBar = styled(StatBar)`
  background: linear-gradient(90deg, #4facfe, #00f2fe);
`;

const DefenseStatBar = styled(StatBar)`
  background: linear-gradient(90deg, #43e97b, #38f9d7);
`;

const OverallStatBar = styled(StatBar)`
  background: linear-gradient(90deg, #fa709a, #fee140);
`;

const StatValue = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: black;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
`;

const Total = () => {
  const [playerName, setPlayerName] = useState('');
  const [playerInfo, setPlayerInfo] = useState(null);
  const [playerRankings, setPlayerRankings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRankings = async () => {
      const goalsQuery = query(collection(db, 'players'), orderBy('goals', 'desc'));
      const goalsSnapshot = await getDocs(goalsQuery);
      const rankedByGoals = goalsSnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        goalsRank: index + 1,
      }));

      const assistsQuery = query(collection(db, 'players'), orderBy('assists', 'desc'));
      const assistsSnapshot = await getDocs(assistsQuery);
      const rankedByAssists = assistsSnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        assistsRank: index + 1,
      }));

      const defenseQuery = query(collection(db, 'players'), orderBy('defense', 'desc'));
      const defenseSnapshot = await getDocs(defenseQuery);
      const rankedByDefense = defenseSnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        defenseRank: index + 1,
      }));

      const overallRankQuery = query(collection(db, 'players'), orderBy('overallRank', 'desc'));
      const overallRankSnapshot = await getDocs(overallRankQuery);
      const rankedByOverallRank = overallRankSnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        overallRankRank: index + 1,
      }));

      setPlayerRankings({
        rankedByGoals,
        rankedByAssists,
        rankedByDefense,
        rankedByOverallRank,
      });
    };

    fetchRankings();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!playerName) {
      setError('선수 이름을 입력해주세요.');
      return;
    }

    if (!playerRankings) {
      setError('순위를 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const playerRef = doc(db, 'players', playerName);
    try {
      const playerDoc = await getDoc(playerRef);

      if (playerDoc.exists()) {
        const playerData = playerDoc.data();

        const playerInGoalsRank = playerRankings.rankedByGoals.find(p => p.id === playerDoc.id);
        const playerInAssistsRank = playerRankings.rankedByAssists.find(p => p.id === playerDoc.id);
        const playerInDefenseRank = playerRankings.rankedByDefense.find(p => p.id === playerDoc.id);
        const playerInOverallRank = playerRankings.rankedByOverallRank.find(p => p.id === playerDoc.id);

        setPlayerInfo({
          ...playerData,
          goalsRank: playerInGoalsRank ? playerInGoalsRank.goalsRank : '-',
          assistsRank: playerInAssistsRank ? playerInAssistsRank.assistsRank : '-',
          defenseRank: playerInDefenseRank ? playerInDefenseRank.defenseRank : '-',
          overallRankRank: playerInOverallRank ? playerInOverallRank.overallRankRank : '-',
        });
        setError('');
      } else {
        setPlayerInfo(null);
        setError('선수를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error("Error fetching player data: ", error);
      setError('선수 데이터 가져오기 중 오류가 발생했습니다.');
    }
  };

  const getStatPercentage = (value, max) => {
    return Math.min((value / max) * 100, 100);
  };

  return (
    <Container>
      <h2>내 스탯 보기</h2>
      <SearchForm onSubmit={handleSearch}>
        <Input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="선수 이름"
        />
        <Button type="submit">검색</Button>
      </SearchForm>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {playerInfo && (
        <PlayerData>
          <PlayerName>{playerInfo.name}님의 스탯입니다.</PlayerName>
          <p>팀: {playerInfo.team}</p>
          <StatItem>
            <StatLabel>득점</StatLabel>
            <StatBarContainer>
              <GoalsStatBar percentage={getStatPercentage(playerInfo.goals, 30)} />
              <StatValue>{playerInfo.goals}골 (순위: {playerInfo.goalsRank}위)</StatValue>
            </StatBarContainer>
          </StatItem>
          <StatItem>
            <StatLabel>도움</StatLabel>
            <StatBarContainer>
              <AssistsStatBar percentage={getStatPercentage(playerInfo.assists, 20)} />
              <StatValue>{playerInfo.assists}어시 (순위: {playerInfo.assistsRank}위)</StatValue>
            </StatBarContainer>
          </StatItem>
          <StatItem>
            <StatLabel>수비</StatLabel>
            <StatBarContainer>
              <DefenseStatBar percentage={getStatPercentage(playerInfo.defense, 15)} />
              <StatValue>{playerInfo.defense}클린시트 (순위: {playerInfo.defenseRank}위)</StatValue>
            </StatBarContainer>
          </StatItem>
          <StatItem>
            <StatLabel>출장수</StatLabel>
            <StatBarContainer>
              <OverallStatBar percentage={getStatPercentage(playerInfo.overallRank, 38)} />
              <StatValue>{playerInfo.overallRank}경기 (순위: {playerInfo.overallRankRank}위)</StatValue>
            </StatBarContainer>
          </StatItem>
        </PlayerData>
      )}
    </Container>
  );
};

export default Total;