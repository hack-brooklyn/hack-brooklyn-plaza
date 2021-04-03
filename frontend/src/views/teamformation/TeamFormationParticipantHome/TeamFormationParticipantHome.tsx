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
  StyledParticipantCard
} from 'common/styles/teamformation/teamFormationBrowserStyles';
import { StyledCenteredH2 } from 'common/styles/commonStyles';
import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import { API_ROOT } from 'index';
import {
  ConnectionError,
  NoPermissionError,
  RootState,
  TeamFormationParticipantSearchResponse,
  UnknownError
} from 'types';

import loadingIcon from 'assets/icons/loading.svg';

const TeamFormationParticipantHome = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [searchQuery, setSearchQuery] = useState('');

  const [
    personalizedParticipants,
    setPersonalizedParticipants
  ] = useState<TeamFormationParticipantSearchResponse>();
  const [submitting, setSubmitting] = useState(false);
  const [participantsLoaded, setParticipantsLoaded] = useState(false);

  useEffect(() => {
    getPersonalizedParticipants().catch((err) => handleError(err));
  }, []);

  const getPersonalizedParticipants = async (
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/teamFormation/participants?personalized=true`,
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
      const resBody = await res.json();
      setPersonalizedParticipants(resBody);
      setParticipantsLoaded(true);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getPersonalizedParticipants(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const searchParticipants = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const encodedSearchQuery = encodeURIComponent(searchQuery);
    history.push(
      `/teamformation/participants/search?query=${encodedSearchQuery}`
    );

    setSubmitting(false);
  };

  return (
    <>
      <ParticipantHeadingSection />

      <PersonalizedResultsSection>
        <StyledCenteredH2>Participants for You</StyledCenteredH2>

        <SearchForm onSubmit={searchParticipants}>
          <Form.Group controlId="tfParticipantBrowserSearch">
            <Form.Control
              name="query"
              type="text"
              placeholder="Search participants..."
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              disabled={submitting}
              required
            />
          </Form.Group>
        </SearchForm>

        {participantsLoaded ? (
          <>
            {personalizedParticipants &&
            personalizedParticipants.participants.length > 0 ? (
              <ResultsGrid>
                {personalizedParticipants.participants.map((participant) => (
                  <StyledParticipantCard
                    participantData={participant}
                    key={participant.id}
                  />
                ))}
              </ResultsGrid>
            ) : (
              <MessageText>
                No participants were found that match your interests at this
                time.
                <br />
                Please check back later or try browsing all the other
                participants for now!
              </MessageText>
            )}
          </>
        ) : (
          <LoadingSection>
            <MessageText>
              Finding participants that best match your interests, please
              wait...
            </MessageText>

            <LoadingSpinner src={loadingIcon} alt="Loading participants..." />
          </LoadingSection>
        )}

        <LinkButtonContainer>
          <LinkButton
            to="/teamformation/participants/search"
            variant="secondary"
            size="lg"
          >
            Browse All Participants
          </LinkButton>
        </LinkButtonContainer>
      </PersonalizedResultsSection>
    </>
  );
};

export default TeamFormationParticipantHome;
