import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import {
  AnnouncementFormData,
  AnnouncementNotFoundError,
  ConnectionError,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';
import { AnnouncementEditor } from 'components/announcements';

interface ParamId {
  announcementId: string;
}

const EditAnnouncement = (): JSX.Element => {
  const history = useHistory();
  const [announcement, setAnnouncement] = useState({
    body: '',
    participantsOnly: false
  });
  const { announcementId } = useParams<ParamId>();

  useEffect(() => {
    getAnnouncement().catch((err) => handleError(err));
  }, []);

  const getAnnouncement = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/announcements/${announcementId}`, {
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
      setAnnouncement(json);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getAnnouncement(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else if (res.status === 404) {
      history.push('/announcements');
      throw new AnnouncementNotFoundError();
    } else {
      throw new UnknownError();
    }
  };

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const submitPost = async (announcementData: AnnouncementFormData) => {
    try {
      await editAnnouncement(announcementData);
      toast.success('Announcement successfully edited');
      history.push('/announcements');
    } catch (err) {
      handleError(err);
    }
  };

  const editAnnouncement = async (
    announcementData: AnnouncementFormData,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/announcements/${announcementId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          announcementId: announcementId,
          ...announcementData
        })
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      return;
    } else if (res.status === 401) {
      const refreshToken = await refreshAccessToken(history);
      await editAnnouncement(announcementData, refreshToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <>
      {announcement.body === '' ? (
        <></>
      ) : (
        <AnnouncementEditor
          announcementData={announcement}
          actionType="Edit"
          submitForm={submitPost}
        />
      )}
    </>
  );
};

export default EditAnnouncement;
