import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../App';
import * as S from './AnnouncementsCss';

// 포지션 한글 매핑
const POSITIONS = {
  GK: '골키퍼',
  CB: '수비수',
  MF: '미드필더',
  FW: '공격수'
};

// 날짜 포맷팅 함수
const formatDate = (date) => {
  const kstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const formatDisplayDate = (date) => {
  const kstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 컴포넌트 분리
const SearchBar = React.memo(({ searchTerm, setSearchTerm, filteredPlayers, onSelectPlayer, isDisabled, alreadyVoted }) => (
  <S.SearchContainer>
    <S.SearchInput
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="선수 이름을 입력하세요"
      disabled={isDisabled}
    />
    {alreadyVoted && (
      <S.AlertMessage style={{ color: 'red' }}>
        이미 선택된 선수입니다
      </S.AlertMessage>
    )}
    {filteredPlayers.length > 0 && searchTerm.trim() !== '' && (
      <S.SearchDropdown>
        {filteredPlayers.map(player => (
          <S.SearchItem
            key={player.id}
            onClick={() => {
              console.log('SearchBar 클릭:', player.nick, 'ID:', player.id);
              onSelectPlayer(player);
            }}
          >
            <div className="font-medium">{player.nick}</div>
            <div className="text-gray-500 text-xs">{player.teamName} · {POSITIONS[player.position]}</div>
          </S.SearchItem>
        ))}
      </S.SearchDropdown>
    )}
  </S.SearchContainer>
));

const SelectedPlayers = React.memo(({ selectedPlayers, onRemovePlayer, comment, setComment }) => (
  <>
    <S.VoteTable>
      <table>
        <thead>
          <tr>
            <S.VoteHeader>순번</S.VoteHeader>
            <S.VoteHeader>선수 이름</S.VoteHeader>
            <S.VoteHeader>팀</S.VoteHeader>
            <S.VoteHeader>포지션</S.VoteHeader>
            <S.VoteHeader>작업</S.VoteHeader>
          </tr>
        </thead>
        <tbody>
          {[...selectedPlayers, ...Array(3 - selectedPlayers.length).fill(null)].map((player, index) => (
            <S.VoteRow key={index}>
              <S.VoteCell>{index + 1}</S.VoteCell>
              <S.VoteCell>{player ? player.nick : '-'}</S.VoteCell>
              <S.VoteCell>{player ? player.teamName : '-'}</S.VoteCell>
              <S.VoteCell>{player ? POSITIONS[player.position] : '-'}</S.VoteCell>
              <S.SelectedPlayerCell>
                {player ? (
                  <S.RemoveButton onClick={() => onRemovePlayer(player.id)}>×</S.RemoveButton>
                ) : '-'}
              </S.SelectedPlayerCell>
            </S.VoteRow>
          ))}
        </tbody>
      </table>
    </S.VoteTable>
    {selectedPlayers.length === 3 && (
      <S.CommentSection>
        <S.CommentLabel>운영진에게 하고 싶은 말을 입력해주세요</S.CommentLabel>
        <S.CommentTextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="운영진에게 하고 싶은 말을 입력하세요 철저히 익명입니다"
          rows={4}
        />
      </S.CommentSection>
    )}
  </>
));

const TeamList = React.memo(({ lineups, onSelectPlayer }) => (
  <div>
    <S.TeamListTitle>최고의 플레이어를 선택해주세요</S.TeamListTitle>
    {lineups.map(team => (
      <S.TeamCard key={team.teamName}>
        <S.TeamHeader>
          <div className="flex items-center">
            <S.TeamColorDot style={{ backgroundColor: team.color }} />
            <S.TeamName>{team.teamName}</S.TeamName>
          </div>
          <S.PlayerCount>{team.players.length}명</S.PlayerCount>
        </S.TeamHeader>
        <S.TableContainer>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <S.VoteHeader>선수 이름</S.VoteHeader>
                <S.VoteHeader>포지션</S.VoteHeader>
              </tr>
            </thead>
            <tbody>
              {team.players.map(player => (
                <S.TeamPlayerRow
                  key={player.id}
                  onClick={() => {
                    console.log('TeamList 클릭:', player.nick, 'ID:', player.id);
                    const confirmVote = window.confirm(`${player.nick}을(를) 투표하시겠습니까?`);
                    if (confirmVote) {
                      onSelectPlayer(player);
                    }
                  }}
                  title="클릭하면 투표가 됩니다"
                >
                  <S.PlayerNameCell>
                    {player.nick}
                    {player.nick === team.captain && <S.CaptainTag>(주장)</S.CaptainTag>}
                  </S.PlayerNameCell>
                  <S.PositionCell>{POSITIONS[player.position]}</S.PositionCell>
                </S.TeamPlayerRow>
              ))}
            </tbody>
          </table>
        </S.TableContainer>
      </S.TeamCard>
    ))}
  </div>
));

const PlayerVoting = () => {
  const [lineups, setLineups] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState('');
  const [voteEnabled, setVoteEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [comment, setComment] = useState('');
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  const today = formatDate(new Date());

  // Firestore 초기화 확인
  useEffect(() => {
    console.log('Firestore DB 초기화 확인:', db ? '성공' : '실패');
  }, []);

  // alreadyVoted 상태 관리
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setAlreadyVoted(false);
      return;
    }
    const isVoted = selectedPlayers.some(p => p.nick.toLowerCase() === searchTerm.toLowerCase());
    setAlreadyVoted(isVoted);
    console.log('alreadyVoted 업데이트:', isVoted, '검색어:', searchTerm);
  }, [searchTerm, selectedPlayers]);

  // 메모이제이션
  const computedFilteredPlayers = useMemo(() => {
    if (searchTerm.trim() === '') {
      return [];
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allPlayers.filter(player => {
      const isMatch = player.nick.toLowerCase().includes(lowerSearchTerm);
      const isSelected = selectedPlayers.some(selected => selected.id === player.id);
      console.log(`필터링: ${player.nick}, 매칭: ${isMatch}, 선택됨: ${isSelected}, ID: ${player.id}`);
      return isMatch && !isSelected;
    });
    console.log('filteredPlayers 계산:', filtered.map(p => ({ nick: p.nick, id: p.id })));
    return filtered;
  }, [searchTerm, allPlayers, selectedPlayers]);

  useEffect(() => {
    setFilteredPlayers(computedFilteredPlayers);
    console.log('filteredPlayers 업데이트:', computedFilteredPlayers.map(p => ({ nick: p.nick, id: p.id })));
  }, [computedFilteredPlayers]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const storedUserId = localStorage.getItem('footballVoteUserId');
        let currentUserId = storedUserId;
        if (!storedUserId) {
          currentUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('footballVoteUserId', currentUserId);
        }
        setUserId(currentUserId);
        console.log('현재 userId:', currentUserId);
        await Promise.all([fetchVoteStatus(), fetchLineups(), checkIfVoted(currentUserId)]);
      } catch (err) {
        console.error('초기화 오류:', err.message);
        setError('페이지를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [today]);

  const fetchVoteStatus = async () => {
    const voteStatusRef = doc(db, 'voteStatus', today);
    const voteStatusDoc = await getDoc(voteStatusRef);
    console.log('투표 상태 조회:', voteStatusDoc.exists() ? voteStatusDoc.data() : '없음');
    if (voteStatusDoc.exists()) {
      setVoteEnabled(voteStatusDoc.data().isEnabled);
    } else {
      setVoteEnabled(true);
    }
  };

  const checkIfVoted = async (currentUserId) => {
    if (!currentUserId) {
      console.warn('userId가 설정되지 않음');
      return;
    }
    const voteRef = doc(db, 'votes', `vote_${today}`);
    const voteDoc = await getDoc(voteRef);
    console.log('투표 확인:', voteDoc.exists() ? voteDoc.data() : '없음');
    if (voteDoc.exists()) {
      const voteData = voteDoc.data();
      if (voteData.voters && voteData.voters.includes(currentUserId)) {
        setSubmitted(true);
        if (voteData.comments && voteData.comments[currentUserId]) {
          setComment(voteData.comments[currentUserId]);
          console.log('기존 댓글 로드:', voteData.comments[currentUserId]);
        }
      }
    }
  };

  const fetchLineups = async () => {
    try {
      const q = query(collection(db, 'live'), orderBy('date', 'desc'));
      const teamsSnap = await getDocs(q);
      const lineupsData = [];
      const players = [];
      
      for (const teamDoc of teamsSnap.docs) {
        const playersSnap = await getDocs(collection(db, 'live', teamDoc.id, 'players'));
        const teamPlayers = playersSnap.docs.map(doc => {
          const playerData = doc.data();
          console.log(`선수 데이터 로드: 팀=${teamDoc.id}, 닉=${playerData.nick}, ID=${playerData.id}`);
          return {
            id: playerData.id, // Firestore 문서의 id 필드 사용
            nick: playerData.nick,
            position: playerData.position,
            teamName: teamDoc.id,
            teamColor: teamDoc.data().color || '#000000'
          };
        });
        
        lineupsData.push({
          teamName: teamDoc.id,
          captain: teamDoc.data().captain || '',
          color: teamDoc.data().color || '#000000',
          date: teamDoc.data().date || '',
          players: teamPlayers
        });
        
        players.push(...teamPlayers);
      }
      
      setLineups(lineupsData.slice(0, 3));
      setAllPlayers(players);
      console.log('라인업 데이터:', lineupsData.map(lineup => ({
        teamName: lineup.teamName,
        players: lineup.players.map(p => ({ nick: p.nick, id: p.id }))
      })));
    } catch (err) {
      console.error('라인업 가져오기 오류:', err.message);
      setError('선수 목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const showAlert = useCallback((message) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 3000);
  }, []);

  const handleSelectPlayer = useCallback((player) => {
    console.log('선수 선택 시도:', player.nick, 'ID:', player.id, '현재 선택된 선수:', selectedPlayers.map(p => ({ nick: p.nick, id: p.id })));
    if (selectedPlayers.length >= 3) {
      showAlert('3명 모두 선택되었습니다!');
      console.log('선수 선택 실패: 최대 3명 제한');
      return;
    }
    if (selectedPlayers.some(p => p.id === player.id)) {
      showAlert('이미 선택된 선수입니다.');
      console.log('선수 선택 실패: 이미 선택된 선수', player.id);
      return;
    }
    setSelectedPlayers(prev => {
      const newSelected = [...prev, player];
      console.log('새로운 selectedPlayers:', newSelected.map(p => ({ nick: p.nick, id: p.id })));
      return newSelected;
    });
    setSearchTerm('');
    setFilteredPlayers([]);
  }, [selectedPlayers, showAlert]);

  const handleRemovePlayer = useCallback((playerId) => {
    console.log('선수 제거 시도:', playerId);
    setSelectedPlayers(prev => {
      const newSelected = prev.filter(player => player.id !== playerId);
      console.log('제거 후 selectedPlayers:', newSelected.map(p => ({ nick: p.nick, id: p.id })));
      return newSelected;
    });
    setAlreadyVoted(false);
  }, []);

  const handleSubmitVote = useCallback(async () => {
    console.log('투표 제출 시도:', selectedPlayers.map(p => ({ nick: p.nick, id: p.id })));
    if (selectedPlayers.length !== 3) {
      showAlert('최고의 선수 3명을 모두 선택해주세요!');
      console.log('투표 제출 실패: 선택된 선수 수 부족', selectedPlayers.length);
      return;
    }
    if (!userId) {
      showAlert('사용자 ID가 설정되지 않았습니다. 페이지를 새로고침해주세요.');
      console.error('userId 누락');
      return;
    }

    try {
      setSubmitting(true);
      const voteRef = doc(db, 'votes', `vote_${today}`);
      const voteDoc = await getDoc(voteRef);
      
      let voteData = {};
      
      if (voteDoc.exists()) {
        voteData = voteDoc.data();
        console.log('기존 투표 데이터:', voteData);
      } else {
        voteData = {
          date: formatDisplayDate(new Date()),
          playerVotes: {},
          voters: [],
          comments: {}
        };
        console.log('새 투표 데이터 초기화:', voteData);
      }
      
      selectedPlayers.forEach((player, index) => {
        const rank = index + 1;
        if (!voteData.playerVotes[player.id]) {
          voteData.playerVotes[player.id] = {
            name: player.nick,
            team: player.teamName,
            position: player.position,
            votes: {
              rank1: 0,
              rank2: 0,
              rank3: 0,
              total: 0
            }
          };
        }
        
        voteData.playerVotes[player.id].votes[`rank${rank}`] += 1;
        voteData.playerVotes[player.id].votes.total += 1;
      });
      
      if (!voteData.voters.includes(userId)) {
        voteData.voters.push(userId);
      }
      
      if (comment.trim()) {
        if (!voteData.comments) {
          voteData.comments = {};
        }
        voteData.comments[userId] = comment.trim();
        console.log('저장할 댓글:', { [userId]: comment.trim() });
      }
      
      console.log('투표 데이터 저장 시도:', JSON.stringify(voteData, null, 2));
      await setDoc(voteRef, voteData);
      console.log('투표 데이터 저장 성공: vote_', today, '선수:', selectedPlayers.map(p => ({ nick: p.nick, id: p.id })));
      setSubmitted(true);
      showAlert('투표가 성공적으로 제출되었습니다!');
    } catch (err) {
      console.error('투표 제출 중 오류:', err.message);
      setError(`투표 제출 중 오류가 발생했습니다: ${err.message}`);
      showAlert(`투표 제출에 실패했습니다: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [selectedPlayers, userId, today, comment, showAlert]);

  if (loading) {
    return (
      <S.Container>
        <S.Header>
          <h2>오늘의 MOM 투표</h2>
        </S.Header>
        <S.Loading>
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          데이터를 불러오는 중입니다...
        </S.Loading>
      </S.Container>
    );
  }

  if (error) {
    return (
      <S.Container>
        <S.Header>
          <h2>오늘의 MOM 투표</h2>
        </S.Header>
        <S.ErrorMessage>
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </S.ErrorMessage>
        <Link to="/vod">
          <S.CenteredTossButton>경기 기록 보기</S.CenteredTossButton>
        </Link>
      </S.Container>
    );
  }

  if (!voteEnabled) {
    return (
      <S.Container>
        <S.Header>
          <h2>오늘의 MOM 투표</h2>
        </S.Header>
        <S.VoteEndedMessage>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <h3 className="font-bold text-lg mb-2">투표가 종료되었습니다</h3>
          <p>아쉽겠지만 오늘의 MOM 투표가 마감되었습니다. 다른페이지에서 본인에 스탯을 확인 해 보세요 </p>
        </S.VoteEndedMessage>
        <Link to="/vod">
          <S.CenteredTossButton>경기 기록 보기</S.CenteredTossButton>
        </Link>
      </S.Container>
    );
  }

  if (lineups.length === 0) {
    return (
      <S.Container>
        <S.Header>
          <h2>오늘의 MOM 투표</h2>
        </S.Header>
        <S.NoData>오늘의 라인업 데이터가 없습니다.</S.NoData>
        <Link to="/vod">
          <S.CenteredTossButton>경기 기록 보기</S.CenteredTossButton>
        </Link>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <h2>오늘의 MOM 투표</h2>
        <p>경기 후 가장 인상적이었던 선수 TOP 3를 선택해주세요</p>
      </S.Header>
      {submitted ? (
        <S.SuccessMessage>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h3 className="font-bold text-lg mb-2">투표 완료되었습니다!</h3>
          <p>다른 페이지도 둘러보세요.</p>
          <Link to="/vod">
            <S.CenteredTossButton>경기 기록 보기</S.CenteredTossButton>
          </Link>
        </S.SuccessMessage>
      ) : (
        <>
          <SelectedPlayers
            selectedPlayers={selectedPlayers}
            onRemovePlayer={handleRemovePlayer}
            comment={comment}
            setComment={setComment}
          />
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredPlayers={filteredPlayers}
            onSelectPlayer={handleSelectPlayer}
            isDisabled={selectedPlayers.length >= 3}
            alreadyVoted={alreadyVoted}
          />
          <S.SubmitButton
            onClick={handleSubmitVote}
            disabled={selectedPlayers.length !== 3 || submitting}
            primary="true"
          >
            {submitting ? '제출 중...' : '투표하기'}
          </S.SubmitButton>
          <Link to="/vod">
            <S.CenteredTossButton>경기 기록 보기</S.CenteredTossButton>
          </Link>
          <TeamList
            lineups={lineups}
            onSelectPlayer={handleSelectPlayer}
          />
        </>
      )}
      {alertMessage && <S.AlertMessage>{alertMessage}</S.AlertMessage>}
    </S.Container>
  );
};

export default PlayerVoting;