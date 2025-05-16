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
        Array(8 - topEight.length)
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
    <h3>투표 히스토리</h3>
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
                name: data.name,
                team: data.team,
                total: data.votes.total || 0
              }));
              results.sort((a, b) => b.total - a.total);
              const topThreeNames = results.slice(0, 3).map(p => p.name).join(', ');
              const totalVotes = results.reduce((sum, player) => sum + player.total, 0);

              return (
                <S.VoteRow key={item.date}>
                  <S.VoteCell>{item.date}</S.VoteCell>
                  <S.VoteCell>{totalVotes}표</S.VoteCell>
                  <S.VoteCell>{topThreeNames || '없음'}</S.VoteCell>
                  <S.VoteCell>
                    <S.ViewButton onClick={() => onView(item)}>
                      보기
                    </S.ViewButton>
                    <S.DeleteButton onClick={() => onDelete(item.date)}>
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
  const [copySuccess, setCopySuccess] = useState(false);
  const [voteEnabled, setVoteEnabled] = useState(true);
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

  const today = formatDate(new Date());
  

  // 비밀번호 확인
  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault();
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

    // 상위 3위 계산
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

    // 상위 3위를 제외한 상위 8위 계산
    rank = 0;
    let nonTopThreeCount = 0;
    const topThreeIds = new Set(topThreeList.map(p => p.id));
    for (let i = 0; i < sortedResults.length && nonTopThreeCount < 8; i++) {
      if (topThreeIds.has(sortedResults[i].id)) {
        continue; // 상위 3위 선수는 건너뛰기
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

    // 댓글 데이터 계산
    const comments = historyItem.data.comments
      ? Object.entries(historyItem.data.comments).map(([userId, comment]) => ({ userId, comment }))
      : [];

    console.log('히스토리 데이터:', { topThreeList, topEightList, comments });
    return { total, topThreeList, topEightList, comments };
  }, []);

  // 데이터 계산 메모이제이션
  const computedVoteData = useMemo(() => {
    const results = [...voteResults].sort((a, b) => b.total - a.total);
    let topThreeList = [];
    let topEightList = [];
    let rank = 0;

    // 상위 3위 계산
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

    // 상위 3위를 제외한 상위 8위 계산
    rank = 0;
    let nonTopThreeCount = 0;
    const topThreeIds = new Set(topThreeList.map(p => p.id));
    for (let i = 0; i < results.length && nonTopThreeCount < 8; i++) {
      if (topThreeIds.has(results[i].id)) {
        continue; // 상위 3위 선수는 건너뛰기
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

    console.log('현재 데이터:', { topThreeList, topEightList });
    return { results, topThreeList, topEightList, total };
  }, [voteResults]);

  useEffect(() => {
    setTotalVotes(computedVoteData.total);
    setTopThree(computedVoteData.topThreeList);
    setTopEight(computedVoteData.topEightList);
  }, [computedVoteData]);

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

      // 실시간 투표 데이터 리스너
      const voteRef = doc(db, 'votes', `vote_${today}`);
      const voteStatusRef = doc(db, 'voteStatus', today);

      const unsubscribeVote = onSnapshot(voteRef, (voteDoc) => {
        console.log('투표 데이터 스냅샷:', voteDoc.exists() ? voteDoc.data() : '데이터 없음');
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
        console.log('투표 상태 스냅샷:', voteStatusDoc.exists() ? voteStatusDoc.data() : '상태 없음');
        if (voteStatusDoc.exists()) {
          setVoteEnabled(voteStatusDoc.data().isEnabled);
        } else {
          setDoc(voteStatusRef, { isEnabled: true }).then(() => {
            console.log('투표 상태 초기화: isEnabled=true');
            setVoteEnabled(true);
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

  const fetchVoteHistory = async () => {
    try {
      const historyRef = collection(db, 'voteHistory');
      const historySnap = await getDocs(historyRef);
      const historyData = historySnap.docs.map(doc => ({
        date: doc.id,
        data: doc.data()
      }));
      historyData.sort((a, b) => b.date.localeCompare(a.date));
      setVoteHistory(historyData);
      console.log('투표 히스토리:', historyData);
    } catch (err) {
      console.error('투표 히스토리 가져오기 오류:', err.message);
    }
  };

  const handleVoteStatusChange = useCallback((newStatus) => {
    setPendingVoteState(newStatus);
    setIsReopening(newStatus && !voteEnabled);
    setShowModal(true);
  }, [voteEnabled]);

  const confirmVoteStatusChange = useCallback(async () => {
    setStatusUpdateLoading(true);
    try {
      const voteStatusRef = doc(db, 'voteStatus', today);
      const voteRef = doc(db, 'votes', `vote_${today}`);
      const historyRef = doc(db, 'voteHistory', today);

      if (!pendingVoteState) {
        const voteDoc = await getDoc(voteRef);
        if (voteDoc.exists()) {
          await setDoc(historyRef, voteDoc.data());
          console.log('투표 히스토리 저장:', voteDoc.data());
        }
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
        console.log('투표 데이터 초기화');
      }

      const voteStatusDoc = await getDoc(voteStatusRef);
      if (voteStatusDoc.exists()) {
        await updateDoc(voteStatusRef, { isEnabled: pendingVoteState });
      } else {
        await setDoc(voteStatusRef, { isEnabled: pendingVoteState });
      }

      setVoteEnabled(pendingVoteState);
      setShowModal(false);
      setIsReopening(false);
      await fetchVoteHistory();
      console.log('투표 상태 업데이트 완료:', pendingVoteState);
    } catch (err) {
      console.error('투표 상태 업데이트 오류:', err.message);
      alert(`투표 상태 변경 중 오류가 발생했습니다: ${err.message}. Firestore 권한을 확인하세요.`);
    } finally {
      setStatusUpdateLoading(false);
    }
  }, [pendingVoteState, isReopening, today]);

  const handleDeleteHistory = useCallback(async (date) => {
    if (!window.confirm(`${date}의 투표 기록을 삭제하시겠습니까?`)) return;

    try {
      const historyRef = doc(db, 'voteHistory', date);
      await deleteDoc(historyRef);
      setVoteHistory(prev => prev.filter(item => item.date !== date));
      console.log(`투표 히스토리 삭제: ${date}`);
    } catch (err) {
      console.error('투표 히스토리 삭제 오류:', err.message);
      alert(`투표 기록 삭제 중 오류가 발생했습니다: ${err.message}`);
    }
  }, []);

  const handleViewHistory = useCallback((historyItem) => {
    setSelectedHistoryData(historyItem);
    setShowViewModal(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedHistoryData(null);
  }, []);

  const handleCopyNames = useCallback(async () => {
    try {
      const names = voteResults.map(player => player.name).join('\n');
      await navigator.clipboard.writeText(names);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
      console.log('명단 복사 완료');
    } catch (err) {
      console.error('복사 오류:', err);
      alert('명단 복사에 실패했습니다.');
    }
  }, [voteResults]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setPendingVoteState(null);
    setIsReopening(false);
  }, []);

  if (!isAuthenticated) {
    return (
      <S.ModalOverlay>
        <S.ModalContent>
          <S.ModalTitle>관리자 인증</S.ModalTitle>
          <S.ModalText>비밀번호를 입력하세요.</S.ModalText>
          <form onSubmit={handlePasswordSubmit}>
           <S.PasswordModalInput
   type="password"
   value={password}
   onChange={(e) => setPassword(e.target.value)}
   onKeyDown={(e) => {
     setCapsLockOn(e.getModifierState('CapsLock'));
     if (e.key === 'Enter') {
       handlePasswordSubmit(e);
     }
   }}
   onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
   placeholder="비밀번호 입력"
   autoFocus
 />
            {passwordError && <S.PasswordModalError>{passwordError}</S.PasswordModalError>}
            <S.ModalButtons>
              <S.ModalButton type="submit" primary>
                확인
              </S.ModalButton>
            </S.ModalButtons>
          </form>
        </S.ModalContent>
      </S.ModalOverlay>
    );
  }

  if (loading) {
    return (
      <S.Container>
        <S.Header>
          <h2>오늘의 MOM 투표 결과</h2>
        </S.Header>
        <S.Loading>데이터를 불러오는 중입니다...</S.Loading>
      </S.Container>
    );
  }

  if (error) {
    return (
      <S.Container>
        <S.Header>
          <h2>오늘의 MOM 투표 결과</h2>
        </S.Header>
        <S.ErrorMessage>{error}</S.ErrorMessage>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <h2>오늘의 MOM 투표 결과</h2>
        <p>오늘 경기에서 가장 인상적인 활약을 펼친 선수들의 투표 결과입니다.</p>
      </S.Header>
      
      <S.VoteControlSection>
        <S.SwitchContainer>
          <S.SwitchLabel>투표 상태:</S.SwitchLabel>
          <S.Switch>
            <input 
              type="checkbox" 
              checked={voteEnabled} 
              onChange={() => handleVoteStatusChange(!voteEnabled)}
              disabled={statusUpdateLoading}
            />
            <span></span>
          </S.Switch>
          <S.StatusText active={voteEnabled}>
            {statusUpdateLoading 
              ? '업데이트 중...' 
              : voteEnabled 
                ? '투표 받는 중' 
                : '투표 종료됨'}
          </S.StatusText>
        </S.SwitchContainer>
      </S.VoteControlSection>

      {voteResults.length > 0 ? (
        <>
          <VoteTable voteResults={voteResults} />
          <Summary totalVotes={totalVotes} topThree={topThree} topEight={topEight} />
          <CommentsSection comments={comments} />
          <S.CopyButton onClick={handleCopyNames}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7v8a2 2 0 002 2h6a2 2 0 002-2V9m-4-5v4m0-4H6a2 2 0 00-2 2v10a2 2 0 002 2h8"
              />
            </svg>
            명단 복사
          </S.CopyButton>
          {copySuccess && <S.CopyMessage>명단이 복사되었습니다!</S.CopyMessage>}
        </>
      ) : (
        <>
          <S.NoData>오늘의 투표 데이터가 없습니다.</S.NoData>
          <CommentsSection comments={comments} />
        </>
      )}

      <VoteHistory voteHistory={voteHistory} onDelete={handleDeleteHistory} onView={handleViewHistory} />

      {showModal && (
        <S.ModalOverlay>
          <S.ModalContent>
            <S.ModalTitle>투표 상태 변경</S.ModalTitle>
            <S.ModalText>
              {isReopening
                ? '새로운 투표를 열겠습니까? 기존 투표 데이터가 초기화됩니다.'
                : pendingVoteState
                  ? '투표 받기를 시작하시겠습니까?'
                  : '투표 받기를 종료하시겠습니까?'}
            </S.ModalText>
            <S.ModalButtons>
              <S.ModalButton onClick={closeModal}>취소</S.ModalButton>
              <S.ModalButton primary onClick={confirmVoteStatusChange} disabled={statusUpdateLoading}>
                {statusUpdateLoading ? '처리 중...' : '확인'}
              </S.ModalButton>
            </S.ModalButtons>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {showViewModal && selectedHistoryData && (
        <S.ModalOverlay>
          <S.ModalContent>
            <S.ModalTitle>{selectedHistoryData.date} 투표 결과</S.ModalTitle>
            <Summary
              totalVotes={computeHistoryVoteData(selectedHistoryData).total}
              topThree={computeHistoryVoteData(selectedHistoryData).topThreeList}
              topEight={computeHistoryVoteData(selectedHistoryData).topEightList}
            />
            <CommentsSection comments={computeHistoryVoteData(selectedHistoryData).comments} />
            <S.ModalButtons>
              <S.ModalButton onClick={closeViewModal}>닫기</S.ModalButton>
            </S.ModalButtons>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default AnnouncementsAdmin;