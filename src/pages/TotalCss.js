import styled, { keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

export const cardFlip = keyframes`
  from { transform: rotateY(0deg); }
  to { transform: rotateY(180deg); }
`;

export const getRankColor = (rank) => {
  if (rank === 1) return '#FFBB00';
  if (rank === 2) return '#A0AEC0';
  if (rank === 3) return '#DAA520';
  return '#3182f6';
};

export const getRatingColor = (value) => {
  if (value >= 90) return '#FFBB00';
  if (value >= 80) return '#A0AEC0';
  if (value >= 70) return '#DAA520';
  return '#3182f6';
};

export const OuterWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 80px;
`;

export const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: 768px) {
    padding: 24px 16px;
    gap: 24px;
  }
`;

export const TitleContainer = styled.div`
  padding: 0;
  text-align: left;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #191f28;
  margin: 0;
  letter-spacing: -0.5px;
`;

export const SearchForm = styled.form`
  width: 100%;
  max-width: 440px;
  margin-bottom: 8px;
`;

export const RankBannerContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

export const RankMessage = styled.div`
  background: white;
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    border-color: #3182f6;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #8b95a1;
    text-transform: uppercase;
  }

  .content {
    font-size: 15px;
    font-weight: 800;
    color: #191f28;

    .highlight {
      color: #3182f6;
    }
  }

  .icon {
    color: #ffd700;
  }
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;

  .search-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 14px;
  border: 1px solid #e5e8eb;
  background-color: #ffffff;
  color: #191f28;
  outline: none;
  transition: all 0.2s;

  &::placeholder {
    color: #adb5bd;
  }

  &:focus {
    border-color: #3182f6;
    background-color: #ffffff;
  }
`;

export const Button = styled.button`
  background-color: #3182f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1b64da;
    transform: translateY(-1px);
  }
`;

export const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const FlipCardContainer = styled.div`
  perspective: 2000px;
  width: 100%;
  max-width: 440px;
  margin: 0;
  aspect-ratio: 1 / 1.55;

  @media (max-width: 480px) {
    max-width: 100%;
    aspect-ratio: 1 / 1.6;
  }
`;

export const FlipCardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  cursor: pointer;
  transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};

  &:hover {
    transform: ${props => props.isFlipped ? 'rotateY(180deg) scale(1.02)' : 'rotateY(0deg) scale(1.02)'};
  }

  @media (max-width: 480px) {
    &:hover {
      transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
    }
  }
`;

const CardBase = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(0,0,0,0.12);
`;

export const CardFront = styled.div`
  ${CardBase}
  background: #0d121a;
  display: flex;
  flex-direction: column;
  padding: 0;
`;

export const CardBack = styled.div`
  ${CardBase}
  background: linear-gradient(135deg, #191f28, #333d4b);
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  padding: 24px;
  color: white;
  overflow-y: auto;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 480px) {
    padding: 16px;
    overflow-y: visible;
  }
`;

export const PlayerCardHeader = styled.div`
  height: 140px;
  background: linear-gradient(135deg, #3182f6, #4e9afc);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: white;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(to top, white, transparent);
  }
`;

export const PlayerRating = styled.div`
  font-size: 48px;
  font-weight: 900;
  line-height: 1;
`;

export const PlayerPosition = styled.div`
  font-size: 18px;
  font-weight: 700;
  opacity: 0.9;
`;

export const PlayerProfile = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
  z-index: 1;
`;

export const PlayerAvatarWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const PlayerName = styled.h3`
  font-size: 28px;
  font-weight: 800;
  color: #191f28;
  margin: 0 0 8px;
`;

export const TitleBadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-bottom: 24px;
`;

export const TitleBadge = styled.span`
  background: linear-gradient(135deg, #f2f4f6, #e5e8eb);
  color: #4e5968;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.03);
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    background: linear-gradient(135deg, #e5e8eb, #d1d6db);
    color: #191f28;
  }
`;

export const StatsSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: auto;
  padding: 24px;
  background: #f9fafb;
`;

export const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 12px;
    font-weight: 600;
    color: #8b95a1;
  }
  .value {
    font-size: 18px;
    font-weight: 800;
    color: #191f28;
  }
`;

export const DetailedStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

export const StatRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .label {
    font-size: 14px;
    font-weight: 600;
    color: #adb5bd;
  }
  .value {
    font-size: 14px;
    font-weight: 700;
    color: white;
  }
`;

export const StatBarContainer = styled.div`
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
`;

export const StatBar = styled.div`
  height: 100%;
  background: #3182f6;
  width: ${props => props.percentage}%;
  transition: width 1s ease-out;
`;

export const BackCardFooter = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const HistoryButton = styled(Link)`
  background: #3182f6;
  color: white;
  text-decoration: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #1b64da;
    transform: translateY(-2px);
  }
`;

export const WinLossBar = styled.div`
  display: flex;
  height: 8px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
`;

export const AdvancedStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 16px;
`;

export const AdvancedStatItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 8px;
  border-radius: 12px;
  text-align: center;

  .val {
    font-size: 16px;
    font-weight: 800;
    color: #3182f6;
    display: block;
    margin-bottom: 4px;
  }
  .lab {
    font-size: 11px;
    font-weight: 600;
    color: #adb5bd;
  }
`;

export const LevelUpMessage = styled.div`
  background: rgba(49, 130, 246, 0.1);
  color: #3182f6;
  font-size: 12px;
  font-weight: 600;
  padding: 10px 12px;
  border-radius: 10px;
  margin-top: 16px;
  border: 1px solid rgba(49, 130, 246, 0.2);
  line-height: 1.5;
`;

export const SideSection = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const TopPlayersCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
`;

export const SectionTitle = styled.h4`
  font-size: 18px;
  font-weight: 800;
  color: #191f28;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    color: #3182f6;
    font-size: 14px;
  }
`;

export const TopPlayerItem = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f2f4f6;
  gap: 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f9fafb;
    .name { color: #3182f6; }
  }

  &:last-child {
    border-bottom: none;
  }

  .rank {
    font-size: 16px;
    font-weight: 800;
    color: #3182f6;
    width: 20px;
  }

  .name {
    font-size: 15px;
    font-weight: 700;
    color: #333d4b;
    flex: 1;
  }

  .count {
    font-size: 13px;
    font-weight: 600;
    color: #8b95a1;
  }
`;

export const TrendingBadge = styled.div`
  background: #fff0f0;
  color: #f04452;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
`;

export const RatingBadge = styled.div`
  background: ${props => props.color};
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;