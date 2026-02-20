import styled, { keyframes, createGlobalStyle } from 'styled-components';



export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  color: #333d4b;
  background-color: #f8f9fa;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

export const MainContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
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

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const Subtitle = styled.p`
  font-size: 15px;
  color: #8b95a1;
  font-weight: 500;
  margin: 0;
`;

export const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    align-items: flex-start;
  }
`;

export const YearToggle = styled.div`
  display: flex;
  background: #f1f3f5;
  padding: 4px;
  border-radius: 25px;
  gap: 4px;
`;

export const ToggleButton = styled.button`
  padding: 8px 18px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? '#ffffff' : 'transparent'};
  color: ${props => props.active ? '#3182f6' : '#4e5968'};
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    background: ${props => props.active ? '#ffffff' : '#e9ecef'};
  }
`;

export const TossSelect = styled.select`
  padding: 10px 44px 10px 24px;
  border-radius: 99px;
  border: 1px solid #e5e8eb;
  background: white;
  font-size: 15px;
  font-weight: 600;
  color: #191f28;
  cursor: pointer;
  outline: none;
  min-width: 140px;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234e5968' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
  background-size: 16px;

  &:hover {
    border-color: #3182f6;
    background-color: #f8f9fa;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const MyRecordButton = styled.button`
  padding: 10px 24px;
  border-radius: 99px;
  border: none;
  background: #3182f6;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.2);

  &:hover {
    background: #1b64da;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(49, 130, 246, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

/* --- Match Section --- */
export const MatchSection = styled.div`
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
  margin-bottom: 24px;
`;

export const MatchHeader = styled.div`
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f2f4f6;

  @media (max-width: 768px) {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
`;

export const DateBadge = styled.span`
  background: #f2f4f6;
  color: #4e5968;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
`;

export const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 20px;
  font-weight: 800;
  color: #191f28;

  .vs {
    color: #adb5bd;
    font-size: 14px;
    font-weight: 600;
  }

  .winner {
    color: #3182f6;
    margin-left: 8px;
    font-size: 14px;
  }

  &.vertical {
    flex-direction: column;
    gap: 8px;
  }

  @media (max-width: 768px) {
    font-size: 18px;
    gap: 12px;
  }
`;

/* --- Quarter Section --- */
export const QuarterSection = styled.div`
  border-bottom: 1px solid #f2f4f6;
  &:last-child {
    border-bottom: none;
  }
`;

export const QuarterHeader = styled.div`
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f9fafb;
  }

  .q-title {
    font-size: 16px;
    font-weight: 700;
    color: #333d4b;
  }

  .icons-container {
    display: flex;
    gap: 4px;
    margin-left: 12px;
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
  }
`;

export const QuarterContent = styled.div`
  padding: 0 32px 32px 32px;
  display: ${props => props.isOpen ? 'block' : 'none'};
  background: #fcfdfe;

  @media (max-width: 768px) {
    padding: 0 16px 20px 16px;
  }
`;

export const QuarterScoreBoard = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding: 24px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid #f2f4f6;

  .team-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;

    .team-name {
      font-size: 15px;
      font-weight: 700;
      color: #4e5968;
    }
    .score {
      font-size: 32px;
      font-weight: 900;
      color: #191f28;
    }
  }

  .vs-label {
    font-size: 14px;
    font-weight: 800;
    color: #adb5bd;
  }

  @media (max-width: 768px) {
    gap: 20px;
    .score {
      font-size: 24px;
    }
  }
`;

/* --- Football Field Layout --- */
export const FieldContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto 32px;
  position: relative;
  aspect-ratio: 3/2;

  @media (max-width: 768px) {
    aspect-ratio: 1/1.5;
  }
`;

export const FieldView = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #27ae60;
  background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 16px;
  padding: 8px;
  box-shadow: inset 0 0 40px rgba(0,0,0,0.1);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 8px; bottom: 8px; left: 8px; right: 8px;
    border: 2px solid rgba(255,255,255,0.5);
    border-radius: 8px;
    pointer-events: none;
  }

  .center-line {
    position: absolute;
    top: 0; left: 50%; width: 2px; height: 100%;
    background: rgba(255,255,255,0.5);
    transform: translateX(-50%);
  }

  .center-circle {
    position: absolute;
    top: 50%; left: 50%;
    width: 100px; height: 100px;
    border: 2px solid rgba(255,255,255,0.5);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
`;

/* --- Player Card --- */
export const PlayerCard = styled.div`
  position: absolute;
  width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 5;

  &:hover {
    transform: scale(1.1);
  }

  .avatar-wrap {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    padding: 0;
    box-shadow: none;
    overflow: visible;
    margin-bottom: 4px;
    display: flex;
    justify-content: center;
    align-items: flex-end;

    img {
      width: 100%; height: 100%; object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    }
  }

  .name {
    font-size: 11px;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    white-space: nowrap;
  }

  .stats-icons {
    position: absolute;
    top: -12px;
    right: -12px;
    display: flex;
    gap: 2px;
    font-size: 12px;
  }
`;

/* --- Teams & Stats List --- */
export const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const TeamCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #f2f4f6;

  h4 {
    font-size: 16px;
    font-weight: 800;
    color: #191f28;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const FormationBadge = styled.span`
  font-size: 12px;
  padding: 4px 8px;
  background: #f2f4f6;
  border-radius: 4px;
  color: #4e5968;
`;

export const StatSection = styled.div`
  margin-bottom: 24px;
`;

export const StatTitle = styled.h4`
  font-size: 16px;
  font-weight: 800;
  color: #191f28;
  margin-bottom: 16px;
`;

export const StatCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #f2f4f6;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .main-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .role {
      font-size: 12px;
      font-weight: 800;
      color: #3182f6;
      background: #eaf2ff;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .player-name {
      font-size: 15px;
      font-weight: 700;
      color: #333d4b;
    }
  }

  .partner-info {
    font-size: 13px;
    color: #8b95a1;
    font-weight: 500;
  }
`;

/* --- Pagination --- */
export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
`;

export const PaginationButton = styled.button`
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  border: none;
  background: ${props => props.active ? '#3182f6' : 'white'};
  color: ${props => props.active ? 'white' : '#4e5968'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#1b64da' : '#f2f4f6'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* --- Popup / Modal --- */
export const PopupOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

export const PopupContent = styled.div`
  background: white;
  width: 90%;
  max-width: 440px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
`;

export const PopupHeader = styled.div`
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f2f4f6;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #191f28;
  }
`;

export const PopupBody = styled.div`
  padding: 24px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  font-size: 16px;
  font-weight: 500;
  outline: none;
  margin-bottom: 24px;

  &:focus {
    border-color: #3182f6;
    background: white;
  }
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;
`;

export const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f2f4f6;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #4e5968;
  transition: all 0.2s;

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  &:has(input:checked) {
    background: #eaf2ff;
    color: #3182f6;
  }
`;

export const PopupFooter = styled.div`
  padding: 24px;
  display: flex;
  gap: 12px;
  border-top: 1px solid #f2f4f6;

  button {
    flex: 1;
    padding: 14px;
    border-radius: 12px;
    border: none;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }

  .cancel { background: #f2f4f6; color: #4e5968; }
  .confirm { background: #3182f6; color: white; }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #8b95a1;
  font-weight: 500;
`;
