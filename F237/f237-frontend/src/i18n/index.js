// f237-frontend/src/i18n/index.js
// Traductions du site (react-i18next). Langues : français (par défaut) et anglais.
// Le choix de l'utilisateur est mémorisé dans le navigateur (localStorage).

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './fr.json';
import en from './en.json';

export const LANGUES = [
  { code: 'fr', court: 'FR', nom: 'Français' },
  { code: 'en', court: 'EN', nom: 'English' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { fr: { translation: fr }, en: { translation: en } },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    nonExplicitSupportedLngs: true, // "en-CA" -> "en"
    interpolation: { escapeValue: false }, // React protège déjà contre le XSS
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'f237-langue',
      caches: ['localStorage'],
    },
  });

// Garde <html lang="..."> à jour (accessibilité, lecteurs d'écran, SEO)
const majLangHtml = (lng) => { document.documentElement.lang = (lng ?? 'fr').slice(0, 2); };
majLangHtml(i18n.resolvedLanguage);
i18n.on('languageChanged', majLangHtml);

/** Locale pour les dates : "fr-FR" ou "en-GB" selon la langue active. */
export const locale = () => (i18n.resolvedLanguage === 'en' ? 'en-GB' : 'fr-FR');

export default i18n;