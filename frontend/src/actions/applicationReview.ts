import { refreshAccessToken } from 'util/auth';
import {
  ADVANCE_APPLICATION_INDEX,
  ENTER_APPLICATION_REVIEW_MODE_FAILURE,
  ENTER_APPLICATION_REVIEW_MODE_SUCCESS,
  EXIT_APPLICATION_REVIEW_MODE,
  SET_APPLICATIONS_LOADING
} from '../constants';
import {
  ApplicationReviewActionTypes,
  AppThunk,
  ConnectionError,
  GetApplicationNumbersResponse,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

export const enterApplicationReviewMode = (): AppThunk => {
  return async (dispatch, getState) => {
    dispatch(setApplicationsLoading(true));

    try {
      const applicationNumbers = await getApplicationsDataForReviewMode(getState);

      // Check if there are any applications to go through
      if (applicationNumbers === undefined || applicationNumbers.length < 1) {
        dispatch(enterApplicationReviewModeFailure(new Error('No undecided applications were found.')));
        return;
      }

      dispatch(enterApplicationReviewModeSuccess(applicationNumbers));
    } catch (err) {
      dispatch(enterApplicationReviewModeFailure(err));
    }
  };
};

export const enterApplicationReviewModeSuccess = (applicationNumbers: number[]): ApplicationReviewActionTypes => {
  return {
    type: ENTER_APPLICATION_REVIEW_MODE_SUCCESS,
    payload: applicationNumbers
  };
};

export const enterApplicationReviewModeFailure = (error: Error): ApplicationReviewActionTypes => {
  return {
    type: ENTER_APPLICATION_REVIEW_MODE_FAILURE,
    payload: error
  };
};

export const exitApplicationReviewMode = (): ApplicationReviewActionTypes => {
  return {
    type: EXIT_APPLICATION_REVIEW_MODE
  };
};

export const advanceApplicationIndex = (): ApplicationReviewActionTypes => {
  return {
    type: ADVANCE_APPLICATION_INDEX
  };
};

export const setApplicationsLoading = (isLoading: boolean): ApplicationReviewActionTypes => {
  return {
    type: SET_APPLICATIONS_LOADING,
    payload: isLoading
  };
};

const getApplicationsDataForReviewMode = async (getState: () => RootState, overriddenAccessToken?: string) => {
  const storedAccessToken = getState().auth.jwtAccessToken;
  const token = overriddenAccessToken ? overriddenAccessToken : storedAccessToken;

  let res;
  try {
    res = await fetch(`${API_ROOT}/applications/undecidedApplicationNumbers`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    throw new ConnectionError();
  }

  if (res.status === 200) {
    const resBody: GetApplicationNumbersResponse = await res.json();
    return resBody.applicationNumbers;
  } else if (res.status === 401) {
    const refreshedToken = await refreshAccessToken();
    await getApplicationsDataForReviewMode(getState, refreshedToken);
  } else if (res.status === 403) {
    throw new NoPermissionError();
  } else {
    throw new UnknownError();
  }
};
