import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh; // Occupy significant vertical space
  width: 100%;
  padding: 40px;
  box-sizing: border-box;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #339af0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 24px;
`;

const Message = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  text-align: center;
  font-family: "Pretendard", sans-serif;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const messages = [
  '이누가 롱패스하는 중',
  '엘리오가 슈팅하는 중',
  '루카가 캐리하는 중',
  '랜디가 달리는 중',
  '란도가 드리블하는 중'
];

const LoadingScreen = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Pick a random message ensuring client-side consistency for this mount
    const randomIndex = Math.floor(Math.random() * messages.length);
    setMessage(messages[randomIndex]);
  }, []);

  return (
    <Container>
      <Message>{message}...</Message>
    </Container>
  );
};

export default LoadingScreen;
