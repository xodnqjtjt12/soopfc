import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, getDocs, query, orderBy, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import * as S from './VodPageCss';

// Position mirror map
const MIRROR_POSITION = {
  LB: 'RB', RB: 'LB',
  LW: 'RW', RW: 'LW',
  LWB: 'RWB', RWB: 'LWB',
  LM: 'RM', RM: 'LM'
};

// Chevron Icon
const ChevronIcon = ({ isOpen }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="2.5"
    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
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
      { position: 'RB', left: '20%', top: '85%' },
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
      { position: 'GK', top: '2%', left: '50%', transform: 'translate(-50%, 0)' },
      { position: 'RB', top: '12%', left: '14%' },
      { position: 'CB1', top: '12%', left: '34%' },
      { position: 'CB2', top: '12%', left: '54%' },
      { position: 'LB', top: '12%', left: '74%' },
      { position: 'CM1', top: '24%', left: '24%' },
      { position: 'CM2', top: '24%', left: '44%' },
      { position: 'CM3', top: '24%', left: '64%' },
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

// Normalize team name
const normalizeTeamName = (name) => name ? name.trim().toLowerCase() : '';

// Calculate scores for a single quarter
const calculateScores = (pairs = [], ownGoals = [], teams) =>
  teams.map(t => {
    const teamName = normalizeTeamName(t.name);
    const goals = pairs.filter(p => normalizeTeamName(p.goal.team) === teamName).length || 0;
    const opponentTeam = teams.find(team => normalizeTeamName(team.name) !== teamName);
    const ownGoalsCount = opponentTeam && ownGoals
      ? ownGoals.filter(og => normalizeTeamName(og.team) === normalizeTeamName(opponentTeam.name)).length
      : 0;
    return { name: t.name, goals: goals + ownGoalsCount, points: 0 };
  });

// Calculate total scores
const calculateTotalScores = (quarters) => {
  const isPointsBased = quarters.length > 4;

  const teamStats = quarters.reduce((acc, q) => {
    const scores = calculateScores(q.goalAssistPairs || [], q.ownGoals || [], q.teams);

    const teams = q.teams.map(team => team.name);
    teams.forEach(team => {
      if (!acc[team]) {
        acc[team] = { goals: 0, points: 0 };
      }
      const teamScore = scores.find(s => s.name === team);
      acc[team].goals += teamScore?.goals || 0;
    });

    if (teams.length >= 3) {
      const pairs = [];
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          pairs.push([teams[i], teams[j]]);
        }
      }
      pairs.forEach(([team1, team2]) => {
        const goals1 = scores.find(s => s.name === team1)?.goals || 0;
        const goals2 = scores.find(s => s.name === team2)?.goals || 0;
        if (goals1 > goals2) {
          acc[team1].points += 3;
        } else if (goals1 < goals2) {
          acc[team2].points += 3;
        } else {
          acc[team1].points += 1;
          acc[team2].points += 1;
        }
      });
    } else if (teams.length === 2) {
      const [team1, team2] = teams;
      const goals1 = scores.find(s => s.name === team1)?.goals || 0;
      const goals2 = scores.find(s => s.name === team2)?.goals || 0;
      if (goals1 > goals2) {
        acc[team1].points += 3;
      } else if (goals1 < goals2) {
        acc[team2].points += 3;
      } else {
        acc[team1].points += 1;
        acc[team2].points += 1;
      }
    }
    return acc;
  }, {});

  const teams = Object.keys(teamStats);
  const isMultiTeam = teams.length >= 3;

  let winner = null;
  if (isPointsBased || isMultiTeam) {
    const maxPoints = Math.max(...Object.values(teamStats).map(stat => stat.points));
    const topTeams = teams.filter(t => teamStats[t].points === maxPoints);
    if (topTeams.length === 1) winner = topTeams[0];
    else if (topTeams.length > 1) {
      const maxGoals = Math.max(...topTeams.map(t => teamStats[t].goals));
      const topGoalTeams = topTeams.filter(t => teamStats[t].goals === maxGoals);
      winner = topGoalTeams.length === 1 ? topGoalTeams[0] : null;
    }
  } else if (teams.length === 2) {
    const maxGoals = Math.max(...Object.values(teamStats).map(stat => stat.goals));
    const topTeams = teams.filter(t => teamStats[t].goals === maxGoals);
    winner = topTeams.length === 1 ? topTeams[0] : null;
  }

  return { teamStats, winner, isMultiTeam };
};

