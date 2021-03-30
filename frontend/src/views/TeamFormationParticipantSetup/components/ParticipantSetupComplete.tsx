import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';

import { LinkButton, TeamFormationParticipantCard } from 'components';
import { TFLinkButtonContainer } from 'common/styles/teamFormationSetupStyles';
import { SetupParagraph, SetupSection, StyledCenteredH3 } from 'commonStyles';
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
      res = await fetch(`${API_ROOT}/teamFormation/participants/userData`, {
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
    <SetupSection>
      <StyledSetupParagraph>
        Your profile has been created and is now visible on the participant
        browser! Below is a preview of what your profile will look like to other
        teams.
      </StyledSetupParagraph>

      {participantData !== undefined && (
        <PreviewCardContainer>
          <TeamFormationParticipantCard data={participantData} />
        </PreviewCardContainer>
      )}

      <div>
        <StyledCenteredH3>Browse for Teams</StyledCenteredH3>
        <SetupParagraph>
          Ready to find a team to join? Head on over to the team browser to
          discover teams looking for team members to work with.
        </SetupParagraph>

        <TFLinkButtonContainer>
          <LinkButton
            variant="primary"
            to="/teamformation"
            overrideActiveStyles
          >
            Browse Teams
          </LinkButton>
        </TFLinkButtonContainer>
      </div>
    </SetupSection>
  );
};

const StyledSetupParagraph = styled(SetupParagraph)`
  margin-bottom: 2rem;
`;

const PreviewCardContainer = styled.div`
  margin-bottom: 2rem;
`;

export default ParticipantSetupComplete;
