// src/PowerRankingAdmincss.js
import styled from 'styled-components';

export const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

export const Header = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

export const SubHeader = styled.h3`
  margin-top: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
`;

export const SelectedPlayersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

export const SelectedPlayerCard = styled.div`
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 10px;
  text-align: center;
`;

export const SaveButton = styled.button`
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin: 20px 0;
  width: 100%;

  &:hover {
    background-color: #40a9ff;
  }

  &:disabled {
    background-color: #d9d9d9;
    cursor: not-allowed;
  }
`;

export const PlayersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
`;

export const PlayerCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }

  ${(props) =>
    props.selected &&
    `
    background-color: #e6f7ff;
    border-color: #91d5ff;
  `}
`;

export const PlayerName = styled.p`
  font-weight: bold;
  margin: 0 0 5px 0;
`;

export const PlayerStats = styled.p`
  color: #666;
  font-size: 14px;
  margin: 5px 0;
`;

export const AddSlotButton = styled.button`
  background-color: #52c41a;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;

  &:hover {
    background-color: #73d13d;
  }
`;

export const ResetButton = styled.button`
  background-color: #ff7a45;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  margin-top: 10px;

  &:hover {
    background-color: #ff9c6e;
  }
`;

export const RankInput = styled.input`
  width: 100%;
  padding: 5px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

export const EditButton = styled.button`
  background-color: #faad14;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 5px;

  &:hover {
    background-color: #ffc53d;
  }
`;

export const RemoveButton = styled.button`
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 5px;
  margin-left: 5px;

  &:hover {
    background-color: #ff7875;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

export const PasswordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

export const PasswordInput = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  width: 200px;
`;

export const SubmitButton = styled.button`
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #40a9ff;
  }
`;

export const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
`;

export const FormationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
`;

export const FormationCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
`;

export const FormationEditButton = styled.button`
  background-color: #722ed1;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 5px;
  margin-left: 5px;

  &:hover {
    background-color: #9254de;
  }
`;