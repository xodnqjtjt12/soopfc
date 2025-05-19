import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import {
  Container,
  MainContent,
  PageTitle,
  MatchSection,
  MatchHeader,
  QuarterSection,
  QuarterHeader,
  QuarterContent,
  FieldContainer,
  FieldView,
  GoalArea,
  PenaltyArea,
  GoalPost,
  PlayerCard,
  TeamsContainer,
  TeamCard,
  TeamName,
  Formation,
  PlayersList,
  PlayerItem,
  StatsList,
  StatItem,
  StatTitle,
  StatValue,
  LoadingIndicator,
  EmptyState,
  Badge,
  ScoreBox,
  TossButton,
  TossSelect,
  FilterBarWrapper,
  PaginationWrapper,
  PaginationButton,
  PopupOverlay,
  PopupContent,
  PopupHeader,
  PopupTitle,
  CloseButton,
  PopupBody,
  PopupStat,
  PopupFooter,
  GradeButton,
} from './MatchStatsCss';

// Modal styles
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  input: {
    padding: '8px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  button: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  searchButton: {
    backgroundColor: '#3182f6',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    color: '#333',
  },
};

// Position mirror map
const MIRROR_POSITION = {
  LB: 'RB', RB: 'LB',
  LW: 'RW', RW: 'LW',
  LWB: 'RWB', RWB: 'LWB',
  LM: 'RM', RM: 'LM'
};

