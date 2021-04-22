import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { action as toggleMenu } from 'redux-burger-menu';
import styled from 'styled-components/macro';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { LinkContainer } from 'react-router-bootstrap';

import {
  LinkButtonNavItem,
  LinkNavItem,
  ProfileDropdownMenu
} from 'components';
import {
  ButtonActiveOverrideStyles,
  Logo,
  StyledNavLink
} from 'common/styles/commonStyles';
import { enumHasValue } from 'util/plazaUtils';
import ac, { Resources, Roles } from 'security/accessControl';
import { Breakpoints, RootState } from 'types';
import { APPLICATIONS_ACTIVE } from 'index';

import logo from 'assets/logo.png';
import burgerMenuIcon from 'assets/icons/burger-menu.svg';

const Navbar = (): JSX.Element => {
  const dispatch = useDispatch();

  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);
  const userIsLoggedIn = useSelector(
    (state: RootState) => state.auth.isLoggedIn
  );
  const burgerMenuIsOpen = useSelector(
    (state: RootState) => state.burgerMenu.isOpen
  );

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
          <BurgerMenuButton
            onClick={() => dispatch(toggleMenu(!burgerMenuIsOpen))}
          >
            <img src={burgerMenuIcon} alt="Open Menu" />
          </BurgerMenuButton>
        </>
      )}
    </StyledNavbar>
  );
};

export const LoggedInNavItems = (): JSX.Element => {
  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);
  const userRole = useSelector((state: RootState) => state.user.role);

  return (
    <>
      {userRole === Roles.Admin && windowWidth >= Breakpoints.Large && (
        <StyledNavDropdown title="Admin" id="admin-nav-dropdown">
          <AdminNavItems />
        </StyledNavDropdown>
      )}

      {/* Everyone can use the dashboard and view announcements */}
      <LinkNavItem to="/">Dashboard</LinkNavItem>
      <LinkNavItem to="/announcements">Announcements</LinkNavItem>

      {userRole !== null && enumHasValue(Roles, userRole) && (
        <>
          {/* If a user is able to create a team formation profile, they have access to team formation */}
          {ac.can(userRole).createOwn(Resources.TeamFormationParticipants)
            .granted && (
            <LinkNavItem to="/teamformation">Team Formation</LinkNavItem>
          )}

          {ac.can(userRole).readAny(Resources.Events).granted && (
            <LinkNavItem to="/schedule">Schedule Builder</LinkNavItem>
          )}
        </>
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

export const AdminNavItems = (): JSX.Element => {
  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  if (windowWidth >= Breakpoints.Large) {
    return (
      <>
        <LinkContainer to="/admin/applications">
          <NavDropdown.Item>Manage Applications</NavDropdown.Item>
        </LinkContainer>

        <LinkContainer to="/admin/users/create">
          <NavDropdown.Item>Create User Account</NavDropdown.Item>
        </LinkContainer>

        <LinkContainer to="/admin/users/setrole">
          <NavDropdown.Item>Set User Role</NavDropdown.Item>
        </LinkContainer>
      </>
    );
  } else {
    return (
      <>
        <LinkNavItem to="/admin/applications">Manage Applications</LinkNavItem>

        <LinkNavItem to="/admin/users/create">Create User Account</LinkNavItem>

        <LinkNavItem to="/admin/users/setrole">Set User Role</LinkNavItem>
      </>
    );
  }
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
  ${ButtonActiveOverrideStyles};

  display: flex;
  flex-direction: row;
  align-items: center;

  ${StyledNavLink}:not(:first-child), .btn {
    margin-left: 0.5rem;
  }
`;

const StyledNavDropdown = styled(NavDropdown)`
  & > a {
    padding-left: 0;
  }
`;

export default Navbar;
