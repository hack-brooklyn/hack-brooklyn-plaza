import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ConnectionError,
  NoPermissionError,
  RootState,
  UnknownError,
} from '../types';
import { API_ROOT } from '../index';
import Announcement from './Announcement';
import styled from 'styled-components/macro';
import { handleError } from '../util/plazaUtils';
import { refreshAccessToken } from '../util/auth';
import { useHistory } from 'react-router-dom';

const AnnouncementBrowser = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    getAnnouncements().catch((err) => handleError(err));
  }, []);

  const getAnnouncements = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/announcements`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const json = await res.json();
      setAnnouncements(json);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getAnnouncements(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <AnnouncementBrowserContainer>
      {announcements.map((e, idx) => (
        <Announcement key={idx} {...e} />
      ))}
    </AnnouncementBrowserContainer>
  );
};

const AnnouncementBrowserContainer = styled.div``;

export default AnnouncementBrowser;
