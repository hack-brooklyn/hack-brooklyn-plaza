import React, { Dispatch, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LinkProps, useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';

import { LinkButton } from 'components';
import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import ac, { Resources } from 'security/accessControl';
import {
  Breakpoints,
  ConnectionError,
  EventData,
  EventNotFoundError,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { API_ROOT, TIME_BEFORE_EVENT_TO_DISPLAY_JOIN_BUTTON } from 'index';

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

  const history = useHistory();

  const userRole = useSelector((state: RootState) => state.user.role);
  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    getSavedEventIds().catch((err) => handleError(err));
  }, [event]);

  const getSavedEventIds = async (
    overriddenAccessToken?: string
  ): Promise<void> => {
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
      const savedIds: number[] = await res.json();
      event && setIsSaved(savedIds.includes(event.id));
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

  const toggleSaveEvent = async () => {
    try {
      if (isSaved) {
        await unsaveEvent();
      } else {
        await saveEvent();
      }

      await getSavedEventIds();
      setRefresh(true);
    } catch (err) {
      handleError(err);
    }
  };

  const saveEvent = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;
    let res;

    if (!event) {
      throw new EventNotFoundError();
    }
    try {
      res = await fetch(`${API_ROOT}/events/save/${event.id}`, {
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

    if (!event) {
      throw new EventNotFoundError();
    }
    try {
      res = await fetch(`${API_ROOT}/events/save/${event.id}`, {
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

  if (event) {
    return (
      <>
        <TitleText>{event.title}</TitleText>
        <SubtitleText>By {event.presenter}</SubtitleText>

        <DateTimeGroup>
          <SubtitleText>
            {dayjs(event.startTime).format('dddd, MMMM D, YYYY')}
          </SubtitleText>
          <SubtitleText>
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </SubtitleText>
        </DateTimeGroup>

        <ActionButtons>
          {dayjs(event.startTime).valueOf() - dayjs(Date.now()).valueOf() <
            parseInt(TIME_BEFORE_EVENT_TO_DISPLAY_JOIN_BUTTON) && (
            <JoinButton
              href={event.externalLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Event
            </JoinButton>
          )}

          <ScheduleButton onClick={toggleSaveEvent}>
            {isSaved ? 'Remove from Schedule' : 'Add to Schedule'}
          </ScheduleButton>

          {checkIfAbleToModify() && (
            <EditButton variant="success" to={`/schedule/${event.id}/edit`}>
              Edit Event
            </EditButton>
          )}
        </ActionButtons>

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
    return (
      <NoEventSelectedMessage>
        Select an event on the left to view its details.
      </NoEventSelectedMessage>
    );
  }
};

const LinkRenderer = (props: LinkProps) => {
  const { href, children } = props;
  return (
    <a href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  );
};

const TitleText = styled.h3`
  font-weight: 600;
  font-size: 1.5rem;
  text-align: center;
`;

const SubtitleText = styled.h4`
  font-size: 1.25rem;
  font-weight: normal;
`;

const DateTimeGroup = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const DescriptionText = styled.div`
  word-break: break-all;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0.75rem auto 1rem;
  width: 100%;
  align-items: center;

  & > button,
  & > a {
    margin-bottom: 0.5rem;
    width: 100%;
  }

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    width: auto;

    & > button,
    & > a {
      width: auto;
    }
  }
`;

const JoinButton = styled(Button)`
  width: 100%;

  @media screen and (min-width: ${Breakpoints.Small}px) {
    width: auto;
  }
`;

const ScheduleButton = styled(Button)`
  background-color: #7000ff;
  border-color: #7000ff;

  &:hover,
  &:focus {
    background-color: #5e00d7;
    border-color: #5b00cc;
  }

  &:active {
    background-color: #5f00db;
    border-color: #7a12ff;
  }
`;

const EditButton = styled(LinkButton)`
  width: 100%;

  @media screen and (min-width: ${Breakpoints.Small}px) {
    width: auto;
  }
`;

const NoEventSelectedMessage = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  margin-top: 2rem;
  text-align: center;
`;

export default EventDetail;
