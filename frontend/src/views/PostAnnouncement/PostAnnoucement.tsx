import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form } from 'react-bootstrap';
import { FastField, Formik } from 'formik';
import styled from 'styled-components/macro';

import { RequiredFormLabel } from '../../components';
import { StyledH1, StyledSubmitButton } from 'commonStyles';
import { handleError } from '../../util/plazaUtils';
import { refreshAccessToken } from '../../util/auth';
import {
  ConnectionError,
  NoPermissionError,
  RootState,
  UnknownError,
} from '../../types';
import { API_ROOT } from '../../index';

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
    <>
      <StyledH1>Post Announcement</StyledH1>
      <Formik initialValues={initialValues} onSubmit={submitPost}>
        {(formik) => (
          <StyledPostAnnouncementForm onSubmit={formik.handleSubmit}>
            <RequiredFormLabel>Announcement Content</RequiredFormLabel>
            <FastField
              as="textarea"
              className="form-control"
              name="body"
              id={'body'}
              rows="5"
              placeholder={
                'Enter a message under 2000 characters to be announced. The announcement will appear on Hack Brooklyn Plaza and on Discord. Markdown is supported.'
              }
              disabled={formik.isSubmitting}
              required
            />
            <StyledCheck>
              <FastField
                as={Form.Check.Input}
                name="participantsOnly"
                id="participantsOnly"
              />
              <Form.Check.Label htmlFor="participantsOnly">
                Participants only
              </Form.Check.Label>
            </StyledCheck>
            <StyledSubmitButton type="submit" size="lg">
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

const StyledCheck = styled(Form.Check)`
  margin-top: 0.5rem;
`;

export default PostAnnouncement;
