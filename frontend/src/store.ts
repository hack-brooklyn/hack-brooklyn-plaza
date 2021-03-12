import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import reducers from 'reducers';

const store = createStore(
  reducers,
  undefined,
  composeWithDevTools());

export default store;
