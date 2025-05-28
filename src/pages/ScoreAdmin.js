import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { db } from '../App';
import * as S from './ScoreAdminCss';

// 오늘 날짜 포맷팅 (YYYYMMDD)
const formatDate = (date) => {
  const kstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// 컴포넌트 분리
const SelectedMatchCard = React.memo(({ match, index, onRemove, onToggleStatus, statusUpdateLoading }) => (
  <S.SelectedPlayerCard>
    {match.homeTeam && match.awayTeam ? (
      <>
        <S.PlayerName>
          {match.homeTeam} vs {match.awayTeam} ({new Date(match.date).toLocaleString()})
        </S.PlayerName>
        <S.PlayerStats>상태: {match.isEnabled ? '예측 가능' : '예측 종료'}</S.PlayerStats>
        <S.PlayerStats>투표 마감: {match.voteDeadlineOffset ? `${match.voteDeadlineOffset}분 전` : '설정 안 됨'}</S.PlayerStats>
        {/* <S.EditButton
          onClick={() => onToggleStatus(index, !match.isEnabled)}
          disabled={statusUpdateLoading}
        >
          {match.isEnabled ? '예측 종료' : '예측 시작'}
        </S.EditButton> */}
        <S.RemoveButton onClick={() => onRemove(index)}>삭제</S.RemoveButton>
      </>
    ) : (
      <S.PlayerName style={{ color: '#999' }}>경기 선택 필요</S.PlayerName>
    )}
  </S.SelectedPlayerCard>
));

const ScoreAdmin = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatches, setSelectedMatches] = useState([
    { homeTeam: '', awayTeam: '', date: '', isEnabled: true, id: null, voteDeadlineOffset: 0 },
  ]);
  const [newMatch, setNewMatch] = useState({ homeTeam: '', awayTeam: '', date: '', voteDeadlineOffset: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // 익명 인증
  useEffect(() => {
    const auth = getAuth();
    signInAnonymously(auth)
      .then(() => console.log('익명 로그인 성공'))
      .catch(err => console.error('익명 로그인 오류:', err.message));
  }, []);

  // 비밀번호 확인
  const handlePasswordSubmit = useCallback(() => {
    console.log('비밀번호 제출 시도:', password);
    if (password === 'alves') {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.');
    }
  }, [password]);

  // Firestore 초기화 확인
  useEffect(() => {
    console.log('Firestore DB 초기화 확인:', db ? '성공' : '실패');
  }, []);

  // 전체 경기 목록 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      console.log('전체 경기 목록 가져오기 시작');
      const fetchMatches = async () => {
        setLoading(true);
        try {
          const matchesRef = collection(db, 'Score');
          const snapshot = await getDocs(matchesRef);
          const matchesData = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter(match => match.homeTeam && match.awayTeam);
          console.log('가져온 경기 데이터:', matchesData);
          setMatches(matchesData);
        } catch (err) {
          console.error('경기 데이터 가져오기 오류:', err.message);
          setError('경기 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      fetchMatches();
    }
  }, [isAuthenticated]);

  // 현재 선택된 경기 데이터 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      console.log('현재 선택된 경기 데이터 가져오기 시작');
      const fetchCurrentMatches = async () => {
        setLoading(true);
        try {
          const currentRef = doc(db, 'Score', 'current');
          const currentDoc = await getDoc(currentRef);
          if (currentDoc.exists()) {
            const matchesData = currentDoc.data().matches || [];
            console.log('현재 선택된 경기:', matchesData);
            setSelectedMatches(
              matchesData
                .filter(match => match.homeTeam && match.awayTeam)
                .map(match => ({
                  ...match,
                  date: match.date || '',
                  isEnabled: match.isEnabled !== undefined ? match.isEnabled : true,
                  id: match.id || `match_${formatDate(new Date(match.date))}_${Date.now()}`,
                  voteDeadlineOffset: match.voteDeadlineOffset || 0,
                }))
            );
          } else {
            console.log('Score/current 문서가 존재하지 않음');
            setSelectedMatches([{ homeTeam: '', awayTeam: '', date: '', isEnabled: true, id: null, voteDeadlineOffset: 0 }]);
          }
        } catch (err) {
          console.error('현재 경기 데이터 가져오기 오류:', err.message);
          setError('현재 경기 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      fetchCurrentMatches();
    }
  }, [isAuthenticated]);

  // 새 경기 추가
  const handleAddMatch = useCallback(async (e) => {
    e.preventDefault();
    if (!newMatch.homeTeam || !newMatch.awayTeam || !newMatch.date || newMatch.voteDeadlineOffset === '') {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const voteDeadlineOffset = parseInt(newMatch.voteDeadlineOffset);
    if (isNaN(voteDeadlineOffset) || voteDeadlineOffset < 0) {
      alert('유효한 마감 시간(분)을 입력해주세요.');
      return;
    }

    const matchId = `match_${formatDate(new Date(newMatch.date))}_${Date.now()}`;
    const newMatchData = {
      id: matchId,
      homeTeam: newMatch.homeTeam,
      awayTeam: newMatch.awayTeam,
      date: new Date(newMatch.date).toISOString(),
      isEnabled: true,
      voteDeadlineOffset,
    };

    console.log('새 경기 추가:', newMatchData);
    setSelectedMatches(prev => [...prev, newMatchData]);
    setNewMatch({ homeTeam: '', awayTeam: '', date: '', voteDeadlineOffset: '' });
  }, [newMatch]);

  // 경기 상태 토글
  const handleToggleStatus = useCallback(async (index, newStatus) => {
    setStatusUpdateLoading(true);
    try {
      const updatedMatches = selectedMatches.map((match, i) =>
        i === index ? { ...match, isEnabled: newStatus } : match
      );
      setSelectedMatches(updatedMatches);

      console.log('경기 상태 업데이트:', { index, newStatus, updatedMatches });

      const currentRef = doc(db, 'Score', 'current');
      await setDoc(currentRef, {
        matches: updatedMatches.filter(m => m.homeTeam && m.awayTeam),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      const matchId = updatedMatches[index].id;
      if (matchId) {
        const matchRef = doc(db, 'Score', matchId);
        await setDoc(matchRef, {
          homeTeam: updatedMatches[index].homeTeam,
          awayTeam: updatedMatches[index].awayTeam,
          date: updatedMatches[index].date,
          isEnabled: newStatus,
          voteDeadlineOffset: updatedMatches[index].voteDeadlineOffset,
          timestamp: new Date(),
        }, { merge: true });
      }
    } catch (err) {
      console.error('경기 상태 업데이트 오류:', err.message);
      alert(`경기 상태 변경 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setStatusUpdateLoading(false);
    }
  }, [selectedMatches]);

  // 경기 삭제
  const handleRemoveMatch = useCallback(async (index) => {
    const matchId = selectedMatches[index].id;
    if (!matchId) {
      setSelectedMatches(prev => prev.filter((_, i) => i !== index));
      return;
    }
    if (!window.confirm(`경기 ${matchId}을(를) 삭제하시겠습니까?`)) return;

    try {
      const updatedMatches = selectedMatches.filter((_, i) => i !== index);
      setSelectedMatches(updatedMatches);

      console.log('경기 삭제:', { matchId, updatedMatches });

      const currentRef = doc(db, 'Score', 'current');
      await setDoc(currentRef, {
        matches: updatedMatches.filter(m => m.homeTeam && m.awayTeam),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      const matchRef = doc(db, 'Score', matchId);
      await deleteDoc(matchRef);
    } catch (err) {
      console.error('경기 삭제 오류:', err.message);
      alert(`경기 삭제 중 오류가 발생했습니다: ${err.message}`);
    }
  }, [selectedMatches]);

  // 모든 경기 저장
  const saveToScore = useCallback(async () => {
    const validMatches = selectedMatches.filter(m => m.homeTeam && m.awayTeam);
    if (validMatches.length < 1) {
      alert('최소 1개의 유효한 경기를 선택해야 저장할 수 있습니다.');
      return;
    }

    setLoading(true);
    try {
      const currentRef = doc(db, 'Score', 'current');
      console.log('저장할 경기 데이터:', validMatches);
      await setDoc(currentRef, {
        matches: validMatches,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      for (const match of validMatches) {
        if (!match.id) {
          match.id = `match_${formatDate(new Date(match.date))}_${Date.now()}`;
        }
        const matchRef = doc(db, 'Score', match.id);
        await setDoc(matchRef, {
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          date: match.date,
          isEnabled: match.isEnabled,
          voteDeadlineOffset: match.voteDeadlineOffset,
          timestamp: new Date(),
        }, { merge: true });
      }
      console.log('경기 저장 성공');
      alert('경기가 저장되었습니다!');
    } catch (err) {
      console.error('경기 저장 오류:', err.message);
      alert(`저장 중 오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedMatches]);

  // 새 슬롯 추가
  const addSlot = () => {
    setSelectedMatches(prev => [
      ...prev,
      { homeTeam: '', awayTeam: '', date: '', isEnabled: true, id: null, voteDeadlineOffset: 0 },
    ]);
  };

  // 모든 경기 초기화
  const resetAllMatches = () => {
    setSelectedMatches([
      { homeTeam: '', awayTeam: '', date: '', isEnabled: true, id: null, voteDeadlineOffset: 0 },
    ]);
  };

  // 필터링 시 유효성 검사 추가
  const filteredMatches = matches.filter(match => {
    if (!match.homeTeam || !match.awayTeam) {
      console.warn('유효하지 않은 경기 데이터 필터링:', match);
      return false;
    }
    return (
      match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!isAuthenticated) {
    console.log('비밀번호 인증 화면 렌더링');
    return (
      <S.PasswordContainer>
        <h2>비밀번호를 입력하세요</h2>
        <S.PasswordInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handlePasswordSubmit();
            }
          }}
          placeholder="비밀번호"
        />
        <S.SubmitButton onClick={handlePasswordSubmit}>제출</S.SubmitButton>
        {passwordError && <S.ErrorMessage>{passwordError}</S.ErrorMessage>}
      </S.PasswordContainer>
    );
  }

  console.log('메인 화면 렌더링', { selectedMatches, filteredMatches });
  return (
    <S.Container>
      <S.Header>스코어 관리</S.Header>

      <S.SubHeader>선택된 경기</S.SubHeader>
      <S.SelectedPlayersContainer>
        {selectedMatches.map((match, index) => (
          <SelectedMatchCard
            key={index}
            match={match}
            index={index}
            onRemove={handleRemoveMatch}
            onToggleStatus={handleToggleStatus}
            statusUpdateLoading={statusUpdateLoading}
          />
        ))}
        <S.AddSlotButton onClick={addSlot}>+ 경기 추가</S.AddSlotButton>
        <S.ResetButton onClick={resetAllMatches}>모두 초기화</S.ResetButton>
      </S.SelectedPlayersContainer>

      <S.SaveButton
        onClick={saveToScore}
        disabled={selectedMatches.filter(m => m.homeTeam && m.awayTeam).length < 1 || loading}
      >
        {loading ? '저장 중...' : 'Score에 저장'}
      </S.SaveButton>

      <S.SubHeader>새 경기 추가</S.SubHeader>
      <S.Form onSubmit={handleAddMatch}>
        <S.Input
          type="text"
          value={newMatch.homeTeam}
          onChange={(e) => setNewMatch(prev => ({ ...prev, homeTeam: e.target.value }))}
          placeholder="홈팀 이름"
        />
        <S.Input
          type="text"
          value={newMatch.awayTeam}
          onChange={(e) => setNewMatch(prev => ({ ...prev, awayTeam: e.target.value }))}
          placeholder="어웨이팀 이름"
        />
        <S.Input
          type="datetime-local"
          value={newMatch.date}
          onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
        />
        <S.Input
          type="number"
          value={newMatch.voteDeadlineOffset}
          onChange={(e) => setNewMatch(prev => ({ ...prev, voteDeadlineOffset: e.target.value }))}
          placeholder="마감 시간(분 전)"
          min="0"
        />
        <S.SubmitButton type="submit">경기 추가</S.SubmitButton>
      </S.Form>

      <S.SubHeader>경기 목록 ({filteredMatches.length}개)</S.SubHeader>
      <S.SearchInput
        type="text"
        placeholder="팀 이름으로 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading && <p>로딩 중...</p>}
      <S.PlayersList>
        {filteredMatches.map(match => (
          <S.PlayerCard
            key={match.id}
            onClick={() => {
              const isSelected = selectedMatches.some(m => m.id === match.id);
              if (!isSelected) {
                setSelectedMatches(prev => [
                  ...prev,
                  { ...match, id: match.id || `match_${formatDate(new Date(match.date))}_${Date.now()}` },
                ]);
              }
            }}
            selected={selectedMatches.some(m => m.id === match.id)}
          >
            <S.PlayerName>{match.homeTeam} vs {match.awayTeam}</S.PlayerName>
            <S.PlayerStats>일시: {new Date(match.date).toLocaleString()}</S.PlayerStats>
            <S.PlayerStats>상태: {match.isEnabled ? '예측 가능' : '예측 종료'}</S.PlayerStats>
            <S.PlayerStats>마감: {match.voteDeadlineOffset ? `${match.voteDeadlineOffset}분 전` : '없음'}</S.PlayerStats>
          </S.PlayerCard>
        ))}
      </S.PlayersList>
    </S.Container>
  );
};

export default ScoreAdmin;