import styled, { keyframes } from 'styled-components';

// 애니메이션 키프레임 정의
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const CardGlow = keyframes`
  0% { box-shadow: 0 0 10px rgba(255,215,0,0.3); }
  50% { box-shadow: 0 0 20px rgba(255,215,0,0.6); }
  100% { box-shadow: 0 0 10px rgba(255,215,0,0.3); }
`;

export const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

export const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

export const slideOut = keyframes`
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-100px); }
`;

export const expand = keyframes`
  from { max-height: 0; opacity: 0; }
  to { max-height: 1000px; opacity: 1; }
`;

// 순위에 따라 색상 반환하는 함수
export const getRankColor = (rank) => {
  if (rank === 1) return '#FFD700'; // 금색
  else if (rank === 2) return '#C0C0C0'; // 은색
  else if (rank === 3) return '#CD7F32'; // 동색
  return '#f8c058'; // 평범한 금색 (4등 이상)
};

export const getRatingColor = (value) => {
  if (value >= 90) return '#f8c058'; // 금색
  else if (value >= 80) return '#C0C0C0'; // 은색
  else if (value >= 70) return '#CD7F32'; // 동색
  return '#ffffff'; // 흰색
};

// 스타일 컴포넌트 정의
export const OuterWrapper = styled.div`
  background-color: #f9fafb;
  padding-top: 24px;

  @media (max-width: 640px) {
    background-color: #ffffff;
  }
`;

export const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background-color: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  @media (max-width: 640px) {
    padding: 15px;
    margin: -70px 16px 0 16px;
  }
`;

export const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
  @media (max-width: 640px) {
    gap: 10px;
  }
`;

export const Input = styled.input`
  padding: 15px;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  @media (max-width: 640px) {
    font-size: 16px;
    padding: 12px;
  }
`;

export const Button = styled.button`
  padding: 15px;
  font-size: 18px;
  color: white;
  background-color: #0182ff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color: #2c5282;
    transform: translateY(-2px);
  }
  @media (max-width: 640px) {
    font-size: 16px;
    padding: 12px;
  }
`;

export const RankBannerContainer = styled.div`
  background: linear-gradient(135deg, #303030, #1a1a1a);
  color: #f8f8f8;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 18px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  animation: ${fadeIn} 0.5s ease-out;
  @media (max-width: 600px) {
    font-size: 16px;
    gap: 12px;
  }
`;

export const RankMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ${slideIn} 0.5s ease-out;
`;

export const PlayerData = styled.div`
  margin-top: 30px;
  background: linear-gradient(135deg, #303030, #1a1a1a);
  border-radius: 15px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  animation: ${fadeIn} 0.5s ease-out, ${CardGlow} 3s infinite;
  color: #f8f8f8;
  position: relative;
  width: 100%;
`;

export const PlayerCardHeader = styled.div`
  background: linear-gradient(135deg, #f8c058, #c8ff00);
  padding: 20px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  }
`;

export const PlayerRating = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #1a1a1a;
  color: #f8c058;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  border: 2px solid #f8c058;
  animation: ${bounce} 2s infinite;
  @media (max-width: 640px) {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
`;

export const PlayerName = styled.h3`
  color: #1a1a1a;
  margin: 0 0 5px 80px;
  font-size: 28px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: ${slideIn} 0.5s ease-out;
  @media (max-width: 640px) {
    font-size: 24px;
    margin-left: 70px;
  }
`;

export const PlayerPosition = styled.div`
  margin-left: 80px;
  color: #1a1a1a;
  font-weight: 600;
  font-size: 20px;
  display: flex;
  gap: 10px;
  animation: ${slideIn} 0.5s ease-out;
  @media (max-width: 640px) {
    font-size: 18px;
    margin-left: 70px;
    flex-wrap: wrap;
  }
`;

export const PositionBadge = styled.span`
  background-color: ${props => {
    switch(props.position) {
      case 'CB': return '#2196f3';
      case 'CM': return '#4caf50';
      case 'LW': return '#f44336';
      case 'CAM': return '#4caf50';
      case 'RB': return '#2196f3';
      case 'RW': return '#e91e63';
      default: return '#2196f3';
    }
  }};
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  @media (max-width: 640px) {
    font-size: 12px;
    padding: 1px 6px;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 20px;
  gap: 15px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const StatRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

export const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const StatLabel = styled.span`
  font-weight: 600;
  color: #f8f8f8;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const StatValue = styled.span`
  font-weight: 700;
  color: ${props => props.color || '#f8c058'};
  font-size: 18px;
  animation: ${bounce} 2s infinite;
  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

export const StatBarContainer = styled.div`
  position: relative;
  height: 10px;
  background-color: #3a3a3a;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 5px;
`;

export const statAnimation = (percentage) => keyframes`
  0% { width: 0; }
  100% { width: ${percentage}%; }
`;

export const StatBar = styled.div`
  height: 100%;
  border-radius: 0;
  background: ${props => props.color || '#f8c058'};
  animation: ${(props) => statAnimation(props.percentage)} 1.5s ease-out forwards;
  width: 0;
`;

export const AdvancedStatsSection = styled.div`
  padding: 20px;
  border-top: 1px solid #3a3a3a;
`;

export const AdvancedStatsTitle = styled.h4`
  color: #f9f7ff;
  margin: 0 0 15px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ${slideIn} 0.5s ease-out;
  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

export const AdvancedStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const AdvancedStatCard = styled.div`
  background-color: #292929;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
  @media (max-width: 640px) {
    padding: 10px;
  }
`;

export const AdvancedStatValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #f8c058;
  margin-bottom: 5px;
  @media (max-width: 640px) {
    font-size: 18px;
  }
`;

export const AdvancedStatLabel = styled.div`
  font-size: 14px;
  color: #a0a0a0;
  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

export const LevelUpMessage = styled.p`
  margin-top: 10px;
  font-size: 16px;
  color: #f8c058;
  font-weight: bold;
  animation: ${fadeIn} 1s ease-out;
  padding: 10px 20px;
  background-color: rgba(248, 192, 88, 0.1);
  border-radius: 8px;
  margin: 16px 16px;
  @media (max-width: 640px) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;

export const TitleContainer = styled.div`
  padding: 20px;
  border-top: 1px solid #3a3a3a;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const Title = styled.div`
  margin: 10px 0;
  font-size: 18px;
  color: #f8c058;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:before {
    content: '🏆';
  }
  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

