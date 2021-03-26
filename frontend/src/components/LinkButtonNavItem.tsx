import React from 'react';
import { LinkButton } from 'components/index';
import { ButtonVariant } from 'react-bootstrap/types';
import styled from 'styled-components/macro';

interface LinkButtonContainerProps {
  variant?: ButtonVariant;
  to: string;
  children?: React.ReactNode;
}

const LinkButtonNavItem = (props: LinkButtonContainerProps): JSX.Element => {
  const { variant, to, children } = props;

  return (
    <li>
      <StyledNavLinkButton>
        <LinkButton variant={variant} to={to}>
          {children}
        </LinkButton>
      </StyledNavLinkButton>
    </li>
  );
};

const StyledNavLinkButton = styled.div`
  display: block;
`;

export default LinkButtonNavItem;
