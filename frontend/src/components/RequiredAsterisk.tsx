import React from 'react';
import styled from 'styled-components/macro';

const RequiredAsterisk = (): JSX.Element => {
  return (
    <RedAsteriskStyle>*</RedAsteriskStyle>
  );
};

const RedAsteriskStyle = styled.span`
  color: red;
`;

export default RequiredAsterisk;