// PlayerCard implementation inside field
const renderFormation = (team, isHomeTeam, isMobile, side, goalAssistPairs, ownGoals = [], handlePlayerClick) => {
  if (!team?.players?.length) return null;

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
      if (!isHomeTeam && newPos.position === 'GK') { newPos.top = '47%'; newPos.left = '93%'; }
      if (!isHomeTeam) {
        if (newPos.position === 'GK') { newPos.top = '47%'; newPos.left = '94%'; }
        if (newPos.position.startsWith('CB1')) { newPos.top = '35%'; newPos.left = '85%'; }
        if (newPos.position.startsWith('CB2')) { newPos.top = '55%'; newPos.left = '85%'; }
        if (newPos.position.startsWith('CDM1')) { newPos.top = '55%'; newPos.left = '77%'; }
        if (newPos.position.startsWith('CDM2')) { newPos.top = '35%'; newPos.left = '77%'; }
        if (newPos.position.startsWith('LB')) { newPos.top = '8%'; newPos.left = '85%'; }
        if (newPos.position.startsWith('RB')) { newPos.top = '85%'; newPos.left = '85%'; }
        if (newPos.position.startsWith('CAM')) { newPos.top = '47%'; newPos.left = '67%'; }
        if (newPos.position.startsWith('RW')) { newPos.top = '80%'; newPos.left = '55%'; }
        if (newPos.position.startsWith('LW')) { newPos.top = '20%'; newPos.left = '55%'; }
        if (newPos.position.startsWith('ST')) { newPos.top = '47%'; newPos.left = '55%'; }
        if (newPos.position.startsWith('ST1')) { newPos.top = '35%'; newPos.left = '55%'; }
        if (newPos.position.startsWith('ST2')) { newPos.top = '60%'; newPos.left = '55%'; }
      }
    } else {
      if (!isHomeTeam) {
        if (newPos.position === 'GK') newPos.top = '92%';
        else if (newPos.position.includes('CB') || newPos.position.includes('RB') || newPos.position.includes('LB')) newPos.top = '85%';
        else if (newPos.position.includes('CM') || newPos.position.includes('RM') || newPos.position.includes('LM')) newPos.top = '70%';
        else if (newPos.position.includes('CDM1') || newPos.position.includes('CDM2')) newPos.top = '74%';
        else if (newPos.position.includes('CAM')) newPos.top = '65%';
        else if (newPos.position.includes('ST') || newPos.position.includes('RW') || newPos.position.includes('LW')) newPos.top = '56%';
        else if (newPos.position === 'CAM') newPos.top = '63%';
        else if (newPos.position.includes('CDM')) newPos.top = '71%';
        else if (newPos.position === 'RWB' || newPos.position === 'LWB') newPos.top = '70%';
      }
    }
    if (!isHomeTeam) { newPos.position = MIRROR_POSITION[newPos.position] || newPos.position; }
    return newPos;
  });

  return team.players.map((player, i) => {
    const pos = positions.find(p => p.position === player.position) || positions[i % positions.length];
    const goals = goalAssistPairs?.filter(g => g.goal.player === player.name).length || 0;
    const assists = goalAssistPairs?.filter(a => a.assist.player === player.name).length || 0;
    const ownGoalsCount = ownGoals?.filter(og => og.player === player.name).length || 0;

    return (
      <S.PlayerCard
        key={`${side}-${i}`}
        style={{ left: pos.left, top: pos.top, transform: pos.transform }}
        onClick={() => handlePlayerClick(player)}
      >
        <div className="avatar-wrap">
          <img src={player.avatarUrl || '/profile_default.svg'} onError={e => e.target.src = '/profile_default.svg'} alt={player.name} />
        </div>
        <span className="name">{player.name}</span>
        <div className="stats-icons">
          {goals > 0 && <span>⚽{goals > 1 ? goals : ''}</span>}
          {assists > 0 && <span>👟{assists > 1 ? assists : ''}</span>}
          {ownGoalsCount > 0 && <span>🥅</span>}
        </div>
      </S.PlayerCard>
    );
  });
};

