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
import Top from './pages/Top';
import Live from './pages/Live'; 
import LiveAdmin from './pages/LiveAdmin'; 
import Record from './pages/record';
import Score from './pages/Score';
import ScoreAdmin from './pages/ScoreAdmin';
import PlayerMonthAward from './pages/PlayerMonthAward';
import PlayerMonthAwardAdmin from './pages/PlayerMonthAwardAdmin';

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
  background-color: #ffffff;

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
          <Route path="/top" element={<Top />} />
          <Route path="/live" element={<Live />} /> 
          <Route path="/record" element={<Record />} />
          <Route path="/player-month-award" element={<PlayerMonthAward />} />
          <Route path="/score" element={<Score />} />

          {/* 관리 페이지 - 중첩 구조 제거 및 개별 라우트로 변경 */}
          <Route path="/admin" element={<AdminLayout><AdminPage /></AdminLayout>} />
          <Route path="/admin/players" element={<AdminLayout><AdminPage /></AdminLayout>} />
          <Route path="/admin/power-ranking" element={<AdminLayout><PowerRankingAdmin /></AdminLayout>} />
          <Route path="/admin/schedule" element={<AdminLayout><SchedulePage /></AdminLayout>} />
          <Route path="/admin/vod" element={<AdminLayout><VodAdminPage /></AdminLayout>} />
          <Route path="/admin/announcements" element={<AdminLayout><AnnouncementsAdmin /></AdminLayout>} />
          <Route path="/admin/history" element={<AdminLayout><PlayerHistorySectionAdmin /></AdminLayout>} />
          <Route path="/admin/live" element={<AdminLayout><LiveAdmin /></AdminLayout>} />
          <Route path="/admin/score" element={<AdminLayout><ScoreAdmin /></AdminLayout>} />
          <Route path="/admin/player-month-award" element={<AdminLayout><PlayerMonthAwardAdmin /></AdminLayout>} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;