import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './Home.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const RECENT_REQUESTS = [
  { id:1, bloodType:'O-', hospital:'AIIMS Delhi',        city:'Delhi',       urgency:'Emergency', time:'5 min ago'  },
  { id:2, bloodType:'A+', hospital:'Apollo Hospital',    city:'Delhi',       urgency:'Urgent',    time:'12 min ago' },
  { id:3, bloodType:'B+', hospital:'KEM Hospital',       city:'Mumbai',      urgency:'Normal',    time:'25 min ago' },
  { id:4, bloodType:'AB-',hospital:'KIMS Hospital',      city:'Bhubaneswar', urgency:'Urgent',    time:'1 hr ago'   },
  { id:5, bloodType:'O+', hospital:'Manipal Hospital',   city:'Bangalore',   urgency:'Normal',    time:'2 hr ago'   },
];

const STATS = [
  { val:'4.2M+', label:'Lives Saved',         icon:'❤️' },
  { val:'120K+', label:'Active Donors',        icon:'🩸' },
  { val:'850+',  label:'Partner Hospitals',    icon:'🏥' },
  { val:'98%',   label:'Match Success Rate',   icon:'✅' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, token } = useSelector(s => s.auth);
  const [requests, setRequests] = useState(RECENT_REQUESTS);
  const [bloodStock, setBloodStock] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await axios.get(`${API_BASE}/blood-stock`);
        if (res.data?.data?.length) setBloodStock(res.data.data.slice(0,8));
      } catch { /* use demo */ }
    };
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${API_BASE}/blood-request/recent`);
        if (res.data?.data?.length) setRequests(res.data.data);
      } catch { /* use demo */ }
    };
    fetchStock();
    fetchRequests();
  }, []);

  return (
    <div className="home-page">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <span className="hero-badge-dot" />
            Live — blood requests active right now
          </div>
          <h1 className="home-hero-title">
            SAVE LIVES,<br />
            <span className="home-hero-accent">DONATE BLOOD</span>
          </h1>
          <p className="home-hero-sub">
            Join DropLife, the smart blood donation platform connecting donors with those in need.
            Every donation can save up to 3 lives.
          </p>
          <div className="home-hero-btns">
            {token ? (
              <>
                <button className="btn-primary" onClick={() => navigate('/donor-dashboard')}>
                  📊 My Dashboard
                </button>
                <button className="btn-outline" onClick={() => navigate('/blood-request')}>
                  🩸 Request Blood
                </button>
              </>
            ) : (
              <>
                <button className="btn-primary" onClick={() => navigate('/signup')}>
                  Register as Donor
                </button>
                <button className="btn-outline" onClick={() => navigate('/blood-request')}>
                  Request Blood
                </button>
              </>
            )}
          </div>
        </div>

        {/* SOS card */}
        <div className="home-hero-card">
          <div className="sos-card">
            <div className="sos-header">
              <div className="sos-icon">🚨</div>
              <div>
                <div className="sos-title">Emergency SOS</div>
                <div className="sos-sub">One tap alerts nearby donors</div>
              </div>
              <span className="badge badge-danger">LIVE</span>
            </div>
            <div className="sos-blood-row">
              {BLOOD_TYPES.map(bt => (
                <button key={bt} className="sos-blood-btn" onClick={() => navigate('/blood-request')}>
                  {bt}
                </button>
              ))}
            </div>
            <button className="sos-btn" onClick={() => navigate('/blood-request')}>
              🆘 Send Emergency Request
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section className="home-stats-bar">
        {STATS.map((s,i) => (
          <div key={i} className="home-stat">
            <span className="home-stat-icon">{s.icon}</span>
            <span className="home-stat-val">{s.val}</span>
            <span className="home-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="home-content">

        {/* Recent requests */}
        <section className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">🔴 Live Blood Requests</h2>
            <button className="btn-ghost" onClick={() => navigate('/blood-availability')}>View All →</button>
          </div>
          <div className="requests-grid">
            {requests.map(r => (
              <div key={r.id} className="req-card">
                <div className="req-card-top">
                  <div className={`blood-badge ${r.urgency==='Emergency'?'critical':r.urgency==='Urgent'?'low':'available'}`}
                    style={{ width:48, height:48, fontSize:'0.95rem' }}>
                    {r.bloodType}
                  </div>
                  <div className="req-card-info">
                    <div className="req-hospital">{r.hospital}</div>
                    <div className="req-city">📍 {r.city}</div>
                    <div className="req-time">🕐 {r.time}</div>
                  </div>
                  <span className={`badge ${r.urgency==='Emergency'?'badge-danger':r.urgency==='Urgent'?'badge-warning':'badge-info'}`}>
                    {r.urgency}
                  </span>
                </div>
                <button className="btn-primary" style={{ width:'100%', fontSize:13, padding:'9px' }}
                  onClick={() => navigate('/blood-request')}>
                  Respond →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Quick nav cards */}
        <section className="home-section">
          <h2 className="home-section-title">Quick Access</h2>
          <div className="quick-nav-grid">
            {[
              { icon:'🩸', title:'Find Blood',      sub:'Check real-time availability', to:'/blood-availability', color:'#e31b23' },
              { icon:'📍', title:'Live Map',         sub:'Donors & hospitals near you',  to:'/map',                color:'#3b82f6' },
              { icon:'⛺', title:'Donation Camps',   sub:'Upcoming drives near you',     to:'/donation-camps',     color:'#f59e0b' },
              { icon:'🏥', title:'Find Hospitals',   sub:'850+ partner hospitals',       to:'/hospitals-public',   color:'#22c55e' },
            ].map((n,i)=>(
              <button key={i} className="quick-nav-card" onClick={()=>navigate(n.to)}
                style={{ '--accent': n.color }}>
                <div className="qnc-icon" style={{ background:`${n.color}20`, color:n.color }}>{n.icon}</div>
                <div className="qnc-text">
                  <div className="qnc-title">{n.title}</div>
                  <div className="qnc-sub">{n.sub}</div>
                </div>
                <span className="qnc-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* Blood availability summary */}
        <section className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">🩸 Blood Availability</h2>
            <button className="btn-ghost" onClick={() => navigate('/blood-availability')}>Full View →</button>
          </div>
          <div className="blood-avail-grid">
            {BLOOD_TYPES.map((bt, i) => {
              const pct = [85,42,78,23,67,31,91,56][i];
              const status = pct < 40 ? 'critical' : pct < 60 ? 'low' : 'available';
              return (
                <button key={bt} className="avail-card" onClick={() => navigate('/blood-availability')}>
                  <div className={`blood-badge ${status}`} style={{ width:44, height:44, fontSize:'0.9rem' }}>{bt}</div>
                  <div className="avail-info">
                    <div className="avail-bar-wrap">
                      <div className="avail-bar" style={{
                        width:`${pct}%`,
                        background: status==='critical'?'linear-gradient(90deg,#ef4444,#dc2626)':
                                    status==='low'     ?'linear-gradient(90deg,#f59e0b,#d97706)':
                                                        'linear-gradient(90deg,#22c55e,#16a34a)',
                      }}/>
                    </div>
                    <div className="avail-status">
                      {status==='critical'?'🔴 Critical':status==='low'?'🟡 Low':'🟢 Available'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Welcome message for logged-in users */}
        {token && user && (
          <section className="home-section">
            <div className="welcome-card">
              <div className="welcome-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
              <div className="welcome-info">
                <div className="welcome-greeting">Welcome back, {user.name?.split(' ')[0]}! 👋</div>
                <div className="welcome-role">You are logged in as a <strong>{user.role}</strong></div>
              </div>
              <button className="btn-primary"
                onClick={() => navigate(
                  user.role==='donor'    ? '/donor-dashboard'    :
                  user.role==='hospital' ? '/hospital-dashboard' :
                  user.role==='admin'    ? '/admin-dashboard'    : '/user-dashboard'
                )}>
                Go to Dashboard →
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}