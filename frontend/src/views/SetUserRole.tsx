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
import { Resources, Roles, UsersAttributes } from 'security/accessControl';
import {
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  roleOptions,
  RootState,
  UnknownError,
  UserNotFoundError
} from 'types';
import { API_ROOT } from 'index';

interface SetUserRoleData {
  email: string;
  role: Roles | null;
}

const SetUserRole = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector((state: RootState) => state.auth.jwtAccessToken);
  const userRole = useSelector((state: RootState) => state.user.role);

  useEffect(() => {
    try {
      const permission = acCan(userRole).updateAny(Resources.Users);
      if (!permission.attributes.includes(UsersAttributes.Roles)) throw new NoPermissionError();
    } catch (err) {
      handleErrorAndPush(err, history);
    }
  }, []);

  const initialValues: SetUserRoleData = {
    email: '',
    role: null
  };

  const submitSetUserRole = async (setUserRoleData: SetUserRoleData): Promise<void> => {
    if (setUserRoleData.role === null) {
      toast.error('Please select a valid role for the user.');
      return;
    }

    try {
      await sendSetUserRoleRequest(setUserRoleData);
    } catch (err) {
      handleError(err);
    }
  };

  const sendSetUserRoleRequest = async (setUserRoleData: SetUserRoleData, overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/users/setRole`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(setUserRoleData)
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      toast.success('The user\'s role has been successfully updated.');
    } else if (res.status === 404) {
      throw new UserNotFoundError();
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await sendSetUserRoleRequest(setUserRoleData, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <>
      <StyledCenteredMarginH1>Set User Role</StyledCenteredMarginH1>

      <Formik
        initialValues={initialValues}
        onSubmit={submitSetUserRole}
      >
        {formik => (
          <StyledAuthForm onSubmit={formik.handleSubmit}>
            <Form.Group controlId="createUserEmail">
              <RequiredFormLabel>Email</RequiredFormLabel>
              <FastField as={Form.Control}
                         name="email"
                         type="email"
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
              Set Role
            </StyledSubmitButton>
          </StyledAuthForm>
        )}
      </Formik>
    </>
  );
};

export default SetUserRole;
