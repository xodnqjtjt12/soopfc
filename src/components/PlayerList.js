import React from 'react';
import styled from 'styled-components';

const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
  background-color: ${props => {
    switch (props.rank) {
      case 1:
        return '#ffd700'; // Gold
      case 2:
        return '#c0c0c0'; // Silver
      case 3:
        return '#cd7f32'; // Bronze
      default:
        return 'transparent'; // Default background
    }
  }};
  border-radius: 8px;
  &:last-child {
    border-bottom: none;
  }
`;

const PlayerName = styled.span`
  font-weight: bold;
  color: #000; // Black color for player name
`;

const PlayerStat = styled.span`
  color: #000; // Black color for player stats
`;

const PlayerList = ({ players, statKey, statName }) => {
  // Sort players by the statKey value in descending order
  const sortedPlayers = [...players].sort((a, b) => b[statKey] - a[statKey]);

  // Assign ranks, handling ties
  let currentRank = 1;
  let lastStatValue = null;
  let rankCounter = 1;

  const rankedPlayers = sortedPlayers.map((player, index) => {
    if (player[statKey] !== lastStatValue) {
      currentRank = rankCounter;
    }
    lastStatValue = player[statKey];
    rankCounter++;
    
    return { ...player, rank: currentRank };
  });

  return (
    <List>
      {rankedPlayers.map((player) => (
        <ListItem key={player.id} rank={player.rank}>
          <PlayerName>{player.rank}. {player.name}</PlayerName>
          <PlayerStat>{player[statKey]} {statName}</PlayerStat>
        </ListItem>
      ))}
    </List>
  );
};

export default PlayerList;
