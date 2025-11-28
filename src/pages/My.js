// src/pages/My.js - UI/UX 완전 깔끔 정리 + 중복 0% + 센스 레이아웃 최종판

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../App';

const FullScreen = styled.div`
  min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  h1 {
    font-size: 4.5rem;
    font-weight: 900;
    background: linear-gradient(to right, #60a5fa, #34d399, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 40px rgba(96, 165, 250, 0.6);
  }
  
  .line {
    height: 6px;
    width: 180px;
    // background: linear-gradient(to right, #fbbf24, #f59e0b, #ef4444);
    margin: 1rem auto;
    border-radius: 3px;
  }
`;

// PC 전용 레이아웃 (모바일에서는 아예 안 보임)
const DesktopOnly = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6rem;
    max-width: 1400px;
    width: 100%;
    align-items: start;
  }
`;

// 모바일 전용 레이아웃 (PC에서는 아예 안 보임)
const MobileOnly = styled.div`
  display: block;
  max-width: 420px;
  width: 100%;
  @media (min-width: 768px) {
    display: none;
  }
`;

// 공용 카드 디자인
const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;

  &::before {
    content: '';
    position: absolute;
    inset: -30px;
    // background: radial-gradient(circle, rgba(251,191,36,0.4), transparent 70%);
    filter: blur(40px);
    z-index: -1;
  }

//   .inner {
//     background: linear-gradient(to bottom, #1e293b, #0f172a, #020617);
//     // border: 4px solid #fbbf24;
//     border-radius: 24px;
//     overflow: hidden;
//     box-shadow: 0 30px 80px rgba(0,0,0,0.9);
//   }

  .top {
    // background: linear-gradient(to right, #fbbf24, #f59e0b, #ef4444);
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 900;
    color: black;
    font-size: 1.8rem;
  }

  .image {
    height: 420px;
    position: relative;
    // background: linear-gradient(to top, #000 0%, transparent 50%);
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      max-width: 88%;
      max-height: 88%;
      object-fit: contain;
      border-radius: 12px;
    }
  }

  .info {
    padding: 24px;
    text-align: center;
    // background: linear-gradient(to top, black, transparent);

    h2 {
      font-size: 3rem;
      font-weight: 900;
      color: white;
      margin: 0 0 8px;
    }
    .team { color: #fbbf24; font-weight: 900; font-size: 1.4rem; }
    .season { color: #94a3b8; font-size: 1rem; margin-top: 6px; }
  }
`;

// PC용 스탯 패널
const StatsPanel = styled.div`
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 3px solid #60a5fa;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.8);

  h3 {
    text-align: center;
    font-size: 2.8rem;
    font-weight: 900;
    color: white;
    margin-bottom: 2rem;
  }
  .line {
    height: 5px;
    width: 120px;
    background: linear-gradient(to right, #60a5fa, #22d3ee);
    margin: 0 auto 2.5rem;
    border-radius: 3px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    padding: 1.2rem 0;
    border-bottom: 1px solid rgba(96,165,250,0.3);
    &:last-child { border-bottom: none; }
  }
  .label { color: #cbd5e1; font-weight: 700; font-size: 1.5rem; }
  .value { font-size: 3.8rem; font-weight: 900; }
`;

// 모바일 뒤집기 카드
const FlipWrapper = styled.div`
  perspective: 1500px;
  cursor: pointer;
`;

