import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  color: #333;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 15px;
    margin: 0 10px;
  }
`;

export const MatchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #00295f;
  color: white;
  padding: 15px 0;
  position: relative;
  border-radius: 8px;
`;

export const MatchVS = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 20px 0;
  border-bottom: 1px solid #e5e5e5;
  border-radius: 8px;

  @media (max-width: 768px) {
    padding: 15px 0;
  }
`;

export const TeamContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    max-width: 100%;
    gap: 10px;
  }
`;

export const TeamInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

export const TeamName = styled.h3`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

export const TeamStats = styled.div`
  font-size: 14px;
  color: #666;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const VSIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 30px;

  @media (max-width: 768px) {
    margin: 0 15px;
  }
`;

export const VSText = styled.span`
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
  color: #888;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const MatchDate = styled.div`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 5px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const Section = styled.div`
  background-color: white;
  margin: 15px 0;
  border-top: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
  border-radius: 8px;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  padding: 12px 15px;
  border-bottom: 1px solid #e5e5e5;
  background-color: #f5f5f5;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 12px;
  }
`;

export const LineupContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const TeamLineup = styled.div`
  flex: 1;
  padding: 15px;
  border-right: ${props => props.hasBorder ? '1px solid #e5e5e5' : 'none'};

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: ${props => props.hasBorder ? '1px solid #e5e5e5' : 'none'};
    padding: 12px;
  }
`;

export const TeamLineupHeader = styled.div`
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e5e5e5;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const PlayerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const PlayerItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 6px 0;
  }
`;

export const PlayerName = styled.span`
  font-weight: ${props => props.isCaptain ? 'bold' : 'normal'};
  
  &::after {
    content: '${props => props.isCaptain ? ' (주장)' : ''}';
    color: #3b82f6;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const PlayerPosition = styled.span`
  color: #888;
  font-size: 13px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const StatsSection = styled.div`
  padding: 15px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 8px 0;
    justify-content: space-around;
  }
`;

export const StatLabel = styled.span`
  flex: 1;
  text-align: center;
  font-weight: bold;
  color: #333;

  @media (max-width: 768px) {
    font-size: 14px;
    flex: 0.4;
  }
`;

export const TeamStatValue = styled.span`
  flex: 1;
  text-align: center;
  font-weight: ${props => props.isTeamA ? 'bold' : 'normal'};
  color: ${props => props.isTeamA ? props.color || '#333' : '#666'};
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
    flex: 0.3;
  }
`;

export const PreviousMatchesTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  padding: 12px 15px;
  border-bottom: 1px solid #e5e5e5;
  background-color: #f5f5f5;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 12px;
  }
`;

export const MatchList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const MatchItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

export const MatchTeams = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
`;

export const MatchTeam = styled.span`
  font-weight: ${props => props.isWinner ? 'bold' : 'normal'};

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const MatchScore = styled.div`
  margin: 0 15px;
  font-weight: bold;

  @media (max-width: 768px) {
    margin: 5px 0;
    font-size: 14px;
    text-align: left;
  }
`;

export const MatchInfo = styled.div`
  font-size: 13px;
  color: #888;
  text-align: right;
  width: 120px;

  @media (max-width: 768px) {
    width: 100%;
    text-align: left;
    font-size: 12px;
  }
`;

export const MatchDateInfo = styled.div`
  font-size: 12px;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

export const ErrorMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #e53e3e;
`;

export const ChartContainer = styled.div`
  height: 300px;
  padding: 20px;

  @media (max-width: 768px) {
    height: 250px;
    padding: 15px;
  }
`;

export const TeamsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const TeamCard = styled.div`
  background: #f9fafb;
  border: 2px solid ${props => props.color || '#e5e7eb'};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

export const TeamHeader = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  background: ${props => props.color || '#e5e7eb'};
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

export const CaptainInfo = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const StatsContainer = styled.div`
  margin-top: 40px;

  @media (max-width: 768px) {
    margin-top: 30px;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 20px;
`;

export const StatValue = styled.span`
  font-size: 16px;
  color: #4b5563;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const GraphContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

export const GraphWrapper = styled.div`
  height: 400px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

export const CheerSection = styled.div`
  margin: 20px 0;
  text-align: center;
`;

export const CheerButton = styled.button`
  background-color: ${props => props.color || '#3182f6'};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  margin: 0 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;

  &:hover {
    background-color: ${props => props.color ? `${props.color}cc` : '#2563eb'};
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

export const CheerGauge = styled.div`
  display: flex;
  height: 20px;
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  border-radius: 10px;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    max-width: 90%;
    height: 18px;
  }
`;

export const GaugeBar = styled.div`
  background-color: ${props => props.color || '#3182f6'};
  width: ${props => props.width || '50%'};
  transition: width 0.3s ease;
`;

export const GaugeText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
//   background-color: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 4px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const ChatSection = styled.div`
  position: fixed;
  right: 20px;
  top: 20px;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 15px;
  max-height: 80vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 90%;
    right: 5%;
    top: 10px;
  }
`;

export const ChatTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const ChatMessages = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
  max-height: 60vh;
  overflow-y: auto;
`;

export const ChatMessage = styled.li`
  padding: 8px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
  color: #333;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

export const ChatInputContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const ChatInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

export const ChatButton = styled.button`
  background-color: #3182f6;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #2563eb;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
  }
`;

// 상대 전적 스타일 컴포넌트
export const HeadToHead = styled.div`
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 768px) {
    display: none; /* 모바일에서 전적 숨김 */
  }
`;

export const HeadToHeadTitle = styled.h4`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;

export const HeadToHeadStats = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 16px;
`;

export const HeadToHeadTeam = styled.span`
  font-weight: bold;
`;

export const HeadToHeadVS = styled.span`
  color: #666;
`;

// 라인업 공개 메시지 스타일
export const LineupMessage = styled.div`
  padding: 15px;
  text-align: center;
  font-size: 16px;
  color: #666;
  background-color: #f9fafb;
  border-radius: 8px;
  margin: 10px;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px;
    margin: 8px;
  }
`;