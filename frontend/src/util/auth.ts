import { History, LocationState } from 'history';

import store from 'store';
import { logIn, logOut, setJwtAccessToken } from 'actions/auth';
import { AuthResponse } from 'types';
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
    // Get access token from response
    const resBody: AuthResponse = await res.json();
    setUserLoggedIn(resBody.token);
  } else if (res.status === 401 || res.status === 400) {
    throw new InvalidCredentialsError();
  } else {
    throw new AuthenticationError();
  }
};

export const logOutUser = async (): Promise<void> => {
  let res;
  try {
    res = await fetch(`${API_ROOT}/users/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    throw new ConnectionError();
  }

  if (res.status === 200) {
    setUserLoggedOut();
  } else {
    throw new AuthenticationError();
  }
};

/**
 * Refreshes the user's access token using their refresh token.
 */
export const refreshAccessToken = async (history: History<LocationState>): Promise<void> => {
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
    setUserLoggedIn(resBody.token);
  } else if (res.status === 401) {
    history.push('/login');
    throw new TokenExpiredError();
  } else {
    throw new AuthenticationError();
  }
};

const setUserLoggedIn = (token: string) => {
  localStorage.setItem('isUserLoggedIn', JSON.stringify(true));
  store.dispatch(logIn());
  store.dispatch(setJwtAccessToken(token));
};

const setUserLoggedOut = () => {
  localStorage.setItem('isUserLoggedIn', JSON.stringify(false));
  store.dispatch(logOut());
  store.dispatch(setJwtAccessToken(null));
};

class ConnectionError extends Error {
  constructor() {
    super();
    this.name = 'ConnectionError';
    this.message = 'An error occurred while connecting to the server. Please check your Internet connection and try again.';
  }
}

class AuthenticationError extends Error {
  constructor() {
    super();
    this.name = 'AuthenticationError';
    this.message = 'An error occurred while trying to authenticate your account. Please refresh the page or log out and in and try again.';
  }
}

class InvalidCredentialsError extends Error {
  constructor() {
    super();
    this.name = 'InvalidCredentialsError';
    this.message = 'The email or password you entered is incorrect. Please try again.';
  }
}

class TokenExpiredError extends Error {
  constructor() {
    super();
    this.name = 'TokenExpiredError';
    this.message = 'Your token has expired. Please log in again.';
  }
}
