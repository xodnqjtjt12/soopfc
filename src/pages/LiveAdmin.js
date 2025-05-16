import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../App';
import { format } from 'date-fns';
import * as S from './LiveAdminCss';
import eyeIcon from '../icons/eye_icon.png';
import eyeOffIcon from '../icons/eye_off_icon.png';

// 포지션 옵션
const POSITIONS = {
  GK: '골키퍼',
  CB: '수비수',
  MF: '미드필더',
  FW: '공격수'
};

// 빈 선수 객체 생성 함수
const createEmptyPlayer = () => ({
  nick: '',
  position: 'GK'
});

const LiveAdmin = () => {
  const [teamCount, setTeamCount] = useState(2);
  const [dateTime, setDateTime] = useState('');
  const [teams, setTeams] = useState([
    { name: '', captain: '', color: '#000000', players: [createEmptyPlayer()], cheerCount: 0 },
    { name: '', captain: '', color: '#00b7eb', players: [createEmptyPlayer()], cheerCount: 0 }
  ]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedLineups, setSavedLineups] = useState([]);
  const [editingLineupId, setEditingLineupId] = useState(null);
  const [originalTeamName, setOriginalTeamName] = useState(null);
  const [editingCheerCount, setEditingCheerCount] = useState({});
  const [matchCheers, setMatchCheers] = useState({
    teamA: { name: '', cheers: 0 },
    teamB: { name: '', cheers: 0 }
  });
  const [isEditingMatchCheers, setIsEditingMatchCheers] = useState(false);
  // 비밀번호 인증 상태
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [logs, setLogs] = useState([]);

  // 로그 추가 헬퍼
  const addLog = (msg) => {
    const ts = new Date().toLocaleString();
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  };

  // 비밀번호 입력/확인
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handlePasswordKeyEvent = (e) => setCapsLockOn(e.getModifierState('CapsLock'));
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'alves') {
      setIsAuthenticated(true);
      addLog('관리자 로그인 성공');
    } else {
      alert('비밀번호가 올바르지 않습니다.');
      addLog('관리자 로그인 실패');
    }
  };
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // 저장된 라인업 및 매치 응원 데이터 불러오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchLineups();
    }
  }, [isAuthenticated]);

  const fetchLineups = async () => {
    try {
      // 팀 라인업 조회
      const teamsSnap = await getDocs(collection(db, 'live'));
      const lineups = [];
      for (const teamDoc of teamsSnap.docs) {
        const teamId = teamDoc.id;
        console.log(`Fetching data for team: ${teamId}`);
        const playersSnap = await getDocs(collection(db, 'live', teamId, 'players'));
        let cheerCount = 0;
        try {
          const cheerRef = doc(db, 'live', teamId, 'cheers');
          console.log(`Fetching team cheers document: live/${teamId}/cheers`);
          const cheerDoc = await getDoc(cheerRef);
          cheerCount = cheerDoc.exists() ? cheerDoc.data().cheerCount : 0;
          console.log(`Fetched team cheers for ${teamId}: ${cheerCount}`);
        } catch (cheerError) {
          console.error(`Error fetching team cheers for ${teamId}:`, cheerError.message);
          cheerCount = 0;
        }
        const players = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        lineups.push({
          teamName: teamId,
          players,
          date: players[0]?.date || '',
          captain: teamDoc.data().captain || '',
          color: teamDoc.data().color || '#000000',
          cheerCount
        });
      }
      setSavedLineups(lineups.sort((a, b) => new Date(b.date) - new Date(a.date)));
      console.log('Fetched lineups:', lineups);
      addLog(`라인업 데이터 조회 (${lineups.length}개 팀)`);

      // 매치 응원 데이터 조회
      const matchId = `match_${format(new Date(), 'yyyyMMdd')}`;
      try {
        const cheerRef = doc(db, 'cheers', matchId);
        console.log(`Fetching match cheers document: cheers/${matchId}`);
        const cheerDoc = await getDoc(cheerRef);
        if (cheerDoc.exists()) {
          setMatchCheers(cheerDoc.data());
          console.log(`Fetched match cheers for ${matchId}:`, cheerDoc.data());
          addLog(`매치 응원 데이터 조회: ${matchId}`);
        } else {
          setMatchCheers({
            teamA: { name: lineups[0]?.teamName || 'TeamA', cheers: 0 },
            teamB: { name: lineups[1]?.teamName || 'TeamB', cheers: 0 }
          });
          console.log(`No match cheers found for ${matchId}, initialized default`);
          addLog(`매치 응원 데이터 없음, 기본값 설정: ${matchId}`);
        }
      } catch (cheerError) {
        console.error(`Error fetching match cheers for ${matchId}:`, cheerError.message);
        setMatchCheers({
          teamA: { name: lineups[0]?.teamName || 'TeamA', cheers: 0 },
          teamB: { name: lineups[1]?.teamName || 'TeamB', cheers: 0 }
        });
        addLog(`매치 응원 조회 오류: ${cheerError.message}`);
      }
    } catch (err) {
      console.error('Error fetching lineups:', err.message, err.code);
      setError('라인업 불러오기 중 오류가 발생했습니다: ' + err.message);
      addLog(`라인업 조회 오류: ${err.message}`);
    }
  };

  const handleTeamChange = (index, field, value) => {
    const newTeams = [...teams];
    newTeams[index][field] = value;
    setTeams(newTeams);
    console.log('Updated teams:', newTeams);
    addLog(`팀 데이터 업데이트: 팀 ${index + 1} ${field}=${value}`);
  };

  const handlePlayerChange = (teamIndex, playerIndex, field, value) => {
    const newTeams = [...teams];
    newTeams[teamIndex].players[playerIndex][field] = value;
    setTeams(newTeams);
    console.log('Updated players for team', teamIndex, ':', newTeams[teamIndex].players);
    addLog(`선수 데이터 업데이트: 팀 ${teamIndex + 1}, 선수 ${playerIndex + 1} ${field}=${value}`);
  };

  const addPlayer = (teamIndex) => {
    const newTeams = [...teams];
    if (newTeams[teamIndex].players.length >= 20) {
      setError('각 팀은 최대 20명의 선수만 등록할 수 있습니다.');
      addLog(`선수 추가 실패: 팀 ${teamIndex + 1} 최대 20명 초과`);
      return;
    }
    newTeams[teamIndex].players.push(createEmptyPlayer());
    setTeams(newTeams);
    console.log('Added player to team', teamIndex, ':', newTeams[teamIndex].players);
    addLog(`선수 추가: 팀 ${teamIndex + 1}`);
  };

  const removePlayer = (teamIndex, playerIndex) => {
    const newTeams = [...teams];
    if (newTeams[teamIndex].players.length <= 1) {
      setError('최소 한 명의 선수는 유지해야 합니다.');
      addLog(`선수 삭제 실패: 팀 ${teamIndex + 1} 최소 1명 유지`);
      return;
    }
    newTeams[teamIndex].players.splice(playerIndex, 1);
    setTeams(newTeams);
    console.log('Removed player from team', teamIndex, ':', newTeams[teamIndex].players);
    addLog(`선수 삭제: 팀 ${teamIndex + 1}, 선수 ${playerIndex + 1}`);
  };

  const handleTeamCountChange = (count) => {
    setTeamCount(count);
    setTeams(
      Array(count).fill().map((_, i) => ({
        name: '',
        captain: '',
        color: i % 2 === 0 ? '#000000' : '#00b7eb',
        players: [createEmptyPlayer()],
        cheerCount: 0
      }))
    );
    console.log('Changed team count to', count);
    addLog(`팀 수 변경: ${count}개`);
  };

  const validateTeamName = (name) => {
    if (!name || name.trim() === '') {
      return '팀 이름은 비어있을 수 없습니다.';
    }
    if (name.includes('/') || name.includes('#') || name.includes('[') || name.includes(']')) {
      return '팀 이름에 /, #, [, ] 문자를 포함할 수 없습니다.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // 유효성 검사
    if (!dateTime) {
      setError('경기 날짜와 시간을 입력해주세요.');
      addLog('라인업 저장 실패: 경기 날짜 미입력');
      return;
    }

    let dateISO;
    try {
      dateISO = new Date(dateTime).toISOString();
      console.log('Date ISO:', dateISO);
    } catch (err) {
      setError('유효하지 않은 날짜 형식입니다.');
      console.error('Date parsing error:', err);
      addLog(`라인업 저장 실패: 잘못된 날짜 형식 (${err.message})`);
      return;
    }

    for (const team of teams) {
      const nameError = validateTeamName(team.name);
      if (nameError) {
        setError(nameError);
        addLog(`라인업 저장 실패: ${nameError}`);
        return;
      }
      if (!team.captain) {
        setError('모든 팀의 주장을 입력해주세요.');
        addLog('라인업 저장 실패: 주장 미입력');
        return;
      }
      if (team.players.length === 0) {
        setError('각 팀에 최소 한 명의 선수를 추가해주세요.');
        addLog('라인업 저장 실패: 선수 미등록');
        return;
      }
      for (const player of team.players) {
        if (!player.nick || !player.position) {
          setError('모든 선수의 닉네임과 포지션을 입력해주세요.');
          addLog('라인업 저장 실패: 선수 정보 불완전');
          return;
        }
      }
    }

    try {
      console.log('Submitting teams:', teams);
      addLog(`라인업 저장 시작: ${teams.length}개 팀`);

      // 중복 팀 이름 확인
      const existingTeams = await getDocs(collection(db, 'live'));
      const teamNames = teams.map(t => t.name);
      for (const teamName of teamNames) {
        if (editingLineupId && teamName === originalTeamName) continue;
        if (existingTeams.docs.some(doc => doc.id === teamName)) {
          setError(`팀 이름 "${teamName}"은 이미 존재합니다.`);
          addLog(`라인업 저장 실패: 중복 팀 이름 ${teamName}`);
          return;
        }
      }

      // 매치 응원 데이터 준비
      const matchId = `match_${format(new Date(dateISO), 'yyyyMMdd')}`;
      const cheerDocRef = doc(db, 'cheers', matchId);
      const cheerData = {
        teamA: { name: teams[0].name, cheers: Number(matchCheers.teamA.cheers) || 0 },
        teamB: { name: teams[1].name, cheers: Number(matchCheers.teamB.cheers) || 0 }
      };

      for (const [index, team] of teams.entries()) {
        const teamDocRef = doc(db, 'live', team.name);
        const teamCheerDocRef = doc(db, 'live', team.name, 'cheers');
        console.log(`Processing team: ${team.name}`);
        addLog(`팀 처리: ${team.name}`);

        // 편집 모드: 기존 선수 데이터 삭제
        if (editingLineupId && originalTeamName === team.name) {
          const playersSnap = await getDocs(collection(db, 'live', team.name, 'players'));
          for (const playerDoc of playersSnap.docs) {
            console.log(`Deleting existing player: ${playerDoc.id}`);
            await deleteDoc(doc(db, 'live', team.name, 'players', playerDoc.id));
            addLog(`기존 선수 삭제: ${team.name}, ${playerDoc.id}`);
          }
        }

        // 선수 데이터 저장
        for (const [playerIndex, player] of team.players.entries()) {
          const playerData = {
            id: playerIndex + 1,
            nick: player.nick,
            position: player.position,
            date: dateISO
          };
          console.log(`Adding player ${player.nick} to ${team.name}`);
          await addDoc(collection(db, 'live', team.name, 'players'), playerData);
          addLog(`선수 추가: ${team.name}, ${player.nick}`);
        }

        // 팀 메타데이터 저장
        console.log(`Saving team metadata for ${team.name}`);
        await setDoc(teamDocRef, {
          captain: team.captain,
          color: team.color,
          date: dateISO
        }, { merge: true });
        addLog(`팀 메타데이터 저장: ${team.name}`);

        // 팀 응원 데이터 저장
        console.log(`Saving team cheers for ${team.name}: ${team.cheerCount}`);
        await setDoc(teamCheerDocRef, {
          cheerCount: Number(team.cheerCount) || 0,
          updatedAt: new Date().toISOString()
        });
        console.log(`Updated team cheers for ${team.name}: ${team.cheerCount}`);
        addLog(`팀 응원 데이터 저장: ${team.name}, ${team.cheerCount}`);
      }

      // 매치 응원 데이터 저장
      console.log(`Saving match cheers for ${matchId}:`, cheerData);
      await setDoc(cheerDocRef, cheerData);
      console.log(`Updated match cheers for ${matchId}:`, cheerData);
      addLog(`매치 응원 데이터 저장: ${matchId}, ${JSON.stringify(cheerData)}`);

      // 편집 모드: 원래 팀 이름 변경 시 기존 문서 삭제
      if (editingLineupId && originalTeamName && originalTeamName !== teams[0].name) {
        console.log(`Deleting original team: ${originalTeamName}`);
        const oldPlayersSnap = await getDocs(collection(db, 'live', originalTeamName, 'players'));
        for (const playerDoc of oldPlayersSnap.docs) {
          await deleteDoc(doc(db, 'live', originalTeamName, 'players', playerDoc.id));
          addLog(`기존 선수 삭제: ${originalTeamName}, ${playerDoc.id}`);
        }
        await deleteDoc(doc(db, 'live', originalTeamName));
        await deleteDoc(doc(db, 'live', originalTeamName, 'cheers'));
        console.log(`Deleted team cheers for ${originalTeamName}`);
        addLog(`기존 팀 삭제: ${originalTeamName}`);
      }

      setMessage(editingLineupId ? '라인업이 성공적으로 수정되었습니다.' : '라인업이 성공적으로 저장되었습니다.');
      addLog(`라인업 저장 완료: ${editingLineupId ? '수정' : '추가'}`);
      // 폼 초기화
      setDateTime('');
      setTeams(
        Array(teamCount).fill().map((_, i) => ({
          name: '',
          captain: '',
          color: i % 2 === 0 ? '#000000' : '#00b7eb',
          players: [createEmptyPlayer()],
          cheerCount: 0
        }))
      );
      setEditingLineupId(null);
      setOriginalTeamName(null);
      setEditingCheerCount({});
      setMatchCheers({
        teamA: { name: '', cheers: 0 },
        teamB: { name: '', cheers: 0 }
      });
      setIsEditingMatchCheers(false);
      fetchLineups();
    } catch (err) {
      console.error('Error saving lineup:', err.message, err.code, err.stack);
      setError(`라인업 저장 중 오류가 발생했습니다: ${err.message} (코드: ${err.code})`);
      addLog(`라인업 저장 오류: ${err.message}`);
    }
  };

  const handleEdit = (lineup) => {
    setMessage('');
    setError('');
    setEditingLineupId(lineup.teamName);
    setOriginalTeamName(lineup.teamName);
    setDateTime(format(new Date(lineup.date), 'yyyy-MM-dd\'T\'HH:mm'));
    setTeamCount(1);
    setTeams([{
      name: lineup.teamName,
      captain: lineup.captain,
      color: lineup.color,
      players: lineup.players.map(p => ({
        nick: p.nick,
        position: p.position
      })),
      cheerCount: lineup.cheerCount
    }]);
    setEditingCheerCount({ [lineup.teamName]: lineup.cheerCount });
    console.log('Editing lineup:', lineup);
    addLog(`라인업 편집 시작: ${lineup.teamName}`);
  };

  const handleCancelEdit = () => {
    setMessage('');
    setError('');
    setEditingLineupId(null);
    setOriginalTeamName(null);
    setDateTime('');
    setTeamCount(2);
    setTeams([
      { name: '', captain: '', color: '#000000', players: [createEmptyPlayer()], cheerCount: 0 },
      { name: '', captain: '', color: '#00b7eb', players: [createEmptyPlayer()], cheerCount: 0 }
    ]);
    setEditingCheerCount({});
    setMatchCheers({
      teamA: { name: '', cheers: 0 },
      teamB: { name: '', cheers: 0 }
    });
    setIsEditingMatchCheers(false);
    console.log('Cancelled editing');
    addLog('라인업 편집 취소');
  };

  const handleDelete = async (teamName) => {
    if (window.confirm('정말로 이 라인업을 삭제하시겠습니까?')) {
      try {
        console.log(`Deleting team: ${teamName}`);
        const playersSnap = await getDocs(collection(db, 'live', teamName, 'players'));
        for (const playerDoc of playersSnap.docs) {
          console.log(`Deleting player: ${playerDoc.id}`);
          await deleteDoc(doc(db, 'live', teamName, 'players', playerDoc.id));
          addLog(`선수 삭제: ${teamName}, ${playerDoc.id}`);
        }
        await deleteDoc(doc(db, 'live', teamName));
        await deleteDoc(doc(db, 'live', teamName, 'cheers'));
        console.log(`Deleted team cheers for ${teamName}`);
        addLog(`팀 삭제: ${teamName}`);
        setMessage('라인업이 삭제되었습니다.');
        fetchLineups();
      } catch (err) {
        console.error('Error deleting lineup:', err.message, err.code);
        setError(`라인업 삭제 중 오류가 발생했습니다: ${err.message}`);
        addLog(`라인업 삭제 오류: ${err.message}`);
      }
    }
  };

  const handleResetCheers = async (teamName) => {
    if (window.confirm(`"${teamName}" 팀의 응원 데이터를 초기화하시겠습니까?`)) {
      try {
        const cheerDocRef = doc(db, 'live', teamName, 'cheers');
        await setDoc(cheerDocRef, {
          cheerCount: 0,
          updatedAt: new Date().toISOString()
        });
        console.log(`Reset team cheers for ${teamName}`);
        addLog(`팀 응원 초기화: ${teamName}`);
        setMessage(`"${teamName}" 팀의 응원 데이터가 초기화되었습니다.`);
        fetchLineups();
      } catch (err) {
        console.error('Error resetting team cheers:', err.message, err.code);
        setError(`응원 데이터 초기화 중 오류가 발생했습니다: ${err.message}`);
        addLog(`팀 응원 초기화 오류: ${err.message}`);
      }
    }
  };

  const handleResetMatchCheers = async () => {
    if (window.confirm('매치의 응원 데이터를 초기화하시겠습니까?')) {
      try {
        const matchId = `match_${format(new Date(), 'yyyyMMdd')}`;
        const cheerDocRef = doc(db, 'cheers', matchId);
        const resetData = {
          teamA: { name: matchCheers.teamA.name || savedLineups[0]?.teamName || 'TeamA', cheers: 0 },
          teamB: { name: matchCheers.teamB.name || savedLineups[1]?.teamName || 'TeamB', cheers: 0 }
        };
        await setDoc(cheerDocRef, resetData);
        console.log(`Reset match cheers for ${matchId}`);
        addLog(`매치 응원 초기화: ${matchId}`);
        setMessage('매치 응원 데이터가 초기화되었습니다.');
        setMatchCheers(resetData);
        setIsEditingMatchCheers(false);
        fetchLineups();
      } catch (err) {
        console.error('Error resetting match cheers:', err.message, err.code);
        setError(`매치 응원 데이터 초기화 중 오류가 발생했습니다: ${err.message}`);
        addLog(`매치 응원 초기화 오류: ${err.message}`);
      }
    }
  };

  const handleEditMatchCheers = () => {
    setIsEditingMatchCheers(true);
    setMessage('');
    setError('');
    console.log('Started editing match cheers');
    addLog('매치 응원 편집 시작');
  };

  const handleSaveMatchCheers = async () => {
    try {
      const matchId = `match_${format(new Date(), 'yyyyMMdd')}`;
      const cheerDocRef = doc(db, 'cheers', matchId);
      const cheerData = {
        teamA: { name: matchCheers.teamA.name || savedLineups[0]?.teamName || 'TeamA', cheers: Number(matchCheers.teamA.cheers) || 0 },
        teamB: { name: matchCheers.teamB.name || savedLineups[1]?.teamName || 'TeamB', cheers: Number(matchCheers.teamB.cheers) || 0 }
      };
      await setDoc(cheerDocRef, cheerData);
      console.log(`Saved match cheers for ${matchId}:`, cheerData);
      addLog(`매치 응원 저장: ${matchId}, ${JSON.stringify(cheerData)}`);
      setMessage('매치 응원 데이터가 수정되었습니다.');
      setIsEditingMatchCheers(false);
      fetchLineups();
    } catch (err) {
      console.error('Error saving match cheers:', err.message, err.code);
      setError(`매치 응원 데이터 수정 중 오류가 발생했습니다: ${err.message}`);
      addLog(`매치 응원 저장 오류: ${err.message}`);
    }
  };

  const handleMatchCheerChange = (team, value) => {
    setMatchCheers(prev => ({
      ...prev,
      [team]: { ...prev[team], cheers: value }
    }));
    console.log(`Updated match cheer count for ${team}: ${value}`);
    addLog(`매치 응원 업데이트: ${team}, ${value}`);
  };

  const handleCheerCountChange = (teamName, value) => {
    setEditingCheerCount(prev => ({ ...prev, [teamName]: value }));
    const newTeams = teams.map(team =>
      team.name === teamName ? { ...team, cheerCount: value } : team
    );
    setTeams(newTeams);
    console.log(`Updated team cheerCount for ${teamName}: ${value}`);
    addLog(`팀 응원 업데이트: ${teamName}, ${value}`);
  };

  const renderPositionOptions = () => {
    return Object.keys(POSITIONS).map(pos => (
      <option key={pos} value={pos}>{POSITIONS[pos]}</option>
    ));
  };

  return (
    <S.Container>
      {!isAuthenticated ? (
        <form onSubmit={handlePasswordSubmit}>
          <S.Header>관리자 페이지 접근</S.Header>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <S.Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handlePasswordKeyEvent}
              onKeyUp={handlePasswordKeyEvent}
              placeholder="비밀번호 입력"
            />
            <S.TogglePasswordVisibility
              src={showPassword ? eyeIcon : eyeOffIcon}
              alt="Toggle Password Visibility"
              onClick={toggleShowPassword}
            />
          </div>
          {capsLockOn && <S.ErrorMessage>Caps Lock이 켜져 있습니다.</S.ErrorMessage>}
          <S.Button type="submit">확인</S.Button>
          {/* 로그 표시 */}
          {logs.length > 0 && (
            <S.LogsContainer>
              <S.Header>로그</S.Header>
              {logs.map((log, i) => (
                <S.LogItem key={i}>{log}</S.LogItem>
              ))}
            </S.LogsContainer>
          )}
        </form>
      ) : (
        <>
          <S.SectionTitle>{editingLineupId ? '라인업 수정' : '경기 라인업 관리'} (라인업은 설정한 시간에서 5시간전에나옴)</S.SectionTitle>
          
          <S.FormContainer onSubmit={handleSubmit}>
            <S.Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
            
            {!editingLineupId && (
              <S.RadioGroup>
                <S.RadioLabel>
                  <input
                    type="radio"
                    name="teamCount"
                    value={2}
                    checked={teamCount === 2}
                    onChange={() => handleTeamCountChange(2)}
                  />
                  2팀
                </S.RadioLabel>
                <S.RadioLabel>
                  <input
                    type="radio"
                    name="teamCount"
                    value={3}
                    checked={teamCount === 3}
                    onChange={() => handleTeamCountChange(3)}
                  />
                  3팀
                </S.RadioLabel>
              </S.RadioGroup>
            )}

            {teams.map((team, teamIndex) => (
              <S.TeamSection key={teamIndex}>
                <S.TeamTitle>팀 {teamIndex + 1}</S.TeamTitle>
                <S.Input
                  type="text"
                  value={team.name}
                  onChange={(e) => handleTeamChange(teamIndex, 'name', e.target.value)}
                  placeholder="팀 이름"
                />
                <S.Input
                  type="text"
                  value={team.captain}
                  onChange={(e) => handleTeamChange(teamIndex, 'captain', e.target.value)}
                  placeholder="주장 이름"
                />
                <S.Select
                  value={team.color}
                  onChange={(e) => handleTeamChange(teamIndex, 'color', e.target.value)}
                >
                  <option value="#000000">검정</option>
                  <option value="#00b7eb">하늘색</option>
                  <option value="#FFA500">주황색</option>
                  <option value="#FF0000">빨강</option>
                  <option value="#0000FF">파랑</option>
                  <option value="#FFFFFF">흰색</option>
                </S.Select>
                {editingLineupId && (
                  <S.Input
                    type="number"
                    value={team.cheerCount}
                    onChange={(e) => handleTeamChange(teamIndex, 'cheerCount', e.target.value)}
                    placeholder="팀 응원 수"
                    min="0"
                  />
                )}
                
                <h4>선수 명단 (최대 20명)</h4>
                {team.players.map((player, playerIndex) => (
                  <S.PlayerRow key={playerIndex}>
                    <S.Input
                      type="text"
                      value={player.nick}
                      onChange={(e) => handlePlayerChange(teamIndex, playerIndex, 'nick', e.target.value)}
                      placeholder="닉네임"
                      style={{ flex: 2 }}
                    />
                    <S.Select
                      value={player.position}
                      onChange={(e) => handlePlayerChange(teamIndex, playerIndex, 'position', e.target.value)}
                      style={{ flex: 2 }}
                    >
                      {renderPositionOptions()}
                    </S.Select>
                    <S.IconButton 
                      type="button" 
                      onClick={() => removePlayer(teamIndex, playerIndex)}
                    >
                      🗑️
                    </S.IconButton>
                  </S.PlayerRow>
                ))}
                
                <S.AddButton 
                  type="button" 
                  onClick={() => addPlayer(teamIndex)}
                  disabled={team.players.length >= 20}
                >
                  선수 추가
                </S.AddButton>
              </S.TeamSection>
            ))}

            {teamCount >= 2 && (
              <S.TeamSection>
                <S.TeamTitle>매치 응원 데이터</S.TeamTitle>
                <S.Input
                  type="number"
                  value={matchCheers.teamA.cheers}
                  onChange={(e) => handleMatchCheerChange('teamA', e.target.value)}
                  placeholder={`${matchCheers.teamA.name || 'TeamA'} 응원 수`}
                  min="0"
                />
                <S.Input
                  type="number"
                  value={matchCheers.teamB.cheers}
                  onChange={(e) => handleMatchCheerChange('teamB', e.target.value)}
                  placeholder={`${matchCheers.teamB.name || 'TeamB'} 응원 수`}
                  min="0"
                />
              </S.TeamSection>
            )}

            <S.SaveButton type="submit">
              {editingLineupId ? '수정 완료' : '라인업 저장'}
            </S.SaveButton>
            
            {editingLineupId && (
              <S.DeleteButton type="button" onClick={handleCancelEdit}>
                수정 취소
              </S.DeleteButton>
            )}
            
            {message && <S.Message>{message}</S.Message>}
            {error && <S.Message error>{error}</S.Message>}
          </S.FormContainer>

          <S.SavedLineupsContainer>
            <S.SectionTitle>저장된 라인업 목록</S.SectionTitle>
            {savedLineups.length === 0 ? (
              <p>저장된 라인업이 없습니다.</p>
            ) : (
              <>
                <S.MatchCheerSection>
                  <S.SavedLineupTitle>
                    매치 응원:{' '}
                    {isEditingMatchCheers ? (
                      <>
                        <S.Input
                          type="number"
                          value={matchCheers.teamA.cheers}
                          onChange={(e) => handleMatchCheerChange('teamA', e.target.value)}
                          style={{ width: '80px', marginLeft: '5px' }}
                          min="0"
                        />
                        {' 회, '}
                        <S.Input
                          type="number"
                          value={matchCheers.teamB.cheers}
                          onChange={(e) => handleMatchCheerChange('teamB', e.target.value)}
                          style={{ width: '80px', marginLeft: '5px' }}
                          min="0"
                        />
                        {' 회'}
                      </>
                    ) : (
                      `${matchCheers.teamA.name || 'TeamA'} ${matchCheers.teamA.cheers}회, ${matchCheers.teamB.name || 'TeamB'} ${matchCheers.teamB.cheers}회`
                    )}
                  </S.SavedLineupTitle>
                  <S.SavedLineupActions>
                    {isEditingMatchCheers ? (
                      <S.EditButton onClick={handleSaveMatchCheers}>저장</S.EditButton>
                    ) : (
                      <S.EditButton onClick={handleEditMatchCheers}>매치 응원 수정</S.EditButton>
                    )}
                    <S.DeleteButton onClick={handleResetMatchCheers}>매치 응원 초기화</S.DeleteButton>
                  </S.SavedLineupActions>
                </S.MatchCheerSection>
                {savedLineups.map((lineup, index) => (
                  <S.SavedLineup key={index}>
                    <S.SavedLineupHeader>
                      <S.SavedLineupTitle>
                        {lineup.teamName} ({lineup.date ? format(new Date(lineup.date), 'yyyy-MM-dd HH:mm') : '날짜 미정'})
                        <span style={{ marginLeft: '10px' }}>
                          {editingLineupId === lineup.teamName ? (
                            <S.Input
                              type="number"
                              value={editingCheerCount[lineup.teamName] || lineup.cheerCount}
                              onChange={(e) => handleCheerCountChange(lineup.teamName, e.target.value)}
                              style={{ width: '80px', marginLeft: '5px' }}
                              min="0"
                            />
                          ) : (
                            `팀 응원: ${lineup.cheerCount}회`
                          )}
                        </span>
                      </S.SavedLineupTitle>
                      <S.SavedLineupActions>
                        <S.EditButton onClick={() => handleEdit(lineup)}>수정</S.EditButton>
                        <S.DeleteButton onClick={() => handleDelete(lineup.teamName)}>삭제</S.DeleteButton>
                        <S.DeleteButton onClick={() => handleResetCheers(lineup.teamName)}>팀 응원 초기화</S.DeleteButton>
                      </S.SavedLineupActions>
                    </S.SavedLineupHeader>
                    <S.SavedLineupTeams>
                      <S.SavedLineupTeam>
                        <S.SavedLineupTeamHeader>
                          {lineup.teamName}
                        </S.SavedLineupTeamHeader>
                        <S.SavedLineupPlayers>
                          {lineup.players.map((player, playerIndex) => (
                            <li key={playerIndex}>
                              {player.nick} ({POSITIONS[player.position]})
                            </li>
                          ))}
                        </S.SavedLineupPlayers>
                      </S.SavedLineupTeam>
                    </S.SavedLineupTeams>
                  </S.SavedLineup>
                ))}
              </>
            )}
          </S.SavedLineupsContainer>
          {/* 로그 표시 */}
          {logs.length > 0 && (
            <S.LogsContainer>
              <S.Header>로그</S.Header>
              {logs.map((log, i) => (
                <S.LogItem key={i}>{log}</S.LogItem>
              ))}
            </S.LogsContainer>
          )}
        </>
      )}
    </S.Container>
  );
};

export default LiveAdmin;