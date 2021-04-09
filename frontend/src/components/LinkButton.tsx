import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';
import { ButtonVariant } from 'react-bootstrap/types';

import { ButtonActiveOverrideStyles } from 'common/styles/commonStyles';

interface StyledButtonProps {
  overrideActiveStyles?: boolean;
}

export interface LinkButtonProps extends StyledButtonProps {
  to: string;
  size?: 'sm' | 'lg' | undefined;
  variant?: ButtonVariant;
  children?: React.ReactNode;
  className?: string;
}

const LinkButton = (props: LinkButtonProps): JSX.Element => {
  const { to, size, variant, children } = props;

  return (
    <LinkContainer to={to}>
      <StyledButton variant={variant} size={size} {...props}>
        {children}
      </StyledButton>
    </LinkContainer>
  );
};

const StyledButton = styled(Button)`
  ${(props: StyledButtonProps) =>
    props.overrideActiveStyles === true && ButtonActiveOverrideStyles};
`;

export default LinkButton;
