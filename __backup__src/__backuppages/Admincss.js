// src/pages/Admincss.js
import styled from 'styled-components';

export const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

export const AdminContent = styled.div`
  display: flex;
  gap: 20px;
`;

export const MainArea = styled.div`
  flex: 3;
`;

export const LogsContainer = styled.div`
  flex: 1;
  border: 1px solid #ccc;
  padding: 10px;
  max-height: 600px;
  overflow-y: auto;
`;

export const LogItem = styled.div`
  font-size: 14px;
  margin-bottom: 5px;
  border-bottom: 1px dashed #ddd;
  padding-bottom: 2px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const SmallInput = styled(Input)`
  padding: 5px;
  font-size: 14px;
  width: 70px;
`;

export const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  color: #ffffff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  margin-top: 5px;
  &:hover {
    background-color: #0056b3;
  }
`;

export const TogglePasswordVisibility = styled.img`
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-left: 10px;
`;

export const Header = styled.h2`
  text-align: center;
`;

export const UploadMessage = styled.p`
  color: ${(props) => (props.success ? 'green' : 'red')};
  text-align: center;
`;

export const Table = styled.table`
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse; 
  text-align: left;
  
  /* add padding INSIDE each cell */
  th, td {
    padding: 12px 16px; /* adjust values as needed */
  }
`;

export const Th = styled.th`
  position: sticky;
  top: 0;
  background: #ffffff;     /* 헤더 배경색을 테이블 배경색과 같게 */
  z-index: 2;              /* 헤더가 컨텐츠보다 위에 있도록 */
  padding: 4px 6px;
  border: 1px solid #ddd;
`;

export const Td = styled.td`
  border: 1px solid #ddd;
  padding: 4px 6px;
`;

export const PreviewContainer = styled.div`
  background-color: #f0f8ff;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 10px;
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


export const ErrorMessage = styled.p`
  color: #f44336;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;
