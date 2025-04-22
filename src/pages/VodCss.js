import styled from 'styled-components';

// 메인 컨테이너
export const VodContainer = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  gap: 24px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }

  @media (max-width: 640px) {
    padding: 20px 12px;
    box-sizing: border-box;
  }
`;

// 사이드바 스타일
export const Sidebar = styled.div`
  width: 240px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 100%;
    box-sizing: border-box; /* 패딩을 포함하여 너비 계산 */
    padding: 16px 12px; /* 좌우 패딩을 줄여서 내용이 잘리지 않도록 조정 */
  }
`;

export const SidebarTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 16px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 2px solid #ddd;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  box-sizing: border-box; /* 내부 padding 포함하여 너비 계산 */

 @media (max-width: 640px) {
  font-size: 16px;
  padding: 0 12px 8px; /* 상단과 하단 패딩 유지, 좌우 패딩 12px */
  margin: 0 0 16px 0;  /* 좌우 마진 제거, 하단 마진 16px */
  width: 100%;
  box-sizing: border-box; /* 패딩과 보더를 포함한 너비 계산 */
}
  }
`;

export const DateList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const DateItem = styled.li`
  padding: 12px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.active ? '#3182f6' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#333'};
  
  &:hover {
    background-color: ${props => props.active ? '#3182f6' : '#e0e0e0'};
  }
`;

// 메인 컨텐츠 영역
export const MainContent = styled.div`
  flex: 1;
`;

export const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  font-size: 28px;
  color: #191f28;
  border-bottom: 3px solid #3182f6;
  padding-bottom: 12px;
  display: inline-block;
`;

// 쿼터 영역
export const QuarterSection = styled.div`
  margin-bottom: 32px;
`;

export const QuarterTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 18px;
  padding: 8px 16px;
  background-color: #f0f7ff;
  border-left: 4px solid #3182f6;
  color: #333;
  border-radius: 0 4px 4px 0;
`;

// VOD 목록
export const VodList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const VodItem = styled.li`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const VodTitle = styled.h3`
  margin: 0;
  padding: 16px;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

export const GameTime = styled.span`
  font-size: 13px;
  color: #777;
  font-weight: normal;
`;

export const VideoTypeTag = styled.span`
  background-color: ${props => 
    props.type === 'catch' ? '#f57c00' : 
    props.type === 'shorts' ? '#d32f2f' : '#3182f6'};
  color: white;
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: bold;
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
    
    @media (min-width: 768px) {
      margin: 0 auto;
      width: 85%;
    }
  }
  
  /* 숏츠 비디오 스타일 (세로형) */
  &.shorts-video {
    padding-bottom: 177.78%; /* 9:16 비율 (세로형) */
    
    @media (min-width: 768px) {
      margin: 0 auto;
      width: 50%;
    }
  }
`;

export const VideoControls = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px;
  
  a {
    display: inline-block;
    background-color: #3182f6;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 14px;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #1565c0;
    }
  }
`;

// 필터 및 정렬 영역
export const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const SelectWrapper = styled.div`
  position: relative;
  
  select {
    appearance: none;
    padding: 8px 32px 8px 12px;
    border-radius: 6px;
    border: 1px solid #ddd;
    background-color: #fff;
    font-size: 14px;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #3182f6;
    }
  }
  
  &::after {
    content: '▼';
    font-size: 12px;
    color: #777;
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
`;

// 로딩 상태 표시
export const LoadingIndicator = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #777;
`;

// 비어있는 상태 메시지
export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #777;
  font-size: 16px;
`;