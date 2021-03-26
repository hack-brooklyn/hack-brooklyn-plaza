import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FastField, Formik, FormikHelpers } from 'formik';
import styled from 'styled-components/macro';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import { RequiredFormLabel } from 'components';
import { LoginData, logInUser } from 'util/auth';
import {
  StyledAuthForm,
  StyledCenteredMarginH1,
  StyledSubmitButton,
} from 'commonStyles';

const Login = (): JSX.Element => {
    const history = useHistory();

    const initialValues: LoginData = {
      email: '',
      password: ''
    };

    const submitLogin = async (loginFormData: LoginData, { setSubmitting }: FormikHelpers<LoginData>): Promise<void> => {
      setSubmitting(true);

      try {
        await logInUser(loginFormData);
        history.push('/');
      } catch (err) {
        toast.error(err.message);
      }

      setSubmitting(false);
    };

    return (
      <>
        <StyledCenteredMarginH1>Log In to Hack Brooklyn Plaza</StyledCenteredMarginH1>

        <Formik
          initialValues={initialValues}
          onSubmit={submitLogin}
        >
          {formik => (
            <StyledAuthForm onSubmit={formik.handleSubmit}>
              <Form.Group controlId="loginEmail">
                <RequiredFormLabel>Email</RequiredFormLabel>
                <FastField as={Form.Control}
                           name="email"
                           type="email"
                           disabled={formik.isSubmitting}
                           required />
              </Form.Group>

              <Form.Group controlId="loginPassword">
                <RequiredFormLabel>Password</RequiredFormLabel>
                <FastField as={Form.Control}
                           name="password"
                           type="password"
                           disabled={formik.isSubmitting}
                           required />
              </Form.Group>

              <StyledLink to="/resetpassword">Forgot Password?</StyledLink>

              <StyledSubmitButton type="submit" size="lg" disabled={formik.isSubmitting}>
                Log In
              </StyledSubmitButton>
            </StyledAuthForm>
          )}
        </Formik>
      </>
    );
  }
;

const StyledLink = styled(Link)`
  display: inline-block;
  text-decoration: none;
  margin-top: 0.5rem;
`;

export default Login;
