import styled, { keyframes, createGlobalStyle } from 'styled-components';

export const GlobalFontStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  * {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

/* --- Header Section --- */
export const MatchHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.6s ease-out;

  h2 {
    font-size: 32px;
    font-weight: 800;
    color: #191f28;
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    color: #4e5968;
  }
`;

export const MatchVS = styled.div`
  background: white;
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 32px;
  animation: ${slideUp} 0.7s ease-out;

  @media (max-width: 768px) {
    padding: 24px 16px;
    gap: 12px;
  }
`;

export const TeamContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  items-align: center;
  text-align: center;
`;

export const TeamInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TeamName = styled.h3`
  font-size: 24px;
  font-weight: 800;
  color: #191f28;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

export const TeamStats = styled.div`
  font-size: 14px;
  color: #8b95a1;
  font-weight: 500;
`;

export const VSIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const VSText = styled.span`
  font-size: 28px;
  font-weight: 900;
  color: #e5e8eb;
  font-style: italic;
`;

export const MatchDate = styled.div`
  font-size: 13px;
  color: #8b95a1;
  font-weight: 600;
`;

export const MatchDateBelow = styled.div`
  text-align: center;
  margin-top: -20px;
  margin-bottom: 40px;
  font-size: 14px;
  color: #8b95a1;
  font-weight: 500;
`;

/* --- Cheer Section --- */
export const CheerSection = styled.div`
  background: white;
  padding: 40px 32px;
  border-radius: 24px;
  margin-bottom: 40px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);

  h3 {
    font-size: 20px;
    font-weight: 800;
    color: #191f28;
    margin-bottom: 32px;
  }
`;

export const CheerConfrontation = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  min-height: 200px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

export const SpeechBubble = styled.div`
  position: absolute;
  top: -60px;
  background: white;
  padding: 10px 18px;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  font-size: 14px;
  font-weight: 900;
  color: #f04452;
  white-space: nowrap;
  animation: ${float} 2s ease-in-out infinite;
  z-index: 10;
  border: 2px solid #f2f4f6;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 10px 8px 0;
    border-style: solid;
    border-color: white transparent transparent;
  }

  span {
    color: #191f28;
    margin-right: 4px;
  }
`;

export const CaptainCheerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative; /* Added for speech bubble positioning */
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

export const CaptainAvatar = styled.div`
  width: ${props => 80 + (props.scale * 100)}px;
  height: ${props => 80 + (props.scale * 100)}px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid ${props => props.color || '#3182f6'};
  box-shadow: 0 8px 32px ${props => props.color}33;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: #f2f4f6;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: ${props => 60 + (props.scale * 60)}px;
    height: ${props => 60 + (props.scale * 60)}px;
  }
`;

export const CaptainCheerName = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #191f28;
`;

export const CheerButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.color || '#3182f6'};
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.96);
  }
`;

export const CheerGauge = styled.div`
  margin-top: 32px;
  height: 50px;
  background: #f2f4f6;
  border-radius: 99px;
  overflow: hidden;
  display: flex;
  position: relative;
`;

export const GaugeBar = styled.div`
  height: 100%;
  width: ${props => props.width || '50%'};
  background: ${props => props.color};
  transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const GaugeText = styled.div`
  color: white;
  font-weight: 800;
  font-size: 15px;
  opacity: ${props => props.percentage > 15 ? 1 : 0};
  transition: opacity 0.3s;
`;

/* --- Section Layout --- */
export const Section = styled.div`
  margin-bottom: 48px;
  animation: ${fadeIn} 0.8s ease-out;
`;

export const SectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 800;
  color: #191f28;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 4px;
    height: 18px;
    background: #3182f6;
    border-radius: 2px;
  }
`;

/* --- Lineup Cards --- */
export const LineupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const TeamLineup = styled.div`
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
`;

export const TeamLineupHeader = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #191f28;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f4f6;
`;

export const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

export const PlayerCard = styled.div`
  background: #f9fafb;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  transition: all 0.2s;
  border: 1px solid transparent;
  position: relative;

  &:hover {
    background: white;
    border-color: #e9ecef;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  }
`;

export const PlayerImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 12px;
  background: #e5e8eb;
`;

export const PlayerName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
  margin-bottom: 4px;

  .debut {
    display: block;
    font-size: 11px;
    color: #f04452;
    margin-top: 2px;
  }
`;

export const PlayerPosition = styled.div`
  font-size: 12px;
  color: #8b95a1;
  font-weight: 500;
`;

export const CaptainBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: #fff9db;
  color: #fab005;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
`;

export const LineupMessage = styled.div`
  background: white;
  padding: 60px 32px;
  border-radius: 24px;
  text-align: center;
  color: #8b95a1;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
`;

/* --- Stats & Comparison --- */
export const StatsSection = styled.div`
  background: white;
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
`;

export const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f2f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

export const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #8b95a1;
  flex: 1;
  text-align: center;
`;

export const TeamStatValue = styled.div`
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.color || '#191f28'};
`;

export const ChartContainer = styled.div`
  height: 350px;
  margin-top: 40px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 20px;
`;

/* --- Competition Cards --- */
export const CompetitionPointsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CompetitionItem = styled.div`
  background: white;
  padding: 24px;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

export const CompetitionTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: #4e5968;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    font-size: 12px;
    background: #fff0f1;
    color: #f04452;
    padding: 4px 8px;
    border-radius: 6px;
  }
`;

export const CompetitionDetail = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .player {
    display: flex;
    align-items: center;
    gap: 12px;
    
    img {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #f2f4f6;
    }

    .info {
      .nick { font-size: 15px; font-weight: 700; color: #191f28; }
      .score { font-size: 13px; color: #8b95a1; margin-top: 2px; }
    }
  }

  .vs {
    font-size: 13px;
    font-weight: 900;
    color: #e5e8eb;
    font-style: italic;
  }
`;

/* --- Head to Head --- */
export const HeadToHead = styled.div`
  background: white;
  padding: 32px;
  border-radius: 24px;
  margin-bottom: 24px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
`;

export const HeadToHeadTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: #8b95a1;
  margin-bottom: 20px;
`;

export const HeadToHeadStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 8px;
`;

export const HeadToHeadTeam = styled.div`
  .name { font-size: 20px; font-weight: 800; color: #191f28; margin-bottom: 4px; }
  .record { font-size: 13px; color: #4e5968; font-weight: 600; }
`;

export const HeadToHeadVS = styled.div`
  font-size: 24px;
  font-weight: 900;
  color: #e5e8eb;
`;

export const MatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const MatchItem = styled.div`
  background: white;
  padding: 20px 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`;

export const MatchTeams = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 15px;
  font-weight: 700;
  color: #191f28;

  .winner { color: #3182f6; }
`;

export const MatchScore = styled.div`
  padding: 6px 16px;
  background: #f2f4f6;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 700;
  color: #4e5968;
`;

export const MatchInfo = styled.div`
  font-size: 13px;
  color: #8b95a1;
  font-weight: 500;
`;

export const ErrorMessage = styled.div`
  padding: 60px;
  text-align: center;
  color: #f04452;
  font-weight: 600;
`;