import React, { Dispatch } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { LinkProps } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';

import {
  Breakpoints,
  ConnectionError,
  EventData,
  EventNotFoundError,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { LinkButton } from '../index';
import ac, { Resources } from 'security/accessControl';
import {
  API_ROOT,
  TIME_BEFORE_EVENT_TO_DISPLAY_JOIN_BUTTON
} from 'index';
import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';

interface EventDetailProps {
  event?: EventData;
  setRefresh: Dispatch<React.SetStateAction<boolean>>;
  removeSelectedEvent: () => void;
}

const formatTime = (time: string): string => {
  return dayjs(time).format('h:mm A');
};

const EventDetail = (props: EventDetailProps): JSX.Element => {
  const { event, setRefresh, removeSelectedEvent } = props;

  const userRole = useSelector((state: RootState) => state.user.role);
  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const history = useHistory();

  const checkIfAbleToModify = (): boolean => {
    if (userRole !== null) {
      return ac.can(userRole).deleteAny(Resources.Events).granted;
    }
    return false;
  };

  const confirmDeleteEvent = async () => {
    if (confirm('Are you sure you want to delete?')) {
      try {
        await deleteEvent();
        toast.success('Successfully deleted an event');
      } catch (err) {
        handleError(err);
      }
    }
  };

  const deleteEvent = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    if (!event) {
      throw new EventNotFoundError();
    }

    let res;
    try {
      res = await fetch(`${API_ROOT}/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      setRefresh(true);
      removeSelectedEvent();
      return;
    } else if (res.status === 401) {
      const refreshToken = await refreshAccessToken(history);
      await deleteEvent(refreshToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const toggleFavorite = async () => {
    try {
      if (event && event.saved) {
        await unsaveEvent();
      } else {
        await saveEvent();
      }
      setRefresh(true);
    } catch (err) {
      handleError(err);
    }
  };

  const saveEvent = async () => {
    let res;

    if (!event) {
      throw new EventNotFoundError();
    }
    try {
      res = await fetch(`${API_ROOT}/events/save/${event.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      return;
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const unsaveEvent = async () => {
    let res;

    if (!event) {
      throw new EventNotFoundError();
    }
    try {
      res = await fetch(`${API_ROOT}/events/save/${event.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      return;
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  if (event) {
    return (
      <>
        <h3>{event.title}</h3>
        <p>By {event.presenter}</p>
        <p>{dayjs(event.startTime).format('dddd, MMMM D, YYYY')}</p>
        <p>
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </p>
        <ButtonContainer>
          {dayjs(event.startTime).valueOf() - dayjs(Date.now()).valueOf() <
            parseInt(TIME_BEFORE_EVENT_TO_DISPLAY_JOIN_BUTTON) && (
            <Button href={event.externalLink}>Join Event</Button>
          )}

          <Button
            style={{
              backgroundColor: '#7000FF',
              border: '#7000FF',
              display: 'inline-block'
            }}
            onClick={toggleFavorite}
          >
            {event.saved ? 'Remove from Schedule' : 'Add to Schedule'}
          </Button>
          {checkIfAbleToModify() && (
            <LinkButton variant="success" to={`schedule/${event.id}/edit`}>
              Edit Event
            </LinkButton>
          )}
        </ButtonContainer>
        <DescriptionText>
          <ReactMarkdown skipHtml={true} renderers={{ link: LinkRenderer }}>
            {event.description}
          </ReactMarkdown>
        </DescriptionText>
        {checkIfAbleToModify() && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={confirmDeleteEvent}
          >
            Delete Event
          </Button>
        )}
      </>
    );
  } else {
    return <p>Select an event on the left to view its details.</p>;
  }
};

const DescriptionText = styled.div`
  word-break: break-all;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  & > button,
  & > a {
    margin: 0.5rem;
  }

  @media screen and (max-width: ${Breakpoints.Small}px) {
    width: 100%;

    & > button,
    & > a {
      width: 100%;
    }
  }
`;

const LinkRenderer = (props: LinkProps) => {
  const { href, children } = props;
  return (
    <a href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  );
};

export default EventDetail;
