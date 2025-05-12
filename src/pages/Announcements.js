import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../App';

const AnnouncementsPreview = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // 스타일 정의 (기존 그대로)
  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Roboto, Noto Sans KR, sans-serif'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '30px',
      borderBottom: '3px solid #3182f6',
      paddingBottom: '10px',
      position: 'relative'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#222',
      margin: '0'
    },
    list: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    item: {
      padding: '20px',
      borderBottom: '1px solid #eaeaea',
      background: 'white',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    itemHighlight: {
      position: 'absolute',
      left: '0',
      top: '0',
      bottom: '0',
      width: '4px',
      backgroundColor: '#3182f6'
    },
    announcementTitle: {
      margin: '0 0 10px 0',
      fontSize: '18px',
      fontWeight: '600',
      color: '#222',
      display: 'flex',
      alignItems: 'center'
    },
    date: {
      fontSize: '14px',
      color: '#777',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center'
    },
    content: {
      fontSize: '15px',
      lineHeight: '1.6',
      color: '#444',
      whiteSpace: 'pre-line',
      padding: '10px',
      backgroundColor: '#f9f9f9',
      borderRadius: '6px',
      borderLeft: '3px solid #e0e0e0'
    },
    badge: {
      backgroundColor: '#ff4757',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      padding: '3px 8px',
      borderRadius: '12px',
      marginLeft: '10px',
      textTransform: 'uppercase'
    },
    loadingText: {
      textAlign: 'center',
      padding: '20px',
      color: '#666',
      fontSize: '16px'
    },
    noDataText: {
      textAlign: 'center',
      padding: '30px',
      color: '#666',
      fontSize: '16px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px'
    }
  };

  // 조회수 증가 함수
  const incrementViews = async (announcementId) => {
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      await updateDoc(announcementRef, {
        views: increment(1)
      });
      console.log(`Announcement ${announcementId} views incremented`);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Firebase에서 공지사항 데이터 가져오기
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const announcementsRef = collection(db, 'announcements');
        const q = query(announcementsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const announcementsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date ? new Date(doc.data().date) : new Date()
        }));
        
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error("공지사항을 불러오는 중 오류가 발생했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // 쿼리 파라미터에서 공지사항 ID 읽고 조회수 증가
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const announcementId = params.get('id');
    if (announcementId) {
      incrementViews(announcementId);
    }
  }, [location.search]);

  // 최신 공지 여부 확인 (7일 이내)
  const isNew = (date) => {
    const now = new Date();
    const announcementDate = new Date(date);
    const diffTime = Math.abs(now - announcementDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // 포맷된 날짜 반환
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) {
      return '날짜 정보 없음';
    }
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('ko-KR', options);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={{ fontSize: '24px', marginRight: '10px' }}>⚽</span>
        <h2 style={styles.title}>공지사항</h2>
      </div>
      
      {loading ? (
        <div style={styles.loadingText}>공지사항을 불러오는 중...</div>
      ) : announcements.length > 0 ? (
        <div style={styles.list}>
          {announcements.map((note, index) => (
            <div key={note.id} style={{
              ...styles.item,
              borderBottom: index === announcements.length - 1 ? 'none' : '1px solid #eaeaea'
            }}>
              <div style={styles.itemHighlight}></div>
              <div style={styles.announcementTitle}>
                {note.title}
                {isNew(note.date) && <span style={styles.badge}>NEW</span>}
              </div>
              <div style={styles.date}>
                <span style={{ marginRight: '6px' }}>📅</span>
                {formatDate(note.date)}
              </div>
              <div style={styles.content}>{note.content}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.noDataText}>
          등록된 공지사항이 없습니다.
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPreview;