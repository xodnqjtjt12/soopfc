import styled, { keyframes } from 'styled-components';

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

export const GraphSection = styled.div`
  margin-top: 30px;
  border-top: 1px solid #dee2e6;
  padding-top: 20px;

  @media (max-width: 640px) {
    margin-top: 20px;
    padding-top: 15px;
  }
`;

export const GraphContainer = styled.div`
  margin-top: 30px;
  margin-bottom: 40px;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    margin-top: 20px;
    margin-bottom: 30px;
    padding: 12px;
  }
`;

export const GraphToggleButton = styled(Button)`
  margin-top: 20px;
  background-color: #6c757d;
  width: 100%;
  justify-content: center;
  padding: 12px;
  
  &:hover {
    background-color: #5a6268;
  }

  @media (max-width: 640px) {
    margin-top: 15px;
    padding: 10px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  animation: ${fadeIn} 0.5s ease-out;

  & > div {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 10px;
    justify-content: flex-start;
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
      flex-direction: column;
      overflow-x: hidden;
      gap: 8px;
    }
    .loading {
      font-size: 14px;
      padding: 15px;
    }
  }
`;

export const SectionTitle = styled.h3`
  text-align: left;
  margin-left: 10px;
  font-size: 20px;
  color: #1a1a1a;
  margin-bottom: 12px;

  @media (max-width: 640px) {
    font-size: 18px;
    margin-left: 8px;
    margin-bottom: 10px;
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