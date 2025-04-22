// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../App';
import { format } from 'date-fns';
import * as S from './Homecss'; // 스타일드 컴포넌트를 Homecss.js에서 가져옴

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
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleText, setScheduleText] = useState('');
  const [schedules, setSchedules] = useState([]);



  useEffect(() => {
    const el = momRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      if (scrollLeft < 10) {
        setShowHint(true);
        setShowEnd(false);
      } else if (scrollLeft + clientWidth >= scrollWidth - 10) {
        setShowHint(false);
        setShowEnd(true);
      } else {
        setShowHint(false);
        setShowEnd(false);
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);



  useEffect(() => {
    const fetchMOM = async () => {
      try {
        const momRef = collection(db, 'MOM');
        const snapshot = await getDocs(momRef);
        let momData = snapshot.docs.map((doc) => doc.data());
        if (momData.length > 0) {
          let playersData = momData[0].players || [];
          // xG 계산
          playersData = playersData.map((player) => {
            const matches = player.matches || 1; // 0 방지
            const normalizedGoals = player.goals / matches;
            const normalizedAssists = player.assists / matches;
            const normalizedCleanSheets = player.cleanSheets / matches;
            const normalizedWinRate = player.winRate / 100; // 백분율을 0~1로
            const normalizedpersonalPoints = player.personalPoints / matches;

            // 가중 합산
            const xG =
              0.4 * normalizedGoals +
              0.3 * normalizedAssists +
              0.2 * normalizedCleanSheets +
              0.05 * normalizedWinRate +
              0.05 * normalizedpersonalPoints;

            return { ...player, xG };
          });

          // xG 스케일링 (최대값 1)
          const maxXG = Math.max(...playersData.map((p) => p.xG), 1); // 0 방지
          playersData = playersData.map((player) => ({
            ...player,
            xG: Math.min((player.xG / maxXG).toFixed(3), 1.0),
          }));

          setMomPlayers(playersData);
        }
      } catch (error) {
        console.error('MOM 데이터 불러오기 오류:', error);
      }
    };
    fetchMOM();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'schedules'));
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date:
            doc.data().date instanceof Timestamp
              ? new Date(doc.data().date.seconds * 1000)
              : new Date(doc.data().date),
        }));
        setSchedules(fetched);
      } catch (error) {
        console.error('일정 불러오기 오류:', error);
      }
    };
    fetchSchedules();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersRef = collection(db, 'players');
        const snapshot = await getDocs(playersRef);
        const playersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        playersData.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
        setPlayers(playersData);
      } catch (error) {
        console.error('플레이어 데이터 fetch 중 오류:', error);
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      const totalGoals = players.reduce((sum, player) => sum + (player.goals || 0), 0);
      const totalAssists = players.reduce((sum, player) => sum + (player.assists || 0), 0);
      const totalCleanSheets = players.reduce((sum, player) => sum + (player.cleanSheets || 0), 0);
      const totalGames = players.reduce((sum, player) => sum + (player.matches || 0), 0);

      const attackpersonalPoints = totalGoals + totalAssists;

      setStats({
        members: players.length,
        totalGoals,
        totalAssists,
        totalCleanSheets,
        totalGames,
        attackpersonalPoints,
      });

      const latestPlayer = players[0];
      if (latestPlayer && latestPlayer.updatedAt) {
        setLastUpdated(new Date(latestPlayer.updatedAt.seconds * 1000));
      }
    }
  }, [players]);

  const onDateChange = (date) => setSelectedDate(date);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleText.trim()) {
      alert('일정 내용을 입력해주세요.');
      return;
    }
    try {
      await addDoc(collection(db, 'schedules'), {
        date: selectedDate,
        text: scheduleText.trim(),
      });
      setSchedules((prev) => [
        ...prev,
        { date: selectedDate, text: scheduleText.trim() },
      ]);
      setScheduleText('');
      alert('일정이 추가되었습니다.');
    } catch (error) {
      console.error('일정 추가 오류:', error);
      alert('일정을 추가하는 데 문제가 발생했습니다.');
    }
  };

  // 선택한 날짜의 일정 필터링
  const getSchedulesForSelectedDate = () => {
    return schedules.filter(
      (schedule) =>
        schedule.date && format(schedule.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
  };

  // 오늘 날짜 기준 다가오는 일정
  const today = new Date();
  const upcomingSchedules = schedules
    .filter((schedule) => schedule.date > today)
    .sort((a, b) => a.date - b.date)
    .slice(0, 2);

  return (
    <S.HomeContainer>
      <S.ContentWrapper>
        <S.HeroSection>
          <S.HeroContent>
            <S.HeroTitle>
              더 쉽게
              <br />
              더 즐겁게
              <br />
              축구하세요
            </S.HeroTitle>
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
          <div
            style={{
              textAlign: 'right',
              width: '100%',
              fontSize: '14px',
              color: '#4e5968',
              marginTop: '-24px',
              marginBottom: '40px',
            }}
          >
            마지막 업데이트: {lastUpdated.toLocaleDateString('ko-KR')}{' '}
            {lastUpdated.toLocaleTimeString('ko-KR')}
          </div>
        )}

        {/* MOM 플레이어 섹션 */}
        <div style={{ marginBottom: '60px', width: '100%' }}>
          <S.MomSectionTitle>
            <img src={`${process.env.PUBLIC_URL}/mom.png`} alt="Mom Icon" />
            M.O.M 플레이어
          </S.MomSectionTitle>

          {showHint && <S.SwipeHint>순위를 더 보려면 옆으로 넘겨주세요! →</S.SwipeHint>}
          <S.MomPlayersContainer ref={momRef} isScrollable={momPlayers.length > 3}>
            {momPlayers.length > 0 ? (
              momPlayers.map((player, index) => (
                <S.PlayerCard key={index}>
                  <S.PlayerHeader>
                    <S.PlayerContainer>
                      <S.PlayerRankBadge>
                        <S.TrophyIcon
                          src={`${process.env.PUBLIC_URL}/trophy.png`}
                          alt="Trophy Icon"
                        />
                        <S.PlayerRank>{player.rankText || '순위 미정'}</S.PlayerRank>
                      </S.PlayerRankBadge>
                      <S.PlayerScore title="누적 MOM점수">{player.momScore}</S.PlayerScore>
                    </S.PlayerContainer>
                    <S.PlayerName>{player.name}</S.PlayerName>
                  </S.PlayerHeader>

                  <S.PositionTags>
                    {player.formations &&
                      player.formations.map((pos, idx) => (
                        <S.PositionTag key={idx} position={pos}>
                          {pos}
                        </S.PositionTag>
                      ))}
                  </S.PositionTags>
                  <S.WhiteDivider />

                  <S.StatRow>
                    </S.StatRow>
                  <S.StatRow>
                    <S.StatLabel>골</S.StatLabel>
                    <S.StatLabel>{player.goals}</S.StatLabel>
                  </S.StatRow>
                  <S.StatRow>
                    <S.StatLabel>도움</S.StatLabel>
                    <S.StatLabel>{player.assists}</S.StatLabel>
                  </S.StatRow>
                  <S.StatRow>
                    <S.StatLabel>클린시트</S.StatLabel>
                    <S.StatLabel>{player.cleanSheets}</S.StatLabel>
                  </S.StatRow>
                  <S.StatRow>
                    <S.StatLabel>경기수</S.StatLabel>
                    <S.StatLabel>{player.matches}</S.StatLabel>
                  </S.StatRow>
                  <S.StatRow>
                    <S.StatLabel title="승률">승률</S.StatLabel>
                    <S.StatLabel title="승률">{player.winRate}%</S.StatLabel>
                  </S.StatRow>
                  <S.StatRow>
                    <S.StatLabel title="승점">승점</S.StatLabel>
                    <S.StatLabel title="승점">{player.personalPoints}</S.StatLabel>
                  </S.StatRow>
                  <S.StatRow>
                    <S.StatLabel title="승리 기여도">WAR</S.StatLabel>
                    <S.StatLabel title="승리 기여도">{player.xG}</S.StatLabel>
                  </S.StatRow>
                </S.PlayerCard>
              ))
            ) : (
              <p>MOM 플레이어가 없습니다.</p>
            )}
          </S.MomPlayersContainer>
          {showEnd && <S.EndMessage>MOM 순위는 여기까지입니다.</S.EndMessage>}
        </div>

        <S.ScheduleSection>
          <S.ScheduleHeader>📅 축구 일정 보기</S.ScheduleHeader>
          <S.StyledCalendar
  value={selectedDate}
  onChange={onDateChange}
  tileContent={({ date, view }) => {
    if (view === 'month') {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const hasSchedule = schedules.some(
        (schedule) =>
          schedule.date &&
          format(schedule.date, 'yyyy-MM-dd') === formattedDate
      );
      return hasSchedule ?  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      ⚽
    </span> : null;
    }
    return null;
  }}
/>

          <div style={{ marginTop: '24px' }}>
            <strong>{format(selectedDate, 'yyyy년 MM월 dd일')} 일정</strong>
            <S.ScheduleList>
              {getSchedulesForSelectedDate().length > 0 ? (
                getSchedulesForSelectedDate().map((item, index) => (
                  <S.ScheduleItem key={index}>{item.text}</S.ScheduleItem>
                ))
              ) : (
                <S.ScheduleItem>일정 없음</S.ScheduleItem>
              )}
            </S.ScheduleList>
          </div>

          <div style={{ marginTop: '24px' }}>
            <strong>다가오는 일정</strong>
            <S.ScheduleList>
              {upcomingSchedules.length > 0 ? (
                upcomingSchedules.map((schedule, index) => (
                  <S.ScheduleItem key={index}>
                    {format(schedule.date, 'yyyy년 MM월 dd일 (E)')} - {schedule.text}
                  </S.ScheduleItem>
                ))
              ) : (
                <S.ScheduleItem>다가오는 일정이 없습니다.</S.ScheduleItem>
              )}
            </S.ScheduleList>
          </div>
        </S.ScheduleSection>
      </S.ContentWrapper>
    </S.HomeContainer>
  );
};

export default Home;