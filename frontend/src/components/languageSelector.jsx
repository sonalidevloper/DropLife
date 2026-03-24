import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LANGUAGES = [
  // Indian Languages
  { code: 'en',    name: 'English',    native: 'English',       flag: '🇬🇧', region: 'India' },
  { code: 'hi',    name: 'Hindi',      native: 'हिंदी',          flag: '🇮🇳', region: 'India' },
  { code: 'or',    name: 'Odia',       native: 'ଓଡ଼ିଆ',          flag: '🇮🇳', region: 'India' },
  { code: 'bn',    name: 'Bengali',    native: 'বাংলা',          flag: '🇮🇳', region: 'India' },
  { code: 'te',    name: 'Telugu',     native: 'తెలుగు',         flag: '🇮🇳', region: 'India' },
  { code: 'mr',    name: 'Marathi',    native: 'मराठी',          flag: '🇮🇳', region: 'India' },
  { code: 'ta',    name: 'Tamil',      native: 'தமிழ்',          flag: '🇮🇳', region: 'India' },
  { code: 'gu',    name: 'Gujarati',   native: 'ગુજરાતી',        flag: '🇮🇳', region: 'India' },
  { code: 'kn',    name: 'Kannada',    native: 'ಕನ್ನಡ',           flag: '🇮🇳', region: 'India' },
  { code: 'ml',    name: 'Malayalam',  native: 'മലയാളം',         flag: '🇮🇳', region: 'India' },
  { code: 'pa',    name: 'Punjabi',    native: 'ਪੰਜਾਬੀ',         flag: '🇮🇳', region: 'India' },
  { code: 'as',    name: 'Assamese',   native: 'অসমীয়া',        flag: '🇮🇳', region: 'India' },
  { code: 'ur',    name: 'Urdu',       native: 'اردو',            flag: '🇮🇳', region: 'India' },
  { code: 'mai',   name: 'Maithili',   native: 'मैथिली',          flag: '🇮🇳', region: 'India' },
  { code: 'sat',   name: 'Santali',    native: 'ᱥᱟᱱᱛᱟᱲᱤ',       flag: '🇮🇳', region: 'India' },
  { code: 'ks',    name: 'Kashmiri',   native: 'کٲشُر',           flag: '🇮🇳', region: 'India' },
  { code: 'ne',    name: 'Nepali',     native: 'नेपाली',          flag: '🇳🇵', region: 'South Asia' },
  { code: 'si',    name: 'Sinhala',    native: 'සිංහල',           flag: '🇱🇰', region: 'South Asia' },
  // International
  { code: 'ar',    name: 'Arabic',     native: 'العربية',         flag: '🇸🇦', region: 'International' },
  { code: 'zh',    name: 'Chinese',    native: '中文',             flag: '🇨🇳', region: 'International' },
  { code: 'fr',    name: 'French',     native: 'Français',        flag: '🇫🇷', region: 'International' },
  { code: 'de',    name: 'German',     native: 'Deutsch',         flag: '🇩🇪', region: 'International' },
  { code: 'es',    name: 'Spanish',    native: 'Español',         flag: '🇪🇸', region: 'International' },
  { code: 'pt',    name: 'Portuguese', native: 'Português',       flag: '🇧🇷', region: 'International' },
  { code: 'ru',    name: 'Russian',    native: 'Русский',         flag: '🇷🇺', region: 'International' },
  { code: 'ja',    name: 'Japanese',   native: '日本語',           flag: '🇯🇵', region: 'International' },
  { code: 'ko',    name: 'Korean',     native: '한국어',           flag: '🇰🇷', region: 'International' },
  { code: 'tr',    name: 'Turkish',    native: 'Türkçe',          flag: '🇹🇷', region: 'International' },
  { code: 'it',    name: 'Italian',    native: 'Italiano',        flag: '🇮🇹', region: 'International' },
  { code: 'vi',    name: 'Vietnamese', native: 'Tiếng Việt',      flag: '🇻🇳', region: 'International' },
  { code: 'id',    name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', region: 'International' },
  { code: 'ms',    name: 'Malay',      native: 'Bahasa Melayu',   flag: '🇲🇾', region: 'International' },
  { code: 'th',    name: 'Thai',       native: 'ภาษาไทย',         flag: '🇹🇭', region: 'International' },
  { code: 'sw',    name: 'Swahili',    native: 'Kiswahili',       flag: '🇰🇪', region: 'International' },
  { code: 'fa',    name: 'Persian',    native: 'فارسی',           flag: '🇮🇷', region: 'International' },
  { code: 'pl',    name: 'Polish',     native: 'Polski',          flag: '🇵🇱', region: 'International' },
  { code: 'nl',    name: 'Dutch',      native: 'Nederlands',      flag: '🇳🇱', region: 'International' },
  { code: 'sv',    name: 'Swedish',    native: 'Svenska',         flag: '🇸🇪', region: 'International' },
];

const REGIONS = ['India', 'South Asia', 'International'];

export default function LanguageSelector({ compact = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handleClick = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (lang) => {
    i18n.changeLanguage(lang.code);
    localStorage.setItem('droplife_lang', lang.code);
    setOpen(false);
    setSearch('');
  };

  const filtered = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase())
  );

  const groupedFiltered = REGIONS.reduce((acc, region) => {
    const langs = filtered.filter(l => l.region === region);
    if (langs.length) acc[region] = langs;
    return acc;
  }, {});

  return (
    <div className={`lang-selector ${compact ? 'compact' : ''}`} ref={dropRef}>
      <button className="lang-trigger" onClick={() => setOpen(!open)}>
        <span className="lang-flag">{currentLang.flag}</span>
        {!compact && <span className="lang-name">{currentLang.code.toUpperCase()}</span>}
        <span className="lang-chevron">▾</span>
      </button>

      {open && (
        <div className="lang-dropdown">
          <div className="lang-search">
            <span className="lang-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search language..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="lang-search-input"
            />
          </div>
          <div className="lang-list">
            {Object.entries(groupedFiltered).map(([region, langs]) => (
              <div key={region}>
                <div className="lang-region-label">{region}</div>
                {langs.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${lang.code === i18n.language ? 'active' : ''}`}
                    onClick={() => handleSelect(lang)}
                  >
                    <span className="lang-opt-flag">{lang.flag}</span>
                    <div className="lang-opt-info">
                      <span className="lang-opt-name">{lang.name}</span>
                      <span className="lang-opt-native">{lang.native}</span>
                    </div>
                    {lang.code === i18n.language && <span className="lang-check">✓</span>}
                  </button>
                ))}
              </div>
            ))}
            {Object.keys(groupedFiltered).length === 0 && (
              <div className="lang-no-result">No language found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}