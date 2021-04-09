import React from 'react';
import { FastField } from 'formik';
import Select from 'react-select/creatable';
import Form from 'react-bootstrap/Form';

import { RequiredFormLabel } from 'components';
import {
  ApplicationFormFields,
  StyledFieldset,
  StyledTitleLegend
} from 'common/styles/apply/applicationPageStyles';
import { StyledFormLabel } from 'common/styles/commonStyles';
import { levelsOfStudyOptions } from 'common/selectOptions/applicationFormOptions';
import { FormPartProps } from '../ApplicationForm';

const PartTwo = (props: FormPartProps): JSX.Element => {
  const { formik } = props;

  return (
    <StyledFieldset>
      <StyledTitleLegend>Part 2: Education</StyledTitleLegend>
      <ApplicationFormFields>
        <Form.Group controlId="applicationSchool">
          <RequiredFormLabel>School</RequiredFormLabel>
          <FastField
            as={Form.Control}
            name="school"
            type="text"
            disabled={formik.isSubmitting}
            required
          />
        </Form.Group>

        <Form.Group controlId="applicationLevelOfStudy">
          <RequiredFormLabel>Level of Study</RequiredFormLabel>
          <Select
            options={levelsOfStudyOptions}
            onChange={(option) =>
              option && formik.setFieldValue('levelOfStudy', option.value)
            }
            isDisabled={formik.isSubmitting}
          />
        </Form.Group>

        <Form.Group controlId="applicationGraduationYear">
          <RequiredFormLabel>Graduation Year</RequiredFormLabel>
          <FastField
            as={Form.Control}
            name="graduationYear"
            type="number"
            min="1900"
            max="2100"
            disabled={formik.isSubmitting}
            required
          />
        </Form.Group>

        <Form.Group controlId="applicationMajor">
          <StyledFormLabel>Major</StyledFormLabel>
          <FastField
            as={Form.Control}
            name="major"
            type="text"
            disabled={formik.isSubmitting}
          />
        </Form.Group>
      </ApplicationFormFields>
    </StyledFieldset>
  );
};

export default PartTwo;
