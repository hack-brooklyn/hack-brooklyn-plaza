import React from 'react';
import { FastField, Formik, FormikHelpers } from 'formik';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import { RequiredFormLabel } from 'components';
import { StyledAuthForm, StyledSubmitButton } from 'common/styles/commonStyles';
import { CONNECTION_ERROR_MESSAGE } from '../../../../constants';
import { EmailData } from 'types';
import { API_ROOT } from 'index';

const ActivateRequestForm = (): JSX.Element => {
  const initialValues: EmailData = {
    email: ''
  };

  const activateEmail = async (
    activateFormData: EmailData,
    { setSubmitting }: FormikHelpers<EmailData>
  ): Promise<void> => {
    setSubmitting(true);

    let res;
    try {
      res = await fetch(`${API_ROOT}/users/activate/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activateFormData)
      });
    } catch (err) {
      console.error(err);
      toast.error(CONNECTION_ERROR_MESSAGE);
      setSubmitting(false);
      return;
    }

    if (res.status === 200) {
      toast.success('Activation email sent! Please check your email to finish activating your account.');
    } else if (res.status === 400) {
      toast.error('Please enter a valid email.');
    } else if (res.status === 404) {
      toast.error('No applicant with this email could be found.');
    } else if (res.status === 409) {
      toast.error('This account has already been activated.');
    } else {
      console.error(await res.json());
      toast.error('An unknown error occurred. Please try again.');
    }

    setSubmitting(false);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={activateEmail}>
      {(formik) => (
        <StyledAuthForm onSubmit={formik.handleSubmit}>
          <Form.Group controlId="activateEmail">
            <RequiredFormLabel>Email You Applied With</RequiredFormLabel>
            <FastField
              as={Form.Control}
              name="email"
              type="email"
              disabled={formik.isSubmitting}
              required
            />
          </Form.Group>

          <StyledSubmitButton
            type="submit"
            size="lg"
            disabled={formik.isSubmitting}
          >
            Send Activation Email
          </StyledSubmitButton>
        </StyledAuthForm>
      )}
    </Formik>
  );
};

export default ActivateRequestForm;
