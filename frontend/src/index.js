import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import App from './App';
import './index.css';

// Initialize i18next
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: [
      'en','hi','or','bn','te','mr','ta','gu','kn','ml',
      'pa','as','ur','mai','ne','si','ar','zh','fr','de',
      'es','pt','ru','ja','ko','tr','it','vi','id','ms',
      'th','sw','fa','pl','nl','sv','sat','ks'
    ],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'droplife_lang',
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

const root = ReactDOM.createRoot(document.getElementById('root'));

// NOTE: StrictMode intentionally removed — it causes Leaflet map
// to double-initialize and crash with "Map container already initialized".
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);