import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../App';
import { format } from 'date-fns';
import * as S from './LiveAdminCss';

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
    { name: '', captain: '', color: '#000000', players: [createEmptyPlayer()] },
    { name: '', captain: '', color: '#00b7eb', players: [createEmptyPlayer()] }
  ]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedLineups, setSavedLineups] = useState([]);
  const [editingLineupId, setEditingLineupId] = useState(null);
  const [originalTeamName, setOriginalTeamName] = useState(null);

  // 저장된 라인업 목록 불러오기
  useEffect(() => {
    fetchLineups();
  }, []);

  const fetchLineups = async () => {
    try {
      const teamsSnap = await getDocs(collection(db, 'live'));
      const lineups = [];
      for (const teamDoc of teamsSnap.docs) {
        const playersSnap = await getDocs(collection(db, 'live', teamDoc.id, 'players'));
        const players = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        lineups.push({
          teamName: teamDoc.id,
          players,
          date: players[0]?.date || '',
          captain: teamDoc.data().captain || '',
          color: teamDoc.data().color || '#000000'
        });
      }
      setSavedLineups(lineups.sort((a, b) => new Date(b.date) - new Date(a.date)));
      console.log('Fetched lineups:', lineups);
    } catch (err) {
      console.error('Error fetching lineups:', err.message, err.code);
      setError('라인업 불러오기 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const handleTeamChange = (index, field, value) => {
    const newTeams = [...teams];
    newTeams[index][field] = value;
    setTeams(newTeams);
    console.log('Updated teams:', newTeams);
  };

  const handlePlayerChange = (teamIndex, playerIndex, field, value) => {
    const newTeams = [...teams];
    newTeams[teamIndex].players[playerIndex][field] = value;
    setTeams(newTeams);
    console.log('Updated players for team', teamIndex, ':', newTeams[teamIndex].players);
  };

  const addPlayer = (teamIndex) => {
    const newTeams = [...teams];
    if (newTeams[teamIndex].players.length >= 20) {
      setError('각 팀은 최대 20명의 선수만 등록할 수 있습니다.');
      return;
    }
    newTeams[teamIndex].players.push(createEmptyPlayer());
    setTeams(newTeams);
    console.log('Added player to team', teamIndex, ':', newTeams[teamIndex].players);
  };

  const removePlayer = (teamIndex, playerIndex) => {
    const newTeams = [...teams];
    if (newTeams[teamIndex].players.length <= 1) {
      setError('최소 한 명의 선수는 유지해야 합니다.');
      return;
    }
    newTeams[teamIndex].players.splice(playerIndex, 1);
    setTeams(newTeams);
    console.log('Removed player from team', teamIndex, ':', newTeams[teamIndex].players);
  };

  const handleTeamCountChange = (count) => {
    setTeamCount(count);
    setTeams(
      Array(count).fill().map((_, i) => ({
        name: '',
        captain: '',
        color: i % 2 === 0 ? '#000000' : '#00b7eb',
        players: [createEmptyPlayer()]
      }))
    );
    console.log('Changed team count to', count);
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
      return;
    }

    let dateISO;
    try {
      dateISO = new Date(dateTime).toISOString();
      console.log('Date ISO:', dateISO);
    } catch (err) {
      setError('유효하지 않은 날짜 형식입니다.');
      console.error('Date parsing error:', err);
      return;
    }

    for (const team of teams) {
      const nameError = validateTeamName(team.name);
      if (nameError) {
        setError(nameError);
        return;
      }
      if (!team.captain) {
        setError('모든 팀의 주장을 입력해주세요.');
        return;
      }
      if (team.players.length === 0) {
        setError('각 팀에 최소 한 명의 선수를 추가해주세요.');
        return;
      }
      for (const player of team.players) {
        if (!player.nick || !player.position) {
          setError('모든 선수의 닉네임과 포지션을 입력해주세요.');
          return;
        }
      }
    }

    try {
      console.log('Submitting teams:', teams);

      // 중복 팀 이름 확인 (편집 모드에서는 원래 팀 이름 제외)
      const existingTeams = await getDocs(collection(db, 'live'));
      const teamNames = teams.map(t => t.name);
      for (const teamName of teamNames) {
        if (editingLineupId && teamName === originalTeamName) continue;
        if (existingTeams.docs.some(doc => doc.id === teamName)) {
          setError(`팀 이름 "${teamName}"은 이미 존재합니다.`);
          return;
        }
      }

      for (const [index, team] of teams.entries()) {
        const teamDocRef = doc(db, 'live', team.name);
        console.log(`Processing team: ${team.name}`);

        // 편집 모드: 기존 선수 데이터 삭제
        if (editingLineupId && originalTeamName === team.name) {
          const playersSnap = await getDocs(collection(db, 'live', team.name, 'players'));
          for (const playerDoc of playersSnap.docs) {
            console.log(`Deleting existing player: ${playerDoc.id}`);
            await deleteDoc(doc(db, 'live', team.name, 'players', playerDoc.id));
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
        }

        // 팀 메타데이터 저장
        console.log(`Saving team metadata for ${team.name}`);
        await setDoc(teamDocRef, {
          captain: team.captain,
          color: team.color,
          date: dateISO
        }, { merge: true });

        // 편집 모드: 원래 팀 이름이 변경된 경우 기존 문서 삭제
        if (editingLineupId && originalTeamName && originalTeamName !== team.name) {
          console.log(`Deleting original team: ${originalTeamName}`);
          const oldPlayersSnap = await getDocs(collection(db, 'live', originalTeamName, 'players'));
          for (const playerDoc of oldPlayersSnap.docs) {
            await deleteDoc(doc(db, 'live', originalTeamName, 'players', playerDoc.id));
          }
          await deleteDoc(doc(db, 'live', originalTeamName));
        }
      }

      setMessage(editingLineupId ? '라인업이 성공적으로 수정되었습니다.' : '라인업이 성공적으로 저장되었습니다.');
      // 폼 초기화
      setDateTime('');
      setTeams(
        Array(teamCount).fill().map((_, i) => ({
          name: '',
          captain: '',
          color: i % 2 === 0 ? '#000000' : '#00b7eb',
          players: [createEmptyPlayer()]
        }))
      );
      setEditingLineupId(null);
      setOriginalTeamName(null);
      fetchLineups();
    } catch (err) {
      console.error('Error saving lineup:', err.message, err.code, err.stack);
      setError(`라인업 저장 중 오류가 발생했습니다: ${err.message} (코드: ${err.code})`);
    }
  };

  const handleEdit = (lineup) => {
    setMessage('');
    setError('');
    setEditingLineupId(lineup.teamName);
    setOriginalTeamName(lineup.teamName);
    setDateTime(format(new Date(lineup.date), 'yyyy-MM-dd\'T\'HH:mm'));
    setTeamCount(1); // 단일 팀 수정
    setTeams([{
      name: lineup.teamName,
      captain: lineup.captain,
      color: lineup.color,
      players: lineup.players.map(p => ({
        nick: p.nick,
        position: p.position
      }))
    }]);
    console.log('Editing lineup:', lineup);
  };

  const handleCancelEdit = () => {
    setMessage('');
    setError('');
    setEditingLineupId(null);
    setOriginalTeamName(null);
    setDateTime('');
    setTeamCount(2);
    setTeams([
      { name: '', captain: '', color: '#000000', players: [createEmptyPlayer()] },
      { name: '', captain: '', color: '#00b7eb', players: [createEmptyPlayer()] }
    ]);
    console.log('Cancelled editing');
  };

  const handleDelete = async (teamName) => {
    if (window.confirm('정말로 이 라인업을 삭제하시겠습니까?')) {
      try {
        console.log(`Deleting team: ${teamName}`);
        const playersSnap = await getDocs(collection(db, 'live', teamName, 'players'));
        for (const playerDoc of playersSnap.docs) {
          console.log(`Deleting player: ${playerDoc.id}`);
          await deleteDoc(doc(db, 'live', teamName, 'players', playerDoc.id));
        }
        await deleteDoc(doc(db, 'live', teamName));
        setMessage('라인업이 삭제되었습니다.');
        fetchLineups();
      } catch (err) {
        console.error('Error deleting lineup:', err.message, err.code);
        setError(`라인업 삭제 중 오류가 발생했습니다: ${err.message}`);
      }
    }
  };

  const renderPositionOptions = () => {
    return Object.keys(POSITIONS).map(pos => (
      <option key={pos} value={pos}>{POSITIONS[pos]}</option>
    ));
  };

  return (
    <S.Container>
      <S.SectionTitle>{editingLineupId ? '라인업 수정' : '경기 라인업 관리'} (라인업은 설정한 시간에서 4시간전에나옴)</S.SectionTitle>
      
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
          savedLineups.map((lineup, index) => (
            <S.SavedLineup key={index}>
              <S.SavedLineupHeader>
                <S.SavedLineupTitle>
                  {lineup.teamName} ({lineup.date ? format(new Date(lineup.date), 'yyyy-MM-dd HH:mm') : '날짜 미정'})
                </S.SavedLineupTitle>
                <S.SavedLineupActions>
                  <S.EditButton onClick={() => handleEdit(lineup)}>수정</S.EditButton>
                  <S.DeleteButton onClick={() => handleDelete(lineup.teamName)}>삭제</S.DeleteButton>
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
          ))
        )}
      </S.SavedLineupsContainer>
    </S.Container>
  );
};

export default LiveAdmin;