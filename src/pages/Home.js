// pages/Home.js
import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to right, #007bff, #00c6ff);
  color: white;
  text-align: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 20px;
`;

const Subtitle = styled.h2`
  font-size: 24px;
  margin-bottom: 40px;
`;

const Button = styled.a`
  display: inline-block;
  padding: 15px 30px;
  font-size: 18px;
  color: white;
  background-color: #ff5722;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s;
  &:hover {
    background-color: #e64a19;
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      <Title>Welcome to SOOP FC</Title>
      <Subtitle>Your ultimate soccer management tool</Subtitle>
      <Button href="/top-goal-scorer">Get Started</Button>
    </HomeContainer>
  );
};

export default Home;
