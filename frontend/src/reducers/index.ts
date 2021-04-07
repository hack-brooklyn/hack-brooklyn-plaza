import { combineReducers } from 'redux';
import { reducer as burgerMenu } from 'redux-burger-menu';

import appReducer from 'reducers/app';
import authReducer from 'reducers/auth';
import userReducer from 'reducers/user';
import applicationReviewReducer from 'reducers/applicationReview';
import teamFormationReducer from 'reducers/teamFormation';

const reducers = combineReducers({
  app: appReducer,
  auth: authReducer,
  user: userReducer,
  applicationReview: applicationReviewReducer,
  teamFormation: teamFormationReducer,
  burgerMenu
});

export default reducers;
