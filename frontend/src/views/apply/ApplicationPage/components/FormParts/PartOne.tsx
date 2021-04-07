import React from 'react';
import { FastField, Field } from 'formik';
import Select from 'react-select/creatable';
import Form from 'react-bootstrap/Form';

import { RequiredFormLabel } from 'components';
import {
  ApplicationFormFields,
  StyledFieldset,
  StyledTitleLegend
} from 'common/styles/apply/applicationPageStyles';
import {
  StyledFormLabel,
  StyledFormLabelLegend
} from 'common/styles/commonStyles';
import {
  ethnicityOptions,
  genderOptions,
  pronounOptions,
  shirtSizeOptions
} from 'common/selectOptions/applicationFormOptions';
import { FormPartProps } from '../ApplicationForm';
import { Option } from 'types';

interface PartOneProps extends FormPartProps {
  countryOptions: Option[] | undefined;
}

const PartOne = (props: PartOneProps): JSX.Element => {
  const { formik, countryOptions } = props;

  return (
    <StyledFieldset>
      <StyledTitleLegend>Part 1: General Info</StyledTitleLegend>
      <ApplicationFormFields>
        <Form.Group controlId="applicationFirstName">
          <RequiredFormLabel>First Name</RequiredFormLabel>
          <FastField as={Form.Control}
                     name="firstName"
                     type="text"
                     disabled={formik.isSubmitting}
                     required />
        </Form.Group>

        <Form.Group controlId="applicationLastName">
          <RequiredFormLabel>Last Name</RequiredFormLabel>
          <FastField as={Form.Control}
                     name="lastName"
                     type="text"
                     disabled={formik.isSubmitting}
                     required />
        </Form.Group>

        <Form.Group controlId="applicationEmailAddress">
          <RequiredFormLabel>Email Address</RequiredFormLabel>
          <FastField as={Form.Control}
                     name="email"
                     type="email"
                     disabled={formik.isSubmitting}
                     required />
        </Form.Group>

        <Form.Group controlId="applicationCountry">
          <RequiredFormLabel>Country</RequiredFormLabel>
          <Select options={countryOptions}
                  onChange={(option) => option && formik.setFieldValue('country', option.value)}
                  isDisabled={formik.isSubmitting}
          />
        </Form.Group>

        <Form.Group controlId="applicationGender">
          <StyledFormLabel>Gender</StyledFormLabel>
          <Select options={genderOptions}
                  onChange={(option) => option && formik.setFieldValue('gender', option.value)}
                  isDisabled={formik.isSubmitting}
          />
        </Form.Group>

        <Form.Group controlId="applicationPronouns">
          <StyledFormLabel>Pronouns</StyledFormLabel>
          <Select options={pronounOptions}
                  onChange={(option) => option && formik.setFieldValue('pronouns', option.value)}
                  isDisabled={formik.isSubmitting}
          />
        </Form.Group>

        <Form.Group controlId="applicationEthnicity">
          <StyledFormLabel>Ethnicity</StyledFormLabel>
          <Select options={ethnicityOptions}
                  onChange={(option) => option && formik.setFieldValue('ethnicity', option.value)}
                  isDisabled={formik.isSubmitting}
          />
        </Form.Group>

        <Form.Group controlId="applicationShirtSize">
          <StyledFormLabel>Shirt Size</StyledFormLabel>
          <Select options={shirtSizeOptions}
                  onChange={(option) => option && formik.setFieldValue('shirtSize', option.value)}
                  isDisabled={formik.isSubmitting}
          />
        </Form.Group>

        <Form.Group controlId="applicationIsFirstHackathon">
          <fieldset>
            <StyledFormLabelLegend>Is this your first hackathon?</StyledFormLabelLegend>
            <span>
              <Field
                as={Form.Check}
                type="radio"
                name="isFirstHackathon"
                id="applicationIsFirstHackathonYes"
                label="Yes"
                value="Yes"
                disabled={formik.isSubmitting}
                inline
              />
            </span>

            <span>
              <Field
                as={Form.Check}
                type="radio"
                name="isFirstHackathon"
                id="applicationIsFirstHackathonNo"
                label="No"
                value="No"
                disabled={formik.isSubmitting}
                inline
              />
            </span>
          </fieldset>
        </Form.Group>

        {formik.values.isFirstHackathon === 'No' && (
          <Form.Group controlId="applicationNumberHackathonsAttended">
            <StyledFormLabel>Number of Hackathons Attended</StyledFormLabel>
            <Form.Control type="number" min="1"
                          disabled={formik.isSubmitting} {...formik.getFieldProps('numberHackathonsAttended')} />
          </Form.Group>
        )}
      </ApplicationFormFields>
    </StyledFieldset>
  );
};

export default PartOne;
