import styled from 'styled-components';
import Calendar from 'react-calendar';
import { keyframes } from 'styled-components';
import 'react-calendar/dist/Calendar.css';

export const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 126px;
  min-height: 100vh;
  background-color: #f9fafb;
  color: #191f28;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-top: -230px !important;
  }
  @media (min-width: 769px) {
    margin-top: -210px !important;
  }
`;

export const ContentWrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: 0 24px;
  margin: 0 auto;
  box-sizing: border-box;
  background-color: #f9fafb;
`;

export const HeroSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 80px 0 120px;
  gap: 60px;
  width: 100%;
  @media (max-width: 1080px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const HeroContent = styled.div`
  flex: 1;
  width: 100%;
`;

export const HeroTitle = styled.h1`
  font-size: 64px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: -1px;
  line-height: 1.1;
  color: #191f28;
  @media (max-width: 640px) {
    font-size: 40px;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 20px;
  line-height: 1.6;
  color: #4e5968;
  margin-bottom: 40px;
  max-width: 540px;
  @media (max-width: 1080px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

export const HeroImageContainer = styled.div`
  flex: 1;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0.15);
  margin-left: -10px;

  @media (max-width: 640px) {
    aspect-ratio: 4 / 3;
  }
`;

export const HeroImage = styled.img`
  width: 120%;
  height: 110%;
  object-fit: cover;
  display: block;
  margin: 0;
  padding: 0;
  position: relative;
  left: -4%;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const PrimaryButton = styled.a`
  display: inline-block;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  background-color: #3182f6;
  border-radius: 12px;
  text-decoration: none;
  transition: all:0.2s ease;
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.2);
  &:hover {
    background-color: #1c6fef;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(49, 130, 246, 0.3);
  }
`;

export const StatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 40px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 150px;
`;

export const SectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #191f28;
  width: 100%;
`;

export const PlayerCard = styled.div`
  min-width: 220px;
  background: linear-gradient(135deg, #fff, #f9f7ff);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex-shrink: 0;
  scroll-snap-align: start;
  padding: 20px;
  border: 2px solid transparent;
  position: relative;
  &::before {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 24px;
  }
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(49, 130, 246, 0.15);
    border-color: rgba(49, 130, 246, 0.3);
  }
  @media (max-width: 640px) {
    min-width: 85%;
    scroll-snap-align: start;
    &:first-child {
      margin-left: 0;
    }
  }
`;

export const PlayerRank = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto -3px;
  font-size: 16px;
  font-weight: 600;
  color: #4E4E4E;
  letter-spacing: 0.5px;
`;

export const PlayerStats = styled.div`
  font-size: 15px;
  color: #4e5968;
  margin-bottom: 16px;
  line-height: 1.6;
`;

export const Footer = styled.footer`
  width: 100%;
  padding: 60px 0;
  background-color: #191f28;
  color: white;
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 40px;
  }
`;

export const FooterCopyright = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 16px;
`;

export const ScheduleSection = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 40px auto 0;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
`;

export const ScheduleHeader = styled.h3`
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 700;
  color: #191f28;
  text-align: center;
  letter-spacing: -0.5px;
