import React, { FormEvent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Form from 'react-bootstrap/Form';

import { ParticipantHeadingSection } from 'components/teamformation';
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
import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import { API_ROOT } from 'index';
import {
  ConnectionError,
  NoPermissionError,
  RootState,
  TeamFormationTeamSearchResponse,
  UnknownError
} from 'types';

import loadingIcon from 'assets/icons/loading.svg';

const TeamFormationTeamHome = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [searchQuery, setSearchQuery] = useState('');

  const [
    personalizedTeams,
    setPersonalizedTeams
  ] = useState<TeamFormationTeamSearchResponse>();
  const [submitting, setSubmitting] = useState(false);
  const [teamsLoaded, setTeamsLoaded] = useState(false);

  useEffect(() => {
    getPersonalizedTeams().catch((err) => handleError(err));
  }, []);

  const getPersonalizedTeams = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/teams?personalized=true`, {
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
      <ParticipantHeadingSection />

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
                  <StyledTeamCard teamData={team} key={team.id} />
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
          >
            Browse All Teams
          </LinkButton>
        </LinkButtonContainer>
      </PersonalizedResultsSection>
    </>
  );
};

export default TeamFormationTeamHome;
