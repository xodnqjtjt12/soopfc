import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Pages & Layout
import Home from './pages/Home';
import TopGoalScorer from './pages/TopGoalScorer';
import TopAssistProvider from './pages/TopAssistProvider';
import TopDefender from './pages/TopDefender';
import OverallRankings from './pages/OverallRankings';
import Total from './pages/Total';
import Announcements from './pages/Announcements';
import AdminLayout from './pages/AdminLayout';
import AdminPage from './pages/AdminPage';
import PowerRankingAdmin from './pages/PowerRankingAdmin';
import SchedulePage from './pages/SchedulePage';
import VodPage from './pages/VodPage';
import MomRanking from './pages/MomRanking';
import VodAdminPage from './pages/VodAdminPage';
import AnnouncementsAdmin from './pages/AnnouncementsAdmin';
import PlayerHistorySectionAdmin from './pages/PlayerHistorySectionAdmin';
import PlayerHistorySection from './pages/PlayerHistorySection';
 import Live from './pages/Live'; 
import LiveAdmin from './pages/LiveAdmin'; // 추가

// Components
import Header from './components/Header';

// Icons
import goalIcon from './icons/goal_icon.png';
import assistIcon from './icons/assist_icon.png';
import defenderIcon from './icons/defender_icon.png';
import trophyIcon from './icons/trophy_icon.png';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBscJpOCQgufKSiEahKFvv5lPpXN5Lpvc8",
  authDomain: "soccer-records.firebaseapp.com",
  projectId: "soccer-records",
  storageBucket: "soccer-records.appspot.com",
  messagingSenderId: "769257022634",
  appId: "1:769257022634:web:650d5d9c41b73933059cd3",
  measurementId: "G-NZLQDKS02C"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 스타일 컴포넌트
const AppContainer = styled.div`
  min-height: 100vh;
  padding: 140px 0 60px 0;
  background-color: #f9fafb;

  @media (max-width: 768px) {
    background-color: #ffffff;
   
  }
`;
const Footer = styled.footer`
  display: flex;
  justify-content: space-around;
  padding: 10px;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.1);
`;
const IconLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Icon = styled.img`
  width: 30px;
  height: 30px;
`;

function App() {
  return (
    <Router>
      <Header />
      <AppContainer>
        <Routes>
          {/* 메인 사이트 라우트 */}
          <Route path="/" element={<Home />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/top-goal-scorer" element={<TopGoalScorer />} />
          <Route path="/top-assists" element={<TopAssistProvider />} />
          <Route path="/top-defender" element={<TopDefender />} />
          <Route path="/overall-rankings" element={<OverallRankings />} />
          <Route path="/total" element={<Total />} />
          <Route path="/mom-ranking" element={<MomRanking />} />
          <Route path="/vod" element={<VodPage />} />
          <Route path="/player-history/:playerId" element={<PlayerHistorySection />} />
          <Route path="/live" element={<Live />} /> 추가

          {/* 관리 페이지 - 사이드바 + 자식 페이지들 */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPage />} />
            <Route path="players" element={<AdminPage />} />
            <Route path="power-ranking" element={<PowerRankingAdmin />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="vod" element={<VodAdminPage />} />
            <Route path="announcements" element={<AnnouncementsAdmin />} />
            <Route path="history" element={<PlayerHistorySectionAdmin />} />
            <Route path="live" element={<LiveAdmin />} /> {/* 추가 */}
          </Route>
        </Routes>
      </AppContainer>

      {/* 공통 Footer (하단 네비게이션) */}
      {/* <Footer>
        <IconLink to="/top-goal-scorer">
          <Icon src={goalIcon} alt="Goal Scorer" />
        </IconLink>
        <IconLink to="/top-assists">
          <Icon src={assistIcon} alt="Assist Provider" />
        </IconLink>
        <IconLink to="/top-defender">
          <Icon src={defenderIcon} alt="Top Defender" />
        </IconLink>
        <IconLink to="/overall-rankings">
          <Icon src={trophyIcon} alt="Overall Rankings" />
        </IconLink>
      </Footer> */}
    </Router>
  );
}

export default App;