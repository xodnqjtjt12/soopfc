import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../App';
import PlayerList from '../components/PlayerList';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const Message = styled.p`
  text-align: center;
  color: ${props => props.type === 'error' ? '#ff4d4d' : '#888'};
  font-size: 18px;
`;

const TopAssistProvider = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const q = query(collection(db, "players"), orderBy("assists", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        const playersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersData);
      } catch (error) {
        setError('도움 데이터를 불러오는 중에 오류가 발생했습니다.');
        console.error("Error fetching players: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  return (
    <Container>
      <Header>도움왕 TOP 10</Header>
      {loading && <Message>로딩 중...</Message>}
      {error && <Message type="error">{error}</Message>}
      {!loading && !error && <PlayerList players={players} statKey="assists" statName="도움" />}
    </Container>
  );
};

export default TopAssistProvider;
