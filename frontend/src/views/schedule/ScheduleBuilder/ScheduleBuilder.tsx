import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components/macro';

import {
  EventDetail,
  EventDetailModal,
  ScheduleViewer
} from 'components/schedule';
import { LinkButton } from 'components';
import { StyledCenteredH1 } from 'common/styles/commonStyles';
import { acCan, refreshAccessToken } from 'util/auth';
import { handleError, handleErrorAndPush } from 'util/plazaUtils';
import ac, { Resources } from 'security/accessControl';
import {
  Breakpoints,
  ConnectionError,
  EventData,
  EventParams,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

const ScheduleBuilder = (): JSX.Element => {
  const history = useHistory();
  const { eventId } = useParams<EventParams>();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const userRole = useSelector((state: RootState) => state.user.role);
  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const [event, setEvent] = useState<EventData>();
  const [show, setShow] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const selectEvent = (e: EventData) => {
    setEvent(e);
  };

  useEffect(() => {
    setShow(false);

    if (eventId) {
      getEvent().catch((err) => handleError(err));
      setShow(true);
    }
  }, [eventId]);

  useEffect(() => {
    try {
      const permission = acCan(userRole).readAny(Resources.Events);
      if (!permission.granted) throw new NoPermissionError();
    } catch (err) {
      handleErrorAndPush(err, history);
      return;
    }
  }, []);

  const getEvent = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;
    let res;

    try {
      res = await fetch(`${API_ROOT}/events/${eventId}`, {
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
      setEvent(json);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getEvent(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const removeSelectedEvent = () => {
    setEvent(undefined);
    setShow(false);
  };

  return (
    <>
      <ScheduleBuilderContainer>
        <EventListing>
          <StyledCenteredH1>Schedule Builder</StyledCenteredH1>

          {ac.can(userRole).createAny(Resources.Events).granted && (
            <NewEventButton to="/schedule/create">
              Create New Event
            </NewEventButton>
          )}

          <ScheduleViewer
            selectEvent={selectEvent}
            selectedEvent={event}
            refresh={refresh}
            setRefresh={setRefresh}
            setShow={setShow}
          />
        </EventListing>

        {windowWidth >= Breakpoints.Large && (
          <EventDetailContainer>
            <EventDetail
              event={event}
              setRefresh={setRefresh}
              removeSelectedEvent={removeSelectedEvent}
            />
          </EventDetailContainer>
        )}
      </ScheduleBuilderContainer>

      {/* Modal shown only on mobile */}
      {windowWidth < Breakpoints.Large && (
        <EventDetailModal
          event={event}
          show={show}
          setShow={setShow}
          setRefresh={setRefresh}
          removeSelectedEvent={removeSelectedEvent}
        />
      )}
    </>
  );
};

const ScheduleBuilderContainer = styled.div`
  @media screen and (min-width: ${Breakpoints.Large}px) {
    display: flex;
    flex-direction: row;
    height: 100vh;
    max-height: 82.5vh;
    overflow: hidden;
    justify-content: space-between;
  }
`;

const EventDetailContainer = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;

  padding: 2.25rem;
  border-radius: 5px;
  -webkit-box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);
  -moz-box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);
  box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin: 1rem;
  }
`;

const NewEventButton = styled(LinkButton)`
  width: 97.5%;
  margin: 0.25rem auto;
  text-align: center;
`;

const EventListing = styled.div``;

export default ScheduleBuilder;
