// src/pages/KingAdmin.js - 기존 홈 노출 기능 그대로 + 비밀번호 + 후보/댓글 관리 추가
import React, { useState, useEffect } from 'react';
import { 
  collection, doc, setDoc, deleteDoc, getDoc, query, 
  onSnapshot, updateDoc, arrayRemove, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../App';
import styled from 'styled-components';
import { Trash2, Edit2, Save, X, MessageCircle, Trophy } from 'lucide-react';

const ADMIN_PASSWORD = 'alves'; // 비밀번호

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 40px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 15px 50px rgba(0,0,0,0.12);
  font-family: 'Pretendard', sans-serif;
`;

const PasswordModal = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const PasswordBox = styled.div`
  background: white;
  padding: 50px;
  border-radius: 30px;
  width: 90%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 30px 80px rgba(255,94,0,0.4);
`;

const Title = styled.h1`
  text-align: center;
  color: #ff5e00;
  font-size: 32px;
  margin-bottom: 40px;
  font-weight: 900;
`;

// 기존 스타일 그대로 유지
const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.active ? 'linear-gradient(135deg, #fff4e6, #ffe0cc)' : '#f8f9fa'};
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 30px;
  border: 2px solid ${props => props.active ? '#ff9d00' : '#e0e0e0'};
  transition: all 0.3s;
`;

const SwitchLabel = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.active ? '#ff5e00' : '#666'};
`;

const Status = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.active ? '#d4380d' : '#999'};
`;

const TimeSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #f1f3f5;
  border-radius: 16px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
`;

const TimeLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 8px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 16px;
  &:focus { outline: none; border-color: #ff5e00; box-shadow: 0 0 0 4px rgba(255,94,0,0.1); }
`;

const Button = styled.button`
  width: 100%;
  margin-top: 30px;
  padding: 18px;
  background: linear-gradient(135deg, #ff5e00, #e64a00);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255,94,0,0.4);
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); }
`;

const Message = styled.div`
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  background: ${props => props.error ? '#fff1f0' : '#f6ffed'};
  color: ${props => props.error ? '#cf1322' : '#389e0d'};
  border: 1px solid ${props => props.error ? '#ffa39e' : '#b7eb8f'};
`;

const SectionTitle = styled.h2`
  color: #ff5e00;
  font-size: 26px;
  margin: 50px 0 30px;
  text-align: center;
  font-weight: 900;
`;

const PostCard = styled.div`
  background: #f9f9f9;
  padding: 24px;
  border-radius: 20px;
  margin-bottom: 24px;
  border: 2px solid ${props => props.editing ? '#ff5e00' : '#eee'};
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
`;

const CandidateName = styled.h3`
  color: #ff5e00;
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 12px 0;
`;

const Reason = styled.textarea`
  width: 100%;
  padding: 16px;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 16px;
  margin: 12px 0;
  resize: vertical;
  min-height: 100px;
`;

const CommentItem = styled.div`
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
`;

