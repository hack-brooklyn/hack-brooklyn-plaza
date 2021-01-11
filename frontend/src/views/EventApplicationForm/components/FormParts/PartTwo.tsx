import React from 'react';
import Select from 'react-select/creatable';
import Form from 'react-bootstrap/Form';
import RequiredFormLabel from 'components/RequiredFormLabel';
import { ApplicationFormFields, StyledFieldset, StyledTitleLegend } from 'views/EventApplicationForm/styles';
import { FastField } from 'formik';
import { StyledFormLabel } from 'commonStyles';
import { FormPartProps } from 'views/EventApplicationForm/components/ApplicationForm';
import { levelsOfStudyOptions } from 'views/EventApplicationForm/formOptions';

const PartTwo = (props: FormPartProps): JSX.Element => {
  const { formik } = props;

  return (
    <StyledFieldset>
      <StyledTitleLegend>Part 2: Education</StyledTitleLegend>
      <ApplicationFormFields>
        <Form.Group controlId="applicationSchool">
          <RequiredFormLabel>School</RequiredFormLabel>
          <FastField as={Form.Control}
                     name="school"
                     type="text"
                     required
          />
        </Form.Group>

        <Form.Group controlId="applicationLevelOfStudy">
          <RequiredFormLabel>Level of Study</RequiredFormLabel>
          <Select options={levelsOfStudyOptions}
                  onChange={(option) => option && formik.setFieldValue('levelOfStudy', option.value)}
          />
        </Form.Group>

        <Form.Group controlId="applicationGraduationYear">
          <RequiredFormLabel>Graduation Year</RequiredFormLabel>
          <FastField as={Form.Control}
                     name="graduationYear"
                     type="number"
                     min="1900"
                     max="2100"
                     required />
        </Form.Group>

        <Form.Group controlId="applicationMajor">
          <StyledFormLabel>Major</StyledFormLabel>
          <FastField as={Form.Control}
                     name="major"
                     type="text"
          />
        </Form.Group>
      </ApplicationFormFields>
    </StyledFieldset>
  );
};

export default PartTwo;
