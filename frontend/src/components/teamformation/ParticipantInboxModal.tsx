import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { toast } from 'react-toastify';

import { TeamCard } from 'components/teamformation';
import {
  CloseButton,
  CloseButtonContainer,
  CloseIconImg,
  DecisionButton,
  DecisionButtonContainer,
  DisplayText,
  TeamFormationMessage,
  PageButton,
  PageButtonIcon,
  PageButtonsContainer,
  PageIndicator
} from 'common/styles/teamformation/teamFormationInboxModalStyles';
import {
  ModalBody,
  ModalHeading
} from 'common/styles/teamformation/teamFormationModalStyles';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import { refreshHeadingSectionData } from 'actions/teamFormation';
import { API_ROOT } from 'index';
import {
  CommonModalProps,
  ConnectionError,
  IdsResponse,
  NoPermissionError,
  RootState,
  TeamFormationParticipantInvitation,
  UnknownError
} from 'types';

import closeIcon from 'assets/icons/close.svg';
import arrowLeftIcon from 'assets/icons/arrow-left.svg';
import arrowRightIcon from 'assets/icons/arrow-right.svg';

const ParticipantInboxModal = (props: CommonModalProps): JSX.Element => {
  const { show, setShow } = props;

  const dispatch = useDispatch();
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [invitationIds, setInvitationIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [
    currentInvitationData,
    setCurrentInvitationData
  ] = useState<TeamFormationParticipantInvitation | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (show) {
      setDataLoaded(false);
      getParticipantInbox().catch((err) => handleError(err));
    } else {
      // Reset state
      setInvitationIds([]);
      setCurrentIndex(null);
      setCurrentInvitationData(null);
    }
  }, [show]);

  useEffect(() => {
    if (currentIndex !== null && invitationIds[currentIndex] !== undefined) {
      getInvitationData(currentIndex).catch((err) => handleError(err));
    }
  }, [currentIndex, invitationIds]);

  const getParticipantInbox = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/participants/inbox`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const resBody: IdsResponse = await res.json();

      if (resBody.ids.length > 0) {
        // Reset to beginning of invitations
        setInvitationIds(resBody.ids);
        setCurrentIndex(0);
      } else {
        resetInboxState();
        setDataLoaded(true);
      }
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getParticipantInbox(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const getInvitationData = async (
    id: number,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    if (currentIndex === null) return;

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/teamFormation/participants/invitations/${invitationIds[currentIndex]}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const resBody: TeamFormationParticipantInvitation = await res.json();
      setCurrentInvitationData(resBody);
      setDataLoaded(true);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getParticipantInbox(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const setCurrentInvitationAccepted = async (
    invitationAccepted: boolean | null,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    if (currentIndex === null) return;

    const reqBody = {
      accepted: invitationAccepted
    };

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/teamFormation/participants/invitations/${invitationIds[currentIndex]}/setInvitationAccepted`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reqBody)
        }
      );
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      switch (invitationAccepted) {
        case true:
          toast.success(
            'Successfully accepted the invitation! Welcome to the team!'
          );
          dispatch(refreshHeadingSectionData());
          history.push('/teamformation');
          break;
        case false:
          toast.success('The invitation has been dismissed.');
          break;
        case null:
          toast.success('The invitation decision has been reset.');
      }

      if (invitationIds[currentIndex + 1] !== undefined) {
        // Advance to the next invitation
        setInvitationIds(
          invitationIds.filter((id) => id !== invitationIds[currentIndex])
        );
      } else if (invitationIds[currentIndex - 1] !== undefined) {
        // Advance to the previous invitation
        setInvitationIds(
          invitationIds.filter((id) => id !== invitationIds[currentIndex])
        );
        setCurrentIndex(currentIndex - 1);
      } else {
        resetInboxState();
      }
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await setCurrentInvitationAccepted(invitationAccepted, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const resetInboxState = () => {
    setInvitationIds([]);
    setCurrentIndex(null);
    setCurrentInvitationData(null);
  };

  const handleSetCurrentInvitationAccepted = async (
    requestAccepted: boolean | null
  ) => {
    try {
      await setCurrentInvitationAccepted(requestAccepted);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <Modal
      show={show}
      size="lg"
      onHide={() => setShow(false)}
      dialogClassName="modal-fullscreen-lg-down"
      handleClose={() => setShow(false)}
    >
      <ModalBody>
        <CloseButtonContainer>
          <CloseButton onClick={() => setShow(false)}>
            <CloseIconImg src={closeIcon} alt="Close Your Inbox" />
          </CloseButton>
        </CloseButtonContainer>

        <ModalHeading>Your Inbox</ModalHeading>

        {show &&
          (dataLoaded ? (
            <>
              {currentInvitationData !== null ? (
                <>
                  <TeamCard
                    teamData={currentInvitationData.invitingTeam}
                    showActionButton={false}
                  />

                  <TeamFormationMessage>
                    {currentInvitationData.message}
                  </TeamFormationMessage>

                  <DecisionButtonContainer>
                    <OverlayTrigger
                      overlay={
                        currentInvitationData.invitingTeam.members.length >=
                        currentInvitationData.invitingTeam.size ? (
                          <Tooltip
                            id={`team-${currentInvitationData.invitingTeam.id}-full-tooltip`}
                          >
                            This team is full.
                          </Tooltip>
                        ) : (
                          <span />
                        )
                      }
                    >
                      <span>
                        <DecisionButton
                          variant="success"
                          onClick={async () => {
                            if (
                              confirm(
                                'By accepting this invitation, you will be hidden from the participant browser. If you have received any other invitations, they will remain in your inbox. Continue?'
                              )
                            ) {
                              await handleSetCurrentInvitationAccepted(true);
                            } else {
                              toast('Not accepted');
                              return;
                            }
                          }}
                          disabled={
                            currentInvitationData.invitingTeam.members.length >=
                            currentInvitationData.invitingTeam.size
                          }
                        >
                          Accept and Join Team
                        </DecisionButton>
                      </span>
                    </OverlayTrigger>

                    <DecisionButton
                      variant="danger"
                      onClick={() => handleSetCurrentInvitationAccepted(false)}
                    >
                      Decline Invitation
                    </DecisionButton>
                  </DecisionButtonContainer>
                </>
              ) : (
                <DisplayText>
                  There are no new invitations in your inbox at this time.
                </DisplayText>
              )}

              {currentIndex !== null && (
                <PageButtonsContainer>
                  <PageButton
                    variant="secondary"
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    disabled={currentIndex === 0}
                  >
                    <PageButtonIcon
                      src={arrowLeftIcon}
                      alt="Go To Previous Invitation"
                    />
                  </PageButton>

                  <PageIndicator>
                    {currentIndex + 1} / {invitationIds.length}
                  </PageIndicator>

                  <PageButton
                    variant="secondary"
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    disabled={invitationIds.length - 1 === currentIndex}
                  >
                    <PageButtonIcon
                      src={arrowRightIcon}
                      alt="Go To Next Invitation"
                    />
                  </PageButton>
                </PageButtonsContainer>
              )}
            </>
          ) : (
            <DisplayText>Loading...</DisplayText>
          ))}
      </ModalBody>
    </Modal>
  );
};

export default ParticipantInboxModal;
