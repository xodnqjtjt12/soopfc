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
    padding: 10px 14px;
    border: 2px solid #0a5c36; /* 축구 잔디 색상 */
    border-radius: 30px; /* 축구공 형태 느낌의 둥근 모서리 */
    font-size: 15px;
    font-weight: 600;
    background-color: #fff;
    cursor: pointer;
    color: #222;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    width: 100%;
    max-width: 300px;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230a5c36' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 17px center;
    background-size: 16px;

    &:hover {
      border-color: #074027;
      background-color: #f8fff8;
    }

    &:focus {
      outline: none;
      border-color: #0a5c36;
      box-shadow: 0 0 0 3px rgba(10, 92, 54, 0.25);
    }
  }

  /* 모바일 반응형 스타일 */
  @media (max-width: 768px) {
    select {
      padding: 12px 16px;
      font-size: 16px; /* 모바일에서 더 큰 글씨 */
      width: 100%;
      max-width: 100%;
      background-position: right 16px center;
      background-size: 18px;
    }
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

  .score-info {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;

    &.vertical {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 16px;
    flex-direction: column;
    gap: 10px;

    .score-info {
      width: 100%;
      flex-direction: row; /* 2팀일 때 가로 유지 */
      gap: 8px;
      justify-content: center;

      &.vertical {
        flex-direction: column; /* 3팀 이상일 때 세로 */
        gap: 6px;
      }
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
  background-color: #1e4620; /* Solid green color for the field */
  border-radius: 8px;
  overflow: hidden;
  padding: 4px;
  box-sizing: border-box;

  /* 필드 내부 요소들 */
  .inner-field {
    position: relative;
    width: 100%;
    height: 100%;
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-sizing: border-box;
    z-index: 1;
  }

  /* 중앙선 */
  .center-line {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    transform: translateX(-50%);
  }

  /* 중앙 원 */
  .center-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120px;
    height: 120px;
    border: 3px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 1; /* Lower z-index to appear behind PlayerCard */
  }

  /* 중앙 점 */
  .center-spot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  /* 페널티 박스 - 왼쪽 */
  .penalty-box-left {
    position: absolute;
    top: 20%;
    left: 0;
    width: 16%;
    height: 60%;
    border-right: 2px solid rgba(255, 255, 255, 0.8);
    border-top: 2px solid rgba(255, 255, 255, 0.8);
    border-bottom: 2px solid rgba(255, 255, 255, 0.8);
  }

  /* 페널티 박스 - 오른쪽 */
  .penalty-box-right {
    position: absolute;
    top: 20%;
    right: 0;
    width: 16%;
    height: 60%;
    border-left: 2px solid rgba(255, 255, 255, 0.8);
    border-top: 2px solid rgba(255, 255, 255, 0.8);
    border-bottom: 2px solid rgba(255, 255, 255, 0.8);
  }

  /* 골 에어리어 - 왼쪽 */
  .goal-area-left {
    position: absolute;
    top: 35%;
    left: 0;
    width: 6%;
    height: 30%;
    border-right: 2px solid rgba(255, 255, 255, 0.8);
    border-top: 2px solid rgba(255, 255, 255, 0.8);
    border-bottom: 2px solid rgba(255, 255, 255, 0.8);
  }

  /* 골 에어리어 - 오른쪽 */
  .goal-area-right {
    position: absolute;
    top: 35%;
    right: 0;
    width: 6%;
    height: 30%;
    border-left: 2px solid rgba(255, 255, 255, 0.8);
    border-top: 2px solid rgba(255, 255, 255, 0.8);
    border-bottom: 2px solid rgba(255, 255, 255, 0.8);
  }

  /* 페널티 아크 - 왼쪽 */
  .penalty-arc-left {
    position: absolute;
    top: 50%;
    left: 16%;
    width: 30px;
    height: 30px;
    // border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
    transform: translate(-50%, -50%);
  }

  /* 페널티 아크 - 오른쪽 */
  .penalty-arc-right {
    position: absolute;
    top: 50%;
    right: 16%;
    width: 30px;
    height: 30px;
    // border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
    transform: translate(50%, -50%);
  }

  /* 페널티 스팟 - 왼쪽 */
  .penalty-spot-left {
    position: absolute;
    top: 50%;
    left: 12%;
    width: 4px;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  /* 페널티 스팟 - 오른쪽 */
  .penalty-spot-right {
    position: absolute;
    top: 50%;
    right: 12%;
    width: 4px;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }

  // /* 코너 아크 - 왼쪽 상단 */
  // .corner-arc-top-left {
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   width: 10px;
  //   height: 10px;
  //   border-right: 2px solid rgba(255, 255, 255, 0.8);
  //   border-bottom: 2px solid rgba(255, 255, 255, 0.8);
  //   border-radius: 0 0 10px 0;
  // }

  // /* 코너 아크 - 왼쪽 하단 */
  // .corner-arc-bottom-left {
  //   position: absolute;
  //   bottom: 0;
  //   left: 0;
  //   width: 10px;
  //   height: 10px;
  //   border-right: 2px solid rgba(255, 255, 255, 0.8);
  //   border-top: 2px solid rgba(255, 255, 255, 0.8);
  //   border-radius: 0 10px 0 0;
  // }

  // /* 코너 아크 - 오른쪽 상단 */
  // .corner-arc-top-right {
  //   position: absolute;
  //   top: 0;
  //   right: 0;
  //   width: 10px;
  //   height: 10px;
  //   border-left: 2px solid rgba(255, 255, 255, 0.8);
  //   border-bottom: 2px solid rgba(255, 255, 255, 0.8);
  //   border-radius: 0 0 0 10px;
  // }

  // /* 코너 아크 - 오른쪽 하단 */
  // .corner-arc-bottom-right {
  //   position: absolute;
  //   bottom: 0;
  //   right: 0;
  //   width: 10px;
  //   height: 10px;
  //   border-left: 2px solid rgba(255, 255, 255, 0.8);
  //   border-top: 2px solid rgba(255, 255, 255, 0.8);
  //   border-radius: 10px 0 0 0;
  // }

  /* 골대 - 왼쪽 */
  .goal-left {
    position: absolute;
    top: 42%;
    left: -10px;
    width: 12px;
    height: 16%;
    background-color: transparent;
    box-sizing: border-box;
    z-index: 2;
  }

  .goal-left:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: white;
  }

  .goal-left:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: white;
  }

  .goal-post-left-top {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 12px;
    background-color: white;
  }

  .goal-post-left-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 3px;
    height: 12px;
    background-color: white;
  }

  /* 골대 - 오른쪽 */
  .goal-right {
    position: absolute;
    top: 42%;
    right: -10px;
    width: 12px;
    height: 16%;
    background-color: transparent;
    box-sizing: border-box;
    z-index: 2;
  }

  .goal-right:before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 3px;
    background-color: white;
  }

  .goal-right:after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 3px;
    background-color: white;
  }

  .goal-post-right-top {
    position: absolute;
    top: 0;
    right: 0;
    width: 3px;
    height: 12px;
    background-color: white;
  }

  .goal-post-right-bottom {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 3px;
    height: 12px;
    background-color: white;
  }

  /* 그리드 레이아웃 */
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100%;
    position: relative;
    z-index: 2;
  }

  @media (max-width: 768px) {
    .center-line {
      width: 100%;
      height: 3px;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }

    .center-circle {
      width: 80px;
      height: 80px;
    }

    .penalty-box-left {
      top: 0;
      left: 20%;
      width: 60%;
      height: 16%;
      border-right: 2px solid rgba(255, 255, 255, 0.8);
      border-left: 2px solid rgba(255, 255, 255, 0.8);
      border-bottom: 2px solid rgba(255, 255, 255, 0.8);
      border-top: none;
    }

    .penalty-box-right {
      bottom: 0;
      top: auto;
      left: 20%;
      right: auto;
      width: 60%;
      height: 16%;
      border-right: 2px solid rgba(255, 255, 255, 0.8);
      border-left: 2px solid rgba(255, 255, 255, 0.8);
      border-top: 2px solid rgba(255, 255, 255, 0.8);
      border-bottom: none;
    }

    .goal-area-left {
      top: 0;
      left: 35%;
      width: 30%;
      height: 6%;
      border-right: 2px solid rgba(255, 255, 255, 0.8);
      border-left: 2px solid rgba(255, 255, 255, 0.8);
      border-bottom: 2px solid rgba(255, 255, 255, 0.8);
      border-top: none;
    }

    .goal-area-right {
      bottom: 0;
      top: auto;
      left: 35%;
      right: auto;
      width: 30%;
      height: 6%;
      border-right: 2px solid rgba(255, 255, 255, 0.8);
      border-left: 2px solid rgba(255, 255, 255, 0.8);
      border-top: 2px solid rgba(255, 255, 255, 0.8);
      border-bottom: none;
    }

    .penalty-spot-left {
      top: 12%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .penalty-spot-right {
      top: 88%;
      left: 50%;
      right: auto;
      transform: translate(-50%, -50%);
    }

    /* 골대 - 상단(모바일에서는 왼쪽 골대가 상단으로) */
    .goal-left {
      top: -10px;
      left: 42%;
      width: 16%;
      height: 12px;
    }

    .goal-left:before {
      width: 3px;
      height: 100%;
      top: 0;
      left: 0;
    }

    .goal-left:after {
      width: 3px;
      height: 100%;
      top: 0;
      right: 0;
      left: auto;
    }

    .goal-post-left-top {
      width: 12px;
      height: 3px;
      top: 0;
      left: 0;
    }

    .goal-post-left-bottom {
      width: 12px;
      height: 3px;
      top: 0;
      right: 0;
      left: auto;
      bottom: auto;
    }

    /* 골대 - 하단(모바일에서는 오른쪽 골대가 하단으로) */
    .goal-right {
      bottom: -10px;
      top: auto;
      left: 42%;
      right: auto;
      width: 16%;
      height: 12px;
    }

    .goal-right:before {
      width: 3px;
      height: 100%;
      bottom: 0;
      left: 0;
      top: auto;
      right: auto;
    }

    .goal-right:after {
      width: 3px;
      height: 100%;
      bottom: 0;
      right: 0;
      top: auto;
    }

    .goal-post-right-top {
      width: 12px;
      height: 3px;
      bottom: 0;
      left: 0;
      top: auto;
      right: auto;
    }

    .goal-post-right-bottom {
      width: 12px;
      height: 3px;
      bottom: 0;
      right: 0;
      top: auto;
    }
  }
`;
export const PenaltyArea = styled.div`
  position: absolute;
  height: 30%;

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
  // position: absolute;
  // width: 2%;
  // height: 10%;
  // background-color: #fff;

  // // &.top {
  // //   top: 0;
  // //   left: 49%;
  // // }

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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border-radius: 50%; /* 원형으로 변경 */
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    flex-shrink: 0;

    /* 축구 유니폼 느낌의 스트라이프 추가 */
    &::before {
      content: "";
      position: absolute;
      // top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.1) 5px,
        transparent 5px,
        transparent 10px
      );
      z-index: 1;
    }
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    z-index: 2;
    border-radius: 50%; /* 이미지도 원형으로 */
  }

  .avatar-placeholder {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    user-select: none;
    position: relative;
    z-index: 2;
  }

  .number {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #dc3545;
    color: #fff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #fff;
    z-index: 3;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .name {
    font-size: 12px;
    text-align: center;
    width: 100%;
    margin-top: 6px;
    text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    transform: scale(1.1);
    z-index: 10;

    .avatar {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  // /* 포지션별 색상 변경을 위한 클래스 (나중에 활용 가능) */
  // &.goalkeeper .avatar {
  //   background: #fd7e14; /* 골키퍼는 주황색 */
  // }

  // &.defender .avatar {
  //   background: #007bff; /* 수비수는 파란색 */
  // }

  // &.midfielder .avatar {
  //   background: #28a745; /* 미드필더는 초록색 */
  // }

  // &.forward .avatar {
  //   background: #dc3545; /* 공격수는 빨간색 */
  // }

  @media (max-width: 768px) {
    width: 48px;
    height: 60px;

    .avatar {
      width: 36px;
      height: 36px;
    }

    .avatar-placeholder {
      font-size: 10px;
    }

    .number {
      width: 16px;
      height: 16px;
      font-size: 10px;
      top: -4px;
      right: -4px;
    }

    .name {
      font-size: 10px;
      margin-top: 4px;
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
