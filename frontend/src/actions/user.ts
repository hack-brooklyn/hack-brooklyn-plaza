import { SET_USER_DATA } from '../constants';
import { SetUserData, UserActionTypes } from 'types';

export const setUserData = (userData: SetUserData): UserActionTypes => {
  return {
    type: SET_USER_DATA,
    payload: userData
  };
};
