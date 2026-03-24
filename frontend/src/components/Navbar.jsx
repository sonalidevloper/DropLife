import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '../redux/authSlice';
import NotificationBell from './NotificationBell';
import LanguageSelector from './LanguageSelector';
import './Navbar.css';

const BloodDropIcon = () => (
  <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="navDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff6b6b" />
        <stop offset="100%" stopColor="#c8102e" />
      </linearGradient>
    </defs>
    <path d="M24 4C24 4 8 18 8 28C8 36.837 15.163 44 24 44C32.837 44 40 36.837 40 28C40 18 24 4 24 4Z"
      fill="url(#navDropGrad)" />
    <path d="M18 30C18 30 16 26 20 24" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Voice search setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        setVoiceText(transcript);
        if (e.results[e.results.length - 1].isFinal) {
          handleVoiceCommand(transcript.toLowerCase());
        }
      };
      rec.onend = () => setIsListening(false);
      rec.onerror = (e) => {
        setVoiceError('Voice not available');
        setIsListening(false);
        setTimeout(() => setVoiceError(''), 3000);
      };
      recognitionRef.current = rec;
    }
  }, [i18n.language]);

  const handleVoiceCommand = (cmd) => {
    setVoiceText('');
    if (cmd.includes('blood') || cmd.includes('रक्त')) navigate('/blood-availability');
    else if (cmd.includes('hospital') || cmd.includes('अस्पताल')) navigate('/hospitals-public');
    else if (cmd.includes('camp') || cmd.includes('कैंप')) navigate('/donation-camps');
    else if (cmd.includes('map') || cmd.includes('नक्शा')) navigate('/map');
    else if (cmd.includes('home') || cmd.includes('घर')) navigate('/home');
    else if (cmd.includes('dashboard')) navigate('/donor-dashboard');
    else if (cmd.includes('request')) navigate('/blood-request');
  };

  const startVoice = () => {
    if (!recognitionRef.current) {
      setVoiceError('Voice not supported');
      setTimeout(() => setVoiceError(''), 2000);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setVoiceText('');
      setVoiceError('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Don't show navbar on welcome page
  if (location.pathname === '/') return null;

  const navLinks = [
    { to: '/home', label: t('nav.home', 'Home'), icon: '🏠' },
    { to: '/blood-availability', label: t('nav.blood', 'Blood'), icon: '🩸' },
    { to: '/donation-camps', label: t('nav.camps', 'Camps'), icon: '⛺' },
    { to: '/hospitals-public', label: t('nav.hospitals', 'Hospitals'), icon: '🏥' },
    { to: '/map', label: t('nav.map', 'Map'), icon: '📍' },
  ];

  return (
    <>
      <nav className="main-navbar">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <BloodDropIcon />
          <span>DropLife</span>
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-links">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="navbar-right">
          {/* Voice search button */}
          <div className="voice-search-wrap">
            <button
              className={`voice-nav-btn ${isListening ? 'listening' : ''}`}
              onClick={startVoice}
              title="Voice Search"
            >
              {isListening ? '🔴' : '🎤'}
            </button>
            {voiceText && (
              <div className="voice-feedback">
                <span className="voice-pulse" />
                "{voiceText}"
              </div>
            )}
            {voiceError && <div className="voice-error">{voiceError}</div>}
          </div>

          {/* Language selector */}
          <LanguageSelector compact />

          {/* Notification bell (if logged in) */}
          {token && <NotificationBell />}

          {/* Auth section */}
          {token && user ? (
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button className="user-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="user-name-text">{user.name?.split(' ')[0]}</span>
                <span className={`chevron ${userMenuOpen ? 'up' : ''}`}>▾</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dh-avatar">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div className="dh-name">{user.name}</div>
                      <div className="dh-email">{user.email}</div>
                      <span className={`badge badge-${user.role === 'admin' ? 'danger' : user.role === 'hospital' ? 'info' : 'red'}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  {user.role === 'donor' && (
                    <Link to="/donor-dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      📊 Donor Dashboard
                    </Link>
                  )}
                  {user.role === 'user' && (
                    <Link to="/user-dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      📊 My Dashboard
                    </Link>
                  )}
                  {user.role === 'hospital' && (
                    <Link to="/hospital-dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      🏥 Hospital Panel
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin-dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <Link to="/notifications" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    🔔 Notifications
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn-primary" style={{ padding: '9px 20px', fontSize: '14px' }}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map(l => (
          <Link key={l.to} to={l.to}
            className="mobile-nav-link"
            onClick={() => setMobileOpen(false)}>
            <span>{l.icon}</span> {l.label}
          </Link>
        ))}
        <div className="mobile-nav-divider" />
        {!token ? (
          <>
            <Link to="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>🔑 Sign In</Link>
            <Link to="/signup" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>✍️ Register</Link>
          </>
        ) : (
          <button className="mobile-nav-link" onClick={() => { handleLogout(); setMobileOpen(false); }}>
            🚪 Sign Out
          </button>
        )}
        <div className="mobile-lang-wrap">
          <LanguageSelector />
        </div>
      </div>

      {/* Voice listening overlay */}
      {isListening && (
        <div className="voice-overlay">
          <div className="voice-ripple"><div /><div /><div /></div>
          <div className="voice-icon">🎤</div>
          <div className="voice-hint">
            {voiceText || 'Listening... say "find blood", "hospitals", "map"'}
          </div>
          <button onClick={() => recognitionRef.current?.stop()} className="voice-stop-btn">
            Stop
          </button>
        </div>
      )}
    </>
  );
}