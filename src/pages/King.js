// src/pages/King.js - 완전 최종본 (모든 색상 #3182f6 블루 테마로 통일)
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp,
  doc, updateDoc, getDoc, arrayUnion, arrayRemove, increment, getDocs
} from 'firebase/firestore';
import { db } from '../App';
import styled from 'styled-components';
import { 
  Heart, Trophy, Search, MessageCircle, Send, Clock, 
  Target, TrendingUp, Shield, Star, Crown 
} from 'lucide-react';

const POSTS_PER_PAGE = 6;
const randomNicknames = [
  '숲리거1', '숲리거2', '호날두킴', '메좋알', '이강인짱', '손흥민신',
  '김민재탱크', '박지성전설', '차붐후예', '골때리는녀석', '패스마스터',
  '드리블천재', '프리킥장인', '골키퍼괴물', '수비의신', '미드필더왕',
  '윙어바람', '스트라이커킬러', '캡틴숲', '숲FC레전드', '오프사이드트랩',
  '태클의달인', '헤딩마왕', '슛돌이', '크로스마스터', '숲의전설'
];

// 메인 블루 색상 정의
const MAIN_BLUE = '#3182f6';
const LIGHT_BLUE = '#5e9aff';
const DARK_BLUE = '#2563eb';
const BG_LIGHT = '#f0f5ff';
const BG_SOFT = '#e0ecff';

// ===================== 랜딩 페이지 (블루 테마) =====================
const LandingContainer = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, ${BG_LIGHT} 0%, ${BG_SOFT} 50%, #e6f0ff 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const LandingPage = () => {
  return (
    <LandingContainer>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        style={{ textAlign: 'center' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1.15, rotate: 0 }}
          transition={{ duration: 1.2, type: "spring", stiffness: 80 }}
        >
          <Trophy size={140} color="#4f46e5" strokeWidth={2.8} />
        </motion.div>

        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          style={{ fontSize: '54px', fontWeight: 900, color: MAIN_BLUE, margin: '30px 0 8px', letterSpacing: '3px' }}
        >
          2026 SOOP FC
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.6, duration: 0.9 }}
          style={{ height: 8, width: 300, background: `linear-gradient(90deg, ${MAIN_BLUE}, ${LIGHT_BLUE})`, borderRadius: 4, margin: '0 auto' }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          style={{ fontSize: '32px', fontWeight: 700, color: '#333', margin: '24px 0' }}
        >
          2026년 회장 후보 추천
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}
        >
          <Crown size={42} color="#4f46e5" />
          <span style={{ fontSize: '23px', color: MAIN_BLUE, fontWeight: 800 }}>공식 투표 이벤트</span>
          <Crown size={42} color="#4f46e5" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
          style={{ marginTop: '70px', fontSize: '19px', color: '#666', fontWeight: 500 }}
        >
          잠시 후 자동으로 시작됩니다...
        </motion.p>
      </motion.div>
    </LandingContainer>
  );
};

