import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../App';
import { useNavigate } from 'react-router-dom';
import * as S from './PlayerMonthAwardCss';

// 포메이션 통일 함수
const unifyPosition = (position) => {
  const positionMap = {
    'CB1': 'CB',
    'CB2': 'CB',
    'CDM1': 'CDM',
    'CDM2': 'CDM',
    'CM1': 'CM',
    'CM2': 'CM',
  };
  return positionMap[position] || position;
};

// 가장 많이 사용한 포지션 계산
const calculateMostFrequentPosition = async (playerName) => {
  const matchesQuery = query(collection(db, 'matches'));
  const matchesSnapshot = await getDocs(matchesQuery);
  const playerPositions = {};

  matchesSnapshot.forEach((matchDoc) => {
    const quarters = matchDoc.data().quarters || [];
    quarters.forEach((quarter) => {
      quarter.teams.forEach((team) => {
        team.players.forEach((player) => {
          if (player.name === playerName) {
            const unifiedPos = unifyPosition(player.position);
            playerPositions[unifiedPos] = (playerPositions[unifiedPos] || 0) + 1;
          }
        });
      });
    });
  });

  const positionCounts = Object.entries(playerPositions);
  if (positionCounts.length === 0) return 'N/A';

  const sortedPositions = positionCounts.sort((a, b) => b[1] - a[1]);
  const maxCount = sortedPositions[0][1];
  const mostFrequent = sortedPositions
    .filter(([_, count]) => count === maxCount)
    .map(([pos]) => pos);

  return mostFrequent.join(', ');
};

// 팀 이름 정규화
const normalizeTeamName = (name) => {
  return name ? name.trim().toLowerCase() : '';
};

// 선수 통계 계산
const getPlayerStats = async (playerName, year, month) => {
  let monthlyGoals = 0;
  let monthlyAssists = 0;
  let monthlyMatches = 0;
  let monthlyCleanSheets = 0;
  let goalPartners = [];
  let assistPartners = [];

  const queryMonthString = `${year}-${String(month).padStart(2, '0')}`;
  const matchesQuery = query(
    collection(db, 'matches'),
    where('date', '>=', queryMonthString),
    where('date', '<=', queryMonthString + '~')
  );
  const matchesSnapshot = await getDocs(matchesQuery);

  matchesSnapshot.forEach((doc) => {
    const matchData = doc.data();
    let played = false;
    let playerTeam = null;
    let isGoalkeeper = false;
    let isDefender = false;

    matchData.quarters?.forEach((q) => {
      q.teams.forEach((t) => {
        t.players.forEach((p) => {
          if (p.name === playerName) {
            played = true;
            playerTeam = t;
            const unifiedPos = unifyPosition(p.position);
            isGoalkeeper = ['GK', 'GKP'].includes(unifiedPos);
            isDefender = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(unifiedPos);
          }
        });
      });

      if (played) {
        monthlyMatches++;
        if ((isGoalkeeper || isDefender) && playerTeam) {
          const opponentTeam = q.teams.find(t => normalizeTeamName(t.name) !== normalizeTeamName(playerTeam.name));
          const opponentGoals = (q.goalAssistPairs?.filter(
            p => normalizeTeamName(p.goal.team) === normalizeTeamName(opponentTeam?.name)
          ).length || 0) + (q.ownGoals?.filter(
            og => normalizeTeamName(og.team) === normalizeTeamName(playerTeam?.name)
          ).length || 0);
          if (opponentGoals === 0) {
            monthlyCleanSheets++;
          }
        }

        q.goalAssistPairs?.forEach((pair) => {
          if (pair.goal.player === playerName) {
            monthlyGoals++;
            if (pair.assist.player) {
              goalPartners.push(pair.assist.player);
            }
          }
          if (pair.assist.player === playerName) {
            monthlyAssists++;
            assistPartners.push(pair.goal.player);
          }
        });
      }
    });
  });

  const playerQuery = query(collection(db, 'players'), where('name', '==', playerName));
  const playerSnapshot = await getDocs(playerQuery);
  let totalGoals = 0;
  let totalAssists = 0;
  let totalMatches = 0;
  let totalCleanSheets = 0;
  let position = 'N/A';

  if (!playerSnapshot.empty) {
    const playerData = playerSnapshot.docs[0].data();
    totalGoals = playerData.goals || 0;
    totalAssists = playerData.assists || 0;
    totalMatches = playerData.matches || 0;
    totalCleanSheets = playerData.cleanSheets || 0;
    position = await calculateMostFrequentPosition(playerName);
  }

  goalPartners = [...new Set(goalPartners.filter(Boolean))].join(', ') || '없음';
  assistPartners = [...new Set(assistPartners.filter(Boolean))].join(', ') || '없음';

  return {
    monthlyGoals,
    monthlyAssists,
    monthlyMatches,
    monthlyCleanSheets,
    totalGoals,
    totalAssists,
    totalMatches,
    totalCleanSheets,
    position,
    goalPartners,
    assistPartners
  };
};

