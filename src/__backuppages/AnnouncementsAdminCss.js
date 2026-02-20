import styled, { css } from 'styled-components';

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
  GRAY: '#cccccc',
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

// 스타일드 컴포넌트
export const Container = styled.div`
  background: ${COLORS.WHITE};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: ${SPACING.LARGE} auto;
  max-width: 1200px;
  width: 100%;
  box-sizing: border-box;

  ${media.mobile`
    margin: ${SPACING.MEDIUM};
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
  overflow-x: auto;
  padding: ${SPACING.MEDIUM};

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
  }

  ${media.mobile`
    padding: ${SPACING.SMALL};
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
    padding: ${SPACING.XSMALL};
    font-size: ${FONT_SIZES.XXSMALL};
  `}
`;

export const VoteRow = styled.tr`
  &:hover {
    background: #f5f7fa;
  }
`;

export const VoteCell = styled.td`
  padding: ${SPACING.SMALL};
  border-bottom: 1px solid ${COLORS.BORDER};
  font-size: ${FONT_SIZES.XSMALL};
  color: ${COLORS.TEXT};

  ${media.mobile`
    padding: ${SPACING.XSMALL};
    font-size: ${FONT_SIZES.XXSMALL};
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

export const SummarySection = styled.div`
  padding: ${SPACING.MEDIUM};
  border-top: 1px solid ${COLORS.BORDER};
  background: ${COLORS.BACKGROUND};
  display: flex;
  justify-content: space-between;
  gap: ${SPACING.MEDIUM};

  ${media.mobile`
    flex-direction: column;
    padding: ${SPACING.SMALL};
    gap: ${SPACING.SMALL};
  `}
`;

export const TopThreeSection = styled.div`
  flex: 1;
  text-align: center;

  h3 {
    margin: 0 0 ${SPACING.SMALL};
    font-size: ${FONT_SIZES.MEDIUM};
    font-weight: 600;
    color: ${COLORS.TEXT};
  }

  ${media.mobile`
    h3 {
      font-size: ${FONT_SIZES.SMALL};
    }
  `}
`;

export const TopEightSection = styled.div`
  flex: 1;
  text-align: center;

  h3 {
    margin: 0 0 ${SPACING.SMALL};
    font-size: ${FONT_SIZES.MEDIUM};
    font-weight: 600;
    color: ${COLORS.TEXT};
  }

  ${media.mobile`
    h3 {
      font-size: ${FONT_SIZES.SMALL};
    }
  `}
`;

export const SummaryItem = styled.div`
  margin: ${SPACING.XSMALL} 0;
  font-size: ${FONT_SIZES.XSMALL};
  color: ${COLORS.TEXT};

  span.rank {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    border-radius: 50%;
    background: ${COLORS.PRIMARY};
    color: ${COLORS.WHITE};
    text-align: center;
    margin-right: ${SPACING.XSMALL};
    font-weight: 600;
  }

  ${media.mobile`
    font-size: ${FONT_SIZES.XXSMALL};
    span.rank {
      width: 20px;
      height: 20px;
      line-height: 20px;
      margin-right: 6px;
    }
  `}
`;

export const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  margin: ${SPACING.MEDIUM} auto;
  padding: 10px 20px;
  background: ${COLORS.PRIMARY};
  color: ${COLORS.WHITE};
  border: none;
  border-radius: 8px;
  font-size: ${FONT_SIZES.XSMALL};
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: ${COLORS.PRIMARY_HOVER};
  }

  svg {
    margin-right: ${SPACING.XSMALL};
    width: 16px;
    height: 16px;
  }

  ${media.mobile`
    padding: ${SPACING.XSMALL} ${SPACING.MEDIUM};
    font-size: ${FONT_SIZES.XXSMALL};
    svg {
      width: 14px;
      height: 14px;
    }
  `}
`;
export const Message = styled.div`
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  color: ${props => (props.error ? '#ff0000' : '#008000')};
  background-color: ${props => (props.error ? '#ffe6e6' : '#e6ffe6')};
`;

export const CopyMessage = styled.div`
  text-align: center;
  padding: ${SPACING.SMALL};
  color: ${COLORS.PRIMARY};
  font-size: ${FONT_SIZES.XSMALL};
  font-weight: 500;

  ${media.mobile`
    padding: 10px;
    font-size: ${FONT_SIZES.XXSMALL};
  `}
`;

export const VoteControlSection = styled.div`
  padding: ${SPACING.MEDIUM};
  border-top: 1px solid ${COLORS.BORDER};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.MEDIUM};
  background: ${COLORS.BACKGROUND};
`;

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.SMALL};
`;

export const DateTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.SMALL};
`;

export const DateTimeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.XSMALL};
`;

export const DateTimeSeparator = styled.span`
  font-size: ${FONT_SIZES.XSMALL};
  color: ${COLORS.TEXT};
`;

export const SwitchLabel = styled.div`
  font-size: ${FONT_SIZES.SMALL};
  font-weight: 600;
  color: ${COLORS.TEXT};
