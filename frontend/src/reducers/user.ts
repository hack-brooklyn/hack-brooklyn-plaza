import { UserActionTypes, UserState } from 'types';

export const initialUserState: UserState = {
  email: '',
  firstName: '',
  lastName: '',
  role: null,
  id: -1
};

const userReducer = (state = initialUserState, action: UserActionTypes): UserState => {
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
