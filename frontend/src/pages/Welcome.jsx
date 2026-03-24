import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Welcome.css';

const STATS = [
  { value: '4.2M+', label: 'Lives Saved', icon: '❤️' },
  { value: '120K+', label: 'Active Donors', icon: '🩸' },
  { value: '850+',  label: 'Partner Hospitals', icon: '🏥' },
  { value: '98%',   label: 'Match Success Rate', icon: '✅' },
];

const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

const TESTIMONIALS = [
  { name: 'Priya Sharma', city: 'Mumbai', text: 'DropLife connected me with a donor in under 30 minutes when my father needed emergency O− blood. This platform saved his life.', blood: 'O−' },
  { name: 'Arjun Mehta', city: 'Delhi', text: 'I\'ve donated 6 times now. The camps feature makes it so easy to find donation drives near me. Proud to be part of this community.', blood: 'B+' },
  { name: 'Dr. Kavita Rao', city: 'Bengaluru', text: 'As a hospital admin, DropLife has transformed our blood bank management. Real-time stock updates and instant donor matching.', blood: 'A+' },
];

const FEATURES = [
  { icon: '🔴', title: 'Real-Time Blood Availability', desc: 'Live stock updates from 850+ hospitals across India. Find any blood type in minutes.' },
  { icon: '📍', title: 'Live Map & Nearby Donors', desc: 'GPS-powered donor map. Connect with verified donors within 2km of your location.' },
  { icon: '🔔', title: 'Instant SOS Alerts', desc: 'One-tap emergency alerts reach dozens of compatible donors simultaneously.' },
  { icon: '🏥', title: 'Hospital Blood Bank', desc: 'Hospitals manage their entire blood inventory, deliveries, and patient records.' },
  { icon: '📊', title: 'Donation Analytics', desc: 'Track your impact with detailed donation history, health reports, and statistics.' },
  { icon: '🌐', title: '38 Language Support', desc: 'Fully localized in 38 regional and international languages including Hindi & Odia.' },
];

