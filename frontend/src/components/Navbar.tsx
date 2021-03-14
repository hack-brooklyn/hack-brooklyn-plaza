import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import NavLink from 'react-bootstrap/NavLink';
import { LinkContainer } from 'react-router-bootstrap';
import styled from 'styled-components/macro';

import { LinkButton, ProfileDropdownMenu } from 'components';
import { Breakpoints, RootState } from 'types';
import { APPLICATIONS_ACTIVE, HACKATHON_ACTIVE } from 'index';
import logo from 'assets/logo.png';

interface NavLinkContainerProps {
  to: string;
  children: React.ReactNode;
}

const Navbar = (): JSX.Element => {
  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);
  const userIsLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return (
    <StyledNavbar>
      <Logo to="/">
        <img className="logo-img" src={logo} alt="Hack Brooklyn" />
        <span className="logo-text">plaza</span>
      </Logo>

      {windowWidth >= Breakpoints.Large && (
        <NavLinks>
          {userIsLoggedIn ? <LoggedInNavItems /> : <LoggedOutNavItems />}
        </NavLinks>
      )}
    </StyledNavbar>
  );
};

const LoggedInNavItems = () => {
  return (
    <>
      <NavLinkContainer to="/">
        Dashboard
      </NavLinkContainer>
      <NavLinkContainer to="/announcements">
        Announcements
      </NavLinkContainer>
      <NavLinkContainer to="/teams">
        Team Formation
      </NavLinkContainer>
      <NavLinkContainer to="/schedule">
        Schedule Builder
      </NavLinkContainer>
      {HACKATHON_ACTIVE && (
        <NavLinkContainer to="/mentorship">
          Mentor Matcher
        </NavLinkContainer>
      )}

      <ProfileDropdownMenu />
    </>
  );
};

const LoggedOutNavItems = () => {
  return (
    <>
      <StyledNavLink href="mailto:contact@hackbrooklyn.org">
        Contact&nbsp;Us
      </StyledNavLink>

      <LinkButton variant="outline-primary" to="/activate">Activate Account</LinkButton>
      <LinkButton variant="primary" to="/login">Log In</LinkButton>
      {APPLICATIONS_ACTIVE && <LinkButton variant="success" to="/apply">Apply Now</LinkButton>}
    </>
  );
};

const NavLinkContainer = (props: NavLinkContainerProps) => {
  const { to, children } = props;
  return (
    <LinkContainer to={to}>
      <StyledNavLink>
        {children}
      </StyledNavLink>
    </LinkContainer>
  );
};

const StyledNavbar = styled.nav`
  width: 100%;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  display: flex;
  flex-direction: row;
  align-items: center;
  text-decoration: none;
  font-weight: bold;

  .logo-img {
    height: 3rem;
  }

  .logo-text {
    font-size: 1.5rem;
    margin-left: 0.5rem;
    font-family: 'Major Mono Display', monospace;
  }
`;

const StyledNavLink = styled(NavLink)`
  padding: 0;
  margin-right: 1rem;
`;

const NavLinks = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  a.btn-primary.active {
    background-color: #0d6efd;
    border-color: #0d6efd;

    &:hover,
    &:focus {
      background-color: #0b5ed7;
      border-color: #0a58ca;
    }

    &:active {
      background-color: #0a58ca;
      border-color: #0a53be;
    }
  }

  a.btn-outline-primary.active {
    color: #0d6efd;
    background-color: transparent;

    &:hover,
    &:focus,
    &:active {
      color: #fff;
      background-color: #0d6efd;
    }
  }

  a.btn-success.active {
    background-color: #198754;
    border-color: #198754;

    &:hover,
    &:focus {
      background-color: #157347;
      border-color: #146c43;
    }

    &:active {
      background-color: #146c43;
      border-color: #13653f;
    }
  }

  ${StyledNavLink}:not(:first-child), .btn {
    margin-left: 0.5rem;
  }
`;

export default Navbar;
