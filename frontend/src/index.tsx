import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'typeface-major-mono-display';
import 'typeface-anonymous-pro';
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export const API_ROOT = 'http://localhost:443';  // Temporary testing API

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
