import React from 'react';
import Form from 'react-bootstrap/Form';
import styled from 'styled-components/macro';

export interface RequiredFormLabelProps {
  children: React.ReactNode;
}

const RequiredFormLabel = (props: RequiredFormLabelProps) => {
  const { children } = props;

  return (
    <StyledFormLabel>
      {children}
      <span style={{ color: 'red' }}>*</span>
    </StyledFormLabel>
  );
};

export const StyledFormLabel = styled(Form.Label)`
  font-size: 1.25rem;
  font-weight: bold;
`;

export default RequiredFormLabel;