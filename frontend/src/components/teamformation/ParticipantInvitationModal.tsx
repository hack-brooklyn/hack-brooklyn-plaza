import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FastField, Formik } from 'formik';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import { ParticipantCard } from 'components/teamformation';
import { RequiredFormLabel } from 'components';
import {
  MessageFormGroup,
  ModalBody,
  ModalHeading,
  StyledButton
} from 'common/styles/teamformation/teamFormationModalStyles';
import {
  CommonModalProps,
  ConnectionError,
  MessageData,
  NoPermissionError,
  RootState,
  TeamFormationParticipant,
  TeamFormationParticipantInvitationAlreadySentError,
  TeamFormationTeamFullError,
  UnknownError
} from 'types';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import { API_ROOT } from 'index';

interface ParticipantInvitationModalProps extends CommonModalProps {
  participantData: TeamFormationParticipant;
}

const ParticipantInvitationModal = (
  props: ParticipantInvitationModalProps
): JSX.Element => {
  const { participantData, show, setShow } = props;

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
      await sendInvitation(formData);
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const sendInvitation = async (
    formData: MessageData,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/teamFormation/participants/${participantData.id}/inviteToTeam`,
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
      toast.success('Invitation sent!');
      setShow(false);
    } else if (res.status === 409) {
      setShow(false);
      throw new TeamFormationParticipantInvitationAlreadySentError();
    } else if (res.status === 400) {
      throw new TeamFormationTeamFullError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendInvitation(formData, refreshedToken);
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
        <ModalHeading>Invite Participant</ModalHeading>
        <ParticipantCard
          participantData={participantData}
          showActionButton={false}
        />

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {(formik) => (
            <Form onSubmit={formik.handleSubmit}>
              <MessageFormGroup controlId="tfParticipantInvitationMessage">
                <RequiredFormLabel>Message to Participant</RequiredFormLabel>
                <FastField
                  as="textarea"
                  className="form-control"
                  name="message"
                  rows="5"
                  maxlength="500"
                  placeholder="In under 500 characters, introduce your team to the participant and why your team is interested in working with them."
                  disabled={submitting}
                  required
                />
              </MessageFormGroup>

              <StyledButton type="submit" size="lg" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Invitation'}
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

export default ParticipantInvitationModal;
