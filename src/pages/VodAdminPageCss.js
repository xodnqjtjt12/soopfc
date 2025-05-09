import styled from 'styled-components';
export const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
`;

export const PageTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

export const Sidebar = styled.aside`
  width: 250px;
  background-color: #f4f4f4;
  padding: 20px;
`;

// 미디어 쿼리 브레이크포인트
const breakpoints = {
  mobile: '576px',
  tablet: '768px',
  desktop: '1024px'
};

// 관리자 컨테이너
export const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
  
  @media (max-width: ${breakpoints.tablet}) {
    padding: 15px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 10px;
  }
`;

// 관리자 페이지 헤더
export const AdminHeader = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #333;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  
  @media (max-width: ${breakpoints.tablet}) {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: 20px;
    margin-bottom: 15px;
    padding-bottom: 8px;
  }
`;

// 레이아웃 구성을 위한 그리드 섹션
export const TeamManagementGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  
  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: 280px 1fr;
    gap: 16px;
  }
  
  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

// 팀 설정 사이드바
export const TeamSettingsPanel = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  
  @media (max-width: ${breakpoints.tablet}) {
    padding: 15px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 12px;
  }
`;

// 패널 섹션 제목
export const PanelSectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: 16px;
    margin-bottom: 12px;
  }
`;

// 폼 그룹
export const FormGroup = styled.div`
  margin-bottom: 15px;
`;

// 라벨
export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #555;
`;

// 입력 필드
export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

// 선택 필드
export const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  background-color: white;
  transition: all 0.3s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

// 포메이션 선택기
export const FormationSelector = styled(Select)`
  width: 100%;
  margin-bottom: 16px;
  font-weight: 500;
`;

// 포메이션 미리보기
export const FormationPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #e6f4ff;
  border-radius: 6px;
  border: 1px solid #bcdcf7;
`;

export const FormationDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3498db;
  margin: 0 auto;
  display: ${props => props.visible ? 'block' : 'none'};
`;

// 버튼
export const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Noto Sans KR', sans-serif;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  &:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: none;
  }
`;

// 선수 풀 섹션
export const PlayerPoolSection = styled.div`
  margin-top: 24px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #fff;
  padding: 8px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`;

// 선수 풀 제목
export const PlayerPoolTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 6px;
  }
`;

// 필드 뷰 메인 컨테이너
export const FieldContainer = styled.div`
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  
  @media (max-width: ${breakpoints.tablet}) {
    padding: 16px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 12px;
  }
`;

// 필드 뷰 타이틀
export const FieldViewTitle = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  span {
    font-size: 16px;
    color: #666;
    background-color: #f0f0f0;
    padding: 4px 10px;
    border-radius: 16px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: 18px;
    margin-bottom: 16px;
    
    span {
      font-size: 14px;
    }
  }
`;

// 필드 뷰 (축구장)
export const FieldView = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 65%; /* 종횡비 유지 */
  background-color: #4caf50;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
  border: 4px solid #388e3c;
  
  /* 잔디 패턴 */
  background-image: linear-gradient(
    0deg,
    rgba(76, 175, 80, 0.8) 1px, 
    transparent 1px
  ),
  linear-gradient(
    90deg,
    rgba(76, 175, 80, 0.8) 1px,
    transparent 1px
  );
  background-size: 20px 20px;
  
  /* 필드 라인 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: rgba(255, 255, 255, 0.7);
    transform: translateY(-50%);
  }
  
  /* 센터 서클 */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 70px;
    height: 70px;
    border: 2px solid rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
`;

// 골 에어리어
export const GoalArea = styled.div`
  position: absolute;
  left: 50%;
  width: 100px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  transform: translateX(-50%);
  
  &.top {
    top: 0;
    border-top: none;
  }
  
  &.bottom {
    bottom: 0;
    border-bottom: none;
  }
`;

// 페널티 에어리어
export const PenaltyArea = styled.div`
  position: absolute;
  left: 50%;
  width: 180px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  transform: translateX(-50%);
  
  &.top {
    top: 0;
    border-top: none;
  }
  
  &.bottom {
    bottom: 0;
    border-bottom: none;
  }
`;

// 골 포스트
export const GoalPost = styled.div`
  position: absolute;
  left: 50%;
  width: 60px;
  height: 12px;
  background-color: #fff;
  transform: translateX(-50%);
  
  &.top {
    top: -6px;
  }
  
  &.bottom {
    bottom: -6px;
  }
`;

