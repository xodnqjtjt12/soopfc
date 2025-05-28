import styled, { keyframes } from 'styled-components';

// 토스 스타일 애니메이션
const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(8px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const slideUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(12px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

export const Container = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #191f28;
  
  @media (min-width: 768px) {
    padding: 20px;
  }
`;

export const Header = styled.h1`
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 8px 0;
  padding: 24px 20px 0 20px;
  color: #191f28;
  letter-spacing: -0.02em;
  
  @media (min-width: 768px) {
    font-size: 32px;
    padding: 0 0 0 0;
    margin-bottom: 12px;
  }
`;

export const SubHeader = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 24px 0;
  padding: 0 20px;
  text-align: center;
  color: #6b7684;
  
  @media (min-width: 768px) {
    font-size: 18px;
    padding: 0;
    margin-bottom: 32px;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;      /* padding, border를 width에 포함 */
  padding: 8px 16px;
  font-size: 16px;
  border: 1px solid #e5e8eb;
  border-radius: 12px;
  background: white;
  color: #191f28;
  transition: all 0.2s ease;
  -webkit-appearance: none;

  &::placeholder {
    color: #8b95a1;
  }

  &:focus {
    outline: none;
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.1);
  }

  &:disabled {
    background-color: #f2f4f6;
    color: #8b95a1;
    cursor: not-allowed;
  }
`;
export const ScoreInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

export const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const TogglePasswordButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7684;
  font-size: 16px;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;

  &:hover:not(:disabled) {
    color: #3182f6;
  }

  &:disabled {
    color: #8b95a1;
    cursor: not-allowed;
  }
`;

export const CapsLockWarning = styled.div`
  font-size: 14px;
  color: #ff5f56;
  margin-top: -8px;
  margin-bottom: 8px;
  font-weight: 500;
`;

export const SearchInput = styled(Input)`
  @media (min-width: 768px) {
    width: 240px;
    flex: none;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  background-color: #3182f6;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: #2563eb;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #e5e8eb;
    color: #8b95a1;
    cursor: not-allowed;
    transform: none;
  }
`;

export const AddSlotButton = styled(SubmitButton)`
  background-color: #00c73c;
  
  &:hover:not(:disabled) {
    background-color: #00b236;
  }
`;

export const ResetButton = styled(SubmitButton)`
  background-color: #ff5f56;
  
  &:hover:not(:disabled) {
    background-color: #ff4542;
  }
`;

export const SaveButton = styled(SubmitButton)`
  margin-top: 16px;
  max-width: none;
`;

export const PasswordContainerAuth = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0 20px;
  
  @media (min-width: 768px) {
    margin: 0;
    padding: 40px;
  }
`;

export const PasswordInput = styled(Input)`
  max-width: 240px;
`;

export const ErrorMessage = styled.p`
  color: #ff5f56;
  font-size: 14px;
  font-weight: 500;
  margin: 8px 0 0 0;
  text-align: center;
`;

export const PlayersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px 20px 20px;
  animation: ${fadeIn} 0.4s ease-out;
  
  @media (min-width: 768px) {
    padding: 0;
    gap: 16px;
  }
`;

export const PlayerCard = styled.div`
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  animation: ${slideUp} 0.3s ease-out;
  border: 1px solid transparent;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    border-color: #e5e8eb;
  }
  
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

export const SelectedPlayersContainer = styled.div`
  margin-bottom: 24px;
  padding: 0 20px;
  
  @media (min-width: 768px) {
    padding: 0;
    margin-bottom: 32px;
  }
`;

export const SelectedPlayerCard = styled(PlayerCard)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
`;

export const PlayerName = styled.div`
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 4px;
  color: #191f28;
  letter-spacing: -0.01em;
  text-align: center;
  width: 100%;

  @media (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 6px;
  }
`;

export const PlayerStats = styled.div`
  font-size: 14px;
  color: #6b7684;
  margin-bottom: 2px;
  font-weight: 500;
  text-align: center;
  width: 100%;

  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

export const EditButton = styled.button`
  padding: 8px 12px;
  background-color: #fbbf24;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: #f59e0b;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: #e5e8eb;
    color: #8b95a1;
    cursor: not-allowed;
    transform: none;
  }
`;

export const RemoveButton = styled.button`
  padding: 8px 12px;
  background-color: #ff5f56;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: #ff4542;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: #e5e8eb;
    color: #8b95a1;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

export const NoData = styled.div`
  font-size: 16px;
  color: #8b95a1;
  text-align: center;
  padding: 48px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0 20px;
  
  @media (min-width: 768px) {
    margin: 0;
    padding: 60px 40px;
  }
`;

export const PredictionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 20px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 24px;
  }
`;

export const PredictionCategory = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #cbd5e1;
  }
  
  @media (min-width: 768px) {
    padding: 20px;
  }
`;

export const PredictionItem = styled.div`
  font-size: 15px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e8eb;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  @media (min-width: 768px) {
    padding: 14px;
  }
`;

export const DeadlineText = styled.div`
  font-size: ${props => (props.isUrgent ? '16px' : '15px')};
  color: ${props => (props.isUrgent ? '#ff5f56' : '#6b7684')};
  font-weight: ${props => (props.isUrgent ? '700' : '600')};
  margin: 12px 0 16px 0;
  padding: 12px 16px;
  background: ${props => (props.isUrgent ? '#fef2f2' : '#f8fafc')};
  border-radius: 8px;
  text-align: center;
  border: 1px solid ${props => (props.isUrgent ? '#fecaca' : '#e2e8f0')};
  
  @media (min-width: 768px) {
    font-size: ${props => (props.isUrgent ? '17px' : '16px')};
    padding: 14px 20px;
    margin: 16px 0 20px 0;
  }
`;

export const CancelButton = styled.button`
  padding: 8px 16px;
  background-color: #8b95a1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  margin-left: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #6b7684;
    transform: translateY(-1px);
  }
`;