import { combineReducers } from 'redux';

import appReducer from 'reducers/app';
import authReducer from 'reducers/auth';
import userReducer from 'reducers/user';

const reducers = combineReducers({
  app: appReducer,
  auth: authReducer,
  user: userReducer
});

export default reducers;
