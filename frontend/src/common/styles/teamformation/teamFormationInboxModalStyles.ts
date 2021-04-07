import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';

import { Breakpoints } from 'types';

export const TeamFormationMessage = styled.p`
  margin: 1.5rem auto;
  max-width: 600px;
`;

export const CloseButtonContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-bottom: -2.25rem;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0;
`;

export const CloseIconImg = styled.img`
  height: 2rem;
  width: 2rem;
`;

export const DecisionButton = styled(Button)`
  width: 100%;
  margin-bottom: 0.75rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    width: auto;
  }
`;

export const DecisionButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PageButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PageButtonIcon = styled.img`
  width: 1.5rem;
  height: 1.5rem;
`;

export const PageButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
`;

export const PageIndicator = styled.div`
  font-weight: bold;
  margin: 0 1.5rem;
`;

export const DisplayText = styled.div`
  font-size: 1.1rem;
  text-align: center;
  padding-top: 1rem;
`;
