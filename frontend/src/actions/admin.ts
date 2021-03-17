import { ENTER_APPLICATION_REVIEW_MODE, EXIT_APPLICATION_REVIEW_MODE } from '../constants';
import { AdminActionTypes } from 'types';

export const enterApplicationReviewMode = (): AdminActionTypes => {
  return {
    type: ENTER_APPLICATION_REVIEW_MODE
  };
};

export const exitApplicationReviewMode = (): AdminActionTypes => {
  return {
    type: EXIT_APPLICATION_REVIEW_MODE
  };
};