`;

export const StyledCalendar = styled(Calendar)`
  width: 100%;
  max-width: 100%;
  border: none;
  border-radius: 16px;
  background-color: #fff;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow-x: hidden;
  box-sizing: border-box;

  .react-calendar__navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: transparent;
    padding: 8px 8px 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #f2f4f6;
  }

  .react-calendar__navigation__label {
    font-size: 18px;
    font-weight: 700;
    color: #333d4b;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 10px;
    transition: background-color 0.2s;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background-color: #f2f4f6;
    }
  }

  .react-calendar__navigation__arrow {
    font-size: 20px;
    color: #333d4b;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
    flex-shrink: 0;

    &:hover {
      background-color: #f2f4f6;
    }
  }

  .react-calendar__month-view__weekdays {
    margin-bottom: 8px;
  }

  .react-calendar__month-view__weekdays__weekday {
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    color: #8b95a1;
    padding: 8px 0;

    abbr {
      text-decoration: none;
    }
  }

  .react-calendar__month-view__days {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }

  .react-calendar__tile {
    position: relative;
    min-height: 48px;
    padding: 12px 8px;
    text-align: center;
    font-size: 15px;
    color: #333d4b;
    background-color: #f9fafb;
    border-radius: 10px;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    outline: none;
    gap: 2px;

    &:hover {
      background-color: #eef1f4;
    }

    &:disabled {
      color: #d1d6db;
      background-color: #f9fafb;
      cursor: not-allowed;
    }

    abbr {
      position: relative;
      z-index: 1;
    }
  }

  .react-calendar__tile--now {
    background-color: #e7f4fd;
    font-weight: 600;
    color: #3182f6;

    &::after {
      content: '';
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: #3182f6;
    }
  }

  .react-calendar__tile--active {
    background-color: #3182f6;
    color: white;
    font-weight: 600;

    &:hover {
      background-color: #1c6fef;
    }
  }

  .react-calendar__tile--hasMatch {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 6px;
      right: 6px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #00d26a;
    }
  }

  .react-calendar__tile.saturday {
    color: blue;
  }

  .react-calendar__tile.sunday-or-holiday {
    color: red;
  }

  .react-calendar__tile--win {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 6px;
      right: 6px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #ff3b30;
      box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.2);
    }
  }

  @media (max-width: 640px) {
    padding: 12px;

    .react-calendar__navigation {
      padding: 0 4px 12px;
      margin-bottom: 12px;
    }

    .react-calendar__navigation__label {
      flex: 0 0 auto !important;
      white-space: nowrap;
      overflow: visible !important;
      text-overflow: clip !important;
      min-width: max-content;
    }

    .react-calendar__navigation__arrow {
      width: 36px;
      height: 36px;
      font-size: 18px;
    }

    .react-calendar__month-view__weekdays__weekday {
      font-size: 12px;
      padding: 4px 0;

      abbr {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
      }
    }

    .react-calendar__month-view__days {
      gap: 4px;
    }

    .react-calendar__tile {
      min-height: 40px;
      padding: 8px 2px;
      font-size: 14px;
      border-radius: 8px;
      flex-direction: column;
    }

    .react-calendar__tile--now::after {
      bottom: 4px;
      width: 3px;
      height: 3px;
    }

    .react-calendar__tile--hasMatch::before,
    .react-calendar__tile--win::after {
      top: 4px;
      right: 4px;
      width: 4px;
      height: 4px;
    }
  }

  @media (max-width: 400px) {
    padding: 8px;

    .react-calendar__navigation {
      padding: 0 2px 8px;
      margin-bottom: 8px;
    }

    .react-calendar__navigation__label {
      font-size: 14px;
      padding: 4px;
      margin: 0 4px;
    }

    .react-calendar__navigation__arrow {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }

    .react-calendar__month-view__weekdays__weekday {
      font-size: 11px;
      padding: 2px 0;
    }

    .react-calendar__month-view__days {
      gap: 2px;
    }

    .react-calendar__tile {
      min-height: 36px;
      padding: 4px 1px;
      font-size: 13px;
      border-radius: 6px;
    }
  }
`;

export const ScheduleList = styled.ul`
  margin-top: 24px;
  list-style: none;
  padding-left: 0;
`;

export const ScheduleItem = styled.li`
  padding: 16px;
  margin-bottom: 12px;
  font-size: 15px;
  color: #333d4b;
  background-color: #f9fafb;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #eef1f4;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const SoccerAnnounceBanner = styled.div`
  background: linear-gradient(to right, #1a472a, #2d8659);
  border: 2px solid #ffffff;
  border-radius: 8px;
  color: white;
  padding: 14px 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: ${fadeIn} 0.5s ease-out;

  &::before {
    content: "⚽";
    font-size: 1.5rem;
    margin-right: 10px;
    vertical-align: middle;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.1) 10px,
      transparent 10px,
      transparent 20px
    );
    border-radius: 6px;
    pointer-events: none;
  }
