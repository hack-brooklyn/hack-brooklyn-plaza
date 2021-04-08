import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ParticipantCard } from 'components/teamformation';
import { LinkButton } from 'components';
import {
  CompletedViewMessage,
  CompleteViewSection,
  TFLinkButtonContainer
} from 'common/styles/teamformation/teamFormationSetupStyles';
import { SetupParagraph, StyledCenteredH3 } from 'common/styles/commonStyles';
import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import {
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  RootState,
  TeamFormationParticipant,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

const ParticipantSetupComplete = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [
    participantData,
    setParticipantData
  ] = useState<TeamFormationParticipant>();

  useEffect(() => {
    getParticipantData().catch((err) => {
      handleError(err);
    });
  }, []);

  const getParticipantData = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/participants/currentUser`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const resBody = await res.json();
      setParticipantData(resBody);
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getParticipantData(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <>
      <CompleteViewSection>
        <CompletedViewMessage>
          Your profile has been created and is now visible on the participant
          browser!{' '}
          {participantData !== undefined &&
            'Below is a preview of what your profile will look like to other teams.'}
        </CompletedViewMessage>

        {participantData !== undefined && (
          <ParticipantCard
            participantData={participantData}
            showActionButton={false}
          />
        )}
      </CompleteViewSection>

      <CompleteViewSection>
        <StyledCenteredH3>Browse for Teams</StyledCenteredH3>
        <SetupParagraph>
          Ready to find a team to join? Head on over to the team browser to
          discover teams looking for team members to work with.
        </SetupParagraph>

        <TFLinkButtonContainer>
          <LinkButton
            variant="primary"
            to="/teamformation/teams"
            overrideActiveStyles
          >
            Browse Teams
          </LinkButton>
        </TFLinkButtonContainer>
      </CompleteViewSection>
    </>
  );
};

export default ParticipantSetupComplete;
