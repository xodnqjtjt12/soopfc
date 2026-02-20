import styled, { keyframes, createGlobalStyle, css } from 'styled-components';



export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px; // Unified padding with other pages
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  color: #333d4b;
  background-color: #f8f9fa;

  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

/* --- Header Section --- */
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 30px; 
    gap: 16px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #191f28;
  margin: 0;
  letter-spacing: -0.5px;
`;

export const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;

   @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

export const Subtitle = styled.p`
  font-size: 15px;
  color: #8b95a1;
  margin: 0;
  font-weight: 500;
`;

/* --- Filter & Search --- */
export const FilterContainer = styled.div`
  display: flex;
  background-color: #f1f3f5; /* Light Gray Track */
  padding: 4px;
  border-radius: 25px;
  gap: 0px; /* Connected */
  white-space: nowrap; /* Prevent wrapping */

  @media (max-width: 768px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
    /* Hide scrollbar */
    &::-webkit-scrollbar { display: none; }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export const FilterButton = styled.button`
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  background-color: ${props => props.active ? '#ffffff' : 'transparent'};
  color: ${props => props.active ? '#191f28' : '#8b95a1'};
  font-size: 14px;
  font-weight: ${props => props.active ? '700' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'};

  &:hover {
    color: ${props => props.active ? '#191f28' : '#495057'};
  }

  @media (max-width: 768px) {
    flex-shrink: 0;
    padding: 8px 16px;
  }
`;

export const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 240px;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 24px;
    padding: 0;
    box-sizing: border-box;
    max-width: none;
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
  width: 100%;
  padding: 10px 16px;
  padding-left: 40px; // Space for icon
  font-size: 14px;
  border-radius: 99px; /* Unified pill-shape */
  border: 1px solid #e9ecef;
  background-color: white;
  color: #333d4b;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #339af0;
    box-shadow: 0 0 0 3px rgba(51, 154, 240, 0.1);
  }
  
  &::placeholder {
    color: #adb5bd;
  }

  @media (max-width: 480px) {
    border-radius: 99px; /* Unified pill-shape */
    font-size: 14px;
    padding: 12px 16px 12px 44px;
    min-width: 0;
  }
`;

/* --- Dashboard Grid --- */
export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0;
    width: 100%;
  }
`;

/* --- Hero Card (Left Large) --- */
export const HeroCardWrapper = styled.div`
  grid-column: span 1; 
  grid-row: span 2; // Make it tall
  
  @media (max-width: 1024px) {
    grid-column: span 2;
    grid-row: span 1;
  }

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

/* --- Hero Card (Dark Premium) --- */
/* --- Hero Card (White Theme) --- */
export const HeroCard = styled.div`
  background: white; /* White Background */
  background-image: radial-gradient(circle at 50% 80%, #e7f5ff 0%, rgba(255,255,255,0) 50%); /* Subtle Blue Point behind Image */
  border-radius: 20px;
  padding: 32px; /* Increased padding */
  height: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); /* Softer shadow */
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: #333d4b;

  @media (max-width: 480px) {
    padding: 24px 20px; /* Reduce padding on very small screens */
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.1);
  }
`;

export const HotRecordBadge = styled.div`
  display: inline-flex;
  font-size: 10px;
  font-weight: 800;
  color: #e03131;
  background-color: #fff5f5;
  padding: 4px 12px; /* Pill Shape */
  border-radius: 20px;
  margin-bottom: 8px;
  align-self: flex-start;
  text-transform: uppercase;
  z-index: 2;
  border: 1px solid #ffc9c9;
`;

export const HeroHeader = styled.div`
  display: flex;
  justify-content: space-between; /* Title Left, Icon Right */
  align-items: flex-start;
  width: 100%;
  margin-bottom: 16px; /* More room */
  z-index: 2;
`;

export const HeroTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #333d4b;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

export const HeroIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff9db; /* Light Yellow */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fab005; /* Gold Icon */
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

// Wrapper to hold Image and Rank
export const HeroImageWrapper = styled.div`
  position: relative;
  width: 100%;
  /* Removed flex-grow to avoid pushing down */
  display: flex;
  align-items: center; /* Center */
  justify-content: center;
  margin-bottom: 20px; /* More room */
`;

export const HeroImage = styled.img`
  width: 220px; /* PC size */
  height: 220px;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
  z-index: 1;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);

  @media (max-width: 768px) {
    width: 160px; /* Reduced for mobile */
    height: 160px;
  }
`;

export const HeroContent = styled.div`
  /* Removed absolute positioning */
  width: 100%;
  padding: 0 24px; /* Reduced bottom padding */
  background: transparent; /* No gradient */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center Content Height */
  flex-grow: 1;
  z-index: 2;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-top: 0; /* Reset offset on mobile to avoid overcrowding */
    padding: 12px 16px;
  }
