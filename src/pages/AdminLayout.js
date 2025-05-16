import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';

const Layout = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.nav`
  width: 200px;
  background: #f8f9fa;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
`;

const Content = styled.main`
  flex: 1;
  padding: 20px;
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

export default function AdminLayout() {
  return (
    <Layout>
      <Sidebar>
        <h3>관리자 메뉴</h3>
        <StyledLink to="players">선수 관리</StyledLink>
        <StyledLink to="power-ranking">파워 랭킹</StyledLink>
        <StyledLink to="schedule">일정</StyledLink>
        <StyledLink to="vod">경기기록 관리</StyledLink>
        <StyledLink to="announcements">투표 관리</StyledLink>
        <StyledLink to="history">레거시 데이터 관리</StyledLink>
        <StyledLink to="live">라인업 관리</StyledLink> {/* 추가 */}
      </Sidebar>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
}