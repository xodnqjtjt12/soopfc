import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { db } from '../App';
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { 
  AdminContainer, 
  AdminHeader, 
  TeamManagementGrid,
  TeamSettingsPanel,
  PanelSectionTitle,
  FormGroup, 
  Label, 
  Input, 
  Select, 
  Button,
  SaveButton,
  FormationSelector,
  FieldContainer,
  FieldViewTitle,
  FieldView,
  GoalArea,
  PenaltyArea,
  GoalPost,
  PlayerCard,
  PlayerImage,
  PlayerInfo,
  TeamSummary,
  ModalOverlay,
  ModalContent,
  ModalTitle,
  ModalInput,
  ModalButton,
  ErrorMessage,
  CapsLockWarning,
  Badge // Badge를 VodAdminPageCss에서 임포트
} from './VodAdminPageCss';

// Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M8 16H3v5"></path>
  </svg>
);

// Formations
const formations = {
  '4-3-3': [
    { position: 'GK', top: '10%', left: '50%' },
    { position: 'RB', top: '25%', left: '20%' },
    { position: 'CB1', top: '25%', left: '40%' },
    { position: 'CB2', top: '25%', left: '60%' },
    { position: 'LB', top: '25%', left: '80%' },
    { position: 'CM1', top: '50%', left: '30%' },
    { position: 'CM2', top: '50%', left: '50%' },
    { position: 'CM3', top: '50%', left: '70%' },
    { position: 'LW', top: '75%', left: '25%' },
    { position: 'ST', top: '75%', left: '50%' },
    { position: 'RW', top: '75%', left: '75%' }
  ],
  '4-4-2': [
    { position: 'GK', top: '10%', left: '50%' },
    { position: 'RB', top: '25%', left: '20%' },
    { position: 'CB1', top: '25%', left: '40%' },
    { position: 'CB2', top: '25%', left: '60%' },
    { position: 'LB', top: '25%', left: '80%' },
    { position: 'LM', top: '50%', left: '20%' },
    { position: 'CM1', top: '50%', left: '40%' },
    { position: 'CM2', top: '50%', left: '60%' },
    { position: 'RM', top: '50%', left: '80%' },
    { position: 'ST1', top: '75%', left: '40%' },
    { position: 'ST2', top: '75%', left: '60%' }
  ],
  '3-5-2': [
    { position: 'GK', top: '10%', left: '50%' },
    { position: 'CB1', top: '25%', left: '30%' },
    { position: 'CB2', top: '25%', left: '50%' },
    { position: 'CB3', top: '25%', left: '70%' },
    { position: 'LWB', top: '40%', left: '15%' },
    { position: 'CM1', top: '50%', left: '30%' },
    { position: 'CM2', top: '50%', left: '50%' },
    { position: 'CM3', top: '50%', left: '70%' },
    { position: 'RWB', top: '40%', left: '85%' },
    { position: 'ST1', top: '75%', left: '40%' },
    { position: 'ST2', top: '75%', left: '60%' }
  ],
  '4-2-3-1': [
    { position: 'GK', top: '10%', left: '50%' },
    { position: 'RB', top: '25%', left: '20%' },
    { position: 'CB1', top: '25%', left: '40%' },
    { position: 'CB2', top: '25%', left: '60%' },
    { position: 'LB', top: '25%', left: '80%' },
    { position: 'CDM1', top: '45%', left: '40%' },
    { position: 'CDM2', top: '45%', left: '60%' },
    { position: 'LW', top: '60%', left: '25%' },
    { position: 'CAM', top: '60%', left: '50%' },
    { position: 'RW', top: '60%', left: '75%' },
    { position: 'ST', top: '80%', left: '50%' }
  ]
};

// Get empty player array based on formation, applying fixed players
const getEmptyPlayers = (formation, fixedPlayers = {}, teamName = '') => {
  const formationData = formations[formation] || formations['4-3-3'];
  return formationData.map(pos => {
    const fixedPlayer = fixedPlayers[teamName]?.[pos.position];
    return { 
      backNumber: fixedPlayer?.backNumber || '', 
      name: fixedPlayer?.name || '', 
      position: pos.position,
      top: pos.top,
      left: pos.left
    };
  });
};

// Initialize a single quarter with exactly two teams
const initializeQuarter = (team1 = null, team2 = null, fixedPlayers = {}) => {
  return {
    teams: [
      { 
        id: team1?.id || null,
        name: team1?.name || '', 
        formation: team1?.formation || '4-3-3', 
        players: team1?.players || getEmptyPlayers('4-3-3', fixedPlayers, team1?.name) 
      },
      { 
        id: team2?.id || null,
        name: team2?.name || '', 
        formation: team2?.formation || '4-3-3', 
        players: team2?.players || getEmptyPlayers('4-3-3', fixedPlayers, team2?.name) 
      }
    ],
    goalAssistPairs: [{ goal: { player: '', team: '' }, assist: { player: '', team: '' } }]
  };
};

// Initialize quarters based on team count
const initializeAllQuarters = (teams = [], fixedPlayers = {}) => {
  const teamCount = teams.length || 0;
  let quarters;
  if (teamCount === 0) {
    quarters = Array(4).fill().map(() => initializeQuarter(null, null, fixedPlayers));
  } else if (teamCount === 1) {
    quarters = Array(4).fill().map(() => initializeQuarter(teams[0], null, fixedPlayers));
  } else if (teamCount === 2) {
    quarters = Array(4).fill().map(() => initializeQuarter(teams[0], teams[1], fixedPlayers));
  } else {
    quarters = [
      initializeQuarter(teams[0], teams[1], fixedPlayers), // A vs B
      initializeQuarter(teams[0], teams[2], fixedPlayers), // A vs C
      initializeQuarter(teams[1], teams[2], fixedPlayers), // B vs C
      initializeQuarter(teams[0], teams[1], fixedPlayers), // A vs B
      initializeQuarter(teams[0], teams[2], fixedPlayers), // A vs C
      initializeQuarter(teams[1], teams[2], fixedPlayers)  // B vs C
    ];
  }
  return quarters;
};

