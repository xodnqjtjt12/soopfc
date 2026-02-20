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
  position: fixed;
  top: 0;
  z-index: 1200; /* TopPlayersContainer(z-index: 900)보다 높게 */
  background-color: #ffffff;
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  width: 225px;
  height: 32px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #000;
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
  z-index: 1200; /* 모바일에서 우선순위 보장 */

  @media (max-width: 1024px) {
    display: block;
    margin-left: auto;
    margin-right: 45px;
  }
`;

const NavMenu = styled.div`
  display: flex;
  gap: 24px;
  margin-left: auto;
  z-index: 1200; /* 모바일에서 메뉴 우선순위 보장 */

  & > :last-child {
    margin-right: 72px;
  }

  @media (max-width: 1024px) {
    display: ${({ open }) => (open ? 'flex' : 'none')};
    // width: 100%;
    flex-direction: column;
    margin-top: 12px;
    gap: 12px;
    background-color: #ffffff;
    padding: 12px 24px;
    position: absolute;
    top: 64px; /* NavBar 높이 고려 */
    left: 0;
    right: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const NavLinkStyled = styled(Link)`
  font-size: 16px;
  font-weight: 500;
  color: #4e5968;
  text-decoration: none;
  transition: color 0.2s ease;
  padding: 7px 26px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #3182f6;
  }

  > br {
    display: none;
  }

  @media (max-width: 1287px) {
    > br {
      display: block;
    }
  }

  @media (max-width: 1024px) {
    font-size: 14px;
    line-height: 1.4;
    display: block;
    > br {
      display: none;
    }
  }
`;

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <NavBar>
      <Logo to="/">
        <LogoImage src={`${process.env.PUBLIC_URL}/Logo.png`} alt="SOOP FC Logo" />
      </Logo>
      <Hamburger onClick={() => setMenuOpen(!menuOpen)}>☰</Hamburger>
      <NavMenu open={menuOpen}>
        <NavLinkStyled to="/top" onClick={handleNavClick}>
          Award<br />
        </NavLinkStyled>
          <NavLinkStyled to="/record" onClick={handleNavClick}>
          기록실<br />
        </NavLinkStyled>

            {/* <NavLinkStyled to="/top-goal-scorer" onClick={handleNavClick}>
          도움왕<br />TOP10
        </NavLinkStyled> */}
        {/* <NavLinkStyled to="/top-assists" onClick={handleNavClick}>
          도움왕<br />TOP10
        </NavLinkStyled> */}
        {/* <NavLinkStyled to="/top-defender" onClick={handleNavClick}>
          수비왕<br />TOP10
        </NavLinkStyled>
        <NavLinkStyled to="/overall-rankings" onClick={handleNavClick}>
          출석왕<br />TOP10
        </NavLinkStyled>
        <NavLinkStyled to="/mom-ranking" onClick={handleNavClick}>
          파워랭킹<br />TOP10
        </NavLinkStyled> */}
        {/* </NavLinkStyled> */}
        {/* <NavLinkStyled to="/player-month-award" onClick={handleNavClick}>
          이달의 선수
        </NavLinkStyled> */}
        <NavLinkStyled to="/vod" onClick={handleNavClick}>
          주요 경기 기록
        </NavLinkStyled>
        <NavLinkStyled to="/total" onClick={handleNavClick}>
          내 스탯
        </NavLinkStyled>
        {/* <NavLinkStyled to="/my" onClick={handleNavClick}>
          My<br />페이지
        </NavLinkStyled> */}
        <NavLinkStyled to="/admin" onClick={handleNavClick}>
          관리자<br />페이지
        </NavLinkStyled>
      </NavMenu>
    </NavBar>
  );
};

export default Header;