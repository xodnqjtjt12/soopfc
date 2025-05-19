
import React, { useState } from 'react';
import styled from 'styled-components';

// 스타일 컴포넌트 정의
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
`;

const Title = styled.h1`
  margin: 0 20px;
  font-size: 28px;
`;

const NavArrow = styled.div`
  cursor: pointer;
  font-size: 24px;
`;

const RecentButton = styled.div`
  position: absolute;
  right: 0;
  padding: 5px 10px;
  background-color: #f1f1f1;
  border-radius: 20px;
  border: 1px solid #ddd;
  font-size: 14px;
  cursor: pointer;
`;

const TabMenu = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
`;

const TabItem = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  text-align: center;
  flex: 1;
  border-bottom: 3px solid ${props => props.active ? '#4374D9' : 'transparent'};
  color: ${props => props.active ? '#4374D9' : '#333'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

const StatsContainer = styled.div`
  overflow-x: auto;
  white-space: nowrap;
  margin-bottom: 20px;
  padding-bottom: 10px;
`;

const StatsScroll = styled.div`
  display: flex;
  gap: 10px;
  min-width: 100%;
`;

const StatsCard = styled.div`
  flex: 0 0 250px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 15px;
  display: inline-block;
  
  @media (max-width: 768px) {
    flex: 0 0 80%;
  }
  
  @media (max-width: 480px) {
    flex: 0 0 90%;
  }
`;

const StatsTitle = styled.div`
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
`;

const RankingList = styled.div`
  margin-top: 10px;
`;

const RankingItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
`;

const Rank = styled.div`
  width: 25px;
  text-align: center;
  font-weight: bold;
`;

const Medal = styled.div`
  position: absolute;
  top: -5px;
  left: -5px;
  width: 30px;
  height: 30px;
  background-color: #FFD700;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  z-index: 1;
`;

const PlayerImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
`;

const PlayerInfo = styled.div`
  flex: 1;
`;

const PlayerName = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

const PlayerTeam = styled.div`
  font-size: 12px;
  color: #666;
`;

const PlayerStat = styled.div`
  font-weight: bold;
  color: #4374D9;
  font-size: 16px;
  text-align: right;
  width: 70px;
`;

const SeeMore = styled.div`
  text-align: center;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
`;

// 더미 데이터
const statsCategories = [
  {
    id: 'goals',
    title: '득점',
    unit: '골',
    players: [
      { rank: 1, name: '모하메드 살라', team: '리버풀', value: 28, img: '/api/placeholder/50/50' },
      { rank: 2, name: '알렉산더 이삭', team: '뉴캐슬 유나이티드', value: 23, img: '/api/placeholder/50/50' },
      { rank: 3, name: '엘링 홀란', team: '맨체스터 시티', value: 21, img: '/api/placeholder/50/50' },
      { rank: 4, name: '크리스 우드', team: '노팅엄 포레스트', value: 20, img: '/api/placeholder/50/50' }
    ]
  },
  {
    id: 'assists',
    title: '도움',
    unit: '개',
    players: [
      { rank: 1, name: '모하메드 살라', team: '리버풀', value: 18, img: '/api/placeholder/50/50' },
      { rank: 2, name: '제이콥 머피', team: '뉴캐슬 유나이티드', value: 12, img: '/api/placeholder/50/50' },
      { rank: 3, name: '안토니 엘랑가', team: '노팅엄 포레스트', value: 11, img: '/api/placeholder/50/50' },
      { rank: 4, name: '모건 로저스', team: '에버턴 탑차', value: 10, img: '/api/placeholder/50/50' }
    ]
  },
  {
    id: 'attackPoints',
    title: '공격포인트',
    unit: 'P',
    players: [
      { rank: 1, name: '모하메드 살라', team: '리버풀', value: 46, img: '/api/placeholder/50/50' },
      { rank: 2, name: '알렉산더 이삭', team: '뉴캐슬 유나이티드', value: 29, img: '/api/placeholder/50/50' },
      { rank: 3, name: '브라이언 음뷰모', team: '브렌트퍼드', value: 26, img: '/api/placeholder/50/50' },
      { rank: 4, name: '엘링 홀란', team: '맨체스터 시티', value: 24, img: '/api/placeholder/50/50' }
    ]
  },
  {
    id: 'xg',
    title: '기대 득점 (xG)',
    unit: '골',
    players: [
      { rank: 1, name: '모하메드 살라', team: '리버풀', value: 24.14, img: '/api/placeholder/50/50' },
      { rank: 2, name: '엘링 홀란', team: '맨체스터 시티', value: 20.93, img: '/api/placeholder/50/50' },
      { rank: 3, name: '알렉산더 이삭', team: '뉴캐슬 유나이티드', value: 20.27, img: '/api/placeholder/50/50' },
      { rank: 4, name: '유안 위사', team: '브렌트퍼드', value: 18.34, img: '/api/placeholder/50/50' }
    ]
  },
  {
    id: 'xa',
    title: '기대 도움 (xA)',
    unit: '개',
    players: [
      { rank: 1, name: '브라이언 음뷰모', team: '브렌트퍼드', value: 9.16, img: '/api/placeholder/50/50' },
      { rank: 2, name: '콜 머피', team: '첼시', value: 8.81, img: '/api/placeholder/50/50' },
      { rank: 3, name: '모하메드 살라', team: '리버풀', value: 8.57, img: '/api/placeholder/50/50' },
      { rank: 4, name: '브루노 페르난데스', team: '맨체스터 유나이티드', value: 7.44, img: '/api/placeholder/50/50' }
    ]
  },
  {
    id: 'cleanSheets',
    title: '클린시트',
    unit: '회',
    players: [
      { rank: 1, name: '알리송', team: '리버풀', value: 15, img: '/api/placeholder/50/50' },
      { rank: 2, name: '에데르송', team: '맨체스터 시티', value: 14, img: '/api/placeholder/50/50' },
      { rank: 3, name: '닉 포프', team: '뉴캐슬 유나이티드', value: 12, img: '/api/placeholder/50/50' },
      { rank: 4, name: '데이비드 라야', team: '아스널', value: 11, img: '/api/placeholder/50/50' }
    ]
  },
  {
    id: 'powerRanking',
    title: '파워랭킹',
    unit: '점',
    players: [
      { rank: 1, name: '모하메드 살라', team: '리버풀', value: 98, img: '/api/placeholder/50/50' },
      { rank: 2, name: '엘링 홀란', team: '맨체스터 시티', value: 92, img: '/api/placeholder/50/50' },
      { rank: 3, name: '필 포든', team: '맨체스터 시티', value: 89, img: '/api/placeholder/50/50' },
      { rank: 4, name: '부카요 사카', team: '아스널', value: 87, img: '/api/placeholder/50/50' }
    ]
  },
  {
    id: 'top3',
    title: 'TOP 3',
    unit: '회',
    players: [
      { rank: 1, name: '모하메드 살라', team: '리버풀', value: 15, img: '/api/placeholder/50/50' },
      { rank: 2, name: '엘링 홀란', team: '맨체스터 시티', value: 12, img: '/api/placeholder/50/50' },
      { rank: 3, name: '손흥민', team: '토트넘 홋스퍼', value: 10, img: '/api/placeholder/50/50' },
      { rank: 4, name: '브루노 페르난데스', team: '맨체스터 유나이티드', value: 9, img: '/api/placeholder/50/50' }
    ]
  },
  {
    id: 'top8',
    title: 'TOP 8',
    unit: '회',
    players: [
      { rank: 1, name: '모하메드 살라', team: '리버풀', value: 26, img: '/api/placeholder/50/50' },
      { rank: 2, name: '엘링 홀란', team: '맨체스터 시티', value: 23, img: '/api/placeholder/50/50' },
      { rank: 3, name: '필 포든', team: '맨체스터 시티', value: 22, img: '/api/placeholder/50/50' },
      { rank: 4, name: '데클란 라이스', team: '아스널', value: 20, img: '/api/placeholder/50/50' }
    ]
  },
  {
    id: 'appearances',
    title: '출장수',
    unit: '경기',
    players: [
      { rank: 1, name: '제임스 매디슨', team: '토트넘 홋스퍼', value: 38, img: '/api/placeholder/50/50' },
      { rank: 2, name: '손흥민', team: '토트넘 홋스퍼', value: 37, img: '/api/placeholder/50/50' },
      { rank: 3, name: '모하메드 살라', team: '리버풀', value: 36, img: '/api/placeholder/50/50' },
      { rank: 4, name: '알렉산더 이삭', team: '뉴캐슬 유나이티드', value: 36, img: '/api/placeholder/50/50' }
    ]
  }
];

// 컴포넌트 구현
const TOP = () => {
  const [activeTab, setActiveTab] = useState('선수 기록');
  
  const handleMoreClick = () => {
    alert('더 많은 순위를 볼 수 있는 기능이 추가될 예정입니다.');
  };
  
  const handleNavClick = () => {
    alert('다른 시즌으로 이동하는 기능이 추가될 예정입니다.');
  };
  
  return (
    <Container>
      <Header>
        <NavArrow onClick={handleNavClick}>&#10094;</NavArrow>
        <Title>2024-25</Title>
        <NavArrow onClick={handleNavClick}>&#10095;</NavArrow>
        <RecentButton>기록 안내</RecentButton>
      </Header>
      
      <TabMenu>
        <TabItem active={activeTab === '팀 순위'} onClick={() => setActiveTab('팀 순위')}>
          팀 순위
        </TabItem>
        <TabItem active={activeTab === '팀 기록'} onClick={() => setActiveTab('팀 기록')}>
          팀 기록
        </TabItem>
        <TabItem active={activeTab === '선수 기록'} onClick={() => setActiveTab('선수 기록')}>
          선수 기록
        </TabItem>
      </TabMenu>
      
      <StatsContainer>
        <StatsScroll>
          {statsCategories.map((category) => (
            <StatsCard key={category.id}>
              <StatsTitle>{category.title}</StatsTitle>
              <RankingList>
                {category.players.map((player) => (
                  <RankingItem key={`${category.id}-${player.rank}`}>
                    {player.rank === 1 && <Medal>1</Medal>}
                    <Rank>{player.rank}</Rank>
                    <PlayerImg src={player.img} alt={player.name} />
                    <PlayerInfo>
                      <PlayerName>{player.name}</PlayerName>
                      <PlayerTeam>{player.team}</PlayerTeam>
                    </PlayerInfo>
                    <PlayerStat>
                      {typeof player.value === 'number' && player.value % 1 !== 0
                        ? player.value.toFixed(2)
                        : player.value}
                      {category.unit}
                    </PlayerStat>
                  </RankingItem>
                ))}
              </RankingList>
              <SeeMore onClick={handleMoreClick}>더보기</SeeMore>
            </StatsCard>
          ))}
        </StatsScroll>
      </StatsContainer>
    </Container>
  );
};

export default TOP;