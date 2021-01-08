import React, { useEffect, useState } from 'react';
import { Formik, FormikHelpers } from 'formik';
import Select from 'react-select';
import Form from 'react-bootstrap/Form';
import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';
import { countries, Option } from 'types';

interface ApplicationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  firstHackathon?: 'Yes' | 'No';
  hackathonsAttended?: number;
}

const submitApplication = (values: ApplicationFormValues, { setSubmitting }: FormikHelpers<ApplicationFormValues>) => {
  console.log(values);
  return;
};

const ApplicationForm = () => {
    const [formLoaded, setFormLoaded] = useState<boolean>(false);
    const [countryOptions, setCountryOptions] = useState<Option[]>();

    useEffect(() => {
      setCountryOptions(countries.map(country => ({
        value: country.abbreviation,
        label: country.country
      })));

      setFormLoaded(true);
    }, []);

    return (
      <>
        {
          formLoaded ? (
            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                email: '',
                country: ''
              }}
              onSubmit={submitApplication}
            >
              {formik => (
                <Form onSubmit={formik.handleSubmit}>
                  <fieldset>
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

                      <Form.Group controlId="applicationFirstHackathon">
                        <Form.Label>Is this your first hackathon?</Form.Label>
                        <div>
                          <Form.Check inline label="Yes" type="radio"
                                      value={formik.values.firstHackathon}
                                      checked={formik.values.firstHackathon === 'Yes'}
                                      onChange={() => formik.setFieldValue('firstHackathon', 'Yes')}
                                      onBlur={formik.handleBlur}
                          />
                          <Form.Check inline label="No" type="radio"
                                      value={formik.values.firstHackathon}
                                      checked={formik.values.firstHackathon === 'No'}
                                      onChange={() => formik.setFieldValue('firstHackathon', 'No')}
                                      onBlur={formik.handleBlur}
                          />
                        </div>
                      </Form.Group>

                      {formik.values.firstHackathon === 'No' && (
                        <Form.Group controlId="applicationHackathonsAttended">
                          <Form.Label>Hackathons Attended</Form.Label>
                          <Form.Control type="number" min="1" {...formik.getFieldProps('hackathonsAttended')} />
                        </Form.Group>
                      )}
                    </FormFields>
                  </fieldset>
                  <Button type="submit">Submit Application</Button>
                </Form>
              )}
            </Formik>) : (<h2>Loading...</h2>)
        }
      </>
    );
  }
;

const FormFields = styled.div`
  @media screen and (min-width: 992px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 2rem;
  }
`;

interface RequiredFormLabelProps {
  children: React.ReactNode;
}

const RequiredFormLabel = (props: RequiredFormLabelProps) => {
  const { children } = props;

  return (
    <Form.Label>
      {children}
      <span style={{ color: 'red' }}>*</span>
    </Form.Label>
  );
};

const StyledLegend = styled.legend`
  text-align: center;
`;

export default ApplicationForm;