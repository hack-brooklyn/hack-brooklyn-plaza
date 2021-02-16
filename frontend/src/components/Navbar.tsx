import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import logo from 'assets/logo.png';
import LinkButton from 'components/LinkButton';

const Navbar = (): JSX.Element => {
  return (
    <StyledNavbar>
      <NavbarContent>
        <Logo to="/">
          <img className="logo-img" src={logo} alt="Hack Brooklyn Logo" />
          <span className="logo-text">plaza</span>
        </Logo>
        <NavLinks>
          <LinkButton to="/apply">Apply Now</LinkButton>
        </NavLinks>
      </NavbarContent>
    </StyledNavbar>
  );
};

const StyledNavbar = styled.nav`
  height: 4rem;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
`;

const NavbarContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
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
    margin-left: 1.5rem;
  }
`;

export default Navbar;
