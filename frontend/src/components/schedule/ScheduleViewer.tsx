import React, { Dispatch, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { Event } from './';
import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import { API_ROOT } from 'index';
import {
  Breakpoints,
  ConnectionError,
  EventData,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';

dayjs.extend(utc);
dayjs.extend(timezone);

interface EventState {
  [key: string]: EventData[];
}

interface ScheduleViewerProps {
  selectEvent: (id: EventData) => void;
  savedOnly?: boolean;
  showSaveButton?: boolean;
  refresh?: boolean;
  setRefresh?: Dispatch<React.SetStateAction<boolean>>;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEvent?: EventData;
}

const ScheduleViewer = (props: ScheduleViewerProps): JSX.Element => {
  const {
    refresh,
    selectEvent,
    selectedEvent,
    setRefresh,
    savedOnly,
    showSaveButton,
    setShow
  } = props;

  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [events, setEvents] = useState<EventState>({});

  useEffect(() => {
    getSavedEventIds()
      .then(getEvents)
      .then(refreshSavedEvents)
      .catch((err) => handleError(err));
  }, [refresh]);

  const toggleRefresh = () => {
    if (setRefresh) {
      setRefresh(!refresh);
    }
  };

  const refreshSavedEvents = async (
    arr: (number[] | EventState)[] | [any, any]
  ) => {
    const [newEvents, saved] = arr;
    const temp = JSON.parse(JSON.stringify(newEvents));

    Object.keys(newEvents).forEach((key) => {
      for (let i = 0; i < temp[key].length; i++) {
        const e: EventData = temp[key][i];
        e.saved = saved.includes(e.id);
        if (selectedEvent && selectedEvent.id === e.id) {
          selectEvent(e);
        }
      }
    });

    setEvents(temp);
    if (setRefresh) {
      setRefresh(false);
    }
  };

  const getEvents = async (
    saved: number[],
    overriddenAccessToken?: string
  ): Promise<(number[] | EventState)[]> => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/events`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const events: EventData[] = await res.json();

      // Categorize events by date
      const eventsByDate: EventState = {};
      events.forEach((event: EventData) => {
        const day = dayjs(event.startTime).format('ddd, M/DD');
        if (!eventsByDate[day]) {
          eventsByDate[day] = [event];
        } else {
          eventsByDate[day].push(event);
        }
      });

      return [eventsByDate, saved];
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      return await getEvents(saved, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const getSavedEventIds = async (
    overriddenAccessToken?: string
  ): Promise<number[]> => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/events/save`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      return await res.json();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      return await getSavedEventIds(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const displayEventsForDate = (date: string) => {
    return events[date]
      .filter((event) =>
        savedOnly
          ? event.saved && new Date(event.endTime) > new Date(Date.now())
          : true
      )
      .map((event: EventData) => (
        <EventCardLink
          to={`/schedule/${event.id}`}
          onClick={() => setShow && setShow(true)}
          key={event.id}
        >
          <Event
            event={event}
            toggleRefresh={toggleRefresh}
            showSaveButton={showSaveButton}
          />
        </EventCardLink>
      ));
  };

  return (
    <ViewerContainer>
      <EventContainer>
        {Object.keys(events).length > 0
          ? // Display events for each found date
            Object.keys(events).map((date, idx) => {
              if (savedOnly) {
                // Show only dates with events in them
                if (
                  events[date].filter(
                    (event) =>
                      event.saved &&
                      new Date(event.endTime) > new Date(Date.now())
                  ).length > 0
                ) {
                  return (
                    <>
                      <DayHeading>{date}</DayHeading>
                      <DayContainer key={idx}>
                        {displayEventsForDate(date)}
                      </DayContainer>
                    </>
                  );
                }
              } else {
                return (
                  <>
                    <DayHeading>{date}</DayHeading>
                    <DayContainer key={idx}>
                      {displayEventsForDate(date)}
                    </DayContainer>
                  </>
                );
              }
            })
          : !savedOnly && (
              <NoEventsMessage>
                There are no events at this time.
              </NoEventsMessage>
            )}
      </EventContainer>
    </ViewerContainer>
  );
};

const NoEventsMessage = styled.div`
  text-align: center;
  margin: 1rem auto;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    width: 25rem;
  }
`;

const ViewerContainer = styled.div`
  @media screen and (min-width: ${Breakpoints.Large}px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }
`;

const EventContainer = styled.div`
  overflow-scrolling: auto;
  overflow-y: scroll;
  padding: 0 0.5rem 9rem;
  width: 100%;
  height: 100%;

  &::-webkit-scrollbar {
    display: none;
  }

  & h2 {
    width: 100%;
    background-color: white;
    position: sticky;
    margin-top: 1rem;
    top: 0;
  }

  & > p {
    margin-top: 1rem;
    text-align: center;
  }
`;

const DayContainer = styled.div`
  text-align: center;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    display: flex;
    flex-direction: column;
    text-align: left;
    background-color: white;
  }
`;

const DayHeading = styled.h2`
  position: sticky;
  margin-bottom: 0;
  outline: 5px solid white;
`;

const EventCardLink = styled(Link)`
  text-align: left;
  cursor: pointer;
  text-decoration: none;
  color: black;
  align-self: center;
  width: 100%;

  &:hover {
    color: black;
  }
`;

export default ScheduleViewer;
