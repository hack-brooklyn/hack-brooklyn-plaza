import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import { slide as Menu } from 'react-burger-menu';
import { action as toggleMenu, decorator as reduxBurgerMenu } from 'redux-burger-menu';
import Button from 'react-bootstrap/Button';
import NavLink from 'react-bootstrap/NavLink';

import { LoggedInNavItems, LoggedOutNavItems } from 'components/Navbar';
import { handleLogOut } from 'util/auth';
import { Logo } from 'commonStyles';
import { Breakpoints, RootState } from 'types';
import logo from 'assets/logo.png';
import closeIcon from 'assets/icons/close.svg';
import profileImage from 'assets/icons/profile.svg';

const ReduxMenu = reduxBurgerMenu(Menu);

const BurgerMenu = (): JSX.Element => {
  const history = useHistory();
  const dispatch = useDispatch();

  const userIsLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const burgerMenuIsOpen = useSelector((state: RootState) => state.burgerMenu.isOpen);
  const userData = useSelector((state: RootState) => state.user);

  const toggleMenuIsOpen = () => {
    dispatch(toggleMenu(!burgerMenuIsOpen));
  };

  return (
    <MenuContainer>
      <ReduxMenu right>
        <BurgerMenuNavLinks>
          <MenuTop>
            <Logo to="/" onClick={toggleMenuIsOpen}>
              <img className="logo-img" src={logo} alt="Hack Brooklyn" />
              <span className="logo-text">plaza</span>
            </Logo>

            <CloseBurgerMenuButton onClick={toggleMenuIsOpen}>
              <img src={closeIcon} alt="Close Menu" />
            </CloseBurgerMenuButton>
          </MenuTop>

          <MenuItems onClick={toggleMenuIsOpen}>
            {userIsLoggedIn ? (
              <>
                <ProfileContainer>
                  <ProfileLink to="/">
                    <ProfileImg src={profileImage} />
                    <ProfileName>{userData.firstName} {userData.lastName}</ProfileName>
                  </ProfileLink>
                </ProfileContainer>

                <LoggedInMenuContainer>
                  <LoggedInNavItems />

                  {/*<LinkNavItem to="/settings">*/}
                  {/*  Settings*/}
                  {/*</LinkNavItem>*/}

                  <StyledNavLink href="mailto:contact@hackbrooklyn.org">
                    Contact Us
                  </StyledNavLink>

                  <LogOutButton
                    variant="danger"
                    onClick={() => handleLogOut(history)}
                  >
                    Log Out
                  </LogOutButton>
                </LoggedInMenuContainer>
              </>
            ) : (
              <LoggedOutMenuList>
                <LoggedOutNavItems />
              </LoggedOutMenuList>
            )}
          </MenuItems>
        </BurgerMenuNavLinks>
      </ReduxMenu>
    </MenuContainer>
  );
};

const MenuContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  // Use custom button that calls Redux state
  .bm-burger-button {
    display: none;
  }

  .bm-cross-button {
    display: none;
  }

  .bm-menu {
    background: white;
    border-radius: 0.75rem 0 0 0.75rem;
    padding: 1rem;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  }

  .bm-overlay {
    // Ensure overlay is over the header
    z-index: 1002 !important;
  }

  // Hide burger menu on large screens
  @media screen and (min-width: ${Breakpoints.Large}px) {
    display: none;
  }
`;

const CloseBurgerMenuButton = styled.button`
  background: none;
  border: none;
`;

const BurgerMenuNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledNavLink = styled(NavLink)`
  padding: 0;
`;

const LogOutButton = styled(Button)`
  margin-top: 0.5rem;
  font-size: 1.25rem;
`;

const MenuTop = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const LoggedInMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoggedOutMenuList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
  padding: 0;
  margin: 1rem 0 0;

  a {
    text-align: center;
  }
`;

const MenuItems = styled.div`
  padding: 0.5rem 0.5rem 1.5rem;

  a {
    display: block;
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
`;

const ProfileContainer = styled.div`
  margin: 1.25rem auto 1.5rem;
  text-align: center;
`;

const ProfileImg = styled.img`
  width: 3rem;
  height: 3rem;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const ProfileLink = styled(Link)`
  color: black;
  text-decoration: none;

  &:active, &:hover, &:focus {
    color: black;
    text-decoration: none;
  }
`;

const ProfileName = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
`;

export default BurgerMenu;
