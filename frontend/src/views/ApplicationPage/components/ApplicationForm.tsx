import React from 'react';
import styled from 'styled-components/macro';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import cloneDeep from 'lodash.clonedeep';
import { toast } from 'react-toastify';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { Agreements, PartFour, PartOne, PartThree, PartTwo } from './FormParts';
import { ApplicationFormValues } from 'types';
import countries from 'assets/data/countries.json';
import { API_ROOT } from 'index';
import { PRIORITY_APPLICATIONS_ACTIVE } from 'views/ApplicationPage/ApplicationPage';
import { toastValidationErrors } from 'util/toastValidationErrors';

export interface FormPartProps {
  formik: FormikProps<ApplicationFormValues>;
}

interface ApplicationFormProps {
  setApplicationSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  priorityApplicantEmail?: string;
}

const ApplicationForm = (props: ApplicationFormProps): JSX.Element => {
    const { setApplicationSubmitted, priorityApplicantEmail } = props;

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

    const submitApplication = async (submittedApplication: ApplicationFormValues, { setSubmitting }: FormikHelpers<ApplicationFormValues>): Promise<void> => {
      setSubmitting(true);

      // Check if resume is over 10MB
      if (submittedApplication.resumeFile && submittedApplication.resumeFile.size > 10485760) {
        const submittedResumeFileSizeMb = (submittedApplication.resumeFile.size / 1024 / 1024).toFixed(2);

        toast.error(`Resumes have a 10 MB limit. The resume you uploaded is ${submittedResumeFileSizeMb} MB.`);

        setSubmitting(false);
        return;
      }

      // We will send the resume and the form data separately to keep JSON types since multipart/form-data only sends data as strings
      // Copy application to process necessary fields and remove resumeFile (we're sending it separately)
      const processedFormValues: ApplicationFormValues = cloneDeep(submittedApplication);

      // Convert isFirstHackathon boolean from "Yes"/"No" to boolean and nullify number of hackathons attended accordingly
      switch (processedFormValues.isFirstHackathon) {
        case 'Yes':
          processedFormValues.isFirstHackathon = true;
          processedFormValues.numberHackathonsAttended = null;
          break;
        case 'No':
          processedFormValues.isFirstHackathon = false;
          break;
        default:
          processedFormValues.isFirstHackathon = null;
          processedFormValues.numberHackathonsAttended = null;
      }

      // Remove the resume from the JSON data
      delete processedFormValues.resumeFile;

      // Append the priority applicant's email if priority applications are active
      if (PRIORITY_APPLICATIONS_ACTIVE) {
        processedFormValues.priorityApplicantEmail = priorityApplicantEmail;
      }

      // Create form data with the resume file + the submitted data as JSON
      const formData = new FormData();
      formData.append('formDataJson', JSON.stringify(processedFormValues));
      // Add resume only if it exists
      if (submittedApplication.resumeFile) {
        formData.append('resumeFile', submittedApplication.resumeFile as Blob);
      }

      let res;
      try {
        res = await fetch(`${API_ROOT}/apply`, {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        setSubmitting(false);
        toastErrorMessage();
        console.error(err);
        return;
      }

      setSubmitting(false);
      if (res.status === 200) {
        // 200 OK
        // Application submitted successfully
        setApplicationSubmitted(true);
        toast.success('Application submitted successfully!');
      } else if (res.status === 400) {
        // 400 Bad Request
        // The submitted data failed validation
        const data = await res.json();
        toastValidationErrors(data.errors);
      } else if (res.status === 409) {
        // 409 Conflict
        toast.error('An application has already been submitted with the email address you provided.');
      } else {
        // Some other error happened
        toastErrorMessage();
      }
    };

    const toastErrorMessage = () => {
      toast.error('There was an error submitting your application! Please try again. If this error continues to happen, please send us an email at contact@hackbrooklyn.org for further assistance. You can also click this message or click "Contact Us" on the header to send us an email.', {
        autoClose: 30000,
        onClick: () => {
          window.open('mailto:contact@hackbrooklyn.org');
        }
      });
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
          <PartFour formik={formik} />
          <Agreements formik={formik} />
          <StyledSubmitButton type="submit" size="lg" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Submitting...' : 'Submit Application'}
          </StyledSubmitButton>
        </Form>
      )}
    </Formik>;
  }
;

export const countryOptions = countries.map((country) => ({
  value: country.country,
  label: country.country
}));

export const StyledSubmitButton = styled(Button)`
  display: block;
  margin: 2rem auto;
`;

export default ApplicationForm;
