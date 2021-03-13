import { SET_WINDOW_WIDTH } from '../constants';
import { AppActionTypes } from 'types';

export const setWindowWidth = (width: number): AppActionTypes => {
  return {
    type: SET_WINDOW_WIDTH,
    payload: width
  };
};
