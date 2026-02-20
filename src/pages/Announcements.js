import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { Search, Trophy, X, Crown, CheckCircle } from 'lucide-react';
import { db } from '../App';
import * as S from './AnnouncementsCss';

const POSITIONS = {
  GK: '골키퍼',
  CB: '수비수',
  CDM: '수비형 미드필더',
  CM: '중앙 미드필더',
  CAM: '공격형 미드필더',
  LW: '왼쪽 윙어',
  RW: '오른쪽 윙어',
  ST: '스트라이커',
  FW: '공격수'
};

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

const PlayerVoting = () => {
  const [lineups, setLineups] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        let currentUserId = localStorage.getItem('footballVoteUserId');
        if (!currentUserId) {
          currentUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('footballVoteUserId', currentUserId);
        }
        setUserId(currentUserId);

        await fetchVoteStatus();
        await fetchLineups();
        await checkIfVoted(currentUserId);
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
    if (voteStatusDoc.exists()) {
      setVoteEnabled(voteStatusDoc.data().isEnabled);
    }
  };

  const checkIfVoted = async (currentUserId) => {
    const voteRef = doc(db, 'votes', `vote_${today}`);
    const voteDoc = await getDoc(voteRef);
    if (voteDoc.exists()) {
      const voteData = voteDoc.data();
      if (voteData.voters && voteData.voters.includes(currentUserId)) {
        setSubmitted(true);
        if (voteData.comments && voteData.comments[currentUserId]) {
          setComment(voteData.comments[currentUserId]);
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
          return {
            id: doc.id, // Use document ID (nick) as unique ID
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
          players: teamPlayers
        });
        players.push(...teamPlayers);
      }
      setLineups(lineupsData.slice(0, 3));
      setAllPlayers(players);
    } catch (err) {
      setError('선수 목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const filteredPlayers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lower = searchTerm.toLowerCase();
    return allPlayers.filter(p =>
      p.nick.toLowerCase().includes(lower) &&
      !selectedPlayers.some(s => s.id === p.id)
    ).slice(0, 8);
  }, [searchTerm, allPlayers, selectedPlayers]);

  const handleSelectPlayer = (player) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);

    if (isSelected) {
      handleRemovePlayer(player.id);
      return;
    }

    if (selectedPlayers.length >= 3) {
      setAlertMessage('이미 3명의 선수를 모두 선택하셨습니다.');
      return;
    }

    setSelectedPlayers(prev => [...prev, player]);
    setSearchTerm('');
    setAlertMessage('');
  };

  const handleRemovePlayer = (playerId) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const handleSubmitVote = async () => {
    if (selectedPlayers.length !== 3) return;
    try {
      setSubmitting(true);
      const voteRef = doc(db, 'votes', `vote_${today}`);
      const voteDoc = await getDoc(voteRef);

      let voteData = voteDoc.exists() ? voteDoc.data() : {
        date: formatDisplayDate(new Date()),
        playerVotes: {},
        voters: [],
        comments: {}
      };

      selectedPlayers.forEach((player, index) => {
        const rank = index + 1;
        if (!voteData.playerVotes[player.id]) {
          voteData.playerVotes[player.id] = {
            name: player.nick,
            team: player.teamName,
            position: player.position,
            votes: { rank1: 0, rank2: 0, rank3: 0, total: 0 }
          };
        }
        voteData.playerVotes[player.id].votes[`rank${rank}`] += 1;
        voteData.playerVotes[player.id].votes.total += 1;
      });

      if (!voteData.voters.includes(userId)) voteData.voters.push(userId);
      if (comment.trim()) voteData.comments[userId] = comment.trim();

      await setDoc(voteRef, voteData);
      setSubmitted(true);
    } catch (err) {
      setAlertMessage('투표 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <S.Container><S.Loading>데이터를 불러오는 중...</S.Loading></S.Container>;

  if (error) return (
    <S.Container>
      <S.ErrorMessage>
        <X size={48} />
        <h3>오류 발생</h3>
        <p>{error}</p>
        <Link to="/vod"><S.CenteredTossButton>경기 기록 보기</S.CenteredTossButton></Link>
      </S.ErrorMessage>
    </S.Container>
  );

  if (!voteEnabled) return (
    <S.Container>
      <S.VoteEndedMessage>
        <CheckCircle size={48} />
        <h3>투표가 종료되었습니다</h3>
        <p>오늘의 MOM 투표가 마감되었습니다. 수고하셨습니다!</p>
        <Link to="/vod"><S.CenteredTossButton>경기 기록 보기</S.CenteredTossButton></Link>
      </S.VoteEndedMessage>
    </S.Container>
  );

  return (
    <S.Container>
      <S.GlobalFontStyle />
      <S.Header>
        <h2>오늘의 MOM 투표</h2>
        <p>오늘 경기에서 가장 인상적이었던 선수 3명을 선택해주세요.</p>
      </S.Header>

      {submitted ? (
        <S.SuccessMessage>
          <CheckCircle size={64} />
          <h3>투표 완료!</h3>
          <p>오늘의 소중한 한 표 감사합니다.</p>
          <Link to="/vod"><S.CenteredTossButton>경기 기록 보기</S.CenteredTossButton></Link>
        </S.SuccessMessage>
      ) : (
        <>
          <S.InteractionSection>
            <S.SlotsWrapper>
              {[0, 1, 2].map(index => {
                const player = selectedPlayers[index];
                return (
                  <S.Slot key={index} empty={!player}>
                    <div className="rank">{index + 1}위</div>
                    {player ? (
                      <>
                        <S.SlotImage
                          src={`/players/${player.nick}.png`}
                          onError={(e) => e.target.src = '/profile_default.svg'}
                        />
                        <S.SlotName>{player.nick}</S.SlotName>
                        <S.RemoveButton onClick={() => handleRemovePlayer(player.id)}>×</S.RemoveButton>
                      </>
                    ) : (
                      <div style={{ color: '#adb5bd', fontSize: '12px' }}>선택 안됨</div>
                    )}
                  </S.Slot>
                );
              })}
            </S.SlotsWrapper>

            <S.SearchContainer>
              <S.SearchInputWrapper>
                <Search size={20} className="search-icon" />
                <S.SearchInput
                  placeholder="선수 이름을 검색해보세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredPlayers.length > 0) {
                      handleSelectPlayer(filteredPlayers[0]);
                    }
                  }}
                  disabled={selectedPlayers.length >= 3}
                />
              </S.SearchInputWrapper>
              {filteredPlayers.length > 0 && (
                <S.SearchDropdown>
                  {filteredPlayers.map(p => (
                    <S.SearchItem key={p.id} onClick={() => handleSelectPlayer(p)}>
                      <span className="nick">{p.nick}</span>
                      <span className="info">{p.teamName} · {POSITIONS[p.position] || p.position}</span>
                    </S.SearchItem>
                  ))}
                </S.SearchDropdown>
              )}
            </S.SearchContainer>

            {alertMessage && <S.AlertMessage>{alertMessage}</S.AlertMessage>}

            {selectedPlayers.length === 3 && (
              <S.CommentSection>
                <S.CommentLabel>운영진에게 한마디 (선택)</S.CommentLabel>
                <S.CommentTextArea
                  placeholder="의견을 자유롭게 남겨주세요. 철저히 익명으로 전달됩니다."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </S.CommentSection>
            )}

            <S.SubmitButton
              disabled={selectedPlayers.length !== 3 || submitting}
              onClick={handleSubmitVote}
            >
              {submitting ? '제출 중...' : '투표 완료하기'}
            </S.SubmitButton>
          </S.InteractionSection>

          <S.TeamSectionTitle>오늘의 라인업</S.TeamSectionTitle>
          {lineups.map(team => (
            <S.TeamCard key={team.teamName}>
              <S.TeamHeader>
                <div className="team-info">
                  <div className="team-dot" style={{ backgroundColor: team.color }} />
                  <div className="team-name">{team.teamName}</div>
                </div>
                <div className="player-count">{team.players.length}명</div>
              </S.TeamHeader>
              <S.PlayerGrid>
                {team.players.map(player => {
                  const isSelected = selectedPlayers.some(s => s.id === player.id);
                  return (
                    <S.PlayerCard
                      key={player.id}
                      className={isSelected ? 'selected' : ''}
                      onClick={() => handleSelectPlayer(player)}
                    >
                      {player.nick === team.captain && <S.CaptainBadge>C</S.CaptainBadge>}
                      <S.PlayerImage
                        src={`/players/${player.nick}.png`}
                        onError={(e) => e.target.src = '/profile_default.svg'}
                      />
                      <S.PlayerName>{player.nick}</S.PlayerName>
                      <S.PlayerPosition>{POSITIONS[player.position] || player.position}</S.PlayerPosition>
                    </S.PlayerCard>
                  );
                })}
              </S.PlayerGrid>
            </S.TeamCard>
          ))}
        </>
      )}
    </S.Container>
  );
};

export default PlayerVoting;
