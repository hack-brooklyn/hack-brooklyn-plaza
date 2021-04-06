import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

import { ParticipantCard } from 'components/teamformation';
import {
  ModalBody,
  ModalHeading
} from 'common/styles/teamformation/teamFormationModalStyles';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import { API_ROOT } from 'index';
import {
  Breakpoints,
  CommonModalProps,
  ConnectionError,
  IdsResponse,
  NoPermissionError,
  RootState,
  TeamFormationJoinRequest,
  TeamFormationParticipantNotInTeamError,
  UnknownError
} from 'types';

import closeIcon from 'assets/icons/close.svg';
import arrowLeftIcon from 'assets/icons/arrow-left.svg';
import arrowRightIcon from 'assets/icons/arrow-right.svg';

const TeamInboxModal = (props: CommonModalProps): JSX.Element => {
  const { show, setShow } = props;

  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [requestIds, setRequestIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [
    currentRequestData,
    setCurrentRequestData
  ] = useState<TeamFormationJoinRequest | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (show) {
      setDataLoaded(false);
      getTeamInbox().catch((err) => handleError(err));
    } else {
      // Reset state
      setRequestIds([]);
      setCurrentIndex(null);
      setCurrentRequestData(null);
    }
  }, [show]);

  useEffect(() => {
    if (currentIndex !== null && requestIds[currentIndex] !== undefined) {
      getJoinRequestData(currentIndex).catch((err) => handleError(err));
    }
  }, [currentIndex, requestIds]);

  const getTeamInbox = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/teams/inbox`, {
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
        // Reset to beginning of messages
        setRequestIds(resBody.ids);
        setCurrentIndex(0);
      } else {
        resetInboxState();
        setDataLoaded(true);
      }
    } else if (res.status === 404) {
      throw new TeamFormationParticipantNotInTeamError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getTeamInbox(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const getJoinRequestData = async (
    id: number,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    if (currentIndex === null) return;

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/teamFormation/teams/joinRequests/${requestIds[currentIndex]}`,
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
      const resBody: TeamFormationJoinRequest = await res.json();
      setCurrentRequestData(resBody);
      setDataLoaded(true);
    } else if (res.status === 404) {
      throw new TeamFormationParticipantNotInTeamError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getTeamInbox(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const setCurrentRequestAccepted = async (
    requestAccepted: boolean | null,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    if (currentIndex === null) return;

    const reqBody = {
      requestAccepted: requestAccepted
    };

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/teamFormation/teams/joinRequests/${requestIds[currentIndex]}/setRequestAccepted`,
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
      switch (requestAccepted) {
        case true:
          toast.success('Invitation sent!');
          break;
        case false:
          toast.success('The join request has been dismissed.');
          break;
        case null:
          toast.success('The join request decision has been reset.');
      }

      if (requestIds[currentIndex + 1] !== undefined) {
        // Advance to the next join request
        setRequestIds(
          requestIds.filter((id) => id !== requestIds[currentIndex])
        );
      } else if (requestIds[currentIndex - 1] !== undefined) {
        // Advance to the previous join request
        setRequestIds(
          requestIds.filter((id) => id !== requestIds[currentIndex])
        );
        setCurrentIndex(currentIndex - 1);
      } else {
        resetInboxState();
      }
    } else if (res.status === 404) {
      throw new TeamFormationParticipantNotInTeamError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await setCurrentRequestAccepted(requestAccepted, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const resetInboxState = () => {
    setRequestIds([]);
    setCurrentIndex(null);
    setCurrentRequestData(null);
  };

  const handleSetCurrentRequestAccepted = async (
    requestAccepted: boolean | null
  ) => {
    try {
      await setCurrentRequestAccepted(requestAccepted);
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
            <CloseIconImg src={closeIcon} alt="Close Team Inbox" />
          </CloseButton>
        </CloseButtonContainer>

        <ModalHeading>Team Inbox</ModalHeading>

        {show &&
          (dataLoaded ? (
            <>
              {currentRequestData !== null ? (
                <>
                  <ParticipantCard
                    participantData={currentRequestData.requestingParticipant}
                    showActionButton={false}
                  />

                  <TeamFormationMessage>
                    {currentRequestData.message}
                  </TeamFormationMessage>

                  <DecisionButtonContainer>
                    <DecisionButton
                      variant="success"
                      onClick={() => handleSetCurrentRequestAccepted(true)}
                    >
                      Accept and Send Invitation
                    </DecisionButton>

                    <DecisionButton
                      variant="danger"
                      onClick={() => handleSetCurrentRequestAccepted(false)}
                    >
                      Dismiss Join Request
                    </DecisionButton>
                  </DecisionButtonContainer>
                </>
              ) : (
                <DisplayText>
                  There are no new join requests in your team&apos;s inbox at
                  this time.
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
                      alt="Go To Previous Join Request"
                    />
                  </PageButton>

                  <PageIndicator>
                    {currentIndex + 1} / {requestIds.length}
                  </PageIndicator>

                  <PageButton
                    variant="secondary"
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    disabled={requestIds.length - 1 === currentIndex}
                  >
                    <PageButtonIcon
                      src={arrowRightIcon}
                      alt="Go To Next Join Request"
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

const TeamFormationMessage = styled.p`
  margin: 1.5rem auto;
  max-width: 600px;
`;

const CloseButtonContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-bottom: -2.25rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0;
`;

const CloseIconImg = styled.img`
  height: 2rem;
  width: 2rem;
`;

const DecisionButton = styled(Button)`
  width: 100%;
  margin-bottom: 0.75rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    width: auto;
  }
`;

const DecisionButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PageButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PageButtonIcon = styled.img`
  width: 1.5rem;
  height: 1.5rem;
`;

const PageButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
`;

const PageIndicator = styled.div`
  font-weight: bold;
  margin: 0 1.5rem;
`;

const DisplayText = styled.div`
  font-size: 1.1rem;
  text-align: center;
  padding-top: 1rem;
  padding-bottom: 34rem;
`;

export default TeamInboxModal;
