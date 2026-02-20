import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { db } from '../App';
import * as S from './ScoreAdminCss';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

// 오늘 날짜 포맷팅 (YYYYMMDD)
const formatDate = (date) => {
  const kstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// 예측 항목 컴포넌트
const PredictionItem = React.memo(({ prediction, matchId, onEdit, onDelete }) => (
  <S.PredictionItem>
    <S.PredictionDetails>
      {prediction.nickname}: {prediction.homeScore}:{prediction.awayScore}
      (비밀번호: {prediction.password})
    </S.PredictionDetails>
    <S.ButtonGroup>
      <S.EditButton onClick={() => onEdit(matchId, prediction)}>수정</S.EditButton>
      <S.RemoveButton onClick={() => onDelete(matchId, prediction)}>삭제</S.RemoveButton>
    </S.ButtonGroup>
  </S.PredictionItem>
));

// 예측 목록 뷰 컴포넌트
const PredictionView = ({ match, predictions, onBack, onEditPrediction, onDeletePrediction }) => (
  <S.PredictionViewContainer>
    <S.BackButton onClick={onBack}>
      <FaArrowLeft /> 뒤로
    </S.BackButton>
    <S.Header>{match.homeTeam} vs {match.awayTeam}</S.Header>
    <S.PlayerStats>일시: {new Date(match.date).toLocaleString()}</S.PlayerStats>
    <S.PlayerStats>상태: {match.isEnabled ? '예측 가능' : '예측 종료'}</S.PlayerStats>
    <S.PlayerStats>마감: {match.voteDeadlineOffset ? `${match.voteDeadlineOffset}분 전` : '없음'}</S.PlayerStats>
    <S.SubHeader>예측 목록 ({predictions.length})</S.SubHeader>
    <S.PredictionContainer>
      {predictions.length === 0 ? (
        <S.NoData>예측 없음</S.NoData>
      ) : (
        predictions.map(pred => (
          <PredictionItem
            key={pred.id}
            prediction={pred}
            matchId={match.id}
            onEdit={onEditPrediction}
            onDelete={onDeletePrediction}
          />
        ))
      )}
    </S.PredictionContainer>
  </S.PredictionViewContainer>
);

// 선택된 경기 카드 컴포넌트
const SelectedMatchCard = React.memo(({ match, index, onRemove, statusUpdateLoading }) => (
  <S.SelectedPlayerCard>
    {match.homeTeam && match.awayTeam ? (
      <>
        <S.PlayerName>
          {match.homeTeam} vs {match.awayTeam} ({new Date(match.date).toLocaleString()})
        </S.PlayerName>
        <S.PlayerStats>상태: {match.isEnabled ? '예측 가능' : '예측 종료'}</S.PlayerStats>
        <S.PlayerStats>투표 마감: {match.voteDeadlineOffset ? `${match.voteDeadlineOffset}분 전` : '설정 안 됨'}</S.PlayerStats>
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
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [predictionsByMatch, setPredictionsByMatch] = useState({});
  const [editPrediction, setEditPrediction] = useState(null);
  const [editForm, setEditForm] = useState({ nickname: '', homeScore: '', awayScore: '', password: '' });
  const [selectedMatch, setSelectedMatch] = useState(null);

  // 익명 인증
  useEffect(() => {
    const auth = getAuth();
    signInAnonymously(auth)
      .then(() => console.log('익명 로그인 성공'))
      .catch(err => console.error('익명 로그인 오류:', err.message));
  }, []);


  // Firestore 초기화 확인
  useEffect(() => {
    console.log('Firestore DB 초기화 확인:', db ? '성공' : '실패');
  }, []);

  // 전체 경기 목록 가져오기
  useEffect(() => {
    if (!selectedMatch) {
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
          alert('경기 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      fetchMatches();
    }
  }, [selectedMatch]);

  // 현재 선택된 경기 데이터 및 예측 가져오기
  useEffect(() => {
    if (!selectedMatch) {
      console.log('현재 선택된 경기 데이터 가져오기 시작');
      const fetchCurrentMatchesAndPredictions = async () => {
        setLoading(true);
        try {
          // 경기 데이터 가져오기
          const currentRef = doc(db, 'Score', 'current');
          const currentDoc = await getDoc(currentRef);
          let matchesData = [];
          if (currentDoc.exists()) {
            matchesData = currentDoc.data().matches || [];
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

          // 예측 데이터 가져오기
          const predictionsByMatch = {};
          for (const match of matchesData) {
            const predictionsRef = collection(db, 'Score', match.id, 'predictions');
            const snapshot = await getDocs(predictionsRef);
            const matchPredictions = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            predictionsByMatch[match.id] = matchPredictions;
          }
          console.log('모든 예측 데이터:', predictionsByMatch);
          setPredictionsByMatch(predictionsByMatch);
        } catch (err) {
          console.error('데이터 가져오기 오류:', err.message);
          alert('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      fetchCurrentMatchesAndPredictions();
    }
  }, [selectedMatch]);

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

  // 예측 수정 시작
  const startEditPrediction = useCallback((matchId, prediction) => {
    setEditPrediction({ matchId, predictionId: prediction.id });
    setEditForm({
      nickname: prediction.nickname,
      homeScore: prediction.homeScore.toString(),
      awayScore: prediction.awayScore.toString(),
      password: prediction.password,
    });
  }, []);

  // 예측 수정 제출
  const handleEditPrediction = useCallback(async (e) => {
    e.preventDefault();
    if (!editForm.nickname || !editForm.homeScore || !editForm.awayScore || !editForm.password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const homeScore = parseInt(editForm.homeScore);
    const awayScore = parseInt(editForm.awayScore);
    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      alert('유효한 스코어를 입력해주세요.');
      return;
    }

    try {
      const predictionRef = doc(db, 'Score', editPrediction.matchId, 'predictions', editPrediction.predictionId);
      const winner = homeScore > awayScore ? selectedMatch.homeTeam :
        awayScore > homeScore ? selectedMatch.awayTeam : 'draw';
      await updateDoc(predictionRef, {
        nickname: editForm.nickname,
        homeScore,
        awayScore,
        winner,
        password: editForm.password,
        timestamp: new Date(),
      });

      setPredictionsByMatch(prev => ({
        ...prev,
        [editPrediction.matchId]: prev[editPrediction.matchId].map(p =>
          p.id === editPrediction.predictionId ? { ...p, nickname: editForm.nickname, homeScore, awayScore, winner, password: editForm.password, timestamp: new Date() } : p
        ),
      }));

      alert('예측이 수정되었습니다!');
      setEditPrediction(null);
      setEditForm({ nickname: '', homeScore: '', awayScore: '', password: '' });
    } catch (err) {
      console.error('예측 수정 오류:', err.message);
      alert(`예측 수정 중 오류가 발생했습니다: ${err.message}`);
    }
  }, [editForm, editPrediction, selectedMatch]);

  // 예측 삭제
  const handleDeletePrediction = useCallback((matchId, prediction) => {
    if (!window.confirm(`${prediction.nickname} ${prediction.homeScore}:${prediction.awayScore} 예측을 삭제하시겠습니까?`)) return;

    try {
      const predictionRef = doc(db, 'Score', matchId, 'predictions', prediction.id);
      deleteDoc(predictionRef);

      setPredictionsByMatch(prev => ({
        ...prev,
        [matchId]: prev[matchId].filter(p => p.id !== prediction.id),
      }));

      alert('예측이 삭제되었습니다!');
    } catch (err) {
      console.error('예측 삭제 오류:', err.message);
      alert(`예측 삭제 중 오류가 발생했습니다: ${err.message}`);
    }
  }, []);

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

  // 뒤로 가기
  const handleBack = () => {
    setSelectedMatch(null);
    setEditPrediction(null);
    setEditForm({ nickname: '', homeScore: '', awayScore: '', password: '' });
  };

  return (
    <S.Container>
      {selectedMatch ? (
        <PredictionView
          match={selectedMatch}
          predictions={predictionsByMatch[selectedMatch.id] || []}
          onBack={handleBack}
          onEditPrediction={startEditPrediction}
          onDeletePrediction={handleDeletePrediction}
        />
      ) : (
        <>
          <S.Header>Score Admin</S.Header>
          <S.FormSection>
            <h3>새 경기 추가</h3>
            <S.Input
              type="text"
              name="homeTeam"
              value={newMatch.homeTeam}
              onChange={(e) => setNewMatch(prev => ({ ...prev, homeTeam: e.target.value }))}
              placeholder="홈 팀"
            />
            <S.Input
              type="text"
              name="awayTeam"
              value={newMatch.awayTeam}
              onChange={(e) => setNewMatch(prev => ({ ...prev, awayTeam: e.target.value }))}
              placeholder="어웨이 팀"
            />
            <S.Input
              type="datetime-local"
              name="date"
              value={newMatch.date}
              onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
            />
            <S.Input
              type="number"
              name="voteDeadlineOffset"
              value={newMatch.voteDeadlineOffset}
              onChange={(e) => setNewMatch(prev => ({ ...prev, voteDeadlineOffset: e.target.value }))}
              placeholder="투표 마감 오프셋 (분)"
            />
            <S.SubmitButton onClick={handleAddMatch}>경기 추가</S.SubmitButton>
          </S.FormSection>

          <S.SelectedPlayersContainer>
            <h3>현재 선택된 경기 (홈 화면 노출)</h3>
            {selectedMatches.map((match, index) => (
              <SelectedMatchCard
                key={match.id || index}
                match={match}
                index={index}
                onRemove={handleRemoveMatch}
                statusUpdateLoading={statusUpdateLoading}
              />
            ))}
          </S.SelectedPlayersContainer>

          <S.SaveButton
            onClick={saveToScore}
            disabled={selectedMatches.filter(m => m.homeTeam && m.awayTeam).length < 1 || loading}
          >
            {loading ? '저장 중...' : 'Score에 저장'}
          </S.SaveButton>

          <S.SubHeader>경기 목록 ({filteredMatches.length}개)</S.SubHeader>
          <S.SearchInput
            type="text"
            placeholder="팀 이름으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading && <p>로딩 중...</p>}
          <S.PlayersList>
            {filteredMatches.map((match) => (
              <S.PlayerCard
                key={match.id}
                onClick={() => {
                  setSelectedMatch(match);
                  // Add match to selectedMatches if not already present
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
        </>
      )}

      {editPrediction && (
        <S.ModalOverlay>
          <S.ModalContent>
            <S.Header>예측 수정</S.Header>
            <S.Input
              type="text"
              name="nickname"
              value={editForm.nickname}
              onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
              placeholder="닉네임"
            />
            <S.Input
              type="number"
              name="homeScore"
              value={editForm.homeScore}
              onChange={(e) => setEditForm(prev => ({ ...prev, homeScore: e.target.value }))}
              placeholder="홈 스코어"
            />
            <S.Input
              type="number"
              name="awayScore"
              value={editForm.awayScore}
              onChange={(e) => setEditForm(prev => ({ ...prev, awayScore: e.target.value }))}
              placeholder="어웨이 스코어"
            />
            <S.Input
              type="password"
              name="password"
              value={editForm.password}
              onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="비밀번호"
            />
            <S.SubmitButton onClick={handleEditPrediction}>수정</S.SubmitButton>
            <S.CancelButton onClick={() => setEditPrediction(null)}>취소</S.CancelButton>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default ScoreAdmin;