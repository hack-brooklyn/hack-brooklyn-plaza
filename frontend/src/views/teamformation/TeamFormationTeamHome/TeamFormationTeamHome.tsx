import React, { FormEvent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import queryString from 'query-string';
import Form from 'react-bootstrap/Form';

import { LinkButton } from 'components';
import {
  LinkButtonContainer,
  LoadingSection,
  LoadingSpinner,
  MessageText,
  PersonalizedResultsSection,
  ResultsGrid,
  SearchForm,
  StyledTeamCard
} from 'common/styles/teamformation/teamFormationBrowserStyles';
import { StyledCenteredH2 } from 'common/styles/commonStyles';
import { getParticipantData } from 'util/teamFormation';
import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import { API_ROOT } from 'index';
import {
  ConnectionError,
  NoPermissionError,
  RootState,
  TeamFormationTeamSearchParams,
  TeamFormationTeamSearchResponse,
  UnknownError
} from 'types';

import loadingIcon from 'assets/icons/loading.svg';

const TeamFormationTeamHome = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  // Whether or not the participant has a team.
  const [participantDoesNotHaveTeam, setParticipantDoesNotHaveTeam] = useState(
    false
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [
    personalizedTeams,
    setPersonalizedTeams
  ] = useState<TeamFormationTeamSearchResponse>();
  const [submitting, setSubmitting] = useState(false);
  const [teamsLoaded, setTeamsLoaded] = useState(false);

  useEffect(() => {
    loadTeamHome().catch((err) => handleError(err));
  }, []);

  const loadTeamHome = async () => {
    await checkParticipantTeamStatus();
    await getPersonalizedTeams();
  };

  const checkParticipantTeamStatus = async () => {
    const participantData = await getParticipantData(history);
    setParticipantDoesNotHaveTeam(participantData.team === null);
  };

  const getPersonalizedTeams = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    const searchOptions: TeamFormationTeamSearchParams = {
      personalized: true,
      hideSentJoinRequests: true
    };
    const queryParams = '?' + queryString.stringify(searchOptions);

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/teams${queryParams}`, {
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
      setPersonalizedTeams(resBody);
      setTeamsLoaded(true);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getPersonalizedTeams(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const searchTeams = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const encodedSearchQuery = encodeURIComponent(searchQuery);
    history.push(`/teamformation/teams/search?query=${encodedSearchQuery}`);

    setSubmitting(false);
  };

  return (
    <>
      <PersonalizedResultsSection>
        <StyledCenteredH2>Teams for You</StyledCenteredH2>

        <SearchForm onSubmit={searchTeams}>
          <Form.Group controlId="tfTeamBrowserSearch">
            <Form.Control
              name="query"
              type="text"
              placeholder="Search teams..."
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              disabled={submitting}
              required
            />
          </Form.Group>
        </SearchForm>

        {teamsLoaded ? (
          <>
            {personalizedTeams && personalizedTeams.teams.length > 0 ? (
              <ResultsGrid>
                {personalizedTeams.teams.map((team) => (
                  <StyledTeamCard
                    teamData={team}
                    showActionButton={participantDoesNotHaveTeam}
                    key={team.id}
                  />
                ))}
              </ResultsGrid>
            ) : (
              <MessageText>
                No teams were found that match your interests at this time.
                <br />
                Please check back later or try browsing all the other teams for
                now!
              </MessageText>
            )}
          </>
        ) : (
          <LoadingSection>
            <MessageText>
              Finding teams that best match your interests, please wait...
            </MessageText>

            <LoadingSpinner src={loadingIcon} alt="Loading teams..." />
          </LoadingSection>
        )}

        <LinkButtonContainer>
          <LinkButton
            to="/teamformation/teams/search"
            variant="secondary"
            size="lg"
            centered={true}
          >
            Browse All Teams
          </LinkButton>
        </LinkButtonContainer>
      </PersonalizedResultsSection>
    </>
  );
};

export default TeamFormationTeamHome;
