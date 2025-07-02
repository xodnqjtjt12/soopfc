import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, getDoc, query } from 'firebase/firestore';
import { db } from '../App';
import { format } from 'date-fns';
import styled from 'styled-components';
import * as S from './LiveAdminCss';
import eyeIcon from '../icons/eye_icon.png';
import eyeOffIcon from '../icons/eye_off_icon.png';

// 포지션 옵션 확장
const POSITIONS = {
  GK: '골키퍼',
  RB: '오른쪽 풀백',
  LB: '왼쪽 풀백',
  CB: '중앙수비수',
  CDM: '수비형 미드필더',
  CM: '중앙 미드필더',
  CAM: '공격형 미드필더',
  LW: '왼쪽 윙어',
  RW: '오른쪽 윙어',
  ST: '스트라이커',
  FW: '공격수'
};

const SuggestionsList = styled.ul`
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  list-style: none;
  margin-top: 4px;
  padding: 0;
  width: 100%;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background: #f0f0f0;
  }
`;

// 빈 선수 객체 생성 함수
const createEmptyPlayer = () => ({
  nick: '',
  position: 'GK'
});

// 오늘 날짜 포맷팅 (YYYYMMDD)
const formatDate = (date) => {
  const kstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// 날짜 및 시간 포맷팅 (YYYY-MM-DD HH:MM)
const formatDateTimeDisplay = (date) => {
  const kstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  const hours = String(kstDate.getHours()).padStart(2, '0');
  const minutes = String(kstDate.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const LiveAdmin = () => {
  const [teamCount, setTeamCount] = useState(2);
  const [dateTime, setDateTime] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [teams, setTeams] = useState([
    { name: '', captain: '', color: '#000000', players: [createEmptyPlayer()], cheerCount: 0 },
    { name: '', captain: '', color: '#00b7eb', players: [createEmptyPlayer()], cheerCount: 0 }
  ]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedLineups, setSavedLineups] = useState([]);
  const [editingLineupId, setEditingLineupId] = useState(null);
  const [originalTeamNames, setOriginalTeamNames] = useState([]);
  const [editingCheerCount, setEditingCheerCount] = useState({});
  const [matchCheers, setMatchCheers] = useState([]);
  const [isEditingMatchCheers, setIsEditingMatchCheers] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isHomeExposed, setIsHomeExposed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [playerPositionHistory, setPlayerPositionHistory] = useState({});

  const today = formatDate(new Date());

  const addLog = (msg) => {
    const ts = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  };

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

  const fetchAllPlayers = async () => {
    try {
      const playersSnap = await getDocs(collection(db, 'players'));
      const playersList = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllPlayers(playersList);
      addLog(`전체 선수 목록 로드: ${playersList.length}명`);
    } catch (err) {
      console.error('Error fetching all players:', err.message);
      addLog(`전체 선수 목록 로드 오류: ${err.message}`);
    }
  };

  const unifyPosition = (position) => {
    const positionMap = {
      'CB1': 'CB', 'CB2': 'CB',
      'CDM1': 'CDM', 'CDM2': 'CDM',
      'CM1': 'CM', 'CM2': 'CM',
    };
    return positionMap[position] || position;
  };

  const buildPlayerPositionHistory = async () => {
    try {
      const quartersQuery = query(collection(db, 'matches'));
      const quartersSnapshot = await getDocs(quartersQuery);
      const history = {};

      quartersSnapshot.forEach((matchDoc) => {
        const quarters = matchDoc.data().quarters || [];
        quarters.forEach((quarter) => {
          quarter.teams.forEach((team) => {
            team.players.forEach((player) => {
              if (player.name) {
                if (!history[player.name]) {
                  history[player.name] = {};
                }
                const unifiedPos = unifyPosition(player.position);
                history[player.name][unifiedPos] = (history[player.name][unifiedPos] || 0) + 1;
              }
            });
          });
        });
      });
      setPlayerPositionHistory(history);
      addLog('선수 포지션 기록 빌드 완료');
    } catch (err) {
      console.error('포지션 기록 빌드 오류:', err.message);
      addLog(`포지션 기록 빌드 오류: ${err.message}`);
    }
  };

  // 노출 시간에 따라 isHomeExposed 업데이트
  useEffect(() => {
    if (!isAuthenticated || !startDateTime || !endDateTime) return;

    const checkExposure = () => {
      const now = new Date();
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      const isExposed = now >= start && now <= end;
      setIsHomeExposed(isExposed);
      addLog(`홈 노출 상태 업데이트: ${isExposed ? '활성화' : '비활성화'} (현재: ${now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' })}, 시작: ${start.toLocaleString('en-US', { timeZone: 'Asia/Seoul' })}, 종료: ${end.toLocaleString('en-US', { timeZone: 'Asia/Seoul' })}})`);
    };

    checkExposure(); // 즉시 실행
    const interval = setInterval(checkExposure, 60000); // 1분마다 확인

    return () => clearInterval(interval);
  }, [isAuthenticated, startDateTime, endDateTime]);

  // 초기 데이터 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchLineups();
      fetchAllPlayers();
      buildPlayerPositionHistory();
      const voteStatusRef = doc(db, 'voteStatus', today);
      getDoc(voteStatusRef).then((voteStatusDoc) => {
        if (voteStatusDoc.exists()) {
          const { matchDate, startDateTime, endDateTime } = voteStatusDoc.data();
          setDateTime(matchDate ? formatDateTimeDisplay(new Date(matchDate)) : '');
          setStartDateTime(startDateTime ? formatDateTimeDisplay(new Date(startDateTime)) : '');
          setEndDateTime(endDateTime ? formatDateTimeDisplay(new Date(endDateTime)) : '');
          addLog('voteStatus 데이터 로드 완료');
        } else {
          setDateTime('');
          setStartDateTime('');
          setEndDateTime('');
          addLog('voteStatus 데이터 없음, 기본값 설정');
          // voteStatus 문서 초기화
          setDoc(voteStatusRef, {
            matchDate: new Date().toISOString(),
            startDateTime: new Date().toISOString(),
            endDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            isEnabled: true
          }).then(() => {
            addLog(`voteStatus/${today} 초기화`);
          }).catch((err) => {
            console.error('voteStatus 초기화 오류:', err.message);
            addLog(`voteStatus 초기화 오류: ${err.message}`);
          });
        }
      }).catch((err) => {
        console.error('Error fetching vote status:', err.message);
        setError('투표 상태 불러오기 오류: ' + err.message);
        addLog('투표 상태 불러오기 오류: ' + err.message);
      });
    }
  }, [isAuthenticated, today]);

  const fetchLineups = async () => {
    try {
      setLoading(true);
      const teamsSnap = await getDocs(collection(db, 'live'));
      const lineups = [];
      const matchDates = new Set();

      for (const teamDoc of teamsSnap.docs) {
        const teamId = teamDoc.id;
        console.log(`Fetching data for team: ${teamId}`);
        const playersSnap = await getDocs(collection(db, 'live', teamId, 'players'));
        let cheerCount = 0;
        try {
          const cheerRef = doc(db, 'live', teamId, 'cheers', 'count');
          const cheerDoc = await getDoc(cheerRef);
          cheerCount = cheerDoc.exists() ? cheerDoc.data().cheerCount || 0 : 0;
          console.log(`Fetched team cheers for ${teamId}: ${cheerCount}`);
        } catch (cheerError) {
          console.error(`Error fetching team cheers for ${teamId}:`, cheerError.message);
          cheerCount = 0;
        }
        const players = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const teamData = {
          teamName: teamId,
          players,
          date: players[0]?.date || '',
          captain: teamDoc.data().captain || '',
          color: teamDoc.data().color || '#000000',
          cheerCount
        };
        lineups.push(teamData);
        if (teamData.date) matchDates.add(teamData.date);
      }

      // 동일한 matchDate로 그룹화
      const groupedLineups = Array.from(matchDates).map(date => ({
        date,
        teams: lineups.filter(lineup => lineup.date === date)
      }));
      groupedLineups.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSavedLineups(groupedLineups);
      console.log('Grouped lineups:', groupedLineups);
      addLog(`라인업 데이터 조회 (${groupedLineups.length}개 매치)`);

      const matchId = `match_${today}`;
      try {
        const cheerRef = doc(db, 'cheers', matchId);
        const cheerDoc = await getDoc(cheerRef);
        if (cheerDoc.exists()) {
          const data = cheerDoc.data();
          setMatchCheers(data.teams || []);
          setStartDateTime(data.startDateTime ? formatDateTimeDisplay(new Date(data.startDateTime)) : '');
          setEndDateTime(data.endDateTime ? formatDateTimeDisplay(new Date(data.endDateTime)) : '');
          console.log(`Fetched match cheers for ${matchId}:`, data);
          addLog(`매치 응원 데이터 조회: ${matchId}`);
        } else {
          const defaultCheers = lineups
            .filter(lineup => formatDate(new Date(lineup.date)) === today)
            .map(team => ({
              name: team.teamName,
              cheers: 0
            }));
          setMatchCheers(defaultCheers);
          console.log(`No match cheers found for ${matchId}, initialized default:`, defaultCheers);
          addLog(`매치 응원 데이터 없음, 기본값 설정: ${matchId}`);
        }
      } catch (cheerError) {
        console.error(`Error fetching match cheers for ${matchId}:`, cheerError.message);
        const defaultCheers = lineups
          .filter(lineup => formatDate(new Date(lineup.date)) === today)
          .map(team => ({
            name: team.teamName,
            cheers: 0
          }));
        setMatchCheers(defaultCheers);
        addLog(`매치 응원 조회 오류: ${cheerError.message}`);
      }
    } catch (err) {
      console.error('Error fetching lineups:', err.message, err.code);
      setError('라인업 불러오기 중 오류가 발생했습니다: ' + err.message);
      addLog(`라인업 조회 오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = (index, field, value) => {
    const newTeams = [...teams];
    newTeams[index][field] = value;
    setTeams(newTeams);
    console.log('Updated teams:', newTeams);
    addLog(`팀 데이터 업데이트: 팀 ${index + 1} ${field}=${value}`);
  };

  const getMostFrequentPosition = (playerName) => {
    const positions = playerPositionHistory[playerName];
    if (!positions || Object.keys(positions).length === 0) {
      return 'GK'; // Default if no history
    }

    const positionCounts = Object.entries(positions);
    const sortedPositions = positionCounts.sort((a, b) => b[1] - a[1]);
    return sortedPositions[0][0];
  };

  const handlePlayerChange = (teamIndex, playerIndex, field, value) => {
    const newTeams = [...teams];
    newTeams[teamIndex].players[playerIndex][field] = value;
    setTeams(newTeams);

    if (field === 'nick') {
      setActiveInput({ teamIndex, playerIndex });
      if (value) {
        const filteredSuggestions = allPlayers.filter(p =>
          p.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions([]);
      }
    }
  };

  const handlePlayerSelect = (teamIndex, playerIndex, player) => {
    const newTeams = [...teams];
    const mainPosition = getMostFrequentPosition(player.name);

    newTeams[teamIndex].players[playerIndex] = {
      ...newTeams[teamIndex].players[playerIndex],
      nick: player.name,
      position: mainPosition,
    };

    setTeams(newTeams);
    setSuggestions([]);
    setActiveInput(null);
    addLog(`선수 선택: 팀 ${teamIndex + 1}, ${player.name}, 포지션: ${mainPosition}`);
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
    const newTeams = Array(count).fill().map((_, i) => ({
      name: '',
      captain: '',
      color: i % 3 === 0 ? '#000000' : (i % 3 === 1 ? '#00b7eb' : '#FFA500'),
      players: [createEmptyPlayer()],
      cheerCount: 0
    }));
    setTeams(newTeams);
    setMatchCheers(newTeams.map(team => ({ name: team.name, cheers: 0 })));
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

  // 홈 노출 토글 제거 (시간 기반으로 자동 제어되므로 불필요)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!dateTime || !startDateTime || !endDateTime) {
      setError('경기 날짜, 노출 시작 시간, 노출 종료 시간을 입력해주세요.');
      addLog('라인업 저장 실패: 날짜 또는 시간 미입력');
      return;
    }

    let dateISO, startISO, endISO;
    try {
      dateISO = new Date(dateTime).toISOString();
      startISO = new Date(startDateTime).toISOString();
      endISO = new Date(endDateTime).toISOString();
      if (new Date(startISO) >= new Date(endISO)) {
        setError('노출 종료 시간이 시작 시간보다 빠를 수 없습니다.');
        addLog('라인업 저장 실패: 잘못된 노출 기간');
        return;
      }
      console.log('Date ISO:', dateISO, 'startDateTime:', startISO, 'endDateTime:', endISO);
    } catch (err) {
      setError('유효하지 않은 날짜 또는 시간 형식입니다.');
      console.error('Date parsing error:', err);
      addLog('라인업 저장 실패: 잘못된 날짜/시간 형식 (' + err.message + ')');
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
      setLoading(true);
      console.log('Submitting teams:', teams);
      addLog(`라인업 저장 시작: ${teams.length}개 팀`);

      const existingTeams = await getDocs(collection(db, 'live'));
      const teamNames = teams.map(t => t.name);
      for (const teamName of teamNames) {
        if (editingLineupId && originalTeamNames.includes(teamName)) continue;
        if (existingTeams.docs.some(doc => doc.id === teamName)) {
          setError(`팀 이름 "${teamName}"은 이미 존재합니다.`);
          addLog(`라인업 저장 실패: 중복 팀 이름 ${teamName}`);
          return;
        }
      }

      // lineups 문서 저장
      const lineupRef = doc(db, 'lineups', formatDate(new Date(dateISO)));
      const lineupData = {
        teams: teams.map(team => ({
          name: team.name,
          captain: team.captain,
          color: team.color,
          players: team.players.map(player => ({
            nick: player.nick,
            position: player.position
          }))
        })),
        createdAt: new Date().toISOString()
      };
      await setDoc(lineupRef, lineupData, { merge: true });
      addLog(`lineups/${formatDate(new Date(dateISO))} 문서 저장`);

      const matchId = `match_${formatDate(new Date(dateISO))}`;
      const cheerDocRef = doc(db, 'cheers', matchId);
      const cheerData = {
        teams: teams.map((team, index) => ({
          name: team.name,
          cheers: Number(matchCheers[index]?.cheers) || 0
        })),
        matchDate: dateISO,
        startDateTime: startISO,
        endDateTime: endISO
      };

      const voteStatusRef = doc(db, 'voteStatus', formatDate(new Date(dateISO)));
      await setDoc(voteStatusRef, {
        matchDate: dateISO,
        startDateTime: startISO,
        endDateTime: endISO,
        isEnabled: true // 투표는 항상 활성화 (필요 시 별도 로직 추가)
      }, { merge: true });
      addLog(`voteStatus/${formatDate(new Date(dateISO))} 업데이트`);

      for (const [index, team] of teams.entries()) {
        const teamDocRef = doc(db, 'live', team.name);
        const teamCheerDocRef = doc(db, 'live', team.name, 'cheers', 'count');
        console.log(`Processing team: ${team.name}`);
        addLog(`팀 처리: ${team.name}`);

        if (editingLineupId && originalTeamNames.includes(team.name)) {
          const playersSnap = await getDocs(collection(db, 'live', team.name, 'players'));
          for (const playerDoc of playersSnap.docs) {
            console.log(`Deleting existing player: ${playerDoc.id}`);
            await deleteDoc(doc(db, 'live', team.name, 'players', playerDoc.id));
            addLog(`기존 선수 삭제: ${team.name}, ${playerDoc.id}`);
          }
        }

        for (const [playerIndex, player] of team.players.entries()) {
          const playerData = {
            id: `${team.name}_${playerIndex + 1}_${Math.random().toString(36).substr(2, 5)}`,
            nick: player.nick,
            position: player.position,
            date: dateISO
          };
          console.log(`Adding player ${player.nick} to ${team.name} with ID ${playerData.id}`);
          await addDoc(collection(db, 'live', team.name, 'players'), playerData);
          addLog(`선수 추가: ${team.name}, ${player.nick}, ID: ${playerData.id}`);
        }

        console.log(`Saving team metadata for ${team.name}`);
        await setDoc(teamDocRef, {
          captain: team.captain,
          color: team.color,
          date: dateISO
        }, { merge: true });
        addLog(`팀 메타데이터 저장: ${team.name}`);

        console.log(`Saving team cheers for ${team.name}: ${team.cheerCount}`);
        await setDoc(teamCheerDocRef, {
          cheerCount: Number(team.cheerCount) || 0,
          updatedAt: new Date().toISOString()
        });
        console.log(`Updated team cheers for ${team.name}: ${team.cheerCount}`);
        addLog(`팀 응원 데이터 저장: ${team.name}, ${team.cheerCount}`);
      }

      console.log(`Saving match cheers for ${matchId}:`, cheerData);
      await setDoc(cheerDocRef, cheerData);
      console.log(`Updated match cheers for ${matchId}:`, cheerData);
      addLog(`매치 응원 데이터 저장: ${matchId}, ${JSON.stringify(cheerData)}`);

      if (editingLineupId && originalTeamNames.length > 0) {
        for (const originalTeamName of originalTeamNames) {
          if (!teamNames.includes(originalTeamName)) {
            console.log(`Deleting original team: ${originalTeamName}`);
            const oldPlayersSnap = await getDocs(collection(db, 'live', originalTeamName, 'players'));
            for (const playerDoc of oldPlayersSnap.docs) {
              await deleteDoc(doc(db, 'live', originalTeamName, 'players', playerDoc.id));
              addLog(`기존 선수 삭제: ${originalTeamName}, ${playerDoc.id}`);
            }
            await deleteDoc(doc(db, 'live', originalTeamName));
            await deleteDoc(doc(db, 'live', originalTeamName, 'cheers', 'count'));
            console.log(`Deleted team cheers for ${originalTeamName}`);
            addLog(`기존 팀 삭제: ${originalTeamName}`);
          }
        }
      }

      setMessage(editingLineupId ? '라인업이 성공적으로 수정되었습니다.' : '라인업이 성공적으로 저장되었습니다.');
      addLog(`라인업 저장 완료: ${editingLineupId ? '수정' : '추가'}`);
      setDateTime('');
      setStartDateTime('');
      setEndDateTime('');
      setTeams(
        Array(teamCount).fill().map((_, i) => ({
          name: '',
          captain: '',
          color: i % 3 === 0 ? '#000000' : (i % 3 === 1 ? '#00b7eb' : '#FFA500'),
          players: [createEmptyPlayer()],
          cheerCount: 0
        }))
      );
      setEditingLineupId(null);
      setOriginalTeamNames([]);
      setEditingCheerCount({});
      setMatchCheers([]);
      setIsEditingMatchCheers(false);
      fetchLineups();
    } catch (err) {
      console.error('Error saving lineup:', err.message, err.code, err.stack);
      setError(`라인업 저장 중 오류가 발생했습니다: ${err.message} (코드: ${err.code})`);
      addLog(`라인업 저장 오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lineupGroup) => {
    setMessage('');
    setError('');
    setEditingLineupId(lineupGroup.date);
    setOriginalTeamNames(lineupGroup.teams.map(team => team.teamName));
    setDateTime(formatDateTimeDisplay(new Date(lineupGroup.date)));
    setTeamCount(lineupGroup.teams.length);
    const updatedTeams = lineupGroup.teams.map(team => ({
      name: team.teamName,
      captain: team.captain,
      color: team.color,
      players: team.players.map(p => ({
        nick: p.nick,
        position: getMostFrequentPosition(p.nick)
      })),
      cheerCount: team.cheerCount
    }));
    setTeams(updatedTeams);
    setEditingCheerCount(Object.fromEntries(lineupGroup.teams.map(team => [team.teamName, team.cheerCount])));
    console.log('Editing lineup group:', lineupGroup);
    addLog(`라인업 편집 시작: ${lineupGroup.date}`);
  };

  const handleCancelEdit = () => {
    setMessage('');
    setError('');
    setEditingLineupId(null);
    setOriginalTeamNames([]);
    setDateTime('');
    setStartDateTime('');
    setEndDateTime('');
    setTeamCount(2);
    setTeams([
      { name: '', captain: '', color: '#000000', players: [createEmptyPlayer()], cheerCount: 0 },
      { name: '', captain: '', color: '#00b7eb', players: [createEmptyPlayer()], cheerCount: 0 }
    ]);
    setEditingCheerCount({});
    setMatchCheers([]);
    setIsEditingMatchCheers(false);
    console.log('Cancelled editing');
    addLog('라인업 편집 취소');
  };

  const handleDelete = async (lineupDate) => {
    if (window.confirm(`"${formatDateTimeDisplay(new Date(lineupDate))}"의 라인업을 삭제하시겠습니까?`)) {
      try {
        console.log(`Deleting lineup group: ${lineupDate}`);
        const lineupGroup = savedLineups.find(group => group.date === lineupDate);
        if (!lineupGroup) {
          setError('삭제할 라인업 그룹을 찾을 수 없습니다.');
          addLog(`라인업 삭제 실패: ${lineupDate} 그룹 없음`);
          return;
        }

        for (const team of lineupGroup.teams) {
          const teamName = team.teamName;
          console.log(`Deleting team: ${teamName}`);
          const playersSnap = await getDocs(collection(db, 'live', teamName, 'players'));
          for (const playerDoc of playersSnap.docs) {
            console.log(`Deleting player: ${playerDoc.id}`);
            await deleteDoc(doc(db, 'live', teamName, 'players', playerDoc.id));
            addLog(`선수 삭제: ${teamName}, ${playerDoc.id}`);
          }
          await deleteDoc(doc(db, 'live', teamName));
          await deleteDoc(doc(db, 'live', teamName, 'cheers', 'count'));
          console.log(`Deleted team cheers for ${teamName}`);
          addLog(`팀 삭제: ${teamName}`);
        }

        const matchId = `match_${formatDate(new Date(lineupDate))}`;
        const cheerDocRef = doc(db, 'cheers', matchId);
        await deleteDoc(cheerDocRef);
        console.log(`Deleted match cheers for ${matchId}`);
        addLog(`매치 응원 데이터 삭제: ${matchId}`);

        // lineups 문서 삭제
        const lineupRef = doc(db, 'lineups', formatDate(new Date(lineupDate)));
        await deleteDoc(lineupRef);
        console.log(`Deleted lineups/${formatDate(new Date(lineupDate))}`);
        addLog(`lineups/${formatDate(new Date(lineupDate))} 삭제`);

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
        const cheerDocRef = doc(db, 'live', teamName, 'cheers', 'count');
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
        const matchId = `match_${today}`;
        const cheerDocRef = doc(db, 'cheers', matchId);
        const resetData = {
          teams: matchCheers.map(team => ({ name: team.name, cheers: 0 })),
          matchDate: dateTime ? new Date(dateTime).toISOString() : new Date().toISOString(),
          startDateTime: startDateTime ? new Date(startDateTime).toISOString() : new Date().toISOString(),
          endDateTime: endDateTime ? new Date(endDateTime).toISOString() : new Date().toISOString()
        };
        await setDoc(cheerDocRef, resetData);
        console.log(`Reset match cheers for ${matchId}`);
        addLog(`매치 응원 초기화: ${matchId}`);
        setMessage('매치 응원 데이터가 초기화되었습니다.');
        setMatchCheers(resetData.teams);
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
      const matchId = `match_${today}`;
      const cheerDocRef = doc(db, 'cheers', matchId);
      const cheerData = {
        teams: matchCheers.map(team => ({
          name: team.name,
          cheers: Number(team.cheers) || 0
        })),
        matchDate: dateTime ? new Date(dateTime).toISOString() : new Date().toISOString(),
        startDateTime: startDateTime ? new Date(startDateTime).toISOString() : new Date().toISOString(),
        endDateTime: endDateTime ? new Date(endDateTime).toISOString() : new Date().toISOString()
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

  const handleMatchCheerChange = (index, value) => {
    const newMatchCheers = [...matchCheers];
    newMatchCheers[index] = { ...newMatchCheers[index], cheers: value };
    setMatchCheers(newMatchCheers);
    console.log(`Updated match cheer count for team ${index}: ${value}`);
    addLog(`매치 응원 업데이트: 팀 ${index + 1}, ${value}`);
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
          <S.SectionTitle>{editingLineupId ? '라인업 수정' : '경기 라인업 관리'} (노출 시작 시간과 종료 시간 사이에 홈 화면에 표시됩니다)</S.SectionTitle>
          
          <S.SwitchContainer>
            <S.SwitchLabel>라인업 홈 노출: </S.SwitchLabel>
            <S.StatusText>{isHomeExposed ? '활성화' : '비활성화'}</S.StatusText>
          </S.SwitchContainer>
          {loading && <S.Loading>로딩 중...</S.Loading>}

          <S.FormContainer onSubmit={handleSubmit}>
            <S.Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              placeholder="경기 날짜와 시간"
              required
            />
            <S.Input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              placeholder="라인업 노출 시작 시간"
              required
            />
            <S.Input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              placeholder="라인업 노출 종료 시간"
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
                    <div style={{ position: 'relative', flex: 2 }}>
                        <S.Input
                            type="text"
                            value={player.nick}
                            onChange={(e) => handlePlayerChange(teamIndex, playerIndex, 'nick', e.target.value)}
                            onFocus={() => setActiveInput({ teamIndex, playerIndex })}
                            placeholder="닉네임"
                            style={playerIndex === 0 ? { border: '2px solid red' } : {}}
                        />
                        {activeInput?.teamIndex === teamIndex && activeInput?.playerIndex === playerIndex && suggestions.length > 0 && (
                            <SuggestionsList>
                            {suggestions.map((p) => (
                                <SuggestionItem key={p.id} onClick={() => handlePlayerSelect(teamIndex, playerIndex, p)}>
                                {p.name} ({getMostFrequentPosition(p.name)})
                                </SuggestionItem>
                            ))}
                            </SuggestionsList>
                        )}
                    </div>
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
                {teams.map((team, index) => (
                  <S.Input
                    key={index}
                    type="number"
                    value={matchCheers[index]?.cheers || 0}
                    onChange={(e) => handleMatchCheerChange(index, e.target.value)}
                    placeholder={`${team.name || `Team${index + 1}`} 응원 수`}
                    min="0"
                  />
                ))}
              </S.TeamSection>
            )}

            <S.SaveButton type="submit" disabled={loading}>
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
                      matchCheers.map((team, index) => (
                        <span key={index}>
                          <S.Input
                            type="number"
                            value={team.cheers}
                            onChange={(e) => handleMatchCheerChange(index, e.target.value)}
                            style={{ width: '80px', marginLeft: '5px' }}
                            min="0"
                          />
                          {' 회'}
                          {index < matchCheers.length - 1 && ', '}
                        </span>
                      ))
                    ) : (
                      matchCheers.map((team, index) => (
                        <span key={index}>
                          {team.name || `Team${index + 1}`} {team.cheers}회
                          {index < matchCheers.length - 1 && ', '}
                        </span>
                      ))
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
                {savedLineups.map((lineupGroup, index) => (
                  <S.SavedLineup key={index}>
                    <S.SavedLineupHeader>
                      <S.SavedLineupTitle>
                        매치: {lineupGroup.date ? formatDateTimeDisplay(new Date(lineupGroup.date)) : '날짜 미정'}
                      </S.SavedLineupTitle>
                      <S.SavedLineupActions>
                        <S.EditButton onClick={() => handleEdit(lineupGroup)}>수정</S.EditButton>
                        <S.DeleteButton onClick={() => handleDelete(lineupGroup.date)}>삭제</S.DeleteButton>
                      </S.SavedLineupActions>
                    </S.SavedLineupHeader>
                    <S.SavedLineupTeams>
                      {lineupGroup.teams.map((team, teamIndex) => (
                        <S.SavedLineupTeam key={teamIndex}>
                          <S.SavedLineupTeamHeader>
                            {team.teamName}
                            <span style={{ marginLeft: '10px' }}>
                              {editingLineupId === lineupGroup.date ? (
                                <S.Input
                                  type="number"
                                  value={editingCheerCount[team.teamName] || team.cheerCount}
                                  onChange={(e) => handleCheerCountChange(team.teamName, e.target.value)}
                                  style={{ width: '80px', marginLeft: '5px' }}
                                  min="0"
                                />
                              ) : (
                                `팀 응원: ${team.cheerCount}회`
                              )}
                            </span>
                          </S.SavedLineupTeamHeader>
                          <S.SavedLineupPlayers>
                            {team.players.map((player, playerIndex) => (
                              <li key={playerIndex}>
                                {player.nick} ({POSITIONS[player.position] || player.position})
                              </li>
                            ))}
                          </S.SavedLineupPlayers>
                        </S.SavedLineupTeam>
                      ))}
                    </S.SavedLineupTeams>
                  </S.SavedLineup>
                ))}
              </>
            )}
          </S.SavedLineupsContainer>
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