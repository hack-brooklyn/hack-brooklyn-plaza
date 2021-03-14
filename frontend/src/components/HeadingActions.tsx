import React from 'react';
import { Breakpoints, MenuAction, RootState } from 'types';
import { HeadingButton } from 'components/index';
import Dropdown from 'react-bootstrap/Dropdown';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';

interface HeadingActionsProps {
  viewName: string;
  actions: MenuAction[];
}

const HeadingActions = (props: HeadingActionsProps): JSX.Element => {
  const { viewName, actions } = props;

  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  if (windowWidth >= Breakpoints.Large) {
    return (
      <HeadingButtons>
        {actions.map((action, index) => (
          <HeadingButton type={action.type}
                         text={action.text}
                         link={action.link}
                         onClick={action.onClick}
                         icon={action.icon}
                         key={index} />
        ))}
      </HeadingButtons>
    );
  } else {
    return (
      <Dropdown>
        <ActionToggle variant="outline-primary" size="lg">
          {viewName} Actions
        </ActionToggle>

        <StyledDropdownMenu>
          {actions.map((action, index) => (
            <Dropdown.Item key={index}>
              <HeadingButton type={action.type}
                             text={action.text}
                             link={action.link}
                             onClick={action.onClick}
                             icon={action.icon} />
            </Dropdown.Item>
          ))}
        </StyledDropdownMenu>
      </Dropdown>
    );
  }
};

const ActionToggle = styled(Dropdown.Toggle)`
  margin-top: 1.5rem;
  display: block;
  width: 100%;
`;

const StyledDropdownMenu = styled(Dropdown.Menu)`
  width: 100%;
`;

const HeadingButtons = styled.div`
  display: flex;
`;

export default HeadingActions;