// ===================== 메인 컴포넌트 =====================
const King = () => {
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLanding(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [candidateName, setCandidateName] = useState('');
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedPlayer, setSearchedPlayer] = useState(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [endDateTime, setEndDateTime] = useState(null);
  const [isHomeExposed, setIsHomeExposed] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isVotingEnded, setIsVotingEnded] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [playerStats, setPlayerStats] = useState({});

  // ===== 모든 useEffect (완전 동일) =====
  useEffect(() => {
    const fetchPlayerStats = async () => {
      const snapshot = await getDocs(collection(db, 'players'));
      const players = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const sortedGoals = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0));
      const sortedAssists = [...players].sort((a, b) => (b.assists || 0) - (a.assists || 0));
      const sortedCleanSheets = [...players].sort((a, b) => (b.cleanSheets || 0) - (a.cleanSheets || 0));

      const stats = {};
      players.forEach(p => {
        const top3 = sortedGoals.slice(0, 3).some(x => x.id === p.id) ||
                     sortedAssists.slice(0, 3).some(x => x.id === p.id) ||
                     sortedCleanSheets.slice(0, 3).some(x => x.id === p.id);
        const top8 = sortedGoals.slice(0, 8).some(x => x.id === p.id) ||
                     sortedAssists.slice(0, 8).some(x => x.id === p.id) ||
                     sortedCleanSheets.slice(0, 8).some(x => x.id === p.id);

        stats[p.id] = {
          goals: p.goals || 0,
          assists: p.assists || 0,
          cleanSheets: p.cleanSheets || 0,
          matches: p.matches || 0,
          isTop3: top3,
          isTop8: top8 && !top3
        };
      });
      setPlayerStats(stats);
    };
    fetchPlayerStats();
  }, []);

  useEffect(() => {
    const statusRef = doc(db, 'kingVoteStatus', '2026');
    const unsubscribe = onSnapshot(statusRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsHomeExposed(data.isHomeExposed || false);
        setEndDateTime(data.exposeEndDateTime ? data.exposeEndDateTime.toDate() : null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!endDateTime || !isHomeExposed) {
      setTimeLeft('투표 기간이 아닙니다');
      setIsVotingEnded(true);
      return;
    }
    const updateCountdown = () => {
      const now = new Date();
      const diff = endDateTime - now;
      if (diff <= 0) {
        setTimeLeft('투표가 마감되었습니다');
        setIsVotingEnded(true);
        return;
      }
      const days = Math.floor(diff / (1000*60*60*24));
      const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
      const minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
      const seconds = Math.floor((diff % (1000*60)) / 1000);
      setTimeLeft(`${days}일 ${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')} 남음`);
      setIsVotingEnded(false);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [endDateTime, isHomeExposed]);

  useEffect(() => {
    const q = query(collection(db, 'kingRecommendations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        likedBy: doc.data().likedBy || [],
        comments: doc.data().comments || []
      }));
      setPosts(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredAndSortedPosts = useMemo(() => {
    let result = posts;
    if (listSearchTerm.trim()) {
      result = result.filter(post => post.candidate.toLowerCase().includes(listSearchTerm.toLowerCase()));
    }
    const sorted = [...result];
    if (sortBy === 'likes') sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    else if (sortBy === 'comments') sorted.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
    else sorted.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return sorted;
  }, [posts, listSearchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredAndSortedPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  useEffect(() => setCurrentPage(1), [listSearchTerm, sortBy]);

  const generateRandomNickname = () => randomNicknames[Math.floor(Math.random() * randomNicknames.length)];

  const searchPlayerStats = async () => {
    if (!searchTerm.trim()) return;
    setLoadingPlayer(true);
    try {
      const playerSnap = await getDoc(doc(db, 'players', searchTerm.trim()));
      if (playerSnap.exists()) {
        setSearchedPlayer(playerSnap.data());
        setCandidateName(searchTerm.trim());
      } else {
        alert('선수를 찾을 수 없습니다!');
      }
    } catch (err) {
      alert('검색 오류');
    } finally {
      setLoadingPlayer(false);
    }
  };

  const handleSubmit = async () => {
    if (!isHomeExposed || isVotingEnded) return alert('투표 기간이 아닙니다!');
    if (!candidateName.trim() || !reason.trim()) return alert('모두 입력해주세요!');
    const trimmedName = candidateName.trim();
    if (posts.some(p => p.candidate.toLowerCase() === trimmedName.toLowerCase())) {
      return alert(`"${trimmedName}"님은 이미 추천된 후보입니다!`);
    }
    await addDoc(collection(db, 'kingRecommendations'), {
      candidate: trimmedName,
      reason: reason.trim(),
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: serverTimestamp()
    });
    setCandidateName(''); setReason(''); setShowForm(false); setSearchedPlayer(null); setSearchTerm('');
    alert('추천 완료!');
  };

  const handleLike = async (postId, currentLikedBy) => {
    if (!isHomeExposed || isVotingEnded) return;
    const userId = localStorage.getItem('kingVoteUser') || 'guest_' + Date.now();
    localStorage.setItem('kingVoteUser', userId);
    const hasLiked = currentLikedBy.includes(userId);
    await updateDoc(doc(db, 'kingRecommendations', postId), {
      likes: increment(hasLiked ? -1 : 1),
      likedBy: hasLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
  };

  const handleAddComment = async (postId) => {
    if (!isHomeExposed || isVotingEnded) return;
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    const nickname = generateRandomNickname();
    await updateDoc(doc(db, 'kingRecommendations', postId), {
      comments: arrayUnion({ text, author: nickname, createdAt: new Date().toISOString() })
    });
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <>
      <AnimatePresence>
        {showLanding && <LandingPage />}
      </AnimatePresence>

      {!showLanding && (
        <Container>
          {!isHomeExposed ? (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
              <Header><Trophy size={36} color={MAIN_BLUE} /><Title>2026 SOOP FC 회장 후보 추천</Title></Header>
              <Empty style={{ fontSize: '24px' }}>아직 투표 기간이 아닙니다</Empty>
            </div>
          ) : (
            <>
              <CountdownBanner ended={isVotingEnded}>
                <Clock size={28} />
                <CountdownText ended={isVotingEnded}>
                  {isVotingEnded ? '투표가 마감되었습니다' : timeLeft}
                </CountdownText>
              </CountdownBanner>

              <Header><Trophy size={36} color={MAIN_BLUE} /><Title>2026 SOOP FC 회장 후보 추천</Title></Header>

              <AddButton onClick={() => !isVotingEnded && setShowForm(!showForm)}>
                {isVotingEnded ? '투표 마감됨' : (showForm ? '취소하기' : '+ 회장 후보 추천하기')}
              </AddButton>

              {showForm && !isVotingEnded && (
                <FormCard>
                  <UnifiedSearchBox>
                    <SearchIconLeft><Search size={22} /></SearchIconLeft>
                    <UnifiedInput placeholder="능력치 확인" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} onKeyPress={e=>e.key==='Enter'&&searchPlayerStats()} />
                    <SearchBtn onClick={searchPlayerStats}><Search size={22} /></SearchBtn>
                  </UnifiedSearchBox>

                  {loadingPlayer && <LoadingText>검색 중...</LoadingText>}
                  {searchedPlayer && (
                    <PlayerStatsCard>
                      <h4>{searchedPlayer.name || candidateName} 능력치</h4>
                      <StatsPreview style={{margin:0}}>
                        <Stat><Star size={18} /> {searchedPlayer.matches || 0}경기</Stat>
                        <Stat><Target size={18} /> {searchedPlayer.goals || 0}골</Stat>
                        <Stat><TrendingUp size={18} /> {searchedPlayer.assists || 0}어시</Stat>
                        <Stat><Shield size={18} /> {searchedPlayer.cleanSheets || 0}클린</Stat>
                      </StatsPreview>
                    </PlayerStatsCard>
                  )}

                  <UnifiedInput value={candidateName} onChange={e=>setCandidateName(e.target.value)} placeholder="후보 이름" />
                  <UnifiedTextarea value={reason} onChange={e=>setReason(e.target.value)} rows={7} placeholder="추천 이유 (필수)" />
                  <SubmitButton onClick={handleSubmit}>추천 등록하기</SubmitButton>
                </FormCard>
              )}

              <FilterSection>
                <UnifiedSearchBox>
                  <SearchIconLeft><Search size={24} /></SearchIconLeft>
                  <UnifiedInput placeholder="후보자 이름 검색" value={listSearchTerm} onChange={e=>setListSearchTerm(e.target.value)} />
                </UnifiedSearchBox>
                <SortButtons>
                  <SortButton active={sortBy==='latest'} onClick={()=>setSortBy('latest')}>최신순</SortButton>
                  <SortButton active={sortBy==='likes'} onClick={()=>setSortBy('likes')}>좋아요 순</SortButton>
                  <SortButton active={sortBy==='comments'} onClick={()=>setSortBy('comments')}>댓글 많은 순</SortButton>
                </SortButtons>
              </FilterSection>

              <PostsList>
                {paginatedPosts.length === 0 ? (
                  <Empty>{listSearchTerm ? `"${listSearchTerm}" 검색 결과가 없습니다` : '아직 추천이 없어요!'}</Empty>
                ) : (
                  paginatedPosts.map(post => {
                    const userId = localStorage.getItem('kingVoteUser') || 'guest_' + Date.now();
                    localStorage.setItem('kingVoteUser', userId);
                    const isLiked = post.likedBy?.includes(userId);
                    const stats = playerStats[post.candidate] || { goals:0, assists:0, cleanSheets:0, matches:0, isTop3:false, isTop8:false };

                    return (
                      <PostCard key={post.id}>
                        <CandidateName>
                          후보: {post.candidate}
                          {stats.isTop3 && <PowerBadge top3>파워랭킹 TOP3</PowerBadge>}
                          {stats.isTop8 && <PowerBadge top8>파워랭킹 TOP8</PowerBadge>}
                        </CandidateName>

                        <StatsPreview>
                          <Stat><Star size={18} /> {stats.matches}경기</Stat>
                          <Stat><Target size={18} /> {stats.goals}골</Stat>
                          <Stat><TrendingUp size={18} /> {stats.assists}어시</Stat>
                          <Stat><Shield size={18} /> {stats.cleanSheets}클린</Stat>
                        </StatsPreview>

                        <Reason>{post.reason}</Reason>

                        <Actions>
                          <LikeButton onClick={()=>handleLike(post.id, post.likedBy||[])}>
                            <Heart size={24} fill={isLiked?MAIN_BLUE:'none'} stroke={MAIN_BLUE} />
                            <span>{post.likes||0}</span>
                          </LikeButton>
                          <CommentButton onClick={()=>setShowComments(prev=>({...prev,[post.id]:!prev[post.id]}))}>
                            <MessageCircle size={24} />
                            <span>{post.comments?.length||0}</span>
                          </CommentButton>
                          <Time>{post.createdAt?.toDate()?.toLocaleDateString('ko-KR')}</Time>
                        </Actions>

                        {showComments[post.id] && (
                          <CommentsSection>
                            {post.comments?.map((c,i)=>(
                              <Comment key={i}><strong style={{color:MAIN_BLUE}}>{c.author}</strong> {c.text}</Comment>
                            ))}
                            {!isVotingEnded && (
                              <CommentInputBox>
                                <CommentInput placeholder="응원의 한마디" value={commentInputs[post.id]||''} onChange={e=>setCommentInputs(prev=>({...prev,[post.id]:e.target.value}))} onKeyPress={e=>e.key==='Enter'&&handleAddComment(post.id)} />
                                <SendButton onClick={()=>handleAddComment(post.id)}><Send size={18}/></SendButton>
                              </CommentInputBox>
                            )}
                          </CommentsSection>
                        )}
                      </PostCard>
                    );
                  })
                )}
              </PostsList>

              {totalPages > 1 && (
                <Pagination>
                  {Array.from({length:totalPages},(_,i)=>(
                    <PageButton key={i+1} active={currentPage===i+1} onClick={()=>setCurrentPage(i+1)}>{i+1}</PageButton>
                  ))}
                </Pagination>
              )}
            </>
          )}
        </Container>
      )}
    </>
  );
};

// ===================== 모든 스타일 (색상만 블루로 변경) =====================
const UnifiedSearchBox = styled.div`position:relative;width:100%;`;
const SearchIconLeft = styled.div`position:absolute;left:18px;top:50%;transform:translateY(-50%);color:${MAIN_BLUE};pointer-events:none;z-index:10;`;
const SearchBtn = styled.button`position:absolute;right:8px;top:50%;transform:translateY(-50%);background:${MAIN_BLUE};color:white;border:none;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;`;
const UnifiedInput = styled.input`width:100%;padding:18px 18px 18px 56px;border:3px solid ${MAIN_BLUE};border-radius:20px;background:${BG_LIGHT};font-size:18px;font-weight:600;color:#333;box-sizing:border-box;transition:all 0.3s ease;&::placeholder{color:${LIGHT_BLUE};&:focus{outline:none;background:white;box-shadow:0 0 0 5px rgba(49,130,246,0.2);}`;
const UnifiedTextarea = styled.textarea`width:100%;padding:18px;border:3px solid ${MAIN_BLUE};border-radius:20px;background:${BG_LIGHT};font-size:17px;resize:none;box-sizing:border-box;margin-top:16px;transition:all 0.3s ease;&::placeholder{color:${LIGHT_BLUE};&:focus{outline:none;background:white;box-shadow:0 0 0 5px rgba(49,130,246,0.2);}`;
const FilterSection = styled.div`margin:24px 0;padding:20px;background:white;border-radius:24px;box-shadow:0 6px 20px rgba(0,0,0,0.06);display:flex;flex-direction:column;gap:20px;`;
const SortButtons = styled.div`display:flex;gap:12px;justify-content:center;flex-wrap:wrap;`;
const SortButton = styled.button`padding:10px 20px;border:2px solid ${p=>p.active?MAIN_BLUE:'#ddd'};background:${p=>p.active?MAIN_BLUE:'white'};color:${p=>p.active?'white':'#666'};border-radius:30px;font-weight:bold;font-size:15px;cursor:pointer;`;
const CountdownBanner = styled.div`background:${p=>p.ended?'#333':`linear-gradient(135deg,${MAIN_BLUE},${LIGHT_BLUE})`};color:white;padding:16px 20px;border-radius:20px;margin-bottom:20px;text-align:center;font-weight:900;font-size:20px;display:flex;align-items:center;justify-content:center;gap:12px;`;
const CountdownText = styled.div`font-size:${p=>p.ended?'22px':'20px'};`;
const Container = styled.div`max-width:720px;margin:0 auto;padding:20px;min-height:100vh;background:#f8faff;font-family:'Pretendard',sans-serif;`;
const Header = styled.div`text-align:center;padding:30px 0;background:linear-gradient(135deg,${BG_LIGHT},${BG_SOFT});border-radius:24px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;gap:16px;`;
const Title = styled.h1`font-size:28px;font-weight:900;color:${MAIN_BLUE};`;
const AddButton = styled.button`width:100%;padding:20px;background:white;border:4px solid ${MAIN_BLUE};border-radius:20px;font-size:20px;font-weight:bold;color:${MAIN_BLUE};margin-bottom:24px;cursor:pointer;`;
const FormCard = styled.div`background:white;padding:28px;border-radius:24px;box-shadow:0 10px 40px rgba(49,130,246,0.15);margin-bottom:30px;display:flex;flex-direction:column;gap:16px;`;
const PlayerStatsCard = styled.div`background:${BG_LIGHT};padding:20px;border-radius:20px;border:3px dashed ${LIGHT_BLUE};`;
const LoadingText = styled.p`text-align:center;color:${MAIN_BLUE};font-weight:bold;margin:12px 0;`;
const SubmitButton = styled.button`width:100%;padding:20px;background:linear-gradient(135deg,${MAIN_BLUE},${DARK_BLUE});color:white;border:none;border-radius:18px;font-size:20px;font-weight:bold;margin-top:8px;`;
const PostsList = styled.div`display:flex;flex-direction:column;gap:24px;margin-bottom:40px;`;
const PostCard = styled.div`background:white;padding:24px;border-radius:20px;box-shadow:0 6px 20px rgba(0,0,0,0.08);`;
const CandidateName = styled.h3`color:${MAIN_BLUE};font-size:22px;font-weight:bold;margin:0 0 14px 0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;`;
const Reason = styled.p`font-size:17px;line-height:1.8;color:#333;margin:0 0 20px 0;white-space:pre-wrap;`;
const PowerBadge = styled.span`padding:5px 12px;border-radius:14px;font-size:12px;font-weight:bold;color:white;background:${p=>p.top3?'#dc2626':'#2563eb'};box-shadow:0 2px 6px rgba(0,0,0,0.3);`;
const StatsPreview = styled.div`display:grid;gap:12px;margin:16px 0;padding:16px;background:${BG_LIGHT};border-radius:20px;border:3px dashed ${LIGHT_BLUE};grid-template-columns:repeat(4,1fr);@media(max-width:768px)and(min-width:481px){grid-template-columns:repeat(2,1fr)}@media(max-width:480px){grid-template-columns:1fr}`;
const Stat = styled.div`display:flex;align-items:center;justify-content:center;gap:8px;font-size:15px;font-weight:bold;background:white;border-radius:14px;padding:12px 8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);`;
const Actions = styled.div`display:flex;align-items:center;gap:20px;margin-top:16px;padding-top:16px;border-top:1px solid #eee;`;
const LikeButton = styled.button`display:flex;align-items:center;gap:8px;background:none;border:none;color:${MAIN_BLUE};font-weight:bold;font-size:18px;cursor:pointer;`;
const CommentButton = styled.button`display:flex;align-items:center;gap:8px;background:none;border:none;color:#666;font-weight:bold;font-size:18px;cursor:pointer;`;
const Time = styled.span`margin-left:auto;font-size:14px;color:#999;`;
const CommentsSection = styled.div`border-top:1px solid #eee;padding-top:16px;margin-top:16px;`;
const Comment = styled.div`padding:12px;background:${BG_LIGHT};border-radius:12px;margin:8px 0;font-size:15.5px;`;
const CommentInputBox = styled.div`display:flex;gap:10px;margin-top:12px;`;
const CommentInput = styled.input`flex:1;padding:14px;border:1px solid #ddd;border-radius:30px;font-size:15px;background:#f9f9f9;`;
const SendButton = styled.button`padding:12px;background:${MAIN_BLUE};color:white;border:none;border-radius:50%;cursor:pointer;`;
const Pagination = styled.div`display:flex;justify-content:center;gap:12px;margin:40px 0;`;
const PageButton = styled.button`width:44px;height:44px;border-radius:50%;border:2px solid ${p=>p.active?MAIN_BLUE:'#ddd'};background:${p=>p.active?MAIN_BLUE:'white'};color:${p=>p.active?'white':'#666'};font-weight:bold;cursor:pointer;`;
const Empty = styled.div`text-align:center;padding:80px 20px;color:#999;font-size:20px;`;

export default King;