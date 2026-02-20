import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Top5Page = () => {
  const [rankings, setRankings] = useState({
    goalsTop5: [],
    gamesTop5: [],
    assistsTop5: [],
    attackPointsTop5: [],
    powerRankTop5: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch('http://localhost:5000/goalsTop5'), // 득점 Top 5
          fetch('http://localhost:5000/gamesTop5'), // 출석 Top 5
          fetch('http://localhost:5000/assistsTop5'), // 도움 Top 5
          fetch('http://localhost:5000/attackPointsTop5'), // 공격 포인트 Top 5
          fetch('http://localhost:5000/powerRankTop5') // 파워 랭크 Top 5
        ]);
  
        const data = await Promise.all(responses.map(response => response.json()));
        
        // 로그로 데이터를 확인해보세요
        console.log("Fetched Data:", data);
  
        setRankings({
          goalsTop5: data[0],
          gamesTop5: data[1],
          assistsTop5: data[2],
          attackPointsTop5: data[3],
          powerRankTop5: data[4]
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  return (
    <PageContainer>
      <h2>Top 5 Rankings</h2>

      {/* Goals Top 5 */}
      <RankingSection>
        <h3>Goals Top 5</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Goals</th>
            </tr>
          </thead>
          <tbody>
            {rankings.goalsTop5.map((player, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.goals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </RankingSection>

      {/* Games Top 5 */}
      <RankingSection>
        <h3>Games Top 5</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Games</th>
            </tr>
          </thead>
          <tbody>
            {rankings.gamesTop5.map((player, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.games}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </RankingSection>

      {/* Assists Top 5 */}
      <RankingSection>
        <h3>Assists Top 5</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Assists</th>
            </tr>
          </thead>
          <tbody>
            {rankings.assistsTop5.map((player, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.assists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </RankingSection>

      {/* Attack Points Top 5 */}
      <RankingSection>
        <h3>Attack Points Top 5</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Attack Points</th>
            </tr>
          </thead>
          <tbody>
            {rankings.attackPointsTop5.map((player, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.attackPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </RankingSection>

      {/* Power Rank Top 5 */}
      <RankingSection>
        <h3>Power Rank Top 5</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {rankings.powerRankTop5.map((player, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </RankingSection>
    </PageContainer>
  );
};

// 스타일링
const PageContainer = styled.div`
  padding: 20px;
  h2 {
    color: #61dafb;
    text-align: center;
  }
`;

const RankingSection = styled.div`
  margin: 20px 0;
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
  }
  th {
    background-color: #282c34;
    color: white;
  }
  td {
    background-color: #f9f9f9;
  }
`;

export default Top5Page;
