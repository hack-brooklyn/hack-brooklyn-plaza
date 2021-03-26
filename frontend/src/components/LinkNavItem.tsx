import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { StyledNavLink } from 'commonStyles';
import styled from 'styled-components/macro';

interface NavLinkContainerProps {
  to: string;
  children: React.ReactNode;
}

const LinkNavItem = (props: NavLinkContainerProps): JSX.Element => {
  const { to, children } = props;

  return (
    <StyledLi>
      <LinkContainer to={to}>
        <StyledNavLink>
          {children}
        </StyledNavLink>
      </LinkContainer>
    </StyledLi>
  );
};

const StyledLi = styled.li`
  list-style: none;
`;


export default LinkNavItem;
