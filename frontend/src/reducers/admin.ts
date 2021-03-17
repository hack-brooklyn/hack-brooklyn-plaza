import { AdminActionTypes, AdminState } from 'types';

const initialState: AdminState = {
  applicationReviewModeOn: false
};

const adminReducer = (state = initialState, action: AdminActionTypes): AdminState => {
  switch (action.type) {
    case 'ENTER_REVIEW_MODE':
      return {
        ...state,
        applicationReviewModeOn: true
      };

    case 'EXIT_REVIEW_MODE':
      return {
        ...state,
        applicationReviewModeOn: false
      };

    default:
      return state;
  }
};

export default adminReducer;
