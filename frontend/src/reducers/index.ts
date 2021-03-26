import { combineReducers } from 'redux';

import appReducer from 'reducers/app';
import authReducer from 'reducers/auth';
import userReducer from 'reducers/user';
import applicationReviewReducer from 'reducers/applicationReview';
import { reducer as burgerMenu } from 'redux-burger-menu';

const reducers = combineReducers({
  app: appReducer,
  auth: authReducer,
  user: userReducer,
  applicationReview: applicationReviewReducer,
  burgerMenu
});

export default reducers;
