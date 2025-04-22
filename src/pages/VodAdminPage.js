import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { 
  AdminContainer, 
  AdminHeader, 
  AdminForm, 
  FormGroup, 
  Label, 
  Input, 
  Select, 
  Button, 
  AdminContent, 
  FilterSection, 
  VodTable, 
  TableHeader, 
  TableRow, 
  DeleteButton, 
  NoVodsMessage,
  QuarterBadge,
  DateSelector,
  VideoTypeBadge
} from './VodAdminPageCss';

function VodAdminPage() {
  const [vods, setVods] = useState([]);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [quarter, setQuarter] = useState('1');
  const [customQuarter, setCustomQuarter] = useState(''); // 직접 입력 쿼터
  const [time, setTime] = useState('00:00');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [videoType, setVideoType] = useState('vod');
  const [filterQuarter, setFilterQuarter] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVods();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterQuarter, filterDate, filterType]);

  // 모든 VOD 데이터 가져오기
  const fetchVods = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'vods'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const vodData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: doc.data().date || new Date().toISOString().split('T')[0],
        quarter: doc.data().quarter || '1',
        time: doc.data().time || '00:00',
        videoType: doc.data().videoType || 'vod'
      }));
      
      // 날짜 추출
      const uniqueDates = [...new Set(vodData.map(vod => vod.date))].sort().reverse();
      
      setVods(vodData);
      setFilteredVods(vodData);
      setDates(uniqueDates);
    } catch (error) {
      console.error("VOD 데이터를 가져오는 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 VOD 목록
  const [filteredVods, setFilteredVods] = useState([]);

  // 필터 적용
  const applyFilters = () => {
    let filtered = [...vods];
    
    if (filterQuarter !== 'all') {
      filtered = filtered.filter(vod => vod.quarter === filterQuarter);
    }
    
    if (filterDate !== 'all') {
      filtered = filtered.filter(vod => vod.date === filterDate);
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(vod => vod.videoType === filterType);
    }
    
    setFilteredVods(filtered);
  };

  // VOD 추가 함수
  const handleAddVod = async () => {
    if (!title || !link) {
      alert("제목과 링크를 입력해주세요.");
      return;
    }
    if (quarter === 'custom' && !customQuarter.trim()) {
      alert("직접 입력한 쿼터 값을 입력해주세요.");
      return;
    }

    try {
      const finalQuarter = quarter === 'custom' ? customQuarter.trim() : quarter;
      const newVod = { 
        title, 
        link, 
        quarter: finalQuarter,
        time,
        date,
        videoType,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'vods'), newVod);
      
      // 데이터 새로고침
      fetchVods();
      
      // 입력 필드 초기화
      setTitle('');
      setLink('');
      setQuarter('1');
      setCustomQuarter('');
      setTime('00:00');
    } catch (error) {
      console.error("VOD 추가 중 오류 발생:", error);
      alert("VOD 추가에 실패했습니다.");
    }
  };

  // VOD 삭제 함수
  const handleDeleteVod = async (id) => {
    if (window.confirm("정말로 이 VOD를 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, 'vods', id));
        fetchVods();
      } catch (error) {
        console.error("VOD 삭제 중 오류 발생:", error);
        alert("VOD 삭제에 실패했습니다.");
      }
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}.${month}.${day} (${weekday})`;
  };

  // 쿼터 옵션
  const quarterOptions = [
    { value: '1', label: '1쿼터' },
    { value: '2', label: '2쿼터' },
    { value: '3', label: '3쿼터' },
    { value: '4', label: '4쿼터' },
    { value: 'custom', label: '직접 입력' }
  ];
  
  // 비디오 타입 옵션
  const videoTypeOptions = [
    { value: 'vod', label: '일반 VOD' },
    { value: 'catch', label: '캐치 비디오' },
    { value: 'shorts', label: '숏츠 비디오' }
  ];

  // 쿼터 필터 옵션 (동적 생성)
  const uniqueQuarters = [...new Set(vods.map(vod => vod.quarter))].sort();

  return (
    <AdminContainer>
      <AdminHeader>VOD 관리</AdminHeader>
      
      {/* VOD 등록 폼 */}
      <AdminForm>
        <FormGroup>
          <Label>날짜</Label>
          <Input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>쿼터</Label>
          <Select 
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
          >
            {quarterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {quarter === 'custom' && (
            <Input
              type="text"
              placeholder="쿼터 입력 (예: 5쿼터, 하이라이트)"
              value={customQuarter}
              onChange={(e) => setCustomQuarter(e.target.value)}
              style={{ marginTop: '10px' }}
            />
          )}
        </FormGroup>
        
        <FormGroup>
          <Label>시간</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>비디오 타입</Label>
          <Select
            value={videoType}
            onChange={(e) => setVideoType(e.target.value)}
          >
            {videoTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>제목</Label>
          <Input
            type="text"
            placeholder="경기 제목 입력"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>VOD 링크</Label>
          <Input
            type="text"
            placeholder="예: https://vod.sooplive.co.kr/player/154801139"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </FormGroup>
        
        <Button onClick={handleAddVod}>VOD 등록</Button>
      </AdminForm>
      
      {/* VOD 목록 필터 */}
      <AdminContent>
        <FilterSection>
          <FormGroup>
            <Label>날짜 필터</Label>
            <DateSelector
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">모든 날짜</option>
              {dates.map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </DateSelector>
          </FormGroup>
          
          <FormGroup>
            <Label>쿼터 필터</Label>
            <Select
              value={filterQuarter}
              onChange={(e) => setFilterQuarter(e.target.value)}
            >
              <option value="all">모든 쿼터</option>
              {uniqueQuarters.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>비디오 타입</Label>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">모든 타입</option>
              {videoTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormGroup>
        </FilterSection>
        
        {/* VOD 목록 테이블 */}
        <VodTable>
          <thead>
            <TableHeader>
              <th>날짜</th>
              <th>쿼터</th>
              <th>시간</th>
              <th>타입</th>
              <th>제목</th>
              <th>링크</th>
              <th>관리</th>
            </TableHeader>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7">VOD 목록을 불러오는 중...</td></tr>
            ) : filteredVods.length > 0 ? (
              filteredVods.map(vod => (
                <TableRow key={vod.id}>
                  <td>{formatDate(vod.date)}</td>
                  <td><QuarterBadge>{vod.quarter}</QuarterBadge></td>
                  <td>{vod.time}</td>
                  <td>
                    <VideoTypeBadge type={vod.videoType}>
                      {vod.videoType === 'vod' ? 'VOD' : 
                       vod.videoType === 'catch' ? 'CATCH' : 
                       vod.videoType === 'shorts' ? 'SHORTS' : vod.videoType.toUpperCase()}
                    </VideoTypeBadge>
                  </td>
                  <td>{vod.title}</td>
                  <td>
                    <a href={vod.link} target="_blank" rel="noopener noreferrer">
                      {vod.link.substring(0, 30)}...
                    </a>
                  </td>
                  <td>
                    <DeleteButton onClick={() => handleDeleteVod(vod.id)}>
                      삭제
                    </DeleteButton>
                  </td>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <NoVodsMessage>등록된 VOD가 없습니다.</NoVodsMessage>
                </td>
              </tr>
            )}
          </tbody>
        </VodTable>
      </AdminContent>
    </AdminContainer>
  );
}

export default VodAdminPage;