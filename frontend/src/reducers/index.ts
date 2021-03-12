import { combineReducers } from 'redux';

import authReducer from 'reducers/auth';

const reducers = combineReducers({
  auth: authReducer
});

export default reducers;