// 개선된 선수 카드
export const PlayerCard = styled.div`
  position: absolute;
  width: 80px;
  padding: 2px;
  background: ${props => props.isMyTeam ? 'linear-gradient(135deg, #3498db, #2980b9)' : 'linear-gradient(135deg, #e74c3c, #c0392b)'};
  border-radius: 6px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  cursor: grab;
  z-index: 2;
  transform: translate(-50%, -50%);
  transition: all 0.2s;
  user-select: none;
  
  ${({ position, formation }) => {
    // 포메이션에 따른 위치 계산
    // 여기서는 기본 4-4-2 포메이션을 기준으로 예시 작성
    const positionMap = {
      // 4-4-2 포메이션의 기본 위치
      '4-4-2': {
        'GK': 'top: 10%; left: 50%;',
        'LB': 'top: 25%; left: 20%;',
        'CB1': 'top: 25%; left: 40%;',
        'CB2': 'top: 25%; left: 60%;',
        'RB': 'top: 25%; left: 80%;',
        'LM': 'top: 50%; left: 20%;',
        'CM1': 'top: 50%; left: 40%;',
        'CM2': 'top: 50%; left: 60%;',
        'RM': 'top: 50%; left: 80%;',
        'ST1': 'top: 75%; left: 40%;',
        'ST2': 'top: 75%; left: 60%;',
      },
      // 4-3-3 포메이션의 기본 위치
      '4-3-3': {
        'GK': 'top: 10%; left: 50%;',
        'LB': 'top: 25%; left: 20%;',
        'CB1': 'top: 25%; left: 40%;',
        'CB2': 'top: 25%; left: 60%;',
        'RB': 'top: 25%; left: 80%;',
        'CM1': 'top: 50%; left: 30%;',
        'CM2': 'top: 50%; left: 50%;',
        'CM3': 'top: 50%; left: 70%;',
        'LW': 'top: 75%; left: 25%;',
        'ST': 'top: 75%; left: 50%;',
        'RW': 'top: 75%; left: 75%;',
      },
      // 3-5-2 포메이션의 기본 위치
      '3-5-2': {
        'GK': 'top: 10%; left: 50%;',
        'CB1': 'top: 25%; left: 30%;',
        'CB2': 'top: 25%; left: 50%;',
        'CB3': 'top: 25%; left: 70%;',
        'LWB': 'top: 40%; left: 15%;',
        'CM1': 'top: 50%; left: 30%;',
        'CM2': 'top: 50%; left: 50%;',
        'CM3': 'top: 50%; left: 70%;',
        'RWB': 'top: 40%; left: 85%;',
        'ST1': 'top: 75%; left: 40%;',
        'ST2': 'top: 75%; left: 60%;',
      },
    };
    
    // 선택된 포메이션에 맞는 위치 반환, 없으면 기본값 반환
    const formationPositions = positionMap[formation] || positionMap['4-4-2'];
    return formationPositions[position] || 'top: 50%; left: 50%;';
  }}
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25);
    z-index: 5;
  }
  
  &:active {
    cursor: grabbing;
    transform: translate(-50%, -50%) scale(1.02);
  }
  
  @media (max-width: ${breakpoints.tablet}) {
    width: 70px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    width: 60px;
  }
`;

// 선수 얼굴 이미지 컨테이너
export const PlayerImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2px;
  border: 2px solid #fff;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* 이미지가 없을 경우 보여줄 기본 아이콘 */
  &::before {
    content: '';
    width: 32px;
    height: 32px;
    background-color: #ddd;
    border-radius: 50%;
    display: ${props => props.hasImage ? 'none' : 'block'};
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    width: 32px;
    height: 32px;
  }
`;

// 선수 정보
export const PlayerInfo = styled.div`
  text-align: center;
  color: #fff;
  font-size: 11px;
  line-height: 1.2;
  padding: 2px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  
  .name {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 1px;
  }
  
  .position {
    font-size: 10px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    padding: 1px 3px;
    display: inline-block;
  }
  
  .rating {
    font-weight: 700;
    margin: 1px 0;
    font-size: 12px;
    color: #ffeb3b;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: 10px;
    
    .position {
      font-size: 9px;
    }
    
    .rating {
      font-size: 11px;
    }
  }
`;

// 선수 풀에서 보여주는 선수 아이템
export const PlayerPoolItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .player-img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #eee;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .player-info {
    flex: 1;
    
    .name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 2px;
    }
    
    .details {
      display: flex;
      font-size: 12px;
      color: #666;
      
      .position {
        margin-right: 8px;
        font-weight: 500;
        color: #3498db;
      }
      
      .rating {
        color: #e67e22;
        font-weight: 600;
      }
    }
  }
  
  .add-btn {
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 4px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #27ae60;
      transform: scale(1.05);
    }
    
    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
`;

// 팀 요약 정보
export const TeamSummary = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 24px;
  
  .summary-item {
    text-align: center;
    
    .value {
      font-size: 24px;
      font-weight: 700;
      color: #3498db;
      margin-bottom: 4px;
    }
    
    .label {
      font-size: 12px;
      color: #666;
    }
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 12px;
    
    .summary-item {
      .value {
        font-size: 20px;
      }
      
      .label {
        font-size: 11px;
      }
    }
  }
`;

// 이미지 (기본이미지) 및 타입 뱃지에 대한 스타일
export const Badge = styled.span`
  padding: 3px 6px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 10px;
  color: white;
  background-color: ${props => 
    props.type === 'vod' ? '#3498db' : 
    props.type === 'catch' ? '#2ecc71' : 
    props.type === 'shorts' ? '#f1c40f' : '#7f8c8d'};
  margin-left: 4px;
`;

// 저장 버튼
export const SaveButton = styled(Button)`
  background-color: #2ecc71;
  margin-top: 20px;
  
  &:hover {
    background-color: #27ae60;
  }
`;

// 오른쪽 도움말 패널
export const HelpPanel = styled.div`
  background-color: #fff7e6;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  border-left: 4px solid #ffb74d;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #ed6c02;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 6px;
    }
  }
  
  ul {
    padding-left: 20px;
    margin: 0;
    
    li {
      font-size: 14px;
      color: #666;
      margin-bottom: 6px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`;