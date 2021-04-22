import React, { Dispatch, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import styled from 'styled-components/macro';
import { Button } from 'react-bootstrap';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { API_ROOT } from 'index';
import { handleError } from 'util/plazaUtils';
import { Event } from './index';
import { StyledH1 } from 'common/styles/commonStyles';
import ac, { Resources } from 'security/accessControl';
import {
  Breakpoints,
  ConnectionError,
  EventData,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { refreshAccessToken } from 'util/auth';

dayjs.extend(utc);
dayjs.extend(timezone);

interface EventState {
  [key: string]: EventData[];
}

interface ScheduleViewerProps {
  selectEvent: (id: EventData) => void;
  refresh?: boolean;
  setRefresh?: Dispatch<React.SetStateAction<boolean>>;
  selectedEvent?: EventData;
}

const ScheduleViewer = (props: ScheduleViewerProps): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const userRole = useSelector((state: RootState) => state.user.role);

  const [events, setEvents] = useState<EventState>({});

  useEffect(() => {
    getSavedEventIds()
      .then(getEvents)
      .then(refreshSavedEvents)
      .catch((err: Error) => handleError(err));
  }, [props.refresh]);

  const toggleRefresh = () => {
    if (props.setRefresh) {
      props.setRefresh(!props.refresh);
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
        if (props.selectedEvent && props.selectedEvent.id === e.id) {
          props.selectEvent(e);
        }
      }
    });
    setEvents(temp);
    if (props.setRefresh) {
      props.setRefresh(false);
    }
  };

  const getEvents = async (saved: number[], overriddenAccessToken?: string): Promise<(number[] | EventState)[]> => {
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
      const json = await res.json();

      const newEvents: EventState = {};

      json.forEach((e: EventData) => {
        const day = dayjs(e.startTime).format('ddd, M/DD');
        if (!newEvents[day]) {
          newEvents[day] = [e];
        } else {
          newEvents[day].push(e);
        }
      });

      return [newEvents, saved];
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

  const getSavedEventIds = async (overriddenAccessToken?: string): Promise<number[]> => {
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
      return res.json();
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

  const displayEvents = (date: string) => {
    return events[`${date}`].map((e: EventData, idx: number) => (
      <StyledAnchor
        key={idx}
        onClick={() => {
          props.selectEvent(e);
        }}
      >
        <Event event={e} toggleRefresh={toggleRefresh} />
      </StyledAnchor>
    ));
  };

  return (
    <ViewerContainer>
      <>
        <StyledH1>Schedule Builder</StyledH1>
        {ac.can(userRole).createAny(Resources.Events).granted && (
          <StyledNewButton
            onClick={() => {
              history.push('/schedule/post');
            }}
          >
            New Event
          </StyledNewButton>
        )}
      </>
      <EventContainer>
        {Object.keys(events).length > 0 ? (
          Object.keys(events).map((date, idx) => {
            return (
              <DayContainer key={idx}>
                <h2 style={{ position: 'sticky' }}>{date}</h2>
                {events[`${date}`].length > 0 ? (
                  displayEvents(date)
                ) : (
                  <p>No events for this day</p>
                )}
              </DayContainer>
            );
          })
        ) : (
          <p>There are no events at this time</p>
        )}
      </EventContainer>
    </ViewerContainer>
  );
};

const StyledNewButton = styled(Button)`
  width: 100%;
  @media screen and (min-width: ${Breakpoints.Medium}px) {
    max-width: 32rem;
  }
`;

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 35%;

  @media (max-width: ${Breakpoints.Large}px) {
    width: 100%;
  }
`;

const EventContainer = styled.div`
  overflow-scrolling: auto;
  overflow-y: scroll;
  padding: 0 1rem;
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
  display: flex;
  flex-direction: column;
  text-align: left;

  @media screen and (max-width: ${Breakpoints.Large}px) {
    //max-width: 32rem;
    text-align: center;
  }
`;

const StyledAnchor = styled.a`
  text-align: left;
  cursor: pointer;
  text-decoration: none;
  color: black;
  align-self: center;
  width: 100%;

  &:hover {
    color: black;
  }

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    max-width: 32rem;
  }
`;

export default ScheduleViewer;
