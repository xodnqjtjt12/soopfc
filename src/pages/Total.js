import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../App';
import { FaFutbol, FaShoePrints, FaShieldAlt, FaRunning, FaStar, FaMedal, FaChartLine, FaTrophy, FaCheck, FaTimes, FaEquals } from 'react-icons/fa';
import {
  OuterWrapper, Container, SearchForm, Input, Button, RankBannerContainer, RankMessage,
  PlayerData, PlayerCardHeader, PlayerRating, PlayerName, PlayerPosition, PositionBadge,
  StatsGrid, StatRow, StatHeader, StatLabel, StatValue, StatBarContainer, StatBar,
  AdvancedStatsSection, AdvancedStatsTitle, AdvancedStatsGrid, AdvancedStatCard,
  AdvancedStatValue, AdvancedStatLabel, LevelUpMessage, TitleContainer, Title,
  getRankColor, getRatingColor
} from './TotalCss';

// 선수 Rating 계산 (FIFA 스타일)
const calculateRating = (playerInfo) => {
  if (!playerInfo) return 0;
  
  // 기본적인 계산 방식 (실제 FIFA와는 다를 수 있음)
  const goalWeight = 2.5;
  const assistWeight = 2;
  const cleanSheetWeight = 2;
  const winWeight = 1.5;
  const momScoreWeight = 0.02; // MOM 점수 반영
  
  const baseRating = 50;
  const calculatedRating = baseRating + 
    (playerInfo.goals * goalWeight) + 
    (playerInfo.assists * assistWeight) + 
    (playerInfo.cleanSheets * cleanSheetWeight) + 
    (playerInfo.win * winWeight) +
    (playerInfo.momScore * momScoreWeight);
  
  return Math.min(99, Math.floor(calculatedRating));
};

const getPlayerTitles = (playerInfo) => {
  const titles = [];
  
  if (playerInfo.goals >= 15) {
    titles.push('SOOP FC 메시');
  } else if (playerInfo.goals >= 10) {
    titles.push('득점기계');
  } else if (playerInfo.goals >= 5) {
    titles.push('골잡이');
  }

  if (playerInfo.assists >= 10) {
    titles.push('SOOP FC 이니에스타');
  } else if (playerInfo.assists >= 5) {
    titles.push('키패서');
  }

  if (playerInfo.cleanSheets >= 15) {
    titles.push('클린 시트의 주역');
  } else if (playerInfo.cleanSheets >= 10) {
    titles.push('수비의 리더');
  } else if (playerInfo.cleanSheets >= 5) {
    titles.push('뒷공간 지킴이');
  }

  if (playerInfo.matches >= 20) {
    titles.push('SOOP FC 레전드');
  } else if (playerInfo.matches >= 10) {
    titles.push('SOOP FC 참석왕');
  } else if (playerInfo.matches >= 5) {
    titles.push('꾸준함의 아이콘');
  }

  if (playerInfo.personalPoints >= 20) {
    titles.push('승점의 화신');
  } else if (playerInfo.personalPoints >= 10) {
    titles.push('팀의 핵심');
  }

  if (playerInfo.momScore >= 900) {
    titles.push('MOM의 제왕');
  } else if (playerInfo.momScore >= 800) {
    titles.push('경기의 MVP');
  }

  if (playerInfo.winRate >= 70) {
    titles.push('승리 제조기');
  } else if (playerInfo.winRate >= 50) {
    titles.push('믿을 수 있는 승부사');
  }

  if (titles.length === 0) {
    titles.push('SOOP FC 유망주');
  }

  return titles;
};

