import React from 'react';
import { FastField, Formik, FormikHelpers } from 'formik';
import styled from 'styled-components/macro';
import Form from 'react-bootstrap/Form';

import { RequiredFormLabel } from 'components';
import { StyledSubmitButton } from 'views/ApplicationPage/components/ApplicationForm';
import { toast } from 'react-toastify';
import { LoginData, logInUser } from 'util/auth';
import { useHistory } from 'react-router-dom';

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
        <StyledH1>Log In to Hack Brooklyn Plaza</StyledH1>

        <Formik
          initialValues={initialValues}
          onSubmit={submitLogin}
        >
          {formik => (
            <StyledForm onSubmit={formik.handleSubmit}>
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

              <StyledSubmitButton type="submit" size="lg" disabled={formik.isSubmitting}>
                Log In
              </StyledSubmitButton>
            </StyledForm>
          )}
        </Formik>
      </>
    );
  }
;

const StyledH1 = styled.h1`
  text-align: center;
  font-size: 3rem;
  margin-bottom: 2rem;
`;

const StyledForm = styled(Form)`
  margin: 0 auto;
  max-width: 400px;
`;

export default Login;
