import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';

import { Announcement } from './';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import { API_ROOT } from 'index';
import {
  Breakpoints,
  ConnectionError,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';

interface AnnouncementBrowserProps {
  isAbleToModify?: boolean;
}

const AnnouncementBrowser = (props: AnnouncementBrowserProps): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [announcements, setAnnouncements] = useState([]);
  const [refreshAnnouncements, setRefreshAnnouncements] = useState(false);

  useEffect(() => {
    getAnnouncements().catch((err) => handleError(err));
  }, [refreshAnnouncements]);

  const toggleRefresh = () => {
    setRefreshAnnouncements(!refreshAnnouncements);
  };

  const getAnnouncements = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/announcements?limit=5`, {
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
        <Announcement
          key={idx}
          {...e}
          displayControls={props.isAbleToModify}
          toggleRefresh={toggleRefresh}
        />
      ))}
    </AnnouncementBrowserContainer>
  );
};

const AnnouncementBrowserContainer = styled.div`
  margin: 1rem auto;
  width: 80%;
  @media (max-width: ${Breakpoints.Small}px) {
    width: 100%;
  }
`;

export default AnnouncementBrowser;
