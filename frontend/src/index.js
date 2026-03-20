import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

// Suppress React DevTools suggestion in production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
}

// Display welcome message in console
if (process.env.NODE_ENV === 'development') {
  console.log(
    '%c🩸 DROPLIFE - Smart Blood Donation System',
    'color: #dc3545; font-size: 24px; font-weight: bold;'
  );
  console.log(
    '%cConnecting Lives, One Drop at a Time',
    'color: #667eea; font-size: 14px; font-style: italic;'
  );
  console.log(
    '%cVersion: 1.0.0 | Environment: Development',
    'color: #6c757d; font-size: 12px;'
  );
  console.log('');
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
