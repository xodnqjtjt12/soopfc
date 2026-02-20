import styled, { keyframes, createGlobalStyle, css } from 'styled-components';

export const GlobalFontStyle = createGlobalStyle`
  @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  color: #333d4b;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 80px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

/* --- Header Section --- */
export const Header = styled.header`
  padding: 40px 0;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;

  h2 {
    font-size: 32px;
    font-weight: 800;
    color: #191f28;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 16px;
    color: #8b95a1;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    padding: 32px 0;
    h2 { font-size: 26px; }
    p { font-size: 14px; }
  }
`;

/* --- Search & Interaction --- */
export const InteractionSection = styled.div`
  max-width: 1000px; /* Widened further for better PC layout */
  margin: 0 auto 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  .search-icon {
    position: absolute;
    left: 20px;
    color: #adb5bd;
    z-index: 2;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 52px;
  font-size: 16px;
  border-radius: 99px;
  border: 1px solid #e9ecef;
  background-color: white;
  color: #333d4b;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);

  &:focus {
    outline: none;
    border-color: #3182f6;
    box-shadow: 0 0 0 4px rgba(49, 130, 246, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

export const SearchDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  max-height: 320px;
  overflow-y: auto;
  z-index: 100;
  padding: 8px;
  border: 1px solid #f1f3f5;
  animation: ${fadeIn} 0.2s ease-out;
`;

export const SearchItem = styled.div`
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: #f8f9fa;
  }

  .nick {
    font-weight: 600;
    color: #191f28;
  }

  .info {
    font-size: 13px;
    color: #8b95a1;
  }
`;

/* --- Voting Slots --- */
export const SlotsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

export const Slot = styled.div`
  flex: 1;
  aspect-ratio: 1/1.2;
  max-width: 140px;
  background: ${props => props.empty ? 'rgba(0,0,0,0.02)' : 'white'};
  border: ${props => props.empty ? '2px dashed #e9ecef' : '1px solid #f1f3f5'};
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: ${props => props.empty ? 'none' : '0 4px 12px rgba(0,0,0,0.04)'};
  animation: ${fadeIn} 0.4s ease-out;

  .rank {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 12px;
    font-weight: 800;
    color: #adb5bd;
  }
`;

export const SlotImage = styled.img`
  width: 70%;
  height: 60%;
  object-fit: contain;
  margin-bottom: 8px;
`;

export const SlotName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #191f28;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const RemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.4);
  z-index: 10;
  font-size: 16px;

  &:hover {
    transform: scale(1.1);
  }
`;

/* --- Teams & Players Grid --- */
export const TeamSectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #191f28;
  margin: 60px 0 24px;
  text-align: center;
`;

export const TeamCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
  border: 1px solid #f8f9fa;
`;

export const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f8f9fa;

  .team-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .team-dot {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .team-name {
    font-size: 18px;
    font-weight: 700;
    color: #191f28;
  }

  .player-count {
    font-size: 13px;
    color: #8b95a1;
    font-weight: 500;
  }
`;

export const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5 columns on PC */
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr); /* 3 columns on tablets */
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
    gap: 12px;
  }
`;

export const PlayerCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 16px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid transparent;

  &:hover {
    background: white;
    border-color: #e9ecef;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  }

  &.selected {
    background: #f0f7ff; /* Azure background for selected cards */
    border-color: #3182f6;
    box-shadow: 0 0 0 2px #3182f6;
    
    &:hover {
      border-color: #3182f6;
    }
  }
`;

export const PlayerImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 12px;
  background: #e5e8eb;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.02));

  @media (max-width: 480px) {
    /* Mobile image size inherit from container grid */
  }
`;

export const PlayerName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
  text-align: center;
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const PlayerPosition = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #8b95a1;
  text-transform: uppercase;
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

/* --- Comment & Submit --- */
export const CommentSection = styled.div`
  width: 100%;
  margin-top: 40px;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const CommentLabel = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #191f28;
  margin-bottom: 12px;
`;

export const CommentTextArea = styled.textarea`
  width: 100%;
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  font-size: 15px;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3182f6;
    box-shadow: 0 0 0 4px rgba(49, 130, 246, 0.1);
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 18px;
  background: #3182f6;
  color: white;
  border: none;
  border-radius: 99px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(49, 130, 246, 0.2);

  &:hover:not(:disabled) {
    background: #005ce6;
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(49, 130, 246, 0.3);
  }

  &:disabled {
    background: #e9ecef;
    color: #adb5bd;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const CenteredTossButton = styled.button`
  width: 100%;
  padding: 16px;
  background: white;
  color: #8b95a1;
  border: 1px solid #e9ecef;
  border-radius: 99px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #f8f9fa;
    color: #4e5968;
  }
`;

/* --- Status Messages --- */
export const SuccessMessage = styled.div`
  text-align: center;
  padding: 80px 0;
  animation: ${fadeIn} 0.6s ease-out;

  svg {
    width: 64px;
    height: 64px;
    color: #3182f6;
    margin-bottom: 24px;
  }

  h3 {
    font-size: 24px;
    font-weight: 800;
    color: #191f28;
    margin-bottom: 8px;
  }

  p {
    color: #8b95a1;
    margin-bottom: 32px;
  }
`;

export const VoteEndedMessage = styled(SuccessMessage)`
  svg { color: #ff4d4f; }
  h3 { color: #191f28; }
`;

export const NoData = styled(SuccessMessage)`
  svg { color: #adb5bd; }
`;

export const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #adb5bd;
  font-weight: 600;
`;

export const ErrorMessage = styled(SuccessMessage)`
  svg { color: #ff4d4f; }
`;

export const AlertMessage = styled.div`
  text-align: center;
  font-size: 14px;
  color: #e03131;
  margin-top: 8px;
  font-weight: 600;
  animation: ${slideIn} 0.3s ease-out;
`;