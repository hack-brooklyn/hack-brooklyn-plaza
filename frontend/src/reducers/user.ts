import { UserActionTypes, UserState } from 'types';

const initialState: UserState = {
  email: '',
  firstName: '',
  lastName: '',
  role: null,
  userId: -1
};

const userReducer = (state = initialState, action: UserActionTypes): UserState => {
  switch (action.type) {
    case 'SET_USER_DATA':
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};

export default userReducer;
