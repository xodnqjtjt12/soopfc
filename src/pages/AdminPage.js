// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import {
  collection, doc, getDoc, getDocs,
  updateDoc, setDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../App';
import * as XLSX from 'xlsx';
import eyeIcon from '../icons/eye_icon.png';
import eyeOffIcon from '../icons/eye_off_icon.png';

// 스타일 컴포넌트를 한 번에 가져오기
import * as S from './Admincss';

const AdminPage = () => {
  // --- 상태 정의 ---
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [logs, setLogs] = useState([]);
  const [playerData, setPlayerData] = useState({
    backNumber: '', name: '', team: '', matches: '', goals: '', assists: '',
    cleanSheets: '', win: '', draw: '', lose: '', winRate: '', personalPoints: '', momScore: ''
  });
  const [previewExcelChanges, setPreviewExcelChanges] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [players, setPlayers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    backNumber: '', team: '', matches: '', goals: '', assists: '',
    cleanSheets: '', win: '', draw: '', lose: '', winRate: '', personalPoints: '', momScore: ''
  });

  // --- 로그 추가 헬퍼 ---
  const addLog = (msg) => {
    const ts = new Date().toLocaleString();
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  };

  // --- 비밀번호 입력/확인 ---
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

  // --- 선수 데이터 입력 핸들러 ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlayerData({ ...playerData, [name]: value });
  };

  // --- 선수 데이터 미리보기 계산 (교체 방식) ---
  useEffect(() => {
    if (!playerData.name) return setPreviewExcelChanges(null);
    const existing = players.find((p) => p.name === playerData.name);
    if (!existing) return setPreviewExcelChanges(null);

    const fields = [
      'backNumber', 'team', 'matches', 'goals', 'assists', 'cleanSheets',
      'win', 'draw', 'lose', 'winRate', 'personalPoints', 'momScore'
    ];
    const changes = {};
    fields.forEach((field) => {
      const newValue = playerData[field] || '0';
      changes[field] = `${existing[field] || '0'} → ${newValue}`;
    });
    setPreviewExcelChanges(changes);
  }, [playerData, players]);

  // --- 공격포인트, XG, WA, WAR 계산 함수 ---
  const calcAdvanced = ({ goals, assists, matches, cleanSheets }) => {
    const g = Number(goals) || 0;
    const a = Number(assists) || 0;
    const m = Number(matches) || 1; // 0 방지
    const cs = Number(cleanSheets) || 0;
    const attackPoints = g + a;
    const xg = m > 0 ? +(g / m).toFixed(2) : 0; // 경기당 득점
    const wa = m > 0 ? +(a / m).toFixed(2) : 0; // 경기당 도움
    const war = m > 0 ? +((g + a + (cs * 0.5)) / m).toFixed(2) : 0; // 클린시트 포함한 WAR
    return { attackPoints, xg, wa, war };
};

  // --- 선수 데이터 추가/업데이트 ---
  const handleSubmitPlayerData = async (e) => {
    e.preventDefault();
    const {
      backNumber, name, team, matches, goals, assists, cleanSheets,
      win, draw, lose, winRate, personalPoints, momScore
    } = playerData;
    if (
      !name || !team || isNaN(matches) || isNaN(goals) || isNaN(assists) ||
      isNaN(cleanSheets) || isNaN(win) || isNaN(draw) || isNaN(lose) ||
      isNaN(winRate) || isNaN(personalPoints) || isNaN(momScore)
    ) {
      return alert('모든 필드를 올바르게 입력해주세요.');
    }

    const playerRef = doc(db, 'players', name);
    const playerDoc = await getDoc(playerRef);
    const adv = calcAdvanced({ goals, assists, matches });

    try {
      await setDoc(playerRef, {
        backNumber: Number(backNumber) || 0,
        name,
        team,
        matches: Number(matches),
        goals: Number(goals),
        assists: Number(assists),
        attackPoints: adv.attackPoints,
        cleanSheets: Number(cleanSheets),
        win: Number(win),
        draw: Number(draw),
        lose: Number(lose),
        winRate: Math.round(Number(winRate)),
        personalPoints: Number(personalPoints),
        momScore: Number(momScore),
        xg: adv.xg,
        wa: adv.wa,
        war: adv.war,
        updatedAt: serverTimestamp()
      });
      alert(playerDoc.exists() ? '선수 데이터가 업데이트되었습니다.' : '선수 데이터가 추가되었습니다.');
      addLog(`선수 데이터 ${playerDoc.exists() ? '업데이트' : '추가'}: ${name}`);
      setPlayerData({
        backNumber: '', name: '', team: '', matches: '', goals: '', assists: '',
        cleanSheets: '', win: '', draw: '', lose: '', winRate: '', personalPoints: '', momScore: ''
      });
      setPreviewExcelChanges(null);
      fetchPlayers();
    } catch (err) {
      console.error(err);
      alert('데이터 저장 중 오류 발생');
      addLog(`오류: ${err.message}`);
    }
  };

  // --- 엑셀 업로드 핸들러 ---
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setShowExcelPreview(false);
  };

  const handleFileUpload = () => {
    if (!file) return alert('파일을 선택해주세요.');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      setPreviewData(json);
  
      try {
        for (const row of json) {
          if (!row.name || !row.team) continue;
          const ref = doc(db, 'players', row.name);
          const adv = calcAdvanced({
            goals: row.goals || 0,
            assists: row.assists || 0,
            matches: row.matches || 1
          });
          await setDoc(ref, {
            backNumber: Number(row.backNumber) || 0,
            name: row.name,
            team: row.team,
            matches: Number(row.matches || 0),
            goals: Number(row.goals || 0),
            assists: Number(row.assists || 0),
            attackPoints: adv.attackPoints,
            cleanSheets: Number(row.cleanSheets || 0),
            win: Number(row.win || 0),
            draw: Number(row.draw || 0),
            lose: Number(row.lose || 0),
            winRate: Number(row.winRate || 0), // 반올림 제거, 입력값 그대로 저장
            personalPoints: Number(row.personalPoints || 0),
            momScore: Number(row.momScore || 0),
            xg: adv.xg,
            wa: adv.wa,
            war: adv.war,
            updatedAt: serverTimestamp()
          });
          addLog(`엑셀 처리: ${row.name}`);
        }
        setUploadMessage('엑셀 파일 업로드 완료');
        fetchPlayers();
      } catch (err) {
        console.error(err);
        setUploadMessage('엑셀 업로드 오류');
        addLog(`엑셀 오류: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };
  const handlePreviewExcel = () => {
    if (!file) return alert('파일을 선택해주세요.');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      setPreviewData(XLSX.utils.sheet_to_json(ws));
      setShowExcelPreview(true);
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        backNumber: 10, name: '빅루트', team: 'soopfc', matches: 7, goals: 1, assists: 3,
        attackPoints: 4, cleanSheets: 0, war: 0.5, xg: 0.1, wa: 0.4,
        win: 3, draw: 1, lose: 3, winRate: 43, personalPoints: 10, momScore: 850
      },
      {
        backNumber: 18, name: '허니베어', team: 'soopfc', matches: 7, goals: 0, assists: 1,
        attackPoints: 1, cleanSheets: 8, war: 0.1, xg: 0, wa: 0.1,
        win: 2, draw: 1, lose: 4, winRate: 29, personalPoints: 7, momScore: 790
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'template.xlsx');
    addLog('엑셀 양식 다운로드');
  };

  // --- DB에서 선수 목록 조회 ---
  const fetchPlayers = async () => {
    try {
      const snap = await getDocs(collection(db, 'players'));
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
      setPlayers(arr);
      addLog(`플레이어 목록 갱신 (${arr.length}명)`);
    } catch (err) {
      console.error(err);
      addLog(`목록 fetch 오류: ${err.message}`);
    }
  };

  // --- 편집 모드 핸들러 ---
  const handleEdit = (pl) => {
    setEditingId(pl.id);
    setEditingData({
      backNumber: pl.backNumber,
      team: pl.team,
      matches: pl.matches,
      goals: pl.goals,
      assists: pl.assists,
      cleanSheets: pl.cleanSheets,
      win: pl.win,
      draw: pl.draw,
      lose: pl.lose,
      winRate: pl.winRate,
      personalPoints: pl.personalPoints,
      momScore: pl.momScore
    });
    addLog(`편집 모드: ${pl.name}`);
  };

  const handleEditingDataChange = (e) => {
    const { name, value } = e.target;
    setEditingData({ ...editingData, [name]: value });
  };

  const handleSaveEdit = async (id) => {
    try {
      const adv = calcAdvanced(editingData);
      await updateDoc(doc(db, 'players', id), {
        backNumber: Number(editingData.backNumber) || 0,
        team: editingData.team,
        matches: Number(editingData.matches),
        goals: Number(editingData.goals),
        assists: Number(editingData.assists),
        attackPoints: adv.attackPoints,
        cleanSheets: Number(editingData.cleanSheets),
        win: Number(editingData.win),
        draw: Number(editingData.draw),
        lose: Number(editingData.lose),
        winRate: Number(editingData.winRate),
        personalPoints: Number(editingData.personalPoints),
        momScore: Number(editingData.momScore),
        xg: adv.xg,
        wa: adv.wa,
        war: adv.war,
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
      setEditingData({
        backNumber: '', team: '', matches: '', goals: '', assists: '',
        cleanSheets: '', win: '', draw: '', lose: '', winRate: '', personalPoints: '', momScore: ''
      });
      fetchPlayers();
      addLog(`수정 저장: ${id}`);
    } catch (err) {
      console.error(err);
      alert('수정 오류');
      addLog(`수정 오류(${id}): ${err.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({
      backNumber: '', team: '', matches: '', goals: '', assists: '',
      cleanSheets: '', win: '', draw: '', lose: '', winRate: '', personalPoints: '', momScore: ''
    });
    addLog('편집 취소');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'players', id));
      fetchPlayers();
      addLog(`삭제: ${id}`);
    } catch (err) {
      console.error(err);
      alert('삭제 오류');
      addLog(`삭제 오류(${id}): ${err.message}`);
    }
  };

  // --- 초기 로드 ---
  useEffect(() => {
    if (isAuthenticated) fetchPlayers();
  }, [isAuthenticated]);

  // --- 렌더링 ---
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
          <S.Button type="submit">확인</S.Button>
        </form>
      ) : (
        <S.AdminContent>
          <S.MainArea>
            <S.Header>관리자 페이지</S.Header>
            <div style={{ textAlign: 'right', fontSize: '14px', color: '#4e5968', marginBottom: '16px' }}>
              {players[0]?.updatedAt
                ? `최근 업데이트: ${new Date(players[0].updatedAt.seconds * 1000).toLocaleString('ko-KR')}`
                : '최근 업데이트 정보 없음'}
            </div>

            {/* 엑셀 업로드 */}
            <h3>엑셀 파일 업로드</h3>
            <S.Input type="file" onChange={handleFileChange} />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <S.Button onClick={handleFileUpload}>업로드</S.Button>
              <S.Button onClick={handlePreviewExcel}>미리보기</S.Button>
            </div>
            {uploadMessage && <S.UploadMessage success={uploadMessage.includes('완료')}>{uploadMessage}</S.UploadMessage>}
            {showExcelPreview && previewData.length > 0 && (
              <S.PreviewContainer>
                <p><strong>엑셀 미리보기</strong></p>
                <S.Table>
                  <thead>
                    <tr>
                      <S.Th>등번호</S.Th><S.Th>이름</S.Th><S.Th>팀</S.Th><S.Th>경기수</S.Th>
                      <S.Th>득점</S.Th><S.Th>도움</S.Th><S.Th>공격포인트</S.Th><S.Th>클린시트</S.Th>
                      <S.Th>경기당 공격포인트</S.Th><S.Th>경기당 득점</S.Th><S.Th>경기당 도움</S.Th>
                      <S.Th>승</S.Th><S.Th>무</S.Th><S.Th>패</S.Th><S.Th>승률</S.Th>
                      <S.Th>개인승점</S.Th><S.Th>MOM점수</S.Th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((r, i) => (
                      <tr key={i}>
                        <S.Td>{r.backNumber}</S.Td><S.Td>{r.name}</S.Td><S.Td>{r.team}</S.Td><S.Td>{r.matches}</S.Td>
                        <S.Td>{r.goals}</S.Td><S.Td>{r.assists}</S.Td><S.Td>{r.attackPoints}</S.Td><S.Td>{r.cleanSheets}</S.Td>
                        <S.Td>{r.war}</S.Td><S.Td>{r.xg}</S.Td><S.Td>{r.wa}</S.Td>
                        <S.Td>{r.win}</S.Td><S.Td>{r.draw}</S.Td><S.Td>{r.lose}</S.Td><S.Td>{r.winRate}</S.Td>
                        <S.Td>{r.personalPoints}</S.Td><S.Td>{r.momScore}</S.Td>
                      </tr>
                    ))}
                  </tbody>
                </S.Table>
              </S.PreviewContainer>
            )}

            <hr />

            {/* 개별 입력 폼 */}
            <S.Form onSubmit={handleSubmitPlayerData}>
              <h3>선수 데이터 추가/수정</h3>
              {previewExcelChanges && (
                <S.PreviewContainer>
                  <p><strong>업데이트 미리보기</strong></p>
                  <p>등번호: {previewExcelChanges.backNumber}</p>
                  <p>팀: {previewExcelChanges.team}</p>
                  <p>경기수: {previewExcelChanges.matches}</p>
                  <p>득점: {previewExcelChanges.goals}</p>
                  <p>도움: {previewExcelChanges.assists}</p>
                  <p>클린시트: {previewExcelChanges.cleanSheets}</p>
                  <p>승: {previewExcelChanges.win}</p>
                  <p>무: {previewExcelChanges.draw}</p>
                  <p>패: {previewExcelChanges.lose}</p>
                  <p>승률: {previewExcelChanges.winRate}</p>
                  <p>개인승점: {previewExcelChanges.personalPoints}</p>
                  <p>MOM점수: {previewExcelChanges.momScore}</p>
                </S.PreviewContainer>
              )}
              <S.Input type="number" name="backNumber" value={playerData.backNumber} onChange={handleInputChange} placeholder="등번호" />
              <S.Input type="text" name="name" value={playerData.name} onChange={handleInputChange} placeholder="선수 이름" />
              <S.Input type="text" name="team" value={playerData.team} onChange={handleInputChange} placeholder="팀 이름" />
              <S.Input type="number" name="matches" value={playerData.matches} onChange={handleInputChange} placeholder="경기수" />
              <S.Input type="number" name="goals" value={playerData.goals} onChange={handleInputChange} placeholder="득점" />
              <S.Input type="number" name="assists" value={playerData.assists} onChange={handleInputChange} placeholder="도움" />
              <S.Input type="number" name="cleanSheets" value={playerData.cleanSheets} onChange={handleInputChange} placeholder="클린시트" />
              <S.Input type="number" name="win" value={playerData.win} onChange={handleInputChange} placeholder="승" />
              <S.Input type="number" name="draw" value={playerData.draw} onChange={handleInputChange} placeholder="무" />
              <S.Input type="number" name="lose" value={playerData.lose} onChange={handleInputChange} placeholder="패" />
              <S.Input type="number" name="winRate" value={playerData.winRate} onChange={handleInputChange} placeholder="승률" />
              <S.Input type="number" name="personalPoints" value={playerData.personalPoints} onChange={handleInputChange} placeholder="개인승점" />
              <S.Input type="number" name="momScore" value={playerData.momScore} onChange={handleInputChange} placeholder="MOM점수" />
              <S.Button type="submit">저장</S.Button>
            </S.Form>

            <hr />

            <S.Button onClick={downloadTemplate}>엑셀 양식 다운로드</S.Button>

            <hr />

            {/* 선수 목록 */}
            <S.Header>저장된 선수 목록 (총 {players.length}명)</S.Header>
            <S.Table>
              <thead>
                <tr>
                  <S.Th>등번호</S.Th><S.Th>이름</S.Th><S.Th>팀</S.Th><S.Th>경기수</S.Th>
                  <S.Th>득점</S.Th><S.Th>도움</S.Th><S.Th>공격포인트</S.Th><S.Th>클린시트</S.Th>
                  <S.Th>경기당 공격포인트</S.Th><S.Th>경기당 득점</S.Th><S.Th>경기당 도움</S.Th>
                  <S.Th>승</S.Th><S.Th>무</S.Th><S.Th>패</S.Th><S.Th>승률</S.Th>
                  <S.Th>개인승점</S.Th><S.Th>MOM점수</S.Th><S.Th>액션</S.Th>
                </tr>
              </thead>
              <tbody>
                {players.map((pl) => (
                  <tr key={pl.id}>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="backNumber"
                          value={editingData.backNumber}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.backNumber
                      )}
                    </S.Td>
                    <S.Td>{pl.name}</S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="text"
                          name="team"
                          value={editingData.team}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.team
                      )}
                    </S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="matches"
                          value={editingData.matches}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.matches
                      )}
                    </S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="goals"
                          value={editingData.goals}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.goals
                      )}
                    </S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="assists"
                          value={editingData.assists}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.assists
                      )}
                    </S.Td>
                    <S.Td>{pl.attackPoints}</S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="cleanSheets"
                          value={editingData.cleanSheets}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.cleanSheets
                      )}
                    </S.Td>
                    <S.Td>{pl.war}</S.Td>
                    <S.Td>{pl.xg}</S.Td>
                    <S.Td>{pl.wa}</S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="win"
                          value={editingData.win}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.win
                      )}
                    </S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="draw"
                          value={editingData.draw}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.draw
                      )}
                    </S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="lose"
                          value={editingData.lose}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.lose
                      )}
                    </S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="winRate"
                          value={editingData.winRate }
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.winRate
                      )}
                    </S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="personalPoints"
                          value={editingData.personalPoints}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.personalPoints
                      )}
                    </S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <S.SmallInput
                          type="number"
                          name="momScore"
                          value={editingData.momScore}
                          onChange={handleEditingDataChange}
                        />
                      ) : (
                        pl.momScore
                      )}
                    </S.Td>
                    <S.Td>
                      {editingId === pl.id ? (
                        <>
                          <S.Button onClick={() => handleSaveEdit(pl.id)}>저장</S.Button>
                          <S.Button onClick={handleCancelEdit}>취소</S.Button>
                          <S.Button onClick={() => handleDelete(pl.id)}>삭제</S.Button>
                        </>
                      ) : (
                        <>
                          <S.Button onClick={() => handleEdit(pl)}>수정</S.Button>
                          <S.Button onClick={() => handleDelete(pl.id)}>삭제</S.Button>
                        </>
                      )}
                    </S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
          </S.MainArea>

          {/* 로그 */}
          <S.LogsContainer>
            <S.Header>로그</S.Header>
            {logs.map((log, i) => (
              <S.LogItem key={i}>{log}</S.LogItem>
            ))}
          </S.LogsContainer>
        </S.AdminContent>
      )}
    </S.Container>
  );
};

export default AdminPage;