// Animated blood drop SVG logo
const BloodDropLogo = ({ size = 48, animated = true }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
    className={animated ? 'logo-drop' : ''}>
    <defs>
      <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff6b6b" />
        <stop offset="100%" stopColor="#c8102e" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M24 4C24 4 8 18 8 28C8 36.837 15.163 44 24 44C32.837 44 40 36.837 40 28C40 18 24 4 24 4Z"
      fill="url(#dropGrad)" filter="url(#glow)" />
    <path d="M18 30C18 30 16 26 20 24" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Animated heartbeat line SVG
const HeartbeatLine = () => (
  <svg viewBox="0 0 300 60" className="heartbeat-svg" xmlns="http://www.w3.org/2000/svg">
    <polyline
      points="0,30 40,30 60,10 75,50 90,20 105,40 120,30 300,30"
      fill="none"
      stroke="#e31b23"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="heartbeat-line"
    />
  </svg>
);

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counters, setCounters] = useState({ lives: 0, donors: 0, hospitals: 0, rate: 0 });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Intersection observer for stats counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsAnimated]);

  const animateCounters = () => {
    const duration = 2000;
    const targets = { lives: 4200000, donors: 120000, hospitals: 850, rate: 98 };
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters({
        lives: Math.floor(ease * targets.lives),
        donors: Math.floor(ease * targets.donors),
        hospitals: Math.floor(ease * targets.hospitals),
        rate: Math.floor(ease * targets.rate),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const formatStat = (key, val) => {
    if (key === 'lives') return val >= 1000000 ? (val / 1000000).toFixed(1) + 'M+' : val.toLocaleString() + '+';
    if (key === 'donors') return val >= 1000 ? (val / 1000).toFixed(0) + 'K+' : val + '+';
    if (key === 'hospitals') return val + '+';
    if (key === 'rate') return val + '%';
    return val;
  };

  return (
    <div className="welcome-page">
      {/* ── NAVBAR ────────────────── */}
      <nav className="welcome-nav">
        <div className="nav-brand">
          <BloodDropLogo size={36} />
          <span className="brand-name">DropLife</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#stats">Impact</a>
          <a href="#testimonials">Stories</a>
          <button className="btn-ghost" onClick={() => navigate('/hospitals-public')}>Find Blood</button>
        </div>
        <div className="nav-actions">
          <button className="btn-outline" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn-primary" onClick={() => navigate('/signup')}>Donate Now 🩸</button>
        </div>
        <button className="nav-mobile-toggle" onClick={() => navigate('/login')}>Sign In</button>
      </nav>

      {/* ── HERO ─────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-effects">
          <div className="hero-glow-1" />
          <div className="hero-glow-2" />
          <div className="hero-grid" />
        </div>

        {/* Floating blood drops */}
        <div className="floating-drops">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`floating-drop drop-${i+1}`}>
              <BloodDropLogo size={24 + i * 8} animated={false} />
            </div>
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Live — 247 active blood requests right now
          </div>

          <h1 className="hero-title">
            <span className="title-line-1">EVERY DROP</span>
            <span className="title-line-2">SAVES A</span>
            <span className="title-line-3">
              LIFE
              <HeartbeatLine />
            </span>
          </h1>

          <p className="hero-subtitle">
            India's most advanced blood donation platform. Connect donors, hospitals, 
            and patients in real-time. Because seconds matter when it's life or death.
          </p>

          <div className="hero-cta-group">
            <button className="cta-primary" onClick={() => navigate('/signup')}>
              <BloodDropLogo size={20} animated={false} />
              Become a Donor
            </button>
            <button className="cta-secondary" onClick={() => navigate('/blood-availability')}>
              Find Blood Now
              <span className="cta-arrow">→</span>
            </button>
          </div>

          <div className="hero-blood-types">
            <span className="blood-types-label">All blood types:</span>
            <div className="blood-types-row">
              {BLOOD_TYPES.map(bt => (
                <span key={bt} className="hero-blood-badge">{bt}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Hero visual card */}
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="hero-card-avatar">🩺</div>
              <div>
                <div className="hero-card-title">Emergency Request</div>
                <div className="hero-card-sub">AIIMS Delhi — 2 mins ago</div>
              </div>
              <span className="badge badge-danger">URGENT</span>
            </div>
            <div className="hero-card-blood">
              <div className="req-blood-type">O<sup>−</sup></div>
              <div className="req-details">
                <div className="req-detail-item">📦 Units needed: 3</div>
                <div className="req-detail-item">⏱ Within: 2 hours</div>
                <div className="req-detail-item">👤 Patient: Adult, 42y</div>
              </div>
            </div>
            <button className="hero-card-btn">Respond to Emergency →</button>

            {/* Live donor indicators */}
            <div className="live-donors">
              <div className="live-dot" />
              <span>12 donors notified nearby</span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="hero-mini-stats">
            <div className="mini-stat">
              <div className="mini-stat-val">847</div>
              <div className="mini-stat-label">Online Donors</div>
            </div>
            <div className="mini-stat-divider" />
            <div className="mini-stat">
              <div className="mini-stat-val">23</div>
              <div className="mini-stat-label">Active Camps</div>
            </div>
            <div className="mini-stat-divider" />
            <div className="mini-stat">
              <div className="mini-stat-val">O+</div>
              <div className="mini-stat-label">Most Needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER ─────────── */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-inner">
          {[
            { key: 'lives', label: 'Lives Saved', icon: '❤️' },
            { key: 'donors', label: 'Active Donors', icon: '🩸' },
            { key: 'hospitals', label: 'Partner Hospitals', icon: '🏥' },
            { key: 'rate', label: 'Match Rate', icon: '✅' },
          ].map(s => (
            <div key={s.key} className="stats-item">
              <div className="stats-icon">{s.icon}</div>
              <div className="stats-value">{formatStat(s.key, counters[s.key])}</div>
              <div className="stats-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────── */}
      <section className="features-section" id="features">
        <div className="section-header">
          <div className="section-pill">Why DropLife</div>
          <h2 className="section-title">BUILT FOR EMERGENCIES</h2>
          <p className="section-subtitle">Every feature engineered to save lives faster</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────── */}
      <section className="how-section">
        <div className="section-header">
          <div className="section-pill">Process</div>
          <h2 className="section-title">SAVE A LIFE IN 3 STEPS</h2>
        </div>
        <div className="steps-container">
          {[
            { num: '01', title: 'Register & Verify', desc: 'Create your donor profile, verify your blood type and health status in minutes.' },
            { num: '02', title: 'Get Matched', desc: 'Our AI instantly matches you with nearby patients or donation camps.' },
            { num: '03', title: 'Save a Life', desc: 'Donate blood, track your impact, and receive your donor certificate.' },
          ].map((step, i) => (
            <div key={i} className="step-item">
              <div className="step-number">{step.num}</div>
              {i < 2 && <div className="step-connector" />}
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOOD TYPE GRID ──────── */}
      <section className="blood-types-section">
        <div className="section-header">
          <h2 className="section-title">FIND YOUR BLOOD TYPE</h2>
          <p className="section-subtitle">Check real-time availability across India</p>
        </div>
        <div className="blood-grid">
          {BLOOD_TYPES.map((bt, i) => (
            <button key={bt} className="blood-type-card" onClick={() => navigate('/blood-availability')}>
              <div className="bt-symbol">{bt}</div>
              <div className="bt-bar-wrap">
                <div className="bt-bar" style={{ width: `${[85,42,78,23,67,31,91,56][i]}%`,
                  background: [85,42,78,23,67,31,91,56][i] < 40 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 
                               [85,42,78,23,67,31,91,56][i] < 60 ? 'linear-gradient(90deg,#f59e0b,#d97706)' :
                               'linear-gradient(90deg,#22c55e,#16a34a)' }} />
              </div>
              <div className="bt-status">
                {[85,42,78,23,67,31,91,56][i] < 40 ? '🔴 Critical' : 
                 [85,42,78,23,67,31,91,56][i] < 60 ? '🟡 Low' : '🟢 Available'}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────── */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-header">
          <div className="section-pill">Real Stories</div>
          <h2 className="section-title">LIVES CHANGED</h2>
        </div>
        <div className="testimonials-slider">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`testimonial-card ${i === activeTestimonial ? 'active' : ''}`}>
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="blood-badge" style={{ width: 40, height: 40, fontSize: '0.85rem' }}>{t.blood}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-city">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="testimonial-dots">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} className={`dot ${i === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ───────────── */}
      <section className="final-cta">
        <div className="cta-glow" />
        <BloodDropLogo size={80} />
        <h2>BE SOMEONE'S HERO TODAY</h2>
        <p>One donation. Up to three lives saved. It takes 30 minutes.</p>
        <div className="cta-buttons">
          <button className="btn-primary" style={{ fontSize: '16px', padding: '16px 40px' }} onClick={() => navigate('/signup')}>
            Start Donating →
          </button>
          <button className="btn-outline" style={{ fontSize: '16px', padding: '16px 40px' }} onClick={() => navigate('/blood-request')}>
            Request Blood
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────── */}
      <footer className="welcome-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <BloodDropLogo size={32} />
            <span>DropLife</span>
            <p>India's most trusted blood donation platform connecting donors, hospitals & patients in real time.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <a onClick={() => navigate('/blood-availability')}>Blood Availability</a>
              <a onClick={() => navigate('/donation-camps')}>Donation Camps</a>
              <a onClick={() => navigate('/hospitals-public')}>Find Hospital</a>
              <a onClick={() => navigate('/map')}>Live Map</a>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <a onClick={() => navigate('/signup')}>Register as Donor</a>
              <a onClick={() => navigate('/login')}>Donor Login</a>
              <a onClick={() => navigate('/hospital-login')}>Hospital Login</a>
            </div>
            <div className="footer-col">
              <h4>Info</h4>
              <a onClick={() => navigate('/about')}>About Us</a>
              <a onClick={() => navigate('/contact')}>Contact</a>
              <a onClick={() => navigate('/helpline')}>Helpline</a>
              <a onClick={() => navigate('/privacy')}>Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 DropLife. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
          <span>Emergency: 104</span>
        </div>
      </footer>
    </div>
  );
}