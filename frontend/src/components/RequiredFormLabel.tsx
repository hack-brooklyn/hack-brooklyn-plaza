import React from 'react';
import { StyledFormLabel } from 'commonStyles';

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

export default RequiredFormLabel;