
import styled from 'styled-components';

export const Container = styled.div`
    padding: 20px;
    font-family: 'Noto Sans KR', sans-serif;
`;

export const ControlsContainer = styled.div`
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
`;

export const Select = styled.select`
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
`;

export const Button = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    margin-left: 5px;

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

export const RegisterButton = styled.button`
    margin-left: 10px;
    padding: 2px 6px;
    font-size: 12px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
`;

export const ErrorMessage = styled.p`
    color: red;
`;

export const CandidatesContainer = styled.div`
    display: flex;
    gap: 40px;
    margin-bottom: 40px;
`;

export const CandidateList = styled.div`
    h2 {
        margin-bottom: 10px;
    }
    ol {
        padding-left: 20px;
    }
    li {
        margin-bottom: 5px;
    }
`;

export const RegisteredAwardsContainer = styled.div`
    margin-top: 30px;
`;

export const AwardsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2;
    }
`;

export const Input = styled.input`
    width: 95%;
    padding: 6px;
`;
