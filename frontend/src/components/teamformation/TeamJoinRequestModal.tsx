import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FastField, Formik } from 'formik';
import styled from 'styled-components/macro';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import { TeamCard } from 'components/teamformation';
import { RequiredFormLabel } from 'components';
import {
  Breakpoints,
  ConnectionError,
  InvalidSubmittedDataError,
  MessageData,
  NoPermissionError,
  RootState,
  TeamFormationTeam,
  TeamFormationTeamJoinRequestAlreadySentError,
  UnknownError
} from 'types';
import { StyledCenteredH2 } from 'common/styles/commonStyles';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import { API_ROOT } from 'index';

interface TeamJoinRequestModalProps {
  teamData: TeamFormationTeam;
}

const TeamJoinRequestModal = (
  props: TeamJoinRequestModalProps
): JSX.Element => {
  const { teamData, show, setShow } = props;

  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [submitting, setSubmitting] = useState(false);

  const initialValues: MessageData = {
    message: ''
  };

  const handleSubmit = async (formData: MessageData) => {
    setSubmitting(true);

    try {
      await sendRequestToJoin(formData);
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const sendRequestToJoin = async (
    formData: MessageData,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/teamFormation/teams/${teamData.id}/requestToJoin`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      toast.success('Request sent!');
      setShow(false);
    } else if (res.status === 409) {
      setShow(false);
      throw new TeamFormationTeamJoinRequestAlreadySentError();
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendRequestToJoin(formData, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <Modal
      show={show}
      size="lg"
      backdrop={submitting ? 'static' : undefined}
      keyboard={!submitting}
      onHide={() => setShow(false)}
      dialogClassName="modal-fullscreen-lg-down"
      handleClose={() => setShow(false)}
    >
      <ModalBody>
        <ModalTitle>Request to Join</ModalTitle>
        <TeamCard teamData={teamData} showJoinButton={false} />

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {(formik) => (
            <Form onSubmit={formik.handleSubmit}>
              <MessageFormGroup controlId="tfTeamJoinRequestMessage">
                <RequiredFormLabel>Message to Team</RequiredFormLabel>
                <FastField
                  as="textarea"
                  className="form-control"
                  name="message"
                  rows="5"
                  maxlength="500"
                  placeholder="In under 500 characters, introduce yourself to the team and why you’re interested in joining them."
                  disabled={submitting}
                  required
                />
              </MessageFormGroup>

              <StyledButton type="submit" size="lg" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Request'}
              </StyledButton>
            </Form>
          )}
        </Formik>

        <StyledButton
          variant="secondary"
          onClick={() => setShow(false)}
          disabled={submitting}
        >
          Cancel
        </StyledButton>
      </ModalBody>
    </Modal>
  );
};

const ModalBody = styled(Modal.Body)`
  padding: 2rem 1.5rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    padding: 3rem;
  }
`;

const ModalTitle = styled(StyledCenteredH2)`
  margin-bottom: 2rem;
  font-weight: bold;
`;

const MessageFormGroup = styled(Form.Group)`
  margin: 1rem auto 2rem;
  max-width: 600px;
`;

const StyledButton = styled(Button)`
  display: block;
  margin: 0 auto 1rem;
`;

export default TeamJoinRequestModal;
