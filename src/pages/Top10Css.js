import styled, { keyframes, css, createGlobalStyle } from "styled-components";

// Global Style for Font
export const GlobalFontStyle = createGlobalStyle`
  @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
`;

// 애니메이션 효과
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  // padding: 40px 20px; -> Handled by App.js
  padding: 0 20px; // Added padding to match other pages
  background-color: #f8f9fa; // Consistent gray
  font-family: "Pretendard", sans-serif;

  @media (max-width: 768px) {
    padding: 0 10px; // Keep side padding for mobile
    overflow-x: hidden;
  }
`;

export const ContentWrapper = styled.div`
  width: 100%;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
`;

export const PopupNavArrow = styled.button`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #495057;
  font-size: 18px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s;

  ${props => props.direction === 'left' ? 'left: 4px;' : 'right: 4px;'}

  &:hover {
    background-color: #f1f3f5;
    color: #212529;
  }

  @media (max-width: 768px) {
    display: none; // Hide on mobile
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;


export const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    margin-top: 10px;
    margin-bottom: 24px;
    padding: 0;
    min-height: 40px;
  }
`;

export const Title = styled.h1`
  margin: 0 20px;
  font-size: 28px;
  font-weight: 800;
  color: #1a1b1e;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 22px;
    margin: 0 10px;
  }
`;

export const NavArrow = styled.button`
  background: none;
  border: none;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-size: 24px;
  color: ${(props) => (props.disabled ? "#ced4da" : "#868e96")};
  padding: 8px;
  transition: color 0.2s;

  &:hover {
    color: ${(props) => (props.disabled ? "#ced4da" : "#333")};
  }

  @media (max-width: 768px) {
    font-size: 20px;
    padding: 4px;
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;

  &.top-search {
    justify-content: center;
    max-width: 440px;
    margin: 0 auto 40px;
  }

  &.table-search {
    justify-content: flex-end;
    max-width: 240px;
    margin: 0;
    flex-shrink: 0; /* Keep it compact on PC */
  }

  @media (max-width: 768px) {
    &.top-search {
      max-width: none;
      margin: 0 0 24px 0;
      padding: 0 4px;
    }
    
    &.table-search {
      max-width: none;
      width: 100%;
      margin-top: 12px;
      justify-content: flex-start;
    }
  }
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;

  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 5;
  }
`;

export const SearchInput = styled.input`
  padding: 12px 20px 12px 44px; /* Icon padding */
  border: 1px solid #e9ecef;
  border-radius: 99px;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease;
  background-color: #fff;
  font-family: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &:focus {
    outline: none;
    border-color: #339af0;
    box-shadow: 0 0 0 3px rgba(51, 154, 240, 0.1);
  }

  @media (max-width: 768px) {
    padding: 12px 16px 12px 44px;
    font-size: 14px;
    border-radius: 99px; /* Unified pill-shape */
  }
`;

export const SearchButton = styled.button`
  padding: 12px 24px;
  background-color: #339af0;
  color: white;
  border: none;
  border-radius: 99px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: background-color 0.2s, transform 0.1s;
  font-family: inherit;
  box-shadow: 0 2px 4px rgba(51, 154, 240, 0.2);

  &:hover {
    background-color: #228be6;
  }
  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    white-space: nowrap;
  }
`;

/* --- Record Cards Section (Carousel) --- */

export const CarouselContainer = styled.div`
  position: relative;
  margin-bottom: 60px;
  display: flex;
  align-items: center;
`;

export const StatsContainer = styled.div`
  width: 100%;
  overflow: hidden;
  padding-top: 20px;
`;

export const StatsScroll = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 4px 4px 20px 4px;
  align-items: stretch; // ALL items same height
  
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const CarouselItem = styled.div`
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  position: relative;
  height: auto; // Let flex stretch it

  @media (max-width: 768px) {
    flex: 0 0 300px; /* Slightly more stable width than vw */
    max-width: 85vw;
  }
`;

export const CategoryTitle = styled.h3`
  text-align: left;
  padding-left: 20px;
  font-size: 16px;
  font-weight: 700;
  color: #343a40;
  margin: 0 0 12px 0;
