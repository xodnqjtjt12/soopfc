import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import TopGoalScorer from './pages/TopGoalScorer';
import TopAssistProvider from './pages/TopAssistProvider';
import TopDefender from './pages/TopDefender';
import OverallRankings from './pages/OverallRankings';
import AdminPage from './pages/AdminPage'; // 관리자 페이지 추가
import Total from './pages/Total'; // 새 페이지 추가
import Home from './pages/Home'; // 홈 페이지 추가

import goalIcon from './icons/goal_icon.png';
import assistIcon from './icons/assist_icon.png';
import defenderIcon from './icons/defender_icon.png';
import trophyIcon from './icons/trophy_icon.png';

import Header from './components/Header'; // 헤더 컴포넌트 추가

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

const AppContainer = styled.div`
  padding-bottom: 60px; // Footer의 높이만큼 여백 추가
`;

const Footer = styled.footer`
  display: flex;
  justify-content: space-around;
  padding: 10px;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #fff;
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

const App = () => {
  return (
    <Router>
      <Header /> {/* 헤더 추가 */}
      <AppContainer>
        <Routes>
          {/* 경로를 명확하게 지정 */}
          <Route path="/" element={<Home />} exact /> {/* 홈 페이지 */}
          <Route path="/top-goal-scorer" element={<TopGoalScorer />} exact /> {/* 득점자 */}
          <Route path="/top-assists" element={<TopAssistProvider />} exact /> {/* 도움 */}
          <Route path="/top-defender" element={<TopDefender />} exact /> {/* 수비 */}
          <Route path="/overall-rankings" element={<OverallRankings />} exact /> {/* 전체 순위 */}
          <Route path="/admin" element={<AdminPage />} exact /> {/* 관리자 페이지 */}
          <Route path="/total" element={<Total />} exact /> {/* 통합 점수 */}
        </Routes>
        <Footer>
          <IconLink to="/top-goal-scorer"><Icon src={goalIcon} alt="Goal" /></IconLink>
          <IconLink to="/top-assists"><Icon src={assistIcon} alt="Assist" /></IconLink>
          <IconLink to="/top-defender"><Icon src={defenderIcon} alt="Defender" /></IconLink>
          <IconLink to="/overall-rankings"><Icon src={trophyIcon} alt="Trophy" /></IconLink>
        </Footer>
      </AppContainer>
    </Router>
  );
};

export default App;
