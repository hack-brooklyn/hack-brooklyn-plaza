import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { TeamCard } from 'components/TeamFormation';
import { LinkButton } from 'components';
import {
  CompletedViewMessage,
  CompleteViewSection,
  TFLinkButtonContainer
} from 'common/styles/teamFormationSetupStyles';
import { SetupParagraph, StyledCenteredH3 } from 'commonStyles';
import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import {
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  RootState,
  TeamFormationTeam,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

const TeamSetupComplete = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [teamData, setParticipantData] = useState<TeamFormationTeam>();

  useEffect(() => {
    getParticipantData().catch((err) => {
      handleError(err);
    });
  }, []);

  const getParticipantData = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/teams/userData`, {
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
          Your personal profile and team have been created and your team is now
          visible on the team browser!{' '}
          {teamData !== undefined &&
            'Below is a preview of what your team will look like to other participants.'}
        </CompletedViewMessage>

        {teamData !== undefined && (
          <TeamCard teamData={teamData} />
        )}
      </CompleteViewSection>

      <CompleteViewSection>
        <StyledCenteredH3>Invite Your Team</StyledCenteredH3>
        <SetupParagraph>
          To invite your current team members to your team, have them go to the
          Team Formation home screen, select &quot;I don’t have a team yet and
          am currently looking for a team to join&quot;, setup their profiles,
          and search for your team&apos;s name
          {teamData !== undefined && (
            <>
              , <strong>{teamData.name}</strong>,
            </>
          )}{' '}
          on the team browser.
        </SetupParagraph>
      </CompleteViewSection>

      <CompleteViewSection>
        <StyledCenteredH3>Browse for Participants</StyledCenteredH3>
        <SetupParagraph>
          Ready to find new members to join your team? Head on over to the
          participant browser to discover participants looking for a team to
          work with.
        </SetupParagraph>

        <TFLinkButtonContainer>
          <LinkButton
            variant="primary"
            to="/teamformation/participants"
            overrideActiveStyles
          >
            Browse Participants
          </LinkButton>
        </TFLinkButtonContainer>
      </CompleteViewSection>
    </>
  );
};

export default TeamSetupComplete;