`;

export const DateTimeInput = styled.input`
  padding: ${SPACING.XSMALL};
  font-size: ${FONT_SIZES.XSMALL};
  border: 1px solid ${COLORS.BORDER};
  border-radius: 4px;
  outline: none;
  &:focus {
    border-color: ${COLORS.PRIMARY};
  }
  &:disabled {
    background-color: ${COLORS.BACKGROUND};
    cursor: not-allowed;
  }

  ${media.mobile`
    font-size: ${FONT_SIZES.XXSMALL};
    padding: 6px;
  `}
`;

export const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${COLORS.GRAY};
    transition: 0.4s;
    border-radius: 34px;
  }

  span:before {
    position: absolute;
    content: '';
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: ${COLORS.WHITE};
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + span {
    background-color: ${COLORS.PRIMARY};
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

export const StatusText = styled.div`
  font-size: ${FONT_SIZES.XSMALL};
  color: ${({ active }) => (active ? COLORS.PRIMARY : COLORS.ERROR)};
  font-weight: 500;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background-color: ${COLORS.WHITE};
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* 내용이 길어지면 스크롤 추가 */
  max-height: 80vh; /* 화면 높이의 80%로 최대 높이 제한 */

  ${media.mobile`
    padding: 15px;
    margin: 16px;
  `}
`;

export const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: ${SPACING.MEDIUM};
  color: ${COLORS.TEXT};
  font-size: ${FONT_SIZES.MEDIUM};
  text-align: center;
`;

export const ModalText = styled.p`
  margin-bottom: ${SPACING.LARGE};
  color: ${COLORS.TEXT};
  font-size: ${FONT_SIZES.SMALL};
  text-align: center;
`;

export const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${SPACING.MEDIUM};
`;

export const ModalButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: ${FONT_SIZES.XSMALL};
  font-weight: 600;
  cursor: pointer;
  background: ${({ primary }) => (primary ? COLORS.PRIMARY : '#f1f3f5')};
  color: ${({ primary }) => (primary ? COLORS.WHITE : COLORS.TEXT)};
  &:hover {
    background: ${({ primary }) => (primary ? COLORS.PRIMARY_HOVER : '#e9ecef')};
  }

  &:disabled {
    background: ${COLORS.GRAY};
    cursor: not-allowed;
  }
`;

export const PasswordModalInput = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid ${COLORS.BORDER};
  border-radius: 4px;
  font-size: ${FONT_SIZES.SMALL};

  &:focus {
    outline: none;
    border-color: ${COLORS.PRIMARY};
  }
`;

export const PasswordModalError = styled.div`
  color: ${COLORS.ERROR};
  font-size: ${FONT_SIZES.XSMALL};
  margin-bottom: 10px;
`;

export const VoteHistorySection = styled.div`
  padding: ${SPACING.MEDIUM};
  border-top: 1px solid ${COLORS.BORDER};
  background: ${COLORS.BACKGROUND};

  h3 {
    margin: 0 0 ${SPACING.SMALL};
    font-size: ${FONT_SIZES.MEDIUM};
    font-weight: 600;
    color: ${COLORS.TEXT};
    text-align: center;
  }

  ${media.mobile`
    padding: ${SPACING.SMALL};
    h3 {
      font-size: ${FONT_SIZES.SMALL};
    }
  `}
`;

export const HistoryTable = styled.div`
  overflow-x: auto;
  padding: ${SPACING.MEDIUM};

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
  }

  ${media.mobile`
    padding: ${SPACING.SMALL};
  `}
`;

export const ViewButton = styled.button`
  background-color: #4CAF50;
  color: ${COLORS.WHITE};
  padding: 4px 12px;
  border-radius: 4px;
  font-size: ${FONT_SIZES.XSMALL};
  margin-right: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: ${COLORS.GRAY};
    cursor: not-allowed;
  }
`;

export const CommentsSection = styled.div`
  margin-top: ${SPACING.LARGE};
`;

export const CommentsList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const CommentItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid ${COLORS.BORDER};
  font-size: ${FONT_SIZES.XSMALL};

  &:last-child {
    border-bottom: none;
  }

  strong {
    color: ${COLORS.TEXT};
  }
`;

export const DeleteButton = styled.button`
  padding: ${SPACING.XSMALL} ${SPACING.MEDIUM};
  background: ${COLORS.ERROR};
  color: ${COLORS.WHITE};
  border: none;
  border-radius: 8px;
  font-size: ${FONT_SIZES.XSMALL};
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: ${COLORS.ERROR_HOVER};
  }

  ${media.mobile`
    padding: 6px ${SPACING.SMALL};
    font-size: ${FONT_SIZES.XXSMALL};
  `}
`;


export const ExposeDateButton = styled.button`
  margin-left: 10px;
  padding: 8px 16px;
  background-color: #3182f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #1c6fef;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;
export const ExposedDatesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;
export const ExposedDatesList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px;
`;

export const ExposedDateItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

export const RemoveExposeDateButton = styled.button`
  margin-left: 10px;
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 16px;
`;


