import React, { CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';

import { handleLogOut } from 'util/auth';
import { RootState } from 'types';

import profileImage from 'assets/icons/profile.svg';
import dropdownArrowImage from 'assets/icons/dropdown-arrow.svg';

interface ProfileMenuToggleProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

interface ProfileMenuArgs {
  children?: React.ReactNode;
  style?: CSSProperties;
  className?: string;
}

const ProfileDropdownMenu = (): JSX.Element => {
  const history = useHistory();
  const userData = useSelector((state: RootState) => state.user);

  return (
    <Dropdown>
      <Dropdown.Toggle as={ProfileMenuToggle} />

      <Dropdown.Menu as={ProfileMenu}>
        <LoggedInUser>
          {userData.firstName} {userData.lastName}
        </LoggedInUser>

        <StyledDropdownItem href="mailto:contact@hackbrooklyn.org">
          Contact Us
        </StyledDropdownItem>
        <LogOutButtonContainer>
          <Button variant="danger" onClick={() => handleLogOut(history)}>Log Out</Button>
        </LogOutButtonContainer>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const ProfileMenuToggle = React.forwardRef<HTMLButtonElement>((props: ProfileMenuToggleProps, ref) => {
  const { onClick } = props;

  return (
    <MenuToggleButton
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick(e);
      }}
    >
      <MenuContainer>
        <UserImg src={profileImage} alt="Profile" />
        <DropdownArrowImg src={dropdownArrowImage} alt="Dropdown Menu" />
      </MenuContainer>
    </MenuToggleButton>
  );
});
ProfileMenuToggle.displayName = 'ProfileMenuToggle';

const ProfileMenu = React.forwardRef<HTMLDivElement>(({ children, style, className }: ProfileMenuArgs, ref) => {
  return (
    <div
      ref={ref}
      style={style}
      className={className}
    >
      <MenuList>
        {children}
      </MenuList>
    </div>
  );
});
ProfileMenu.displayName = 'ProfileMenu';

// interface DropdownLinkItemProps {
//   to: string;
//   children: React.ReactNode;
// }
//
// const DropdownLinkItem = (props: DropdownLinkItemProps) => {
//   const { to, children } = props;
//
//   return (
//     <LinkContainer to={to}>
//       <StyledDropdownItem>
//         {children}
//       </StyledDropdownItem>
//     </LinkContainer>
//   );
// };

const MenuToggleButton = styled.button`
  border: none;
  background: none;
  padding: 0.25rem 0.5rem;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const UserImg = styled.img`
  height: 2rem;
  width: 2rem;
`;

const DropdownArrowImg = styled.img`
  margin-left: 0.5rem;
  height: 0.5rem;
  width: auto;
`;

const MenuList = styled.ul`
  margin: 0;
  padding: 0;
`;

const LoggedInUser = styled.div`
  font-weight: bold;
  text-align: center;
  margin: 0.5rem auto;
`;

const StyledDropdownItem = styled(Dropdown.Item)`
  margin: 0;
  padding: 0.5rem 1.25rem;
`;

const LogOutButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 0.5rem auto;
`;

export default ProfileDropdownMenu;
