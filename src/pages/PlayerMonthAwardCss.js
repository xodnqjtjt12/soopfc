import styled, { keyframes } from 'styled-components';

// 애니메이션 키프레임
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

// 메인 컨테이너
export const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  color: #1d1d1f;
`;

export const Header = styled.div`
  max-width: 800px;
  margin: 0 auto 3rem;
  text-align: center;
`;

export const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1.25rem;
  font-weight: 400;
  color: #86868b;
  margin: 0;
`;

// 날짜 네비게이션
export const DateNavigation = styled.div`
  max-width: 400px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
`;

export const NavButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: ${props => props.disabled ? '#f2f2f7' : 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)'};
  color: ${props => props.disabled ? '#86868b' : '#ffffff'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  font-size: 1.2rem;
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

export const DateDisplay = styled.button`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d1d1f;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  min-width: 140px;
  
  &:hover {
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
  }
`;

export const DatePicker = styled.div`
  position: absolute;
  top: 27%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 200px;
  max-height: 200px;
  overflow-y: auto;
  animation: ${fadeInUp} 0.3s ease-out;
`;

export const DateOption = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: none;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  color: #1d1d1f;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
  }
  
  &.selected {
    background: #007aff;
    color: white;
  }
  
  &:disabled {
    color: #86868b;
    cursor: not-allowed;
  }
`;

// 카드 스타일
export const AwardCard = styled.div`
  max-width: 800px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
`;

export const AwardHeader = styled.div`
  padding: 2rem 2rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.05) 10px,
      rgba(255, 255, 255, 0.05) 20px
    );
    animation: ${shimmer} 3s linear infinite;
  }
`;

export const Trophy = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
`;

export const AwardYearMonth = styled.div`
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const AwardPlayerName = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const AwardDescription = styled.div`
  padding: 2rem;
  font-size: 1.2rem;
  line-height: 1.6;
  color: #515154;
  text-align: center;
  font-style: italic;
  position: relative;
  
  &::before,
  &::after {
    content: '"';
    font-size: 2rem;
    color: #007aff;
    font-weight: 600;
    opacity: 0.6;
  }
`;

export const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const StatsBox = styled.div`
  padding: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  
  &:not(:last-child) {
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    
    @media (max-width: 768px) {
      border-right: none;
    }
  }
`;

export const StatsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #007aff;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
`;

export const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  animation: ${slideIn} 0.6s ease-out;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const StatLabel = styled.span`
  font-weight: 500;
  color: #515154;
`;

export const StatValue = styled.span`
  font-weight: 600;
  color: #1d1d1f;
  font-size: 1.1rem;
`;

// 선수 기록 더보기 버튼
export const GradeButton = styled.button`
  display: block;
  margin: 1.5rem auto;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// 로딩 및 에러 상태
export const Loading = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  max-width: 800px;
  margin: 0 auto;
  
  .spinner {
    width: 60px;
    height: 60px;
    border: 3px solid rgba(0, 122, 255, 0.1);
    border-top: 3px solid #007aff;
    border-radius: 50%;
    margin: 0 auto 1rem;
    animation: spin 1s linear infinite;
  }
  
  .text {
    font-size: 1.2rem;
    color: #86868b;
    font-weight: 500;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const ErrorMessage = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: 16px;
  text-align: center;
  color: #d70015;
  font-weight: 500;
`;

export const NoAwards = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .text {
    font-size: 1.2rem;
    color: #86868b;
    font-weight: 500;
  }
`;

// 백그라운드 패턴 제거 (애플 스타일에 맞지 않음)
export const BackgroundPattern = styled.div`
  display: none;
`;

// 폭죽 효과 제거 (애플 스타일에 맞지 않음)
export const FireworksContainer = styled.div`
  display: none;
`;

export const Firework = styled.div`
  display: none;
`;