// src/pages/PowerRankingAdmin.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../App';
import * as S from './PowerRankingAdmincss'; // 스타일드 컴포넌트를 PowerRankingAdmincss.js에서 가져옴

const PowerRankingAdmin = () => {
  const [players, setPlayers] = useState([]);
  const [rankedPlayers, setRankedPlayers] = useState([
    { player: null, rankText: '', isEditing: false, formations: [], isEditingFormations: false },
    { player: null, rankText: '', isEditing: false, formations: [], isEditingFormations: false },
    { player: null, rankText: '', isEditing: false, formations: [], isEditingFormations: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authenticated) {
      const fetchPlayers = async () => {
        setLoading(true);
        try {
          const playersRef = collection(db, 'players');
          const snapshot = await getDocs(playersRef);
          let playersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            position: doc.data().position || '포지션 미지정',
            matches: doc.data().matches || 0,
            goals: doc.data().goals || 0,
            assists: doc.data().assists || 0,
            cleanSheets: doc.data().cleanSheets || 0,
            winRate: doc.data().winRate || 0,
            personalPoints: doc.data().personalPoints || 0,
            momScore: doc.data().momScore || 0,
          }));

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

          setPlayers(playersData);
        } catch (error) {
          console.error('플레이어 데이터 fetch 중 오류:', error);
          alert('플레이어 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      fetchPlayers();
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) {
      const fetchMOMData = async () => {
        setLoading(true);
        try {
          const momRef = doc(db, 'MOM', 'current');
          const momDoc = await getDoc(momRef);
          if (momDoc.exists()) {
            const playersData = momDoc.data().players || [];
            setRankedPlayers(
              playersData.map((p) => ({
                player: p,
                rankText: p.rankText || '',
                isEditing: false,
                formations: p.formations || [],
                isEditingFormations: false,
              }))
            );
          }
        } catch (error) {
          console.error('MOM 데이터 fetch 중 오류:', error);
          alert('MOM 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      fetchMOMData();
    }
  }, [authenticated]);

  const handlePasswordSubmit = () => {
    if (password === 'alves') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('비밀번호가 틀렸습니다. 다시 시도해주세요.');
    }
  };

  const handleSelectPlayer = (player) => {
    const isSelected = rankedPlayers.some((p) => p.player && p.player.id === player.id);
    if (!isSelected) {
      const emptyIndex = rankedPlayers.findIndex((p) => p.player === null);
      if (emptyIndex !== -1) {
        setRankedPlayers(
          rankedPlayers.map((p, index) =>
            index === emptyIndex
              ? { player, rankText: '', isEditing: false, formations: [], isEditingFormations: false }
              : p
          )
        );
      } else {
        setRankedPlayers([
          ...rankedPlayers,
          { player, rankText: '', isEditing: false, formations: [], isEditingFormations: false },
        ]);
      }
    }
  };

  const handleRankTextChange = (index, newText) => {
    setRankedPlayers(rankedPlayers.map((p, i) => (i === index ? { ...p, rankText: newText } : p)));
  };

  const toggleEditMode = (index) => {
    setRankedPlayers(rankedPlayers.map((p, i) => (i === index ? { ...p, isEditing: !p.isEditing } : p)));
  };

  const toggleFormationEditMode = (index) => {
    setRankedPlayers(
      rankedPlayers.map((p, i) =>
        i === index ? { ...p, isEditingFormations: !p.isEditingFormations } : p
      )
    );
  };

  const handleFormationChange = (index, formation) => {
    setRankedPlayers(
      rankedPlayers.map((p, i) => {
        if (i === index) {
          const newFormations = p.formations.includes(formation)
            ? p.formations.filter((f) => f !== formation)
            : [...p.formations, formation];
          return { ...p, formations: newFormations };
        }
        return p;
      })
    );
  };

  const removePlayer = (index) => {
    setRankedPlayers(
      rankedPlayers.map((p, i) =>
        i === index
          ? { player: null, rankText: '', isEditing: false, formations: [], isEditingFormations: false }
          : p
      )
    );
  };

  const resetAllPlayers = () => {
    setRankedPlayers(
      rankedPlayers.map(() => ({
        player: null,
        rankText: '',
        isEditing: false,
        formations: [],
        isEditingFormations: false,
      }))
    );
  };

  const saveToMOM = async () => {
    const playersData = rankedPlayers
      .filter((p) => p.player !== null)
      .map((p) => ({
        name: p.player.name || '',
        position: p.player.position || '포지션 미지정',
        team: p.player.team || '',
        id: p.player.id || '',
        rankText: p.rankText || '',
        matches: p.player.matches || 0,
        goals: p.player.goals || 0,
        assists: p.player.assists || 0,
        cleanSheets: p.player.cleanSheets || 0,
        winRate: p.player.winRate || 0,
        personalPoints: p.player.personalPoints || 0,
        xG: p.player.xG || 0,
        formations: p.formations || [],
        momScore: p.player.momScore || 0,
      }));

    if (playersData.length >= 3) {
      setLoading(true);
      try {
        const momRef = doc(db, 'MOM', 'current');
        await setDoc(momRef, {
          players: playersData,
          updatedAt: new Date().toISOString(),
        });
        alert('MOM에 저장되었습니다!');
      } catch (error) {
        console.error('MOM 저장 중 오류:', error);
        alert(`저장 중 오류: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      alert('최소 3명을 선택해야 저장할 수 있습니다.');
    }
  };

  const addSlot = () => {
    setRankedPlayers([
      ...rankedPlayers,
      { player: null, rankText: '', isEditing: false, formations: [], isEditingFormations: false },
    ]);
  };

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authenticated) {
    return (
      <S.PasswordContainer>
        <h2>비밀번호를 입력하세요</h2>
        <S.PasswordInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handlePasswordSubmit();
            }
          }}
          placeholder="비밀번호"
        />
        <S.SubmitButton onClick={handlePasswordSubmit}>제출</S.SubmitButton>
        {error && <S.ErrorMessage>{error}</S.ErrorMessage>}
      </S.PasswordContainer>
    );
  }

  return (
    <S.Container>
      <S.Header>Power Ranking Admin</S.Header>

      <S.SubHeader>선택된 플레이어</S.SubHeader>
      <S.SelectedPlayersContainer>
        {rankedPlayers.map((p, index) => (
          <S.SelectedPlayerCard key={index}>
            {p.player ? (
              <>
                {p.isEditing ? (
                  <S.RankInput
                    type="text"
                    value={p.rankText}
                    onChange={(e) => handleRankTextChange(index, e.target.value)}
                    placeholder="순위 입력 (예: 공동 1위)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        toggleEditMode(index);
                      }
                    }}
                  />
                ) : (
                  <S.PlayerName>{p.rankText || '순위 미정'} {p.player.name}</S.PlayerName>
                )}
                <S.PlayerStats>
                  경기수: {p.player.matches} | 골: {p.player.goals} | 어시: {p.player.assists} | 클린시트:{' '}
                  {p.player.cleanSheets} | 승률: {p.player.winRate}% | 승점: {p.player.personalPoints} | xG: {p.player.xG} | mom누적점수: {p.player.momScore}
                </S.PlayerStats>
                <S.PlayerStats>
                  포메이션: {p.formations.length > 0 ? p.formations.join(', ') : '지정 안됨'}
                </S.PlayerStats>
                {p.isEditingFormations && (
                  <S.FormationContainer>
                    <S.FormationCheckbox>
                      <input
                        type="checkbox"
                        checked={p.formations.includes('FW')}
                        onChange={() => handleFormationChange(index, 'FW')}
                      />
                      FW
                    </S.FormationCheckbox>
                    <S.FormationCheckbox>
                      <input
                        type="checkbox"
                        checked={p.formations.includes('MF')}
                        onChange={() => handleFormationChange(index, 'MF')}
                      />
                      MF
                    </S.FormationCheckbox>
                    <S.FormationCheckbox>
                      <input
                        type="checkbox"
                        checked={p.formations.includes('DF')}
                        onChange={() => handleFormationChange(index, 'DF')}
                      />
                      DF
                    </S.FormationCheckbox>
                  </S.FormationContainer>
                )}
                <S.EditButton onClick={() => toggleEditMode(index)}>
                  {p.isEditing ? '수정 완료' : '순위 수정'}
                </S.EditButton>
                <S.FormationEditButton onClick={() => toggleFormationEditMode(index)}>
                  {p.isEditingFormations ? '포메이션 수정 완료' : '포메이션 수정'}
                </S.FormationEditButton>
                <S.RemoveButton onClick={() => removePlayer(index)}>선택 해제</S.RemoveButton>
              </>
            ) : (
              <S.PlayerName style={{ color: '#999' }}>선택 필요</S.PlayerName>
            )}
          </S.SelectedPlayerCard>
        ))}
        <S.AddSlotButton onClick={addSlot}>+ 공동 순위 추가</S.AddSlotButton>
        <S.ResetButton onClick={resetAllPlayers}>모두 초기화</S.ResetButton>
      </S.SelectedPlayersContainer>

      <S.SaveButton
        onClick={saveToMOM}
        disabled={rankedPlayers.filter((p) => p.player !== null).length < 3 || loading}
      >
        {loading ? '저장 중...' : 'MOM에 저장'}
      </S.SaveButton>

      <S.SubHeader>플레이어 목록 ({filteredPlayers.length}명)</S.SubHeader>
      <S.SearchInput
        type="text"
        placeholder="플레이어 이름 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading && <p>로딩 중...</p>}
      <S.PlayersList>
        {filteredPlayers.map((player) => (
          <S.PlayerCard
            key={player.id}
            onClick={() => handleSelectPlayer(player)}
            selected={rankedPlayers.some((p) => p.player && p.player.id === player.id)}
          >
            <S.PlayerName>{player.name}</S.PlayerName>
            <S.PlayerStats>
              경기수: {player.matches} | 골: {player.goals} | 어시: {player.assists} | 클린시트: {player.cleanSheets} |
              승률: {player.winRate}% | 승점: {player.personalPoints} | xG: {player.xG} | mom누적점수: {player.momScore}
            </S.PlayerStats>
          </S.PlayerCard>
        ))}
      </S.PlayersList>
    </S.Container>
  );
};

export default PowerRankingAdmin;