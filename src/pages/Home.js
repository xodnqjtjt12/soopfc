import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../App';
import { format } from 'date-fns';
import moment from 'moment';
import styled from 'styled-components';
import * as S from './Homecss';

// localStorage hook
function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const setValue = value => {
    setStored(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };
  return [stored, setValue];
}

// 검정색 배경 컨테이너
const BannerContainer = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 20px;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

// 버튼 스타일 (SoccerAnnounceBanner와 색상 통일)
const CloseButton = styled.button`
  background: linear-gradient(to right, #1a472a, #2d8659);
  border: 2px solid #ffffff;
  border-radius: 8px;
  color: white;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  &:hover {
    background: linear-gradient(to right, #153b24, #267a50);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
`;

const Home = () => {
  const [players, setPlayers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [momPlayers, setMomPlayers] = useState([]);
  const [showHint, setShowHint] = useState(true);
  const [showEnd, setShowEnd] = useState(false);
  const momRef = useRef(null);

  const [stats, setStats] = useState({
    members: 0,
    totalGoals: 0,
    totalAssists: 0,
    totalCleanSheets: 0,
    totalGames: 0,
    attackpersonalPoints: 0,
    war: 0,

  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [schedules, setSchedules] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [announces, setAnnounces] = useState([]);
  const [visibleIds, setVisibleIds] = useState([]);
  const [countdowns, setCountdowns] = useState({});

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [hideToday, setHideToday] = useLocalStorage('hideAnnouncementsDate', null);

  const [holidays, setHolidays] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);


  useEffect(() => {
    const fetchAnniversaries = async () => {
      const year  = activeStartDate.getFullYear();
      const month = String(activeStartDate.getMonth() + 1).padStart(2, '0');
      const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getAnniversaryInfo`
        + `?solYear=${year}&solMonth=${month}`
        + `&ServiceKey=CADGVCpJ6S3ugec34rtjEC4Fq1h0t0sbaD%2BchVRlpPGrKdOCDgyGmI0WnIpPQf4d7a4EPfo8FXmTmJqWxPrqrQ%3D%3D`
        + `&_type=json`;
  
      try {
        const res  = await fetch(url);
        const json = await res.json();
        let items = json.response.body.items?.item;
        if (!items) items = [];
        else if (!Array.isArray(items)) items = [items];
  
        // { locdate: '20250603', dateName: '대통령 선거', … }
        const evts = items.map(i => ({
          date: `${String(i.locdate).slice(0,4)}-${String(i.locdate).slice(4,6)}-${String(i.locdate).slice(6,8)}`,
          title: i.dateName
        }));
        setAnniversaries(evts);
      } catch (e) {
        console.error('기념일 API 에러:', e);
      }
    };
  
    fetchAnniversaries();
  }, [activeStartDate]);

  useEffect(() => {
    const fetchHolidays = async () => {
      const year  = activeStartDate.getFullYear();
      const month = String(activeStartDate.getMonth() + 1).padStart(2, '0');
      const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo`
        + `?solYear=${year}&solMonth=${month}`
        + `&ServiceKey=CADGVCpJ6S3ugec34rtjEC4Fq1h0t0sbaD%2BchVRlpPGrKdOCDgyGmI0WnIpPQf4d7a4EPfo8FXmTmJqWxPrqrQ%3D%3D`
        + `&_type=json`;

      try {
        const res  = await fetch(url);
        const json = await res.json();
        let items = json.response.body.items?.item;
        if (!items) items = [];
        else if (!Array.isArray(items)) items = [items];

        const days = items.map(i => {
          const d = String(i.locdate);
          return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
        });
        setHolidays(days);
      } catch (e) {
        console.error('공휴일 API 에러:', e);
      }
    };

    fetchHolidays();
  }, [activeStartDate]);
  
  // 공지 fetch & 초기 표시 제어 (한 번만)
  useEffect(() => {
    const fetchNotes = async () => {
      const snap = await getDocs(collection(db, 'announcements'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllNotes(data);

      const now = Date.now();
      const published = data.filter(n => {
        if (!n.publishTimestamp || !n.publishDuration) return false;
        const t0 = new Date(n.publishTimestamp).getTime();
        return now >= t0;
      });

      setAnnounces(published);

      const ids = published.map(n => n.id);
      setVisibleIds(ids);
      const initialCd = {};
      published.forEach(n => {
        initialCd[n.id] = n.publishDuration;
      });
      setCountdowns(initialCd);
    };

    fetchNotes();
  }, []);

  // 카운트다운 타이머
  useEffect(() => {
    const iv = setInterval(() => {
      setCountdowns(prevCd => {
        const nextCd = { ...prevCd };
        Object.entries(prevCd).forEach(([id, sec]) => {
          if (sec > 0) {
            nextCd[id] = sec - 1;
            if (sec - 1 <= 0) {
              setVisibleIds(v => v.filter(vId => vId !== id));
            }
          }
        });
        return nextCd;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // players fetch
  useEffect(() => {
    const fetchPlayers = async () => {
      const snap = await getDocs(collection(db, 'players'));
      const ps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      ps.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
      setPlayers(ps);
    };
    fetchPlayers();
  }, []);

  // stats & lastUpdated
  useEffect(() => {
    if (players.length) {
      const totalGoals = players.reduce((s, p) => s + (p.goals || 0), 0);
      const totalAssists = players.reduce((s, p) => s + (p.assists || 0), 0);
      const totalCleanSheets = players.reduce((s, p) => s + (p.cleanSheets || 0), 0);
      const totalGames = players.reduce((s, p) => s + (p.matches || 0), 0);
      setStats({
        members: players.length,
        totalGoals,
        totalAssists,
        totalCleanSheets,
        totalGames,
        attackpersonalPoints: totalGoals + totalAssists,
      });
      const lu = players[0].updatedAt;
      if (lu) setLastUpdated(new Date(lu.seconds * 1000));
    }
  }, [players]);

  // MOM fetch
  useEffect(() => {
  const fetchMOM = async () => {
    const snap = await getDocs(collection(db, 'MOM'));
    if (snap.docs.length) {
      // Firestore에 players 배열 안에 이미 xG 필드가 들어있다고 가정
      const data = snap.docs[0].data().players || [];
      setMomPlayers(data);
    }
  };
  fetchMOM();
}, []);

  // MOM scroll hint
  useEffect(() => {
    const el = momRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowHint(scrollLeft < 10);
      setShowEnd(scrollLeft + clientWidth >= scrollWidth - 10);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // schedule fetch
  useEffect(() => {
    const fetchSchedules = async () => {
      const snap = await getDocs(collection(db, 'schedules'));
      const arr = snap.docs.map(d => {
        const dd = d.data().date;
        const date = dd instanceof Timestamp ? new Date(dd.seconds * 1000) : new Date(dd);
        return { id: d.id, text: d.data().text, date };
      });
      setSchedules(arr);
    };
    fetchSchedules();
  }, []);

  const onDateChange = date => setSelectedDate(date);
  const getSchedulesForSelectedDate = () =>
    schedules.filter(s => format(s.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));
  const upcomingSchedules = schedules
    .filter(s => s.date > new Date())
    .sort((a, b) => a.date - b.date)
    .slice(0, 2);

  const handleHideToday = () => {
    localStorage.setItem('hideAnnouncementsDate', todayStr);
    setHideToday(todayStr);
  };

  return (
    <S.HomeContainer>
      <S.ContentWrapper>
        {/* 공지사항 배너 */}
        {!hideToday && announces.map(n => (
          visibleIds.includes(n.id) && (
            <BannerContainer key={n.id}>
              <Link to="/announcements" style={{ textDecoration: 'none' }}>
                <S.SoccerAnnounceBanner>
                  {n.title}
                  <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                    {countdowns[n.id] > 0 ? `${countdowns[n.id]}s` : ''}
                  </span>
                </S.SoccerAnnounceBanner>
              </Link>
              <CloseButton onClick={handleHideToday}>
                오늘 하루 보지 않기
              </CloseButton>
            </BannerContainer>
          )
        ))}

        {/* Hero Section */}
        <S.HeroSection>
          <S.HeroContent>
            <S.HeroTitle>더 쉽게<br />더 즐겁게<br />축구하세요</S.HeroTitle>
            <S.HeroSubtitle>
              SOOP FC와 함께 축구 실력과 재미를 키워나가세요. 경기 기록, 출석체크, 팀원 통계까지 한눈에 확인하세요.
            </S.HeroSubtitle>
            <S.ButtonGroup>
              <S.PrimaryButton href="/total">내 스탯 보기</S.PrimaryButton>
            </S.ButtonGroup>
          </S.HeroContent>
          <S.HeroImageContainer>
            <S.HeroImage src={`${process.env.PUBLIC_URL}/Main.png`} alt="축구 동호회 이미지" />
          </S.HeroImageContainer>
        </S.HeroSection>

        {/* Stats */}
        <S.StatsContainer>
          <S.StatItem>
            <S.StatValue>{stats.totalGoals}</S.StatValue>
            <S.StatLabel>2025년 득점</S.StatLabel>
          </S.StatItem>
          <S.StatItem>
            <S.StatValue>{stats.totalAssists}</S.StatValue>
            <S.StatLabel>2025년 어시스트</S.StatLabel>
          </S.StatItem>
          <S.StatItem>
            <S.StatValue>{stats.totalCleanSheets}</S.StatValue>
            <S.StatLabel>25년 누적 클린시트</S.StatLabel>
          </S.StatItem>
          <S.StatItem>
            <S.StatValue>{stats.members}명</S.StatValue>
            <S.StatLabel>SOOP FC 회원 수</S.StatLabel>
          </S.StatItem>
          <S.StatItem>
            <S.StatValue>{stats.attackpersonalPoints}</S.StatValue>
            <S.StatLabel>누적 공격 포인트</S.StatLabel>
          </S.StatItem>
        </S.StatsContainer>

        {lastUpdated && (
          <div style={{ textAlign: 'right', width: '100%', fontSize: 14, color: '#4e5968', margin: '-24px 0 40px' }}>
            마지막 업데이트: {lastUpdated.toLocaleDateString('ko-KR')} {lastUpdated.toLocaleTimeString('ko-KR')}
          </div>
        )}

        {/* MOM Section */}
        <div style={{ marginBottom: '60px', width: '100%' }}>
          <S.MomSectionTitle>
            <img src={`${process.env.PUBLIC_URL}/mom.png`} alt="Mom Icon" /> M.O.M 플레이어
          </S.MomSectionTitle>
          {showHint && <S.SwipeHint>순위를 더 보려면 옆으로 넘겨주세요! →</S.SwipeHint>}
          <S.MomPlayersContainer ref={momRef}>
            {momPlayers.length > 0 ? momPlayers.map((p, i) => (
              <S.PlayerCard key={i}>
                <S.PlayerHeader>
                  <S.PlayerContainer>
                    <S.PlayerRankBadge>
                      <S.TrophyIcon src={`${process.env.PUBLIC_URL}/trophy.png`} alt="Trophy Icon" />
                      <S.PlayerRank>{p.rankText || '순위 미정'}</S.PlayerRank>
                    </S.PlayerRankBadge>
                    <S.PlayerScore title="누적 MOM점수">{p.momScore}</S.PlayerScore>
                  </S.PlayerContainer>
                  <S.PlayerName>{p.name}</S.PlayerName>
                </S.PlayerHeader>
                <S.PositionTags>
                  {p.formations?.map((pos, idx) => <S.PositionTag key={idx} position={pos}>{pos}</S.PositionTag>)}
                </S.PositionTags>
                <S.WhiteDivider />
                <S.StatRow><S.StatLabel>골</S.StatLabel><S.StatLabel>{p.goals}</S.StatLabel></S.StatRow>
                <S.StatRow><S.StatLabel>도움</S.StatLabel><S.StatLabel>{p.assists}</S.StatLabel></S.StatRow>
                <S.StatRow><S.StatLabel>클린시트</S.StatLabel><S.StatLabel>{p.cleanSheets}</S.StatLabel></S.StatRow>
                <S.StatRow><S.StatLabel>경기수</S.StatLabel><S.StatLabel>{p.matches}</S.StatLabel></S.StatRow>
                <S.StatRow><S.StatLabel>승률</S.StatLabel><S.StatLabel>{p.winRate}%</S.StatLabel></S.StatRow>
                <S.StatRow><S.StatLabel>승점</S.StatLabel><S.StatLabel>{p.personalPoints}</S.StatLabel></S.StatRow>
                <S.StatRow><S.StatLabel>WAR</S.StatLabel><S.StatLabel>{p.xG}</S.StatLabel></S.StatRow>
              </S.PlayerCard>
            )) : <p>MOM 플레이어가 없습니다.</p>}
          </S.MomPlayersContainer>
          {showEnd && <S.EndMessage>MOM 순위는 여기까지입니다.</S.EndMessage>}
        </div>

        {/* Schedule Section */}
        <S.ScheduleSection>
          <S.ScheduleHeader>📅 축구 일정 보기</S.ScheduleHeader>
          <S.StyledCalendar
            calendarType="gregory"
            locale="ko-KR"
            value={selectedDate}
            onActiveStartDateChange={({ activeStartDate }) => {
   setActiveStartDate(activeStartDate); }}
            onChange={onDateChange}
            tileContent={({ date, view }) => view === 'month' && schedules.some(s => format(s.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) ? <span>⚽</span> : null}
            tileClassName={({ date, view }) => {
              if (view !== 'month') return;
          
              const dayStr = format(date, 'yyyy-MM-dd');
              // 토요일
              if (date.getDay() === 6) return 'saturday';
              // 일요일 또는 API로 받아온 공휴일
              if (date.getDay() === 0 || holidays.includes(dayStr)) {
                return 'sunday-or-holiday';
              }
            }}
            formatDay={(locale, date) => moment(date).format('D')}
          />

          <div style={{ marginTop: 24 }}>
            <strong>{format(selectedDate, 'yyyy년 MM월 dd일')} 일정</strong>
            <S.ScheduleList>
              {getSchedulesForSelectedDate().length > 0 ?
                getSchedulesForSelectedDate().map((it, idx) => <S.ScheduleItem key={idx}>{it.text}</S.ScheduleItem>)
                : <S.ScheduleItem>일정 없음</S.ScheduleItem>}
            </S.ScheduleList>
          </div>

          <div style={{ marginTop: 24 }}>
            <strong>다가오는 일정</strong>
            <S.ScheduleList>
              {upcomingSchedules.length > 0 ?
                upcomingSchedules.map((s, idx) =>
                  <S.ScheduleItem key={idx}>
                    {format(s.date, 'yyyy년 MM월 dd일 (E)')} - {s.text}
                  </S.ScheduleItem>
                )
                : <S.ScheduleItem>다가오는 일정이 없습니다.</S.ScheduleItem>}
            </S.ScheduleList>
          </div>
        </S.ScheduleSection>
      </S.ContentWrapper>
    </S.HomeContainer>
  );
};

export default Home;