`;

export const StatsCard = styled.div`
  width: 100%;
  height: 100%; // Fill transparent parent
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  // REMOVED justify-content: space-between -> use margin-top: auto on footer
  overflow: visible;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 340px; // Reduced from 480px to remove bottom whitespace

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  }
`;

// 1위 강조 영역 (Hero)
export const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 10px; // Reduced bottom padding (24 -> 10)
  position: relative;
  cursor: pointer; // Clickable
`;

export const HeroProfileWrapper = styled.div`
  position: relative;
  width: 110px;
  height: 110px;
  margin-bottom: 12px;
  margin-top: -30px; // Break out
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 5;

  @media (max-width: 768px) {
    width: 90px;
    height: 90px;
    margin-top: -20px; /* Reduced breakout on mobile */
  }
`;

export const HeroImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom;

  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);

  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
`;

// 1st Place Medal
export const HeroBadgeImage = styled.img`
  position: absolute;
  top: 10px; // Inside card top
  left: 26px; // Align with the Rank Column
  width: 40px;
  height: 40px;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  object-fit: contain;
`;

// Text adjustments
export const HeroName = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #212529;
  margin-bottom: 2px;
`;

// Inline Stat Container
export const HeroStatContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-top: 0;
`;

export const HeroStat = styled.span`
  font-weight: 800;
  font-size: 20px;
  color: #339af0;
  line-height: 1;
`;

export const HeroUnit = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #339af0;
  line-height: 1;
`;

// 2~4위 리스트 영역
export const ListSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
  gap: 16px;
  // REMOVED justify-content: flex-end
  margin-top: 5px; // Reduced margin (20 -> 5) to bring them closer
`;

export const ListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 20px;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
  }
`;

export const RankNumber = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #868e96;
  width: 24px;
  height: 30px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-right: 8px;
`;

export const MiniProfile = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
  margin-right: 12px;
  background-color: #f8f9fa;
`;

export const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ItemName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #495057;
`;

export const ItemStat = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #495057;
`;

export const CardFooter = styled.button`
  width: 100%;
  padding: 16px;
  background-color: white;
  border: none;
  border-top: 1px solid #f8f9fa;
  color: #adb5bd;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0 0 16px 16px;
  margin-top: auto; // Push to bottom

  &:hover {
    background-color: #f8f9fa;
    color: #495057;
  }
`;

// Carousel Navigation Buttons
export const CarouselButton = styled.button`
  position: absolute;
  top: 55%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  color: #495057;
  font-size: 20px;
  transition: all 0.2s;
  
  ${(props) => props.direction === 'left' ? 'left: -22px;' : 'right: -22px;'}

  &:hover {
    background-color: #339af0;
    border-color: #339af0;
    color: white;
    box-shadow: 0 6px 16px rgba(51, 154, 240, 0.3);
  }
  
  &:disabled {
    opacity: 0;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;


/* --- Total Ranking Section --- */

export const FullRankingSection = styled.div`
  margin-top: 0px;
  background-color: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 32px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const FullRankingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const FullRankingTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: #212529;
  margin: 0;
`;

export const FullRankingContainer = styled.div`
  width: 100%;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
  display: block;
  padding-bottom: 20px;
  touch-action: pan-x; /* Allow horizontal pan */
  position: relative;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #dee2e6;
    border-radius: 3px;
  }
`;

export const FullRankingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px; /* Force wide table for internal scroll */
  table-layout: auto; /* Let it breathe */
`;

export const TableHeader = styled.th`
  text-align: center;
  padding: 16px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #868e96;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  white-space: nowrap;
  cursor: ${(props) => props.notClickable ? 'default' : 'pointer'};
  transition: color 0.2s;

  &:first-child { border-radius: 8px 0 0 8px; }
  &:last-child { border-radius: 0 8px 8px 0; }

  ${(props) => props.active && css`
    color: #339af0;
    font-weight: 700;
    background-color: #e7f5ff;
  `}
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #f1f3f5;
  transition: background-color 0.1s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8f9fa;
  }
`;

export const TableCell = styled.td`
  padding: 16px 12px;
  vertical-align: middle;
  text-align: center;
  font-size: 14px;
  color: #495057;
`;

export const RankCell = styled(TableCell)`
  font-weight: 600;
  width: 60px;
  color: #868e96;
`;

export const PlayerCell = styled(TableCell)`
  text-align: left;
  min-width: 200px;
`;

export const PlayerInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer; // Clickable

  &:hover {
    opacity: 0.7; // Visual feedback
  }
`;

export const PlayerAvatarSmall = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f1f3f5;
  border: 1px solid #e9ecef;
`;

export const PlayerTextStack = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PlayerNameText = styled.span`
  font-size: 14px;
  font-weight: 400; // Unbold (Normal weight) as requested
  color: #212529;
  line-height: 1.2;
  white-space: nowrap; /* Prevent wrapping */
`;

export const PlayerTeamText = styled.span`
  font-size: 12px;
  color: #adb5bd;
  margin-top: 3px;
  white-space: nowrap;
`;

export const StatCell = styled(TableCell)`
  font-weight: 500;
  
  ${(props) => props.highlight && css`
    color: #339af0;
    font-weight: 700;
    font-size: 16px;
  `}
`;

/* --- No Data & Misc --- */

export const NoDataMessage = styled.div`
  padding: 60px;
  text-align: center;
  color: #adb5bd;
  font-size: 16px;
`;

export const ScrollTopButton = styled.button`
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 52px;
  height: 52px;
  background-color: white;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #339af0;
  cursor: pointer;
  z-index: 999;
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    transform: translateY(-4px);
    background-color: #e7f5ff;
  }
`;

export const PopupOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: ${fadeIn} 0.2s;
  backdrop-filter: blur(4px);
`;

export const PopupContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: calc(100% - 32px); /* Flexible width */
  margin: 16px;
  max-width: 440px;
  max-height: 90vh; /* Increased to avoid ghost scrollbars */
  overflow-y: auto;
  overflow-x: hidden; /* Prevent horizontal breakout */
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
    width: calc(100% - 32px);
    margin: 16px;
  }
`;

export const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Better for long titles */
  margin-bottom: 24px;
  width: 100%;
  gap: 16px; /* Space between title and CloseButton */
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

export const PopupTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const PopupName = styled.h3`
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: #212529;
  line-height: 1.3;
  word-break: keep-all;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const PopupSubtitle = styled.span`
  font-size: 15px;
  color: #868e96;
  font-weight: 400;
  display: block;
  margin-top: 4px;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #adb5bd;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin: -8px; /* Offset padding to keep alignment */
  transition: all 0.2s;
  
  &:hover {
    color: #495057;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

export const StatBox = styled.div`
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s;
  
  &:hover {
    background-color: #e7f5ff;
    transform: translateY(-2px);
  }
`;

export const BoxLabel = styled.span`
  font-size: 14px;
  color: #868e96;
  margin-bottom: 8px;
  font-weight: 500;
`;

export const BoxValue = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #212529;
`;

export const BoxRank = styled.span`
  font-size: 12px;
  color: #339af0;
  font-weight: 700;
  margin-top: 6px;
  background-color: white;
  padding: 4px 10px;
  border-radius: 99px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

export const ListPopupContent = styled(PopupContent)`
  max-width: 500px;
  min-height: 400px;
  max-height: 90vh;
`;

export const CategoryTabScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-bottom: 0px; 
  align-items: center;
  padding: 0 40px; /* Space for arrows */
  
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

export const PlayerPopupOverlay = styled(PopupOverlay)`
  z-index: 2050; // Higher than standard PopupOverlay (2000)
`;

export const CategoryTab = styled.button`
  white-space: nowrap;
  padding: 10px 20px;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid ${(props) => props.active ? '#339af0' : '#e9ecef'};
  background-color: ${(props) => props.active ? '#339af0' : 'white'};
  color: ${(props) => props.active ? 'white' : '#495057'};
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;

  &:hover {
    background-color: ${(props) => props.active ? '#228be6' : '#f8f9fa'};
  }
`;