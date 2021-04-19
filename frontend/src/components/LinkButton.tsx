import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';
import { ButtonVariant } from 'react-bootstrap/types';

import { ButtonActiveOverrideStyles } from 'common/styles/commonStyles';

interface LinkButtonContainerProps {
  centered?: boolean;
}

interface StyledButtonProps {
  overrideActiveStyles?: boolean;
}

export interface LinkButtonProps
  extends LinkButtonContainerProps,
    StyledButtonProps {
  to: string;
  size?: 'sm' | 'lg' | undefined;
  variant?: ButtonVariant;
  children?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

const LinkButton = (props: LinkButtonProps): JSX.Element => {
  const { to, size, variant, centered, children } = props;

  return (
    <LinkButtonContainer centered={centered}>
      <LinkContainer to={to}>
        <StyledButton variant={variant} size={size} {...props}>
          {children}
        </StyledButton>
      </LinkContainer>
    </LinkButtonContainer>
  );
};

const StyledButton = styled(Button)`
  ${(props: StyledButtonProps) =>
    props.overrideActiveStyles === true && ButtonActiveOverrideStyles};
`;

const LinkButtonContainer = styled.div`
  ${(props: LinkButtonContainerProps) =>
    props.centered &&
    `
      display: flex;
      justify-content: center;
      align-items: center;
    `};
`;

export default LinkButton;
