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
  background-color: #ffffff;
  animation: ${fadeIn} 0.5s ease-in;
`;

export const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #f2f4f6;
  border-top: 4px solid #3887ff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const LoadingText = styled.div`
  margin-top: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #333d4b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
`;

export const LoadingPercentage = styled.div`
  margin-top: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #3887ff;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
`;

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  color: #333d4b;
`;

export const Header = styled.header`
  margin-bottom: 32px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #191f28;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
`;

export const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 32px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 18px 48px;
  font-size: 17px;
  border-radius: 14px;
  border: none;
  background-color: #f2f4f6;
  color: #333d4b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  box-sizing: border-box;
  z-index: 1;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3887ff;
    background-color: #ffffff;
  }

  &::placeholder {
    color: #8b95a1;
  }

  @media (max-width: 768px) {
    padding: 10px 50px 10px 44px;
    font-size: 15px;
    margin-right: 10px;
  }
`;

export const SearchIconWrapper = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b95a1;
  z-index: 2;

  @media (max-width: 768px) {
    left: 12px;
  }
`;

export const TabContainer = styled.div`
  margin-bottom: 24px;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eef0f3;
`;

export const Tab = styled.button`
  padding: 12px 16px;
  font-size: 17px;
  font-weight: 500;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  color: ${props => props.active ? '#3887ff' : '#8b95a1'};
  background: ${props => props.active ? '#f2f7ff' : 'transparent'};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.active ? '#3887ff' : '#333d4b'};
    background: ${props => props.active ? '#f2f7ff' : '#f2f4f6'};
  }
`;

export const CategoryContainer = styled.div`
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(33, 37, 41, 0.08);
  overflow: hidden;
  margin-bottom: 24px;
`;

export const CategoryCard = styled.div`
  padding: 22px 24px;
  border-bottom: 1px solid #eef0f3;
  transition: background-color 0.2s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9fafb;
  }

  &:active {
    background-color: #f2f4f6;
  }
`;

export const CategoryTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #191f28;
  margin: 0;
  letter-spacing: -0.5px;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

export const ModalContent = styled.div`
  background: #ffffff;
  padding: 32px 28px;
  border-radius: 24px;
  width: 88%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  animation: ${fadeIn} 0.3s ease-out;
  color: #333d4b;
  font-size: 16px;
  line-height: 1.6;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

  scrollbar-width: thin;
  scrollbar-color: #c9cdd2 #f2f4f6;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f2f4f6;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c9cdd2;
    border-radius: 3px;
    &:hover {
      background: #8b95a1;
    }
  }

  @media (max-width: 768px) {
    padding: 28px 24px;
    width: 96%;
    max-width: 460px;
    border-radius: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 20px;
    width: 85%;
    max-height: 85vh;
    border-radius: 16px;
    font-size: 15px;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f2f4f6;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333d4b;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #eef0f3;
  }

  &:active {
    background: #e7e9ec;
  }

  @media (max-width: 480px) {
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
  }
`;

export const RankingList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const RankingItem = styled.li`
  padding: 16px 0;
  border-bottom: 1px solid #eef0f3;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 480px) {
    padding: 12px 0;
    gap: 8px;
  }
`;

export const RankingPlayer = styled.span`
  font-size: 18px;
  font-weight: 500;
  color: #333d4b;
  max-width: 75%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    font-size: 16px;
    max-width: 70%;
    line-height: 1.3;
  }
`;

export const RankingCount = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #3887ff;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 16px;
    line-height: 1.3;
    flex-shrink: 0;
  }
`;

export const NoResults = styled.div`
  padding: 40px 24px;
  text-align: center;
  color: #8b95a1;
  font-size: 17px;

  @media (max-width: 480px) {
    padding: 32px 16px;
    font-size: 16px;
  }
`;

export const PlayerRecordSection = styled.div`
  margin-bottom: 28px;

  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
`;

export const PlayerRecordTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #191f28;
  margin-bottom: 16px;
  letter-spacing: -0.5px;

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 12px;
  }
`;

export const PlayerRecordItem = styled.div`
  padding: 12px 0;
  font-size: 17px;
  color: #333d4b;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eef0f3;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    padding: 10px 0;
  }
`;