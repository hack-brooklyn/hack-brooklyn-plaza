import React, { FormEvent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Form from 'react-bootstrap/Form';

import {
  PersonalizedResultsSection,
  ResultsGrid,
  SearchForm,
  StyledTeamCard,
  TitleArea,
  VisibilityStatus,
  VisibilityStatusText
} from 'common/styles/teamFormationBrowserStyles';
import { HeadingSection, StyledCenteredH2, StyledH1 } from 'commonStyles';
import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import { API_ROOT } from 'index';
import {
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  RootState,
  TeamFormationParticipant,
  TeamFormationTeam,
  UnknownError
} from 'types';

import browserVisibleIcon from 'assets/icons/team-formation/browser-visible.svg';
import browserHiddenIcon from 'assets/icons/team-formation/browser-hidden.svg';

const TeamFormationTeamBrowser = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [query, setQuery] = useState('');
  const [
    participantData,
    setParticipantData
  ] = useState<TeamFormationParticipant>();
  const [featuredTeams, setFeaturedTeams] = useState<TeamFormationTeam[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeamBrowser().catch((err) => {
      handleError(err);
    });
  }, []);

  const loadTeamBrowser = async () => {
    await getParticipantData();
    await getPersonalizedTeams();
  };

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
      setFeaturedTeams(resBody);
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

    const encodedQuery = encodeURIComponent(query);
    history.push(`/teamformation/teams/search?query=${encodedQuery}`);

    setSubmitting(false);
  };

  return (
    <>
      <HeadingSection>
        <TitleArea>
          <StyledH1>Team Formation</StyledH1>

          {participantData !== undefined && (
            <VisibilityStatus>
              {participantData.visibleInBrowser ? (
                <img src={browserVisibleIcon} alt="Visible in browser icon" />
              ) : (
                <img src={browserHiddenIcon} alt="Hidden from browser icon" />
              )}

              <VisibilityStatusText>
                Your profile is currently
                {participantData.visibleInBrowser
                  ? ' visible on '
                  : ' hidden from '}
                the participant browser.
              </VisibilityStatusText>
            </VisibilityStatus>
          )}
        </TitleArea>
      </HeadingSection>

      <PersonalizedResultsSection>
        <StyledCenteredH2>Browse Teams</StyledCenteredH2>

        <SearchForm onSubmit={searchTeams}>
          <Form.Group controlId="tfTeamBrowserSearch">
            <Form.Control
              name="query"
              type="text"
              placeholder="Search teams..."
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              disabled={submitting}
              required
            />
          </Form.Group>
        </SearchForm>

        <ResultsGrid>
          {featuredTeams.map((team) => (
            <StyledTeamCard teamData={team} key={team.id} />
          ))}
        </ResultsGrid>
      </PersonalizedResultsSection>
    </>
  );
};

export default TeamFormationTeamBrowser;
