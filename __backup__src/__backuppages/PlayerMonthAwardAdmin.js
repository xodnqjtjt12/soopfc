import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, addDoc, doc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../App';
import * as S from './PlayerMonthAwardAdminCss';

const PlayerMonthAwardAdmin = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [voteCandidates, setVoteCandidates] = useState([]);
    const [statCandidates, setStatCandidates] = useState([]);
    
    const [registeredAwards, setRegisteredAwards] = useState([]);
    const [editingAward, setEditingAward] = useState(null);

    useEffect(() => {
        fetchRegisteredAwards();
    }, []);

    const fetchRegisteredAwards = async () => {
        const awardsSnapshot = await getDocs(collection(db, 'monthlyAwards'));
        const awards = awardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        awards.sort((a, b) => b.year - a.year || b.month - a.month);
        setRegisteredAwards(awards);
    };

    const handleFetchCandidates = async () => {
        setLoading(true);
        setError('');
        setVoteCandidates([]);
        setStatCandidates([]);

        try {
            // Fetch vote candidates (Most Voted Players)
            const voteCounts = {};
            const monthStringPadded = String(month).padStart(2, '0');
            const monthPrefix = `vote_${year}${monthStringPadded}`;

            console.log(`[DEBUG-VOTES] Fetching votes for month: ${year}-${month}`);
            console.log(`[DEBUG-VOTES] Querying votes with prefix: ${monthPrefix}`);

            // votes 컬렉션의 모든 문서를 가져와서 문서 ID로 필터링
            const votesSnapshot = await getDocs(collection(db, 'votes'));

            console.log(`[DEBUG-VOTES] Number of vote documents found: ${votesSnapshot.docs.length}`);
            if (votesSnapshot.docs.length === 0) {
                console.log(`[DEBUG-VOTES] No vote documents found in collection.`);
            }

            votesSnapshot.forEach(doc => {
                const docId = doc.id; // 예: vote_20250704
                if (docId.startsWith(monthPrefix)) {
                    const voteData = doc.data();
                    console.log(`[DEBUG-VOTES] Processing vote document: ${docId}, data:`, voteData);
                    if (voteData.playerVotes) {
                        Object.values(voteData.playerVotes).forEach(player => {
                            if (player.name && player.votes && typeof player.votes.total === 'number') {
                                voteCounts[player.name] = (voteCounts[player.name] || 0) + player.votes.total;
                            } else {
                                console.warn(`[DEBUG-VOTES] Invalid player data in document ${docId}:`, player);
                            }
                        });
                    } else {
                        console.warn(`[DEBUG-VOTES] No playerVotes in document ${docId}:`, voteData);
                    }
                } else {
                    console.log(`[DEBUG-VOTES] Skipping document: ${docId} (does not match prefix)`);
                }
            });

            console.log(`[DEBUG-VOTES] Aggregated vote counts:`, voteCounts);

            const sortedVoteCandidates = Object.entries(voteCounts)
                .map(([name, votes]) => ({ name, votes }))
                .sort((a, b) => b.votes - a.votes);

            const top5Votes = [];
            if (sortedVoteCandidates.length > 0) {
                top5Votes.push(sortedVoteCandidates[0]);
                for (let i = 1; i < sortedVoteCandidates.length; i++) {
                    if (top5Votes.length < 5 || sortedVoteCandidates[i].votes === top5Votes[top5Votes.length - 1].votes) {
                        top5Votes.push(sortedVoteCandidates[i]);
                    } else {
                        break;
                    }
                }
            }
            console.log(`[DEBUG-VOTES] Top 5 vote candidates:`, top5Votes);
            setVoteCandidates(top5Votes);

            // Fetch stat candidates (Top Performers)
            const playerMonthlyStats = {};
            const queryMonthString = `${year}-${String(month).padStart(2, '0')}`;

            console.log(`[DEBUG-MATCHES] Fetching matches for month: ${year}-${month}`);
            console.log(`[DEBUG-MATCHES] Querying matches for month string: ${queryMonthString}`);

            const matchesQuery = query(
                collection(db, 'matches'),
                where('date', '>=', queryMonthString),
                where('date', '<=', queryMonthString + '~')
            );
            const matchesSnapshot = await getDocs(matchesQuery);

            console.log(`[DEBUG-MATCHES] Number of match documents found: ${matchesSnapshot.docs.length}`);
            matchesSnapshot.forEach(doc => {
                console.log(`[DEBUG-MATCHES] Match ID: ${doc.id}, Date: ${doc.data().date}`);
                const matchData = doc.data();
                const playersInMatch = new Set();

                // Track players who played in this match
                matchData.quarters?.forEach(q => q.teams.forEach(t => t.players.forEach(p => {
                    if (p.name) playersInMatch.add(p.name);
                })));

                playersInMatch.forEach(playerName => {
                    if (!playerMonthlyStats[playerName]) {
                        playerMonthlyStats[playerName] = { goals: 0, assists: 0, matches: 0 };
                    }
                    playerMonthlyStats[playerName].matches++;
                });

                // Aggregate goals
                matchData.goals?.forEach(g => {
                    if (!g.player) {
                        console.warn(`[DEBUG-MATCHES] Goal entry missing player in match ${doc.id}`);
                        return;
                    }
                    if (!playerMonthlyStats[g.player]) {
                        playerMonthlyStats[g.player] = { goals: 0, assists: 0, matches: 0 };
                    }
                    playerMonthlyStats[g.player].goals += (g.count || 0);
                });

                // Aggregate assists
                matchData.assists?.forEach(a => {
                    if (!a.player) {
                        console.warn(`[DEBUG-MATCHES] Assist entry missing player in match ${doc.id}`);
                        return;
                    }
                    if (!playerMonthlyStats[a.player]) {
                        playerMonthlyStats[a.player] = { goals: 0, assists: 0, matches: 0 };
                    }
                    playerMonthlyStats[a.player].assists += (a.count || 0);
                });
            });

            const sortedStatCandidates = Object.entries(playerMonthlyStats)
                .map(([name, stats]) => ({
                    name,
                    ...stats,
                    score: stats.goals * 2 + stats.assists
                }))
                .sort((a, b) => b.score - a.score);

            const top5StatCandidates = [];
            if (sortedStatCandidates.length > 0) {
                top5StatCandidates.push(sortedStatCandidates[0]);
                for (let i = 1; i < sortedStatCandidates.length; i++) {
                    if (top5StatCandidates.length < 5 || sortedStatCandidates[i].score === top5StatCandidates[top5StatCandidates.length - 1].score) {
                        top5StatCandidates.push(sortedStatCandidates[i]);
                    } else {
                        break;
                    }
                }
            }

            // Fetch positions only for top candidates
            const topPlayerNames = top5StatCandidates.map(p => p.name);
            const playerDetailsMap = {};
            if (topPlayerNames.length > 0) {
                const playerQueries = [];
                for (let i = 0; i < topPlayerNames.length; i += 10) {
                    const batch = topPlayerNames.slice(i, i + 10);
                    playerQueries.push(query(collection(db, 'players'), where('name', 'in', batch)));
                }
                const playerSnapshots = await Promise.all(playerQueries.map(q => getDocs(q)));
                playerSnapshots.forEach(snapshot => {
                    snapshot.forEach(doc => {
                        const playerData = doc.data();
                        playerDetailsMap[playerData.name] = { position: playerData.position || 'N/A' };
                    });
                });
            }

            const finalStatCandidates = top5StatCandidates.map(candidate => ({
                ...candidate,
                position: playerDetailsMap[candidate.name]?.position || 'N/A'
            }));
            setStatCandidates(finalStatCandidates);

            if (top5Votes.length === 0 && top5StatCandidates.length === 0) {
                setError(`${year}-${month}에 대한 데이터가 없습니다. 다른 월을 선택해 보세요.`);
            }

        } catch (err) {
            console.error(err);
            setError(`후보 데이터를 불러오는 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterAward = async (name) => {
        const description = prompt(`${name} 선수를 이달의 선수로 등록합니다. 간단한 설명을 추가하세요:`);
        if (description === null || description.trim() === '') return;

        try {
            await addDoc(collection(db, 'monthlyAwards'), {
                name,
                year,
                month,
                description,
                createdAt: new Date()
            });
            alert('성공적으로 등록되었습니다.');
            fetchRegisteredAwards();
        } catch (err) {
            console.error(err);
            alert('등록 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteAward = async (id) => {
        if (window.confirm('정말로 이 수상 기록을 삭제하시겠습니까?')) {
            try {
                await deleteDoc(doc(db, 'monthlyAwards', id));
                alert('삭제되었습니다.');
                fetchRegisteredAwards();
            } catch (err) {
                console.error(err);
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleUpdateAward = async () => {
        if (!editingAward) return;
        try {
            const awardRef = doc(db, 'monthlyAwards', editingAward.id);
            await setDoc(awardRef, { 
                name: editingAward.name,
                description: editingAward.description,
                year: editingAward.year,
                month: editingAward.month,
                createdAt: editingAward.createdAt
            }, { merge: true });
            alert('수정되었습니다.');
            setEditingAward(null);
            fetchRegisteredAwards();
        } catch (err) {
            console.error(err);
            alert('수정 중 오류가 발생했습니다.');
        }
    };

    return (
        <S.Container>
            <h1>이달의 선수상 관리</h1>
            
            <S.ControlsContainer>
                <S.Select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                    {[...Array(5)].map((_, i) => <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}년</option>)} 
                </S.Select>
                <S.Select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                    {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{i + 1}월</option>)}
                </S.Select>
                <S.Button onClick={handleFetchCandidates} disabled={loading}>
                    {loading ? '불러오는 중...' : '후보 확인'}
                </S.Button>
            </S.ControlsContainer>

            {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

            <S.CandidatesContainer>
                <S.CandidateList>
                    <h2>월간 최다 득표자</h2>
                    {loading ? <p>로딩 중...</p> : (
                        voteCandidates.length > 0 ? (
                            <ol>{voteCandidates.map((p, i) => <li key={p.name}>{p.name}: {p.votes}표 <S.RegisterButton onClick={() => handleRegisterAward(p.name)}>등록</S.RegisterButton></li>)}</ol>
                        ) : (
                            <p>해당 월의 득표 데이터가 없습니다.</p>
                        )
                    )}
                </S.CandidateList>
                <S.CandidateList>
                    <h2>월간 최고 활약 선수</h2>
                    {loading ? <p>로딩 중...</p> : (
                        statCandidates.length > 0 ? (
                            <ol>{statCandidates.map((p, i) => <li key={p.name}>{p.name} ({p.position}): {p.goals}골, {p.assists}어시, {p.matches}경기 <S.RegisterButton onClick={() => handleRegisterAward(p.name)}>등록</S.RegisterButton></li>)}</ol>
                        ) : (
                            <p>해당 월의 경기 데이터가 없습니다.</p>
                        )
                    )}
                </S.CandidateList>
            </S.CandidatesContainer>

            <S.RegisteredAwardsContainer>
                <h2>등록된 수상자 목록</h2>
                <S.AwardsTable>
                    <thead>
                        <tr>
                            <th>연도</th>
                            <th>월</th>
                            <th>선수</th>
                            <th>설명</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registeredAwards.map(award => (
                            <tr key={award.id}>
                                {editingAward && editingAward.id === award.id ? (
                                    <>
                                        <td>{award.year}</td>
                                        <td>{award.month}</td>
                                        <td><S.Input type="text" value={editingAward.name} onChange={(e) => setEditingAward({...editingAward, name: e.target.value})} /></td>
                                        <td><S.Input type="text" value={editingAward.description} onChange={(e) => setEditingAward({...editingAward, description: e.target.value})} /></td>
                                        <td>
                                            <S.Button onClick={handleUpdateAward}>저장</S.Button>
                                            <S.Button onClick={() => setEditingAward(null)}>취소</S.Button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{award.year}</td>
                                        <td>{award.month}</td>
                                        <td>{award.name}</td>
                                        <td>{award.description}</td>
                                        <td>
                                            <S.Button onClick={() => setEditingAward(award)}>수정</S.Button>
                                            <S.Button onClick={() => handleDeleteAward(award.id)}>삭제</S.Button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </S.AwardsTable>
            </S.RegisteredAwardsContainer>

        </S.Container>
    );
};

export default PlayerMonthAwardAdmin;