import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
// i18n import REMOVED — causes compile errors when i18n package not properly set up

// Suppress browser extension console noise
const _origLog = console.log;
console.log = function (...args) {
  const msg = args.join(' ');
  if (
    msg.includes('enable copy') ||
    msg.includes('E.C.P') ||
    msg.includes('ecp_regular') ||
    msg.includes('Download the React DevTools')
  ) return;
  _origLog.apply(console, args);
};

const _origWarn = console.warn;
console.warn = function (...args) {
  const msg = args.join(' ');
  if (msg.includes('React Router Future Flag')) return;
  _origWarn.apply(console, args);
};

if (process.env.NODE_ENV === 'development') {
  _origLog('%c🩸 DROPLIFE - Smart Blood Donation System', 'color:#dc3545;font-size:20px;font-weight:bold');
  _origLog('%cConnecting Lives, One Drop at a Time', 'color:#667eea;font-size:13px;font-style:italic');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);