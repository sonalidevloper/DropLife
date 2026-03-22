import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  ];

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <NavDropdown
      title={
        <>
          <FaGlobe className="me-1" />
          {currentLang.flag} {currentLang.name}
        </>
      }
      id="language-dropdown"
    >
      {languages.map((lang) => (
        <NavDropdown.Item
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          active={i18n.language === lang.code}
        >
          {lang.flag} {lang.name}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};

export default LanguageSelector;