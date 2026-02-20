import styled, { keyframes } from 'styled-components';
import { Trophy } from 'lucide-react';

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
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 0;
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px 80px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333d4b;
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: 768px) {
    padding: 20px 16px 60px;
    gap: 24px;
  }
`;

export const HeaderSection = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const BackButton = styled.button`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4e5968;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);

  &:hover {
    background-color: #f1f3f5;
    transform: translateX(-2px);
  }
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #191f28;
  margin: 0;
  letter-spacing: -0.5px;
`;

export const Subtitle = styled.p`
  font-size: 16px;
  color: #8b95a1;
  margin: 0;
  font-weight: 500;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeIn} 0.6s ease-out;
`;

export const SectionTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #333d4b;
    margin: 0;
  }

  svg {
    color: #3182f6;
  }
`;

export const AwardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const AwardCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid #f2f4f6;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

export const AwardYearHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #f2f4f6;

  span {
    font-size: 17px;
    font-weight: 700;
    color: #191f28;
  }
`;

export const AwardBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background-color: ${props => props.bgColor || '#f8f9fa'};
  border-radius: 12px;
  
  .icon-box {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .text-stack {
    display: flex;
    flex-direction: column;
    
    .label {
      font-size: 12px;
      color: #8b95a1;
      font-weight: 500;
    }
    
    .value {
      font-size: 14px;
      font-weight: 700;
      color: #333d4b;
    }
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

export const TableCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid #f2f4f6;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 16px;
    margin: 0 -4px;
  }
`;

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

export const ModernTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

export const ModernTh = styled.th`
  padding: 16px 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #8b95a1;
  border-bottom: 1px solid #f2f4f6;
  background-color: #fcfdfe;
  white-space: nowrap;

  &:first-child { text-align: left; padding-left: 20px; }
  &:last-child { padding-right: 20px; }
`;

export const ModernTd = styled.td`
  padding: 20px 12px;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: #333d4b;
  border-bottom: 1px solid #f2f4f6;
  white-space: nowrap;

  &:first-child { 
    text-align: left; 
    padding-left: 20px;
    font-weight: 700;
    color: #191f28;
  }
  &:last-child { padding-right: 20px; }

  &.highlight-year {
    color: #3182f6;
  }

  &.win { color: #3182f6; font-weight: 600; }
  &.draw { color: #adb5bd; }
  &.lose { color: #f04452; font-weight: 600; }
`;
// 토스 스타일 변수
const colors = {
  // background: '#F9FAFC',
  cardBackground: '#FFFFFF',
  primary: '#3182F6',
  border: '#F2F4F6',
  text: '#191F28',
  subText: '#8B95A1',
  axis: '#DFE2E6'
};

export const ChartCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid #f2f4f6;
  display: flex;
  flex-direction: column;
  gap: 24px;

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #191f28;
    margin: 0;
  }

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

export const GraphToggleButton = styled.button`
  background-color: white;
  color: #4e5968;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  
  &:hover {
    background-color: #f8f9fa;
    transform: translateY(-2px);
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
      padding-left: 16px;
    }
    .loading {
      font-size: 14px;
      padding: 15px;
    }
  }
`;

export const SectionTitle = styled.h3`
  /* 기본 스타일 */
  font-size: 20px;
  color: #1a1a1a;
  margin-bottom: 12px;

  /* 너비를 제한하고 자동 가로 마진으로 중앙 정렬 */
  max-width: 600px;
  margin: 0 auto 12px;

  /* 살짝 왼쪽으로 이동: translateX(-5px) */
  transform: translateX(-5px);

  @media (max-width: 640px) {
    font-size: 18px;
    margin: 0 auto 10px;
    /* 모바일에서도 같은 왼쪽 shift */
    transform: translateX(-5px);
    text-align: center; /* 텍스트 자체는 중앙 정렬 */
  }
`;

export const SummaryCardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

// 선수 통계 카드
export const SummaryCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #f2f4f6;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s ease;

  .label {
    font-size: 13px;
    font-weight: 500;
    color: #8b95a1;
  }

  .value {
    font-size: 18px;
    font-weight: 700;
    color: #191f28;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 480px) {
    padding: 14px 16px;

    .label {
      font-size: 12px;
    }

    .value {
      font-size: 16px;
    }
  }
`;

export const PartnerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`;

export const PartnerCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  border: 1px solid #f2f4f6;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #f8f9fa;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid #f2f4f6;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .label {
      font-size: 13px;
      color: #8b95a1;
      font-weight: 500;
    }
    
    .name {
      font-size: 16px;
      font-weight: 700;
      color: #191f28;
    }
    
    .count {
      font-size: 13px;
      color: #3182f6;
      font-weight: 600;
    }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 24px;
  color: #4e5968;
  font-weight: 500;

  .spinner-logo {
    width: 120px;
    height: 120px;
    animation: ${keyframes`
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    `} 2s linear infinite;
  }

  .progress-bar {
    width: 240px;
    height: 6px;
    background-color: #f2f4f6;
    border-radius: 3px;
    overflow: hidden;

    .fill {
      height: 100%;
      background-color: #3182f6;
      transition: width 0.1s linear;
    }
  }
`;

// Admin compatibility exports
export const Header = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #191f28;
  margin: 24px 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f2f4f6;
`;

export const Button = styled.button`
  background-color: #3182f6;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1b64da;
  }

  &:disabled {
    background-color: #e9ecef;
    cursor: default;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

export const Th = styled.th`
  background-color: #f8f9fa;
  color: #4e5968;
  font-weight: 600;
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f2f4f6;
  font-size: 14px;
`;

export const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f2f4f6;
  color: #333d4b;
  font-size: 14px;
`;

