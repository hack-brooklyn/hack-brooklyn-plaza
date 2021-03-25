import React from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { FastField, Formik } from 'formik';
import styled from 'styled-components/macro';
import { Form } from 'react-bootstrap';

import { StyledH1, StyledH3, StyledSubmitButton } from 'commonStyles';
import { API_ROOT } from '../../index';
import { useSelector } from 'react-redux';
import { refreshAccessToken } from '../../util/auth';
import {
  ConnectionError,
  NoPermissionError,
  RootState,
  UnknownError,
} from '../../types';
import { handleError } from '../../util/plazaUtils';

interface AnnouncementData {
  body: string;
  participantsOnly: boolean;
}

const PostAnnouncement = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const initialValues: AnnouncementData = {
    body: '',
    participantsOnly: false,
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 201) {
      return;
    } else if (res.status === 401 || res.status === 400) {
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
    <>
      <StyledH1>Post Announcement</StyledH1>
      <Formik initialValues={initialValues} onSubmit={submitPost}>
        {(formik) => (
          <StyledPostAnnouncementForm onSubmit={formik.handleSubmit}>
            <StyledH3>Announcement Content</StyledH3>
            <FastField
              as='textarea'
              className='form-control'
              name={'body'}
              id={'body'}
              rows='5'
              placeholder={
                'Enter a message under 2000 characters to be announced. The announcement will appear on Hack Brooklyn Plaza and on Discord. Markdown is supported.'
              }
              disabled={formik.isSubmitting}
              required
            />
            <Form.Check>
              <FastField
                as={Form.Check.Input}
                name='participantsOnly'
                id='participantsOnly'
              />
              <Form.Check.Label htmlFor='participantsOnly'>
                Make this announcement visible to only accepted participants?
              </Form.Check.Label>
            </Form.Check>
            <StyledSubmitButton type='submit' size='lg'>
              Post Announcement
            </StyledSubmitButton>
          </StyledPostAnnouncementForm>
        )}
      </Formik>
    </>
  );
};

const StyledPostAnnouncementForm = styled(Form)`
  margin: 1rem auto;
  max-width: 600px;
`;

export default PostAnnouncement;
