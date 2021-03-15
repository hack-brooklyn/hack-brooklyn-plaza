import React from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import styled from 'styled-components/macro';
import { FastField, Formik, FormikHelpers } from 'formik';

import { API_ROOT } from 'index';
import { RequiredFormLabel } from 'components';
import { StyledSubmitButton } from 'views/ApplicationPage/components/ApplicationForm';
import { EmailData } from 'types';
import { CONNECTION_ERROR_MESSAGE } from '../../../constants';


const ResetPasswordRequestForm = (): JSX.Element => {
  const initialValues: EmailData = {
    email: ''
  };

  const sendPasswordReset = async (
    passwordResetData: EmailData,
    { setSubmitting }: FormikHelpers<EmailData>
  ): Promise<void> => {
    setSubmitting(true);

    let res;
    try {
      res = await fetch(`${API_ROOT}/users/resetPassword/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordResetData)
      });
    } catch (err) {
      console.error(err);
      toast.error(CONNECTION_ERROR_MESSAGE);
      setSubmitting(false);
      return;
    }

    if (res.status === 200) {
      toast.success('Please check your email for an password reset link');
    } else if (res.status === 400) {
      toast.error('Please enter a valid email');
    } else if (res.status === 404) {
      toast.error('Email not found');
    } else {
      console.error(await res.json());
      toast.error('Unknown error');
    }

    setSubmitting(false);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={sendPasswordReset}>
      {(formik) => (
        <StyledForm onSubmit={formik.handleSubmit}>
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
            Send Password Reset Email
          </StyledSubmitButton>
        </StyledForm>
      )}
    </Formik>
  );
};

const StyledForm = styled(Form)`
  margin: 0 auto;
  max-width: 400px;
`;

export default ResetPasswordRequestForm;
