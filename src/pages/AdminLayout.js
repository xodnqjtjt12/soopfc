import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Sidebar = styled.nav`
  width: 200px;
  background: #f8f9fa;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  flex-shrink: 0;
`;

const StyledLink = styled(NavLink)`
  display: block;
  margin-bottom: 12px;
  text-decoration: none;
  color: #333;
  &.active {
    font-weight: bold;
    color: #007bff;
  }
`;

// {children}을 받아 렌더링하는 일반 래퍼 컴포넌트로 변경
export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 140px)' }}>
      <Sidebar>
        <h3>관리자 메뉴</h3>
        <StyledLink to="/admin/players">선수 관리</StyledLink>
        <StyledLink to="/admin/power-ranking">파워 랭킹</StyledLink>
        <StyledLink to="/admin/schedule">일정</StyledLink>
        <StyledLink to="/admin/vod">경기기록 관리</StyledLink>
        <StyledLink to="/admin/announcements">투표 관리</StyledLink>
        <StyledLink to="/admin/history">레거시 데이터 관리</StyledLink>
        <StyledLink to="/admin/live">라인업 관리</StyledLink>
        <StyledLink to="/admin/score">스코어 관리</StyledLink>
        <StyledLink to="/admin/player-month-award">이달의 선수상 관리</StyledLink>
      </Sidebar>
      <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
