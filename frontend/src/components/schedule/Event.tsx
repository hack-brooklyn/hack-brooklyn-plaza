import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import {
  Breakpoints,
  ConnectionError,
  EventData,
  EventParams,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { API_ROOT, TIME_BEFORE_EVENT_TO_DISPLAY_JOIN_BUTTON } from 'index';

import SavedStar from 'assets/icons/yellow-star.svg';
import UnsavedStar from 'assets/icons/white-star.svg';
import LiveIndicator from 'assets/icons/red-circle.svg';

interface EventProps {
  event: EventData;
  toggleRefresh: () => void;
  showSaveButton?: boolean;
}

interface EventContainerProps extends EventParams {
  passedEventId: string;
}

dayjs.extend(utc);

const formatTime = (time: string): string => {
  return dayjs(time).format('h:mm A');
};

const Event = (props: EventProps): JSX.Element => {
  const { event, toggleRefresh, showSaveButton } = props;
  const { endTime, externalLink, id, startTime, title, saved } = event;

  const history = useHistory();
  const { eventId } = useParams<EventParams>();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const toggleSave = async () => {
    try {
      if (saved) {
        await unsaveEvent();
      } else {
        await saveEvent();
      }

      toggleRefresh();
    } catch (err) {
      handleError(err);
    }
  };

  const saveEvent = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/events/save/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      return;
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await saveEvent(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const unsaveEvent = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;
    let res;
    try {
      res = await fetch(`${API_ROOT}/events/save/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      return;
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await unsaveEvent(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const checkIfLive = () => {
    const currentTime = Date.now();

    return (
      dayjs(currentTime).isAfter(dayjs(startTime)) &&
      dayjs(currentTime).isBefore(dayjs(endTime))
    );
  };

  const checkToDisplayJoinButton = () => {
    const currentTime = Date.now();

    const difference =
      dayjs(startTime).valueOf() - dayjs(currentTime).valueOf();

    return difference < parseInt(TIME_BEFORE_EVENT_TO_DISPLAY_JOIN_BUTTON);
  };

  return (
    <EventContainer eventId={eventId} passedEventId={event.id.toString()}>
      <EventTitle>{title}</EventTitle>

      <div>
        <ExtraContainer>
          <TimeContainer>
            {checkIfLive() && (
              <LiveText>
                <img src={LiveIndicator} alt="This Event is Live" /> LIVE
              </LiveText>
            )}
            <TimeText>
              {formatTime(startTime)} - {formatTime(endTime)}
            </TimeText>
          </TimeContainer>

          {checkToDisplayJoinButton() && windowWidth >= Breakpoints.ExtraLarge && (
            <JoinEventButton
              size="sm"
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e: React.MouseEvent<HTMLElement>) =>
                e.stopPropagation()
              }
            >
              Join Event
            </JoinEventButton>
          )}

          {showSaveButton !== false && (
            <ToggleSaveButton
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await toggleSave();
                // setShow && setShow(false);
              }}
            >
              <ToggleSaveButtonImg
                src={saved ? SavedStar : UnsavedStar}
                alt={
                  saved ? 'Add Event to Schedule' : 'Remove Event From Schedule'
                }
              />
            </ToggleSaveButton>
          )}
        </ExtraContainer>

        {checkToDisplayJoinButton() && windowWidth < Breakpoints.ExtraLarge && (
          <JoinEventButton
            size="sm"
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
          >
            Join Event
          </JoinEventButton>
        )}
      </div>
    </EventContainer>
  );
};

const EventContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;

  margin: 1rem auto 0;
  padding: 1rem;
  height: 12.5rem;
  width: 100%;

  border-radius: 5px;
  -webkit-box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);
  -moz-box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);
  box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);

  &:last-child {
    margin-bottom: 0.5rem;
  }

  @media screen and (min-width: ${Breakpoints.Large}px) {
    width: 350px;

    ${(props: EventContainerProps) =>
      props.eventId === props.passedEventId &&
      `
      -webkit-box-shadow: 0px 0px 0px 2px #0066ff, 0 0 10px 0.5px rgba(225, 225, 225, 1);
      -moz-box-shadow: 0px 0px 0px 2px #0066ff, 0 0 10px 0.5px rgba(225, 225, 225, 1);
      box-shadow: 0px 0px 0px 2px #0066ff, 0 0 10px 0.5px rgba(225, 225, 225, 1);
    `};
  }

  @media screen and (min-width: ${Breakpoints.ExtraLarge}px) {
    height: 10rem;
    width: 28.125rem;
    max-width: 28.125rem;
  }
`;

const ExtraContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const LiveText = styled.div`
  color: #ff0000;
  font-weight: bold;
  display: flex;
  align-content: flex-end;

  & > img {
    margin-right: 0.25rem;
  }
`;

const EventTitle = styled.p`
  font-size: 1.1rem;
  font-weight: bold;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  @media screen and (min-width: ${Breakpoints.ExtraLarge}px) {
    -webkit-line-clamp: 2;
  }
`;

const ToggleSaveButton = styled.button`
  border: none;
  background: none;
  padding: 0;
`;

const ToggleSaveButtonImg = styled.img`
  margin-bottom: 0.25rem;
  height: 1.5rem;
  width: 1.5rem;
`;

const TimeContainer = styled.div`
  margin: 0 auto 0 0;
`;

const TimeText = styled.p`
  margin-bottom: 0;
`;

const JoinEventButton = styled(Button)`
  width: 100%;
  margin-top: 0.5rem;

  @media screen and (min-width: ${Breakpoints.ExtraLarge}px) {
    width: auto;
    padding: 0 1rem;
    margin: 0 1rem 0.2rem;
  }
`;

export default Event;
