import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LoginOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoginCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 40px;
  border-radius: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: ${fadeIn} 0.6s ease-out;
  text-align: center;
`;

const LoginTitle = styled.h2`
  color: #191f28;
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 700;
`;

const LoginSubtitle = styled.p`
  color: #4e5968;
  margin-bottom: 32px;
  font-size: 14px;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
`;

const PasswordInput = styled.input`
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 44px;
  color: #191f28;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3182f6;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(49, 130, 246, 0.1);
  }
`;

const EyeButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #94a3b8;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  background: #3182f6;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(49, 130, 246, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 14px;
  margin-top: 12px;
  min-height: 20px;
`;

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
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 123, 255, 0.05);
  }

  &.active {
    font-weight: bold;
    color: #007bff;
    background: rgba(0, 123, 255, 0.1);
  }
`;

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'alves') {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginOverlay>
        <LoginCard>
          <LoginTitle>관리자 로그인</LoginTitle>
          <LoginSubtitle>계속하려면 비밀번호를 입력하세요</LoginSubtitle>
          <form onSubmit={handleLogin}>
            <InputGroup>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <PasswordInput
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="비밀번호"
                autoFocus
              />
              <EyeButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </EyeButton>
            </InputGroup>
            <LoginButton type="submit">로그인</LoginButton>
            <ErrorMessage>{error}</ErrorMessage>
          </form>
        </LoginCard>
      </LoginOverlay>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 140px)' }}>
      <Sidebar>
        <h3 style={{ marginBottom: '20px', paddingLeft: '12px', fontSize: '18px' }}>관리자 메뉴</h3>
        <StyledLink to="/admin/players">선수 관리</StyledLink>
        <StyledLink to="/admin/power-ranking">파워 랭킹</StyledLink>
        <StyledLink to="/admin/schedule">일정</StyledLink>
        <StyledLink to="/admin/vod">경기기록 관리</StyledLink>
        <StyledLink to="/admin/announcements">투표 관리</StyledLink>
        <StyledLink to="/admin/history">레거시 데이터 관리</StyledLink>
        <StyledLink to="/admin/live">라인업 관리</StyledLink>
        <StyledLink to="/admin/score">스코어 관리</StyledLink>
        <StyledLink to="/admin/player-month-award">이달의 선수상 관리</StyledLink>
        <StyledLink to="/admin/King">회장선출투표</StyledLink>
      </Sidebar>
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto', backgroundColor: '#fff' }}>
        {children}
      </main>
    </div>
  );
}
