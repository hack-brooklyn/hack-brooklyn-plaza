import React, { FormEvent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import queryString from 'query-string';
import Form from 'react-bootstrap/Form';

import {
  LoadingIndicator,
  MessageText,
  ResultsGrid,
  SearchForm,
  SearchLoadingSpinner,
  SearchSection,
  StyledParticipantCard
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
  TeamFormationParticipant,
  TeamFormationParticipantSearchParams,
  TeamFormationParticipantSearchResponse,
  UnknownError
} from 'types';

import loadingIcon from 'assets/icons/loading.svg';

const TeamFormationParticipantSearch = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  // Whether or not the participant has a team
  const [participantHasTeam, setParticipantHasTeam] = useState(false);
  // Whether or not the participant's team has room remaining for new members to join
  const [participantTeamHasRoom, setParticipantTeamHasRoom] = useState(false);
  // The state to hold the controlled search box input value
  const [searchBoxInputValue, setSearchBoxInputValue] = useState('');
  // The current search query's state, updated on each search query change only
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string | null>(
    null
  );
  const [currentParticipants, setCurrentParticipants] = useState<
    TeamFormationParticipant[]
  >([]);
  const [totalFoundParticipants, setTotalFoundParticipants] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // Local state to handle infinite scroll and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchingSearchResults, setFetchingSearchResults] = useState(false);

  useEffect(() => {
    // Get whether or not the participant has a team already
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
    setParticipantHasTeam(participantData.team !== null);
    setParticipantTeamHasRoom(
      participantData.team.members.length < participantData.team.size
    );
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

    const searchOptions: TeamFormationParticipantSearchParams = {
      searchQuery: searchQuery === '' ? undefined : searchQuery,
      page: page,
      hideSentInvitations: true
    };
    const queryParams = '?' + queryString.stringify(searchOptions);

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/teamFormation/participants${queryParams}`,
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
      const resBody: TeamFormationParticipantSearchResponse = await res.json();

      if (isNewSearch) {
        setCurrentParticipants(resBody.participants);
      } else {
        setCurrentParticipants(
          currentParticipants.concat(resBody.participants)
        );
      }

      setTotalPages(resBody.pages);
      setTotalFoundParticipants(resBody.totalFoundParticipants);
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
          <StyledCenteredH2>
            {fetchingSearchResults
              ? // Waiting for search results
                'Searching...'
              : // Search results with result count
              currentSearchQuery !== null && currentSearchQuery !== ''
              ? `${totalFoundParticipants} result${
                  totalFoundParticipants === 1 ? '' : 's'
                }
                for "${currentSearchQuery}"`
              : // No search query
                'Browse Participants'}
          </StyledCenteredH2>
        </StyledCenteredH2>

        <SearchForm
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setCurrentSearchQuery(searchBoxInputValue);
          }}
        >
          <Form.Group controlId="tfParticipantSearch">
            <Form.Control
              name="query"
              type="text"
              placeholder="Search participants..."
              onChange={(e) => setSearchBoxInputValue(e.target.value)}
              value={searchBoxInputValue}
              disabled={fetchingSearchResults}
            />
          </Form.Group>
        </SearchForm>

        <InfiniteScroll
          next={continueInfiniteScroll}
          hasMore={currentPage < totalPages}
          dataLength={currentParticipants.length}
          loader={
            <LoadingIndicator>
              <div>Loading...</div>
              <SearchLoadingSpinner
                src={loadingIcon}
                alt="Loading participants..."
              />
            </LoadingIndicator>
          }
          endMessage={null}
          style={{ overflow: 'visible' }}
        >
          {currentParticipants.length > 0 ? (
            <ResultsGrid>
              {currentParticipants.map((participant) => (
                <StyledParticipantCard
                  participantData={participant}
                  showActionButton={
                    participantHasTeam && participantTeamHasRoom
                  }
                  key={participant.id}
                />
              ))}
            </ResultsGrid>
          ) : (
            <MessageText>No participants were found.</MessageText>
          )}
        </InfiniteScroll>
      </SearchSection>
    </>
  );
};

export default TeamFormationParticipantSearch;