// 선수 기록 더보기 버튼 스타일 (토글 버튼으로 사용)
export const ToggleHistoryButton = styled.button`
  display: block;
   margin: 16px 16px;
  padding: 15px 30px;
  font-size: 18px;
  color: white;
  background-color: #0182ff;
  border: none;
  border-radius: 10px;
display: flex;
justify-content: center; /* 수평 중앙 정렬 */
align-items: center;     /* 수직 중앙 정렬 */
text-decoration: none;   /* ← 이 줄을 추가하세요 (밑줄 제거) */
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    background-color: #2c5282;
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    font-size: 16px;
    padding: 12px 24px;
  }
`;

// 히스토리 섹션 컨테이너
export const HistorySection = styled.div`
  padding: 20px;
  background-color: #1a1a1a;
  border-radius: 10px;
  margin-top: 20px;
  animation: ${expand} 0.5s ease-out;
  overflow: hidden;

  @media (max-width: 640px) {
    padding: 15px;
  }
`;

// PlayerHistorySection 스타일
export const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #1a1a1a;
  border-radius: 10px;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const HistoryTableHeader = styled.th`
  padding: 15px;
  background-color: #303030;
  color: #f8f8f8;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid #3a3a3a;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px;
  }
`;

export const HistoryTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #252525;
  }
`;

export const HistoryTableCell = styled.td`
  padding: 15px;
  color: #f8f8f8;
  font-size: 16px;
  text-align: center;
  border-bottom: 1px solid #3a3a3a;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px;
  }
`;

// TopSearchedPlayers 스타일
export const TopPlayersContainer = styled.div`
  position: fixed;
  top: 1px;
  right: 20px;
  width: 300px;
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  color: #fff;
  transition: transform 0.3s ease, opacity 0.3s ease;
  z-index: 1000;

  /* 화면 크기에 따라 왼쪽으로 이동 */
  @media (max-width: 1100px) {
    transform: translateX(-${(props) => Math.min((1100 - props.windowWidth) * 0.5, 300)}px);
  }

  /* Container에 부딪히면 사라짐 */
  @media (max-width: 900px) {
    opacity: 0;
    transform: translateX(-100px);
    pointer-events: none;
  }

  /* 모바일에서 숨김 */
  @media (max-width: 640px) {
    display: none;
  }
`;

export const TopPlayersTitle = styled.div`
  font-size: 1.5rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const TopPlayerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #333;
  animation: ${slideIn} 0.5s ease-out;
`;

export const PlayerRank = styled.span`
  font-weight: bold;
  width: 30px;
`;

export const PlayerNameText = styled.span`
  flex: 1;
`;

export const RankChange = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const LastUpdate = styled.div`
  font-size: 0.9rem;
  color: #aaa;
  margin-top: 15px;
  text-align: center;
`;