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

// 새로 추가되는 페이지들
import King from './pages/King'                 // 회장 추천 페이지
import KingAdmin from './pages/KingAdmin'      // 회장 추천 홈 노출 관리 페이지

// Components
import Header from './components/Header';

// Firebase 설정 (당신의 실제 키 그대로)
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

          {/* 새로 추가: 26년 회장 추천 페이지 */}
          <Route path="/king" element={<King />} />

          {/* 관리 페이지 */}
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

          {/* 새로 추가: 26년 회장 추천 홈 노출 관리 페이지 */}
          <Route path="/admin/king" element={<AdminLayout><KingAdmin /></AdminLayout>} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;