import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  deleteField
} from 'firebase/firestore';
import { db } from '../App';
import styled from 'styled-components';

const Form = styled.form`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
`;
const Textarea = styled.textarea`
  padding: 8px;
  border: 1px solid #ccc;
`;
const Button = styled.button`
  padding: 8px 16px;
  margin-left: 8px;
`;
const List = styled.ul`
  list-style: none;
  padding: 0;
`;
const Item = styled.li`
  padding: 8px;
  border-bottom: 1px solid #eee;
`;
const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;
const InlineForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
`;
const LoginWrapper = styled.div`
  max-width: 300px;
  margin: 100px auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;
const CapsWarning = styled.div`
  color: red;
  font-size: 0.9em;
`;
const Stats = styled.div`
  font-size: 0.9em;
  color: #666;
  margin-top: 4px;
`;

export default function AnnouncementsAdmin() {
  // authentication state
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const correctPwd = 'alves';

  // announcements state
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [durations, setDurations] = useState({}); // { [id]: seconds }
  const [tick, setTick] = useState(0); // re-render timer

  // editing state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // check session
  useEffect(() => {
    if (sessionStorage.getItem('annAuth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  // tick every second (for remaining-time display)
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // load announcements
  const load = async () => {
    const snap = await getDocs(collection(db, 'announcements'));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setNotes(data);
    // initialize durations from docs
    const map = {};
    data.forEach(n => {
      if (n.publishDuration) map[n.id] = n.publishDuration;
    });
    setDurations(map);
  };

  useEffect(() => { if (authenticated) load(); }, [authenticated]);

  // login handlers
  const handleLogin = e => {
    e.preventDefault();
    if (password === correctPwd) {
      sessionStorage.setItem('annAuth', 'true');
      setAuthenticated(true);
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };
  const onKeyDown = e => {
    setCapsLock(e.getModifierState && e.getModifierState('CapsLock'));
    if (e.key === 'Enter') handleLogin(e);
  };

  if (!authenticated) {
    return (
      <LoginWrapper>
        <h2>관리자 로그인</h2>
        <Form onSubmit={handleLogin}>
          <Input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="비밀번호"
            autoFocus
          />
          {capsLock && <CapsWarning>Caps Lock이 켜져 있습니다</CapsWarning>}
          <label>
            <input
              type="checkbox"
              checked={showPwd}
              onChange={e => setShowPwd(e.target.checked)}
            /> 비밀번호 보기
          </label>
          <Button type="submit">로그인</Button>
        </Form>
      </LoginWrapper>
    );
  }

  // add new announcement
  const handleAdd = async e => {
    e.preventDefault();
    await addDoc(collection(db, 'announcements'), {
      title,
      content,
      date: new Date().toISOString(),
      views: 0,
      likes: 0
    });
    setTitle('');
    setContent('');
    load();
  };

  // delete announcement
  const handleDel = async id => {
    await deleteDoc(doc(db, 'announcements', id));
    load();
  };

  // publish announcement
  const handlePublish = async id => {
    const seconds = durations[id] || 3;
    await updateDoc(doc(db, 'announcements', id), {
      publishDuration: seconds,
      publishTimestamp: new Date().toISOString()
    });
    load();
  };

  // unpublish announcement
  const handleUnpublish = async id => {
    await updateDoc(doc(db, 'announcements', id), {
      publishDuration: deleteField(),
      publishTimestamp: deleteField()
    });
    load();
  };

  // start editing
  const startEdit = note => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  // cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  // save edit
  const handleSave = async e => {
    e.preventDefault();
    if (!editingId) return;
    await updateDoc(doc(db, 'announcements', editingId), {
      title: editTitle,
      content: editContent
    });
    setEditingId(null);
    load();
  };

  const now = Date.now();

  return (
    <div>
      <h2>공지사항 관리</h2>
      <Form onSubmit={handleAdd}>
        <Input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="제목" 
          required 
        />
        <Textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="내용" 
          rows={4} 
          required 
        />
        <Button type="submit">등록</Button>
      </Form>

      <List>
        {notes.map(n => {
          const published = n.publishTimestamp && n.publishDuration;
          let remain = null;
          if (published) {
            const t0 = new Date(n.publishTimestamp).getTime();
            const exp = t0 + n.publishDuration * 1000;
            remain = Math.max(0, Math.ceil((exp - now) / 1000));
          }
          return (
            <Item key={n.id}>
              {editingId === n.id ? (
                // Inline edit form
                <InlineForm onSubmit={handleSave}>
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                  />
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <Controls>
                    <Button type="submit">저장</Button>
                    <Button type="button" onClick={cancelEdit}>취소</Button>
                  </Controls>
                </InlineForm>
              ) : (
                <>
                  <div>
                    <strong>{n.title}</strong>
                    {published
                      ? <span> — 홈 노출 중: {n.publishDuration}s (남은 {remain}s)</span>
                      : <span> — 미발행</span>
                    }
                  </div>
                  <Stats>
                    조회수: {n.views || 0} | 좋아요: {n.likes || 0}
                  </Stats>
                  <Controls>
                    <select
                      value={durations[n.id] || 3}
                      onChange={e => setDurations(d => ({ ...d, [n.id]: Number(e.target.value) }))}
                    >
                      {[3, 5, 8, 10, 15, 4000000000000000000].map(s => <option key={s} value={s}>{s}초</option>)}
                    </select>
                    {published
                      ? <Button onClick={() => handleUnpublish(n.id)}>홈 노출 취소</Button>
                      : <Button onClick={() => handlePublish(n.id)}>홈에 노출</Button>
                    }
                    <Button onClick={() => startEdit(n)}>수정</Button>
                    <Button onClick={() => handleDel(n.id)}>삭제</Button>
                  </Controls>
                </>
              )}
            </Item>
          );
        })}
      </List>
    </div>
  );
}