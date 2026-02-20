import React from 'react';
import styled from 'styled-components';

const AllRankPage = () => {
  return (
    <PageContainer>
      <h2>전체 순위 보기</h2>
      {/* 전체 순위 데이터를 테이블로 표시 */}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 20px;
  h2 {
    color: #61dafb;
  }
`;

export default AllRankPage;
