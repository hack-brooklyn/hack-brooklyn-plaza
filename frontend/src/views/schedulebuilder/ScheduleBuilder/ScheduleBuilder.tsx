import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { ScheduleViewer, EventDetail, EventDetailModal } from 'components/schedulebuilder';
import {
  Breakpoints,
  ConnectionError,
  EventData,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';
import { acCan, refreshAccessToken } from 'util/auth';
import { Resources } from 'security/accessControl';
import { handleErrorAndPush } from 'util/plazaUtils';

interface ParamId {
  eventId: string;
}

const ScheduleBuilder = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const userRole = useSelector((state: RootState) => state.user.role);
  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const { eventId } = useParams<ParamId>();

  const [event, setEvent] = useState<EventData>();
  const [show, setShow] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const selectEvent = (e: EventData) => {
    if (windowWidth < Breakpoints.Large) {
      setShow(true);
    }
    setEvent(e);
  };

  useEffect(() => {
    if (eventId) {
      getEvent();
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
      <Container>
        <ScheduleViewer
          selectEvent={selectEvent}
          selectedEvent={event}
          refresh={refresh}
          setRefresh={setRefresh}
        />
        {windowWidth >= Breakpoints.Large && (
          <EventDetailContainer>
            <EventDetail
              event={event}
              setRefresh={setRefresh}
              removeSelectedEvent={removeSelectedEvent}
            />
          </EventDetailContainer>
        )}
      </Container>
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

const EventDetailContainer = styled.div`
  width: 60%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  padding: 4rem;
  -webkit-box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);
  -moz-box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);
  box-shadow: 0 0 10px 0.5px rgba(225, 225, 225, 1);
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 85vh;
  justify-content: space-between;
`;

export default ScheduleBuilder;
