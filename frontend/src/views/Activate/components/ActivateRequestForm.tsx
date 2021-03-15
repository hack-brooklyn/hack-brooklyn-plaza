import React from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import styled from 'styled-components/macro';
import { FastField, Formik, FormikHelpers } from 'formik';

import { API_ROOT } from 'index';
import { RequiredFormLabel } from 'components';
import { StyledSubmitButton } from 'views/ApplicationPage/components/ApplicationForm';
import { StyledAuthForm } from 'commonStyles';
import { CONNECTION_ERROR_MESSAGE } from '../../../constants';

interface ActivateRequestData {
  email: string;
}

const ActivateRequestForm = (): JSX.Element => {
  const initialValues: ActivateRequestData = {
    email: ''
  };

  const activateEmail = async (
    activateFormData: ActivateRequestData,
    { setSubmitting }: FormikHelpers<ActivateRequestData>
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
      toast.success('Please check your email for an activation link');
    } else if (res.status === 400) {
      toast.error('Please enter a valid email');
    } else if (res.status === 409) {
      toast.error('Account already activated');
    } else {
      console.error(await res.json());
      toast.error('Unknown error');
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
