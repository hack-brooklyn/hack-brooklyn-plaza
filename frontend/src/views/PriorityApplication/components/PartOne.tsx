import React from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { FormikProps } from 'formik';
import Form from 'react-bootstrap/Form';
import RequiredFormLabel, { StyledFormLabel } from 'components/RequiredFormLabel';
import { Option } from 'types';
import { FormFields, StyledFieldset, StyledLegend } from './styles';
import { ApplicationFormValues } from 'views/PriorityApplication/PriorityApplication';

interface PartOneProps {
  formik: FormikProps<ApplicationFormValues>;
  countryOptions: Option[] | undefined;
}

export enum HackathonAttended {
  Yes = 'Yes',
  No = 'No'
}

const genderOptions: Option[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other (Type gender here and select "Create")' },
  { value: 'Prefer not to say', label: 'Prefer not to say' }
];

const PartOne = (props: PartOneProps): JSX.Element => {
  const { formik, countryOptions } = props;

  return (
    <StyledFieldset>
      <StyledLegend>Part 1: General Info</StyledLegend>
      <FormFields>
        <Form.Group controlId="applicationFirstName">
          <RequiredFormLabel>First Name</RequiredFormLabel>
          <Form.Control type="text" {...formik.getFieldProps('firstName')}
                        required />
        </Form.Group>

        <Form.Group controlId="applicationLastName">
          <RequiredFormLabel>Last Name</RequiredFormLabel>
          <Form.Control type="text" {...formik.getFieldProps('lastName')}
                        required />
        </Form.Group>

        <Form.Group controlId="applicationEmailAddress">
          <RequiredFormLabel>Email Address</RequiredFormLabel>
          <Form.Control type="email" {...formik.getFieldProps('email')} required />
        </Form.Group>

        <Form.Group controlId="applicationCountry">
          <RequiredFormLabel>Country</RequiredFormLabel>
          <Select options={countryOptions}
                  onChange={(option) => option && formik.setFieldValue('country', option.value)}
          />
        </Form.Group>

        <Form.Group controlId="applicationGender">
          <StyledFormLabel>Gender</StyledFormLabel>
          <CreatableSelect options={genderOptions}
                           onChange={(option) => option && formik.setFieldValue('gender', option.value)}
          />
        </Form.Group>

        <Form.Group controlId="applicationFirstHackathon">
          <StyledFormLabel>Is this your first hackathon?</StyledFormLabel>
          <div>
            <Form.Check label="Yes"
                        type="radio"
                        id="applicationFirstHackathonYes"
                        value={formik.values.firstHackathon}
                        checked={formik.values.firstHackathon === HackathonAttended.Yes}
                        onChange={() => formik.setFieldValue('firstHackathon', HackathonAttended.Yes)}
                        onBlur={formik.handleBlur}
                        inline
            />
            <Form.Check label="No"
                        type="radio"
                        id="applicationFirstHackathonNo"
                        value={formik.values.firstHackathon}
                        checked={formik.values.firstHackathon === HackathonAttended.No}
                        onChange={() => formik.setFieldValue('firstHackathon', HackathonAttended.No)}
                        onBlur={formik.handleBlur}
                        inline
            />
          </div>
        </Form.Group>

        {formik.values.firstHackathon === 'No' && (
          <Form.Group controlId="applicationHackathonsAttended">
            <StyledFormLabel>Hackathons Attended</StyledFormLabel>
            <Form.Control type="number" min="1" {...formik.getFieldProps('hackathonsAttended')} />
          </Form.Group>
        )}
      </FormFields>
    </StyledFieldset>
  );
};

export default PartOne;