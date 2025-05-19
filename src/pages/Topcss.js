import styled from 'styled-components';

export const Container = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 24px auto 0 auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);

  @media (max-width: 640px) {
    margin: -100px auto 0 auto;
  }
`;

export const Header = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
`;

export const Message = styled.p`
  text-align: center;
  color: ${(props) => (props.type === 'error' ? '#ff4d4d' : '#888')};
  font-size: 18px;
`;

export const PlayerListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 24px 24px;
  background-color: #ffffff;
`;

export const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: ${(props) => (props.isSearchResult ? '#ffffff' : '#ffffff')};
  border-radius: 10px;
  box-shadow: ${(props) => {
    if (props.isSearchResult) return '0 0 0 2px #3182f6, 0 8px 16px rgba(0, 0, 0, 0.08)';
    return props.isTopThree ? '0 8px 16px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.04)';
  }};
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }

  ${(props) =>
    props.isTopThree &&
    !props.isSearchResult &&
    `
    border-left: 4px solid ${props.rankColor};
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: ${(props) => (props.isTopThree && !props.isSearchResult ? props.rankColor : 'transparent')};
    opacity: ${(props) => (props.isTopThree && !props.isSearchResult ? 1 : 0)};
  }
`;

export const RankContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: ${(props) => {
    if (props.isSearchResult) return '#FF8A3D';
    return props.isTopThree ? props.rankColor : '#f0f0f0';
  }};
  color: ${(props) => (props.isTopThree || props.isSearchResult ? 'white' : '#666')};
  border-radius: 50%;
  font-weight: 700;
  font-size: ${(props) => (props.isTopThree || props.isSearchResult ? '18px' : '16px')};
  margin-right: 16px;
  box-shadow: ${(props) => (props.isTopThree || props.isSearchResult ? '0 4px 8px rgba(0, 0, 0, 0.12)' : 'none')};
`;

export const PlayerName = styled.div`
  flex: 1;
  font-size: 16px;
  font-weight: ${(props) => (props.isTopThree || props.isSearchResult ? '700' : '500')};
  color: #333;
`;

export const TeamName = styled.div`
  color: #888;
  font-size: 14px;
  margin-right: 16px;
`;

export const StatValue = styled.div`
  font-size: ${(props) => (props.isTopThree || props.isSearchResult ? '20px' : '18px')};
  font-weight: ${(props) => (props.isTopThree || props.isSearchResult ? '700' : '600')};
  color: ${(props) => {
    if (props.isSearchResult) return '#FF8A3D';
    return props.isTopThree ? props.rankColor : '#333';
  }};
  margin-left: 8px;
`;

export const StatLabel = styled.span`
  font-size: 14px;
  color: #888;
`;

export const SearchContainer = styled.div`
  margin: 24px 24px 20px;
  display: flex;
  gap: 10px;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 16px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3182f6;
    box-shadow: 0 0 0 2px rgba(255, 138, 61, 0.2);
  }
`;

export const SearchButton = styled.button`
  padding: 12px 24px;
  background-color: #3182f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  writing-mode: horizontal-tb;
  display: inline-block;

  &:hover {
    background-color: #3182f6;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    width: auto;
    padding: 12px 20px;
    font-size: 14px;
    white-space: nowrap;
    writing-mode: horizontal-tb;
  }
`;

export const Divider = styled.div`
  height: 1px;
  background-color: #eee;
  margin: 20px 0;
  width: 100%;
`;

export const SearchResultLabel = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
`;

export const PopupOverlay = styled.div`
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

export const PopupContent = styled.div`
  background-color: #ffffff;
  padding: 24px;
  border-radius: 12px;
  width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
`;

export const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const PopupTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #333;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #333;
  }
`;

export const PopupBody = styled.div`
  display: grid;
  gap: 12px;
`;

export const PopupStat = styled.div`
  font-size: 15px;
  color: #444;
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

export const PopupFooter = styled.div`
  margin-top: 20px;
  text-align: right;
`;

export const GradeButton = styled.button`
  padding: 10px 20px;
  background-color: #ff4d4d;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e04343;
  }
`;