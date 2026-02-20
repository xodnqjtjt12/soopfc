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

export const Header = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
`;

export const ErrorMessage = styled.p`
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 5px;
`;

export const Button = styled.button`
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #40a9ff;
  }

  &:disabled {
    background-color: #d9d9d9;
    cursor: not-allowed;
  }
`;

export const VoteControlSection = styled.div`
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
`;

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

export const SwitchLabel = styled.label`
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 500;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const Switch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 24px;
  }

  span:before {
    position: absolute;
    content: '';
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + span {
    background-color: #1890ff;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

export const StatusText = styled.p`
  font-size: 14px;
  color: #4b5563;
  margin-top: 10px;
`;

export const DateTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

export const DateTimeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const DateTimeInput = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 8px;
  }
`;

export const DateTimeSeparator = styled.span`
  font-size: 16px;
  color: #1a1a1a;
`;

export const ExposedDatesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ExposeDateButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #059669;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

export const ExposedDatesList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px;
`;

export const ExposedDateItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 5px;
`;

export const RemoveExposeDateButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #dc2626;
  }
`;

export const VoteTable = styled.div`
  overflow-x: auto;
  margin-bottom: 40px;

  table {
    width: 100%;
    border-collapse: collapse;
  }
`;

export const VoteHeader = styled.th`
  background: #e5e7eb;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: left;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 8px;
  }
`;

export const VoteRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;
`;

export const VoteCell = styled.td`
  padding: 12px;
  font-size: 16px;
  color: #4b5563;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 8px;
  }
`;

export const SummarySection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const TopThreeSection = styled.div`
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

export const TopEightSection = styled.div`
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

export const SummaryItem = styled.div`
  font-size: 16px;
  color: #1a1a1a;
  margin: 10px 0;

  .rank {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    background: #e5e7eb;
    border-radius: 50%;
    margin-right: 10px;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const CommentsSection = styled.div`
  margin-bottom: 40px;
`;

export const CommentsList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const CommentItem = styled.li`
  background: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 16px;
  color: #1a1a1a;

  strong {
    font-weight: 600;
  }

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px;
  }
`;

export const VoteHistorySection = styled.div`
  margin-top: 40px;
`;

export const HistoryTable = styled.div`
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;
  }
`;

export const NoData = styled.p`
  font-size: 16px;
  color: #4b5563;
  text-align: center;
  margin: 20px 0;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const ViewButton = styled.button`
  background: #0182ff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 10px;

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

export const CopyButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover {
    background: #059669;
  }

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;

export const CopyMessage = styled.p`
  font-size: 14px;
  color: #10b981;
  margin-bottom: 20px;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
`;

export const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
`;

export const ModalText = styled.p`
  font-size: 16px;
  color: #4b5563;
  margin-bottom: 20px;
`;

export const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export const ModalButton = styled.button`
  background: ${props => (props.primary ? '#1890ff' : '#6b7280')};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: ${props => (props.primary ? '#40a9ff' : '#4b5563')};
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

export const PasswordModalInput = styled.input`
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

export const PasswordModalError = styled.p`
  color: #ff4d4f;
  font-size: 14px;
  margin-bottom: 10px;
`;

export const Loading = styled.p`
  font-size: 16px;
  color: #4b5563;
  text-align: center;
  margin: 20px 0;

  @media (max-width: 640px) {
    font-size: 14px;
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

export const TogglePasswordVisibility = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-left: 10px;
`;

export const LogsContainer = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

export const LogItem = styled.p`
  font-size: 12px;
  color: #333;
  margin: 5px 0;
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

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

export const MatchCheerSection = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fefcbf;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 10px;
    padding: 15px;
  }
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

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 300px;
  margin-bottom: 10px;
`;

export const SuggestionList = styled.ul`
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
`;

export const SuggestionItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;