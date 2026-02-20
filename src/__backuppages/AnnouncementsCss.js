import styled, { css, keyframes } from 'styled-components';

// 공통 스타일 상수
const COLORS = {
  PRIMARY: '#3182f6',
  PRIMARY_HOVER: '#1c6fef',
  ERROR: '#ff4757',
  ERROR_HOVER: '#e63950',
  TEXT: '#333d4b',
  SECONDARY: '#666',
  BORDER: '#e0e0e0',
  BACKGROUND: '#f9fafb',
  WHITE: '#ffffff',
};

const FONT_SIZES = {
  LARGE: '24px',
  MEDIUM: '18px',
  SMALL: '16px',
  XSMALL: '14px',
  XXSMALL: '12px',
};

const SPACING = {
  LARGE: '24px',
  MEDIUM: '16px',
  SMALL: '12px',
  XSMALL: '8px',
};

// 반응형 미디어 쿼리 헬퍼
const media = {
  mobile: (...args) => css`
    @media (max-width: 768px) {
      ${css(...args)}
    }
  `,
};

// 애니메이션
const fadeInScale = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;
const fallConfetti = keyframes`
  0% {
    transform: translateY(-50px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(1000px) rotate(720deg);
    opacity: 0;
  }
`;
// 체크 아이콘 그리기 애니메이션
const drawCheck = keyframes`
  0% {
    stroke-dashoffset: 100;
  }
  70% {
    stroke-dashoffset: 0;
    transform: scale(1);
  }
  80%, 90% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

// 원 그리기 애니메이션
const drawCircle = keyframes`
  0% {
    stroke-dashoffset: 320;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

export const Container = styled.div`
  background: ${COLORS.WHITE};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: ${SPACING.LARGE} auto;
  max-width: 1200px;
  width: 100%;
  box-sizing: border-box;

  ${media.mobile`
    margin: 8px 12px;
  `}
`;

export const Header = styled.div`
  background: ${COLORS.PRIMARY};
  color: ${COLORS.WHITE};
  padding: ${SPACING.MEDIUM};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  text-align: center;

  h2 {
    margin: 0;
    font-size: ${FONT_SIZES.LARGE};
    font-weight: 700;
  }

  p {
    margin: ${SPACING.XSMALL} 0 0;
    font-size: ${FONT_SIZES.XSMALL};
    opacity: 0.9;
  }

  ${media.mobile`
    padding: ${SPACING.SMALL};
    h2 {
      font-size: 20px;
    }
    p {
      font-size: ${FONT_SIZES.XXSMALL};
    }
  `}
`;

export const VoteTable = styled.div`
  padding: ${SPACING.MEDIUM};

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
  }

  ${media.mobile`
    padding: ${SPACING.SMALL};
    table {
      min-width: unset;
    }
    tbody {
      display: flex;
      flex-direction: column;
      gap: ${SPACING.SMALL};
    }
  `}
`;

export const VoteHeader = styled.th`
  padding: ${SPACING.SMALL};
  background: ${COLORS.BACKGROUND};
  color: ${COLORS.TEXT};
  font-weight: 600;
  font-size: ${FONT_SIZES.XSMALL};
  border-bottom: 2px solid ${COLORS.BORDER};
  text-align: left;

  ${media.mobile`
    display: none;
  `}
`;

export const VoteRow = styled.tr`
  &:hover {
    background: #f5f7fa;
  }

  ${media.mobile`
    display: flex;
    flex-direction: column;
    border: 1px solid ${COLORS.BORDER};
    border-radius: 8px;
    padding: ${SPACING.SMALL};
    background: ${COLORS.WHITE};
    &:hover {
      background: #f5f7fa;
    }
  `}
`;
export const CenteredTossButton = styled.button`
  padding: 12px 20px;
  background-color: #3182f6;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 100, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  max-width: 220px;
  width: 100%;
  text-align: center;

  /* 텍스트 밑줄 제거 */
  text-decoration: none;

  /* 버튼 가운데 정렬 */
  margin-left: auto;
  margin-right: auto;

  &:hover {
    background-color: #0052cc;
    box-shadow: 0 4px 12px rgba(0, 100, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    background-color: #004099;
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 100, 255, 0.3);
  }

  &:disabled {
    background-color: #b3d4ff;
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 14px;
    min-width: 120px;
    max-width: 180px;
  }
`;

export const VoteCell = styled.td`
  padding: ${SPACING.SMALL};
  border-bottom: 1px solid ${COLORS.BORDER};
  font-size: ${FONT_SIZES.XSMALL};
  color: ${COLORS.TEXT};

  ${media.mobile`
    border: none;
    padding: ${SPACING.XSMALL} 0;
    font-size: ${FONT_SIZES.XXSMALL};
    display: flex;
    justify-content: space-between;
  `}
`;

export const SelectedPlayerCell = styled(VoteCell)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const RemoveButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${COLORS.ERROR};
  color: ${COLORS.WHITE};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background: ${COLORS.ERROR_HOVER};
  }

  ${media.mobile`
    width: 20px;
    height: 20px;
    font-size: 14px;
  `}
`;

export const SearchContainer = styled.div`
  padding: ${SPACING.MEDIUM};
  position: relative;

  ${media.mobile`
    padding: ${SPACING.SMALL};
  `}
`;

export const SearchInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: ${SPACING.SMALL};
  border: 1px solid ${COLORS.BORDER};
  border-radius: 8px;
  font-size: ${FONT_SIZES.XSMALL};
  outline: none;

  &:focus {
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.1);
  }

  ${media.mobile`
    box-sizing: border-box;
    width: calc(100% - 32px);
    margin: 0 16px;
    padding: ${SPACING.XSMALL};
    font-size: ${FONT_SIZES.XXSMALL};
  `}
`;

