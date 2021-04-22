import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { API_ROOT } from 'index';
import { handleError, handleErrorAndPush } from 'util/plazaUtils';
import { acCan, refreshAccessToken } from 'util/auth';
import { Resources } from 'security/accessControl';
import EventEditor from 'components/schedule/EventEditor';
import {
  ConnectionError,
  EventData,
  InvalidEventDatesError,
  InvalidSubmittedDataError,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';

dayjs.extend(utc);
dayjs.extend(timezone);

const CreateEvent = (): JSX.Element => {
  const history = useHistory();

  const userRole = useSelector((state: RootState) => state.user.role);
  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const initialValues: EventData = {
    id: 0,
    title: '',
    presenter: '',
    startTime: new Date(Date.now()).toISOString(),
    endTime: new Date(Date.now()).toISOString(),
    description: '',
    externalLink: ''
  };

  useEffect(() => {
    try {
      const permission = acCan(userRole).createAny(Resources.Events);
      if (!permission.granted) throw new NoPermissionError();
    } catch (err) {
      handleErrorAndPush(err, history);
      return;
    }
  }, []);

  const submitPost = async (eventData: EventData) => {
    try {
      await createEvent(eventData);
    } catch (err) {
      handleError(err);
    }
  };

  const createEvent = async (
    eventData: EventData,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    if (dayjs(eventData.endTime).isBefore(eventData.startTime)) {
      throw new InvalidEventDatesError();
    }

    const processedEventData = { ...eventData };
    processedEventData.startTime = new Date(eventData.startTime).toISOString();
    processedEventData.endTime = new Date(eventData.endTime).toISOString();

    console.log(processedEventData);

    let res;
    try {
      res = await fetch(`${API_ROOT}/events`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 201) {
      toast.success('The event has been created.');

      const createdEventLocation = res.headers.get('Location');
      if (createdEventLocation !== null) {
        history.push(createdEventLocation);
      }
    } else if (res.status === 400) {
      const errors = (await res.json()).errors;
      console.warn(errors);
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshToken = await refreshAccessToken(history);
      await createEvent(eventData, refreshToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <EventEditor
      eventData={initialValues}
      actionType="Create"
      submitForm={submitPost}
    />
  );
};

export default CreateEvent;
