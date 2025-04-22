import React, { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../App';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  flex: 1;
  min-width: 200px;
`;

const Button = styled.button`
  background-color: #3182f6;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: #1c6fef;
  }
`;

const ScheduleCard = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9fafb;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const PasswordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const SchedulePage = () => {
  const [date, setDate] = useState('');
  const [text, setText] = useState('');
  const [scheduleList, setScheduleList] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [editText, setEditText] = useState({});
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 일정 불러오기 - 'schedules' 컬렉션 사용
  const fetchSchedules = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'schedules'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Timestamp
          ? new Date(doc.data().date.seconds * 1000)
          : new Date(doc.data().date)
      }));
      
      // 날짜별 정렬
      data.sort((a, b) => a.date - b.date);
      
      setScheduleList(data);
    } catch (error) {
      console.error("일정 불러오기 오류:", error);
      alert("일정을 불러오는 데 문제가 발생했습니다.");
    }
  };

  // 비밀번호 확인
  const handleLogin = () => {
    if (password === 'alves') {
      setIsAuthenticated(true);
      fetchSchedules();
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  // 일정 추가
  const handleAddSchedule = async () => {
    if (!date || !text) {
      alert('날짜와 일정 내용을 모두 입력해주세요.');
      return;
    }
    
    try {
      await addDoc(collection(db, 'schedules'), { 
        date: new Date(date),
        text: text
      });
      
      alert('일정이 추가되었습니다.');
      setDate('');
      setText('');
      fetchSchedules(); // 목록 갱신
    } catch (error) {
      console.error("일정 추가 오류:", error);
      alert("일정 추가 중 문제가 발생했습니다.");
    }
  };

  // 일정 삭제
  const handleDelete = async (id) => {
    if (window.confirm('정말 이 일정을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'schedules', id));
        alert('삭제되었습니다.');
        fetchSchedules();
      } catch (error) {
        console.error("일정 삭제 오류:", error);
        alert("일정 삭제 중 문제가 발생했습니다.");
      }
    }
  };

  // 일정 수정 모드 전환
  const toggleEditMode = (id, currentText = '') => {
    setEditMode(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    // 수정 모드로 전환할 때 현재 텍스트를 editText에 저장
    if (!editMode[id]) {
      setEditText(prev => ({
        ...prev,
        [id]: currentText
      }));
    } else {
      // 수정 모드 종료 시 해당 id의 editText 제거
      setEditText(prev => {
        const newEditText = { ...prev };
        delete newEditText[id];
        return newEditText;
      });
    }
  };

  // 일정 수정 텍스트 변경 핸들러
  const handleEditTextChange = (id, value) => {
    setEditText(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // 일정 수정
  const handleEdit = async (id) => {
    try {
      const updatedText = editText[id] !== undefined ? editText[id] : '';
      await updateDoc(doc(db, 'schedules', id), { text: updatedText });
      toggleEditMode(id);
      fetchSchedules();
    } catch (error) {
      console.error("일정 수정 오류:", error);
      alert("일정 수정 중 문제가 발생했습니다.");
    }
  };

  // CapsLock 확인
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    const isCapsOn = e.getModifierState && e.getModifierState('CapsLock');
    setIsCapsLock(isCapsOn);
  };

  // 날짜 형식 변환 함수
  const formatDate = (date) => {
    return date instanceof Date 
      ? date.toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          weekday: 'long' 
        })
      : '';
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  if (!isAuthenticated) {
    return (
      <PasswordContainer>
        <h2>비밀번호를 입력하세요</h2>
        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
        />
        <Button onClick={handleLogin}>로그인</Button>
        <Button onClick={toggleShowPassword}>
          {showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
        </Button>
        {isCapsLock && <p style={{ color: 'red' }}>Caps Lock이 켜져 있습니다.</p>}
      </PasswordContainer>
    );
  }

  return (
    <PageContainer>
      <h2>축구 일정 관리</h2>
      <FormGroup>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          type="text"
          placeholder="일정 내용을 입력하세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button onClick={handleAddSchedule}>일정 추가</Button>
      </FormGroup>

      <h3>등록된 일정 목록</h3>
      {scheduleList.length === 0 ? (
        <p>등록된 일정이 없습니다.</p>
      ) : (
        scheduleList.map((item) => (
          <ScheduleCard key={item.id}>
            <p><strong>날짜:</strong> {formatDate(item.date)}</p>
            
            {editMode[item.id] ? (
              <FormGroup>
                <Input
                  type="text"
                  value={editText[item.id] || ''}
                  onChange={(e) => handleEditTextChange(item.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEdit(item.id);
                    }
                  }}
                />
                <Button onClick={() => handleEdit(item.id)}>
                  저장
                </Button>
                <Button onClick={() => toggleEditMode(item.id)} style={{ backgroundColor: '#6c757d' }}>
                  취소
                </Button>
              </FormGroup>
            ) : (
              <>
                <p><strong>내용:</strong> {item.text}</p>
                <ActionButtons>
                  <Button onClick={() => toggleEditMode(item.id, item.text)}>수정</Button>
                  <Button onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#dc3545' }}>삭제</Button>
                </ActionButtons>
              </>
            )}
          </ScheduleCard>
        ))
      )}
    </PageContainer>
  );
};

export default SchedulePage;