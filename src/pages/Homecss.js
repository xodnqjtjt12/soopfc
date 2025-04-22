import styled from 'styled-components';
import Calendar from 'react-calendar';
import { keyframes } from 'styled-components';
import 'react-calendar/dist/Calendar.css'; // react-calendar CSS import

export const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafb;
  color: #191f28;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
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
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
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
  transition: all 0.2s ease;
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
  }
`;

export const PlayerRank = styled.div`
-  font-size: 16px;
-  font-weight: 600;
-  color: #4E4E4E;
-  margin-bottom: 8px;
-  letter-spacing: 0.5px;
-  text-align: center;
+  display: flex;                        /* ❶ 플렉스 컨테이너로 변경 */
+  justify-content: center;             /* ❷ 가로 중앙 정렬 */
+  align-items: center;                 /* ❸ 세로 중앙 정렬 */
+  margin: 0 auto 8px;                  /* ❹ 좌우 마진 자동(가로 중앙) + 아래 여백 */
+  font-size: 16px;
+  font-weight: 600;
+  color: #4E4E4E;
+  letter-spacing: 0.5px;
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
    padding: 0 8px 16px;
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
  .react-calendar__tile {
    min-height: 42px;
    padding: 8px 4px;
    font-size: 14px;
    
  }
}
    .react-calendar__navigation__label {
      font-size: 16px;
      padding: 6px 12px;
    }
    
    .react-calendar__navigation__arrow {
      width: 32px;
      height: 32px;
      font-size: 18px;
    }
    
    .react-calendar__month-view__weekdays__weekday {
      font-size: 12px;
      padding: 6px 0;
    }
    
    .react-calendar__month-view__days {
      gap: 3px;
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
      width: 5px;
      height: 5px;
    }
  }

  @media (max-width: 400px) {
    padding: 8px;
    
    .react-calendar__tile {
      min-height: 36px;
      padding: 6px 2px;
      font-size: 13px;
      border-radius: 8px;
    }
    
    .react-calendar__navigation {
      padding: 0 4px 12px;
      margin-bottom: 12px;
    }
    
    .react-calendar__navigation__label {
      font-size: 15px;
      padding: 4px 8px;
    }
    
    .react-calendar__navigation__arrow {
      width: 28px;
      height: 28px;
      font-size: 16px;
    }
    
    .react-calendar__month-view__weekdays__weekday {
      font-size: 11px;
      padding: 4px 0;
    }
    
    .react-calendar__month-view__days {
      gap: 4px;
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

// Homecss.js 또는 해당 스타일 파일
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
  padding: 24px; 
  padding-left: 32px; /* Increased left padding to ensure leftmost item is visible */
  margin: 0 -12px 12px -27px;
  width: calc(100% + 24px); 
  scrollbar-width: thin;
  scroll-padding-left: 24px; /* Added scroll padding for better scroll snap behavior */

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 6px;
  }

  @media (max-width: 640px) {
    justify-content: flex-start;                  /* ← 모바일에서 왼쪽 정렬 */
    overflow-x: auto;                             /* ← 가로 스크롤 허용 */
    padding-left: 13px;                           /* ← 첫 카드 안 잘리게 패딩 */
    padding-right: 12px;
    width: 100%;                                  /* ← 딱 모바일 화면 너비 */
    margin: 0;                                     /* ← 마진 제거 */
    scroll-padding-left: 0;                        /* ← 필요 없어졌으므로 제거 */
    -webkit-overflow-scrolling: touch;                  /* iOS 자연스러운 스크롤 */
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