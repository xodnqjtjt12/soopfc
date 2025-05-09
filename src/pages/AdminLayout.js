// src/pages/AdminLayout.js
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';

const Layout = styled.div`
  display: flex; height: 100vh;
`;

const Sidebar = styled.nav`
  width: 200px; background: #f8f9fa; padding: 20px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
`;

const Content = styled.main`
  flex: 1; padding: 20px;
`;

const StyledLink = styled(NavLink)`
  display: block; margin-bottom: 12px; text-decoration: none;
  color: #333;
  &.active { font-weight: bold; color: #007bff; } /* active 클래스 지원 :contentReference[oaicite:3]{index=3} */
`;

export default function AdminLayout() {
  return (
    <Layout>
      <Sidebar>
        <h3>관리자 메뉴</h3>
        <StyledLink to="players">선수 관리</StyledLink>         {/* /admin/players */}
        <StyledLink to="power-ranking">파워 랭킹</StyledLink>  {/* /admin/power-ranking */}
        <StyledLink to="schedule">일정</StyledLink>           {/* /admin/schedule */}
        <StyledLink to="vod">경기기록 관리</StyledLink> {/* /admin/vod-admin */}
      </Sidebar>
      <Content>
        <Outlet />  {/* 중첩된 Route 들이 이 위치에 렌더됩니다 :contentReference[oaicite:4]{index=4} */}
      </Content>
    </Layout>
  );
}
