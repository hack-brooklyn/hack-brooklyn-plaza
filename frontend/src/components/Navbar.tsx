import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import NavLink from 'react-bootstrap/NavLink';

import { LinkButton } from 'components';
import logo from 'assets/logo.png';
import Button from 'react-bootstrap/Button';
import { logOutUser } from 'util/auth';

const Navbar = (): JSX.Element => {
  return (
    <StyledNavbar>
      <Logo to="/">
        <img className="logo-img" src={logo} alt="Hack Brooklyn Logo" />
        <span className="logo-text">plaza</span>
      </Logo>

      <NavLinks>
        <StyledNavLink href="mailto:contact@hackbrooklyn.org">
          Contact&nbsp;Us
        </StyledNavLink>
        <LinkButton to="/apply">Apply</LinkButton>
        <Button variant="danger" onClick={() => logOutUser()}>Log Out</Button>
      </NavLinks>
    </StyledNavbar>
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

const NavLinks = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  a {
    text-decoration: none;
  }

  a.btn-primary.active {
    background-color: #0d6efd;
    border-color: #0d6efd;

    &:hover {
      background-color: #0b5ed7;
      border-color: #0a58ca;
    }

    &:active {
      background-color: #0a58ca;
      border-color: #0a53be;
    }

    &:focus {
      background-color: #0b5ed7;
      border-color: #0a58ca;
    }
  }

  *:not(:first-child) {
    margin-left: 0.5rem;
  }
`;

const StyledNavLink = styled(NavLink)`
  padding-left: 0;
  padding-right: 1rem;
`;

export default Navbar;