// 공동 순위 계산 헬퍼 함수
const computeRankings = (docs, statKey, rankKeyName) => {
  // Sort documents by stat value in descending order
  const sortedDocs = [...docs].sort((a, b) => {
    const valueA = a.data()[statKey] || 0;
    const valueB = b.data()[statKey] || 0;
    return valueB - valueA; // Descending order
  });

  let currentRank = 0;
  let prevValue = null;
  return sortedDocs.map((doc, index) => {
    const value = doc.data()[statKey] || 0;
    if (value !== prevValue) {
      currentRank = index + 1;
      prevValue = value;
    }
    return { id: doc.id, ...doc.data(), [rankKeyName]: currentRank };
  });
};

// 레벨업 메시지 헬퍼 함수
const getLevelUpMessage = (value, thresholds, titles, unit) => {
  for (let i = 0; i < thresholds.length; i++) {
    if (value < thresholds[i]) {
      const diff = thresholds[i] - value;
      if (diff <= 3) {
        return `추가 ${diff}${unit}만 더하면 '${titles[i]}' 칭호를 얻을 수 있습니다!`;
      }
      break;
    }
  }
  return null;
};

const Total = () => {
  const [playerName, setPlayerName] = useState('');
  const [playerInfo, setPlayerInfo] = useState(null);
  const [playerRankings, setPlayerRankings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRankings = async () => {
      // 모든 플레이어 데이터를 가져와 xG 계산
      const playersQuery = query(collection(db, 'players'));
      const playersSnapshot = await getDocs(playersQuery);
      let playersData = playersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // xG 계산: Home.jsx와 동일한 로직
      playersData = playersData.map((player) => {
        const matches = player.matches || 1; // 0 방지
        const normalizedGoals = player.goals / matches;
        const normalizedAssists = player.assists / matches;
        const normalizedCleanSheets = player.cleanSheets / matches;
        const normalizedWinRate = player.winRate / 100; // 백분율을 0~1로
        const normalizedPoints = player.personalPoints / matches;

        // 가중 합산
        const xG =
          0.4 * normalizedGoals +
          0.3 * normalizedAssists +
          0.2 * normalizedCleanSheets +
          0.05 * normalizedWinRate +
          0.05 * normalizedPoints;

        return { ...player, xG };
      });

      // xG 스케일링 (최대값 1)
      const maxXG = Math.max(...playersData.map((p) => p.xG), 1); // 0 방지
      playersData = playersData.map((player) => ({
        ...player,
        xG: Math.min((player.xG / maxXG), 1.0),
      }));

      // 순위 계산
      const rankedByGoals = computeRankings(playersSnapshot.docs, 'goals', 'goalsRank');
      const rankedByAssists = computeRankings(playersSnapshot.docs, 'assists', 'assistsRank');
      const rankedByCleanSheets = computeRankings(playersSnapshot.docs, 'cleanSheets', 'cleanSheetsRank');
      const rankedByMatches = computeRankings(playersSnapshot.docs, 'matches', 'matchesRank');
      const rankedByPoints = computeRankings(playersSnapshot.docs, 'personalPoints', 'pointsRank');
      const rankedByMom = computeRankings(playersSnapshot.docs, 'momScore', 'momRank');
      const rankedByWinRate = computeRankings(playersSnapshot.docs, 'winRate', 'winRateRank');

      setPlayerRankings({
        rankedByGoals,
        rankedByAssists,
        rankedByCleanSheets,
        rankedByMatches,
        rankedByPoints,
        rankedByMom,
        rankedByWinRate,
        playersData, // xG 계산된 데이터 저장
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
        const matches = playerData.matches || 1; // 0 방지

        // xG: rankings에서 가져옴
        const playerInRankings = playerRankings.playersData.find(p => p.id === playerDoc.id);
        const xG = playerInRankings ? playerInRankings.xG.toFixed(3) : '0.000';

        // xA: 경기당 어시스트
        const xA = (playerData.assists / matches).toFixed(3);

        // war: 경기당 골
        const war = (playerData.goals / matches).toFixed(3);

        const playerInGoalsRank = playerRankings.rankedByGoals.find(p => p.id === playerDoc.id);
        const playerInAssistsRank = playerRankings.rankedByAssists.find(p => p.id === playerDoc.id);
        const playerInCleanSheetsRank = playerRankings.rankedByCleanSheets.find(p => p.id === playerDoc.id);
        const playerInMatchesRank = playerRankings.rankedByMatches.find(p => p.id === playerDoc.id);
        const playerInPointsRank = playerRankings.rankedByPoints.find(p => p.id === playerDoc.id);
        const playerInMomRank = playerRankings.rankedByMom.find(p => p.id === playerDoc.id);
        const playerInWinRateRank = playerRankings.rankedByWinRate.find(p => p.id === playerDoc.id);

        setPlayerInfo({
          ...playerData,
          goalsRank: playerInGoalsRank ? playerInGoalsRank.goalsRank : '-',
          assistsRank: playerInAssistsRank ? playerInAssistsRank.assistsRank : '-',
          cleanSheetsRank: playerInCleanSheetsRank ? playerInCleanSheetsRank.cleanSheetsRank : '-',
          matchesRank: playerInMatchesRank ? playerInMatchesRank.matchesRank : '-',
          pointsRank: playerInPointsRank ? playerInPointsRank.pointsRank : '-',
          momRank: playerInMomRank ? playerInMomRank.momRank : '-',
          winRateRank: playerInWinRateRank ? playerInWinRateRank.winRateRank : '-',
          attackPoints: playerData.goals + playerData.assists,
          xG,
          xA,
          war,
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

  // 순위 배너 메시지 렌더링
  const renderRankBanner = () => {
    if (!playerInfo) return null;
    const messages = [];
    
    // Minimum stat value thresholds to ensure meaningful rankings
    if (playerInfo.goalsRank <= 3 && playerInfo.goals > 0) {
      messages.push({
        icon: <FaFutbol color={getRankColor(playerInfo.goalsRank)} />,
        text: `현재 득점순위 ${playerInfo.goalsRank}위입니다! (${playerInfo.goals}골)`
      });
    }
    if (playerInfo.assistsRank <= 3 && playerInfo.assists > 0) {
      messages.push({
        icon: <FaShoePrints color={getRankColor(playerInfo.assistsRank)} />,
        text: `현재 어시스트순위 ${playerInfo.assistsRank}위입니다! (${playerInfo.assists}어시)`
      });
    }
    if (playerInfo.cleanSheetsRank <= 3 && playerInfo.cleanSheets > 0) {
      messages.push({
        icon: <FaShieldAlt color={getRankColor(playerInfo.cleanSheetsRank)} />,
        text: `현재 클린시트순위 ${playerInfo.cleanSheetsRank}위입니다! (${playerInfo.cleanSheets}클린)`
      });
    }
    if (playerInfo.pointsRank <= 3 && playerInfo.personalPoints > 0) {
      messages.push({
        icon: <FaTrophy color={getRankColor(playerInfo.pointsRank)} />,
        text: `현재 개인승점 순위 ${playerInfo.pointsRank}위입니다! (${playerInfo.personalPoints}점)`
      });
    }
    if (playerInfo.momRank <= 3 && playerInfo.momScore > 0) {
      messages.push({
        icon: <FaStar color={getRankColor(playerInfo.momRank)} />,
        text: `현재 MOM점수 순위 ${playerInfo.momRank}위입니다! (${playerInfo.momScore}점)`
      });
    }
    if (playerInfo.matchesRank <= 3 && playerInfo.matches > 0) {
      messages.push({
        icon: <FaStar color={getRankColor(playerInfo.matchesRank)} />,
        text: `현재 경기수 순위 ${playerInfo.matchesRank}위입니다! (${playerInfo.matches}점)`
      });
    }


    if (messages.length === 0) return null;
    return (
      <RankBannerContainer>
        {messages.map((msg, index) => (
          <RankMessage key={index}>
            <FaMedal color={getRankColor(3)} />
            {msg.icon}
            <span>{msg.text}</span>
          </RankMessage>
        ))}
      </RankBannerContainer>
    );
  };

  // 선수 포지션 결정
  const determinePosition = (playerInfo) => {
    if (!playerInfo) return 'FW';
    
    const { goals, assists, cleanSheets, backNumber } = playerInfo;
    
    // 골키퍼: 등번호 1번
    if (backNumber === 1) return 'GK';
    
    // 수비수 세부 구분
    if (cleanSheets > goals && cleanSheets > assists) {
      // 중앙 수비수 vs 측면 수비수
      if (assists < 2) return 'CB'; // 어시스트가 적으면 중앙 수비수
      return 'LWB,RWB';  // 어시스트가 많으면 풀백(측면 수비수)
    }
    
    // 미드필더 세부 구분
    if (assists > goals && assists > cleanSheets) {
      if (goals > 3) return 'CAM'; // 공격형 미드필더
      if (cleanSheets > 2) return 'CDM'; // 수비형 미드필더
      return 'CM';  // 중앙 미드필더
    }
    
    // 공격수 세부 구분
    if (goals > assists && goals > cleanSheets) {
      if (assists > 3) return 'SS'; // 세컨드 스트라이커
      return 'FW';  // 주 스트라이커
    }
    
    // 윙어 (득점, 어시스트 모두 있는 경우)
    if (goals >= 3 && assists >= 3) return 'WF';
    
    // 그 외는 기본 위치
    return 'MF';
  };

  return (
    <OuterWrapper>
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

        {/* 순위 배너 */}
        {playerInfo && renderRankBanner()}

        {playerInfo && (
          <PlayerData>
            <PlayerCardHeader>
              <PlayerRating>
                {playerInfo.backNumber}
              </PlayerRating>
              <PlayerName>{playerInfo.name}</PlayerName>
              <PlayerPosition>
  {/* 대문자로 변환 */}
  {determinePosition(playerInfo).toUpperCase()}
  <div style={{ marginLeft: '10px' }}>
    {playerInfo.team && (
      <PositionBadge>
        {/* 대문자로 변환 */}
        {playerInfo.team.toUpperCase()}
      </PositionBadge>
    )}
  </div>
</PlayerPosition>
            </PlayerCardHeader>

            <StatsGrid>
              {/* 득점 Stat */}
              <StatRow>
                <StatHeader>
                  <StatLabel><FaFutbol /> 2025 득점</StatLabel>
                  <StatValue color={getRankColor(playerInfo.goalsRank)}>
                    {playerInfo.goals} 골({playerInfo.goalsRank}위)
                  </StatValue>
                </StatHeader>
                <StatBarContainer>
                  <StatBar
                    percentage={getStatPercentage(playerInfo.goals, 30)}
                    color={getRankColor(playerInfo.goalsRank)}
                  />
                </StatBarContainer>
              </StatRow>

              {/* 어시스트 Stat */}
              <StatRow>
                <StatHeader>
                  <StatLabel><FaShoePrints /> 2025 어시스트</StatLabel>
                  <StatValue color={getRankColor(playerInfo.assistsRank)}>
                    {playerInfo.assists} 어시({playerInfo.assistsRank}위)
                  </StatValue>
                </StatHeader>
                <StatBarContainer>
                  <StatBar
                    percentage={getStatPercentage(playerInfo.assists, 20)}
                    color={getRankColor(playerInfo.assistsRank)}
                  />
                </StatBarContainer>
              </StatRow>

              {/* 클린시트 Stat */}
              <StatRow>
                <StatHeader>
                  <StatLabel><FaShieldAlt /> 2025 클린시트</StatLabel>
                  <StatValue color={getRankColor(playerInfo.cleanSheetsRank)}>
                    {playerInfo.cleanSheets} ({playerInfo.cleanSheetsRank}위)
                  </StatValue>
                </StatHeader>
                <StatBarContainer>
                  <StatBar
                    percentage={getStatPercentage(playerInfo.cleanSheets, 15)}
                    color={getRankColor(playerInfo.cleanSheetsRank)}
                  />
                </StatBarContainer>
              </StatRow>

           {/* 승/무/패 Stat */}
<StatRow>
  <StatHeader>
    <StatLabel>
      <FaTrophy /> {/* Single icon replaced the three icons */}
      승/무/패
    </StatLabel>
    <StatValue>
      <span style={{ color: '#f8c058' }}>{playerInfo.win}</span> / 
      <span style={{ color: '#acb0b9' }}>{playerInfo.draw}</span> / 
      <span style={{ color: '#f44336' }}>{playerInfo.lose}</span>
    </StatValue>
  </StatHeader>
  <StatBarContainer>
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <StatBar
        percentage={playerInfo.matches > 0 ? (playerInfo.win / playerInfo.matches) * 100 : 0}
        color="#FFD700"
      />
      <div style={{ 
        height: '100%',
        width: `${playerInfo.matches > 0 ? (playerInfo.draw / playerInfo.matches) * 100 : 0}%`,
        backgroundColor: '#acb0b9'
      }}></div>
      <div style={{ 
        height: '100%',
        width: `${playerInfo.matches > 0 ? (playerInfo.lose / playerInfo.matches) * 100 : 0}%`,
        backgroundColor: '#f44336'
      }}></div>
    </div>
  </StatBarContainer>
</StatRow>

              {/* 승률 Stat */}
              <StatRow>
  <StatHeader>
    <StatLabel><FaTrophy /> 승률</StatLabel>
    <StatValue color={getRankColor(playerInfo.winRateRank)}>
  {playerInfo.winRate.toFixed(0)}% ({playerInfo.winRateRank}위)
</StatValue>
  </StatHeader>
  <StatBarContainer>
    <StatBar
      percentage={getStatPercentage(playerInfo.winRate, 100)}
      color={getRankColor(playerInfo.winRateRank)}
    />
  </StatBarContainer>
</StatRow>

              {/* 개인승점 Stat */}
              <StatRow>
                <StatHeader>
                  <StatLabel><FaStar /> 개인승점</StatLabel>
                  <StatValue color={getRankColor(playerInfo.pointsRank)}>
                    {playerInfo.personalPoints} ({playerInfo.pointsRank}위)
                  </StatValue>
                </StatHeader>
                <StatBarContainer>
                  <StatBar
                    percentage={getStatPercentage(playerInfo.personalPoints, 30)}
                    color={getRankColor(playerInfo.pointsRank)}
                  />
                </StatBarContainer>
              </StatRow>

              {/* MOM점수 Stat */}
              <StatRow>
                <StatHeader>
                  <StatLabel><FaMedal /> MOM점수</StatLabel>
                  <StatValue color={getRankColor(playerInfo.momRank)}>
                    {playerInfo.momScore} ({playerInfo.momRank}위)
                  </StatValue>
                </StatHeader>
                <StatBarContainer>
                  <StatBar
                    percentage={getStatPercentage(playerInfo.momScore, 1000)}
                    color={getRankColor(playerInfo.momRank)}
                  />
                </StatBarContainer>
              </StatRow>

              {/* 출장수 Stat */}
              <StatRow>
                <StatHeader>
                  <StatLabel><FaRunning /> 출장수</StatLabel>
                  <StatValue color={getRankColor(playerInfo.matchesRank)}>
                    {playerInfo.matches} ({playerInfo.matchesRank}위)
                  </StatValue>
                </StatHeader>
                <StatBarContainer>
                  <StatBar
                    percentage={getStatPercentage(playerInfo.matches, 38)}
                    color={getRankColor(playerInfo.matchesRank)}
                  />
                </StatBarContainer>
              </StatRow>
            </StatsGrid>

            {/* 고급 스탯 섹션 (xG, xA, war) */}
            <AdvancedStatsSection>
              <AdvancedStatsTitle>
                <FaChartLine /> 세부 스탯
              </AdvancedStatsTitle>
              <AdvancedStatsGrid>
                <AdvancedStatCard title="경기당 도움 기대값 (숫자가 높을수록 좋음)">
                  <AdvancedStatValue>{playerInfo.xA}</AdvancedStatValue>
                  <AdvancedStatLabel>xA</AdvancedStatLabel>
                </AdvancedStatCard>
                <AdvancedStatCard title="경기당 골 기대값 (숫자가 높을수록 좋음)">
                  <AdvancedStatValue>{playerInfo.war}</AdvancedStatValue>
                  <AdvancedStatLabel>xG</AdvancedStatLabel>
                </AdvancedStatCard>
                <AdvancedStatCard title="종합 기여도 (숫자가 높을수록 좋음)">
                  <AdvancedStatValue>{playerInfo.xG}</AdvancedStatValue>
                  <AdvancedStatLabel>WAR</AdvancedStatLabel>
                </AdvancedStatCard>
              </AdvancedStatsGrid>
            </AdvancedStatsSection>

            {/* 레벨업 메시지 */}
            {getLevelUpMessage(playerInfo.goals, [5,10,15], ['골잡이', '득점기계', '득점 GOAT'], '골') && (
              <LevelUpMessage>
                {getLevelUpMessage(playerInfo.goals, [5,10,15], ['골잡이', '득점기계', '득점 GOAT'], '골')}
              </LevelUpMessage>
            )}
            
            {getLevelUpMessage(playerInfo.assists, [5,10], ['키패서', 'PASS GOAT'], '개의 어시스트') && (
              <LevelUpMessage>
                {getLevelUpMessage(playerInfo.assists, [5,10], ['키패서', 'PASS GOAT'], '개의 어시스트')}
              </LevelUpMessage>
            )}
            
            {getLevelUpMessage(playerInfo.cleanSheets, [5,10,15], ['뒷공간 지킴이', '수비의 리더', '클린 시트의 주역'], '클린시트') && (
              <LevelUpMessage>
                {getLevelUpMessage(playerInfo.cleanSheets, [5,10,15], ['뒷공간 지킴이', '수비의 리더', '클린 시트의 주역'], '클린시트')}
              </LevelUpMessage>
            )}
            
            {getLevelUpMessage(playerInfo.matches, [5,10,20], ['꾸준함의 아이콘', 'SOOP FC 참석왕', 'SOOP FC 레전드'], '경기') && (
              <LevelUpMessage>
                {getLevelUpMessage(playerInfo.matches, [5,10,20], ['꾸준함의 아이콘', 'SOOP FC 참석왕', 'SOOP FC 레전드'], '경기')}
              </LevelUpMessage>
            )}
            
            {getLevelUpMessage(playerInfo.personalPoints, [10,20], ['팀의 핵심', 'SOOP FC GOAT'], '승점') && (
              <LevelUpMessage>
                {getLevelUpMessage(playerInfo.personalPoints, [10,20], ['팀의 핵심', 'SOOP FC GOAT'], '승점')}
              </LevelUpMessage>
            )}
            
            {getLevelUpMessage(playerInfo.momScore, [800,900,1000], ['경기의 MVP', 'MOM의 제왕', 'GOAT'], '점') && (
              <LevelUpMessage>
                {getLevelUpMessage(playerInfo.momScore, [800,900,1000], ['경기의 MVP', 'MOM의 제왕','GOAT'], '점')}
              </LevelUpMessage>
            )}

            {/* 칭호 표시 */}
            <TitleContainer>
              {getPlayerTitles(playerInfo).map((title, index) => (
                <Title key={index}>{title}</Title>
              ))}
            </TitleContainer>
          </PlayerData>
        )}
      </Container>
    </OuterWrapper>
  );
};

export default Total;