const FlipCard = styled.div`
  position: relative;
  width: 100%;
  height: 680px;
  transform-style: preserve-3d;
  transition: transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform: ${props => props.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const BackFace = styled.div`
  position: absolute;
  top: 0; left: 0;
  width: 80%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #1e1b4b, #0f172a);
  border: 4px solid #60a5fa;
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    inset: -30px;
    background: radial-gradient(circle, rgba(96,165,250,0.5), transparent 70%);
    filter: blur(40px);
    z-index: -1;
  }

  .title {
    text-align: center;
    color: white;
    font-size: 2rem;
    font-weight: 900;
    margin-bottom: 2rem;
  }

  .grid {
    // flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .stat {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(96,165,250,0.4);
    border-radius: 16px;
    padding: 20px;
    text-align: center;

    .value { font-size: 3.5rem; font-weight: 900; }
    .label { color: #94a3b8; font-size: 1rem; margin-top: 8px; }
  }

  .hint {
    margin-top: 24px;
    padding: 18px;
    background: linear-gradient(to right, #60a5fa, #22d3ee);
    color: white;
    font-weight: 900;
    text-align: center;
    border-radius: 16px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse { 0%,100% {opacity:1} 50% {opacity:0.7} }
`;

export default function My() {
  const { playerName } = useParams();
  const navigate = useNavigate();
  const [playerInfo, setPlayerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerName) return navigate('/');
      try {
        const snap = await getDoc(doc(db, 'players', playerName));
        if (snap.exists()) setPlayerInfo(snap.data());
        else { alert('선수를 찾을 수 없습니다'); navigate('/'); }
      } catch (err) {
        console.error(err);
        alert('데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [playerName, navigate]);

  if (loading) return <FullScreen className="flex items-center justify-center text-5xl font-black text-white">카드 생성 중...</FullScreen>;
  if (!playerInfo) return null;

  const attackPoints = (playerInfo.goals || 0) + (playerInfo.assists || 0);
//   const rating = Math.min(99, Math.floor((playerInfo.winRate || 50) + 40));
  const playerImage = `/card/${playerName}.png`;

  return (
    <FullScreen>
      {/* <Header>
        <h1>SOOP FC</h1>
        <div className="line" />
      </Header> */}

      {/* PC 전용: 카드 + 스탯 */}
      <DesktopOnly>
        <Card>
          <div className="inner">
            <div className="top">
              {/* <div>{rating}</div> */}
              
            </div>
            <div className="image">
              <img src={playerImage} alt={playerName} onError={e => { e.target.onerror = null; e.target.src = "/card/SOOPLOGO.png"; }} />
            </div>
          
          </div>
        </Card>

        <StatsPanel>
          <h3>2025 시즌 기록</h3>
          <div className="line" />
          <div className="row"><span className="label">득점</span><span className="value" style={{color:'#4ade80'}}>{playerInfo.goals || 0}</span></div>
          <div className="row"><span className="label">어시</span><span className="value" style={{color:'#60a5fa'}}>{playerInfo.assists || 0}</span></div>
          <div className="row"><span className="label">클린시트</span><span className="value" style={{color:'#c084fc'}}>{playerInfo.cleanSheets || 0}</span></div>
          <div className="row"><span className="label">공격P</span><span className="value" style={{color:'#fbbf24'}}>{attackPoints}</span></div>
        </StatsPanel>
      </DesktopOnly>

      {/* 모바일 전용: 뒤집기 카드 */}
      <MobileOnly>
        <FlipWrapper onClick={() => setIsFlipped(!isFlipped)}>
          <FlipCard flipped={isFlipped}>
            {/* 앞면 */}
            <Card>
              <div className="inner">
                <div className="top">
                  {/* <div>{rating}</div> */}
                  {/* <div>SOOP</div> */}
                </div>
                <div className="image">
                  <img src={playerImage} alt={playerName} onError={e => { e.target.onerror = null; e.target.src = "/card/SOOPLOGO.png"; }} />
                </div>
                <div className="info">
                  <h2>{playerName}</h2>
                  {/* <div className="team">SOOP FC LEGEND</div>
                  <div className="season">SEASON 2025</div> */}
                </div>
             <div
  style={{
    padding: '20px 40px', // 상하 20px, 좌우 40px
    background: 'linear-gradient(to right, #60a5fa, #22d3ee)',
    color: 'white',
    textAlign: 'center',
    fontWeight: '900',
    animation: 'pulse 2s infinite',
  }}
>
  탭하여 능력치 보기
</div>
              </div>
            </Card>

            {/* 뒷면 */}
            <BackFace>
              <div className="title">2025 시즌 기록</div>
              <div className="grid">
                <div className="stat"><div className="value" style={{color:'#4ade80'}}>{playerInfo.goals || 0}</div><div className="label">득점</div></div>
                <div className="stat"><div className="value" style={{color:'#60a5fa'}}>{playerInfo.assists || 0}</div><div className="label">어시</div></div>
                <div className="stat"><div className="value" style={{color:'#c084fc'}}>{playerInfo.cleanSheets || 0}</div><div className="label">클린시트</div></div>
                <div className="stat"><div className="value" style={{color:'#fbbf24'}}>{attackPoints}</div><div className="label">공격P</div></div>
              </div>
              <div className="hint">탭하여 카드 보기</div>
            </BackFace>
          </FlipCard>
        </FlipWrapper>
      </MobileOnly>
    </FullScreen>
  );
}