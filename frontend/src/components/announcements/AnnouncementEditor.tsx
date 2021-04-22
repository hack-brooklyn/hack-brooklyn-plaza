import React from 'react';
import Form from 'react-bootstrap/Form';
import styled from 'styled-components/macro';

import { RequiredFormLabel } from '../';
import { FastField, Formik } from 'formik';
import { StyledH1, StyledSubmitButton } from 'common/styles/commonStyles';
import { AnnouncementFormData } from 'types';

interface AnnouncementEditorData {
  announcementData: AnnouncementFormData;
  actionType: string;
  submitForm: (announcementData: AnnouncementFormData) => Promise<void>;
}

const AnnouncementEditor = (props: AnnouncementEditorData): JSX.Element => {
  const { announcementData, actionType, submitForm } = props;

  return (
    <>
      <StyledH1>{`${actionType} Announcement`}</StyledH1>
      <Formik initialValues={announcementData} onSubmit={submitForm}>
        {(formik) => (
          <StyledPostAnnouncementForm onSubmit={formik.handleSubmit}>
            <RequiredFormLabel>Announcement Content</RequiredFormLabel>
            <FastField
              as="textarea"
              className="form-control"
              name="body"
              id="body"
              rows="5"
              maxLength={2000}
              placeholder={
                'Enter a message under 2000 characters to be announced. The announcement will appear on Hack Brooklyn Plaza and on Discord. Markdown is supported.'
              }
              disabled={formik.isSubmitting}
              required
            />
            <StyledCheck>
              <FastField
                as={Form.Check.Input}
                checked={formik.values.participantsOnly}
                name="participantsOnly"
                id="participantsOnly"
              />
              <Form.Check.Label htmlFor="participantsOnly">
                Participants only
              </Form.Check.Label>
            </StyledCheck>
            <StyledSubmitButton type="submit" size="lg">
              {actionType === 'Create' ? 'Post Announcement' : 'Save Changes'}
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

export default AnnouncementEditor;
