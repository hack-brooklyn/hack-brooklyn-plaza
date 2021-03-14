import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { action as toggleMenu } from 'redux-burger-menu';

import { LinkButtonNavItem, LinkNavItem, ProfileDropdownMenu } from 'components';
import { Logo, StyledNavLink } from 'commonStyles';
import { APPLICATIONS_ACTIVE, HACKATHON_ACTIVE } from 'index';
import { Breakpoints, RootState } from 'types';
import logo from 'assets/logo.png';
import burgerMenuIcon from 'assets/icons/burger-menu.svg';

const Navbar = (): JSX.Element => {
  const dispatch = useDispatch();
  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);
  const userIsLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const burgerMenuIsOpen = useSelector((state: RootState) => state.burgerMenu.isOpen);

  return (
    <StyledNavbar>
      <Logo to="/">
        <img className="logo-img" src={logo} alt="Hack Brooklyn" />
        <span className="logo-text">plaza</span>
      </Logo>

      {windowWidth >= Breakpoints.Large ? (
        <NavLinks>
          <NavItemsList>
            {userIsLoggedIn ? (
              <>
                <LoggedInNavItems />
                <ProfileDropdownMenu />
              </>
            ) : (
              <LoggedOutNavItems />
            )}
          </NavItemsList>
        </NavLinks>
      ) : (
        <>
          <BurgerMenuButton onClick={() => dispatch(toggleMenu(!burgerMenuIsOpen))}>
            <img src={burgerMenuIcon} alt="Open Menu" />
          </BurgerMenuButton>
        </>
      )}
    </StyledNavbar>
  );
};

export const LoggedInNavItems = (): JSX.Element => {
  return (
    <>
      <LinkNavItem to="/">
        Dashboard
      </LinkNavItem>
      <LinkNavItem to="/announcements">
        Announcements
      </LinkNavItem>
      <LinkNavItem to="/teams">
        Team Formation
      </LinkNavItem>
      <LinkNavItem to="/schedule">
        Schedule Builder
      </LinkNavItem>
      {HACKATHON_ACTIVE && (
        <LinkNavItem to="/mentorship">
          Mentor Matcher
        </LinkNavItem>
      )}
    </>
  );
};

export const LoggedOutNavItems = (): JSX.Element => {
  return (
    <>
      <li>
        <StyledNavLink href="mailto:contact@hackbrooklyn.org">
          Contact&nbsp;Us
        </StyledNavLink>
      </li>

      <LinkButtonNavItem variant="outline-primary" to="/activate">
        Activate Account
      </LinkButtonNavItem>
      <LinkButtonNavItem variant="primary" to="/login">
        Log In
      </LinkButtonNavItem>
      {APPLICATIONS_ACTIVE && (
        <LinkButtonNavItem variant="success" to="/apply">
          Apply Now
        </LinkButtonNavItem>
      )}
    </>
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

const BurgerMenuButton = styled.button`
  background: none;
  border: none;
`;

const NavItemsList = styled.ul`
  display: flex;
  flex-direction: row;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
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
