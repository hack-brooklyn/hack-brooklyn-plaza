import React from 'react';
import countries from 'assets/data/countries.json';
import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import Form from 'react-bootstrap/Form';
import PartOne from 'views/ApplicationView/components/FormParts/PartOne';
import PartTwo from 'views/ApplicationView/components/FormParts/PartTwo';
import PartThree from 'views/ApplicationView/components/FormParts/PartThree';
import PartFour from 'views/ApplicationView/components/FormParts/PartFour';
import Agreements from 'views/ApplicationView/components/FormParts/Agreements';
import cloneDeep from 'lodash.clonedeep';
import axios, { AxiosResponse } from 'axios';
import { ApplicationFormValues } from 'types';

export interface FormPartProps {
  formik: FormikProps<ApplicationFormValues>;
}

interface ApplicationFormProps {
  setApplicationSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

const requiredInitialValues: ApplicationFormValues = {
  // Part 1
  firstName: '',
  lastName: '',
  email: '',
  country: '',

  // Part 2
  school: '',
  levelOfStudy: '',
  graduationYear: '' as unknown as number,  // to avoid showing a number at first in the form

  // Agreements
  acceptTocAndCoc: false
};

const ApplicationForm = (props: ApplicationFormProps): JSX.Element => {
  const { setApplicationSubmitted } = props;

  const submitApplication = (submittedApplication: ApplicationFormValues, { setSubmitting }: FormikHelpers<ApplicationFormValues>): void => {
    setSubmitting(true);

    // Check if resume is over 10MB
    if (submittedApplication.resumeFile && submittedApplication.resumeFile.size > 10485760) {
      const submittedResumeFileSizeMb = (submittedApplication.resumeFile.size / 1024 / 1024).toFixed(2);

      alert(`Resumes have a 10 MB limit. The resume you uploaded is ${submittedResumeFileSizeMb} MB.`);
      console.error('Uploaded resume is too large.');

      setSubmitting(false);
      return;
    }

    // We will send the resume and the form data separately to keep JSON types since multipart/form-data only sends data as strings
    try {
      // Copy application to process necessary fields and remove resumeFile (we're sending it separately)
      const processedFormValues: ApplicationFormValues = cloneDeep(submittedApplication);

      // Convert isFirstHackathon boolean from "Yes"/"No" to boolean
      switch (processedFormValues.isFirstHackathon) {
        case 'Yes':
          processedFormValues.isFirstHackathon = true;
          break;
        case 'No':
          processedFormValues.isFirstHackathon = false;
          break;
        default:
          processedFormValues.isFirstHackathon = undefined;
      }

      // Remove the resume from the JSON data
      delete processedFormValues.resumeFile;

      // Create form data with the resume file + the other data as JSON
      const formData = new FormData();
      formData.append('formDataJson', JSON.stringify(processedFormValues));
      // Add resume only if it exists
      if (submittedApplication.resumeFile) {
        formData.append('resumeFile', submittedApplication.resumeFile as Blob);
      }

      console.log(formData.get('resumeFile'));
      console.log(formData.get('formDataJson'));

      // Send the application form to the backend
      axios.post('http://localhost:8080/api/applicationForm', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res: AxiosResponse) => {
        if (res.status === 200) {
          alert('Successfully submitted application!');
          setApplicationSubmitted(true);
        } else {
          displaySubmissionError(res.data);
          setApplicationSubmitted(false);
        }
      }).catch(displaySubmissionError);
    } catch (err) {
      displaySubmissionError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return <Formik
    initialValues={requiredInitialValues}
    onSubmit={submitApplication}
  >
    {formik => (
      <Form onSubmit={formik.handleSubmit}>
        <PartOne formik={formik} countryOptions={countryOptions} />
        <PartTwo formik={formik} />
        <PartThree formik={formik} />
        <PartFour />
        <Agreements />
        <StyledSubmitButton type="submit" size="lg">Submit Application</StyledSubmitButton>
      </Form>
    )}
  </Formik>;
};

const displaySubmissionError = (err: Error) => {
  alert('There was an error submitting your application! Please try again.');
  console.error(err);
};

export const countryOptions = countries.map((country) => ({
  value: country.country,
  label: country.country
}));

export const StyledSubmitButton = styled(Button)`
  display: block;
  margin: 2rem auto 25vh;
`;

export default ApplicationForm;
