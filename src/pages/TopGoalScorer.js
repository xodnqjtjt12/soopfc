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

const TopGoalScorer = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const q = query(collection(db, "players"), orderBy("goals", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const playersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersData);
    };

    fetchPlayers();
  }, []);

  return (
    <Container>
      <Header>득점왕 TOP10</Header>
      <PlayerList players={players} statKey="goals" statName="골" />
    </Container>
  );
};

export default TopGoalScorer;

