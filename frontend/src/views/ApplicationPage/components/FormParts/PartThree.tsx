import React from 'react';
import styled from 'styled-components/macro';
import { FastField } from 'formik';
import Form from 'react-bootstrap/Form';

import { ApplicationFormFields, StyledFieldset, StyledTitleLegend } from 'views/ApplicationPage/styles';
import { StyledFormLabel } from 'commonStyles';
import { FormPartProps } from 'views/ApplicationPage/components/ApplicationForm';

const PartThree = (props: FormPartProps): JSX.Element => {
  const { formik } = props;

  return (
    <StyledFieldset>
      <StyledTitleLegend>Part 3: Professional Info</StyledTitleLegend>
      <Note>Note: Your URLs should begin with <strong>http://</strong> or <strong>https://</strong>.</Note>

      <ApplicationFormFields>
        <Form.Group controlId="applicationGitHubUrl">
          <StyledFormLabel>GitHub URL</StyledFormLabel>
          <FastField as={Form.Control}
                     name="githubUrl"
                     type="text"
                     disabled={formik.isSubmitting}
          />
        </Form.Group>

        <Form.Group controlId="applicationLinkedInUrl">
          <StyledFormLabel>LinkedIn URL</StyledFormLabel>
          <FastField as={Form.Control}
                     name="linkedinUrl"
                     type="text"
                     disabled={formik.isSubmitting}
          />
        </Form.Group>

        <Form.Group controlId="applicationWebsiteUrl">
          <StyledFormLabel>Website/Portfolio URL</StyledFormLabel>
          <FastField as={Form.Control}
                     name="websiteUrl"
                     type="text"
                     disabled={formik.isSubmitting}
          />
        </Form.Group>

        <Form.Group controlId="applicationResumeFile">
          <StyledFormLabel>Resume</StyledFormLabel>
          {/* Form.File gives wrong styling with Bootstrap 5 */}
          {/* Accepts the following file types: .pdf, .docx, .doc, .odt, .pages, .rtf, .txt, .png, .jpg/.jpeg */}
          <input className="form-control"
                 name="resumeFile"
                 type="file"
                 accept="application/pdf,
                 application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                 application/msword,
                 application/vnd.oasis.opendocument.text,
                 application/vnd.apple.pages,
                 application/rtf,
                 text/plain,
                 image/png,
                 image/jpeg"
                 onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                   formik.setFieldValue('resumeFile', event.currentTarget.files !== null && event.currentTarget.files[0]);
                 }}
                 disabled={formik.isSubmitting}
          />
        </Form.Group>
      </ApplicationFormFields>
    </StyledFieldset>
  );
};

const Note = styled.p`
  text-align: center
`;

export default PartThree;
