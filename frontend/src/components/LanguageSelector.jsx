import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ||
    LANGUAGES.find((l) => l.code === (i18n.language || '').split('-')[0]) ||
    LANGUAGES[0];

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="outline-secondary"
        size="sm"
        id="language-dropdown"
        className="d-flex align-items-center gap-1 border-0"
        style={{ background: 'transparent' }}
      >
        <FaGlobe />
        <span className="ms-1 d-none d-md-inline">{currentLang.flag} {currentLang.name}</span>
        <span className="ms-1 d-inline d-md-none">{currentLang.flag}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto', minWidth: '160px' }}>
        {LANGUAGES.map((lang) => (
          <Dropdown.Item
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            active={currentLang.code === lang.code}
            className="d-flex align-items-center gap-2"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;
