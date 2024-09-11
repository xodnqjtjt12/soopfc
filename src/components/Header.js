// components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  padding: 10px;
  background-color: #007bff;
  color: white;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 10px;
  &:hover {
    text-decoration: underline;
  }
`;

const TitleLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 24px; // Adjust font size if needed
  font-weight: bold;
  &:hover {
    text-decoration: underline;
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <TitleLink to="/">SOOP FC</TitleLink>
      <div>
        <NavLink to="/top-goal-scorer">득점왕 TOP 10</NavLink>
        <NavLink to="/top-assists">도움왕 TOP 10</NavLink>
        <NavLink to="/top-defender">수비왕 TOP 10ss</NavLink>
        <NavLink to="/overall-rankings">근속왕 TOP 10</NavLink>
        <NavLink to="/total">내 스탯</NavLink> 
        <NavLink to="/admin">관리자 페이지</NavLink>
      </div>
    </HeaderContainer>
  );
};

export default Header;
