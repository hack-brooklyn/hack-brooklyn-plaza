import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { StyledNavLink } from 'commonStyles';

interface NavLinkContainerProps {
  to: string;
  children: React.ReactNode;
}

const LinkNavItem = (props: NavLinkContainerProps) => {
  const { to, children } = props;

  return (
    <li>
      <LinkContainer to={to}>
        <StyledNavLink>
          {children}
        </StyledNavLink>
      </LinkContainer>
    </li>
  );
};


export default LinkNavItem;