`;

export const RankBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 32px;
  height: 32px;
  background-color: #ffffff;
  color: #1e3c72;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 10;
`;

export const HeroPlayerName = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #212529; /* Dark Color */
  margin-bottom: 4px;
  /* Removed text-shadow */
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
`;

export const HeroPlayerPosition = styled.span`
  font-size: 11px;
  color: white;
  font-weight: 700;
  margin-left: 8px;
  background: linear-gradient(135deg, #339af0, #228be6); /* Professional Badge */
  padding: 3px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(51, 154, 240, 0.2);
`;

export const HeroStatValue = styled.div`
  font-size: 56px;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd43b 0%, #f08c00 100%); /* Gold to Orange Gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  /* Removed strong text-shadow */
  @media (max-width: 768px) {
    font-size: 42px;
    
    span {
      font-size: 18px;
    }
  }
  
  display: flex;
  align-items: baseline;
  justify-content: center;
  
  span {
    font-size: 24px; /* Increased size */
    font-weight: 800; /* Extra Bold */
    margin-left: 4px;
    opacity: 1;
    /* Inherit Gradient */
    background: linear-gradient(135deg, #ffd43b 0%, #f08c00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export const HeroFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #868e96; /* Darker Footer Text */
  z-index: 3;
  margin-top: auto; /* Push to bottom */
  padding-top: 20px; /* Gap from content */
  border: none;
`;

/* --- Grid Card (Normal) --- */
export const GridCard = styled.div`
  background-color: white;
  border-radius: 20px;
  padding: 32px; /* Unified with HeroCard */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.03);
  transition: all 0.2s ease;
  min-height: 180px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
  }
`;

export const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

export const GridTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #343a40;
  margin: 0;
  line-height: 1.4;
`;

export const GridSubtitle = styled.div`
  font-size: 13px;
  color: #adb5bd;
  font-weight: 500;
  margin-top: 4px;
`;

export const GridIcon = styled.div`
  /* Color and Background are set via inline styles */
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 22px;
    height: 22px;
  }
`;

export const GridContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const GridProfile = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #f1f3f5;
  position: relative;
`;

export const GridProfileWrapper = styled.div`
  position: relative;
`;

export const MiniRankBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background-color: #fab005;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid white;
`;

export const GridInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PlayerNameText = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #212529;
  line-height: 1.2;
  white-space: nowrap;
`;
export const GridPlayerName = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #212529;
`;

export const GridStatValue = styled.span`
  font-size: 28px;
  font-weight: 900; /* Extra Bold */
  color: ${props => props.color || '#333d4b'}; /* Dynamic Color */
  line-height: 1.2;

  span {
    font-size: 14px;
    color: #868e96;
    font-weight: 600;
    margin-left: 4px;
  }
`;


/* --- Modal & Loading --- */
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: ${fadeIn} 0.2s ease-out;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh; /* Increased to avoid ghost scrollbars */
  overflow-y: auto;
  overflow-x: hidden; /* No horizontal scroll for the popup itself */
  padding: 32px; /* Restored for desktop */
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: white;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 16px;
    width: calc(100% - 32px);
    margin: 16px;
  }
  
  /* Use global scrollbar settings, remove local overrides if any */
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

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Consistent with Top popup headers */
  margin-bottom: 24px;
  width: 100%;
  gap: 16px; /* Title/X separation */
`;

export const ModalTitle = styled.h2`
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

export const RankList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const RankItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f5;

  &:last-child {
    border-bottom: none;
  }
`;

export const RankNum = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #868e96;
  width: 44px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

export const RankName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #343a40;
  flex: 1;
  margin-left: 12px;
`;

export const RankValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #339af0;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-weight: 600;
  color: #adb5bd;
`;

export const LoadingText = styled.div`
  margin-top: 16px;
  font-size: 16px;
  color: #339af0;
`;

export const LoadingPercentage = styled.div`
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  color: #666;
`;

export const RecordTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-top: 8px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #e9ecef;
    border-radius: 2px;
  }
`;

export const TableWrapper = RecordTableWrapper; /* Alias for compatibility */

export const RecordTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 450px;
`;

export const TableHeader = styled.th`
  background-color: #f8f9fa;
  color: #868e96;
  font-weight: 600;
  padding: 12px 8px; /* Unified with TableCell */
  text-align: center;
  border-bottom: 1px solid #dee2e6;
  white-space: nowrap;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #f1f3f5;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 12px 8px;
  border-bottom: 1px solid #f1f3f5;
  color: #333d4b;
  font-weight: 500;
  vertical-align: middle;
  text-align: center; /* Unified with TableHeader */

  &.season {
    font-weight: 700;
    color: #1a1b1e;
  }

  .rank {
    font-size: 11px;
    color: #8b95a1;
    font-weight: 400;
    margin-top: 2px;
  }

  @media (max-width: 480px) {
    padding: 10px 4px;
    font-size: 13px;
  }
`;