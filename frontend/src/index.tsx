// Polyfills
import 'react-app-polyfill/stable';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/ie9';
import 'whatwg-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'typeface-major-mono-display';
import 'typeface-anonymous-pro';
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export const API_ROOT = process.env.REACT_APP_API_ROOT;
export const PRIORITY_APPLICATIONS_ACTIVE = (process.env.REACT_APP_PRIORITY_APPLICATIONS_ACTIVE === 'true');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
