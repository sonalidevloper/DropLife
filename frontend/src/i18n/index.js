import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: [
      'en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'pa',
      'or', 'as', 'ar', 'zh', 'es', 'fr', 'de', 'pt', 'ru', 'ja', 'ko',
      'it', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'tr', 'vi', 'th', 'id',
      'ms', 'fa', 'he', 'sw', 'am'
    ],
    backend: { loadPath: '/locales/{{lng}}/translation.json' },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: { escapeValue: false },
    ns: ['translation'],
    defaultNS: 'translation'
  });

export default i18n;
