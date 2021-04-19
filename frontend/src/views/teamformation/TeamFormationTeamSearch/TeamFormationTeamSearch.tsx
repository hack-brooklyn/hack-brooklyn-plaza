import React, { FormEvent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import InfiniteScroll from 'react-infinite-scroll-component';
import queryString from 'query-string';
import Form from 'react-bootstrap/Form';

import { LinkButton } from 'components';
import {
  LinkButtonContainer,
  LoadingIndicator,
  MessageText,
  ResultsGrid,
  SearchForm,
  SearchLoadingSpinner,
  SearchSection,
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
  TeamFormationTeam,
  TeamFormationTeamSearchParams,
  TeamFormationTeamSearchResponse,
  UnknownError
} from 'types';

import loadingIcon from 'assets/icons/loading.svg';

const TeamFormationTeamSearch = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [participantDoesNotHaveTeam, setParticipantDoesNotHaveTeam] = useState(
    false
  );
  // The state to hold the controlled search box input value
  const [searchBoxInputValue, setSearchBoxInputValue] = useState('');
  // The current search query's state, updated on each search query change only
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string | null>(
    null
  );
  const [currentTeams, setCurrentTeams] = useState<TeamFormationTeam[]>([]);
  const [totalFoundTeams, setTotalFoundTeams] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // Local state to handle infinite scroll and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchingSearchResults, setFetchingSearchResults] = useState(false);

  useEffect(() => {
    checkParticipantTeamStatus().catch((err) => handleError(err));

    // Parse the search query on page load
    parseSearchQuery();

    // Listen for location change events and update the search query when it changes
    const unlisten = history.listen(parseSearchQuery);

    return () => {
      unlisten();
    };
  }, []);

  // Listen for changes to the search query and perform a new search on change
  useEffect(() => {
    if (currentSearchQuery !== null) {
      setFetchingSearchResults(true);

      // Sync the current search query with the search box
      setSearchBoxInputValue(currentSearchQuery);

      // Reset the user's current scroll page
      // Other search query states will be reset after the search is performed
      setCurrentPage(1);
      sendSearchRequest(currentSearchQuery, 1, true)
        .catch((err) => {
          handleError(err);
        })
        .finally(() => {
          setFetchingSearchResults(false);
        });
    }
  }, [currentSearchQuery]);

  const checkParticipantTeamStatus = async () => {
    const participantData = await getParticipantData(history);
    setParticipantDoesNotHaveTeam(participantData.team === null);
  };

  const parseSearchQuery = () => {
    const parsed = queryString.parse(location.search);
    if (parsed.query) {
      setCurrentSearchQuery(parsed.query as string);
    } else {
      setCurrentSearchQuery('');
    }
  };

  const continueInfiniteScroll = async () => {
    if (currentSearchQuery !== null) {
      setFetchingSearchResults(true);
      setCurrentPage(currentPage + 1);

      try {
        await sendSearchRequest(currentSearchQuery, currentPage + 1, false);
      } catch (err) {
        handleError(err);
      } finally {
        setFetchingSearchResults(false);
      }
    }
  };

  const sendSearchRequest = async (
    searchQuery: string,
    page: number,
    isNewSearch: boolean,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    const searchOptions: TeamFormationTeamSearchParams = {
      searchQuery: searchQuery === '' ? undefined : searchQuery,
      page: page,
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
      const resBody: TeamFormationTeamSearchResponse = await res.json();

      if (isNewSearch) {
        setCurrentTeams(resBody.teams);
      } else {
        setCurrentTeams(currentTeams.concat(resBody.teams));
      }

      setTotalPages(resBody.pages);
      setTotalFoundTeams(resBody.totalFoundTeams);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendSearchRequest(searchQuery, page, isNewSearch, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <>
      <SearchSection>
        <StyledCenteredH2>
          {fetchingSearchResults
            ? // Waiting for search results
              'Searching...'
            : // Search results with result count
            currentSearchQuery !== null && currentSearchQuery !== ''
            ? `${totalFoundTeams} result${totalFoundTeams === 1 ? '' : 's'}
                for "${currentSearchQuery}"`
            : // No search query
              'Browse Teams'}
        </StyledCenteredH2>

        <SearchForm
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setCurrentSearchQuery(searchBoxInputValue);
          }}
        >
          <Form.Group controlId="tfTeamSearch">
            <Form.Control
              name="query"
              type="text"
              placeholder="Search teams..."
              onChange={(e) => setSearchBoxInputValue(e.target.value)}
              value={searchBoxInputValue}
              disabled={fetchingSearchResults}
            />
          </Form.Group>
        </SearchForm>

        <InfiniteScroll
          next={continueInfiniteScroll}
          hasMore={currentPage < totalPages}
          dataLength={currentTeams.length}
          loader={
            <LoadingIndicator>
              <div>Loading...</div>
              <SearchLoadingSpinner src={loadingIcon} alt="Loading teams..." />
            </LoadingIndicator>
          }
          endMessage={
            participantDoesNotHaveTeam ? (
              <EndMessageContainer>
                <MessageText>
                  Not finding any teams that interest you? Consider starting
                  your own team!
                </MessageText>

                <MessageText>
                  To begin, select &quot;Create Team&quot; on the top of a Team
                  Formation page, fill out your team profile, and start
                  inviting.
                </MessageText>

                <MessageText>
                  Click the button below to preview all of the participants (and
                  potential team members) that you could invite to your team.
                </MessageText>

                <LinkButtonContainer>
                  <LinkButton
                    to="/teamformation/participants/search"
                    variant="secondary"
                    size="lg"
                    centered={true}
                  >
                    Browse All Participants
                  </LinkButton>
                </LinkButtonContainer>
              </EndMessageContainer>
            ) : null
          }
          style={{ overflow: 'visible' }}
        >
          {currentTeams.length > 0 ? (
            <>
              <ResultsGrid>
                {currentTeams.map((team) => (
                  <StyledTeamCard
                    teamData={team}
                    showActionButton={participantDoesNotHaveTeam}
                    key={team.id}
                  />
                ))}
              </ResultsGrid>
            </>
          ) : (
            <MessageText>No teams were found.</MessageText>
          )}
        </InfiniteScroll>
      </SearchSection>
    </>
  );
};

const EndMessageContainer = styled.div`
  margin: 2rem auto;
`;

export default TeamFormationTeamSearch;
