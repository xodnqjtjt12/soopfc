import styled, { keyframes } from 'styled-components';

// Keyframes for animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const zoomIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const growIn = keyframes`
  from {
    opacity: 0;
    transform: scaleY(0);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  color: #333;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 15px;
    margin: 0 10px;
  }
`;

export const MatchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #00295f, #004aad);
  color: white;
  padding: 15px 0;
  position: relative;
  border-radius: 8px;
  animation: ${fadeInUp} 0.8s ease-out;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  h2 {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  @media (max-width: 768px) {
    h2 { font-size: 22px; }
  }
`;

export const MatchVS = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
  border-radius: 8px;
  animation: ${zoomIn} 0.7s ease-out;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 15px;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
`;

export const TeamContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 200px;
  max-width: 300px;

  @media (max-width: 768px) {
    min-width: 150px;
    max-width: 100%;
    text-align: center;
  }
`;

export const TeamInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${zoomIn} 0.9s ease-out;
`;

export const TeamName = styled.h3`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

export const TeamStats = styled.div`
  font-size: 14px;
  color: #666;
  opacity: 0;
  animation: ${fadeInUp} 1s ease-out 0.5s forwards;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const VSIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 20px;

  @media (max-width: 768px) {
    margin: 10px 0;
  }
`;

export const VSText = styled.span`
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
  color: #888;
  animation: ${pulse} 2s infinite;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const MatchDate = styled.div`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 5px;
  opacity: 0;
  animation: ${fadeInUp} 1s ease-out 0.7s forwards;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 12px;
    margin-top: 10px;
    width: auto;
    word-break: break-word;
  }
`;

export const Section = styled.div`
  background-color: white;
  margin: 15px 0;
  border-top: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
  border-radius: 8px;
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 768px) {
    margin: 10px 0;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  padding: 12px 15px;
  border-bottom: 1px solid #e5e5e5;
  background-color: #f5f5f5;
  margin: 0;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shine 3s infinite;
  }

  @keyframes shine {
    0% { left: -100%; }
    50% { left: 100%; }
    100% { left: 100%; }
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 12px;
  }
`;

export const LineupContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0;
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.3s forwards;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const TeamLineup = styled.div`
  flex: 1;
  padding: 15px;
  border-right: ${props => props.hasBorder ? '1px solid #e5e5e5' : 'none'};
  animation: ${props => props.hasBorder ? slideInLeft : slideInRight} 0.7s ease-out;

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
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.4s forwards;

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
  opacity: 0;
  animation: ${slideInLeft} 0.5s ease-out forwards;
  animation-delay: ${props => props.index * 0.1}s;
  
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

  transition: color 0.3s ease;
  &:hover {
    color: #3b82f6;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const PlayerPosition = styled.span`
  color: #888;
  font-size: 13px;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const StatsSection = styled.div`
  padding: 15px;
  animation: ${fadeInUp} 0.7s ease-out;

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
  opacity: 0;
  animation: ${fadeInUp} 0.6s ease-out forwards;
  animation-delay: ${props => props.index * 0.1}s;
  
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
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

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
  animation: ${fadeInUp} 0.6s ease-out;

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
  opacity: 0;
  animation: ${fadeInUp} 0.5s ease-out forwards;
  animation-delay: ${props => props.index * 0.1}s;
  
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
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

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
  transition: color 0.3s ease;

  &:hover {
    color: #3b82f6;
  }

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
  animation: ${fadeInUp} 0.6s ease-out;
`;

export const ChartContainer = styled.div`
  height: 300px;
  padding: 20px;
  transform-origin: bottom;\
  animation: ${growIn} 0.8s ease-out;

  @media (max-width: 768px) {
    height: 250px;
    padding: 15px;
  }
`;

export const CheerSection = styled.div`
  margin: 20px 0;
  text-align: center;
  animation: ${fadeInUp} 0.7s ease-out;
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
  transition: transform 0.2s ease;

  &:hover {
    background-color: ${props => props.color ? `${props.color}cc` : '#2563eb'};
    animation: ${bounce} 0.4s ease;
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
  animation: ${zoomIn} 0.7s ease-out;

  @media (max-width: 768px) {
    max-width: 90%;
    height: 18px;
  }
`;

export const GaugeBar = styled.div`
  background-color: ${props => props.color || '#3182f6'};
  width: ${props => props.width || '50%'};
  transition: width 0.5s ease-in-out;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const GaugeText = styled.div`
  position: absolute;
  // top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  padding: 2px 8px;
  border-radius: 4px;
  animation: ${pulse} 2s infinite;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const MatchDateBelow = styled.div`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 10px;
  opacity: 0;
  animation: ${fadeInUp} 1s ease-out 0.7s forwards;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 12px;
    margin-top: 10px;
    width: auto;
    word-break: break-word;
  }
`;


export const HeadToHead = styled.div`
  margin-bottom: 20px;
  text-align: center;
  animation: ${fadeInUp} 0.7s ease-out;

  @media (max-width: 768px) {
    display: none;
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
  animation: ${zoomIn} 0.8s ease-out;
`;

export const HeadToHeadTeam = styled.span`
  font-weight: bold;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

export const HeadToHeadVS = styled.span`
  color: #666;
  animation: ${pulse} 2s infinite;
`;

export const LineupMessage = styled.div`
  padding: 15px;
  text-align: center;
  font-size: 16px;
  color: #666;
  background-color: #f9fafb;
  border-radius: 8px;
  margin: 10px;
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px;
    margin: 8px;
  }
`;

export const CompetitionPointsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding: 10px;
  }
`;

export const CompetitionItem = styled.div`
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  text-align: center;
  flex: 1;
  min-width: 280px;
  max-width: 350px;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.7s ease-out;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }

  @media (max-width: 768px) {
    min-width: 90%;
    padding: 12px 15px;
  }
`;

export const CompetitionTitle = styled.h4`
  font-size: 18px;
  color: #004aad;
  margin-bottom: 10px;
  font-weight: bold;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const CompetitionDetail = styled.p`
  font-size: 16px;
  color: #333;
  font-weight: 500;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const NoCompetitionMessage = styled.div`
  font-size: 16px;
  color: #666;
  padding: 20px;
  text-align: center;
  width: 100%;
  animation: ${fadeInUp} 0.7s ease-out;
`;