
import React from 'react';


2	+
import { Dropdown } from 'react-bootstrap';
3	+
import { useTranslation } from 'react-i18next';
4	+
import { FaGlobe } from 'react-icons/fa';
5	+
6	+
const LANGUAGES = [
7	+
  { code: 'en', name: 'English', flag: '🇬🇧' },
8	+
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
9	+
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
10	+
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
11	+
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
12	+
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
13	+
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
14	+
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
15	+
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
16	+
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
17	+
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
18	+
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
19	+
  { code: 'zh', name: '中文', flag: '🇨🇳' },
20	+
  { code: 'es', name: 'Español', flag: '🇪🇸' },
21	+
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
22	+
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
23	+
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
24	+
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
25	+
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
26	+
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
27	+
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
28	+
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
29	+
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
30	+
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
31	+
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
32	+
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
33	+
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
34	+
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
35	+
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
36	+
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
37	+
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
38	+
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
39	+
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
40	+
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
41	+
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
42	+
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
43	+
  { code: 'as', name: 'অসমীয়া', flag: '🇮🇳' },
44	+
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
45	+
];
46	+
47	+
const LanguageSelector = () => {
48	+
  const { i18n } = useTranslation();
49	+
50	+
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ||
51	+
    LANGUAGES.find((l) => l.code === (i18n.language || '').split('-')[0]) ||
52	+
    LANGUAGES[0];
53	+
54	+
  const handleChange = (code) => {
55	+
    i18n.changeLanguage(code);
56	+
    localStorage.setItem('i18nextLng', code);
57	+
  };
58	+
59	+
  return (
60	+
    <Dropdown align="end">
61	+
      <Dropdown.Toggle
62	+
        variant="outline-secondary"
63	+
        size="sm"
64	+
        id="language-dropdown"
65	+
        className="d-flex align-items-center gap-1 border-0"
66	+
        style={{ background: 'transparent' }}
67	+
      >
68	+
        <FaGlobe />
69	+
        <span className="ms-1 d-none d-md-inline">{currentLang.flag} {currentLang.name}</span>
70	+
        <span className="ms-1 d-inline d-md-none">{currentLang.flag}</span>
71	+
      </Dropdown.Toggle>
72	+
      <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto', minWidth: '160px' }}>
73	+
        {LANGUAGES.map((lang) => (
74	+
          <Dropdown.Item
75	+
            key={lang.code}
76	+
            onClick={() => handleChange(lang.code)}
77	+
            active={currentLang.code === lang.code}
78	+
            className="d-flex align-items-center gap-2"
79	+
          >
80	+
            <span>{lang.flag}</span>
81	+
            <span>{lang.name}</span>
82	+
          </Dropdown.Item>
83	+
        ))}
84	+
      </Dropdown.Menu>
85	+
    </Dropdown>
86	+
  );
87	+
};
88	+
89	+
export default LanguageSelector;