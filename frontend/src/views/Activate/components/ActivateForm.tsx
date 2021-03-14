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
import { AuthResponse } from 'types';
import { refreshUserData } from 'util/auth';
import { StyledSubmitButton } from 'views/ApplicationPage/components/ApplicationForm';

interface ActivateData {
  password: string;
  confirmPassword: string;
}

const ActivateForm = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();

  const initialValues: ActivateData = {
    password: '',
    confirmPassword: ''
  };

  const activateAccount = async (
    activateFormData: ActivateData,
    { setSubmitting }: FormikHelpers<ActivateData>
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

    const parsedKey = queryString.parse(location.search).key;
    if (!parsedKey) {
      toast.error('Key does not exist');
      setSubmitting(false);
      return;
    }

    const requestBody = { 
      key: parsedKey,
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
      toast.error(err.message);
      setSubmitting(false);
      return;
    }

    if (res.status === 200) {
      const resBody: AuthResponse = await res.json();
      localStorage.setItem('isUserLoggedIn', JSON.stringify(true));
      dispatch(logIn());
      dispatch(setJwtAccessToken(resBody.token));
      await refreshUserData();
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
        <StyledForm onSubmit={formik.handleSubmit}>
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
        </StyledForm>
      )}
    </Formik>
  );
};

const StyledForm = styled(Form)`
  margin: 0 auto;
  max-width: 400px;
`;

export default ActivateForm;