// Chevron Icon
const ChevronIcon = ({ isOpen }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// Format date
const formatDate = dateString => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`;
};

// Formation positions
const FORMATIONS = {
  '4-3-3': {
    desktop: [
      { position: 'GK', left: '1%', top: '47%' },
      { position: 'RB', left: '20%', top: '90%' },
      { position: 'CB1', left: '20%', top: '40%' },
      { position: 'CB2', left: '20%', top: '60%' },
      { position: 'LB', left: '20%', top: '10%' },
      { position: 'CM1', left: '50%', top: '30%' },
      { position: 'CM2', left: '50%', top: '50%' },
      { position: 'CM3', left: '50%', top: '70%' },
      { position: 'RW', left: '79%', top: '80%' },
      { position: 'ST', left: '79%', top: '47%' },
      { position: 'LW', left: '79%', top: '20%' },
    ],
    mobile: [
      { position: 'GK', top: '0%', left: '50%', transform: 'translate(-50%, 0)' },
      { position: 'RB', top: '10%', left: '14%' },
      { position: 'CB1', top: '10%', left: '34%' },
      { position: 'CB2', top: '10%', left: '54%' },
      { position: 'LB', top: '10%', left: '74%' },
      { position: 'CM1', top: '23%', left: '24%' },
      { position: 'CM2', top: '23%', left: '44%' },
      { position: 'CM3', top: '23%', left: '64%' },
      { position: 'RW', top: '38%', left: '14%' },
      { position: 'ST', top: '38%', left: '44%' },
      { position: 'LW', top: '38%', left: '74%' },
    ],
  },
  '4-4-2': {
    desktop: [
      { position: 'GK', left: '0%', top: '50%' },
      { position: 'RB', left: '20%', top: '80%' },
      { position: 'CB1', left: '20%', top: '40%' },
      { position: 'CB2', left: '20%', top: '60%' },
      { position: 'LB', left: '20%', top: '20%' },
      { position: 'RM', left: '50%', top: '80%' },
      { position: 'CM1', left: '50%', top: '40%' },
      { position: 'CM2', left: '50%', top: '60%' },
      { position: 'LM', left: '50%', top: '20%' },
      { position: 'ST1', left: '70%', top: '40%' },
      { position: 'ST2', left: '70%', top: '60%' },
    ],
    mobile: [
      { position: 'GK', top: '5%', left: '50%', transform: 'translate(-50%, 0)' },
      { position: 'RB', top: '20%', left: '14%' },
      { position: 'CB1', top: '20%', left: '34%' },
      { position: 'CB2', top: '20%', left: '54%' },
      { position: 'LB', top: '20%', left: '74%' },
      { position: 'RM', top: '35%', left: '14%' },
      { position: 'CM1', top: '35%', left: '34%' },
      { position: 'CM2', top: '35%', left: '54%' },
      { position: 'LM', top: '35%', left: '74%' },
      { position: 'ST1', top: '48%', left: '34%' },
      { position: 'ST2', top: '48%', left: '54%' },
    ],
  },
  '3-5-2': {
    desktop: [
      { position: 'GK', left: '5%', top: '50%' },
      { position: 'CB1', left: '10%', top: '30%' },
      { position: 'CB2', left: '10%', top: '50%' },
      { position: 'CB3', left: '10%', top: '70%' },
      { position: 'RWB', left: '35%', top: '15%' },
      { position: 'CM1', left: '40%', top: '35%' },
      { position: 'CM2', left: '40%', top: '50%' },
      { position: 'CM3', left: '40%', top: '65%' },
      { position: 'LWB', left: '35%', top: '85%' },
      { position: 'ST1', left: '70%', top: '40%' },
      { position: 'ST2', left: '70%', top: '60%' },
    ],
    mobile: [
      { position: 'GK', top: '5%', left: '50%', transform: 'translate(-50%, 0)' },
      { position: 'CB1', top: '20%', left: '24%' },
      { position: 'CB2', top: '20%', left: '44%' },
      { position: 'CB3', top: '20%', left: '64%' },
      { position: 'RWB', top: '35%', left: '9%' },
      { position: 'CM1', top: '35%', left: '29%' },
      { position: 'CM2', top: '35%', left: '44%' },
      { position: 'CM3', top: '35%', left: '59%' },
      { position: 'LWB', top: '35%', left: '79%' },
      { position: 'ST1', top: '48%', left: '34%' },
      { position: 'ST2', top: '48%', left: '54%' },
    ],
  },
  '4-2-3-1': {
    desktop: [
      { position: 'GK', left: '0%', top: '47%' },
      { position: 'RB', left: '20%', top: '84%' },
      { position: 'CB1', left: '20%', top: '35%' },
      { position: 'CB2', left: '20%', top: '55%' },
      { position: 'LB', left: '20%', top: '9%' },
      { position: 'CDM1', left: '35%', top: '35%' },
      { position: 'CDM2', left: '35%', top: '55%' },
      { position: 'RW', left: '60%', top: '80%' },
      { position: 'CAM', left: '60%', top: '47%' },
      { position: 'LW', left: '60%', top: '20%' },
      { position: 'ST', left: '79%', top: '47%' },
    ],
    mobile: [
      { position: 'GK', top: '0%', left: '50%', transform: 'translate(-50%, 0)' },
      { position: 'RB', top: '10%', left: '14%' },
      { position: 'CB1', top: '10%', left: '34%' },
      { position: 'CB2', top: '10%', left: '54%' },
      { position: 'LB', top: '10%', left: '74%' },
      { position: 'CDM1', top: '20%', left: '35%' },
      { position: 'CDM2', top: '20%', left: '54%' },
      { position: 'RW', top: '28%', left: '14%' },
      { position: 'CAM', top: '28%', left: '44%' },
      { position: 'LW', top: '28%', left: '74%' },
      { position: 'ST', top: '38%', left: '44%' },
    ],
  },
};

// Get formation positions
const getFormationPositions = (formation, isMobile) =>
  FORMATIONS[formation]?.[isMobile ? 'mobile' : 'desktop'] || FORMATIONS['4-3-3'][isMobile ? 'mobile' : 'desktop'];

// Render formation
const renderFormation = (team, isHomeTeam, isMobile, highlightedPlayer, highlightPlayer, side, goalAssistPairs, ownGoals = [], handlePlayerClick) => {
  if (!team?.players?.length) return (
    <div className="absolute inset-0 flex items-center justify-center text-white">
      {isHomeTeam ? '홈' : '어웨이'} 팀 선수 데이터 없음
    </div>
  );

  const positions = getFormationPositions(team.formation, isMobile).map(pos => {
    const newPos = { ...pos };
    if (!isMobile) {
      const leftValue = parseFloat(newPos.left) || 0;
      if (isHomeTeam) {
        newPos.left = `${Math.min(leftValue * 0.5, 48)}%`;
      } else {
        const reversedLeft = 100 - leftValue;
        newPos.left = leftValue === 5 ? '89%' : `${50 + (reversedLeft * 0.35)}%`;
      }
      if (!isHomeTeam && newPos.position === 'GK') {
        newPos.top = '47%';
        newPos.left = '93%';
      }
      if (!isHomeTeam) {
        if (newPos.position === 'GK') {
          newPos.top = '47%';
          newPos.left = '94%';
        }
        if (newPos.position.startsWith('CB1')) {
          newPos.top = '35%';
          newPos.left = '85%';
        }
        if (newPos.position.startsWith('CB2')) {
          newPos.top = '55%';
          newPos.left = '85%';
        }
        if (newPos.position.startsWith('CDM1')) {
          newPos.top = '55%';
          newPos.left = '77%';
        }
        if (newPos.position.startsWith('CDM2')) {
          newPos.top = '35%';
          newPos.left = '77%';
        }
        if (newPos.position.startsWith('LB')) {
          newPos.top = '8%';
          newPos.left = '85%';
        }
        if (newPos.position.startsWith('RB')) {
          newPos.top = '85%';
          newPos.left = '85%';
        }
        if (newPos.position.startsWith('CAM')) {
          newPos.top = '47%';
          newPos.left = '67%';
        }
        if (newPos.position.startsWith('RW')) {
          newPos.top = '80%';
          newPos.left = '67%';
        }
        if (newPos.position.startsWith('LW')) {
          newPos.top = '20%';
          newPos.left = '67%';
        }
        if (newPos.position.startsWith('ST')) {
          newPos.top = '47%';
          newPos.left = '55%';
        }
        if (newPos.position.startsWith('ST1')) {
          newPos.top = '35%';
          newPos.left = '55%';
        }
        if (newPos.position.startsWith('ST2')) {
          newPos.top = '60%';
          newPos.left = '55%';
        }
      }
    } else {
      if (!isHomeTeam) {
        if (newPos.position === 'GK') newPos.top = '92%';
        else if (newPos.position.includes('CB') || newPos.position.includes('RB') || newPos.position.includes('LB'))
          newPos.top = '85%';
        else if (newPos.position.includes('CM') || newPos.position.includes('RM') || newPos.position.includes('LM'))
          newPos.top = '70%';
        else if (newPos.position.includes('CDM1') || newPos.position.includes('CDM2'))
          newPos.top = '74%';
        else if (newPos.position.includes('CAM'))
          newPos.top = '65%';
        else if (newPos.position.includes('ST') || newPos.position.includes('RW') || newPos.position.includes('LW'))
          newPos.top = '56%';
        else if (newPos.position === 'CAM') newPos.top = '63%';
        else if (newPos.position.includes('CDM')) newPos.top = '71%';
        else if (newPos.position === 'RWB' || newPos.position === 'LWB') newPos.top = '70%';
      }
    }
    if (!isHomeTeam) {
      newPos.position = MIRROR_POSITION[newPos.position] || newPos.position;
    }
    return newPos;
  });

  return team.players.map((player, i) => {
    const pos = positions.find(p => p.position === player.position) || positions[i % positions.length];
    const goals = goalAssistPairs?.filter(g => g.goal.player === player.name).length || 0;
    const assists = goalAssistPairs?.filter(a => a.assist.player === player.name).length || 0;
    const ownGoalsCount = ownGoals?.filter(og => og.player === player.name).length || 0;

    return (
      <PlayerCard
        key={`${side}-${i}`}
        style={{ left: pos.left, top: pos.top, transform: pos.transform }}
        highlighted={highlightedPlayer?.name === player.name}
        highlightType={highlightedPlayer?.type}
        onClick={() => handlePlayerClick(player, goalAssistPairs, ownGoals)}
      >
        <div className="avatar">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt={player.name} />
          ) : (
            <div className="avatar-placeholder">{player.position}</div>
          )}
        </div>
        <div className="playerInfo">
          <span className="number">{player.backNumber}</span>
          <span className="name" title={player.name}>{player.name}</span>
        </div>
        <div className="stats">
          {goals > 0 && <span className="goal-icon">⚽{goals}</span>}
          {assists > 0 && <span className="assist-icon">👟{assists}</span>}
          {ownGoalsCount > 0 && <span className="own-goal-icon">🥅{ownGoalsCount}</span>}
        </div>
      </PlayerCard>
    );
  });
};

// DesktopFormation
const DesktopFormation = ({ teams, highlightedPlayer, highlightPlayer, goalAssistPairs, ownGoals = [], handlePlayerClick }) => {
  if (!teams || teams.length < 2) {
    return <div className="w-full h-full flex items-center justify-center text-white">팀 데이터 부족</div>;
  }
  return (
    <div className="w-full h-full grid grid-cols-2 relative">
      <div className="relative border-r border-white border-opacity-50">
        {renderFormation(teams[0], true, false, highlightedPlayer, highlightPlayer, 'home', goalAssistPairs, ownGoals, handlePlayerClick)}
      </div>
      <div className="relative">
        {renderFormation(teams[1], false, false, highlightedPlayer, highlightPlayer, 'away', goalAssistPairs, ownGoals, handlePlayerClick)}
      </div>
    </div>
  );
};

// MobileFormation
const MobileFormation = ({ teams, highlightedPlayer, highlightPlayer, goalAssistPairs, ownGoals = [], handlePlayerClick }) => {
  if (!teams || teams.length < 2) {
    return <div className="w-full h-full flex items-center justify-center text-white">팀 데이터 부족</div>;
  }
  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-1">
        {renderFormation(teams[0], true, true, highlightedPlayer, highlightPlayer, 'home', goalAssistPairs, ownGoals, handlePlayerClick)}
      </div>
      <div className="relative flex-1 border-t border-white border-opacity-50">
        {renderFormation(teams[1], false, true, highlightedPlayer, highlightPlayer, 'away', goalAssistPairs, ownGoals, handlePlayerClick)}
      </div>
    </div>
  );
};

// Normalize team name
const normalizeTeamName = (name) => {
  return name ? name.trim().toLowerCase() : '';
};

// Calculate total scores
const calculateTotalScores = (quarters) => {
  console.log('Total quarters:', quarters.length);
  const isPointsBased = quarters.length > 4;
  console.log('Scoring method:', isPointsBased ? 'Points-based' : 'Score-based');

  const teamStats = quarters.reduce((acc, q) => {
    console.log(`Processing quarter ${q.quarterIndex}, goalAssistPairs:`, q.goalAssistPairs, `ownGoals:`, q.ownGoals || []);
    console.log(`Quarter ${q.quarterIndex}, Teams:`, q.teams.map(t => t.name), `Length: ${q.teams.length}`);

    const scores = q.teams.reduce((scoreAcc, team) => {
      const teamName = normalizeTeamName(team.name);
      const goals = q.goalAssistPairs?.filter(p => normalizeTeamName(p.goal.team) === teamName).length || 0;
      const opponentTeam = q.teams.find(t => normalizeTeamName(t.name) !== teamName);
      const ownGoals = opponentTeam && q.ownGoals
        ? q.ownGoals.filter(og => normalizeTeamName(og.team) === normalizeTeamName(opponentTeam.name)).length
        : 0;
      scoreAcc[team.name] = goals + ownGoals;
      console.log(`Quarter ${q.quarterIndex}, Team ${team.name}, Normalized: ${teamName}, Goals: ${goals}, Own Goals: ${ownGoals}, Total: ${goals + ownGoals}`);
      return scoreAcc;
    }, {});

    console.log(`Quarter ${q.quarterIndex}, Scores:`, scores);

    const teams = q.teams.map(team => team.name);
    teams.forEach(team => {
      if (!acc[team]) {
        acc[team] = { goals: 0, points: 0 };
      }
      acc[team].goals += scores[team] || 0;
    });

    if (teams.length >= 3) {
      const pairs = [];
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          pairs.push([teams[i], teams[j]]);
        }
      }
      console.log(`Quarter ${q.quarterIndex}, Pairs:`, pairs);

      pairs.forEach(([team1, team2]) => {
        const goals1 = scores[team1] || 0;
        const goals2 = scores[team2] || 0;
        console.log(`Comparing ${team1} (${goals1}) vs ${team2} (${goals2})`);
        if (goals1 > goals2) {
          acc[team1].points += 3;
          console.log(`${team1} wins, +3 points`);
        } else if (goals1 < goals2) {
          acc[team2].points += 3;
          console.log(`${team2} wins, +3 points`);
        } else {
          acc[team1].points += 1;
          acc[team2].points += 1;
          console.log(`Draw, ${team1} and ${team2} +1 point each`);
        }
      });
    } else if (teams.length === 2) {
      const [team1, team2] = teams;
      const goals1 = scores[team1] || 0;
      const goals2 = scores[team2] || 0;
      console.log(`Comparing ${team1} (${goals1}) vs ${team2} (${goals2})`);
      if (goals1 > goals2) {
        acc[team1].points += 3;
        console.log(`${team1} wins, +3 points`);
      } else if (goals1 < goals2) {
        acc[team2].points += 3;
        console.log(`${team2} wins, +3 points`);
      } else {
        acc[team1].points += 1;
        acc[team2].points += 1;
        console.log(`Draw, ${team1} and ${team2} +1 point each`);
      }
    } else {
      console.log(`Quarter ${q.quarterIndex}: Less than 2 teams, skipping points calculation`);
    }

    console.log(`Team stats after quarter ${q.quarterIndex}:`, acc);
    return acc;
  }, {});

  const teams = Object.keys(teamStats);
  const isMultiTeam = teams.length >= 3;

  let winner = null;
  if (isPointsBased) {
    const maxPoints = Math.max(...Object.values(teamStats).map(stat => stat.points));
    const topTeams = teams.filter(t => teamStats[t].points === maxPoints);
    if (topTeams.length === 1) {
      winner = topTeams[0];
    } else if (topTeams.length > 1) {
      const maxGoals = Math.max(...topTeams.map(t => teamStats[t].goals));
      const topGoalTeams = topTeams.filter(t => teamStats[t].goals === maxGoals);
      winner = topGoalTeams.length === 1 ? topGoalTeams[0] : null;
    }
  } else {
    if (isMultiTeam) {
      const maxPoints = Math.max(...Object.values(teamStats).map(stat => stat.points));
      const topTeams = teams.filter(t => teamStats[t].points === maxPoints);
      if (topTeams.length === 1) {
        winner = topTeams[0];
      } else if (topTeams.length > 1) {
        const maxGoals = Math.max(...topTeams.map(t => teamStats[t].goals));
        const topGoalTeams = topTeams.filter(t => teamStats[t].goals === maxGoals);
        winner = topGoalTeams.length === 1 ? topGoalTeams[0] : null;
      }
    } else if (teams.length === 2) {
      const maxPoints = Math.max(...Object.values(teamStats).map(stat => stat.points));
      const topTeams = teams.filter(t => teamStats[t].points === maxPoints);
      if (topTeams.length === 1) {
        winner = topTeams[0];
      } else if (topTeams.length === 2) {
        const maxGoals = Math.max(...topTeams.map(t => teamStats[t].goals));
        const topGoalTeams = topTeams.filter(t => teamStats[t].goals === maxGoals);
        winner = (maxGoals > 0 && topGoalTeams.length === 1) ? topGoalTeams[0] : null;
      }
    }
  }

  console.log('Final teamStats:', teamStats, 'Winner:', winner);
  return { teamStats, winner, isMultiTeam };
};

// Calculate scores for a single quarter
const calculateScores = (pairs = [], ownGoals = [], teams) =>
  teams.map(t => {
    const teamName = normalizeTeamName(t.name);
    const goals = pairs.filter(p => normalizeTeamName(p.goal.team) === teamName).length;
    const opponentTeam = teams.find(team => normalizeTeamName(team.name) !== teamName);
    const ownGoalsCount = opponentTeam
      ? ownGoals.filter(og => normalizeTeamName(og.team) === normalizeTeamName(opponentTeam.name)).length
      : 0;
    return { name: t.name, goals: goals + ownGoalsCount, points: 0 };
  });

function VodPage() {
  const [matches, setMatches] = useState([]);
  const [filterDate, setFilterDate] = useState('all');
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [openQuarters, setOpenQuarters] = useState({});
  const [highlightedPlayer, setHighlightedPlayer] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const datesPerPage = 5;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (nickname) {
      const filtered = matches
        .map(match => {
          const filteredQuarters = match.quarters
            .map((quarter, index) => {
              const hasPlayer = quarter.teams.some(team =>
                team.players.some(player => player.name.toLowerCase() === nickname.toLowerCase())
              );
              if (!hasPlayer) return null;
              return { ...quarter, quarterIndex: index + 1 };
            })
            .filter(quarter => quarter !== null);
          if (filteredQuarters.length === 0) return null;
          return { ...match, quarters: filteredQuarters };
        })
        .filter(match => match !== null);
      console.log(`Filtered matches for ${nickname}:`, filtered);
      setFilteredMatches(filtered);
    } else {
      const startIndex = (currentPage - 1) * datesPerPage;
      const endIndex = startIndex + datesPerPage;
      const paginatedDates = dates.slice(startIndex, endIndex);
      setFilteredMatches(
        filterDate === 'all'
          ? matches.filter(m => paginatedDates.includes(m.date))
          : matches.filter(m => m.date === filterDate)
      );
    }
  }, [filterDate, matches, nickname, currentPage, dates]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const { date, quarters = [] } = doc.data();
        const matchData = {
          id: doc.id,
          date,
          quarters: quarters.map((q, index) => {
            const teams = (q.teams || []).map((t, ti) => {
              const players = (t.players || []).map(p => ({
                ...p,
                position: p.position || 'GK',
                goals: q.goalAssistPairs?.filter(g => g.goal.player === p.name).length || 0,
                assists: q.goalAssistPairs?.filter(a => a.assist.player === p.name).length || 0,
                ownGoals: q.ownGoals?.filter(og => og.player === p.name).length || 0,
              }));
              return {
                name: t.name || `팀 ${String.fromCharCode(65 + ti)}`,
                formation: t.formation || '4-3-3',
                players
              };
            });
            return { 
              teams, 
              goalAssistPairs: q.goalAssistPairs || [], 
              ownGoals: Array.isArray(q.ownGoals) ? q.ownGoals : [], 
              quarterIndex: index + 1 
            };
          })
        };
        console.log('Fetched match:', matchData);
        return matchData;
      });
      console.log('All fetched matches:', data);
      setMatches(data);
      setDates([...new Set(data.map(m => m.date))].sort().reverse());
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
    setLoading(false);
  };

  const toggleQuarter = (matchId, idx) => {
    setOpenQuarters(prev => ({ ...prev, [`${matchId}-${idx}`]: !prev[`${matchId}-${idx}`] }));
    setHighlightedPlayer(null);
    setSelectedPlayer(null);
    setSelectedQuarter(null);
  };

  const highlightPlayer = (name, type) => setHighlightedPlayer({ name, type });

  const handlePlayerClick = (player, goalAssistPairs, ownGoals) => {
    highlightPlayer(player.name, 'goal');
    setSelectedPlayer({
      ...player,
      goalAssistPairs,
      ownGoals,
    });
    setSelectedQuarter({ goalAssistPairs, ownGoals });
  };

  const closePopup = () => {
    setSelectedPlayer(null);
    setHighlightedPlayer(null);
    setSelectedQuarter(null);
  };

  const handleSearch = () => {
    console.log(`Searching for nickname: ${nickname}`);
    setShowModal(false);
    setCurrentPage(1);
  };

  const handleCancel = () => {
    setNickname('');
    setShowModal(false);
    setFilteredMatches(filterDate === 'all' ? matches : matches.filter(m => m.date === filterDate));
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && nickname.trim()) {
      handleSearch();
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setFilterDate('all');
  };

  const totalPages = Math.ceil(dates.length / datesPerPage);

  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationButton
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PaginationButton>
      );
    }

    return (
      <>
        <PaginationButton
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          이전
        </PaginationButton>
        {buttons}
        <PaginationButton
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          다음
        </PaginationButton>
      </>
    );
  };

  return (
    <Container>
      <MainContent>
        <PageTitle>2025시즌 SOOP FC 경기 기록</PageTitle>
        <FilterBarWrapper>
          <TossSelect value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option value="all">모든 날짜</option>
            {dates
              .slice((currentPage - 1) * datesPerPage, currentPage * datesPerPage)
              .map(d => (
                <option key={d} value={d}>
                  {formatDate(d)}
                </option>
              ))}
          </TossSelect>
          <TossButton onClick={() => setShowModal(true)}>
            내 경기 기록 보기
          </TossButton>
        </FilterBarWrapper>

        {showModal && (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
              <h3>내 경기 기록 검색</h3>
              <input
                style={modalStyles.input}
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="닉네임 입력"
                autoFocus
              />
              <div style={modalStyles.buttonContainer}>
                <button
                  style={{ ...modalStyles.button, ...modalStyles.cancelButton }}
                  onClick={handleCancel}
                >
                  취소
                </button>
                <button
                  style={{ ...modalStyles.button, ...modalStyles.searchButton }}
                  onClick={handleSearch}
                  disabled={!nickname.trim()}
                >
                  검색
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingIndicator>로딩 중...</LoadingIndicator>
        ) : filteredMatches.length ? (
          filteredMatches.map(match => {
            const { teamStats, winner, isMultiTeam } = calculateTotalScores(match.quarters);
            const scoreDisplay = isMultiTeam ? (
              isMobile ? (
                <div className="vertical">
                  {Object.entries(teamStats).map(([team, stats], index) => (
                    <React.Fragment key={team}>
                      <div>{team}: {stats.points}점</div>
                      {index < Object.keys(teamStats).length - 1 && <div>vs</div>}
                    </React.Fragment>
                  ))}
                  {winner && <div>({winner} 승)</div>}
                </div>
              ) : (
                Object.entries(teamStats)
                  .map(([team, stats]) => `${team}: ${stats.points}점`)
                  .join(' vs ') + (winner ? ` (${winner} 승)` : '')
              )
            ) : (
              Object.entries(teamStats)
                .map(([team, stats]) => `${team}: ${stats.goals}`)
                .join(' vs ') + (winner ? ` (${winner} 승)` : ' (무승부)')
            );

            return (
              <MatchSection key={match.id}>
                <MatchHeader>
                  <Badge type="home">{formatDate(match.date)}</Badge>
                  <div className={`score-info ${isMultiTeam && isMobile ? 'vertical' : ''}`}>
                    {scoreDisplay}
                  </div>
                </MatchHeader>
                {match.quarters.map((q, i) => {
                  const isOpen = openQuarters[`${match.id}-${i}`];
                  const scores = isMultiTeam
                    ? q.teams.map(team => {
                        const goals = q.goalAssistPairs?.filter(
                          p => normalizeTeamName(p.goal.team) === normalizeTeamName(team.name)
                        ).length || 0;
                        const opponentTeam = q.teams.find(t => normalizeTeamName(t.name) !== normalizeTeamName(team.name));
                        const ownGoals = opponentTeam && q.ownGoals
                          ? q.ownGoals.filter(og => normalizeTeamName(og.team) === normalizeTeamName(opponentTeam.name)).length
                          : 0;
                        return { name: team.name, goals: goals + ownGoals, points: 0 };
                      })
                    : calculateScores(q.goalAssistPairs, q.ownGoals, q.teams);

                  if (isMultiTeam) {
                    const quarterScores = q.teams.reduce((acc, team) => {
                      const teamName = normalizeTeamName(team.name);
                      const goals = q.goalAssistPairs?.filter(
                        p => normalizeTeamName(p.goal.team) === teamName
                      ).length || 0;
                      const opponentTeam = q.teams.find(t => normalizeTeamName(t.name) !== teamName);
                      const ownGoals = opponentTeam && q.ownGoals
                        ? q.ownGoals.filter(og => normalizeTeamName(og.team) === normalizeTeamName(opponentTeam.name)).length
                        : 0;
                      acc[team.name] = goals + ownGoals;
                      return acc;
                    }, {});
                    const pairs = [];
                    for (let ti = 0; ti < q.teams.length; ti++) {
                      for (let tj = ti + 1; tj < q.teams.length; tj++) {
                        pairs.push([q.teams[ti].name, q.teams[tj].name]);
                      }
                    }
                    console.log(`Quarter ${q.quarterIndex}, QuarterScores:`, quarterScores, `Pairs:`, pairs);
                    pairs.forEach(([team1, team2]) => {
                      const goals1 = quarterScores[team1] || 0;
                      const goals2 = quarterScores[team2] || 0;
                      console.log(`Quarter ${q.quarterIndex}: ${team1} (${goals1}) vs ${team2} (${goals2})`);
                      if (goals1 > goals2) {
                        scores.find(s => s.name === team1).points += 3;
                        console.log(`Quarter ${q.quarterIndex}: ${team1} wins, +3 points`);
                      } else if (goals1 < goals2) {
                        scores.find(s => s.name === team2).points += 3;
                        console.log(`Quarter ${q.quarterIndex}: ${team2} wins, +3 points`);
                      } else {
                        scores.find(s => s.name === team1).points += 1;
                        scores.find(s => s.name === team2).points += 1;
                        console.log(
                          `Quarter ${q.quarterIndex}: Draw, ${team1} and ${team2} +1 point each`
                        );
                      }
                    });
                  }

                  const defensivePositions = ['CB1', 'CB2', 'LB', 'RB', 'LWB', 'RWB'];
                  const playerStats = nickname
                    ? q.teams.reduce((acc, team) => {
                        const isPlayerTeam = team.players.some(
                          p => p.name.toLowerCase() === nickname.toLowerCase()
                        );
                        const isDefender = team.players.some(
                          p =>
                            p.name.toLowerCase() === nickname.toLowerCase() &&
                            defensivePositions.includes(p.position)
                        );
                        if (isPlayerTeam) {
                          q.goalAssistPairs?.forEach(pair => {
                            if (pair.goal.player.toLowerCase() === nickname.toLowerCase()) {
                              acc.push({ type: 'goal', icon: '⚽', quarter: q.quarterIndex });
                            }
                            if (pair.assist.player?.toLowerCase() === nickname.toLowerCase()) {
                              acc.push({ type: 'assist', icon: '👟', quarter: q.quarterIndex });
                            }
                          });
                          q.ownGoals?.forEach(og => {
                            if (og.player.toLowerCase() === nickname.toLowerCase()) {
                              acc.push({ type: 'ownGoal', icon: '🥅', quarter: q.quarterIndex });
                            }
                          });
                          if (isDefender) {
                            const opponentTeam = q.teams.find(t => t.name !== team.name);
                            const opponentGoals = (q.goalAssistPairs?.filter(
                              p => normalizeTeamName(p.goal.team) === normalizeTeamName(opponentTeam?.name)
                            ).length || 0) + (q.ownGoals?.filter(
                              og => normalizeTeamName(og.team) === normalizeTeamName(team.name)
                            ).length || 0);
                            if (opponentGoals === 0) {
                              acc.push({ type: 'cleanSheet', icon: '🧤', quarter: q.quarterIndex });
                            }
                          }
                        }
                        return acc;
                      }, [])
                    : [];

                  return (
                    <QuarterSection key={i} className={isOpen ? 'open' : ''}>
                      <QuarterHeader
                        onClick={() => toggleQuarter(match.id, i)}
                        className={isOpen ? 'open' : ''}
                      >
                        <span>쿼터 {q.quarterIndex}</span>
                        {playerStats.length > 0 && (
                          <span className="icons-container">
                            {playerStats.map((stat, si) => (
                              <span
                                key={si}
                                className={`${stat.type}-icon`}
                                style={{ marginLeft: '2px' }}
                              >
                                {stat.icon}
                              </span>
                            ))}
                          </span>
                        )}
                        <ChevronIcon isOpen={isOpen} />
                      </QuarterHeader>
                      <QuarterContent className={isOpen ? 'open' : ''}>
                        <ScoreBox>
                          {scores.map((s, si) => (
                            <React.Fragment key={si}>
                              <div className={`team team-${si}`}>
                                {si === 0 ? (
                                  <>
                                    <div className="name">{s.name}</div>
                                    <div className="score-value">{s.goals}</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="score-value">{s.goals}</div>
                                    <div className="name">{s.name}</div>
                                  </>
                                )}
                              </div>
                              {si < scores.length - 1 && <span className="separator">VS</span>}
                            </React.Fragment>
                          ))}
                        </ScoreBox>
                        <FieldContainer>
                          <FieldView>
                            <div className="goal-area-left" />
                            <div className="goal-area-right" />
                            <PenaltyArea className="top" />
                            <PenaltyArea className="bottom" />
                            <GoalPost className="top" />
                            <GoalPost className="bottom" />
                            <div className="center-line" />
                            <div className="center-circle" />
                            <div className="center-spot" />
                            <div className="penalty-box-left" />
                            <div className="penalty-box-right" />
                            <div className="penalty-arc-left" />
                            <div className="penalty-arc-right" />
                            <div className="penalty-spot-left" />
                            <div className="penalty-spot-right" />
                            <div className="corner-arc-top-left" />
                            <div className="corner-arc-top-right" />
                            <div className="corner-arc-bottom-left" />
                            <div className="corner-arc-bottom-right" />
                            {isMobile ? (
                              <MobileFormation
                                teams={q.teams}
                                highlightedPlayer={highlightedPlayer}
                                highlightPlayer={highlightPlayer}
                                goalAssistPairs={q.goalAssistPairs || []}
                                ownGoals={q.ownGoals || []}
                                handlePlayerClick={handlePlayerClick}
                              />
                            ) : (
                              <DesktopFormation
                                teams={q.teams}
                                highlightedPlayer={highlightedPlayer}
                                highlightPlayer={highlightPlayer}
                                goalAssistPairs={q.goalAssistPairs || []}
                                ownGoals={q.ownGoals || []}
                                handlePlayerClick={handlePlayerClick}
                              />
                            )}
                          </FieldView>
                        </FieldContainer>
                        <TeamsContainer>
                          {q.teams.map((t, ti) => (
                            <TeamCard key={ti}>
                              <TeamName>{t.name}</TeamName>
                              <Formation>포메이션: {t.formation}</Formation>
                              <PlayersList>
                                {t.players.map((p, pi) => (
                                  <PlayerItem key={pi}>
                                    <span className="number">{p.backNumber}</span>
                                    <span className="name">{p.name}</span>
                                    <span className="position">{p.position}</span>
                                  </PlayerItem>
                                ))}
                              </PlayersList>
                            </TeamCard>
                          ))}
                        </TeamsContainer>
                        <StatsList>
                          <StatTitle>공격 포인트</StatTitle>
                          {q.teams.map((team, ti) => {
                            const teamGoalAssistPairs = q.goalAssistPairs?.filter(
                              p => normalizeTeamName(p.goal.team) === normalizeTeamName(team.name)
                            ) || [];
                            const opponentTeam = q.teams.find(t => normalizeTeamName(t.name) !== normalizeTeamName(team.name));
                            const teamOwnGoals = opponentTeam && q.ownGoals
                              ? q.ownGoals.filter(og => normalizeTeamName(og.team) === normalizeTeamName(opponentTeam.name))
                              : [];
                            return (
                              <div key={ti} style={{ marginBottom: '20px' }}>
                                <StatTitle>{team.name}</StatTitle>
                                {teamGoalAssistPairs.length || teamOwnGoals.length ? (
                                  <>
                                    {teamGoalAssistPairs.map((p, pi) => (
                                      <StatItem
                                        key={`goal-${pi}`}
                                        onClick={() => highlightPlayer(p.goal.player, 'goal')}
                                      >
                                        <StatValue>
                                          <div>
                                            <span>골: {p.goal.player}</span>
                                            <span className="goal-icon">⚽</span>
                                          </div>
                                          <div>
                                            <span>어시: {p.assist.player || '없음'}</span>
                                            {p.assist.player && (
                                              <span
                                                className="assist-icon"
                                                onClick={e => {
                                                  e.stopPropagation();
                                                  highlightPlayer(p.assist.player, 'assist');
                                                }}
                                              >
                                                👟
                                              </span>
                                            )}
                                          </div>
                                        </StatValue>
                                      </StatItem>
                                    ))}
                                    {teamOwnGoals.map((og, oi) => (
                                      <StatItem
                                        key={`ownGoal-${oi}`}
                                        className="own-goal"
                                        onClick={() => highlightPlayer(og.player, 'ownGoal')}
                                      >
                                        <StatValue>
                                          <div>
                                            <span>골: {og.player} (자책골)</span>
                                            <span className="own-goal-icon">🥅</span>
                                          </div>
                                          <div>
                                            <span>어시: 없음</span>
                                          </div>
                                        </StatValue>
                                      </StatItem>
                                    ))}
                                  </>
                                ) : (
                                  <EmptyState>{team.name}의 공격 포인트 기록 없음</EmptyState>
                                )}
                              </div>
                            );
                          })}
                        </StatsList>
                      </QuarterContent>
                    </QuarterSection>
                  );
                })}
              </MatchSection>
            );
          })
        ) : (
          <EmptyState>
            {nickname ? `${nickname} 님이 참여한 경기가 없습니다.` : '등록된 경기가 없습니다.'}
          </EmptyState>
        )}
        {totalPages > 1 && (
          <PaginationWrapper>
            {getPaginationButtons()}
          </PaginationWrapper>
        )}
        {selectedPlayer && selectedQuarter && (
          <PopupOverlay onClick={closePopup}>
            <PopupContent onClick={(e) => e.stopPropagation()}>
              <PopupHeader>
                <PopupTitle>{selectedPlayer.name}</PopupTitle>
                <CloseButton onClick={closePopup}>X</CloseButton>
              </PopupHeader>
              <PopupBody>
                <PopupStat>등번호: {selectedPlayer.backNumber || '없음'}</PopupStat>
                <PopupStat>포지션: {selectedPlayer.position || 'N/A'}</PopupStat>
                <PopupStat>득점: {selectedPlayer.goalAssistPairs?.filter(g => g.goal.player === selectedPlayer.name).length || 0}</PopupStat>
                <PopupStat>도움: {selectedPlayer.goalAssistPairs?.filter(a => a.assist.player === selectedPlayer.name).length || 0}</PopupStat>
                <PopupStat>
                  득점 파트너: {
                    (() => {
                      const assists = selectedPlayer.goalAssistPairs?.filter(g => g.goal.player === selectedPlayer.name) || [];
                      const assistPlayers = assists.map(a => a.assist.player).filter(Boolean);
                      return assistPlayers.length > 0 ? assistPlayers.join(', ') : '없음';
                    })()
                  }
                </PopupStat>
                <PopupStat>
                  어시스트 파트너: {
                    (() => {
                      const goals = selectedPlayer.goalAssistPairs?.filter(a => a.assist.player === selectedPlayer.name) || [];
                      const goalPlayers = goals.map(g => g.goal.player).filter(Boolean);
                      return goalPlayers.length > 0 ? goalPlayers.join(', ') : '없음';
                    })()
                  }
                </PopupStat>
              </PopupBody>
              <PopupFooter>
                <GradeButton onClick={closePopup}>기록 닫기</GradeButton>
              </PopupFooter>
            </PopupContent>
          </PopupOverlay>
        )}
      </MainContent>
    </Container>
  );
}

export default VodPage;