`;

export const SwipeHint = styled.div`
  display: none;
  @media (max-width: 640px) {
    display: block;
    text-align: center;
    font-size: 14px;
    color: #555;
    margin: 8px 0;
    animation: ${fadeIn} 0.4s ease-out;
  }
`;

export const EndMessage = styled.div`
  display: none;
  @media (max-width: 640px) {
    display: block;
    text-align: center;
    font-size: 14px;
    color: #555;
    margin: 8px 0 24px;
    animation: ${fadeIn} 0.4s ease-out;
  }
`;

export const WhiteDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #ECECEC;
  margin: 12px 0;
`;

export const MomPlayersContainer = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: ${({ isScrollable }) => (isScrollable ? 'auto' : 'hidden')};
  justify-content: center;
  padding: 35px 30px;
  width: calc(100% + 24px);
  scrollbar-width: thin;
  scroll-padding-left: 24px;
  margin-left: -35px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 6px;
  }

  @media (max-width: 850px) {
    justify-content: flex-start;
    overflow-x: auto;
    padding-left: 16px;
    padding-right: 16px;
    width: calc(100% - 32px);
    margin: 0;
    scroll-snap-type: none;
    -webkit-overflow-scrolling: touch;
  }

  @media (max-width: 640px) {
    justify-content: flex-start;
    padding-left: 16px;
    padding-right: 16px;
    width: calc(100% - 32px);
    margin: 0;
    scroll-snap-type: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const PlayerRankBadge = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
`;

export const TrophyIcon = styled.img`
  width: 36px;
  height: 32px;
`;

export const PlayerName = styled.h3`
  font-family: 'Pretendard', sans-serif;
  font-weight: 700;
  font-size: 32px;
  line-height: 100%;
  letter-spacing: 0%;
  vertical-align: middle;
  margin: 5px 0;
  color: #000;
`;

export const PlayerScore = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #3182f6;
  margin-left: auto;
  position: relative;
  top: 40px;
`;

export const PlayerHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
`;

export const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const PositionTags = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
`;

export const PositionTag = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) => {
    switch (props.position) {
      default:
        return '#e3f2fd';
    }
  }};
  color: ${(props) => {
    switch (props.position) {
      default:
        return '#2196f3';
    }
  }};
`;

export const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
`;

export const StatLabel = styled.span`
  color: #666;
`;

export const StatValue = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: #3182f6;
  margin-bottom: 4px;
`;

export const MomSectionTitle = styled(SectionTitle)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  width: 100%;

  img {
    width: 80px;
    height: 80px;
  }
`;

// New styled components for countdown timer
export const VoteButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const VoteCountdownText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ff3b30; // Red to indicate urgency
  background-color: rgba(255, 59, 48, 0.1);
  padding: 6px 12px;
  border-radius: 8px;
  animation: ${fadeIn} 0.4s ease-out;
  text-align: center;

  @media (max-width: 640px) {
    font-size: 12px;
    padding: 4px 8px;
  }
`;

// New styled components for lineup and vote sections
export const LineupSection = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 40px auto 0;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
`;

export const LineupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const LineupTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #191f28;
`;

export const LineupActions = styled.div`
  display: flex;
  gap: 16px;
`;

export const LineupTeams = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
`;

export const LineupTeam = styled.div`
  flex: 1;
  min-width: 300px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const LineupTeamHeader = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #333d4b;
  margin-bottom: 12px;
`;

export const LineupPlayers = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 15px;
  color: #4e5968;

  li {
    padding: 8px 0;
    border-bottom: 1px solid #ececec;
    &:last-child {
      border-bottom: none;
    }
  }
`;

export const VoteSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const VoteTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #333d4b;
  margin-bottom: 12px;
`;

export const Loading = styled.div`
  text-align: center;
  font-size: 16px;
  color: #4e5968;
  margin: 16px 0;
`;

export const Message = styled.div`
  text-align: center;
  font-size: 16px;
  color: ${props => props.error ? '#ff3b30' : '#4e5968'};
  margin: 16px 0;
`;