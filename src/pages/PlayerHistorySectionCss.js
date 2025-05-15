import styled, { keyframes } from 'styled-components';
import { Trophy } from 'react-feather'; // 트로피 아이콘 사용 (react-feather 패키지 필요)

// 애니메이션 키프레임 정의
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

export const expand = keyframes`
  from { max-height: 0; opacity: 0; }
  to { max-height: 1000px; opacity: 1; }
`;

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
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;

  @media (max-width: 640px) {
    padding: 15px;
    margin: -70px 16px 0 16px;
  }
`;

export const Button = styled.button`
  background-color: #ffffff; /* 배경색을 흰색으로 설정 */
  border: 1px solid #e0e0e0; /* 테두리 추가로 버튼 경계 명확히 */
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5; /* 호버 시 약간 회색빛 배경 */
    transform: translateY(-1px);
  }

  &:active {
    background-color: #e0e0e0;
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 100, 255, 0.3);
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
  }
`;

export const Header = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1a1a1a;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

// 수상 기록 섹션 컨테이너
export const AwardsContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

// 연도별 수상 기록 카드
export const YearlyAwardCard = styled.div`
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 12px;
  width: 200px;
  flex-shrink: 0;
  backdrop-filter: blur(5px);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
`;

// 수상 기록 제목 컴포넌트
export const AwardSectionTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 4px;
  
  .trophy-icon {
    margin-right: 6px;
    color: #ffc107; /* 트로피는 금색으로 */
    filter: drop-shadow(0 0 3px rgba(255, 193, 7, 0.3));
  }
  
  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
`;

// 수상 기록 아이템 컴포넌트
export const AwardItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  
  .award-icon {
    margin-right: 6px;
    display: flex;
    align-items: center;
  }
  
  .award-text {
    font-size: 14px;
  }
`;

// 로딩 메시지 스타일
export const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #ffffff;
  font-style: italic;
  
  &::before {
    content: "🏆";
    margin-right: 8px;
    animation: bounce 1s infinite alternate;
  }
  
  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-5px); }
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  background-color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #0182ff;
    box-shadow: 0 0 0 3px rgba(1, 130, 255, 0.2);
  }

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px;
  }
`;

export const SmallInput = styled(Input)`
  width: 80px;
  padding: 8px;
  margin: 0;
  font-size: 14px;

  @media (max-width: 640px) {
    width: 60px;
    font-size: 12px;
    padding: 6px;
  }
`;

export const Select = styled.select`
  padding: 12px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #0182ff;
    box-shadow: 0 0 0 3px rgba(1, 130, 255, 0.2);
  }

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px;
  }
`;

export const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    padding: 15px;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;
`;

export const Th = styled.th`
  padding: 15px;
  background-color: #1a1a1a;
  color: #f8f8f8;
  font-size: 16px;
  font-weight: 600;
  text-align: left;

  border-bottom: 1px solid #3a3a3a;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px;
  }
`;

export const Td = styled.td`
  padding: 15px;
  color: #1a1a1a;
  font-size: 16px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px;
  }
`;

export const HistoryTable = styled.table`
  width: 100%;
  min-width: 360px;
  max-width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #1a1a1a;
  border-radius: 10px;
  overflow-x: auto;
  display: block;
  animation: ${fadeIn} 0.5s ease-out;

  @media (min-width: 641px) {
    min-width: 840px;
  }
