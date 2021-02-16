import React from 'react';
import styled from 'styled-components/macro';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import cloneDeep from 'lodash.clonedeep';
import startCase from 'lodash.startcase';
import { toast } from 'react-toastify';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { Agreements, PartFour, PartOne, PartThree, PartTwo } from './FormParts';
import { ApplicationFormValues } from 'types';
import countries from 'assets/data/countries.json';
import { API_ROOT } from 'index';
import { PRIORITY_APPLICATIONS_ACTIVE } from 'views/ApplicationPage/ApplicationPage';

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
        toast.error('There was an error submitting your application! Please try again.');
        console.error(err);
        return;
      }

      if (res.status === 400) {
        setSubmitting(false);
        const data = await res.json();

        toast.error('Some of your submitted data doesn\'t look right. Please correct the following errors and try again.', {
          autoClose: 15000
        });
        for (const [field, errorMessage] of Object.entries(data.errors)) {
          toast.error(`${startCase(field)} ${errorMessage}.`, {
            autoClose: 15000
          });
        }

        return;
      }

      toast.success('Application submitted successfully!');
      setSubmitting(false);
      setApplicationSubmitted(true);
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
