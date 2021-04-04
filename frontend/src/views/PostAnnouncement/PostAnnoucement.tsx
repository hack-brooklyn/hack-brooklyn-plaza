import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import { handleError } from '../../util/plazaUtils';
import { refreshAccessToken } from '../../util/auth';
import {
  AnnouncementData,
  ConnectionError,
  NoPermissionError,
  RootState,
  UnknownError,
} from '../../types';
import { API_ROOT } from '../../index';
import { AnnouncementEditor } from '../../components';

  UnknownError
} from 'types';
import { API_ROOT } from 'index';

const PostAnnouncement = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const initialValues: AnnouncementData = {
    body: '',
    participantsOnly: false
  };

  const submitPost = async (announcementData: AnnouncementData) => {
    try {
      await createAnnouncement(announcementData);
      toast.success('Post successfully created');
      history.push('/announcements');
    } catch (err) {
      handleError(err);
    }
  };

  const createAnnouncement = async (
    announcementData: AnnouncementData,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/announcements`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(announcementData)
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 201) {
      return;
    } else if (res.status === 401) {
      const refreshToken = await refreshAccessToken(history);
      await createAnnouncement(announcementData, refreshToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <AnnouncementEditor
      announcementData={initialValues}
      actionType={'Create'}
      submitForm={submitPost}
    />
  );
};

export default PostAnnouncement;
