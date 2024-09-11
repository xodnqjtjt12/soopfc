import React, { useState } from 'react';
import { collection, addDoc, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../App';
import * as XLSX from 'xlsx'; // 엑셀 파일 처리 라이브러리
import eyeIcon from '../icons/eye_icon.png';
import eyeOffIcon from '../icons/eye_off_icon.png';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const TogglePasswordVisibility = styled.img`
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-left: 10px;
`;

const Header = styled.h2`
  text-align: center;
`;

const UploadMessage = styled.p`
  color: ${props => (props.success ? 'green' : 'red')};
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f2f2f2;
`;

const Td = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
`;

const SlideContainer = styled.div`
  display: flex;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const SlideContent = styled.div`
  flex: 1;
  transition: transform 0.3s ease-in-out;
  transform: ${props => `translateX(-${props.activeIndex * 100}%)`};
`;

const SlideButton = styled.button`
  padding: 10px;
  font-size: 16px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  &:hover {
    background-color: #0056b3;
  }
`;

const AdminPage = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playerData, setPlayerData] = useState({
    name: '',
    team: '',
    goals: '',
    assists: '',
    defense: '',
    overallRank: ''
  });
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'alves') {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlayerData({ ...playerData, [name]: value });
  };

  const handleSubmitPlayerData = async (e) => {
    e.preventDefault();

    if (!playerData.name || !playerData.team || isNaN(playerData.goals) || isNaN(playerData.assists) || isNaN(playerData.defense) || isNaN(playerData.overallRank)) {
      alert('모든 필드를 올바르게 입력해주세요.');
      return;
    }

    const playerRef = doc(db, 'players', playerData.name);
    const playerDoc = await getDoc(playerRef);

    try {
      if (playerDoc.exists()) {
        const existingData = playerDoc.data();
        await updateDoc(playerRef, {
          goals: (existingData.goals || 0) + Number(playerData.goals),
          assists: (existingData.assists || 0) + Number(playerData.assists),
          defense: (existingData.defense || 0) + Number(playerData.defense),
          overallRank: (existingData.overallRank || 0) + Number(playerData.overallRank)
        });
        alert('선수 데이터가 업데이트되었습니다.');
      } else {
        await setDoc(playerRef, {
          name: playerData.name,
          team: playerData.team,
          goals: Number(playerData.goals),
          assists: Number(playerData.assists),
          defense: Number(playerData.defense),
          overallRank: Number(playerData.overallRank)
        });
        alert('선수 데이터가 추가되었습니다.');
      }
      setPlayerData({
        name: '',
        team: '',
        goals: '',
        assists: '',
        defense: '',
        overallRank: ''
      });
    } catch (error) {
      console.error("Error adding or updating document: ", error);
      alert('데이터 추가 또는 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setPreviewData(jsonData);

      try {
        for (const row of jsonData) {
          if (!row.name || !row.team) {
            console.error('누락된 데이터:', row);
            continue;
          }

          const playerRef = doc(db, 'players', row.name);
          const playerDoc = await getDoc(playerRef);

          if (playerDoc.exists()) {
            const existingData = playerDoc.data();
            await updateDoc(playerRef, {
              goals: (existingData.goals || 0) + Number(row.goals),
              assists: (existingData.assists || 0) + Number(row.assists),
              defense: (existingData.defense || 0) + Number(row.defense),
              overallRank: (existingData.overallRank || 0) + Number(row.overallRank)
            });
          } else {
            await setDoc(playerRef, {
              name: row.name,
              team: row.team,
              goals: Number(row.goals),
              assists: Number(row.assists),
              defense: Number(row.defense),
              overallRank: Number(row.overallRank)
            });
          }
        }
        setUploadMessage('엑셀 파일이 성공적으로 업로드되었습니다.');
      } catch (error) {
        console.error("Error uploading file: ", error);
        setUploadMessage('파일 업로드 중 오류가 발생했습니다.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { name: '알베스', team: 'soopfc', goals: 9, assists: 9, defense: 1, overallRank: 1 },
      { name: '이즈미', team: 'soopfc', goals: 9, assists: 9, defense: 1, overallRank: 1 },
      { name: '홍길동', team: 'soopfc', goals: 5, assists: 4, defense: 3, overallRank: 2 }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'template.xlsx');
  };

  return (
    <Container>
      {!isAuthenticated ? (
        <form onSubmit={handlePasswordSubmit}>
          <Header>관리자 페이지 접근</Header>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="비밀번호 입력"
            />
            <TogglePasswordVisibility
              src={showPassword ? eyeIcon : eyeOffIcon}
              alt="Toggle Password Visibility"
              onClick={toggleShowPassword}
            />
          </div>
          <Button type="submit">확인</Button>
        </form>
      ) : (
        <div>
          <SlideContainer>
            <SlideContent activeIndex={activeIndex}>
              <div>
                <Header>관리자 페이지</Header>
                <Form onSubmit={handleSubmitPlayerData}>
                  <h3>선수 데이터 추가</h3>
                  <Input
                    type="text"
                    name="name"
                    value={playerData.name}
                    onChange={handleInputChange}
                    placeholder="선수 이름"
                  />
                  <Input
                    type="text"
                    name="team"
                    value={playerData.team}
                    onChange={handleInputChange}
                    placeholder="팀 이름"
                  />
                  <Input
                    type="number"
                    name="goals"
                    value={playerData.goals}
                    onChange={handleInputChange}
                    placeholder="골 수"
                  />
                  <Input
                    type="number"
                    name="assists"
                    value={playerData.assists}
                    onChange={handleInputChange}
                    placeholder="어시스트 수"
                  />
                  <Input
                    type="number"
                    name="defense"
                    value={playerData.defense}
                    onChange={handleInputChange}
                    placeholder="수비 점수"
                  />
                  <Input
                    type="number"
                    name="overallRank"
                    value={playerData.overallRank}
                    onChange={handleInputChange}
                    placeholder="종합 점수"
                  />
                  <Button type="submit">선수 데이터 추가/업데이트</Button>
                </Form>

                <hr />

                <h3>엑셀 파일 업로드</h3>
                <Input type="file" onChange={handleFileChange} />
                <Button onClick={handleFileUpload}>엑셀 파일 업로드</Button>
                {uploadMessage && (
                  <UploadMessage success={uploadMessage.includes('성공')}>
                    {uploadMessage}
                  </UploadMessage>
                )}

                {previewData.length > 0 && (
                  <Table>
                    <thead>
                      <tr>
                        <Th>이름</Th>
                        <Th>팀</Th>
                        <Th>골</Th>
                        <Th>어시스트</Th>
                        <Th>수비</Th>
                        <Th>종합 점수</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index}>
                          <Td>{row.name}</Td>
                          <Td>{row.team}</Td>
                          <Td>{row.goals}</Td>
                          <Td>{row.assists}</Td>
                          <Td>{row.defense}</Td>
                          <Td>{row.overallRank}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                
                <hr />
                
                <Button onClick={downloadTemplate}>엑셀 양식 다운로드</Button>
              </div>
            </SlideContent>
          </SlideContainer>
        </div>
      )}
    </Container>
  );
};

export default AdminPage;