`;

export const HistoryTableHeader = styled.th`
  padding: 15px;
  background-color: #303030;
  color: #f8f8f8;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid #3a3a3a;
  white-space: nowrap;
  width: ${props => {
    if (['승률', '개인승점', 'MOM점수'].includes(props.children)) return '100px';
    return '90px';
  }};

  @media (max-width: 640px) {
    font-size: 11px;
    padding: 6px;
    width: ${props => {
      if (['승률', '개인승점', 'MOM점수'].includes(props.children)) return '70px';
      return '60px';
    }};
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
  white-space: nowrap;
  width: ${props => {
    if (['승률', '개인승점', 'MOM점수'].includes(props.children?.toString().split('%')[0])) return '100px';
    return '90px';
  }};

  @media (max-width: 640px) {
    font-size: 11px;
    padding: 6px;
    width: ${props => {
      if (['승률', '개인승점', 'MOM점수'].includes(props.children?.toString().split('%')[0])) return '70px';
      return '60px';
    }};
  }
`;
// 토스 스타일 변수
const colors = {
  background: '#F9FAFC',
  cardBackground: '#FFFFFF',
  primary: '#3182F6',
  border: '#F2F4F6',
  text: '#191F28',
  subText: '#8B95A1',
  axis: '#DFE2E6'
};

// 그래프 섹션 컴포넌트 - 페이지 내 영역 설정
export const GraphSection = styled.div`
  margin: 40px 0;
  padding: 0;
  background-color: ${colors.background};
  
  @media (max-width: 640px) {
    margin: 24px 0;
  }
`;

// 그래프 컨테이너 - 카드 형태 디자인
export const GraphContainer = styled.div`
  margin: 24px 0;
  background-color: ${colors.cardBackground};
  border-radius: 18px;
  padding: 24px 20px;
  box-shadow: 0 1px 12px rgba(10, 30, 66, 0.08);
  transition: all 0.2s ease;
  
  @media (max-width: 640px) {
    margin: 16px 0;
    padding: 20px 16px;
    border-radius: 14px;
  }
`;

export const GraphToggleButton = styled(Button)`
  margin-top: 20px;
  background-color: #2a2a2a;
  color: #f8f9fa;
  width: 100%;
  justify-content: center;
  padding: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background-color: #383838;
    border-color: #4d4d4d;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    background-color: #222222;
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 640px) {
    margin-top: 15px;
    padding: 10px;
    font-size: 0.9rem;
  }
`;
export const StatSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;

  @media (max-width: 640px) {
    gap: 8px;
    margin-bottom: 15px;
  }
`;

export const StatButton = styled.button`
  background-color: ${props => props.active ? props.color || '#007bff' : '#f8f9fa'};
  color: ${props => props.active ? '#fff' : '#495057'};
  border: 1px solid ${props => props.active ? props.color || '#007bff' : '#ced4da'};
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? props.color || '#0056b3' : '#e9ecef'};
    color: ${props => props.active ? '#fff' : '#212529'};
  }

  @media (max-width: 640px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

export const AdminContent = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

export const MainArea = styled.div`
  flex: 3;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

export const LogsContainer = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-height: 600px;
  overflow-y: auto;

  @media (max-width: 640px) {
    max-height: 300px;
    padding: 15px;
  }
`;

export const LogItem = styled.div`
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 8px;
  word-break: break-all;

  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

export const UploadMessage = styled.p`
  color: ${(props) => (props.success ? '#10b981' : '#ef4444')};
  font-size: 16px;
  margin: 10px 0;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const PreviewContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  animation: ${expand} 0.5s ease-out;

  @media (max-width: 640px) {
    padding: 15px;
  }
`;

export const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 14px;
  margin: 5px 0;

  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

export const TogglePasswordVisibility = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-left: 10px;

  @media (max-width: 640px) {
    width: 20px;
    height: 20px;
  }
`;

export const RankingSummary = styled.div`
  margin-top: 20px;
  padding: 8px;
  background-color: #fff;
  border-radius: 8px;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  animation: ${fadeIn} 0.5s ease-out;
  text-align: center;

  & > div {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 10px;
    justify-content: flex-start;
    justify-content: center;
  }

  .loading {
    color: #666;
    font-size: 16px;
    text-align: center;
    padding: 20px;
    animation: ${fadeIn} 0.5s ease-out;
  }

  @media (max-width: 640px) {
    padding: 12px;
    & > div {
    //   flex-direction: column;
      overflow-x: hidden;
      gap: 8px;
      justify-content: center;  /* 모바일에서도 가운데 정렬 */
    }
    .loading {
      font-size: 14px;
      padding: 15px;
    }
  }
`;

export const SectionTitle = styled.h3`
//   text-align: left;
  margin-left: 10px;
  font-size: 20px;
  color: #1a1a1a;
  margin-bottom: 12px;

 @media (max-width: 640px) {
    font-size: 18px;
    margin-left: 8px;
    margin-bottom: 10px;
    text-align: center;   /* 모바일에서 제목 중앙 정렬 */
    margin-left: 0;       /* 모바일에서 왼쪽 여백 제거 */
  }
`;

export const SummaryCardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 12px;
  }
`;

export const SummaryCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px;
  width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    width: 140px;
    padding: 10px;
  }
`;

export const PartnerContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 12px;
  }
`;

export const PartnerCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    padding: 10px;
  }
    
`;

