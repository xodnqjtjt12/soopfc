import styled, { keyframes } from 'styled-components';

// 애니메이션 정의
export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
`;

export const ballSpin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8fafc;
  animation: ${fadeIn} 0.5s ease-in;
`;

export const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3182ce;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const LoadingText = styled.div`
  margin-top: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #4a5568;
`;

export const LoadingPercentage = styled.div`
  margin-top: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #3182ce;
`;

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
`;

export const Header = styled.header`
  margin-bottom: 32px;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

export const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 32px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 16px 48px;
  font-size: 16px;
  border-radius: 12px;
  border: none;
  background-color: #f2f4f6;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3182ce;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

export const SearchIconWrapper = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
`;

export const TabContainer = styled.div`
//   display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #edf2f7;
`;

export const Tab = styled.button`
  padding: 12px 16px;
  font-size: 16px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#3182ce' : '#718096'};
  background: none;
  border: none;
  border-bottom: ${props => props.active ? '2px solid #3182ce' : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.active ? 1 : 0.7};

  &:hover {
    color: ${props => props.active ? '#3182ce' : '#4a5568'};
    opacity: 1;
  }
`;

export const CategoryContainer = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
`;

export const CategoryCard = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #edf2f7;
  transition: background-color 0.2s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8fafc;
  }

  &:hover::before {
    content: '⚽';
    position: absolute;
    left: 8px;
    font-size: 20px;
    animation: ${ballSpin} 1s linear infinite;
  }
`;

export const CategoryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 48, 73, 0.7), rgba(0, 128, 128, 0.5)); /* 그라데이션 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.4s ease-out;
  backdrop-filter: blur(4px); /* 배경 블러 효과 */
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2); /* 내부 그림자 */
`;

export const ModalContent = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  background: linear-gradient(0deg, #e6f4ea 0%, #ffffff 10%);
  animation: ${fadeIn} 0.5s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.2); /* 미묘한 테두리 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15); /* 부드러운 그림자 */
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #4a5568;
  transition: color 0.2s ease;

  &:hover {
    color: #3182ce;
  }
`;

export const RankingList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const RankingItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

export const RankingPlayer = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #4a5568;
`;

export const RankingCount = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #3182ce;
`;

export const NoResults = styled.div`
  padding: 40px 24px;
  text-align: center;
  color: #718096;
  font-size: 16px;
`;

export const PlayerRecordSection = styled.div`
  margin-bottom: 24px;
`;

export const PlayerRecordTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
`;

export const PlayerRecordItem = styled.div`
  padding: 8px 0;
  font-size: 16px;
  color: #4a5568;
`;