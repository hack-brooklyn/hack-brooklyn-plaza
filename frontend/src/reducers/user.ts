import { UserActionTypes, UserState } from 'types';
import { Roles } from '../security/accessControl';

export const initialUserState: UserState = {
  email: '',
  firstName: '',
  lastName: '',
  role: Roles.None,
  id: -1,
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
