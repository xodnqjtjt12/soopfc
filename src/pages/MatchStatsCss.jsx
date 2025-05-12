import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 15px 10px;
  }
`;

export const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 20px;
    text-align: center;
  }
`;

export const FilterBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const SelectWrapper = styled.div`
  select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: #fff;
    cursor: pointer;
  }
`;

export const MatchSection = styled.section`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

export const MatchHeader = styled.div`
  padding: 15px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  background-color: #3182f6;
  color: #fff;
  gap: 20px;
  border-radius: 8px 8px 0 0;

  .team-info {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 16px;
    flex-direction: column;
    gap: 10px;

    .team-info {
      width: 100%;
      flex-direction: column;
      gap: 8px;
    }
  }
`;

export const QuarterSection = styled.div`
  border-top: 1px solid #eee;

  &.open .QuarterHeader {
    border-bottom: 1px solid #ddd;
  }

  &.open .QuarterContent {
    display: block;
  }
`;

export const QuarterHeader = styled.div`
  padding: 15px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;

  &.open {
    background-color: #fff;
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 14px;
  }
`;

export const QuarterContent = styled.div`
  display: none;
  padding: 15px;

  &.open {
    display: block;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export const FieldContainer = styled.div`
  margin: 15px 0;
  position: relative;
  aspect-ratio: 3/2;

  @media (max-width: 768px) {
    margin: 10px 0;
    aspect-ratio: 1/2;
  }
`;

export const FieldView = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #22c55e;
  border-radius: 8px;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 80%;
    background-color: rgba(255, 255, 255, 0.8);
    transform: translate(-50%, -50%);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100%;
  }

  @media (max-width: 768px) {
    &:before {
      width: 80%;
      height: 2px;
      top: 50%;
      left: 50%;
      background-color: rgba(255, 255, 255, 1);
    }
  }
`;

export const GoalArea = styled.div`
  position: absolute;
  //   width: 100%;
  height: 20%;
  background-color: rgba(255, 255, 255, 0.2);

  &.top {
    top: 0;
  }

  &.bottom {
    bottom: 0;
  }

  @media (max-width: 768px) {
    &.top {
      top: 0;
      height: 5%;
    }

    &.bottom {
      bottom: 0;
      height: 5%;
    }
  }
`;

export const PenaltyArea = styled.div`
  position: absolute;
  //   width: 60%;
  height: 30%;
  //   border: 2px dashed rgba(255, 255, 255, 0.5);

  &.top {
    top: 10%;
    left: 20%;
  }

  &.bottom {
    bottom: 10%;
    right: 20%;
  }

  @media (max-width: 768px) {
    &.top {
      top: 5%;
      height: 10%;
      left: 20%;
    }

    &.bottom {
      bottom: 5%;
      height: 10%;
      right: 20%;
    }
  }
`;

export const GoalPost = styled.div`
  position: absolute;
  width: 2%;
  height: 10%;
  background-color: #fff;

  &.top {
    top: 0;
    left: 49%;
  }

  &.bottom {
    bottom: 0;
    right: 49%;
  }

  @media (max-width: 768px) {
    &.top {
      top: 0;
      left: 49%;
      height: 3%;
    }

    &.bottom {
      bottom: 0;
      right: 49%;
      height: 3%;
    }
  }
`;

export const PlayerCard = styled.div`
  position: absolute;
  width: 64px;
  height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  //   justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s;

  ${({ position }) =>
    position &&
    `
    top: ${position.top};
    left: ${position.left || "0"};
    ${position.transform ? `transform: ${position.transform};` : ""}
  `}

  .avatar {
    position: relative;
    display: inline-flex; /* inline-flex 로 변경 */
    align-items: center;
    justify-content: center;

    min-width: 40px; /* 최소 너비 유지 */
    height: 40px;
    padding: 0 6px; /* 좌우 여백 주기 */

    border-radius: 50%;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    flex-shrink: 0; /* 절대 축소되지 않게 */
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    white-space: nowrap; /* 한 줄로 유지 */
    overflow: hidden; /* 넘치는 텍스트 숨김 */
    text-overflow: ellipsis; /* 잘린 부분 … 처리 */

    font-size: 12px; /* 글자 크기 소폭 다운 */
    font-weight: 700;
    color: #fff;
    user-select: none;
  }
  .number {
    font-size: 16px;
    font-weight: 600;
  }

  .name {
    font-size: 14px;
    text-align: center;
    width: 100%;
  }

  @media (max-width: 768px) {
    width: 48px;
    height: 56px;

    .avatar {
      width: 32px;
      height: 32px;
    }

    .avatar-placeholder {
      font-size: 12px; /* 모바일에서 포지션 텍스트 크기 */
    }

    .number {
      font-size: 12px;
    }

    .name {
      font-size: 10px;
    }
  }
`;

export const PlayerImage = styled.div``;
export const PlayerInfo = styled.div``;

export const TeamsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin: 15px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    margin: 10px 0;
  }
`;

export const TeamCard = styled.div`
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export const TeamName = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    font-size: 16px;
    justify-content: center;
  }
`;

export const Formation = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 12px;
    text-align: center;
  }
`;

export const PlayersList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const PlayerItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 14px;

  .number {
    width: 30px;
    text-align: right;
    color: #888;
  }

  .name {
    flex: 1;
    margin-left: 10px;
  }

  .position {
    width: 80px;
    text-align: right;
    color: #888;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 4px 0;

    .number {
      width: 25px;
    }

    .name {
      margin-left: 8px;
    }

    .position {
      width: 60px;
    }
  }
`;

export const StatsList = styled.div`
  margin: 15px 0;

  @media (max-width: 768px) {
    margin: 10px 0;
  }
`;

export const StatTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 14px;
    text-align: center;
  }
`;

export const StatItem = styled.div`
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #eee;
  }

  @media (max-width: 768px) {
    padding: 8px;
    margin-bottom: 4px;
  }
`;

export const StatValue = styled.div`
  font-size: 14px;

  .goal-icon {
    margin-left: 5px;
    color: #e74c3c;
  }

  .assist-icon {
    margin-left: 5px;
    color: #f1c40f;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #666;
  padding: 20px;
`;

export const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 20px;
  svg {
    margin-bottom: 10px;
  }

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

export const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  background-color: #2ecc71;
  color: #fff;

  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 10px;
  }
`;

export const ScoreBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  .team {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;

    .name {
      min-width: 60px;
      padding: 5px 10px;
      background-color: #fff;
      border-radius: 4px;
    }

    .score-value {
      margin: 0 10px;
      font-weight: 700;
      font-size: 24px;
      color: #333;
    }
  }

  .separator {
    min-width: 20px;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 10px;
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #3182f6;
  color: #fff;
  font-size: 14px;
  border-radius: 0 0 8px 8px;

  @media (max-width: 768px) {
    padding: 10px;
    flex-direction: column;
    gap: 8px;
    text-align: center;
    font-size: 12px;
  }
`;