export const SearchDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: ${SPACING.MEDIUM};
  right: ${SPACING.MEDIUM};
  background: ${COLORS.WHITE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
  z-index: 10;

  ${media.mobile`
    left: ${SPACING.SMALL};
    right: ${SPACING.SMALL};
  `}
`;

export const SearchItem = styled.div`
  padding: ${SPACING.SMALL};
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  &:hover {
    background: #f5f7fa;
  }
  &:last-child {
    border-bottom: none;
  }

  ${media.mobile`
    padding: ${SPACING.XSMALL};
  `}
`;

export const SubmitButton = styled.button`
  display: block;
  margin: ${SPACING.MEDIUM} auto;
  padding: ${SPACING.SMALL} ${SPACING.LARGE};
  background: ${COLORS.PRIMARY};
  color: ${COLORS.WHITE};
  border: none;
  border-radius: 8px;
  font-size: ${FONT_SIZES.SMALL};
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: ${COLORS.PRIMARY_HOVER};
  }
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }

  ${media.mobile`
    padding: ${SPACING.XSMALL} ${SPACING.MEDIUM};
    font-size: ${FONT_SIZES.XSMALL};
  `}
`;


export const SuccessMessage = styled.div`
  text-align: center;
  padding: ${SPACING.LARGE};
  color: ${COLORS.TEXT};
  font-size: ${FONT_SIZES.SMALL};
  animation: ${fadeInScale} 0.5s ease-out;

  svg {
    width: 48px;
    height: 48px;
    color: ${COLORS.PRIMARY};
    margin-bottom: ${SPACING.MEDIUM};
  }

  ${media.mobile`
    padding: ${SPACING.MEDIUM};
    font-size: ${FONT_SIZES.XSMALL};
    svg {
      width: 40px;
      height: 40px;
    }
  `}
`;

export const VoteEndedMessage = styled.div`
  text-align: center;
  padding: ${SPACING.LARGE};
  color: ${COLORS.ERROR};
  font-size: ${FONT_SIZES.SMALL};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${SPACING.MEDIUM};
  }

  ${media.mobile`
    padding: ${SPACING.MEDIUM};
    font-size: ${FONT_SIZES.XSMALL};
    svg {
      width: 40px;
      height: 40px;
    }
  `}
`;

export const NoData = styled.div`
  text-align: center;
  padding: ${SPACING.LARGE};
  color: ${COLORS.SECONDARY};
  font-size: ${FONT_SIZES.SMALL};

  ${media.mobile`
    padding: ${SPACING.MEDIUM};
    font-size: ${FONT_SIZES.XSMALL};
  `}
`;

export const Loading = styled.div`
  text-align: center;
  padding: ${SPACING.LARGE};
  color: ${COLORS.SECONDARY};
  font-size: ${FONT_SIZES.SMALL};

  ${media.mobile`
    padding: ${SPACING.MEDIUM};
    font-size: ${FONT_SIZES.XSMALL};
  `}
`;

export const ErrorMessage = styled.div`
  text-align: center;
  padding: ${SPACING.LARGE};
  color: ${COLORS.ERROR};
  font-size: ${FONT_SIZES.SMALL};

  ${media.mobile`
    padding: ${SPACING.MEDIUM};
    font-size: ${FONT_SIZES.XSMALL};
  `}
`;
export const CommentSection = styled.div`
  margin-top: 20px;
`;
export const CommentLabel = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  margin-left: 24px;
`;

export const CommentTextArea = styled.textarea`
  box-sizing: border-box;
  /* ✅ width를 전체에서 마진값을 뺀 값으로 줄임 */
  width: calc(100% - 48px); 
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  /* ✅ PC에서 양옆 마진 */
  margin: 0 24px 24px;

  @media (max-width: 768px) {
    /* ✅ 모바일에서는 여전히 마진 16px 기준으로 조정 */
    width: calc(100% - 32px);
    margin: 0 16px;
    padding: 8px;
    font-size: 13px;
    min-height: 80px;
  }
`;

// AnnouncementsAdminCss.js
export const CommentsSection = styled.div`
  margin-top: 20px;
`;

export const CommentsList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const CommentItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  strong {
    color: #1f2937;
  }
`;
export const AlertMessage = styled.div`
  position: fixed;
  top: ${SPACING.LARGE};
  left: 50%;
  transform: translateX(-50%);
  background: ${COLORS.ERROR};
  color: ${COLORS.WHITE};
  padding: ${SPACING.SMALL} ${SPACING.MEDIUM};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: ${FONT_SIZES.XSMALL};
  z-index: 1000;
  animation: ${fadeInScale} 0.3s ease-out;

  ${media.mobile`
    width: 80%;
    font-size: ${FONT_SIZES.XXSMALL};
    padding: ${SPACING.XSMALL} ${SPACING.SMALL};
  `}
`;
export const TeamCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  contain: layout;
  will-change: transform;
  @media (max-width: 640px) {
    margin-bottom: 16px;
  }
`;

export const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #f5f6f5;
  border-bottom: 1px solid #e8ecef;
`;

export const TeamColorDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => props.color || '#000000'};
`;

export const TeamName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

export const PlayerCount = styled.span`
  font-size: 12px;
  color: #637083;
`;

export const TableContainer = styled.div`
  overflow-x: auto;
  min-width: 100%;
  will-change: scroll-position;
`;

export const TeamPlayerRow = styled.tr`
  background-color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #f5f6f5;
  }
  &:active {
    background-color: #e8ecef;
  }
`;

export const PlayerNameCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #e8ecef;
`;

export const PositionCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #637083;
  border-bottom: 1px solid #e8ecef;
`;

export const CaptainTag = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #e8ecef;
  color: #3182f6;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
`;

export const TeamListTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 16px;
`;