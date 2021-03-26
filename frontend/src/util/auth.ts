import { History, LocationState } from 'history';
import { Permission, Query } from 'accesscontrol';
import { toast } from 'react-toastify';

import { logIn, logOut, setJwtAccessToken } from 'actions/auth';
import { setUserData } from 'actions/user';
import { initialUserState } from 'reducers/user';
import { handleError } from 'util/plazaUtils';
import ac, { Attributes, Roles } from 'security/accessControl';
import store from 'store';
import {
  AuthenticationError,
  AuthResponse,
  ConnectionError,
  InvalidCredentialsError,
  MismatchedPasswordError,
  PasswordTooShortError,
  RoleNotFoundError,
  SetPasswordData,
  TokenExpiredError,
  UserState
} from 'types';
import { API_ROOT } from 'index';

export interface LoginData {
  email: string;
  password: string;
}

export const logInUser = async (loginData: LoginData): Promise<void> => {
  let res;
  try {
    res = await fetch(`${API_ROOT}/users/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
  } catch (err) {
    throw new ConnectionError();
  }

  if (res.status === 200) {
    const resBody: AuthResponse = await res.json();
    await logInAndRefreshUserData(resBody.token);
  } else if (res.status === 401 || res.status === 400) {
    throw new InvalidCredentialsError();
  } else {
    throw new AuthenticationError();
  }
};

/**
 * Utility that logs a user in, sets their access token in the Redux store, and refreshes their user data.
 * Used for logging in, activating accounts, and resetting passwords.
 * @param accessToken The user's access token.
 */
export const logInAndRefreshUserData = async (
  accessToken: string
): Promise<void> => {
  store.dispatch(setJwtAccessToken(accessToken));
  await refreshUserData();
  store.dispatch(logIn());
  localStorage.setItem('isUserLoggedIn', JSON.stringify(true));
};

/**
 * Logs a user out by removing the refresh token, user data, and other relevant
 * user data from the browser.
 */
export const logOutUser = async (): Promise<void> => {
  let res;
  try {
    res = await fetch(`${API_ROOT}/users/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    // Log the user out locally, items in Redux store will be removed on page reload
    localStorage.setItem('isUserLoggedIn', JSON.stringify(false));
    toast.warn('You have been logged out locally. Please refresh the page.');
    throw new ConnectionError();
  }

  if (res.status === 200) {
    localStorage.setItem('isUserLoggedIn', JSON.stringify(false));
    store.dispatch(setJwtAccessToken(null));
    store.dispatch(setUserData(initialUserState));
    store.dispatch(logOut());
  } else {
    throw new AuthenticationError();
  }
};

/**
 * Refreshes the user's access token using their refresh token and saves the new
 * access token in the Redux store.
 */
export const refreshAccessToken = async (
  history?: History<LocationState>
): Promise<string> => {
  let res;
  try {
    res = await fetch(`${API_ROOT}/users/refreshAccessToken`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    throw new ConnectionError();
  }

  if (res.status === 200) {
    // Get token from response body and save in Redux store
    const resBody: AuthResponse = await res.json();
    store.dispatch(setJwtAccessToken(resBody.token));
    return resBody.token;
  } else if (res.status === 401) {
    // Refresh token has expired
    await logOutUser();
    history && history.push('/');
    throw new TokenExpiredError();
  } else {
    throw new AuthenticationError();
  }
};

/**
 * Refreshes the user's data from the server and saves it in the Redux store.
 */
export const refreshUserData = async (): Promise<void> => {
  const state = store.getState();
  const accessToken = state.auth.jwtAccessToken;

  let res;
  try {
    res = await fetch(`${API_ROOT}/users/data`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    throw new ConnectionError();
  }

  if (res.status === 200) {
    // Get user data from response body and save in Redux store
    const resBody: UserState = await res.json();
    store.dispatch(setUserData(resBody));
  } else if (res.status === 401) {
    throw new TokenExpiredError();
  } else {
    throw new AuthenticationError();
  }
};

export const handleLogOut = async (
  history: History<LocationState>
): Promise<void> => {
  try {
    await logOutUser();
    history.push('/');
    toast.success('You have been logged out of Hack Brooklyn Plaza.');
  } catch (err) {
    handleError(err);
  }
};

export const validatePassword = (passwordData: SetPasswordData): void => {
  const { password, confirmPassword } = passwordData;
  if (password !== confirmPassword) {
    throw new MismatchedPasswordError();
  }
  if (password.length < 12) {
    throw new PasswordTooShortError();
  }
};

/**
 * Equivalent to AccessControl's ac.can() but with a null check.
 * Will throw an error if `role` is null.
 * @param role The role to check.
 */
export const acCan = (role: Roles | null): Query => {
  if (role === null) throw new RoleNotFoundError();
  return ac.can(role);
};

/**
 * Checks whether or not an AccessControl permission has a provided attribute.
 * Includes support for wildcard attributes.
 * @param permission The permission to check.
 * @param checkedAttributes The attributes to check.
 * @return Whether or not the user has access.
 */
export const acHasAttributeAccess = (
  permission: Permission,
  checkedAttributes: Attributes[]
): boolean => {
  const permissionAttributes = permission.attributes;
  const checkedAttributesWithWildcard = [...checkedAttributes, '*'];

  return permissionAttributes.some((attribute) =>
    checkedAttributesWithWildcard.includes(attribute)
  );
};
