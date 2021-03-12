import { AuthActionTypes, AuthState } from 'types';

const initialState: AuthState = {
  isLoggedIn: false,
  jwtAccessToken: null
};

const authReducer = (state = initialState, action: AuthActionTypes): AuthState => {
  switch (action.type) {
    case 'LOG_IN':
      return {
        ...state,
        isLoggedIn: true
      };

    case 'LOG_OUT':
      return {
        ...state,
        isLoggedIn: false
      };

    case 'SET_JWT_ACCESS_TOKEN':
      return {
        ...state,
        jwtAccessToken: action.payload
      };

    default:
      return state;
  }
};

export default authReducer;
