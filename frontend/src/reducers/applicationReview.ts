import { ApplicationReviewActionTypes, ApplicationReviewState } from 'types';

const initialState: ApplicationReviewState = {
  enabled: false,
  loading: false,
  error: null,
  applicationNumbers: [],
  currentIndex: -1
};

const applicationReviewReducer = (state = initialState, action: ApplicationReviewActionTypes): ApplicationReviewState => {
  switch (action.type) {
    case 'ENTER_APPLICATION_REVIEW_MODE':
      return {
        ...state,
        loading: true
      };

    case 'ENTER_APPLICATION_REVIEW_MODE_SUCCESS':
      return {
        ...state,
        enabled: true,
        loading: false,
        error: null,
        applicationNumbers: action.payload,
        currentIndex: 0
      };

    case 'ENTER_APPLICATION_REVIEW_MODE_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case 'EXIT_APPLICATION_REVIEW_MODE':
      return {
        ...initialState
      };

    case 'ADVANCE_APPLICATION_INDEX': {
      let nextIndex: number | null;
      if (state.currentIndex !== null && state.currentIndex < state.applicationNumbers.length - 1) {
        nextIndex = state.currentIndex + 1;
      } else {
        console.log('Next index is null');
        nextIndex = null;
      }

      return {
        ...state,
        currentIndex: nextIndex
      };
    }

    case 'SET_APPLICATIONS_LOADING':
      return {
        ...state,
        loading: true
      };

    default:
      return state;
  }
};

export default applicationReviewReducer;
