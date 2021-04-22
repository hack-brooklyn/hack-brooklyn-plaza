// Polyfills
import 'react-app-polyfill/stable';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/ie9';
import 'whatwg-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-major-mono-display';
import 'typeface-anonymous-pro';
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import App from './App';

export const API_ROOT = process.env.REACT_APP_API_ROOT ? process.env.REACT_APP_API_ROOT : '';

export const APPLICATIONS_ACTIVE = process.env.REACT_APP_APPLICATIONS_ACTIVE === 'true';
export const PRIORITY_APPLICATIONS_ACTIVE = process.env.REACT_APP_PRIORITY_APPLICATIONS_ACTIVE === 'true';

export const HACKATHON_START_DATE_TIME = new Date(process.env.REACT_APP_HACKATHON_START_DATE_TIME ? process.env.REACT_APP_HACKATHON_START_DATE_TIME : 0);
export const HACKATHON_END_DATE_TIME = new Date(process.env.REACT_APP_HACKATHON_END_DATE_TIME ? process.env.REACT_APP_HACKATHON_END_DATE_TIME : 0);
export const HAS_HACKATHON_STARTED = new Date(Date.now()) > HACKATHON_START_DATE_TIME;

export const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY ? process.env.REACT_APP_VAPID_PUBLIC_KEY : '';
export const TIME_BEFORE_EVENT_TO_DISPLAY_JOIN_BUTTON = process.env.REACT_APP_TIME_BEFORE_EVENT_TO_DISPLAY_JOIN_BUTTON ? process.env.REACT_APP_TIME_BEFORE_EVENT_TO_DISPLAY_JOIN_BUTTON : '';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorkerRegistration.register();
