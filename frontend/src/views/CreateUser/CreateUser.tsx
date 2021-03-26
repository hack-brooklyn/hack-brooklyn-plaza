import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FastField, Formik } from 'formik';
import Form from 'react-bootstrap/Form';
import Select from 'react-select';
import { toast } from 'react-toastify';

import { RequiredFormLabel } from 'components';
import { StyledAuthForm, StyledCenteredMarginH1, StyledSubmitButton } from 'commonStyles';
import { acCan, refreshAccessToken } from 'util/auth';
import { handleError, handleErrorAndPush } from 'util/plazaUtils';
import { Resources, Roles } from 'security/accessControl';
import {
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  roleOptions,
  RootState,
  UnknownError,
  UserAlreadyExistsError
} from 'types';
import { API_ROOT } from 'index';

interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Roles | null;
}

const CreateUser = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector((state: RootState) => state.auth.jwtAccessToken);
  const userRole = useSelector((state: RootState) => state.user.role);

  useEffect(() => {
    try {
      const permission = acCan(userRole).createAny(Resources.Users);
      if (!permission.granted) throw new NoPermissionError();
    } catch (err) {
      handleErrorAndPush(err, history);
    }
  }, []);

  const initialValues: CreateUserData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: null
  };

  const submitCreateUser = async (createUserData: CreateUserData): Promise<void> => {
    if (createUserData.role === null) {
      toast.error('Please select a valid role for the new user.');
      return;
    }

    try {
      await sendCreateUserRequest(createUserData);
    } catch (err) {
      handleError(err);
    }
  };

  const sendCreateUserRequest = async (createUserData: CreateUserData, overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/users/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createUserData)
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      toast.success('The user has been successfully created.');
    } else if (res.status === 409) {
      throw new UserAlreadyExistsError();
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendCreateUserRequest(createUserData, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <>
      <StyledCenteredMarginH1>Create New User Account</StyledCenteredMarginH1>

      <Formik
        initialValues={initialValues}
        onSubmit={submitCreateUser}
      >
        {formik => (
          <StyledAuthForm onSubmit={formik.handleSubmit}>
            <Form.Group controlId="createUserFirstName">
              <RequiredFormLabel>First Name</RequiredFormLabel>
              <FastField as={Form.Control}
                         name="firstName"
                         type="text"
                         disabled={formik.isSubmitting}
                         required />
            </Form.Group>

            <Form.Group controlId="createUserLastName">
              <RequiredFormLabel>Last Name</RequiredFormLabel>
              <FastField as={Form.Control}
                         name="lastName"
                         type="text"
                         disabled={formik.isSubmitting}
                         required />
            </Form.Group>

            <Form.Group controlId="createUserEmail">
              <RequiredFormLabel>Email</RequiredFormLabel>
              <FastField as={Form.Control}
                         name="email"
                         type="email"
                         disabled={formik.isSubmitting}
                         required />
            </Form.Group>

            <Form.Group controlId="createUserPassword">
              <RequiredFormLabel>Password</RequiredFormLabel>
              <FastField as={Form.Control}
                         name="password"
                         type="password"
                         minlength="12"
                         placeholder="Minimum 12 characters."
                         disabled={formik.isSubmitting}
                         required />
            </Form.Group>

            <Form.Group controlId="createUserRole">
              <RequiredFormLabel>Role</RequiredFormLabel>
              <Select options={roleOptions}
                      onChange={(option) => option && formik.setFieldValue('role', option.value)}
                      isDisabled={formik.isSubmitting}
                      required
              />
            </Form.Group>

            <StyledSubmitButton type="submit" size="lg" disabled={formik.isSubmitting}>
              Create Account
            </StyledSubmitButton>
          </StyledAuthForm>
        )}
      </Formik>
    </>
  );
};

export default CreateUser;
