import React from 'react';
import { useHistory } from 'react-router-dom';
import { FastField, Formik, FormikHelpers } from 'formik';
import queryString from 'query-string';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import { RequiredFormLabel } from 'components';
import { StyledAuthForm, StyledSubmitButton } from 'common/styles/commonStyles';
import { logInAndRefreshUserData, validatePassword } from 'util/auth';
import { CONNECTION_ERROR_MESSAGE } from '../../../../constants';
import { AuthResponse, KeyPasswordData, SetPasswordData } from 'types';
import { API_ROOT } from 'index';

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

    try {
      validatePassword(activateFormData);
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
      return;
    }

    const parsedQuery = queryString.parse(location.search);
    const activationKey = parsedQuery.key as string;

    if (!activationKey) {
      toast.error('The activation key could not be found. Please click the activation link in the email you received and try again.');
      setSubmitting(false);
      return;
    }

    const requestBody: KeyPasswordData = {
      key: activationKey,
      password: activateFormData.password
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
      // Fetch and set user data on the client
      const resBody: AuthResponse = await res.json();
      await logInAndRefreshUserData(resBody.token);

      // Redirect user to their dashboard
      toast.success('Your account has been successfully activated.');
      history.push('/');
    } else if (res.status === 401) {
      toast.error('The activation link is invalid. Please request another one.');
    } else if (res.status === 409) {
      toast.error('This account has already been activated.');
    } else {
      console.error(await res.json());
      toast.error('An unknown error occurred. Please try again.');
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