function VodPage() {
  const [matches, setMatches] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [filterDate, setFilterDate] = useState('all');
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [openQuarters, setOpenQuarters] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState([]);
  const datesPerPage = 5;
  const navigate = useNavigate();

  const filterOptions = [
    { value: 'win', label: '승' }, { value: 'draw', label: '무' }, { value: 'loss', label: '패' },
    { value: 'goal', label: '골' }, { value: 'assist', label: '어시스트' }, { value: 'clean', label: '클린시트' },
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { fetchMatches(); }, []);

  useEffect(() => {
    const yearDates = matches
      .filter(m => m.date && new Date(m.date).getFullYear().toString() === selectedYear)
      .map(m => m.date)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b) - new Date(a));
    setDates(yearDates); setFilterDate('all'); setCurrentPage(1);
  }, [selectedYear, matches]);

  useEffect(() => {
    let result = matches.filter(m => m.date && new Date(m.date).getFullYear().toString() === selectedYear);
    if (nickname) {
      result = result.map(match => {
        const filteredQuarters = match.quarters.filter(quarter =>
          quarter.teams.some(team => team.players.some(player => player.name.toLowerCase() === nickname.toLowerCase()))
        );
        return filteredQuarters.length > 0 ? { ...match, quarters: filteredQuarters } : null;
      }).filter(Boolean);
    }
    if (filters.length > 0) {
      result = result.filter(match => {
        let satisfies = false;
        const myTeam = match.quarters[0].teams.find(t => t.players.some(p => p.name.toLowerCase() === nickname.toLowerCase()))?.name;
        const { teamStats, winner } = calculateTotalScores(match.quarters);
        const isWin = winner === myTeam;
        const isDraw = winner === null && myTeam;
        const isLoss = myTeam && !isWin && !isDraw;

        let hasGoal = false, hasAssist = false, hasClean = false;
        const defensivePositions = ['CB1', 'CB2', 'LB', 'RB', 'LWB', 'RWB', 'GK'];

        match.quarters.forEach(q => {
          const myTeamInQuarter = q.teams.find(t => t.players.some(p => p.name.toLowerCase() === nickname.toLowerCase()));
          if (!myTeamInQuarter) return;
          const player = myTeamInQuarter.players.find(p => p.name.toLowerCase() === nickname.toLowerCase());
          if (q.goalAssistPairs?.some(p => p.goal.player.toLowerCase() === nickname.toLowerCase())) hasGoal = true;
          if (q.goalAssistPairs?.some(p => p.assist.player?.toLowerCase() === nickname.toLowerCase())) hasAssist = true;
          if (defensivePositions.includes(player?.position)) {
            const opponentTeam = q.teams.find(t => t.name !== myTeamInQuarter.name);
            const opponentGoals = (q.goalAssistPairs?.filter(p => normalizeTeamName(p.goal.team) === normalizeTeamName(opponentTeam?.name)).length || 0);
            if (opponentGoals === 0) hasClean = true;
          }
        });

        if (filters.includes('win') && isWin) satisfies = true;
        if (filters.includes('draw') && isDraw) satisfies = true;
        if (filters.includes('loss') && isLoss) satisfies = true;
        if (filters.includes('goal') && hasGoal) satisfies = true;
        if (filters.includes('assist') && hasAssist) satisfies = true;
        if (filters.includes('clean') && hasClean) satisfies = true;
        return satisfies;
      });
    }
    if (filterDate !== 'all') result = result.filter(m => m.date === filterDate);
    const paginatedDates = dates.slice((currentPage - 1) * datesPerPage, currentPage * datesPerPage);
    if (filterDate === 'all') result = result.filter(m => paginatedDates.includes(m.date));
    setFilteredMatches(result);
  }, [selectedYear, filterDate, nickname, matches, currentPage, dates, filters]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({
        id: doc.id,
        date: doc.data().date,
        quarters: (doc.data().quarters || []).map((q, idx) => ({
          ...q, quarterIndex: idx + 1,
          teams: (q.teams || []).map(t => ({
            ...t, formation: t.formation || '4-3-3',
            players: (t.players || []).map(p => ({ ...p, position: p.position || 'GK' }))
          }))
        }))
      }));
      setMatches(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const toggleQuarter = (matchId, idx) => {
    const key = `${matchId}-${idx}`;
    setOpenQuarters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePageChange = (p) => { setCurrentPage(p); setFilterDate('all'); };

  const totalPages = Math.ceil(dates.length / datesPerPage);

  if (loading) return <LoadingScreen />;

  return (
    <S.Container>
      <S.MainContent>
        <S.Header>
          <S.HeaderLeft>
            <S.Title>SOOP FC 경기 기록</S.Title>
            <S.Subtitle>정규 리그 및 이벤트 매치의 모든 데이터를 확인하세요</S.Subtitle>
          </S.HeaderLeft>

          <S.HeaderRight>
            <S.YearToggle>
              <S.ToggleButton active={selectedYear === '2025'} onClick={() => setSelectedYear('2025')}>2025년</S.ToggleButton>
              <S.ToggleButton active={selectedYear === '2026'} onClick={() => setSelectedYear('2026')}>2026년</S.ToggleButton>
            </S.YearToggle>
            <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
              <S.TossSelect value={filterDate} onChange={e => setFilterDate(e.target.value)}>
                <option value="all">모든 날짜</option>
                {dates.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
              </S.TossSelect>
              <S.MyRecordButton onClick={() => setShowModal(true)}>기록 검색</S.MyRecordButton>
            </div>
          </S.HeaderRight>
        </S.Header>

        {showModal && (
          <S.PopupOverlay onClick={() => setShowModal(false)}>
            <S.PopupContent onClick={e => e.stopPropagation()}>
              <S.PopupHeader>
                <h3>경기 기록 검색</h3>
                <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#adb5bd' }} onClick={() => setShowModal(false)}>✕</button>
              </S.PopupHeader>
              <S.PopupBody>
                <S.SearchInput
                  type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요" autoFocus
                />
                <h4 style={{ fontSize: '14px', color: '#4e5968', marginBottom: '12px' }}>성적 필터</h4>
                <S.FilterGrid>
                  {filterOptions.map(opt => (
                    <S.FilterLabel key={opt.value}>
                      <input
                        type="checkbox" checked={filters.includes(opt.value)}
                        onChange={e => e.target.checked ? setFilters([...filters, opt.value]) : setFilters(filters.filter(f => f !== opt.value))}
                      />
                      {opt.label}
                    </S.FilterLabel>
                  ))}
                </S.FilterGrid>
              </S.PopupBody>
              <S.PopupFooter>
                <button className="cancel" onClick={() => { setNickname(''); setFilters([]); setShowModal(false); }}>초기화</button>
                <button className="confirm" onClick={() => setShowModal(false)}>검색하기</button>
              </S.PopupFooter>
            </S.PopupContent>
          </S.PopupOverlay>
        )}

        {filteredMatches.length ? filteredMatches.map(match => {
          const { teamStats, winner, isMultiTeam } = calculateTotalScores(match.quarters);
          return (
            <S.MatchSection key={match.id}>
              <S.MatchHeader>
                <S.DateBadge>{formatDate(match.date)}</S.DateBadge>
                <S.ScoreDisplay>
                  {isMultiTeam ? (
                    Object.entries(teamStats).map(([team, stats], idx) => (
                      <React.Fragment key={team}>
                        <span>{team} {stats.points}</span>
                        {idx < Object.keys(teamStats).length - 1 && <span className="vs">vs</span>}
                      </React.Fragment>
                    ))
                  ) : (
                    Object.entries(teamStats).map(([team, stats], idx) => (
                      <React.Fragment key={team}>
                        <span>{team} {stats.goals}</span>
                        {idx < Object.keys(teamStats).length - 1 && <span className="vs">vs</span>}
                      </React.Fragment>
                    ))
                  )}
                  {winner && <span className="winner">🏆 {winner} 승리</span>}
                </S.ScoreDisplay>
              </S.MatchHeader>

              {match.quarters.map((q, i) => {
                const isOpen = openQuarters[`${match.id}-${i}`];
                const quarterScores = calculateScores(q.goalAssistPairs, q.ownGoals, q.teams);
                return (
                  <S.QuarterSection key={i}>
                    <S.QuarterHeader onClick={() => toggleQuarter(match.id, i)}>
                      <div className="q-title">쿼터 {q.quarterIndex}</div>
                      <ChevronIcon isOpen={isOpen} />
                    </S.QuarterHeader>
                    <S.QuarterContent isOpen={isOpen}>
                      <S.QuarterScoreBoard>
                        {quarterScores.map((s, si) => (
                          <React.Fragment key={si}>
                            <div className="team-info">
                              <span className="team-name">{s.name}</span>
                              <span className="score">{s.goals}</span>
                            </div>
                            {si < quarterScores.length - 1 && <span className="vs-label">VS</span>}
                          </React.Fragment>
                        ))}
                      </S.QuarterScoreBoard>

                      <S.FieldContainer>
                        <S.FieldView>
                          <div className="center-line" />
                          <div className="center-circle" />
                          {isMobile ? (
                            <>
                              <div style={{ height: '50%', position: 'relative' }}>
                                {renderFormation(q.teams[0], true, true, 'home', q.goalAssistPairs, q.ownGoals, n => navigate(`/player-history/${encodeURIComponent(n)}`))}
                              </div>
                              <div style={{ height: '50%', position: 'relative' }}>
                                {renderFormation(q.teams[1], false, true, 'away', q.goalAssistPairs, q.ownGoals, n => navigate(`/player-history/${encodeURIComponent(n)}`))}
                              </div>
                            </>
                          ) : (
                            <>
                              {renderFormation(q.teams[0], true, false, 'home', q.goalAssistPairs, q.ownGoals, n => navigate(`/player-history/${encodeURIComponent(n)}`))}
                              {renderFormation(q.teams[1], false, false, 'away', q.goalAssistPairs, q.ownGoals, n => navigate(`/player-history/${encodeURIComponent(n)}`))}
                            </>
                          )}
                        </S.FieldView>
                      </S.FieldContainer>

                      <S.TeamsGrid>
                        {q.teams.map((t, ti) => (
                          <S.TeamCard key={ti}>
                            <h4>{t.name} <S.FormationBadge>{t.formation}</S.FormationBadge></h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                              {t.players.map((p, pi) => (
                                <div key={pi} style={{ fontSize: '13px', color: '#4e5968', display: 'flex', gap: '4px' }}>
                                  <span style={{ fontWeight: 800, color: '#adb5bd' }}>{p.backNumber}</span>
                                  <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/player-history/${encodeURIComponent(p.name)}`)}>{p.name}</span>
                                </div>
                              ))}
                            </div>
                          </S.TeamCard>
                        ))}
                      </S.TeamsGrid>

                      <S.StatSection>
                        <S.StatTitle>공격 포인트</S.StatTitle>
                        {q.goalAssistPairs.length > 0 ? q.goalAssistPairs.map((p, pi) => (
                          <S.StatCard key={pi}>
                            <div className="main-info">
                              <span className="role">GOAL</span>
                              <span className="player-name">{p.goal.player}</span>
                              <span style={{ fontSize: '14px' }}>⚽</span>
                            </div>
                            <div className="partner-info">
                              {p.assist.player ? `도움: ${p.assist.player} 👟` : '자력 득점'}
                            </div>
                          </S.StatCard>
                        )) : <S.EmptyState style={{ padding: '20px' }}>공격 포인트 기록이 없습니다.</S.EmptyState>}
                        {q.ownGoals?.map((og, oi) => (
                          <S.StatCard key={`og-${oi}`} style={{ borderColor: '#f04452' }}>
                            <div className="main-info">
                              <span className="role" style={{ background: '#fff0f0', color: '#f04452' }}>OWN GOAL</span>
                              <span className="player-name">{og.player}</span>
                            </div>
                            <div className="partner-info">자책골 🥅</div>
                          </S.StatCard>
                        ))}
                      </S.StatSection>
                    </S.QuarterContent>
                  </S.QuarterSection>
                );
              })}
            </S.MatchSection>
          );
        }) : <S.EmptyState>표시할 경기 기록이 없습니다.</S.EmptyState>}

        {totalPages > 1 && (
          <S.PaginationWrapper>
            <S.PaginationButton disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>이전</S.PaginationButton>
            {[...Array(totalPages)].map((_, i) => (
              <S.PaginationButton key={i + 1} active={currentPage === i + 1} onClick={() => handlePageChange(i + 1)}>{i + 1}</S.PaginationButton>
            ))}
            <S.PaginationButton disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>다음</S.PaginationButton>
          </S.PaginationWrapper>
        )}
      </S.MainContent>
    </S.Container>
  );
}

export default VodPage;