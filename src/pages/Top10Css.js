// Top10Css.js
import styled, { keyframes } from 'styled-components';

// 애니메이션 효과
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleUp = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const subtlePulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

export const Header = styled.div`
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const Title = styled.h1`
  margin: 0 20px;
  font-size: 28px;

  @media (max-width: 768px) {
    font-size: 24px;
    margin: 0 10px;
  }
`;

export const NavArrow = styled.div`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 24px;
  opacity: ${props => (props.disabled ? 0.3 : 1)};
  pointer-events: ${props => (props.disabled ? 'none' : 'auto')};

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const RecentButton = styled.div`
  position: absolute;
  right: 0;
  padding: 5px 10px;
  background-color: #f1f1f1;
  border-radius: 20px;
  border: 1px solid #ddd;
  font-size: 14px;
  cursor: pointer;

  @media (max-width: 768px) {
    position: static;
    margin-top: 10px;
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
`;

export const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  width: 200px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: #3182f6;
    box-shadow: 0 0 5px rgba(49, 130, 246, 0.2);
  }

  @media (max-width: 768px) {
    width: 70%;
    font-size: 12px;
    padding: 6px 10px;
  }

  @media (max-width: 480px) {
    width: 60%;
  }
`;

export const SearchButton = styled.button`
  padding: 8px 16px;
  background-color: #3182f6;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.1s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #2a74e0;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

export const StatsContainer = styled.div`
  overflow-x: auto;
  white-space: nowrap;
  margin-bottom: 20px;
  padding-bottom: 10px;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }
`;

export const StatsScroll = styled.div`
  display: flex;
  gap: 10px;
  min-width: 100%;
`;

export const StatsCard = styled.div`
  flex: 0 0 250px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 15px;
  display: inline-block;
  border: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    flex: 0 0 80%;
  }

  @media (max-width: 480px) {
    flex: 0 0 90%;
  }
`;

export const StatsTitle = styled.div`
  text-align: center;
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
`;

export const RankingList = styled.div`
  margin-top: 10px;
`;

export const RankingItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
`;

export const RankWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 25px;
`;

export const Rank = styled.div`
  width: 25px;
  text-align: center;
  font-weight: 600;
  color: #333;
`;

export const Medal = styled.div`
  position: absolute;
  top: -8px;
  left: -8px;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: ${props =>
    props.rank === 1
      ? 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)' // 금메달
      : props.rank === 2
      ? 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)' // 은메달
      : 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'}; // 동메달
  color: #333;
  font-size: 10px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  animation: ${subtlePulse} 2s ease-in-out infinite;

  // 검색 팝업에서 메달 스타일 개선
  ${props =>
    props.rank && props.rank <= 3 && `
      width: 28px;
      height: 28px;
      font-size: 12px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    `}
`;

export const PlayerInfo = styled.div`
  flex: 1;
`;

export const PlayerName = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #333;
`;

export const PlayerPosition = styled.div`
  font-size: 12px;
  color: #888;
`;

export const PlayerStat = styled.div`
  font-weight: 600;
  color: #3182f6;
  font-size: 14px;
  text-align: right;
  width: 70px;
`;

export const SeeMore = styled.div`
  text-align: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-top: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #3182f6;
  font-weight: 500;

  &:hover {
    background-color: #e8ecef;
  }
`;

export const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
  backdrop-filter: blur(2px);
`;

export const PopupContent = styled.div`
  background: white;
  border-radius: 12px;
  padding:skap 20px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  position: relative;
  animation: ${scaleUp} 0.3s ease-out;

  @media (max-width: 480px) {
    padding: 15px;
    max-width: 90%;
  }
`;

export const PopupInner = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const PopupTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #333;
  }
`;

export const StatsContainerInner = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export const StatsColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
`;

export const StatValueWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const StatRank = styled.div`
  font-size: 14px;
  color: #888;
  margin-top: 4px;
`;

export const PopupFooter = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

export const SecondaryButton = styled.button`
  padding: 8px 16px;
  background-color: #f5f5f5;
  color: #3182f6;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e8ecef;
  }
`;

