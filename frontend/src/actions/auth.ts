import { LOG_IN, LOG_OUT, SET_JWT_ACCESS_TOKEN } from '../constants';
import { AuthActionTypes } from 'types';

export const logIn = (): AuthActionTypes => {
  return {
    type: LOG_IN
  };
};

export const logOut = (): AuthActionTypes => {
  return {
    type: LOG_OUT
  };
};

export const setJwtAccessToken = (token: string | null): AuthActionTypes => {
  return {
    type: SET_JWT_ACCESS_TOKEN,
    payload: token
  };
};
