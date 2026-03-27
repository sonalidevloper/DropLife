import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DonorDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEMO_HISTORY = [
  { id:1, date:'Nov 15, 2025', hospital:'AIIMS Delhi',        bloodType:'O+', units:1, certificate:true },
  { id:2, date:'Aug 20, 2025', hospital:'Safdarjung Hospital', bloodType:'O+', units:1, certificate:true },
  { id:3, date:'May 5, 2025',  hospital:'Apollo Hospital',     bloodType:'O+', units:1, certificate:true },
  { id:4, date:'Jan 10, 2025', hospital:'AIIMS Delhi',         bloodType:'O+', units:1, certificate:true },
];

export default function DonorDashboard() {
  const { user } = useSelector(s => s.auth);
  const navigate  = useNavigate();
  const [history, setHistory] = useState(DEMO_HISTORY);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalDonations: 4,
    lastDonation:   'Nov 15, 2025',
    nextEligible:   'Feb 15, 2026',
    livesSaved:     12,
    bloodGroup:     user?.bloodGroup || 'O+',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        // ── FIXED: /api/donor/profile  (singular, matches routes/donor.js) ──
        const res = await axios.get(`${API_BASE}/donor/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data) {
          const d = res.data.data;
          setStats({
            totalDonations: d.donationCount    || 4,
            lastDonation:   d.lastDonationDate
              ? new Date(d.lastDonationDate).toLocaleDateString('en-IN',{ day:'numeric',month:'short',year:'numeric' })
              : 'Nov 15, 2025',
            nextEligible: d.nextEligibleDate
              ? new Date(d.nextEligibleDate).toLocaleDateString('en-IN',{ day:'numeric',month:'short',year:'numeric' })
              : 'Feb 15, 2026',
            livesSaved: (d.donationCount || 4) * 3,
            bloodGroup: d.bloodGroup || 'O+',
          });
          if (d.donationHistory?.length) setHistory(d.donationHistory);
        }
      } catch { /* fallback to demo data */ }
    };
    fetchData();
  }, []);

  const daysUntilEligible = () => {
    const diff = Math.ceil((new Date(stats.nextEligible) - new Date()) / 86400000);
    return diff > 0 ? diff : 0;
  };

  const TABS = ['overview','history','requests','achievements'];

  return (
    <div className="donor-dashboard">
      {/* ── Profile header ────────────────────────────────── */}
      <div className="donor-profile-header">
        <div className="donor-bg-effect" />
        <div className="donor-avatar-section">
          <div className="donor-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div className="donor-info">
            <h1 className="donor-name">{user?.name || 'Donor'}</h1>
            <div className="donor-meta">
              <span className="badge badge-red">🩸 Active Donor</span>
              <span style={{ color:'var(--text-muted)', fontSize:13 }}>📧 {user?.email}</span>
              <span style={{ color:'var(--text-muted)', fontSize:13 }}>📍 {user?.city || 'India'}</span>
            </div>
          </div>
          <div className="donor-blood-badge">
            <div className="blood-badge animate-glow" style={{ width:64, height:64, fontSize:'1.3rem' }}>
              {stats.bloodGroup}
            </div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6, textAlign:'center' }}>Blood Group</div>
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div className="donor-stats-row">
        {[
          { icon:'🩸', val:stats.totalDonations, label:'Total Donations', sub:'lifetime'        },
          { icon:'❤️', val:stats.livesSaved,     label:'Lives Saved',     sub:'estimated'       },
          { icon:'📅', val:stats.lastDonation,   label:'Last Donation',   sub:'date'            },
          { icon:'⏳', val:`${daysUntilEligible()} days`, label:'Next Eligible', sub:stats.nextEligible },
        ].map((s,i)=>(
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ fontSize: typeof s.val==='string'&&s.val.length>5?'1.4rem':'2.4rem' }}>
              {s.val}
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change up">↑ {s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="donor-tabs">
        {TABS.map(t=>(
          <button key={t} className={`donor-tab ${activeTab===t?'active':''}`} onClick={()=>setActiveTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Overview ──────────────────────────────────────── */}
      {activeTab==='overview' && (
        <div className="donor-tab-content animate-fadeInUp">
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom:20, fontWeight:700 }}>🔥 Donation Streak</h3>
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'4rem', color:'var(--red-light)', lineHeight:1 }}>
                    {stats.totalDonations}
                  </div>
                  <div style={{ color:'var(--text-muted)', fontSize:13 }}>donations</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
                      <span style={{ color:'var(--text-secondary)' }}>Progress to next badge</span>
                      <span style={{ color:'var(--red-light)' }}>{stats.totalDonations}/5</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill red" style={{ width:`${(stats.totalDonations/5)*100}%` }}/>
                    </div>
                  </div>
                  <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.5 }}>
                    🏆 {5-stats.totalDonations} more donation{5-stats.totalDonations!==1?'s':''} to unlock <strong style={{ color:'var(--text-primary)' }}>Gold Donor</strong> badge!
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom:20, fontWeight:700 }}>⚡ Quick Actions</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { icon:'🩸', label:'Schedule Donation',  to:'/donation-camps' },
                  { icon:'📋', label:'Request Blood',       to:'/blood-request'  },
                  { icon:'🔔', label:'SOS Alert Nearby',    to:'/notifications'  },
                  { icon:'📍', label:'Find Donation Camp',  to:'/map'            },
                ].map((a,i)=>(
                  <button key={i} className="quick-action-btn" onClick={()=>navigate(a.to)}>
                    <span style={{ fontSize:20 }}>{a.icon}</span>
                    <span>{a.label}</span>
                    <span style={{ marginLeft:'auto', color:'var(--text-muted)' }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── History ───────────────────────────────────────── */}
      {activeTab==='history' && (
        <div className="donor-tab-content animate-fadeInUp">
          <div className="table-container">
            {history.length===0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🩸</div>
                <h3>No donations yet</h3>
                <p>Your donation history will appear here once you donate.</p>
                <button className="btn-primary" style={{ marginTop:16 }} onClick={()=>navigate('/donation-camps')}>
                  Find a Donation Camp
                </button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Date</th><th>Hospital</th><th>Blood Type</th><th>Units</th><th>Certificate</th></tr>
                </thead>
                <tbody>
                  {history.map((h,i)=>(
                    <tr key={h.id||i}>
                      <td style={{ color:'var(--text-muted)', fontSize:12 }}>{i+1}</td>
                      <td style={{ color:'var(--text-secondary)' }}>{h.date}</td>
                      <td><strong>{h.hospital}</strong></td>
                      <td>
                        <div className="blood-badge" style={{ width:32, height:32, fontSize:'0.7rem' }}>{h.bloodType}</div>
                      </td>
                      <td>{h.units}</td>
                      <td>
                        {h.certificate
                          ? <button className="btn-ghost" style={{ fontSize:'12px', padding:'5px 12px', color:'var(--info)' }}>📄 Download</button>
                          : <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Requests ──────────────────────────────────────── */}
      {activeTab==='requests' && (
        <div className="donor-tab-content animate-fadeInUp">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <h3 style={{ fontWeight:700, marginBottom:4 }}>Active Blood Requests</h3>
              <p style={{ color:'var(--text-muted)', fontSize:13 }}>Requests matching your blood type near you</p>
            </div>
            <button className="btn-primary" onClick={()=>navigate('/blood-request')}>+ New Request</button>
          </div>
          <div className="requests-list">
            {[
              { type:'O+', hospital:'AIIMS Delhi',     urgency:'Urgent',    time:'10 min ago', distance:'3.2 km' },
              { type:'O+', hospital:'Max Hospital',    urgency:'Normal',    time:'30 min ago', distance:'5.8 km' },
              { type:'O-', hospital:'Apollo Hospital', urgency:'Emergency', time:'5 min ago',  distance:'7.1 km' },
            ].map((r,i)=>(
              <div key={i} className="request-card">
                <div className="blood-badge" style={{ width:44, height:44, fontSize:'0.9rem' }}>{r.type}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{r.hospital}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:2 }}>📍 {r.distance} · {r.time}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                  <span className={`badge ${r.urgency==='Emergency'?'badge-danger':r.urgency==='Urgent'?'badge-warning':'badge-info'}`}>{r.urgency}</span>
                  <button className="btn-primary" style={{ fontSize:'12px', padding:'6px 14px' }}>Respond</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Achievements ──────────────────────────────────── */}
      {activeTab==='achievements' && (
        <div className="donor-tab-content animate-fadeInUp">
          <div className="achievements-grid">
            {[
              { icon:'🩸', name:'First Drop',    desc:'Made your first donation',     earned:true  },
              { icon:'⭐', name:'Regular Donor', desc:'3+ donations completed',        earned:true  },
              { icon:'🔥', name:'Streak Hero',   desc:'Donated 3 times in a year',    earned:true  },
              { icon:'🏆', name:'Gold Donor',    desc:'5+ lifetime donations',         earned:false },
              { icon:'💎', name:'Diamond Donor', desc:'10+ lifetime donations',        earned:false },
              { icon:'🦸', name:'Life Saver',    desc:'Saved 10+ lives estimated',    earned:false },
            ].map((a,i)=>(
              <div key={i} className={`achievement-card ${a.earned?'earned':'locked'}`}>
                <div className="achievement-icon">{a.icon}</div>
                <div className="achievement-name">{a.name}</div>
                <div className="achievement-desc">{a.desc}</div>
                {a.earned
                  ? <span className="badge badge-success">Earned ✓</span>
                  : <span className="badge" style={{ background:'rgba(255,255,255,.05)', color:'var(--text-muted)', border:'1px solid var(--border)' }}>🔒 Locked</span>
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}