// 날짜 포맷팅
const formatYearMonth = (year, month) => {
  return `${year}년 ${month}월`;
};

const PlayerMonthAward = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentYearMonth, setCurrentYearMonth] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();

  // 현재 날짜 기준 초기 설정
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        setLoading(true);
        const awardsSnapshot = await getDocs(collection(db, 'monthlyAwards'));
        const awardsData = await Promise.all(
          awardsSnapshot.docs.map(async (doc) => {
            const award = { id: doc.id, ...doc.data() };
            const playerStats = await getPlayerStats(award.name, award.year, award.month);
            return { ...award, ...playerStats };
          })
        );

        // 연도와 월로 정렬 (최신순)
        awardsData.sort((a, b) => b.year - a.year || b.month - a.month);

        // 사용 가능한 연도-월 목록 생성
        const months = [...new Set(awardsData.map(a => `${a.year}-${a.month}`))].sort((a, b) => {
          const [yearA, monthA] = a.split('-').map(Number);
          const [yearB, monthB] = b.split('-').map(Number);
          return yearB - yearA || monthB - monthA;
        });

        setAwards(awardsData);
        setAvailableMonths(months);

        // 현재 연도와 월 설정 (2025년 9월 기준)
        const now = new Date(2025, 8, 17); // 2025년 9월 17일
        let year = now.getFullYear();
        let month = now.getMonth() + 1;

        // 가장 최근 데이터가 있는 달 찾기
        let selectedYearMonth = null;
        for (let i = 0; i < 12; i++) {
          const ym = `${year}-${month.toString().padStart(2, '0')}`;
          if (months.includes(ym)) {
            selectedYearMonth = ym;
            break;
          }
          month--;
          if (month < 1) {
            month = 12;
            year--;
          }
        }

        // 데이터가 없으면 이전 달로 이동
        if (!selectedYearMonth) {
          month = now.getMonth();
          year = now.getFullYear();
          selectedYearMonth = `${year}-${month.toString().padStart(2, '0')}`;
        }

        setCurrentYearMonth(selectedYearMonth);
      } catch (err) {
        console.error('[ERROR-AWARDS] 데이터 불러오기 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  // 네비게이션 핸들러
  const handlePrevMonth = () => {
    const currentIndex = availableMonths.indexOf(currentYearMonth);
    if (currentIndex < availableMonths.length - 1) {
      setCurrentYearMonth(availableMonths[currentIndex + 1]);
    } else {
      const [year, month] = currentYearMonth.split('-').map(Number);
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      setCurrentYearMonth(`${prevYear}-${prevMonth.toString().padStart(2, '0')}`);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = availableMonths.indexOf(currentYearMonth);
    if (currentIndex > 0) {
      setCurrentYearMonth(availableMonths[currentIndex - 1]);
    } else {
      const [year, month] = currentYearMonth.split('-').map(Number);
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      setCurrentYearMonth(`${nextYear}-${nextMonth.toString().padStart(2, '0')}`);
    }
  };

  // 날짜 선택기 핸들러
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const handleSelectMonth = (ym) => {
    setCurrentYearMonth(ym);
    setShowDatePicker(false);
  };

  const [currentYear, currentMonth] = currentYearMonth
    ? currentYearMonth.split('-').map(Number)
    : [2025, 9];
  const currentAward = awards.find(
    (award) => award.year === currentYear && award.month === currentMonth
  );

  const hasPrevMonth = availableMonths.length > 0;
  const hasNextMonth = availableMonths.length > 0 && availableMonths[0] !== currentYearMonth;

  if (loading) {
    return (
      <S.Loading>
        <div className="spinner"></div>
        <div className="text">로딩 중...</div>
      </S.Loading>
    );
  }

  if (error) return <S.ErrorMessage>{error}</S.ErrorMessage>;

  return (
    <S.Container>
      <S.Header>
        <S.Title>🏆 이달의 선수상 🏆</S.Title>
        <S.Subtitle>SOOP FC의 뛰어난 선수를 만나보세요</S.Subtitle>
      </S.Header>

      <S.DateNavigation>
        <S.NavButton onClick={handlePrevMonth} disabled={!hasPrevMonth}>
          ←
        </S.NavButton>
        <S.DateDisplay onClick={toggleDatePicker}>
          {formatYearMonth(currentYear, currentMonth)}
        </S.DateDisplay>
        <S.NavButton onClick={handleNextMonth} disabled={!hasNextMonth}>
          →
        </S.NavButton>
      </S.DateNavigation>

      {showDatePicker && (
        <S.DatePicker>
          {availableMonths.map((ym) => {
            const [y, m] = ym.split('-').map(Number);
            return (
              <S.DateOption
                key={ym}
                onClick={() => handleSelectMonth(ym)}
                className={ym === currentYearMonth ? 'selected' : ''}
              >
                {formatYearMonth(y, m)}
              </S.DateOption>
            );
          })}
          {availableMonths.length === 0 && (
            <S.DateOption disabled>사용 가능한 달이 없습니다.</S.DateOption>
          )}
        </S.DatePicker>
      )}

      {currentAward ? (
        <S.AwardCard>
          <S.AwardHeader>
            <S.AwardYearMonth>⭐ {currentAward.year}년 {currentAward.month}월 ⭐</S.AwardYearMonth>
            <S.Trophy>🏆</S.Trophy>
            <S.AwardPlayerName>{currentAward.name}</S.AwardPlayerName>
          </S.AwardHeader>

          <S.AwardDescription>{currentAward.description}</S.AwardDescription>

          <S.StatsContainer>
            <S.StatsBox>
              <S.StatsTitle>🌟 {currentAward.month}월 기록 🌟</S.StatsTitle>
              <S.Stat>
                <S.StatLabel>경기</S.StatLabel>
                <S.StatValue>{currentAward.monthlyMatches}경기</S.StatValue>
              </S.Stat>
              <S.Stat>
                <S.StatLabel>골</S.StatLabel>
                <S.StatValue>{currentAward.monthlyGoals}골</S.StatValue>
              </S.Stat>
              <S.Stat>
                <S.StatLabel>도움</S.StatLabel>
                <S.StatValue>{currentAward.monthlyAssists}개</S.StatValue>
              </S.Stat>
              <S.Stat>
                <S.StatLabel>클린시트</S.StatLabel>
                <S.StatValue>{currentAward.monthlyCleanSheets}회</S.StatValue>
              </S.Stat>
              <S.Stat>
                <S.StatLabel>득점 파트너</S.StatLabel>
                <S.StatValue>{currentAward.goalPartners}</S.StatValue>
              </S.Stat>
              <S.Stat>
                <S.StatLabel>도움 파트너</S.StatLabel>
                <S.StatValue>{currentAward.assistPartners}</S.StatValue>
              </S.Stat>
            </S.StatsBox>
            <S.StatsBox>
              <S.StatsTitle>📊 통산 기록 📊</S.StatsTitle>
              <S.Stat>
                <S.StatLabel>포지션</S.StatLabel>
                <S.StatValue>{currentAward.position}</S.StatValue>
              </S.Stat>
              <S.Stat>
                <S.StatLabel>경기</S.StatLabel>
                <S.StatValue>{currentAward.totalMatches}경기</S.StatValue>
              </S.Stat>
              <S.Stat>
                <S.StatLabel>골</S.StatLabel>
                <S.StatValue>{currentAward.totalGoals}골</S.StatValue>
              </S.Stat>
              <S.Stat>
                <S.StatLabel>도움</S.StatLabel>
                <S.StatValue>{currentAward.totalAssists}개</S.StatValue>
              </S.Stat>
              <S.Stat>
                <S.StatLabel>클린시트</S.StatLabel>
                <S.StatValue>{currentAward.totalCleanSheets}회</S.StatValue>
              </S.Stat>
            </S.StatsBox>
          </S.StatsContainer>
          <S.GradeButton
            onClick={() => navigate(`/player-history/${encodeURIComponent(currentAward.name)}`)}
          >
            선수 기록 더보기
          </S.GradeButton>
        </S.AwardCard>
      ) : (
        <S.NoAwards>
          <div className="icon">🌟</div>
          <div className="text">
            {formatYearMonth(currentYear, currentMonth)} 수상 내역이 없습니다.
          </div>
        </S.NoAwards>
      )}
    </S.Container>
  );
};

export default PlayerMonthAward;