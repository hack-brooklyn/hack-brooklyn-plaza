import React from 'react';
import queryString from 'query-string';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import styled from 'styled-components/macro';

import { logIn, setJwtAccessToken } from 'actions/auth';
import { RequiredFormLabel } from 'components';
import { FastField, Formik, FormikHelpers } from 'formik';
import { API_ROOT } from 'index';
import { AuthResponse, KeyPasswordData, SetPasswordData } from 'types';
import { logInAndRefreshUserData, refreshUserData } from 'util/auth';
import { StyledSubmitButton } from 'views/ApplicationPage/components/ApplicationForm';
import { StyledAuthForm } from 'commonStyles';
import { CONNECTION_ERROR_MESSAGE } from '../../../constants';

const ActivateForm = (): JSX.Element => {
  const history = useHistory();

  const initialValues: SetPasswordData = {
    password: '',
    confirmPassword: ''
  };

  const activateAccount = async (
    activateFormData: SetPasswordData,
    { setSubmitting }: FormikHelpers<SetPasswordData>
  ): Promise<void> => {
    setSubmitting(true);

    const password = activateFormData.password;

    if (password !== activateFormData.confirmPassword) {
      toast.error('Password do not match');
      setSubmitting(false);
      return;
    }

    if (password.length < 12) {
      toast.error('Password must be at least 12 characters');
      setSubmitting(false);
      return;
    }

    const parsedQuery = queryString.parse(location.search);
    const activationKey = parsedQuery.key as string;
    
    if (!activationKey) {
      toast.error('Key does not exist');
      setSubmitting(false);
      return;
    }
    
    const requestBody:KeyPasswordData = { 
      key: activationKey,
      password: password 
    };
    
    let res;
    try {
      res = await fetch(`${API_ROOT}/users/activate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    } catch (err) {
      console.error(err);
      toast.error(CONNECTION_ERROR_MESSAGE);
      setSubmitting(false);
      return;
    }

    if (res.status === 200) {
      const resBody: AuthResponse = await res.json();
      
      logInAndRefreshUserData(resBody.token);
      toast.success('You have activated your account');
      history.push('/');
    } else if (res.status === 401) {
      toast.error('Key is invalid');
    } else if (res.status === 409) {
      toast.error('Account already activated');
    } else {
      console.error(await res.json());
      toast.error('Unknown error');
    }

    setSubmitting(false);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={activateAccount}>
      {(formik) => (
        <StyledAuthForm onSubmit={formik.handleSubmit}>
          <Form.Group controlId="activatePassword">
            <RequiredFormLabel>Password</RequiredFormLabel>
            <FastField
              as={Form.Control}
              name="password"
              type="password"
              disabled={formik.isSubmitting}
              required
            />
          </Form.Group>
          <Form.Group controlId="activateConfirmPassword">
            <RequiredFormLabel>Confirm Password</RequiredFormLabel>
            <FastField
              as={Form.Control}
              name="confirmPassword"
              type="password"
              disabled={formik.isSubmitting}
              required
            />
          </Form.Group>

          <StyledSubmitButton
            type="submit"
            size="lg"
            disabled={formik.isSubmitting}
          >
            Activate Account
          </StyledSubmitButton>
        </StyledAuthForm>
      )}
    </Formik>
  );
};

export default ActivateForm;