export const TossPopup = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  position: relative;

  @media (max-width: 480px) {
    padding: 15px;
    max-width: 90%;
  }
`;

export const TossHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const TossTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const TossCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #333;
  }
`;

export const TossList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const TossListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  @media (max-width: 480px) {
    padding: 8px 0;
  }
`;

export const TossRankWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 30px;
`;

export const TossRank = styled.span`
  width: 30px;
  font-weight: 600;
  color: #333;
  text-align: center;

  @media (max-width: 480px) {
    width: 25px;
    font-size: 14px;
  }
`;

export const TossPlayerInfo = styled.div`
  flex: 1;
`;

export const TossPlayerName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const TossPlayerPosition = styled.div`
  font-size: 14px;
  color: #888;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const TossPlayerStat = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #3182f6;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const FullRankingSection = styled.div`
  margin-top: 40px;
`;

export const FullRankingTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const FullRankingSearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

export const FullRankingContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  max-width: 100%;
  position: relative;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }
`;

export const FullRankingTable = styled.table`
  width: 100%;
  min-width: 1000px; /* 모든 열을 수용하기 위해 충분히 넓게 설정 */
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-radius: 12px;
  border: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    min-width: 800px; /* 모바일에서 적절한 너비 */
  }
`;

export const TableHeader = styled.th`
  padding: 12px 8px;
  background-color: ${props => (props.active ? '#3182f6' : '#f5f5f5')};
  color: ${props => (props.active ? 'white' : '#333')};
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  white-space: nowrap;

  /* 세로 스크롤 시 헤더 고정 */
  position: sticky;
  top: 0;
  z-index: 10;

  /* 고정 열 (등수, 이름, 포지션) */
  &:nth-child(1) {
    position: sticky;
    left: 0;
    width: 60px;
    background-color: ${props => (props.active ? '#3182f6' : '#f5f5f5')};
    z-index: 15;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* 고정 열과 스크롤 열 구분 */
  }
  &:nth-child(2) {
    position: sticky;
    left: 60px;
    width: 120px;
    background-color: ${props => (props.active ? '#3182f6' : '#f5f5f5')};
    z-index: 15;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }
  &:nth-child(3) {
    position: sticky;
    left: 180px;
    width: 80px;
    background-color: ${props => (props.active ? '#3182f6' : '#f5f5f5')};
    z-index: 15;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }

  &:hover {
    background-color: ${props => (props.active ? '#2a74e0' : '#e8ecef')};
  }

  @media (max-width: 768px) {
    padding: 10px 6px;
    font-size: 12px;

    &:nth-child(1) {
      width: 50px;
    }
    &:nth-child(2) {
      left: 50px;
      width: 100px;
    }
    &:nth-child(3) {
      left: 150px;
      width: 70px;
    }
  }
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background-color: #f9f9f9;
  }
  &:hover {
    background-color: #f1f1f1;
  }
`;

export const FixedTableCell = styled.td`
  padding: 12px 8px;
  text-align: center;
  color: #333;
  font-size: 14px;
  white-space: nowrap;
  background-color: inherit; /* 행의 배경색 상속 */
  position: sticky;
  z-index: 5; /* 스크롤 셀 위, 헤더 아래 */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* 고정 열과 스크롤 열 구분 */

  &:nth-child(1) {
    left: 0;
    width: 60px;
  }
  &:nth-child(2) {
    left: 60px;
    width: 120px;
  }
  &:nth-child(3) {
    left: 180px;
    width: 80px;
  }

  @media (max-width: 768px) {
    padding: 10px 6px;
    font-size: 12px;

    &:nth-child(1) {
      width: 50px;
    }
    &:nth-child(2) {
      left: 50px;
      width: 100px;
    }
    &:nth-child(3) {
      left: 150px;
      width: 70px;
    }
  }
`;

export const TableCellStat = styled.td`
  padding: 12px 8px;
  text-align: center;
  color: #3182f6;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 10px 6px;
    font-size: 12px;
  }
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;