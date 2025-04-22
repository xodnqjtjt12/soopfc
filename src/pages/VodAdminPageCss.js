import styled from 'styled-components';

// 관리자 컨테이너 (기존 스타일 유지)
export const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
`;

// 관리자 페이지 헤더 (기존 스타일 유지)
export const AdminHeader = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #333;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
`;

// 폼 컨테이너 (기존 스타일 유지)
export const AdminForm = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

// 폼 그룹 (기존 스타일 유지)
export const FormGroup = styled.div`
  margin-bottom: 15px;
`;

// 라벨 (기존 스타일 유지)
export const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 14px;
  color: #555;
`;

// 입력 필드 (기존 스타일 유지)
export const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

// 선택 필드 (기존 스타일 유지)
export const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  transition: border 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

// 버튼 (기존 스타일 유지)
export const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;

  &:hover {
    background-color: #2980b9;
  }
`;

// 메인 컨텐츠 영역 (기존 스타일 유지)
export const AdminContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

// 필터 섹션 (기존 스타일 유지)
export const FilterSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

// 날짜 선택기 (기존 스타일 유지)
export const DateSelector = styled(Select)`
  min-width: 200px;
`;

// VOD 테이블 (기존 스타일 유지)
export const VodTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
`;

// 테이블 헤더 (기존 스타일 유지, 열 개수 조정)
export const TableHeader = styled.tr`
  background-color: #f1f1f1;

  th {
    padding: 12px 15px;
    text-align: left;
    font-weight: 500;
    font-size: 14px;
    color: #333;
    border-bottom: 2px solid #ddd;
  }
`;

// 테이블 행 (기존 스타일 유지)
export const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9f9f9;
  }

  td {
    padding: 12px 15px;
    font-size: 14px;
    color: #555;
  }

  a {
    color: #3498db;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// 삭제 버튼 (기존 스타일 유지)
export const DeleteButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c0392b;
  }
`;

// 쿼터 뱃지 (기존 스타일 유지)
export const QuarterBadge = styled.span`
  background-color: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

// 비디오 타입 뱃지 (기존 스타일에 캐치 타입 강조 추가)
export const VideoTypeBadge = styled.span`
  background-color: ${({ type }) =>
    type === 'vod' ? '#3498db' : 
    type === 'catch' ? '#2ecc71' : // 캐치 타입은 초록색으로 강조
    type === 'shorts' ? '#f1c40f' : '#7f8c8d'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

// VOD가 없을 때 메시지 (기존 스타일 유지)
export const NoVodsMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 16px;
`;

// 캐치 업로드 섹션
export const CatchUploadSection = styled.div`
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #ddd;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

// 캐치 파일 입력
export const CatchInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  transition: border 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

// 캐치 업로드 버튼
export const CatchButton = styled.button`
  background-color: #2ecc71; /* 캐치 전용 색상 */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #27ae60;
  }
`;

// 캐치 썸네일 목록
export const CatchList = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 15px;
  overflow-x: auto;
  padding: 10px 0;
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #3498db;
    border-radius: 4px;
  }
`;

// 캐치 썸네일
export const CatchThumbnail = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: url(${(props) => props.src}) center/cover no-repeat;
  border: 2px solid #2ecc71; /* 캐치 전용 색상 */
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  position: relative;

  &:hover {
    transform: scale(1.1);
    opacity: 0.9;
  }

  &::after {
    content: '${(props) => props.title || ''}';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: #555;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 80px;
    overflow: hidden;
  }
`;

// 모달 오버레이
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

// 캐치 모달
export const CatchModal = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 80%;
  max-height: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  button {
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #c0392b;
    }
  }
`;

// 캐치 비디오
export const CatchVideo = styled.video`
  max-width: 100%;
  max-height: 60vh;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;