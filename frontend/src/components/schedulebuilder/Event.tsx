import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import styled, { css } from 'styled-components/macro';
import { Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  Breakpoints,
  ConnectionError,
  EventData,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import SavedStar from 'assets/icons/white-star.svg';
import UnsavedStar from 'assets/icons/yellow-star.svg';
import LiveIndicator from 'assets/icons/red-circle.svg';
import { API_ROOT, TIME_BEFORE_EVENT_TO_DISPLAY_JOIN_BUTTON } from 'index';

dayjs.extend(utc);

const formatTime = (time: string): string => {
  return dayjs(time).format('h:mm A');
};

interface EventProps {
  event: EventData;
  toggleRefresh: () => void;
}

const Event = (props: EventProps): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const {
    endTime,
    externalLink,
    id,
    startTime,
    title,
    saved
  } = props.event;

  const { toggleRefresh } = props;

  const toggleFavorite = async () => {
    if (saved) {
      await unsaveEvent();
    } else {
      await saveEvent();
    }
    toggleRefresh();
  };

  const saveEvent = async () => {
    let res;
    try {
      res = await fetch(`${API_ROOT}/events/save/${id}`, {
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
    try {
      res = await fetch(`${API_ROOT}/events/save/${id}`, {
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
    <EventContainer>
      <EventTitle>{title}</EventTitle>
      <ExtraContainer>
        <TimeContainer>
          {checkIfLive() && (
            <LiveText>
              <img src={LiveIndicator} alt="Live Indicator" /> LIVE
            </LiveText>
          )}
          <TimeText>
            {formatTime(startTime)} - {formatTime(endTime)}
          </TimeText>
        </TimeContainer>
        {checkToDisplayJoinButton() && windowWidth >= Breakpoints.ExtraLarge && (
          <StyledButton
            size="sm"
            href={externalLink}
            target="_blank"
            rel="noreferrer"
          >
            Join Event
          </StyledButton>
        )}
        {saved ? (
          <ButtonIcon
            onClick={toggleFavorite}
            src={UnsavedStar}
            alt="Highlighted Star"
          />
        ) : (
          <ButtonIcon
            onClick={toggleFavorite}
            src={SavedStar}
            alt="Unhighlighted Star"
          />
        )}
      </ExtraContainer>
      {checkToDisplayJoinButton() && windowWidth < Breakpoints.ExtraLarge && (
        <StyledButton
          size="sm"
          href={externalLink}
          target="_blank"
          rel="noreferrer"
        >
          Join Event
        </StyledButton>
      )}
    </EventContainer>
  );
};

const LiveText = styled.div`
  color: #ff0000;
  font-weight: bold;
  display: flex;
  align-content: flex-end;

  & > img {
    margin-right: 0.2rem;
  }
`;

const EventTitle = styled.p`
  font-size: 1.1rem;
  font-weight: bold;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ButtonIcon = styled.img`
  float: right;
  width: 1.5rem;

  @media (max-width: ${Breakpoints.ExtraLarge}px) {
    margin-bottom: 0.3rem;
  }
`;

const TimeContainer = styled.div`
  margin: 0 auto 0 0;
`;

const TimeText = styled.p`
  margin-bottom: 0;
`;

const ButtonStyles = css`
  padding: 0 1rem;
  margin: 0 1rem;

  @media (max-width: ${Breakpoints.ExtraLarge}px) {
    padding: 0.3rem 1rem;
    display: inline-block;
    margin: 0.5rem 0;
  }
  @media (max-width: ${Breakpoints.Medium}px) {
    flex-grow: 0;
  }
`;

const StyledButton = styled(Button)`
  ${ButtonStyles}
`;

const EventContainer = styled.div`
  margin: 1rem auto 0 auto;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding: 1rem;
  height: 10.5rem;
  width: 100%;
  border-radius: 5px;
  -webkit-box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);
  -moz-box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);
  box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);

  @media screen and (max-width: ${Breakpoints.ExtraLarge}px) {
    height: 12rem;
  }
`;

const ExtraContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
`;

export default Event;
