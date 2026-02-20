import React, { useState, useEffect } from 'react';
import { doc, getDoc, addDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { db } from '../App';
import * as S from './ScoreAdminCss';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Score = () => {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [allPredictions, setAllPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [timeLeft, setTimeLeft] = useState({});
  const [showPassword, setShowPassword] = useState({});
  const [capsLockOn, setCapsLockOn] = useState({});

  useEffect(() => {
    const auth = getAuth();
    signInAnonymously(auth)
      .then(() => console.log('익명 로그인 성공'))
      .catch(err => console.error('익명 로그인 오류:', err.message));
  }, []);

  useEffect(() => {
    const fetchCurrentMatches = async () => {
      setLoading(true);
      try {
        const currentRef = doc(db, 'Score', 'current');
        const currentDoc = await getDoc(currentRef);
        let matchesData = [];
        if (currentDoc.exists()) {
          matchesData = currentDoc.data().matches || [];
          console.log('Score/current에서 가져온 데이터:', matchesData);
          setMatches(matchesData.filter(match => match.isEnabled && match.homeTeam && match.awayTeam));
        } else {
          console.log('Score/current 문서가 존재하지 않음');
          setMatches([]);
        }

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
        setAllPredictions(predictionsByMatch);
      } catch (err) {
        console.error('데이터 가져오기 오류:', err.message);
        setError('경기 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentMatches();
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
      const newTimeLeft = {};
      matches.forEach(match => {
        const matchDate = new Date(match.date);
        const deadline = new Date(matchDate.getTime() - (match.voteDeadlineOffset || 0) * 60 * 1000);
        const diff = deadline - now;
        if (diff > 0) {
          const minutes = Math.floor(diff / 1000 / 60);
          const seconds = Math.floor((diff / 1000) % 60);
          newTimeLeft[match.id] = { minutes, seconds, isUrgent: minutes < 5 };
        } else {
          newTimeLeft[match.id] = { minutes: 0, seconds: 0, isUrgent: false };
        }
      });
      setTimeLeft(newTimeLeft);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [matches]);

  const handlePredictionChange = (matchId, field, value) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  const toggleShowPassword = (matchId) => {
    setShowPassword(prev => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  const handleCapsLock = (e, matchId) => {
    const isCapsLockOn = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockOn(prev => ({
      ...prev,
      [matchId]: isCapsLockOn,
    }));
  };

  const calculateWinner = (homeScore, awayScore, homeTeam, awayTeam) => {
    if (homeScore > awayScore) return homeTeam;
    if (awayScore > homeScore) return awayTeam;
    return 'draw';
  };

  const handleSubmit = async (e, matchId, homeTeam, awayTeam) => {
    e.preventDefault();
    const prediction = predictions[matchId];
    if (!prediction?.nickname || !prediction?.homeScore || !prediction?.awayScore || !prediction?.password) {
      alert('닉네임, 스코어, 비밀번호를 모두 입력해주세요.');
      return;
    }

    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const match = matches.find(m => m.id === matchId);
    const deadline = new Date(new Date(match.date).getTime() - (match.voteDeadlineOffset || 0) * 60 * 1000);
    if (now > deadline) {
      alert('투표 마감 시간이 지났습니다.');
      return;
    }

    try {
      const homeScore = parseInt(prediction.homeScore);
      const awayScore = parseInt(prediction.awayScore);
      const winner = calculateWinner(homeScore, awayScore, homeTeam, awayTeam);

      console.log('예측 제출:', { matchId, prediction, winner });
      const docRef = await addDoc(collection(db, 'Score', matchId, 'predictions'), {
        nickname: prediction.nickname,
        homeScore,
        awayScore,
        winner,
        password: prediction.password,
        userId: `user_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      });

      setAllPredictions(prev => ({
        ...prev,
        [matchId]: [
          ...(prev[matchId] || []),
          {
            id: docRef.id,
            nickname: prediction.nickname,
            homeScore,
            awayScore,
            winner,
            password: prediction.password,
            userId: `user_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
          },
        ],
      }));

      alert('예측이 제출되었습니다!');
      setPredictions(prev => ({ ...prev, [matchId]: {} }));
    } catch (err) {
      console.error('예측 제출 오류:', err.message);
      alert(`예측 제출 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  const startEdit = (matchId, predictionId) => {
    const password = prompt('비밀번호를 입력해주세요:');
    if (!password) {
      alert('비밀번호를 입력해야 수정할 수 있습니다.');
      return;
    }

    const currentPrediction = allPredictions[matchId].find(p => p.id === predictionId);
    if (currentPrediction.password !== password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setEditMode({ matchId, predictionId });
    setEditPassword('');
    setPasswordError('');
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        homeScore: currentPrediction.homeScore.toString(),
        awayScore: currentPrediction.awayScore.toString(),
      },
    }));
  };

  const handleEdit = async (matchId, predictionId) => {
    const prediction = predictions[matchId];
    if (!prediction?.homeScore || !prediction?.awayScore) {
      alert('스코어를 입력해주세요.');
      return;
    }

    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const match = matches.find(m => m.id === matchId);
    const deadline = new Date(new Date(match.date).getTime() - (match.voteDeadlineOffset || 0) * 60 * 1000);
    if (now > deadline) {
      alert('투표 마감 시간이 지났습니다.');
      return;
    }

    try {
      const homeScore = parseInt(prediction.homeScore);
      const awayScore = parseInt(prediction.awayScore);
      const winner = calculateWinner(homeScore, awayScore, match.homeTeam, match.awayTeam);

      const predictionRef = doc(db, 'Score', matchId, 'predictions', predictionId);
      await updateDoc(predictionRef, {
        homeScore,
        awayScore,
        winner,
        timestamp: new Date(),
      });

      setAllPredictions(prev => ({
        ...prev,
        [matchId]: prev[matchId].map(p =>
          p.id === predictionId ? { ...p, homeScore, awayScore, winner, timestamp: new Date() } : p
        ),
      }));

      alert('예측이 수정되었습니다!');
      setEditMode(null);
      setEditPassword('');
      setPasswordError('');
      setPredictions(prev => ({ ...prev, [matchId]: {} }));
    } catch (err) {
      console.error('예측 수정 오류:', err.message);
      alert(`예측 수정 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  const handleDelete = (matchId, predictionId) => {
    const currentPrediction = allPredictions[matchId].find(p => p.id === predictionId);
    const confirmDelete = window.confirm(
      `${currentPrediction.nickname}: ${currentPrediction.homeScore}:${currentPrediction.awayScore} 예측을 삭제하시겠습니까?`
    );
    if (!confirmDelete) return;

    const password = prompt('비밀번호를 입력해주세요:');
    if (!password) {
      alert('비밀번호를 입력해야 삭제할 수 있습니다.');
      return;
    }

    if (currentPrediction.password !== password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const match = matches.find(m => m.id === matchId);
    const deadline = new Date(new Date(match.date).getTime() - (match.voteDeadlineOffset || 0) * 60 * 1000);
    if (now > deadline) {
      alert('투표 마감 시간이 지났습니다.');
      return;
    }

    try {
      const predictionRef = doc(db, 'Score', matchId, 'predictions', predictionId);
      deleteDoc(predictionRef);

      setAllPredictions(prev => ({
        ...prev,
        [matchId]: prev[matchId].filter(p => p.id !== predictionId),
      }));

      alert('예측이 삭제되었습니다!');
      setEditMode(null);
      setEditPassword('');
      setPasswordError('');
    } catch (err) {
      console.error('예측 삭제 오류:', err.message);
      alert(`예측 삭제 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  const renderDeadline = (match) => {
    const matchDate = new Date(match.date);
    const deadline = new Date(matchDate.getTime() - (match.voteDeadlineOffset || 0) * 60 * 1000);
    const timeLeftForMatch = timeLeft[match.id] || { minutes: 0, seconds: 0, isUrgent: false };

    if (timeLeftForMatch.minutes === 0 && timeLeftForMatch.seconds === 0) {
      return <S.DeadlineText>투표 마감</S.DeadlineText>;
    }

    if (timeLeftForMatch.minutes < 30) {
      return (
        <S.DeadlineText isUrgent={timeLeftForMatch.isUrgent}>
          {timeLeftForMatch.isUrgent ? '마감까지 ' : '마감까지 '}
          {timeLeftForMatch.minutes}분 {timeLeftForMatch.seconds.toString().padStart(2, '0')}초
          {timeLeftForMatch.isUrgent ? ' 전!' : ''}
        </S.DeadlineText>
      );
    }

    return <S.DeadlineText>투표 마감: {deadline.toLocaleString()}</S.DeadlineText>;
  };

  const renderPredictions = (matchId, homeTeam, awayTeam) => {
    const matchPredictions = allPredictions[matchId] || [];
    const homeWin = matchPredictions.filter(p => p.winner === homeTeam);
    const awayWin = matchPredictions.filter(p => p.winner === awayTeam);
    const draw = matchPredictions.filter(p => p.winner === 'draw');

    return (
      <S.PredictionContainer>
        <S.PredictionCategory>
          <S.SubHeader>{homeTeam} 승리</S.SubHeader>
          {homeWin.length === 0 ? (
            <S.NoData>예측 없음</S.NoData>
          ) : (
            homeWin.map(pred => (
              <S.PredictionItem key={pred.id}>
                {pred.nickname}: {pred.homeScore}:{pred.awayScore}
                <S.ButtonGroup>
                  <S.EditButton
                    onClick={() => startEdit(matchId, pred.id)}
                    disabled={timeLeft[matchId]?.minutes === 0 && timeLeft[matchId]?.seconds === 0}
                  >
                    수정
                  </S.EditButton>
                  <S.RemoveButton
                    onClick={() => handleDelete(matchId, pred.id)}
                    disabled={timeLeft[matchId]?.minutes === 0 && timeLeft[matchId]?.seconds === 0}
                  >
                    삭제
                  </S.RemoveButton>
                </S.ButtonGroup>
              </S.PredictionItem>
            ))
          )}
        </S.PredictionCategory>
        <S.PredictionCategory>
          <S.SubHeader>{awayTeam} 승리</S.SubHeader>
          {awayWin.length === 0 ? (
            <S.NoData>예측 없음</S.NoData>
          ) : (
            awayWin.map(pred => (
              <S.PredictionItem key={pred.id}>
                {pred.nickname}: {pred.homeScore}:{pred.awayScore}
                <S.ButtonGroup>
                  <S.EditButton
                    onClick={() => startEdit(matchId, pred.id)}
                    disabled={timeLeft[matchId]?.minutes === 0 && timeLeft[matchId]?.seconds === 0}
                  >
                    수정
                  </S.EditButton>
                  <S.RemoveButton
                    onClick={() => handleDelete(matchId, pred.id)}
                    disabled={timeLeft[matchId]?.minutes === 0 && timeLeft[matchId]?.seconds === 0}
                  >
                    삭제
                  </S.RemoveButton>
                </S.ButtonGroup>
              </S.PredictionItem>
            ))
          )}
        </S.PredictionCategory>
        <S.PredictionCategory>
          <S.SubHeader>무승부</S.SubHeader>
          {draw.length === 0 ? (
            <S.NoData>예측 없음</S.NoData>
          ) : (
            draw.map(pred => (
              <S.PredictionItem key={pred.id}>
                {pred.nickname}: {pred.homeScore}:{pred.awayScore}
                <S.ButtonGroup>
                  <S.EditButton
                    onClick={() => startEdit(matchId, pred.id)}
                    disabled={timeLeft[matchId]?.minutes === 0 && timeLeft[matchId]?.seconds === 0}
                  >
                    수정
                  </S.EditButton>
                  <S.RemoveButton
                    onClick={() => handleDelete(matchId, pred.id)}
                    disabled={timeLeft[matchId]?.minutes === 0 && timeLeft[matchId]?.seconds === 0}
                  >
                    삭제
                  </S.RemoveButton>
                </S.ButtonGroup>
              </S.PredictionItem>
            ))
          )}
        </S.PredictionCategory>
      </S.PredictionContainer>
    );
  };

  if (loading) {
    console.log('Score 페이지 로딩 중');
    return (
      <S.Container>
        <S.Header>경기 스코어 예측</S.Header>
        <p>로딩 중...</p>
      </S.Container>
    );
  }

  if (error) {
    console.log('Score 페이지 에러:', error);
    return (
      <S.Container>
        <S.Header>경기 스코어 예측</S.Header>
        <S.ErrorMessage>{error}</S.ErrorMessage>
      </S.Container>
    );
  }

  console.log('Score 페이지 렌더링', { matches });
  return (
    <S.Container>
      <S.Header>경기 스코어 예측</S.Header>
      <S.SubHeader>예측 가능한 경기 ({matches.length}개)</S.SubHeader>
      {matches.length === 0 ? (
        <S.NoData>예정된 경기가 없습니다.</S.NoData>
      ) : (
        <S.PlayersList>
          {matches.map(match => (
            <S.PlayerCard key={match.id}>
              <S.PlayerName>{match.homeTeam} vs {match.awayTeam}</S.PlayerName>
              <S.PlayerStats>일시: {new Date(match.date).toLocaleString()}</S.PlayerStats>
              {renderDeadline(match)}
              {editMode?.matchId === match.id ? (
                <S.Form
                  onSubmit={e => {
                    e.preventDefault();
                    if (editMode.predictionId) {
                      handleEdit(match.id, editMode.predictionId);
                    }
                  }}
                >
                  <S.ScoreInputContainer>
                    <S.Input
                      type="number"
                      placeholder={`${match.homeTeam} 스코어`}
                      value={predictions[match.id]?.homeScore || ''}
                      onChange={(e) => handlePredictionChange(match.id, 'homeScore', e.target.value)}
                      min="0"
                      disabled={timeLeft[match.id]?.minutes === 0 && timeLeft[match.id]?.seconds === 0}
                    />
                   
                    <S.Input
                      type="number"
                      placeholder={`${match.awayTeam} 스코어`}
                      value={predictions[match.id]?.awayScore || ''}
                      onChange={(e) => handlePredictionChange(match.id, 'awayScore', e.target.value)}
                      min="0"
                      disabled={timeLeft[match.id]?.minutes === 0 && timeLeft[match.id]?.seconds === 0}
                    />
                  </S.ScoreInputContainer>
                  <S.SubmitButton type="submit">수정</S.SubmitButton>
                  <S.CancelButton onClick={() => {
                    setEditMode(null);
                    setEditPassword('');
                    setPasswordError('');
                    setPredictions(prev => ({ ...prev, [match.id]: {} }));
                  }}>
                    취소
                  </S.CancelButton>
                  {passwordError && <S.ErrorMessage>{passwordError}</S.ErrorMessage>}
                </S.Form>
              ) : (
                <S.Form onSubmit={(e) => handleSubmit(e, match.id, match.homeTeam, match.awayTeam)}>
                  <S.Input
                    type="text"
                    placeholder="닉네임"
                    value={predictions[match.id]?.nickname || ''}
                    onChange={(e) => handlePredictionChange(match.id, 'nickname', e.target.value)}
                    disabled={timeLeft[match.id]?.minutes === 0 && timeLeft[match.id]?.seconds === 0}
                  />
                  <S.ScoreInputContainer>
                    <S.Input
                      type="number"
                      placeholder={`${match.homeTeam} `}
                      value={predictions[match.id]?.homeScore || ''}
                      onChange={(e) => handlePredictionChange(match.id, 'homeScore', e.target.value)}
                      min="0"
                      disabled={timeLeft[match.id]?.minutes === 0 && timeLeft[match.id]?.seconds === 0}
                    />
             
                    <S.Input
                      type="number"
                      placeholder={`${match.awayTeam} `}
                      value={predictions[match.id]?.awayScore || ''}
                      onChange={(e) => handlePredictionChange(match.id, 'awayScore', e.target.value)}
                      min="0"
                      disabled={timeLeft[match.id]?.minutes === 0 && timeLeft[match.id]?.seconds === 0}
                    />
                  </S.ScoreInputContainer>
                  <S.PasswordContainer>
                    <S.Input
                      type={showPassword[match.id] ? 'text' : 'password'}
                      placeholder="비밀번호"
                      value={predictions[match.id]?.password || ''}
                      onChange={(e) => handlePredictionChange(match.id, 'password', e.target.value)}
                      onKeyDown={(e) => handleCapsLock(e, match.id)}
                      onKeyUp={(e) => handleCapsLock(e, match.id)}
                      disabled={timeLeft[match.id]?.minutes === 0 && timeLeft[match.id]?.seconds === 0}
                    />
                    <S.TogglePasswordButton
                      type="button"
                      onClick={() => toggleShowPassword(match.id)}
                      disabled={timeLeft[match.id]?.minutes === 0 && timeLeft[match.id]?.seconds === 0}
                    >
                      {showPassword[match.id] ? <FaEyeSlash /> : <FaEye />}
                    </S.TogglePasswordButton>
                  </S.PasswordContainer>
                  {capsLockOn[match.id] && (
                    <S.CapsLockWarning>CapsLock이 켜져 있습니다</S.CapsLockWarning>
                  )}
                  <S.SubmitButton
                    type="submit"
                    disabled={timeLeft[match.id]?.minutes === 0 && timeLeft[match.id]?.seconds === 0}
                  >
                    예측 제출
                  </S.SubmitButton>
                </S.Form>
              )}
              {renderPredictions(match.id, match.homeTeam, match.awayTeam)}
            </S.PlayerCard>
          ))}
        </S.PlayersList>
      )}
    </S.Container>
  );
};

export default Score;