// Get valid quarters based on team count
const getValidQuarterIndices = (teamCount) => {
  return teamCount <= 2 ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5];
};

// Get team count from teams array
const getTeamCount = (teams) => {
  return teams.length || 0;
};

function MatchAdminPage() {
  const [matches, setMatches] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quarters, setQuarters] = useState(initializeAllQuarters([]));
  const [filterDate, setFilterDate] = useState('all');
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [tempPlayers, setTempPlayers] = useState([]);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [activeQuarterIndex, setActiveQuarterIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('팀 A');
  // 비밀번호 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  // 고정 선수 상태
  const [fixedPlayers, setFixedPlayers] = useState({});

  // 페이지 로드 시 비밀번호 입력 모달 표시
  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthenticated(false);
    }
  }, []);

  // 비밀번호 제출 처리
  const handlePasswordSubmit = () => {
    if (password === 'alves') {
      setIsAuthenticated(true);
      setError('');
      setPassword('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  // Enter 키로 비밀번호 제출
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  // Caps Lock 감지
  const handleKeyDown = (e) => {
    const capsLock = e.getModifierState('CapsLock');
    setIsCapsLockOn(capsLock);
  };

  // Fetch data
  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterDate, matches]);

  // Debug quarters changes
  useEffect(() => {
    console.log('Quarters updated:', JSON.stringify(quarters, null, 2));
    console.log('Active Quarter Index:', activeQuarterIndex);
    console.log('Active Team Index:', activeTeamIndex);
    console.log('Fixed Players:', JSON.stringify(fixedPlayers, null, 2));
    quarters.forEach((quarter, idx) => {
      if (quarter && Array.isArray(quarter.teams)) {
        console.log(`Quarter ${idx + 1} Matchup:`, 
          quarter.teams
            .filter(t => t != null)
            .map(t => t.name || '이름 미정')
            .join(' vs ') || '팀 정보 없음');
      } else {
        console.warn(`Invalid quarter at index ${idx}:`, quarter);
      }
    });
    const teamCount = getTeamCount(teams);
    console.log('Team count after quarters update:', teamCount);
    if (activeTeamIndex >= teamCount) {
      setActiveTeamIndex(teamCount - 1 >= 0 ? teamCount - 1 : 0);
    }
    const validQuarters = getValidQuarterIndices(teamCount);
    if (!validQuarters.includes(activeQuarterIndex)) {
      setActiveQuarterIndex(validQuarters[0] || 0);
    }
  }, [quarters, teams, fixedPlayers]);

  // Define playerOptions safely
  const playerOptions = (players && tempPlayers) ? 
    [...players, ...tempPlayers].map((p) => ({
      label: `${p.name} (${p.position || '포지션 미정'}${p.isMercenary ? ' - 용병' : ''})`,
      value: p.name,
      backNumber: p.backNumber || ''
    })) : [];

  // Fetch all match data
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const matchData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const quarters = Array.isArray(data.quarters) && data.quarters.length > 0 
          ? data.quarters.map((quarter, idx) => ({
              teams: Array.isArray(quarter.teams) ? quarter.teams.slice(0, 2).map(team => ({
                id: team.id || null,
                name: team.name || '',
                formation: team.formation || '4-4-2',
                players: Array.isArray(team.players) ? team.players.map(player => ({
                  backNumber: player.backNumber || '',
                  name: player.name || '',
                  position: player.position || '',
                  top: player.top || formations[team.formation || '4-4-2']?.find(p => p.position === player.position)?.top || '',
                  left: player.left || formations[team.formation || '4-4-2']?.find(p => p.position === player.position)?.left || ''
                })) : getEmptyPlayers(team.formation || '4-4-2', fixedPlayers, team.name)
              })) : initializeQuarter().teams,
              goalAssistPairs: Array.isArray(quarter.goalAssistPairs) && quarter.goalAssistPairs.length > 0 
                ? quarter.goalAssistPairs.map(pair => ({
                    goal: { player: pair.goal?.player || '', team: pair.goal?.team || '' },
                    assist: { player: pair.assist?.player || '', team: pair.assist?.team || '' }
                  }))
                : [{ goal: { player: '', team: '' }, assist: { player: '', team: '' } }]
            }))
          : initializeAllQuarters([], fixedPlayers);
        return { 
          id: doc.id, 
          date: data.date || new Date().toISOString().split('T')[0],
          quarters: quarters.length === 6 ? quarters : [
            ...quarters,
            ...Array(6 - quarters.length).fill().map(() => initializeQuarter(null, null, fixedPlayers))
          ]
        };
      });
      
      const uniqueDates = [...new Set(matchData.map(match => match.date))].sort().reverse();
      
      setMatches(matchData);
      setFilteredMatches(matchData);
      setDates(uniqueDates);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all players
  const fetchPlayers = async () => {
    try {
      const snap = await getDocs(collection(db, 'players'));
      const playerData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playerData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  // Apply date filter
  const applyFilters = () => {
    let filtered = [...matches];
    if (filterDate !== 'all') {
      filtered = filtered.filter(match => match.date === filterDate);
    }
    setFilteredMatches(filtered);
  };

  // Handle team save
  const handleTeamSave = () => {
    const teamName = quarters[activeQuarterIndex].teams[activeTeamIndex]?.name || '';
    const formation = quarters[activeQuarterIndex].teams[activeTeamIndex]?.formation || '4-4-2';
    const playersData = quarters[activeQuarterIndex].teams[activeTeamIndex]?.players || getEmptyPlayers(formation, fixedPlayers, teamName);

    if (!teamName) {
      alert("팀 이름을 입력해주세요.");
      return;
    }

    let teamId;
    if (selectedTeam === '팀 A') teamId = 1;
    else if (selectedTeam === '팀 B') teamId = 2;
    else if (selectedTeam === '팀 C') teamId = 3;

    const newTeam = { id: teamId, name: teamName, formation, players: playersData };
    const updatedTeams = [...teams];
    const existingTeamIndex = updatedTeams.findIndex(t => t.id === teamId);

    if (existingTeamIndex !== -1) {
      updatedTeams[existingTeamIndex] = newTeam;
    } else {
      updatedTeams.push(newTeam);
    }

    setTeams(updatedTeams);
    setQuarters(initializeAllQuarters(updatedTeams, fixedPlayers));
    alert(`${selectedTeam}이(가) 저장되었습니다.`);
  };

  // Handle team delete
  const handleTeamDelete = (teamId) => {
    if (window.confirm(`ID ${teamId} 팀을 삭제하시겠습니까?`)) {
      const updatedTeams = teams.filter(team => team.id !== teamId);
      const teamName = teams.find(team => team.id === teamId)?.name;
      if (teamName) {
        setFixedPlayers(prev => {
          const newFixed = { ...prev };
          delete newFixed[teamName];
          return newFixed;
        });
      }
      setTeams(updatedTeams);
      setQuarters(initializeAllQuarters(updatedTeams, fixedPlayers));
      alert(`ID ${teamId} 팀이 삭제되었습니다.`);
    }
  };

  // Handle quarter changes
  const handleQuarterChange = (quarterIndex, teamIndex, field, value) => {
    const updatedQuarters = JSON.parse(JSON.stringify(quarters));
    
    if (updatedQuarters[quarterIndex].teams[teamIndex]) {
      updatedQuarters[quarterIndex].teams[teamIndex][field] = value;
      if (field === 'formation') {
        const teamName = updatedQuarters[quarterIndex].teams[teamIndex].name;
        const newFormation = value;
        const formationData = formations[newFormation] || formations['4-3-3'];
        const existingPlayers = updatedQuarters[quarterIndex].teams[teamIndex].players || [];
        const fixedTeamPlayers = fixedPlayers[teamName] || {};

        // 새로운 포메이션의 포지션에 고정 선수 적용
        const newPlayers = formationData.map(pos => {
          const fixedPlayer = fixedTeamPlayers[pos.position];
          const existingPlayer = existingPlayers.find(p => p.position === pos.position);
          return {
            backNumber: fixedPlayer?.backNumber || existingPlayer?.backNumber || '',
            name: fixedPlayer?.name || existingPlayer?.name || '',
            position: pos.position,
            top: pos.top,
            left: pos.left
          };
        });

        updatedQuarters[quarterIndex].teams[teamIndex].players = newPlayers;
      }
    }

    setQuarters(updatedQuarters);
  };

  // Add player to team via search for a specific quarter
  const addPlayerToTeam = (quarterIndex, teamIndex, selected, position) => {
    if (!selected) return;
    
    const updatedQuarters = [...quarters];
    const teamName = updatedQuarters[quarterIndex].teams[teamIndex]?.name;
    const playerIndex = updatedQuarters[quarterIndex].teams[teamIndex]?.players.findIndex(p => p.position === position);
    
    if (playerIndex !== -1) {
      const playerName = selected.__isNew__ ? selected.value : selected.value;
      updatedQuarters[quarterIndex].teams[teamIndex].players[playerIndex].name = playerName;
      updatedQuarters[quarterIndex].teams[teamIndex].players[playerIndex].backNumber = selected.backNumber || '';
      
      if (selected.__isNew__) {
        setTempPlayers(prev => [
          ...prev,
          { name: playerName, position: '포지션 미정', backNumber: '', isMercenary: true }
        ]);
      }

      // 고정 선수 업데이트
      if (teamName) {
        setFixedPlayers(prev => ({
          ...prev,
          [teamName]: {
            ...prev[teamName],
            [position]: { name: playerName, backNumber: selected.backNumber || '' }
          }
        }));
      }
      
      setQuarters(updatedQuarters);
    }
  };

  // Fix player across all quarters for the same team
  const fixPlayerAcrossQuarters = (quarterIndex, teamIndex, position, playerName, backNumber) => {
    if (!playerName) {
      alert("먼저 선수를 선택해주세요.");
      return;
    }
  
    const updatedQuarters = JSON.parse(JSON.stringify(quarters));
    const teamName = updatedQuarters[quarterIndex].teams[teamIndex]?.name;
  
    if (!teamName) {
      alert("팀 이름이 설정되지 않았습니다.");
      return;
    }
  
    // 고정 선수 정보 업데이트
    setFixedPlayers(prev => ({
      ...prev,
      [teamName]: {
        ...prev[teamName],
        [position]: { name: playerName, backNumber: backNumber || '' }
      }
    }));

    // 모든 쿼터에 고정 선수 적용
    updatedQuarters.forEach((quarter, idx) => {
      const teamIdx = quarter.teams.findIndex(team => team.name === teamName);
      if (teamIdx !== -1) {
        const formation = quarter.teams[teamIdx].formation || '4-3-3';
        const formationData = formations[formation] || formations['4-3-3'];
        const playerIdx = quarter.teams[teamIdx].players.findIndex(p => p.position === position);
        
        if (playerIdx !== -1) {
          // 포지션이 존재하면 선수 정보 업데이트
          updatedQuarters[idx].teams[teamIdx].players[playerIdx] = {
            ...quarter.teams[teamIdx].players[playerIdx],
            name: playerName,
            backNumber: backNumber || ''
          };
        } else if (formationData.some(p => p.position === position)) {
          // 포지션이 포메이션에 존재하면 새로 추가
          const posData = formationData.find(p => p.position === position);
          updatedQuarters[idx].teams[teamIdx].players.push({
            position,
            name: playerName,
            backNumber: backNumber || '',
            top: posData.top,
            left: posData.left
          });
        }
      }
    });
  
    setQuarters(updatedQuarters);
    alert(`${teamName} 팀의 ${position} 포지션에 ${playerName} 선수가 모든 쿼터에 고정되었습니다.`);
  };

  // Add new team (only in quarter 1)
  const addTeam = (quarterIndex) => {
    if (quarterIndex !== 0) {
      alert("팀은 1쿼터에서만 추가할 수 있습니다.");
      return;
    }
    
    const currentTeamCount = teams.length;
    if (currentTeamCount >= 3) {
      alert("최대 3팀까지만 추가할 수 있습니다.");
      return;
    }

    const newTeamName = `Team ${String.fromCharCode(65 + currentTeamCount)}`;
    const newTeamId = currentTeamCount + 1;
    const newTeam = {
      id: newTeamId,
      name: newTeamName,
      formation: '4-4-2',
      players: getEmptyPlayers('4-4-2', fixedPlayers, newTeamName)
    };

    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    setQuarters(initializeAllQuarters(updatedTeams, fixedPlayers));
    setActiveTeamIndex(currentTeamCount);
    setSelectedTeam(`팀 ${String.fromCharCode(65 + currentTeamCount)}`);
  };

  // Handle drag and drop for a specific quarter
  const onDragEnd = (result, quarterIndex, teamIndex) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const updatedQuarters = JSON.parse(JSON.stringify(quarters));

    if (updatedQuarters[quarterIndex].teams[teamIndex]) {
      const players = updatedQuarters[quarterIndex].teams[teamIndex].players;
      const sourcePlayer = players[sourceIndex];
      const destPlayer = players[destIndex];

      // 확인 창 표시
      const sourceName = sourcePlayer.name || '선수 없음';
      const destName = destPlayer.name || '선수 없음';
      const confirmMessage = `${sourcePlayer.position} ${sourceName}와 ${destPlayer.position} ${destName}를 바꾸시겠습니까?`;
      if (!window.confirm(confirmMessage)) {
        console.log('Position swap cancelled by user');
        return;
      }

      // 포지션 및 위치 정보 교체
      const tempPlayer = { ...sourcePlayer };
      updatedQuarters[quarterIndex].teams[teamIndex].players[sourceIndex] = {
        ...destPlayer,
        position: sourcePlayer.position,
        top: sourcePlayer.top,
        left: sourcePlayer.left
      };
      updatedQuarters[quarterIndex].teams[teamIndex].players[destIndex] = {
        ...tempPlayer,
        position: destPlayer.position,
        top: destPlayer.top,
        left: destPlayer.left
      };

      // 고정 선수 업데이트
      const teamName = updatedQuarters[quarterIndex].teams[teamIndex].name;
      if (teamName) {
        setFixedPlayers(prev => ({
          ...prev,
          [teamName]: {
            ...prev[teamName],
            [sourcePlayer.position]: {
              name: destPlayer.name,
              backNumber: destPlayer.backNumber
            },
            [destPlayer.position]: {
              name: sourcePlayer.name,
              backNumber: sourcePlayer.backNumber
            }
          }
        }));
      }

      setQuarters(updatedQuarters);
      console.log(`Swapped ${sourcePlayer.position} ${sourceName} with ${destPlayer.position} ${destName}`);
    }
  };

  // Get player options for a specific team
  const getTeamPlayerOptions = (quarterIndex, teamName) => {
    if (!teamName) return [];
    const teamPlayers = quarters[quarterIndex].teams.find(team => team.name === teamName)?.players.filter(p => p.name) || [];
    return [...players, ...tempPlayers]
      .filter(p => teamPlayers.some(tp => tp.name === p.name))
      .map(p => ({
        label: `${p.name} (${p.position || '포지션 미정'}${p.isMercenary ? ' - 용병' : ''})`,
        value: p.name,
        backNumber: p.backNumber || ''
      }));
  };

  // Handle goal-assist pair input changes for a specific quarter
  const handleGoalAssistPairChange = (quarterIndex, pairIndex, type, field, value) => {
    const updatedQuarters = [...quarters];
    const updatedPairs = [...updatedQuarters[quarterIndex].goalAssistPairs];
    if (field === 'player' && value) {
      updatedPairs[pairIndex][type][field] = value.value;
    } else {
      updatedPairs[pairIndex][type][field] = value;
    }
    if (field === 'team') {
      updatedPairs[pairIndex][type].player = '';
    }
    updatedQuarters[quarterIndex].goalAssistPairs = updatedPairs;
    setQuarters(updatedQuarters);
  };

  // Add new goal-assist pair for a specific quarter
  const addGoalAssistPair = (quarterIndex) => {
    const updatedQuarters = [...quarters];
    updatedQuarters[quarterIndex].goalAssistPairs.push({ 
      goal: { player: '', team: '' }, 
      assist: { player: '', team: '' } 
    });
    setQuarters(updatedQuarters);
  };

  // Remove goal-assist pair for a specific quarter
  const removeGoalAssistPair = (quarterIndex, pairIndex) => {
    const updatedQuarters = [...quarters];
    updatedQuarters[quarterIndex].goalAssistPairs.splice(pairIndex, 1);
    setQuarters(updatedQuarters);
  };

  // Reset current quarter
  const resetCurrentQuarter = () => {
    if (window.confirm(`쿼터 ${activeQuarterIndex + 1}의 팀 설정을 초기화하시겠습니까?`)) {
      const updatedQuarters = [...quarters];
      updatedQuarters[activeQuarterIndex] = initializeQuarter(null, null, fixedPlayers);
      setQuarters(updatedQuarters);
      setTempPlayers([]);
      setActiveTeamIndex(0);
      alert(`쿼터 ${activeQuarterIndex + 1}가 초기화되었습니다.`);
    }
  };

  // Handle edit match
  const handleEditMatch = (match) => {
    setIsEditing(true);
    setEditingMatchId(match.id);
    setDate(match.date);
    
    const matchTeams = [];
    const newFixedPlayers = {};
    match.quarters.forEach(quarter => {
      quarter.teams.forEach(team => {
        if (team.name && !matchTeams.some(t => t.id === team.id)) {
          matchTeams.push({ ...team });
          // 고정 선수 추출
          newFixedPlayers[team.name] = newFixedPlayers[team.name] || {};
          team.players.forEach(player => {
            if (player.name) {
              newFixedPlayers[team.name][player.position] = {
                name: player.name,
                backNumber: player.backNumber
              };
            }
          });
        }
      });
    });

    setFixedPlayers(newFixedPlayers);
    setTeams(matchTeams);
    const updatedQuarters = initializeAllQuarters(matchTeams, newFixedPlayers);
    
    match.quarters.forEach((quarter, idx) => {
      if (updatedQuarters[idx] && Array.isArray(quarter.teams)) {
        updatedQuarters[idx].teams = quarter.teams.slice(0, 2).map(team => ({
          id: team.id || null,
          name: team.name || '',
          formation: team.formation || '4-4-2',
          players: Array.isArray(team.players) ? team.players.map(player => ({
            backNumber: player.backNumber || '',
            name: player.name || '',
            position: player.position || '',
            top: player.top || formations[team.formation || '4-4-2']?.find(p => p.position === player.position)?.top || '',
            left: player.left || formations[team.formation || '4-4-2']?.find(p => p.position === player.position)?.left || ''
          })) : getEmptyPlayers(team.formation || '4-4-2', newFixedPlayers, team.name)
        }));
        updatedQuarters[idx].goalAssistPairs = Array.isArray(quarter.goalAssistPairs) && quarter.goalAssistPairs.length > 0 
          ? quarter.goalAssistPairs.map(pair => ({
              goal: { player: pair.goal?.player || '', team: pair.goal?.team || '' },
              assist: { player: pair.assist?.player || '', team: pair.assist?.team || '' }
            }))
          : [{ goal: { player: '', team: '' }, assist: { player: '', team: '' } }];
      }
    });
    
    setQuarters(updatedQuarters);
    setActiveTeamIndex(0);
    setActiveQuarterIndex(0);
    setTempPlayers([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add or update match with quarters
  const handleAddMatch = async () => {
    if (!date || teams.length === 0) {
      alert("날짜와 최소 하나의 팀을 설정해주세요.");
      return;
    }

    try {
      const teamCount = getTeamCount(teams);
      const validQuarterIndices = getValidQuarterIndices(teamCount);
      const matchData = { 
        date,
        quarters: quarters.map((quarter, idx) => ({
          teams: validQuarterIndices.includes(idx) && quarter.teams.some(team => team.name)
            ? quarter.teams.filter(team => team && team.name).map(team => ({
                id: team.id,
                name: team.name,
                formation: team.formation,
                players: team.players.filter(p => p.name && p.position)
              }))
            : [],
          goalAssistPairs: validQuarterIndices.includes(idx)
            ? quarter.goalAssistPairs.filter(pair => pair.goal.player && pair.goal.team)
            : []
        })),
        createdAt: isEditing ? matches.find(m => m.id === editingMatchId)?.createdAt || new Date().toISOString() : new Date().toISOString()
      };

      if (isEditing && editingMatchId) {
        await setDoc(doc(db, 'matches', editingMatchId), matchData);
        alert("경기가 성공적으로 수정되었습니다.");
      } else {
        await addDoc(collection(db, 'matches'), matchData);
        alert("경기가 성공적으로 등록되었습니다.");
      }
      
      fetchMatches();
      
      setDate(new Date().toISOString().split('T')[0]);
      setQuarters(initializeAllQuarters([], {}));
      setTeams([]);
      setTempPlayers([]);
      setFixedPlayers({});
      setActiveTeamIndex(0);
      setActiveQuarterIndex(0);
      setIsEditing(false);
      setEditingMatchId(null);
    } catch (error) {
      console.error("Error saving match:", error);
      alert(isEditing ? "경기 수정에 실패했습니다." : "경기 추가에 실패했습니다.");
    }
  };

  // Delete match
  const handleDeleteMatch = async (id) => {
    if (window.confirm("정말로 이 경기를 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, 'matches', id));
        fetchMatches();
        if (editingMatchId === id) {
          setIsEditing(false);
          setEditingMatchId(null);
          setQuarters(initializeAllQuarters([], {}));
          setFixedPlayers({});
          setDate(new Date().toISOString().split('T')[0]);
        }
      } catch (error) {
        console.error("Error deleting match:", error);
        alert("경기 삭제에 실패했습니다.");
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}.${month}.${day} (${weekday})`;
  };

  // react-select custom styles
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '36px',
      height: '36px',
      boxShadow: 'none',
      border: '1px solid #ddd',
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: '14px',
      '&:hover': {
        borderColor: '#ddd',
      },
      '&:focus': {
        borderColor: '#3498db',
        boxShadow: '0 0 0 2px rgba(52, 152, 219, 0.2)',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '36px',
      padding: '0 8px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '36px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3498db' : '#fff',
      color: state.isSelected ? '#fff' : '#333',
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: '14px',
      '&:hover': {
        backgroundColor: '#f0f0f0',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '4px',
      marginTop: '0',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      border: '1px solid #ddd',
      zIndex: 9999,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#333',
      fontFamily: "'Noto Sans KR', sans-serif",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#999',
      fontSize: '14px',
      fontFamily: "'Noto Sans KR', sans-serif",
    }),
  };

  // Get player ratings
  const getPlayerRating = (playerName) => {
    const player = [...players, ...tempPlayers].find(p => p.name === playerName);
    return player?.rating || Math.floor(Math.random() * 20) + 70;
  };

  // Get team matchup description for the active quarter
  const getMatchupDescription = (quarterIndex) => {
    const teams = quarters[quarterIndex]?.teams || [];
    const teamCount = getTeamCount(teams);
    
    if (!teams[0]?.name && !teams[1]?.name) {
      return '팀 정보 없음';
    }

    const team1Name = teams[0]?.name || '이름 미정';
    const team2Name = teams[1]?.name || '이름 미정';

    if (teamCount === 0) {
      return '팀 정보 없음';
    } else if (teamCount === 1) {
      return `${team1Name} vs 빈 팀`;
    } else {
      return `${team1Name} vs ${team2Name}`;
    }
  };

  // 비밀번호 입력 모달 렌더링
  if (!isAuthenticated) {
    return (
      <ModalOverlay>
        <ModalContent>
          <ModalTitle>관리자 인증</ModalTitle>
          <ModalInput
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {isCapsLockOn && <CapsLockWarning>Caps Lock이 켜져 있습니다.</CapsLockWarning>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <ModalButton onClick={handlePasswordSubmit}>확인</ModalButton>
        </ModalContent>
      </ModalOverlay>
    );
  }

  // 기존 콘텐츠 렌더링
  if (loading) {
    return <AdminContainer><p>데이터를 불러오는 중...</p></AdminContainer>;
  }

  const teamCount = getTeamCount(teams);
  const validQuarterIndices = getValidQuarterIndices(teamCount);

  return (
    <AdminContainer>
      <AdminHeader>팀 & 경기 관리 시스템</AdminHeader>
      
      <FormGroup>
        <Label>경기 날짜</Label>
        <Input 
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormGroup>

      {teams.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>설정된 팀 목록</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {teams.map((team, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span>ID: {team.id} - {team.name}</span>
                <Button
                  onClick={() => handleTeamDelete(team.id)}
                  style={{
                    width: 'auto',
                    padding: '4px 8px',
                    backgroundColor: '#e74c3c',
                    marginLeft: '10px'
                  }}
                >
                  <TrashIcon />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <PanelSectionTitle>쿼터 관리</PanelSectionTitle>
      <FormGroup>
        <Label>활성 쿼터 선택</Label>
        <Select onChange={(e) => setActiveQuarterIndex(parseInt(e.target.value))}>
          {validQuarterIndices.map((idx) => (
            <option key={idx} value={idx}>쿼터 {idx + 1}</option>
          ))}
        </Select>
      </FormGroup>

      {quarters.length > 0 && quarters[activeQuarterIndex] ? (
        <div key={activeQuarterIndex} style={{ marginBottom: '20px' }}>
          <h3>쿼터 {activeQuarterIndex + 1} ({getMatchupDescription(activeQuarterIndex)})</h3>
          
          <TeamManagementGrid>
            <TeamSettingsPanel>
              <PanelSectionTitle>팀 설정 (쿼터 {activeQuarterIndex + 1})</PanelSectionTitle>
              
              <FormGroup>
                <Label>팀 선택</Label>
                <Select onChange={(e) => setActiveTeamIndex(parseInt(e.target.value))}>
                  {(quarters[activeQuarterIndex].teams || []).map((team, idx) => (
                    <option key={idx} value={idx}>
                      팀 {String.fromCharCode(65 + idx)} ({team?.name || '이름 미정'})
                    </option>
                  ))}
                </Select>
              </FormGroup>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <Button 
                  onClick={() => addTeam(activeQuarterIndex)}
                  style={{ width: 'auto', backgroundColor: '#3498db' }}
                  disabled={teamCount >= 3}
                >
                  <PlusIcon /> 팀 추가
                </Button>
                <Select 
                  value={selectedTeam} 
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  style={{ width: '120px' }}
                >
                  <option value="팀 A">팀 A</option>
                  <option value="팀 B">팀 B</option>
                  <option value="팀 C">팀 C</option>
                </Select>
                <Button 
                  onClick={handleTeamSave}
                  style={{ width: 'auto', backgroundColor: '#2ecc71' }}
                >
                  <PlusIcon /> 팀 저장하기
                </Button>
              </div>
              
              <FormGroup>
                <Label>팀 이름</Label>
                <Input
                  type="text"
                  placeholder="팀 이름을 입력하세요"
                  value={quarters[activeQuarterIndex].teams[activeTeamIndex]?.name || ''}
                  onChange={(e) => handleQuarterChange(activeQuarterIndex, activeTeamIndex, 'name', e.target.value)}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>포메이션</Label>
                <FormationSelector
                  value={quarters[activeQuarterIndex].teams[activeTeamIndex]?.formation || '4-4-2'}
                  onChange={(e) => handleQuarterChange(activeQuarterIndex, activeTeamIndex, 'formation', e.target.value)}
                >
                  {Object.keys(formations).map((formation) => (
                    <option key={formation} value={formation}>{formation}</option>
                  ))}
                </FormationSelector>
              </FormGroup>
              
              <PanelSectionTitle>선수 추가 (쿼터 {activeQuarterIndex + 1})</PanelSectionTitle>
              {(quarters[activeQuarterIndex].teams[activeTeamIndex]?.players || []).map((player, index) => (
                <FormGroup key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <Label>{player.position}</Label>
                    <CreatableSelect
                      options={playerOptions}
                      value={player.name ? playerOptions.find(opt => opt.value === player.name) : null}
                      onChange={(selected) => addPlayerToTeam(activeQuarterIndex, activeTeamIndex, selected, player.position)}
                      placeholder={`선수 검색 또는 새 선수 입력 (${player.position})`}
                      styles={customSelectStyles}
                      isClearable
                      isSearchable
                      isDisabled={loading}
                      formatCreateLabel={(inputValue) => `새 선수 추가: ${inputValue}`}
                    />
                  </div>
                  <Button
                    onClick={() => fixPlayerAcrossQuarters(activeQuarterIndex, activeTeamIndex, player.position, player.name, player.backNumber)}
                    style={{
                      width: 'auto',
                      padding: '8px 12px',
                      backgroundColor: player.name ? '#3498db' : '#ccc',
                      cursor: player.name ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    disabled={!player.name}
                  >
                    <LockIcon /> 고정
                  </Button>
                </FormGroup>
              ))}
              
              <TeamSummary>
                <div className="summary-item">
                  <div className="value">{quarters[activeQuarterIndex].teams[activeTeamIndex]?.players.filter(p => p.name).length || 0}</div>
                  <div className="label">선수</div>
                </div>
                <div className="summary-item">
                  <div className="value">
                    {quarters[activeQuarterIndex].teams[activeTeamIndex]?.players.filter(p => p.name).length 
                      ? Math.round(quarters[activeQuarterIndex].teams[activeTeamIndex].players.filter(p => p.name).reduce((sum, p) => sum + getPlayerRating(p.name), 0) / quarters[activeQuarterIndex].teams[activeTeamIndex].players.filter(p => p.name).length) 
                      : 0}
                  </div>
                  <div className="label">평균 능력치</div>
                </div>
                <div className="summary-item">
                  <div className="value">{quarters[activeQuarterIndex].teams[activeTeamIndex]?.formation || '4-4-2'}</div>
                  <div className="label">포메이션</div>
                </div>
              </TeamSummary>
            </TeamSettingsPanel>
            
            <FieldContainer>
              <FieldViewTitle>
                필드 배치도 (쿼터 {activeQuarterIndex + 1})
                <span>{quarters[activeQuarterIndex].teams[activeTeamIndex]?.formation || '4-4-2'} 포메이션</span>
              </FieldViewTitle>
              
              <FieldView>
                <GoalArea className="top" />
                <GoalArea className="bottom" />
                <PenaltyArea className="top" />
                <PenaltyArea className="bottom" />
                <GoalPost className="top" />
                <GoalPost className="bottom" />
                
                <DragDropContext onDragEnd={(result) => onDragEnd(result, activeQuarterIndex, activeTeamIndex)}>
                  <Droppable droppableId={`team-${activeTeamIndex}-quarter-${activeQuarterIndex}`}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {(quarters[activeQuarterIndex].teams[activeTeamIndex]?.players || []).map((player, index) => {
                          const rating = getPlayerRating(player.name);
                          const playerKey = `${activeQuarterIndex}-${index}`;
                          return (
                            <Draggable key={playerKey} draggableId={playerKey} index={index}>
                              {(provided) => (
                                <PlayerCard
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{ 
                                    top: player.top, 
                                    left: player.left,
                                    opacity: player.name ? 1 : 0.4,
                                    ...provided.draggableProps.style,
                                    background: 'linear-gradient(135deg, #3498db, #2980b9)'
                                  }}
                                  formation={quarters[activeQuarterIndex].teams[activeTeamIndex]?.formation || '4-4-2'}
                                  position={player.position}
                                  data-ismyteam={true}
                                >
                                  <PlayerImage hasImage={false} />
                                  <PlayerInfo>
                                    <div className="name">{player.name || '선수 없음'}</div>
                                    <div className="position">{player.position}</div>
                                    {player.name && (
                                      <div className="rating">{rating}</div>
                                    )}
                                  </PlayerInfo>
                                </PlayerCard>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </FieldView>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <Button 
                  onClick={resetCurrentQuarter}
                  style={{ 
                    width: 'auto', 
                    backgroundColor: '#e74c3c'
                  }}
                >
                  <ResetIcon /> 쿼터 초기화
                </Button>
              </div>
              
              <PanelSectionTitle>공격 포인트 (쿼터 {activeQuarterIndex + 1})</PanelSectionTitle>
              
              {quarters[activeQuarterIndex].goalAssistPairs.map((pair, pairIndex) => (
                <div key={pairIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                    <Select
                      value={pair.goal.team}
                      onChange={(e) => handleGoalAssistPairChange(activeQuarterIndex, pairIndex, 'goal', 'team', e.target.value)}
                      style={{ flex: 0.5 }}
                    >
                      <option value="">팀 선택</option>
                      {(quarters[activeQuarterIndex].teams || []).filter(team => team.name).map((team, idx) => (
                        <option key={idx} value={team.name}>{team.name}</option>
                      ))}
                    </Select>
                    <CreatableSelect
                      options={getTeamPlayerOptions(activeQuarterIndex, pair.goal.team)}
                      value={pair.goal.player ? getTeamPlayerOptions(activeQuarterIndex, pair.goal.team).find(option => option.value === pair.goal.player) || null : null}
                      onChange={(selected) => handleGoalAssistPairChange(activeQuarterIndex, pairIndex, 'goal', 'player', selected || '')}
                      placeholder={pair.goal.team ? "골 선수 검색" : "먼저 팀을 선택하세요"}
                      styles={customSelectStyles}
                      isClearable
                      isSearchable
                      isDisabled={loading || !pair.goal.team}
                      formatCreateLabel={(inputValue) => `새 선수 추가: ${inputValue}`}
                    />
                  </div>
                  <span>←</span>
                  <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                    <Select
                      value={pair.assist.team}
                      onChange={(e) => handleGoalAssistPairChange(activeQuarterIndex, pairIndex, 'assist', 'team', e.target.value)}
                      style={{ flex: 0.5 }}
                    >
                      <option value="">팀 선택</option>
                      {(quarters[activeQuarterIndex].teams || []).filter(team => team.name).map((team, idx) => (
                        <option key={idx} value={team.name}>{team.name}</option>
                      ))}
                    </Select>
                    <CreatableSelect
                      options={getTeamPlayerOptions(activeQuarterIndex, pair.assist.team)}
                      value={pair.assist.player ? getTeamPlayerOptions(activeQuarterIndex, pair.assist.team).find(option => option.value === pair.assist.player) || null : null}
                      onChange={(selected) => handleGoalAssistPairChange(activeQuarterIndex, pairIndex, 'assist', 'player', selected || '')}
                      placeholder={pair.assist.team ? "어시스트 선수 검색 (선택)" : "먼저 팀을 선택하세요"}
                      styles={customSelectStyles}
                      isClearable
                      isSearchable
                      isDisabled={loading || !pair.assist.team}
                      formatCreateLabel={(inputValue) => `새 선수 추가: ${inputValue}`}
                    />
                  </div>
                  <Button 
                    onClick={() => removeGoalAssistPair(activeQuarterIndex, pairIndex)}
                    style={{ width: 'auto', padding: '0 10px', backgroundColor: '#e74c3c' }}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              ))}
              
              <Button 
                onClick={() => addGoalAssistPair(activeQuarterIndex)}
                style={{ marginBottom: '20px', width: 'auto' }}
              >
                <PlusIcon /> 골-어시스트 추가
              </Button>
            </FieldContainer>
          </TeamManagementGrid>
        </div>
      ) : (
        <p style={{ color: '#666', fontSize: '16px', textAlign: 'center', padding: '20px' }}>
          쿼터 데이터가 없습니다. 초기화하거나 경기를 새로 등록해주세요.
        </p>
      )}
      
      <SaveButton onClick={handleAddMatch} style={{ marginTop: '20px' }}>
        {isEditing ? '경기 수정하기' : '경기 등록하기'}
      </SaveButton>
      
      <PanelSectionTitle style={{ marginTop: '30px' }}>
        등록된 경기 목록
      </PanelSectionTitle>
      
      <FormGroup style={{ maxWidth: '300px' }}>
        <Label>날짜 필터</Label>
        <Select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        >
          <option value="all">모든 날짜</option>
          {dates.map(date => (
            <option key={date} value={date}>
              {formatDate(date)}
            </option>
          ))}
        </Select>
      </FormGroup>
      
      {loading ? (
        <p>경기 목록을 불러오는 중...</p>
      ) : filteredMatches.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          {filteredMatches.map(match => (
            <div key={match.id} style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{ fontWeight: '600', fontSize: '18px' }}>
                  {match.quarters && match.quarters[0].teams && match.quarters[0].teams.length > 0
                    ? match.quarters[0].teams.map(t => t.name || '이름 미정').join(' vs ')
                    : '경기 정보 없음'}
                </div>
                {/* Badge가 정의되지 않은 경우 임시로 span 태그로 대체 */}
                {/* <span style={{ backgroundColor: '#3498db', color: '#fff', padding: '4px 8px', borderRadius: '4px' }}>{formatDate(match.date)}</span> */}
                <Badge type="vod">{formatDate(match.date)}</Badge>
              </div>
              
              {match.quarters && match.quarters.length > 0 ? (
                validQuarterIndices.map((idx) => (
                  <div key={idx} style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      쿼터 {idx + 1}: {match.quarters[idx].teams && match.quarters[idx].teams.length > 0 
                        ? match.quarters[idx].teams.map(t => t.name || '이름 미정').join(' vs ') 
                        : '팀 정보 없음'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {(match.quarters[idx].goalAssistPairs && match.quarters[idx].goalAssistPairs.filter(pair => pair.goal.player).length) || 0} 골 / 
                      {(match.quarters[idx].goalAssistPairs && match.quarters[idx].goalAssistPairs.filter(pair => pair.assist.player).length) || 0} 어시스트
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      포메이션: {match.quarters[idx].teams && match.quarters[idx].teams.length > 0 
                        ? match.quarters[idx].teams.map(t => t.formation || '미정').join(' vs ') 
                        : '포메이션 정보 없음'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: '#999' }}>쿼터 정보 없음</div>
              )}
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Button
                  onClick={() => handleEditMatch(match)}
                  style={{ 
                    width: 'auto', 
                    padding: '8px 16px', 
                    backgroundColor: '#f1c40f',
                    fontSize: '14px'
                  }}
                >
                  <EditIcon /> 수정
                </Button>
                <Button
                  onClick={() => handleDeleteMatch(match.id)}
                  style={{ 
                    width: 'auto', 
                    padding: '8px 16px', 
                    backgroundColor: '#e74c3c',
                    fontSize: '14px'
                  }}
                >
                  <TrashIcon /> 삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#666', fontSize: '16px', textAlign: 'center', padding: '20px' }}>
          등록된 경기가 없습니다.
        </p>
      )}
    </AdminContainer>
  );
}

export default MatchAdminPage;