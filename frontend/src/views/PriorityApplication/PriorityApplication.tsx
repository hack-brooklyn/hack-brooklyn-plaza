import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { MonoHeading } from 'commonStyles';
import { Formik, FormikHelpers } from 'formik';
import { countries, Country, Option } from 'types';
import Form from 'react-bootstrap/Form';
import PartOne, { HackathonAttended } from 'views/PriorityApplication/components/PartOne';
import Button from 'react-bootstrap/Button';

export interface ApplicationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  gender?: string;
  firstHackathon?: HackathonAttended;
  hackathonsAttended?: number;
}

const submitApplication = (values: ApplicationFormValues, { setSubmitting }: FormikHelpers<ApplicationFormValues>): void => {
  setSubmitting(true);
  console.log(values);
  setSubmitting(false);
};

const PriorityApplication = (): JSX.Element => {
  const [formLoaded, setFormLoaded] = useState<boolean>(false);
  const [countryOptions, setCountryOptions] = useState<Option[]>();

  useEffect(() => {
    // Prepare react-select options before showing the form
    setCountryOptions(countries.map((country: Country) => ({
      value: country.abbreviation,
      label: country.country
    })));

    setFormLoaded(true);
  }, []);

  return (
    <ApplicationContainer>
      <MonoHeading>
        <span role="text">
          Hack Brooklyn<br />Priority Application
        </span>
      </MonoHeading>

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
                <PartOne formik={formik} countryOptions={countryOptions} />
                <StyledSubmitButton type="submit" size="lg">Submit Application</StyledSubmitButton>
              </Form>
            )}
          </Formik>) : (<h2>Loading...</h2>)
      }
    </ApplicationContainer>
  );
};

const ApplicationContainer = styled.section`
  max-width: 800px;
  margin: 0 auto;
`;

const StyledSubmitButton = styled(Button)`
  display: block;
  margin: 1rem auto 0;
`

export default PriorityApplication;