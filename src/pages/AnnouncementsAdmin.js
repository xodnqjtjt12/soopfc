import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../App';
import * as S from './AnnouncementsAdminCss';

// 포지션 한글 매핑
const POSITIONS = {
  GK: '골키퍼',
  CB: '수비수',
  MF: '미드필더',
  FW: '공격수'
};

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

// 날짜 포맷팅 (YYYY-MM-DD)
const formatDateDisplay = (date) => {
  const kstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 컴포넌트 분리
const VoteTable = React.memo(({ voteResults }) => (
  <S.VoteTable>
    <table>
      <thead>
        <tr>
          <S.VoteHeader>선수 이름</S.VoteHeader>
          <S.VoteHeader>팀</S.VoteHeader>
          <S.VoteHeader>포지션</S.VoteHeader>
          <S.VoteHeader>1위 투표</S.VoteHeader>
          <S.VoteHeader>2위 투표</S.VoteHeader>
          <S.VoteHeader>3위 투표</S.VoteHeader>
          <S.VoteHeader>총 투표</S.VoteHeader>
        </tr>
      </thead>
      <tbody>
        {voteResults.map(player => (
          <S.VoteRow key={player.id}>
            <S.VoteCell>{player.name}</S.VoteCell>
            <S.VoteCell>{player.team}</S.VoteCell>
            <S.VoteCell>{POSITIONS[player.position] || player.position}</S.VoteCell>
            <S.VoteCell>{player.rank1}</S.VoteCell>
            <S.VoteCell>{player.rank2}</S.VoteCell>
            <S.VoteCell>{player.rank3}</S.VoteCell>
            <S.VoteCell>{player.total}</S.VoteCell>
          </S.VoteRow>
        ))}
      </tbody>
    </table>
  </S.VoteTable>
));

const Summary = React.memo(({ totalVotes, topThree, topEight }) => (
  <S.SummarySection>
    <S.TopThreeSection>
      <h3>상위 3위</h3>
      <S.SummaryItem>총 투표 수: {totalVotes}표</S.SummaryItem>
      {topThree.map((player) => (
        <S.SummaryItem key={player.id}>
          <span className="rank">{player.rank}</span>
          {player.name} ({player.team}, {player.total}표)
        </S.SummaryItem>
      ))}
      {topThree.length < 3 &&
        Array(3 - topThree.length)
          .fill()
          .map((_, index) => (
            <S.SummaryItem key={`empty-three-${index}`}>
              <span className="rank">{topThree.length + index + 1}</span>
              데이터 없음
            </S.SummaryItem>
          ))}
    </S.TopThreeSection>
    <S.TopEightSection>
      <h3>상위 8위</h3>
      {topEight.map((player) => (
        <S.SummaryItem key={player.id}>
          <span className="rank">{player.rank}</span>
          {player.name} ({player.team}, {player.total}표)
        </S.SummaryItem>
      ))}
      {topEight.length < 8 &&
        Array(8 - topThree.length)
          .fill()
          .map((_, index) => (
            <S.SummaryItem key={`empty-eight-${index}`}>
              <span className="rank">{topEight.length + index + 1}</span>
              데이터 없음
            </S.SummaryItem>
          ))}
    </S.TopEightSection>
  </S.SummarySection>
));

const CommentsSection = React.memo(({ comments }) => (
  <S.CommentsSection>
    <h3>운영진에게 하고 싶은 말</h3>
    {comments.length > 0 ? (
      <S.CommentsList>
        {comments.map(({ userId, comment }) => (
          <S.CommentItem key={userId}>
            <strong>사용자 {userId.slice(5, 10)}:</strong> {comment}
          </S.CommentItem>
        ))}
      </S.CommentsList>
    ) : (
      <S.NoData>댓글이 없습니다.</S.NoData>
    )}
  </S.CommentsSection>
));

const VoteHistory = React.memo(({ voteHistory, onDelete, onView }) => (
  <S.VoteHistorySection>
    <h3>지난 투표 기록 (votes 컬렉션)</h3>
    {voteHistory.length > 0 ? (
      <S.HistoryTable>
        <table>
          <thead>
            <tr>
              <S.VoteHeader>날짜</S.VoteHeader>
              <S.VoteHeader>총 투표 수</S.VoteHeader>
              <S.VoteHeader>상위 3명</S.VoteHeader>
              <S.VoteHeader>작업</S.VoteHeader>
            </tr>
          </thead>
          <tbody>
            {voteHistory.map(item => {
              const results = Object.entries(item.data.playerVotes || {}).map(([id, data]) => ({
                id,
                name: data.name || 'Unknown',
                team: data.team || 'Unknown',
                total: data.votes?.total || 0
              }));
              results.sort((a, b) => b.total - a.total);
              const topThreeNames = results.slice(0, 3).map(p => p.name).join(', ');
              const totalVotes = results.reduce((sum, player) => sum + player.total, 0);

              return (
                <S.VoteRow key={item.id}>
                  <S.VoteCell>{item.date}</S.VoteCell>
                  <S.VoteCell>{totalVotes}표</S.VoteCell>
                  <S.VoteCell>{topThreeNames || '없음'}</S.VoteCell>
                  <S.VoteCell>
                    <S.ViewButton onClick={() => onView(item)}>
                      보기
                    </S.ViewButton>
                    <S.DeleteButton onClick={() => onDelete(item.id)}>
                      삭제
                    </S.DeleteButton>
                  </S.VoteCell>
                </S.VoteRow>
              );
            })}
          </tbody>
        </table>
      </S.HistoryTable>
    ) : (
      <S.NoData>저장된 투표 기록이 없습니다.</S.NoData>
    )}
  </S.VoteHistorySection>
));

const AnnouncementsAdmin = () => {
  const [voteResults, setVoteResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [topThree, setTopThree] = useState([]);
  const [topEight, setTopEight] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [voteEnabled, setVoteEnabled] = useState(false);
  const [voteStartDateTime, setVoteStartDateTime] = useState(null);
  const [voteEndDateTime, setVoteEndDateTime] = useState(null);
  const [matchDate, setMatchDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingVoteState, setPendingVoteState] = useState(null);
  const [isReopening, setIsReopening] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [voteHistory, setVoteHistory] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHistoryData, setSelectedHistoryData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [newVoteStartDateTime, setNewVoteStartDateTime] = useState('');
  const [newVoteEndDateTime, setNewVoteEndDateTime] = useState('');
  const [newMatchDate, setNewMatchDate] = useState('');
  const [exposedDates, setExposedDates] = useState([]);
  const [newExposedDate, setNewExposedDate] = useState('');

  const today = formatDate(new Date());

  // 비밀번호 확인
  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault();
    if (password === 'alves') {
      setIsAuthenticated(true);
      setPasswordError('');
      console.log('관리자 인증 성공');
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.');
      console.error('관리자 인증 실패');
    }
  }, [password]);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    setPasswordError('');
  }, []);

  const handlePasswordKeyEvent = useCallback((e) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  }, []);

  // Firestore 초기화 확인
  useEffect(() => {
    console.log('Firestore DB 초기화 확인:', db ? '성공' : '실패');
  }, []);

  // 히스토리 데이터 계산
  const computeHistoryVoteData = useCallback((historyItem) => {
    const results = Object.entries(historyItem.data.playerVotes || {}).map(([id, data]) => ({
      id,
      name: data.name || 'Unknown',
      team: data.team || 'Unknown',
      position: data.position || 'Unknown',
      rank1: data.votes?.rank1 || 0,
      rank2: data.votes?.rank2 || 0,
      rank3: data.votes?.rank3 || 0,
      total: data.votes?.total || 0
    }));

    const sortedResults = [...results].sort((a, b) => b.total - a.total);
    let topThreeList = [];
    let topEightList = [];
    let rank = 0;

    const thirdVoteCount = sortedResults.length >= 3 ? sortedResults[2].total : 0;
    for (let i = 0; i < sortedResults.length; i++) {
      if (i === 0 || sortedResults[i].total !== sortedResults[i - 1].total) {
        rank = i + 1;
      }
      if (rank <= 3 || sortedResults[i].total >= thirdVoteCount) {
        topThreeList.push({ ...sortedResults[i], rank });
      } else {
        break;
      }
    }

    rank = 0;
    let nonTopThreeCount = 0;
    const topThreeIds = new Set(topThreeList.map(p => p.id));
    for (let i = 0; i < sortedResults.length && nonTopThreeCount < 8; i++) {
      if (topThreeIds.has(sortedResults[i].id)) {
        continue;
      }
      if (i === 0 || sortedResults[i].total !== sortedResults[i - 1].total) {
        rank = nonTopThreeCount + 1;
      }
      const eighthVoteCount = sortedResults.length >= (topThreeList.length + 8) ? sortedResults[topThreeList.length + 7].total : 0;
      if (rank <= 8 || sortedResults[i].total >= eighthVoteCount) {
        topEightList.push({ ...sortedResults[i], rank });
        nonTopThreeCount++;
      }
    }

    const total = sortedResults.reduce((sum, player) => sum + player.total, 0);
    const comments = historyItem.data.comments
      ? Object.entries(historyItem.data.comments).map(([userId, comment]) => ({ userId, comment }))
      : [];

    return { total, topThreeList, topEightList, comments };
  }, []);

  // 데이터 계산 메모이제이션
  const computedVoteData = useMemo(() => {
    const results = [...voteResults].sort((a, b) => b.total - a.total);
    let topThreeList = [];
    let topEightList = [];
    let rank = 0;

    const thirdVoteCount = results.length >= 3 ? results[2].total : 0;
    for (let i = 0; i < results.length; i++) {
      if (i === 0 || results[i].total !== results[i - 1].total) {
        rank = i + 1;
      }
      if (rank <= 3 || results[i].total >= thirdVoteCount) {
        topThreeList.push({ ...results[i], rank });
      } else {
        break;
      }
    }

    rank = 0;
    let nonTopThreeCount = 0;
    const topThreeIds = new Set(topThreeList.map(p => p.id));
    for (let i = 0; i < results.length && nonTopThreeCount < 8; i++) {
      if (topThreeIds.has(results[i].id)) {
        continue;
      }
      if (i === 0 || results[i].total !== results[i - 1].total) {
        rank = nonTopThreeCount + 1;
      }
      const eighthVoteCount = results.length >= (topThreeList.length + 8) ? results[topThreeList.length + 7].total : 0;
      if (rank <= 8 || results[i].total >= eighthVoteCount) {
        topEightList.push({ ...results[i], rank });
        nonTopThreeCount++;
      }
    }

    const total = results.reduce((sum, player) => sum + player.total, 0);
    return { results, topThreeList, topEightList, total };
  }, [voteResults]);

  useEffect(() => {
    setTotalVotes(computedVoteData.total);
    setTopThree(computedVoteData.topThreeList);
    setTopEight(computedVoteData.topEightList);
  }, [computedVoteData]);

  // 데이터 가져오기 및 실시간 업데이트
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchVoteHistory();
      } catch (err) {
        console.error('투표 히스토리 가져오기 오류:', err);
        setError('투표 히스토리를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();

      const voteRef = doc(db, 'votes', `vote_${today}`);
      const voteStatusRef = doc(db, 'voteStatus', today);

      const unsubscribeVote = onSnapshot(voteRef, (voteDoc) => {
        if (voteDoc.exists()) {
          const voteData = voteDoc.data();
          if (!voteData.playerVotes || typeof voteData.playerVotes !== 'object') {
            console.warn('잘못된 playerVotes 형식:', voteData.playerVotes);
            setVoteResults([]);
            return;
          }
          const results = Object.entries(voteData.playerVotes).map(([id, data]) => ({
            id,
            name: data.name || 'Unknown',
            team: data.team || 'Unknown',
            position: data.position || 'Unknown',
            rank1: data.votes?.rank1 || 0,
            rank2: data.votes?.rank2 || 0,
            rank3: data.votes?.rank3 || 0,
            total: data.votes?.total || 0
          }));
          setVoteResults(results);
          const commentsList = voteData.comments
            ? Object.entries(voteData.comments).map(([userId, comment]) => ({ userId, comment }))
            : [];
          setComments(commentsList);
          console.log('투표 데이터 업데이트:', results);
        } else {
          console.log('투표 데이터 없음, 초기화');
          setVoteResults([]);
          setComments([]);
          setTotalVotes(0);
          setTopThree([]);
          setTopEight([]);
        }
      }, (err) => {
        console.error('투표 데이터 리스너 오류:', err.message);
        setError(`투표 데이터를 불러오는 중 오류가 발생했습니다: ${err.message}`);
      });

      const unsubscribeStatus = onSnapshot(voteStatusRef, (voteStatusDoc) => {
        if (voteStatusDoc.exists()) {
          const { isEnabled, voteStartDateTime, voteEndDateTime, matchDate, exposedDates = [], isHomeExposed = false } = voteStatusDoc.data();
          setVoteEnabled(isEnabled);
          setVoteStartDateTime(voteStartDateTime ? new Date(voteStartDateTime) : null);
          setVoteEndDateTime(voteEndDateTime ? new Date(voteEndDateTime) : null);
          setNewVoteStartDateTime(voteStartDateTime ? formatDateTimeDisplay(new Date(voteStartDateTime)) : '');
          setNewVoteEndDateTime(voteEndDateTime ? formatDateTimeDisplay(new Date(voteEndDateTime)) : '');
          setMatchDate(matchDate ? formatDateDisplay(new Date(matchDate)) : '');
          setNewMatchDate(matchDate ? formatDateDisplay(new Date(matchDate)) : '');
          setExposedDates(exposedDates);
          console.log('투표 상태 업데이트:', { isEnabled, voteStartDateTime, voteEndDateTime, matchDate, exposedDates, isHomeExposed });
        } else {
          const now = new Date();
          const defaultStart = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
          const defaultEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
          setDoc(voteStatusRef, {
            isEnabled: false,
            voteStartDateTime: defaultStart,
            voteEndDateTime: defaultEnd,
            matchDate: now.toISOString(),
            exposedDates: [],
            isHomeExposed: true // 기본적으로 라인업 노출 활성화
          }).then(() => {
            console.log('투표 상태 초기화:', { isEnabled: false, voteStartDateTime: defaultStart, voteEndDateTime: defaultEnd, matchDate: now.toISOString() });
            setVoteEnabled(false);
            setVoteStartDateTime(new Date(defaultStart));
            setVoteEndDateTime(new Date(defaultEnd));
            setNewVoteStartDateTime(formatDateTimeDisplay(new Date(defaultStart)));
            setNewVoteEndDateTime(formatDateTimeDisplay(new Date(defaultEnd)));
            setMatchDate(formatDateDisplay(now));
            setNewMatchDate(formatDateDisplay(now));
            setExposedDates([]);
          }).catch(err => {
            console.error('투표 상태 초기화 오류:', err.message);
            setError(`투표 상태 초기화 중 오류: ${err.message}`);
          });
        }
      }, (err) => {
        console.error('투표 상태 리스너 오류:', err.message);
        setError(`투표 상태를 불러오는 중 오류가 발생했습니다: ${err.message}`);
      });

      return () => {
        unsubscribeVote();
        unsubscribeStatus();
      };
    }
  }, [today, isAuthenticated]);

  // 지난 투표 기록 가져오기 (votes 컬렉션)
  const fetchVoteHistory = async () => {
    try {
      const historyRef = collection(db, 'votes');
      const historySnap = await getDocs(historyRef);
      const historyData = historySnap.docs.map(doc => ({
        id: doc.id,
        date: doc.id.replace('vote_', ''),
        data: doc.data()
      })).filter(item => item.date !== today);
      historyData.sort((a, b) => b.date.localeCompare(a.date));
      setVoteHistory(historyData);
      console.log('지난 투표 기록(votes) 가져오기 완료:', historyData);
    } catch (err) {
      console.error('지난 투표 기록(votes) 가져오기 오류:', err.message);
      setError(`지난 투표 기록(votes) 가져오기 중 오류: ${err.message}`);
    }
  };

  // 투표 상태 변경
  const handleVoteStatusChange = useCallback((newStatus) => {
    setPendingVoteState(newStatus);
    setIsReopening(newStatus && !voteEnabled);
    setShowModal(true);
    setMessage('');
    setError('');
    console.log('투표 상태 변경 요청:', newStatus);
  }, [voteEnabled]);

  // 종료 버튼 핸들러
  const handleTerminate = useCallback(async () => {
    if (!window.confirm('투표와 라인업 노출을 모두 종료하시겠습니까?')) return;

    setStatusUpdateLoading(true);
    setMessage('');
    setError('');
    try {
      const voteStatusRef = doc(db, 'voteStatus', today);
      const voteRef = doc(db, 'votes', `vote_${today}`);
      const historyRef = doc(db, 'voteHistory', today);
      const momVoteRef = doc(db, 'momVotes', today);

      // 현재 투표 데이터를 히스토리에 저장
      const voteDoc = await getDoc(voteRef);
      if (voteDoc.exists()) {
        await setDoc(historyRef, voteDoc.data());
        console.log('투표 히스토리 저장:', voteDoc.data());
      }

      // 투표와 라인업 비활성화
      const updateData = {
        isEnabled: false,
        isHomeExposed: false,
        voteStartDateTime: voteStartDateTime ? voteStartDateTime.toISOString() : new Date().toISOString(),
        voteEndDateTime: voteEndDateTime ? voteEndDateTime.toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        matchDate: matchDate ? new Date(matchDate).toISOString() : new Date().toISOString(),
        exposedDates: exposedDates
      };

      await setDoc(voteStatusRef, updateData, { merge: true });
      await setDoc(momVoteRef, { isActive: false }, { merge: true });

      // 노출 날짜의 voteStatus와 momVotes 업데이트
      for (const date of exposedDates) {
        const exposedVoteStatusRef = doc(db, 'voteStatus', date);
        const exposedMomVoteRef = doc(db, 'momVotes', date);
        await setDoc(exposedVoteStatusRef, { isEnabled: false, isHomeExposed: false }, { merge: true });
        await setDoc(exposedMomVoteRef, { isActive: false }, { merge: true });
        console.log(`노출 날짜 종료: ${date}, isEnabled: false, isHomeExposed: false`);
      }

      setVoteEnabled(false);
      setShowModal(false);
      setIsReopening(false);
      await fetchVoteHistory();
      setMessage('투표와 라인업 노출이 종료되었습니다.');
      console.log('투표와 라인업 종료 완료:', updateData);
    } catch (err) {
      console.error('종료 처리 오류:', err.message);
      setError(`종료 처리 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setStatusUpdateLoading(false);
    }
  }, [today, voteStartDateTime, voteEndDateTime, matchDate, exposedDates]);

  const handleStartDateTimeChange = useCallback((e) => {
    setNewVoteStartDateTime(e.target.value);
    console.log('투표 시작 시간 변경:', e.target.value);
  }, []);

  const handleEndDateTimeChange = useCallback((e) => {
    setNewVoteEndDateTime(e.target.value);
    console.log('투표 종료 시간 변경:', e.target.value);
  }, []);

  const handleMatchDateChange = useCallback((e) => {
    setNewMatchDate(e.target.value);
    console.log('경기 날짜 변경:', e.target.value);
  }, []);

  const handleExposedDateChange = useCallback((e) => {
    setNewExposedDate(e.target.value);
    console.log('노출 날짜 변경:', e.target.value);
  }, []);

  // 노출 날짜 추가
  const addExposedDate = useCallback(async () => {
    if (!newExposedDate) {
      setError('노출 날짜를 선택하세요.');
      console.warn('노출 날짜 미입력');
      return;
    }

    const selectedDate = new Date(newExposedDate);
    const formattedDate = formatDate(selectedDate);

    if (exposedDates.includes(formattedDate)) {
      setError('이미 추가된 날짜입니다.');
      console.warn('중복 노출 날짜:', formattedDate);
      return;
    }

    try {
      const voteStatusRef = doc(db, 'voteStatus', today);
      const newExposedDates = [...exposedDates, formattedDate];
      await updateDoc(voteStatusRef, { exposedDates: newExposedDates });
      setExposedDates(newExposedDates);
      setNewExposedDate('');
      setMessage(`노출 날짜 ${formattedDate} 추가 완료.`);
      console.log(`노출 날짜 추가: ${formattedDate}`);

      // 노출 날짜의 voteStatus 생성/업데이트
      const exposedVoteStatusRef = doc(db, 'voteStatus', formattedDate);
      await setDoc(exposedVoteStatusRef, {
        isEnabled: false,
        voteStartDateTime: newVoteStartDateTime ? new Date(newVoteStartDateTime).toISOString() : new Date().toISOString(),
        voteEndDateTime: newVoteEndDateTime ? new Date(newVoteEndDateTime).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        matchDate: newMatchDate ? new Date(newMatchDate).toISOString() : new Date().toISOString(),
        exposedDates: [],
        isHomeExposed: true // 노출 날짜는 기본적으로 라인업 노출 활성화
      });
      // momVotes 문서 생성/업데이트
      const exposedMomVoteRef = doc(db, 'momVotes', formattedDate);
      await setDoc(exposedMomVoteRef, {
        isActive: false
      }, { merge: true });
      console.log(`노출 날짜 voteStatus 및 momVotes 생성: ${formattedDate}`);
    } catch (err) {
      console.error('노출 날짜 추가 오류:', err.message);
      setError(`노출 날짜 추가 중 오류가 발생했습니다: ${err.message}`);
    }
  }, [newExposedDate, exposedDates, today, newVoteStartDateTime, newVoteEndDateTime, newMatchDate]);

  // 노출 날짜 제거
  const removeExposedDate = useCallback(async (date) => {
    try {
      const voteStatusRef = doc(db, 'voteStatus', today);
      const newExposedDates = exposedDates.filter(d => d !== date);
      await updateDoc(voteStatusRef, { exposedDates: newExposedDates });
      setExposedDates(newExposedDates);
      setMessage(`노출 날짜 ${date} 제거 완료.`);

      // 노출 날짜의 voteStatus 삭제
      const exposedVoteStatusRef = doc(db, 'voteStatus', date);
      await deleteDoc(exposedVoteStatusRef);
      // momVotes 문서 삭제
      const exposedMomVoteRef = doc(db, 'momVotes', date);
      await deleteDoc(exposedMomVoteRef);
      console.log(`노출 날짜 제거: ${date}`);
    } catch (err) {
      console.error('노출 날짜 제거 오류:', err.message);
      setError(`노출 날짜 제거 중 오류가 발생했습니다: ${err.message}`);
    }
  }, [exposedDates, today]);

  // 투표 상태 변경 확인
  const confirmVoteStatusChange = useCallback(async () => {
    setStatusUpdateLoading(true);
    setMessage('');
    setError('');
    try {
      const voteStatusRef = doc(db, 'voteStatus', today);
      const voteRef = doc(db, 'votes', `vote_${today}`);
      const historyRef = doc(db, 'voteHistory', today);
      const momVoteRef = doc(db, 'momVotes', today);

      if (!pendingVoteState) {
        const voteDoc = await getDoc(voteRef);
        if (voteDoc.exists()) {
          await setDoc(historyRef, voteDoc.data());
          console.log('투표 히스토리 저장:', voteDoc.data());
        }
        await setDoc(momVoteRef, { isActive: false }, { merge: true });
      } else if (isReopening) {
        await setDoc(voteRef, {
          date: today,
          playerVotes: {},
          voters: [],
          comments: {}
        });
        setVoteResults([]);
        setComments([]);
        setTotalVotes(0);
        setTopThree([]);
        setTopEight([]);
        await setDoc(momVoteRef, { isActive: true }, { merge: true });
        console.log('투표 데이터 초기화 및 momVotes 활성화');
      } else {
        await setDoc(momVoteRef, { isActive: true }, { merge: true });
        console.log('momVotes 활성화');
      }

      if (pendingVoteState && (!newVoteStartDateTime || !newVoteEndDateTime || !newMatchDate)) {
        setError('투표 시작 시간, 종료 시간, 경기 날짜를 모두 입력하세요.');
        console.warn('투표 상태 업데이트 실패: 필수 필드 미입력');
        setStatusUpdateLoading(false);
        return;
      }

      const startDateTime = newVoteStartDateTime ? new Date(newVoteStartDateTime) : new Date();
      const endDateTime = newVoteEndDateTime ? new Date(newVoteEndDateTime) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const matchDate = newMatchDate ? new Date(newMatchDate) : new Date();

      if (pendingVoteState && startDateTime >= endDateTime) {
        setError('마감 시간이 시작 시간보다 빠를 수 없습니다.');
        console.warn('투표 상태 업데이트 실패: 잘못된 투표 기간');
        setStatusUpdateLoading(false);
        return;
      }

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime()) || isNaN(matchDate.getTime())) {
        setError('유효하지 않은 날짜 또는 시간 형식입니다.');
        console.warn('투표 상태 업데이트 실패: 유효하지 않은 날짜/시간', { startDateTime, endDateTime, matchDate });
        setStatusUpdateLoading(false);
        return;
      }

      const updateData = {
        isEnabled: pendingVoteState,
        isHomeExposed: !pendingVoteState, // 투표 활성화 시 라인업 비활성화, 비활성화 시 라인업 활성화
        voteStartDateTime: startDateTime.toISOString(),
        voteEndDateTime: endDateTime.toISOString(),
        matchDate: matchDate.toISOString(),
        exposedDates: exposedDates
      };

      console.log('Updating voteStatus in AnnouncementsAdmin:', updateData);
      const voteStatusDoc = await getDoc(voteStatusRef);
      if (voteStatusDoc.exists()) {
        await setDoc(voteStatusRef, updateData, { merge: true });
      } else {
        await setDoc(voteStatusRef, updateData);
      }

      for (const date of exposedDates) {
        const exposedVoteStatusRef = doc(db, 'voteStatus', date);
        const exposedMomVoteRef = doc(db, 'momVotes', date);
        const updateExposedData = {
          isEnabled: pendingVoteState,
          isHomeExposed: !pendingVoteState // 노출 날짜에서도 투표와 반대 설정
        };
        if (pendingVoteState) {
          await setDoc(exposedMomVoteRef, { isActive: true }, { merge: true });
        } else {
          await setDoc(exposedMomVoteRef, { isActive: false }, { merge: true });
        }
        await setDoc(exposedVoteStatusRef, updateExposedData, { merge: true });
        console.log(`노출 날짜 voteStatus 업데이트: ${date}, isEnabled: ${pendingVoteState}, isHomeExposed: ${!pendingVoteState}`);
        console.log(`노출 날짜 momVotes 업데이트: ${date}, isActive: ${pendingVoteState ? true : false}`);
      }

      setVoteEnabled(pendingVoteState);
      setVoteStartDateTime(startDateTime);
      setVoteEndDateTime(endDateTime);
      setMatchDate(formatDateDisplay(matchDate));
      setShowModal(false);
      setIsReopening(false);
      await fetchVoteHistory();
      console.log('투표 상태 업데이트 완료:', updateData);
      setMessage(`투표가 ${pendingVoteState ? '활성화' : '비활성화'}되었습니다.`);
    } catch (err) {
      console.error('투표 상태 업데이트 오류:', err.message, err.code, err.stack);
      setError(`투표 상태 변경 중 오류가 발생했습니다: ${err.message}.`);
    } finally {
      setStatusUpdateLoading(false);
    }
  }, [pendingVoteState, isReopening, today, newVoteStartDateTime, newVoteEndDateTime, newMatchDate, exposedDates]);

  // 투표 히스토리 삭제
  const handleDeleteHistory = useCallback(async (docId) => {
    const date = docId.replace('vote_', '');
    if (!window.confirm(`${date}의 투표 기록을 삭제하시겠습니까?`)) return;

    try {
      const historyRef = doc(db, 'votes', docId);
      await deleteDoc(historyRef);
      setVoteHistory(prev => prev.filter(item => item.id !== docId));
      setMessage(`투표 기록 ${date} 삭제 완료.`);
      console.log(`투표 기록 삭제: ${docId}`);
    } catch (err) {
      console.error('투표 기록 삭제 오류:', err.message);
      setError(`투표 기록 삭제 중 오류가 발생했습니다: ${err.message}`);
    }
  }, []);

  // 투표 히스토리 보기
  const handleViewHistory = useCallback((historyItem) => {
    setSelectedHistoryData(historyItem);
    setShowViewModal(true);
    console.log('투표 히스토리 보기:', historyItem.date);
  }, []);

  const closeViewModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedHistoryData(null);
    console.log('투표 히스토리 모달 닫기');
  }, []);

  // 명단 복사
  const handleCopyNames = useCallback(async () => {
    try {
      const names = voteResults.map(player => player.name).join('\n');
      await navigator.clipboard.writeText(names);
      setCopySuccess(true);
      setMessage('명단이 클립보드에 복사되었습니다.');
      setTimeout(() => setCopySuccess(false), 3000);
      console.log('명단 복사 완료');
    } catch (err) {
      console.error('복사 오류:', err);
      setError('명단 복사에 실패했습니다.');
    }
  }, [voteResults]);

  // 모달 닫기
  const closeModal = useCallback(() => {
    setShowModal(false);
    setPendingVoteState(null);
    setIsReopening(false);
    setNewVoteStartDateTime(voteStartDateTime ? formatDateTimeDisplay(voteStartDateTime) : '');
    setNewVoteEndDateTime(voteEndDateTime ? formatDateTimeDisplay(voteEndDateTime) : '');
    setNewMatchDate(matchDate ? formatDateDisplay(matchDate) : '');
    setMessage('');
    setError('');
    console.log('투표 상태 변경 모달 닫기');
  }, [voteStartDateTime, voteEndDateTime, matchDate]);

  return (
    <S.Container>
      {!isAuthenticated ? (
        <form onSubmit={handlePasswordSubmit}>
          <S.Header>관리자 페이지 접근</S.Header>
          <S.PasswordModalInput
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handlePasswordKeyEvent}
            onKeyUp={handlePasswordKeyEvent}
            placeholder="비밀번호 입력"
          />
          {capsLockOn && <S.PasswordModalError>Caps Lock이 켜져 있습니다.</S.PasswordModalError>}
          {passwordError && <S.PasswordModalError>{passwordError}</S.PasswordModalError>}
          <S.ModalButton type="submit" primary>확인</S.ModalButton>
        </form>
      ) : (
        <>
          <S.VoteControlSection>
            <S.Header>투표 관리</S.Header>
            <S.SwitchContainer>
              <S.SwitchLabel>투표 상태: </S.SwitchLabel>
              <S.Switch>
                <input
                  type="checkbox"
                  checked={voteEnabled}
                  onChange={(e) => handleVoteStatusChange(e.target.checked)}
                  disabled={statusUpdateLoading}
                />
                <span />
              </S.Switch>
              <S.StatusText>{voteEnabled ? '활성화' : '비활성화'}</S.StatusText>
              <S.ModalButton onClick={handleTerminate} disabled={statusUpdateLoading}>
                종료
              </S.ModalButton>
            </S.SwitchContainer>

            <S.DateTimeContainer>
              <S.SwitchLabel>투표 기간: <span style={{ color: 'red' }}>*</span></S.SwitchLabel>
              <S.DateTimeWrapper>
                <S.DateTimeInput
                  type="datetime-local"
                  value={newVoteStartDateTime}
                  onChange={handleStartDateTimeChange}
                  disabled={statusUpdateLoading}
                  required
                />
                <S.DateTimeSeparator>~</S.DateTimeSeparator>
                <S.DateTimeInput
                  type="datetime-local"
                  value={newVoteEndDateTime}
                  onChange={handleEndDateTimeChange}
                  disabled={statusUpdateLoading}
                  required
                />
              </S.DateTimeWrapper>
              {(voteStartDateTime || voteEndDateTime) && (
                <S.StatusText>
                  설정된 기간: 
                  {voteStartDateTime ? ` ${formatDateTimeDisplay(voteStartDateTime)}` : ' 미설정'} 
                  ~ 
                  {voteEndDateTime ? ` ${formatDateTimeDisplay(voteEndDateTime)}` : ' 미설정'}
                </S.StatusText>
              )}
            </S.DateTimeContainer>

            <S.DateTimeContainer>
              <S.SwitchLabel>경기 날짜: <span style={{ color: 'red' }}>*</span></S.SwitchLabel>
              <S.DateTimeWrapper>
                <S.DateTimeInput
                  type="date"
                  value={newMatchDate}
                  onChange={handleMatchDateChange}
                  disabled={statusUpdateLoading}
                  required
                />
              </S.DateTimeWrapper>
              {matchDate && (
                <S.StatusText>
                  설정된 경기 날짜: {matchDate}
                </S.StatusText>
              )}
            </S.DateTimeContainer>

            <S.ExposedDatesContainer>
              <S.SwitchLabel>추가 노출 날짜:</S.SwitchLabel>
              <S.DateTimeWrapper>
                <S.DateTimeInput
                  type="date"
                  value={newExposedDate}
                  onChange={handleExposedDateChange}
                  disabled={statusUpdateLoading}
                />
                <S.ExposeDateButton onClick={addExposedDate} disabled={statusUpdateLoading}>
                  추가
                </S.ExposeDateButton>
              </S.DateTimeWrapper>
              {exposedDates.length > 0 && (
                <S.ExposedDatesList>
                  {exposedDates.map(date => (
                    <S.ExposedDateItem key={date}>
                      {date}
                      <S.RemoveExposeDateButton onClick={() => removeExposedDate(date)}>
                        삭제
                      </S.RemoveExposeDateButton>
                    </S.ExposedDateItem>
                  ))}
                </S.ExposedDatesList>
              )}
            </S.ExposedDatesContainer>
          </S.VoteControlSection>

          {loading ? (
            <S.Loading>로딩 중...</S.Loading>
          ) : (
            <>
              <S.Container>
                <S.Header>오늘의 투표 결과 ({today})</S.Header>
                <S.CopyButton onClick={handleCopyNames}>
                  명단 복사
                </S.CopyButton>
                {copySuccess && <S.Message>명단이 클립보드에 복사되었습니다!</S.Message>}
                {voteResults.length > 0 ? (
                  <>
                    <VoteTable voteResults={computedVoteData.results} />
                    <Summary totalVotes={totalVotes} topThree={topThree} topEight={topEight} />
                    <CommentsSection comments={comments} />
                  </>
                ) : (
                  <S.NoData>오늘의 투표 데이터가 없습니다.</S.NoData>
                )}
              </S.Container>

              <VoteHistory voteHistory={voteHistory} onDelete={handleDeleteHistory} onView={handleViewHistory} />
            </>
          )}

          {message && <S.Message>{message}</S.Message>}
          {error && <S.Message error>{error}</S.Message>}

          {showModal && (
            <S.ModalOverlay>
              <S.ModalContent>
                <S.ModalTitle>{pendingVoteState ? (isReopening ? '투표 재오픈' : '투표 활성화') : '투표 비활성화'}</S.ModalTitle>
                <S.ModalText>
                  {pendingVoteState
                    ? isReopening
                      ? '투표를 재오픈하면 기존 데이터가 초기화됩니다. 계속하시겠습니까?'
                      : '투표를 활성화하시겠습니까? (홈 화면에서 MOM 투표 버튼이 표시되고 라인업 보기 버튼은 비활성화됩니다)'
                    : '투표를 비활성화하시겠습니까? (홈 화면에서 라인업 보기 버튼이 표시됩니다)'}
                </S.ModalText>
                {pendingVoteState && (
                  <>
                    <S.DateTimeContainer>
                      <S.SwitchLabel>투표 시작 시간: <span style={{ color: 'red' }}>*</span></S.SwitchLabel>
                      <S.DateTimeInput
                        type="datetime-local"
                        value={newVoteStartDateTime}
                        onChange={handleStartDateTimeChange}
                        disabled={statusUpdateLoading}
                        required
                      />
                    </S.DateTimeContainer>
                    <S.DateTimeContainer>
                      <S.SwitchLabel>투표 종료 시간: <span style={{ color: 'red' }}>*</span></S.SwitchLabel>
                      <S.DateTimeInput
                        type="datetime-local"
                        value={newVoteEndDateTime}
                        onChange={handleEndDateTimeChange}
                        disabled={statusUpdateLoading}
                        required
                      />
                    </S.DateTimeContainer>
                    <S.DateTimeContainer>
                      <S.SwitchLabel>경기 날짜: <span style={{ color: 'red' }}>*</span></S.SwitchLabel>
                      <S.DateTimeInput
                        type="date"
                        value={newMatchDate}
                        onChange={handleMatchDateChange}
                        disabled={statusUpdateLoading}
                        required
                      />
                    </S.DateTimeContainer>
                  </>
                )}
                <S.ModalButtons>
                  <S.ModalButton onClick={confirmVoteStatusChange} disabled={statusUpdateLoading} primary>
                    {statusUpdateLoading ? '처리 중...' : '확인'}
                  </S.ModalButton>
                  <S.ModalButton onClick={closeModal} disabled={statusUpdateLoading}>
                    취소
                  </S.ModalButton>
                </S.ModalButtons>
              </S.ModalContent>
            </S.ModalOverlay>
          )}

          {showViewModal && selectedHistoryData && (
            <S.ModalOverlay onClick={closeViewModal}>
              <S.ModalContent onClick={(e) => e.stopPropagation()}>
                <S.ModalTitle>{selectedHistoryData.date} 투표 결과</S.ModalTitle>
                {(() => {
                  const { total, topThreeList, topEightList, comments } = computeHistoryVoteData(selectedHistoryData);
                  const voteResults = Object.entries(selectedHistoryData.data.playerVotes || {}).map(([id, data]) => ({
                      id,
                      name: data.name || 'Unknown',
                      team: data.team || 'Unknown',
                      position: data.position || 'Unknown',
                      rank1: data.votes?.rank1 || 0,
                      rank2: data.votes?.rank2 || 0,
                      rank3: data.votes?.rank3 || 0,
                      total: data.votes?.total || 0
                    }));
                  return (
                    <>
                      <VoteTable voteResults={voteResults} />
                      <Summary totalVotes={total} topThree={topThreeList} topEight={topEightList} />
                      <CommentsSection comments={comments} />
                      <S.ModalButtons>
                        <S.ModalButton onClick={closeViewModal}>닫기</S.ModalButton>
                      </S.ModalButtons>
                    </>
                  );
                })()}
              </S.ModalContent>
            </S.ModalOverlay>
          )}
        </>
      )}
    </S.Container>
  );
};

export default AnnouncementsAdmin;