import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const NavBar = styled.header`
  width: 100%;
  height: 77px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1200;
  background-color: #ffffff;
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  @media (max-width: 1024px) {
    height: 64px;
    padding: 0 16px;
  }
`;

const Logo = styled(Link)`
  width: 225px;
  height: 32px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #000;

  @media (max-width: 1024px) {
    width: 180px; /* Scale down for mobile */
  }

  @media (max-width: 380px) {
    width: 150px; /* Even smaller for very narrow devices */
  }
`;

const LogoImage = styled.img`
  width: 100%;
  height: auto;
`;

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  z-index: 1200;
  color: #4e5968;

  @media (max-width: 1024px) {
    display: block;
    padding: 8px;
    margin-right: -8px; /* Offset padding */
  }
`;

const NavMenu = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
  z-index: 1200;

  @media (max-width: 1024px) {
    display: ${({ open }) => (open ? 'flex' : 'none')};
    flex-direction: column;
    gap: 0;
    background-color: #ffffff;
    padding: 8px 0;
    position: absolute;
    top: 100%; 
    left: 0;
    right: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-top: 1px solid #f2f4f6;
  }
`;

const NavLinkStyled = styled(Link)`
  font-size: 15px;
  font-weight: 600;
  color: ${(props) => (props.active ? '#3182f6' : '#4e5968')};
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  &:hover {
    background-color: #f9fafb;
    color: #3182f6;
  }

  @media (max-width: 1024px) {
    font-size: 15px;
    padding: 16px 24px;
    justify-content: flex-start;
    border-radius: 0;
    
    background-color: ${(props) => (props.active ? '#f9fafb' : 'transparent')};
  }
`;

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <NavBar>
      <Logo to="/">
        <LogoImage src={`${process.env.PUBLIC_URL}/Logo.png`} alt="SOOP FC Logo" />
      </Logo>
      <Hamburger onClick={() => setMenuOpen(!menuOpen)}>☰</Hamburger>
      <NavMenu open={menuOpen}>
        <NavLinkStyled to="/top" onClick={handleNavClick} active={isActive('/top') ? 1 : 0}>
          통계
        </NavLinkStyled>
        <NavLinkStyled to="/record" onClick={handleNavClick} active={isActive('/record') ? 1 : 0}>
          명예의 전당
        </NavLinkStyled>
        <NavLinkStyled to="/vod" onClick={handleNavClick} active={isActive('/vod') ? 1 : 0}>
          주요 경기 기록
        </NavLinkStyled>
        <NavLinkStyled to="/total" onClick={handleNavClick} active={isActive('/total') ? 1 : 0}>
          내 스탯
        </NavLinkStyled>
        <NavLinkStyled to="/admin" onClick={handleNavClick} active={isActive('/admin') ? 1 : 0}>
          관리자 페이지
        </NavLinkStyled>
      </NavMenu>
    </NavBar>
  );
};

export default Header;