import styled from 'styled-components/macro';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { StyledCenteredH2 } from 'common/styles/commonStyles';
import { Breakpoints } from 'types';

export const ModalBody = styled(Modal.Body)`
  padding: 2rem 1.5rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    padding: 3rem;
  }
`;

export const ModalHeading = styled(StyledCenteredH2)`
  margin-bottom: 2rem;
  font-weight: bold;
`;

export const MessageFormGroup = styled(Form.Group)`
  margin: 1rem auto 2rem;
  max-width: 600px;
`;

export const StyledButton = styled(Button)`
  display: block;
  margin: 0 auto 1rem;
`;