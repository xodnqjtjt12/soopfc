import React, { useEffect, useState } from 'react';
import { db } from '../App';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import {
  VodContainer,
  Sidebar,
  SidebarTitle,
  DateList,
  DateItem,
  MainContent,
  PageTitle,
  QuarterSection,
  QuarterTitle,
  VodList,
  VodItem,
  VodTitle,
  GameTime,
  VideoWrapper,
  FilterBar,
  SelectWrapper,
  LoadingIndicator,
  EmptyState,
  VideoTypeTag,
  VideoControls,
} from './VodCss';

function VodPage() {
  const [vods, setVods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredVods, setFilteredVods] = useState([]);
  const [uniqueQuarters, setUniqueQuarters] = useState([]);

  // Real-time data fetching
  useEffect(() => {
    const q = query(collection(db, 'vods'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          setLoading(true);
          const vodData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date || new Date().toISOString().split('T')[0],
            quarter: doc.data().quarter || '1', // quarter를 문자열로 유지
            time: doc.data().time || '00:00',
            videoType: doc.data().videoType || 'vod',
          }));

          // Extract unique dates
          const uniqueDates = [...new Set(vodData.map((vod) => vod.date))]
            .sort()
            .reverse();

          setVods(vodData);
          setDates(uniqueDates);

          // Select the first date if available
          if (uniqueDates.length > 0 && !selectedDate) {
            setSelectedDate(uniqueDates[0]);
          }
        } catch (error) {
          console.error('Error fetching VODs:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Filter VODs and update quarters by selected date
  useEffect(() => {
    if (selectedDate) {
      const filtered = vods.filter((vod) => vod.date === selectedDate);
      setFilteredVods(filtered);
      // Update unique quarters based on selected date
      const quarters = [...new Set(filtered.map((vod) => vod.quarter))].sort((a, b) => {
        // 숫자 쿼터(1~4)를 먼저 정렬, 그 외는 문자열로 정렬
        const isANumber = /^\d+$/.test(a);
        const isBNumber = /^\d+$/.test(b);
        if (isANumber && isBNumber) return parseInt(a) - parseInt(b);
        if (isANumber) return -1;
        if (isBNumber) return 1;
        return a.localeCompare(b);
      });
      setUniqueQuarters(quarters);
    } else {
      setFilteredVods(vods);
      // Use all quarters if no date is selected
      const quarters = [...new Set(vods.map((vod) => vod.quarter))].sort((a, b) => {
        const isANumber = /^\d+$/.test(a);
        const isBNumber = /^\d+$/.test(b);
        if (isANumber && isBNumber) return parseInt(a) - parseInt(b);
        if (isANumber) return -1;
        if (isBNumber) return 1;
        return a.localeCompare(b);
      });
      setUniqueQuarters(quarters);
    }
  }, [selectedDate, vods]);

  // Group VODs by quarter
  const getQuarterVods = (quarter) => {
    return filteredVods.filter((vod) => vod.quarter === quarter);
  };

  // Format date for display
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

  // Get appropriate CSS class for video type
  const getVideoWrapperClass = (videoType) => {
    switch (videoType?.toLowerCase()) {
      case 'catch':
        return 'catch-video';
      case 'shorts':
        return 'shorts-video';
      default:
        return '';
    }
  };

  if (loading) {
    return <LoadingIndicator>VOD 목록을 불러오는 중...</LoadingIndicator>;
  }

  return (
    <VodContainer>
      {/* Sidebar - Date List */}
      <Sidebar>
        <SidebarTitle>경기 날짜</SidebarTitle>
        <DateList>
          {dates.map((date) => (
            <DateItem
              key={date}
              active={selectedDate === date}
              onClick={() => setSelectedDate(date)}
            >
              {formatDate(date)}
            </DateItem>
          ))}
        </DateList>
      </Sidebar>

      {/* Main Content */}
      <MainContent>
        <PageTitle>축구 경기 VOD</PageTitle>

        {/* Filter Bar */}
        <FilterBar>
          <div>선택된 날짜: {formatDate(selectedDate)}</div>
          <SelectWrapper>
            <select
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              {dates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </FilterBar>

        {/* Quarter Sections */}
        {uniqueQuarters.map((quarter) => (
          <QuarterSection key={quarter}>
            <QuarterTitle>{quarter}</QuarterTitle>
            <VodList>
              {getQuarterVods(quarter).length > 0 ? (
                getQuarterVods(quarter).map((vod) => (
                  <VodItem key={vod.id}>
                    <VodTitle>
                      {vod.title || '경기 영상'}
                      {vod.videoType && vod.videoType !== 'vod' && (
                        <VideoTypeTag type={vod.videoType}>
                          {vod.videoType.toUpperCase()}
                        </VideoTypeTag>
                      )}
                      <GameTime>{vod.time}</GameTime>
                    </VodTitle>
                    <VideoWrapper className={getVideoWrapperClass(vod.videoType)}>
                      {vod.link && (
                        <iframe
                          src={vod.link}
                          title={vod.title || 'VOD 영상'}
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          frameBorder="0"
                        />
                      )}
                    </VideoWrapper>
                    {(vod.videoType === 'catch' || vod.videoType === 'shorts') && (
                      <VideoControls>
                        <a href={vod.link} target="_blank" rel="noopener noreferrer">
                          원본 링크에서 보기
                        </a>
                      </VideoControls>
                    )}
                  </VodItem>
                ))
              ) : (
                <EmptyState>{quarter} VOD가 없습니다dd.</EmptyState>
              )}
            </VodList>
          </QuarterSection>
        ))}
      </MainContent>
    </VodContainer>
  );
}

export default VodPage;