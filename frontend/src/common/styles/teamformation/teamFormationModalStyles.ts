import styled from 'styled-components/macro';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { DisplayText } from 'common/styles/teamformation/teamFormationInboxModalStyles';
import {
  CenteredButton,
  StyledCenteredH2,
  StyledCenteredH3
} from 'common/styles/commonStyles';
import { Breakpoints } from 'types';

export const ModalBody = styled(Modal.Body)`
  padding: 2rem 1.5rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    min-height: 40rem;
    padding: 3rem;
  }
`;

export const ModalHeading = styled(StyledCenteredH2)`
  margin-bottom: 2rem;
  font-weight: bold;
`;

export const ModalHeadingNoMarginBottom = styled(ModalHeading)`
  margin-bottom: 0;
`;

export const MessageFormGroup = styled(Form.Group)`
  margin: 1rem auto 2rem;
  max-width: 600px;
`;

export const StyledButton = styled(Button)`
  display: block;
  margin: 0 auto 1rem;
`;

export const ModalCenteredButton = styled(CenteredButton)`
  margin-top: 1rem;
  margin-bottom: 0.75rem;
`;

export const SlimModalDisplayText = styled(DisplayText)`
  padding-top: 2rem;
`;

export const ModalSubheading = styled(StyledCenteredH3)`
  margin: 1rem auto 0;
`;
