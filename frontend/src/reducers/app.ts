import { AppActionTypes, AppState } from 'types';

const initialState: AppState = {
  windowWidth: window.innerWidth
};

const appReducer = (state = initialState, action: AppActionTypes): AppState => {
  switch (action.type) {
    case 'SET_WINDOW_WIDTH':
      return {
        ...state,
        windowWidth: action.payload
      };

    default:
      return state;
  }
};

export default appReducer;
