import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NavBar = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 16px 24px;
  position: sticky; top: 0; z-index: 10;
  background-color: #ffffff;
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  width: 225px; height: 32px;
  display: flex; align-items: center;
  text-decoration: none; color: #000;
`;

const LogoImage = styled.img`
  width: 100%; height: auto;
`;

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
    margin-left: auto; /* Changed from 30px to auto to properly align on the right */
    margin-right: 45px; /* Added a margin-right to move it slightly left from the edge */
  }
`;

const NavMenu = styled.div`
  display: flex;
  gap: 24px;
  margin-left: auto;

  & > :last-child {
    margin-right: 72px;
  }
  @media (max-width: 768px) {
    display: ${({ open }) => (open ? 'flex' : 'none')};
    width: 100%; flex-direction: column; margin-top: 12px; gap: 12px;
  }
`;

const NavLinkStyled = styled(Link)`
  font-size: 16px; font-weight: 500; color: #4e5968;
  text-decoration: none; transition: color 0.2s ease;
  padding: 7px 26px;
  &:hover { color: #3182f6; }
  @media (max-width: 768px) { font-size: 14px; line-height: 1.4; }
`;

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // New handler to close menu when a link is clicked
  const handleNavClick = () => {
    setMenuOpen(false);
  };
  
  return (
    <NavBar>
      <Logo to="/"><LogoImage src={`${process.env.PUBLIC_URL}/Logo.png`} alt="SOOP FC Logo" /></Logo>
      <Hamburger onClick={() => setMenuOpen(!menuOpen)}>☰</Hamburger>
      <NavMenu open={menuOpen}>
        <NavLinkStyled to="/top-goal-scorer" onClick={handleNavClick}>득점왕 TOP10</NavLinkStyled>
        <NavLinkStyled to="/top-assists" onClick={handleNavClick}>도움왕 TOP10</NavLinkStyled>
        <NavLinkStyled to="/top-defender" onClick={handleNavClick}>수비왕 TOP10</NavLinkStyled>
        <NavLinkStyled to="/overall-rankings" onClick={handleNavClick}>출석왕 TOP10</NavLinkStyled>
        <NavLinkStyled to="/vod" onClick={handleNavClick}>VOD</NavLinkStyled>
        <NavLinkStyled to="/total" onClick={handleNavClick}>내 스탯</NavLinkStyled>
        <NavLinkStyled to="/admin" onClick={handleNavClick}>관리자 페이지</NavLinkStyled>
      </NavMenu>
    </NavBar>
  );
};

export default Header;