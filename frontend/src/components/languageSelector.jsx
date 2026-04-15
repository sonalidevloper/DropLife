import React, { useState, useEffect } from 'react';
import { NavDropdown } from 'react-bootstrap';
import { FaGlobe } from 'react-icons/fa';

/**
 * LanguageSelector — 38 languages, zero i18n dependency.
 * Stores the selected language in localStorage under 'droplife_lang'
 * and sets the document <html lang="..."> attribute for accessibility.
 *
 * The VoiceAssistant reads the same key to set its recognition language.
 */

const LANGUAGES = [
  // ── Indian languages (22 official + extras) ──────────────────────────────
  { code: 'en',    name: 'English',      native: 'English',       flag: '🇬🇧' },
  { code: 'hi',    name: 'Hindi',        native: 'हिंदी',          flag: '🇮🇳' },
  { code: 'bn',    name: 'Bengali',      native: 'বাংলা',          flag: '🇮🇳' },
  { code: 'te',    name: 'Telugu',       native: 'తెలుగు',         flag: '🇮🇳' },
  { code: 'mr',    name: 'Marathi',      native: 'मराठी',          flag: '🇮🇳' },
  { code: 'ta',    name: 'Tamil',        native: 'தமிழ்',          flag: '🇮🇳' },
  { code: 'gu',    name: 'Gujarati',     native: 'ગુજરાતી',        flag: '🇮🇳' },
  { code: 'kn',    name: 'Kannada',      native: 'ಕನ್ನಡ',          flag: '🇮🇳' },
  { code: 'ml',    name: 'Malayalam',    native: 'മലയാളം',        flag: '🇮🇳' },
  { code: 'pa',    name: 'Punjabi',      native: 'ਪੰਜਾਬੀ',        flag: '🇮🇳' },
  { code: 'or',    name: 'Odia',         native: 'ଓଡ଼ିଆ',           flag: '🇮🇳' },
  { code: 'as',    name: 'Assamese',     native: 'অসমীয়া',         flag: '🇮🇳' },
  { code: 'mai',   name: 'Maithili',     native: 'मैथिली',         flag: '🇮🇳' },
  { code: 'sat',   name: 'Santali',      native: 'ᱥᱟᱱᱛᱟᱲᱤ',        flag: '🇮🇳' },
  { code: 'ks',    name: 'Kashmiri',     native: 'كٲشُر',           flag: '🇮🇳' },
  { code: 'ne',    name: 'Nepali',       native: 'नेपाली',          flag: '🇳🇵' },
  { code: 'sd',    name: 'Sindhi',       native: 'سنڌي',            flag: '🇮🇳' },
  { code: 'kok',   name: 'Konkani',      native: 'कोंकणी',          flag: '🇮🇳' },
  { code: 'doi',   name: 'Dogri',        native: 'डोगरी',           flag: '🇮🇳' },
  { code: 'mni',   name: 'Manipuri',     native: 'মৈতৈলোন্',       flag: '🇮🇳' },
  { code: 'bo',    name: 'Bodo',         native: 'बड़ो',             flag: '🇮🇳' },
  { code: 'ur',    name: 'Urdu',         native: 'اردو',            flag: '🇵🇰' },
  // ── Major world languages ─────────────────────────────────────────────────
  { code: 'ar',    name: 'Arabic',       native: 'العربية',        flag: '🇸🇦' },
  { code: 'zh',    name: 'Chinese',      native: '中文',             flag: '🇨🇳' },
  { code: 'es',    name: 'Spanish',      native: 'Español',        flag: '🇪🇸' },
  { code: 'fr',    name: 'French',       native: 'Français',       flag: '🇫🇷' },
  { code: 'de',    name: 'German',       native: 'Deutsch',        flag: '🇩🇪' },
  { code: 'pt',    name: 'Portuguese',   native: 'Português',      flag: '🇧🇷' },
  { code: 'ru',    name: 'Russian',      native: 'Русский',        flag: '🇷🇺' },
  { code: 'ja',    name: 'Japanese',     native: '日本語',           flag: '🇯🇵' },
  { code: 'ko',    name: 'Korean',       native: '한국어',           flag: '🇰🇷' },
  { code: 'id',    name: 'Indonesian',   native: 'Bahasa Indonesia',flag: '🇮🇩' },
  { code: 'ms',    name: 'Malay',        native: 'Bahasa Melayu',  flag: '🇲🇾' },
  { code: 'tr',    name: 'Turkish',      native: 'Türkçe',         flag: '🇹🇷' },
  { code: 'vi',    name: 'Vietnamese',   native: 'Tiếng Việt',     flag: '🇻🇳' },
  { code: 'th',    name: 'Thai',         native: 'ภาษาไทย',         flag: '🇹🇭' },
  { code: 'sw',    name: 'Swahili',      native: 'Kiswahili',      flag: '🇰🇪' },
  { code: 'it',    name: 'Italian',      native: 'Italiano',       flag: '🇮🇹' },
];

// Sanity check — should be 38
// console.log('Languages:', LANGUAGES.length);

const LanguageSelector = () => {
  const [selected, setSelected] = useState(
    localStorage.getItem('droplife_lang') || 'en'
  );

  useEffect(() => {
    localStorage.setItem('droplife_lang', selected);
    document.documentElement.lang = selected;
  }, [selected]);

  const current = LANGUAGES.find((l) => l.code === selected) || LANGUAGES[0];

  return (
    <NavDropdown
      title={
        <span>
          <FaGlobe className="me-1" />
          {current.flag} {current.name}
        </span>
      }
      id="language-nav-dropdown"
    >
      {LANGUAGES.map((lang) => (
        <NavDropdown.Item
          key={lang.code}
          onClick={() => setSelected(lang.code)}
          active={selected === lang.code}
          style={{ fontSize: '0.88rem' }}
        >
          <span className="me-2">{lang.flag}</span>
          {lang.native}
          <span className="text-muted ms-2" style={{ fontSize: '0.78rem' }}>
            {lang.name !== lang.native ? `(${lang.name})` : ''}
          </span>
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};

export default LanguageSelector;