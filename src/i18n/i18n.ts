import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enTranslation from '../locales/en/translation.json';
import frTranslation from '../locales/fr/translation.json';
import deTranslation from '../locales/de/translation.json';
import esTranslation from '../locales/es/translation.json';
import zhTranslation from '../locales/zh/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  fr: {
    translation: frTranslation
  },
  de: {
    translation: deTranslation
  },
  es: {
    translation: esTranslation
  },
  zh: {
    translation: zhTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    supportedLngs: ['en', 'fr', 'de', 'es', 'zh'],
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
    
    react: {
      useSuspense: true,
    },
  });

export default i18n;
export {}; // Make TypeScript treat this file as a module 