const KingAdmin = () => {
  // 인증 관련
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // 기존 홈 노출 설정 관련 (완전 그대로!)
  const [isEnabled, setIsEnabled] = useState(false);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 후보자 관리 관련
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editReason, setEditReason] = useState('');

  // 비밀번호 인증
  const handlePasswordSubmit = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 틀렸습니다! (힌트: 당신의 이름)');
      setPasswordInput('');
    }
  };

  // 기존 설정 불러오기
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'kingVoteStatus', '2026');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsEnabled(data.isHomeExposed || false);
          setStartDateTime(data.exposeStartDateTime ? data.exposeStartDateTime.toDate().toISOString().slice(0, 16) : '');
          setEndDateTime(data.exposeEndDateTime ? data.exposeEndDateTime.toDate().toISOString().slice(0, 16) : '');
        }
      } catch (err) {
        console.error('설정 로드 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isAuthenticated]);

  // 후보자 실시간 불러오기
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'kingRecommendations'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        comments: doc.data().comments || []
      }));
      setPosts(data.sort((a, b) => (b.likes || 0) - (a.likes || 0)));
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // 기존 저장 기능 (완전 그대로!)
  const handleSave = async () => {
    if (isEnabled && (!startDateTime || !endDateTime)) {
      setMessage({ text: '홈 노출을 켜려면 시작시간과 종료시간을 모두 입력해주세요!', error: true });
      return;
    }

    if (isEnabled && new Date(startDateTime) >= new Date(endDateTime)) {
      setMessage({ text: '종료시간은 시작시간보다 늦어야 합니다!', error: true });
      return;
    }

    try {
      await setDoc(doc(db, 'kingVoteStatus', '2026'), {
        isHomeExposed: isEnabled,
        exposeStartDateTime: isEnabled ? new Date(startDateTime) : null,
        exposeEndDateTime: isEnabled ? new Date(endDateTime) : null,
        updatedAt: new Date()
      }, { merge: true });

      setMessage({ text: `26년 회장 추천 버튼이 ${isEnabled ? '활성화' : '비활성화'}되었습니다!`, error: false });
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage({ text: '저장 중 오류가 발생했습니다.', error: true });
    }
  };

  const isCurrentlyExposed = isEnabled && startDateTime && endDateTime
    ? new Date() >= new Date(startDateTime) && new Date() <= new Date(endDateTime)
    : false;

  // 후보자 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'kingRecommendations', id));
  };

  // 후보자 수정
  const handleSaveEdit = async (id) => {
    await updateDoc(doc(db, 'kingRecommendations', id), {
      reason: editReason.trim()
    });
    setEditingId(null);
  };

  // 댓글 삭제
  const handleDeleteComment = async (postId, commentIndex) => {
    if (!window.confirm('이 댓글을 삭제하시겠습니까?')) return;
    const post = posts.find(p => p.id === postId);
    const commentToRemove = post.comments[commentIndex];
    await updateDoc(doc(db, 'kingRecommendations', postId), {
      comments: arrayRemove(commentToRemove)
    });
  };

  // 비밀번호 입력 화면
  if (!isAuthenticated) {
    return (
      <PasswordModal>
        <PasswordBox>
          <Trophy size={70} color="#ff5e00" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '30px', color: '#ff5e00', marginBottom: '30px', fontWeight: '900' }}>
            관리자 로그인
          </h2>
          <Input
            type="password"
            placeholder="비밀번호 입력 (힌트: 당신 이름)"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
          />
          <Button onClick={handlePasswordSubmit}>로그인</Button>
        </PasswordBox>
      </PasswordModal>
    );
  }

  return (
    <Container>
      {/* 기존 홈 노출 관리 기능 그대로 */}
      <Title>26년 회장 추천 홈 노출 관리</Title>

      <SwitchContainer active={isEnabled}>
        <SwitchLabel active={isEnabled}>홈에 “26년 회장 추천” 버튼 노출</SwitchLabel>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => setIsEnabled(e.target.checked)}
          style={{ width: 28, height: 28, accentColor: '#ff5e00', cursor: 'pointer' }}
        />
      </SwitchContainer>

      <Status>
        현재 상태: <strong style={{ color: isCurrentlyExposed ? '#d4380d' : '#999' }}>
          {isCurrentlyExposed ? '홈에 표시 중' : '숨김 상태'}
        </strong>
      </Status>

      <TimeSection disabled={!isEnabled}>
        <TimeLabel>홈 노출 시작 일시</TimeLabel>
        <Input type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} disabled={!isEnabled} />
        <TimeLabel style={{ marginTop: '20px' }}>홈 노출 종료 일시</TimeLabel>
        <Input type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} disabled={!isEnabled} />
      </TimeSection>

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? '로딩 중...' : '저장하기'}
      </Button>

      {message && <Message error={message.error}>{message.text}</Message>}

      {/* 추가된 후보자 관리 섹션 */}
      <SectionTitle>후보자 및 댓글 관리</SectionTitle>
      <div style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
        총 <strong style={{ color: '#ff5e00', fontSize: '28px' }}>{posts.length}</strong>명 추천됨
      </div>

      {posts.map(post => (
        <PostCard key={post.id} editing={editingId === post.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CandidateName>후보: {post.candidate} ({post.likes || 0}표)</CandidateName>
            <div>
              {editingId === post.id ? (
                <>
                  <Save size={22} color="green" style={{ cursor: 'pointer', marginRight: '12px' }} onClick={() => handleSaveEdit(post.id)} />
                  <X size={22} color="#999" style={{ cursor: 'pointer' }} onClick={() => setEditingId(null)} />
                </>
              ) : (
                <>
                  <Edit2 size={20} color="#ff5e00" style={{ cursor: 'pointer', marginRight: '16px' }} 
                    onClick={() => { setEditingId(post.id); setEditReason(post.reason); }} />
                  <Trash2 size={20} color="#d4380d" style={{ cursor: 'pointer' }} onClick={() => handleDelete(post.id)} />
                </>
              )}
            </div>
          </div>

          {editingId === post.id ? (
            <Reason value={editReason} onChange={(e) => setEditReason(e.target.value)} />
          ) : (
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap', margin: '16px 0' }}>
              {post.reason}
            </p>
          )}

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #ddd' }}>
            <div style={{ fontWeight: 'bold', color: '#ff5e00', marginBottom: '12px' }}>
              댓글 {post.comments.length}개
            </div>
            {post.comments.map((c, i) => (
              <CommentItem key={i}>
                <span><strong style={{ color: '#ff5e00' }}>{c.author}</strong> {c.text}</span>
                <Trash2 size={16} color="#d4380d" style={{ cursor: 'pointer' }} 
                  onClick={() => handleDeleteComment(post.id, i)} />
              </CommentItem>
            ))}
          </div>
        </PostCard>
      ))}
    </Container>
  );
};

export default KingAdmin;