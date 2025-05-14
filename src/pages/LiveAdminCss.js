import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    padding: 15px;
    margin: 0 10px;
  }
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #1a1a1a;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const TeamSection = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #f9fafb;
`;

export const TeamTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 15px;

  @media (max-width: 640px) {
    font-size: 18px;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  margin-bottom: 10px;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 8px;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  margin-bottom: 10px;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 8px;
  }
`;

export const PlayerRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 5px;
  }
`;

export const AddButton = styled.button`
  background: #0182ff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #016fe6;
  }

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;

export const IconButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #dc2626;
  }
`;

export const SaveButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  align-self: flex-start;

  &:hover {
    background: #059669;
  }

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px 20px;
  }
`;

export const Message = styled.p`
  text-align: center;
  font-size: 16px;
  color: ${props => (props.error ? '#ef4444' : '#10b981')};
  margin: 20px 0;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const SavedLineupsContainer = styled.div`
  margin-top: 40px;
`;

export const SavedLineup = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: #f9fafb;
`;

export const SavedLineupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

export const SavedLineupTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

export const SavedLineupActions = styled.div`
  display: flex;
  gap: 10px;
`;

export const EditButton = styled.button`
  background: #0182ff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #016fe6;
  }
`;

export const DeleteButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #dc2626;
  }
`;

export const SavedLineupTeams = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

export const SavedLineupTeam = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const SavedLineupTeamHeader = styled.div`
  background: #e5e7eb;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
`;

export const SavedLineupPlayers = styled.ul`
  list-style: none;
  padding: 0;
  font-size: 14px;
  color: #4b5563;

  li {
    margin: 5px 0;
  }
`;