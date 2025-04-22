import styled from 'styled-components';

// 색상 테마 정의 (토스 스타일)
const colors = {
  primary: '#3182F6',
  primaryDark: '#1B64DA',
  primaryLight: '#E7F0FF',
  gray50: '#F9FAFB',
  gray100: '#F2F4F6',
  gray200: '#E5E8EB',
  gray300: '#D1D6DB',
  gray400: '#B0B8C1',
  gray500: '#8B95A1',
  gray600: '#6B7684',
  gray700: '#4E5968',
  gray800: '#333D4B',
  gray900: '#191F28',
  white: '#FFFFFF',
  black: '#000000',
  red: '#F03D3E',
  blue: '#3182F6',
  green: '#08BF73',
  orange: '#FF8E00',
};

// 그림자 스타일 정의
const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
};

// 반응형 브레이크포인트
const breakpoints = {
  mobile: '640px',
  tablet: '1024px',
};

// 메인 컨테이너
export const VodContainer = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  gap: 32px;

  @media (max-width: ${breakpoints.tablet}) {
    flex-direction: column;
    gap: 24px;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 16px 12px;
    gap: 20px;
  }
`;

// 사이드바 스타일
export const Sidebar = styled.div`
  width: 260px;
  background-color: ${colors.white};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${shadows.md};
  flex-shrink: 0;
  border: 1px solid ${colors.gray200};

  @media (max-width: ${breakpoints.tablet}) {
    width: 100%;
    box-sizing: border-box;
    padding: 20px;
  }
`;

export const SidebarTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: ${colors.gray900};
  padding-bottom: 12px;
  border-bottom: 1px solid ${colors.gray200};
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: ${breakpoints.mobile}) {
    font-size: 16px;
    padding-bottom: 10px;
    margin-bottom: 16px;
  }
`;

export const DateList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const DateItem = styled.li`
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.active ? colors.primaryLight : colors.white};
  color: ${props => props.active ? colors.primary : colors.gray800};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 15px;
  
  &:hover {
    background-color: ${props => props.active ? colors.primaryLight : colors.gray50};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

// 메인 컨텐츠 영역
export const MainContent = styled.div`
  flex: 1;
`;

export const PageTitle = styled.h1`
  margin: 0 0 32px 0;
  font-size: 28px;
  font-weight: 700;
  color: ${colors.gray900};
  border: none;
  padding-bottom: 0;
  display: block;

  @media (max-width: ${breakpoints.mobile}) {
    font-size: 24px;
    margin-bottom: 24px;
  }
`;

// 필터 및 정렬 영역
export const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${colors.gray200};
  
  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

export const SelectWrapper = styled.div`
  position: relative;
  
  select {
    appearance: none;
    padding: 12px 40px 12px 16px;
    border-radius: 12px;
    border: 1px solid ${colors.gray300};
    background-color: ${colors.white};
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    color: ${colors.gray800};
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 2px ${colors.primaryLight};
    }

    &:hover {
      border-color: ${colors.gray400};
    }
  }
  
  &::after {
    content: '▼';
    font-size: 10px;
    color: ${colors.gray600};
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
`;

// 쿼터 영역
export const QuarterSection = styled.div`
  margin-bottom: 40px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const QuarterTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
  padding: 0;
  color: ${colors.gray900};
  background: none;
  border: none;
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${colors.primary};
    border-radius: 1px;
  }

  @media (max-width: ${breakpoints.mobile}) {
    font-size: 18px;
    margin-bottom: 20px;
  }
`;

// VOD 목록
export const VodList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
  
  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

export const VodItem = styled.li`
  border: 1px solid ${colors.gray200};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${shadows.sm};
  background-color: ${colors.white};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${shadows.lg};
  }
`;

export const VodTitle = styled.h3`
  margin: 0;
  padding: 20px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  border-bottom: 1px solid ${colors.gray100};
  color: ${colors.gray900};
`;

export const GameTime = styled.span`
  font-size: 14px;
  color: ${colors.gray600};
  font-weight: 500;
  margin-left: 8px;
`;

export const VideoTypeTag = styled.span`
  background-color: ${props => 
    props.type === 'catch' ? colors.orange : 
    props.type === 'shorts' ? colors.red : colors.blue};
  color: ${colors.white};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  margin-left: 8px;
`;

export const VideoWrapper = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 기본 16:9 비율 */
  height: 0;
  overflow: hidden;
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
  
  /* 캐치 비디오 스타일 (더 정사각형에 가까운 형식) */
  &.catch-video {
    padding-bottom: 75%; /* 4:3 비율 */
    
    @media (min-width: ${breakpoints.mobile}) {
      margin: 0 auto;
      width: 85%;
    }
  }
  
  /* 숏츠 비디오 스타일 (세로형) */
  &.shorts-video {
    padding-bottom: 177.78%; /* 9:16 비율 (세로형) */
    
    @media (min-width: ${breakpoints.mobile}) {
      margin: 0 auto;
      width: 50%;
    }
  }
`;

export const VideoControls = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px 20px 20px;
  
  a {
    display: inline-block;
    background-color: ${colors.primary};
    color: ${colors.white};
    padding: 12px 20px;
    border-radius: 12px;
    text-decoration: none;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: ${colors.primaryDark};
    }
  }
`;

// 로딩 상태 표시
export const LoadingIndicator = styled.div`
  text-align: center;
  padding: 60px 0;
  color: ${colors.gray600};
  font-size: 16px;
  font-weight: 500;
`;

// 비어있는 상태 메시지
export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 0;
  color: ${colors.gray600};
  font-size: 16px;
  font-weight: 500;
  background-color: ${colors.gray50};
  border-radius: 16px;
  margin: 20px 0;
`;