import styled, { keyframes } from 'styled-components';

// 애니메이션 정의
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// 스타일드 컴포넌트 정의
export const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 640px) {
    padding: 15px;
    margin: 0 16px;
  }
`;

export const AdminContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

export const MainArea = styled.div`
  flex: 3;
`;

export const Header = styled.h2`
  font-size: 24px;
  color: #1a1a1a;
  margin-bottom: 20px;
  text-align: center;
  animation: ${slideIn} 0.5s ease-out;

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 640px) {
    gap: 10px;
  }
`;

export const Select = styled.select`
  padding: 15px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
  }

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 12px;
  }
`;

export const Input = styled.input`
  padding: 15px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 12px;
  }
`;

export const SmallInput = styled.input`
  padding: 8px;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  background-color: #f9f9f9;
  width: 100%;
`;

export const Button = styled.button`
  padding: 15px;
  font-size: 16px;
  color: white;
  background-color: #0182ff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #2c5282;
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 12px;
  }
`;

export const TogglePasswordVisibility = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-left: 10px;
`;

export const ErrorMessage = styled.p`
  color: #f44336;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

export const SuccessMessage = styled.p`
  color: #4caf50;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

export const UploadMessage = styled.p`
  color: ${({ success }) => (success ? '#4caf50' : '#f44336')};
  font-size: 14px;
  margin-top: 10px;
`;

export const PreviewContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #1a1a1a;
  border-radius: 10px;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const Th = styled.th`
  padding: 15px;
  background-color: #303030;
  color: #f8f8f8;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid #3a3a3a;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px;
  }
`;

export const Td = styled.td`
  padding: 15px;
  color: #f8f8f8;
  font-size: 16px;
  text-align: center;
  border-bottom: 1px solid #3a3a3a;

  @media (max-width: 640px) {
    font-size: 14px;
    padding: 10px;
  }
`;

export const LogsContainer = styled.div`
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  @media (max-width: 767px) {
    max-height: 200px;
  }
`;

export const LogItem = styled.p`
  font-size: 14px;
  color: #333;
  margin: 5px 0;
`;