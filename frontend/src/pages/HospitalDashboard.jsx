import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './HospitalDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Demo data so dashboard always shows something
const DEMO_STATS = {
  totalRequests: 142,
  pendingRequests: 8,
  bloodUnitsAvailable: 247,
  criticalStock: 2,
  totalPatients: 89,
  activeDeliveries: 5,
  todayDonations: 14,
  weeklyDonations: 67,
};

const DEMO_BLOOD_STOCK = [
  { type: 'O+',  units: 45, capacity: 60, status: 'available' },
  { type: 'O-',  units: 6,  capacity: 30, status: 'critical'  },
  { type: 'A+',  units: 38, capacity: 50, status: 'available' },
  { type: 'A-',  units: 4,  capacity: 25, status: 'critical'  },
  { type: 'B+',  units: 22, capacity: 40, status: 'low'       },
  { type: 'B-',  units: 9,  capacity: 20, status: 'low'       },
  { type: 'AB+', units: 17, capacity: 25, status: 'available' },
  { type: 'AB-', units: 3,  capacity: 15, status: 'critical'  },
];

const DEMO_REQUESTS = [
  { id: 'REQ001', patientName: 'Rajesh Kumar', bloodType: 'O-', units: 2, urgency: 'Emergency', status: 'pending',   time: '10 min ago' },
  { id: 'REQ002', patientName: 'Sunita Devi',  bloodType: 'A+', units: 1, urgency: 'Urgent',    status: 'approved',  time: '25 min ago' },
  { id: 'REQ003', patientName: 'Mohan Lal',    bloodType: 'B+', units: 3, urgency: 'Normal',    status: 'fulfilled', time: '1 hr ago'   },
  { id: 'REQ004', patientName: 'Kavita Singh', bloodType: 'AB-',units: 1, urgency: 'Urgent',    status: 'pending',   time: '2 hr ago'   },
  { id: 'REQ005', patientName: 'Amit Verma',   bloodType: 'O+', units: 2, urgency: 'Normal',    status: 'approved',  time: '3 hr ago'   },
];

const DEMO_ACTIVITY = [
  { icon: '🩸', text: '2 units of O- dispatched to Ward 3', time: '5 min ago', type: 'delivery' },
  { icon: '⚡', text: 'Emergency request for AB- received', time: '12 min ago', type: 'urgent' },
  { icon: '✅', text: 'Blood stock replenished: 10 units A+', time: '1 hr ago', type: 'stock' },
  { icon: '👤', text: 'New donor registered: Priya Sharma', time: '2 hr ago', type: 'donor' },
  { icon: '📦', text: 'Delivery #DEL-445 completed', time: '3 hr ago', type: 'delivery' },
];

const SIDEBAR_LINKS = [
  { icon: '📊', label: 'Dashboard',    id: 'dashboard' },
  { icon: '🩸', label: 'Blood Bank',   id: 'bloodbank' },
  { icon: '📋', label: 'Requests',     id: 'requests'  },
  { icon: '🚚', label: 'Deliveries',   id: 'deliveries'},
  { icon: '👥', label: 'Patients',     id: 'patients'  },
  { icon: '👨‍⚕️', label: 'Staff',        id: 'staff'     },
  { icon: '📈', label: 'Analytics',    id: 'analytics' },
  { icon: '🔔', label: 'Notifications',id: 'notifs'    },
];

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(DEMO_STATS);
  const [bloodStock, setBloodStock] = useState(DEMO_BLOOD_STOCK);
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, stockRes, reqRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/hospitals/dashboard/stats`, { headers }),
          axios.get(`${API_BASE}/hospitals/blood-stock`, { headers }),
          axios.get(`${API_BASE}/hospitals/requests`, { headers }),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || DEMO_STATS);
        if (stockRes.status === 'fulfilled') setBloodStock(stockRes.value.data?.data || DEMO_BLOOD_STOCK);
        if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data?.data || DEMO_REQUESTS);
      } catch { /* use demo data */ }
    };
    fetchData();
  }, []);

  const handleRequestAction = (reqId, action) => {
    setRequests(prev => prev.map(r => r.id === reqId
      ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' }
      : r
    ));
  };

  return (
    <div className="hosp-dash-layout">
      {/* ── SIDEBAR ─────────────────────────────── */}
      <aside className={`hosp-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="hosp-sidebar-brand">
          <div className="sidebar-logo-icon">🏥</div>
          <div>
            <div className="sidebar-logo-text">Hospital</div>
            <div className="sidebar-logo-sub">{user?.name || 'Admin Panel'}</div>
          </div>
        </div>

        <nav className="hosp-sidebar-nav">
          {SIDEBAR_LINKS.map(link => (
            <button key={link.id}
              className={`hosp-nav-link ${activeSection === link.id ? 'active' : ''}`}
              onClick={() => { setActiveSection(link.id); setSidebarOpen(false); }}>
              <span className="nav-link-icon">{link.icon}</span>
              <span>{link.label}</span>
              {link.id === 'requests' && stats.pendingRequests > 0 && (
                <span className="nav-badge">{stats.pendingRequests}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="hosp-sidebar-footer">
          <button className="hosp-nav-link" onClick={() => navigate('/')}>
            <span>🚪</span> <span>Exit to Main Site</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────── */}
      <main className="hosp-main">
        {/* Top bar */}
        <div className="hosp-topbar">
          <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="topbar-title">
            <h2>{SIDEBAR_LINKS.find(l => l.id === activeSection)?.icon} {SIDEBAR_LINKS.find(l => l.id === activeSection)?.label}</h2>
          </div>
          <div className="topbar-actions">
            <div className="topbar-live">
              <span className="live-pulse" />Live
            </div>
            <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}
              onClick={() => navigate('/blood-request')}>
              + Blood Request
            </button>
          </div>
        </div>

        {/* ── DASHBOARD SECTION ───────────────── */}
        {activeSection === 'dashboard' && (
          <div className="hosp-section animate-fadeInUp">
            {/* Stats grid */}
            <div className="grid-4" style={{ marginBottom: 28 }}>
              {[
                { icon: '📋', label: 'Total Requests',     value: stats.totalRequests,       change: '+12 today', up: true  },
                { icon: '⏳', label: 'Pending Requests',   value: stats.pendingRequests,      change: 'Needs action', up: false },
                { icon: '🩸', label: 'Blood Units',         value: stats.bloodUnitsAvailable,  change: `${stats.criticalStock} critical`, up: false },
                { icon: '🚚', label: 'Active Deliveries',  value: stats.activeDeliveries,     change: 'In transit', up: true  },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.up ? '↑' : '⚠'} {s.change}</div>
                </div>
              ))}
            </div>

            <div className="grid-2">
              {/* Blood stock overview */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>🩸 Blood Stock Overview</h3>
                  <button className="btn-ghost" style={{ fontSize: '12px' }}
                    onClick={() => setActiveSection('bloodbank')}>View All →</button>
                </div>
                <div className="blood-stock-list">
                  {bloodStock.map(bs => (
                    <div key={bs.type} className="blood-stock-row">
                      <div className={`blood-badge ${bs.status}`} style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
                        {bs.type}
                      </div>
                      <div className="bsr-info">
                        <div className="bsr-label">{bs.units} / {bs.capacity} units</div>
                        <div className="progress-bar-wrap">
                          <div className={`progress-bar-fill ${bs.status === 'available' ? 'green' : bs.status === 'low' ? 'yellow' : 'red'}`}
                            style={{ width: `${(bs.units / bs.capacity) * 100}%` }} />
                        </div>
                      </div>
                      <span className={`badge ${bs.status === 'available' ? 'badge-success' : bs.status === 'low' ? 'badge-warning' : 'badge-danger'}`}>
                        {bs.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 20 }}>📡 Live Activity</h3>
                <div className="activity-list">
                  {DEMO_ACTIVITY.map((a, i) => (
                    <div key={i} className="activity-item">
                      <div className={`activity-icon-wrap ${a.type}`}>{a.icon}</div>
                      <div className="activity-content">
                        <div className="activity-text">{a.text}</div>
                        <div className="activity-time">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent requests mini */}
            <div className="card" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>📋 Recent Blood Requests</h3>
                <button className="btn-ghost" style={{ fontSize: '12px' }}
                  onClick={() => setActiveSection('requests')}>View All →</button>
              </div>
              <RequestsTable requests={requests.slice(0, 4)} onAction={handleRequestAction} compact />
            </div>
          </div>
        )}

        {/* ── BLOOD BANK SECTION ──────────────── */}
        {activeSection === 'bloodbank' && (
          <div className="hosp-section animate-fadeInUp">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="page-title" style={{ fontSize: '1.8rem' }}>Blood Bank</div>
                <div className="page-subtitle">Manage your blood inventory in real time</div>
              </div>
              <button className="btn-primary">+ Update Stock</button>
            </div>

            <div className="blood-bank-grid">
              {bloodStock.map(bs => (
                <div key={bs.type} className={`blood-bank-card ${bs.status}`}>
                  <div className={`blood-badge ${bs.status}`} style={{ width: 56, height: 56, fontSize: '1.1rem' }}>
                    {bs.type}
                  </div>
                  <div className="bbc-units">{bs.units}</div>
                  <div className="bbc-capacity">of {bs.capacity} units</div>
                  <div className="progress-bar-wrap" style={{ width: '100%' }}>
                    <div className={`progress-bar-fill ${bs.status === 'available' ? 'green' : bs.status === 'low' ? 'yellow' : 'red'}`}
                      style={{ width: `${Math.round((bs.units / bs.capacity) * 100)}%` }} />
                  </div>
                  <div className="bbc-pct">{Math.round((bs.units / bs.capacity) * 100)}% capacity</div>
                  <span className={`badge ${bs.status === 'available' ? 'badge-success' : bs.status === 'low' ? 'badge-warning' : 'badge-danger'}`}>
                    {bs.status === 'available' ? '✅ Available' : bs.status === 'low' ? '⚠️ Low' : '🔴 Critical'}
                  </span>
                  <div className="bbc-actions">
                    <button className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>Update</button>
                    <button className="btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }}>Request</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REQUESTS SECTION ────────────────── */}
        {activeSection === 'requests' && (
          <div className="hosp-section animate-fadeInUp">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="page-title" style={{ fontSize: '1.8rem' }}>Blood Requests</div>
                <div className="page-subtitle">{stats.pendingRequests} pending — requires immediate action</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <select className="form-select" style={{ width: 140 }}>
                  <option>All Requests</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Fulfilled</option>
                </select>
                <button className="btn-primary">+ New Request</button>
              </div>
            </div>
            <div className="table-container">
              <RequestsTable requests={requests} onAction={handleRequestAction} />
            </div>
          </div>
        )}

        {/* ── DELIVERIES SECTION ──────────────── */}
        {activeSection === 'deliveries' && (
          <div className="hosp-section animate-fadeInUp">
            <div className="page-title" style={{ fontSize: '1.8rem', marginBottom: 8 }}>Deliveries</div>
            <div className="page-subtitle" style={{ marginBottom: 24 }}>Track blood unit deliveries in real time</div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Delivery ID</th><th>Blood Type</th><th>Units</th>
                    <th>From</th><th>To Ward</th><th>Status</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id:'DEL-001', blood:'O-',  units:2, from:'Blood Bank', ward:'ICU',     status:'in-transit', time:'10 min ago' },
                    { id:'DEL-002', blood:'A+',  units:1, from:'Blood Bank', ward:'Surgery', status:'delivered',  time:'30 min ago' },
                    { id:'DEL-003', blood:'B+',  units:3, from:'AIIMS',      ward:'Ward 5',  status:'pending',    time:'1 hr ago'   },
                    { id:'DEL-004', blood:'AB+', units:1, from:'Blood Bank', ward:'NICU',    status:'delivered',  time:'2 hr ago'   },
                    { id:'DEL-005', blood:'O+',  units:4, from:'KEM Hospital',ward:'ER',     status:'pending',    time:'3 hr ago'   },
                  ].map(d => (
                    <tr key={d.id}>
                      <td><span style={{ fontFamily:'var(--font-mono)', color:'var(--info)' }}>{d.id}</span></td>
                      <td><div className="blood-badge" style={{ width:32, height:32, fontSize:'0.7rem' }}>{d.blood}</div></td>
                      <td><strong>{d.units}</strong></td>
                      <td style={{ color:'var(--text-secondary)' }}>{d.from}</td>
                      <td>{d.ward}</td>
                      <td><span className={`badge ${d.status === 'delivered' ? 'badge-success' : d.status === 'in-transit' ? 'badge-info' : 'badge-warning'}`}>{d.status}</span></td>
                      <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{d.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PATIENTS SECTION ────────────────── */}
        {activeSection === 'patients' && (
          <div className="hosp-section animate-fadeInUp">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
              <div>
                <div className="page-title" style={{ fontSize:'1.8rem' }}>Patients</div>
                <div className="page-subtitle">{stats.totalPatients} patients with active blood needs</div>
              </div>
              <button className="btn-primary">+ Add Patient</button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Patient</th><th>Age</th><th>Blood Type</th><th>Ward</th><th>Condition</th><th>Units Needed</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {[
                    { name:'Rajesh Kumar',  age:45, blood:'O-', ward:'ICU',     condition:'Post-Surgery', units:3, status:'critical'  },
                    { name:'Sunita Devi',   age:32, blood:'A+', ward:'Maternity',condition:'Delivery',    units:1, status:'stable'    },
                    { name:'Mohan Prasad',  age:67, blood:'B-', ward:'Oncology', condition:'Chemo',       units:2, status:'stable'    },
                    { name:'Kavita Singh',  age:28, blood:'AB+',ward:'Surgery',  condition:'Trauma',      units:4, status:'critical'  },
                    { name:'Dinesh Sharma', age:55, blood:'O+', ward:'General',  condition:'Anemia',      units:1, status:'recovering'},
                  ].map((p, i) => (
                    <tr key={i}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.age}</td>
                      <td><div className="blood-badge" style={{ width:32, height:32, fontSize:'0.7rem' }}>{p.blood}</div></td>
                      <td>{p.ward}</td>
                      <td style={{ color:'var(--text-secondary)', fontSize:'13px' }}>{p.condition}</td>
                      <td><strong>{p.units}</strong></td>
                      <td><span className={`badge ${p.status==='critical'?'badge-danger':p.status==='stable'?'badge-success':'badge-info'}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── STAFF SECTION ───────────────────── */}
        {activeSection === 'staff' && (
          <div className="hosp-section animate-fadeInUp">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
              <div>
                <div className="page-title" style={{ fontSize:'1.8rem' }}>Staff</div>
                <div className="page-subtitle">Blood bank and medical staff management</div>
              </div>
              <button className="btn-primary">+ Add Staff</button>
            </div>
            <div className="staff-grid">
              {[
                { name:'Dr. Suresh Patel',  role:'Chief Hematologist', shift:'Morning',   status:'on-duty',   phone:'9876543210' },
                { name:'Dr. Anita Gupta',   role:'Blood Bank Officer',  shift:'Morning',   status:'on-duty',   phone:'9876543211' },
                { name:'Nurse Renu Sharma', role:'Blood Collection',    shift:'Afternoon', status:'off-duty',  phone:'9876543212' },
                { name:'Mr. Vivek Kumar',   role:'Lab Technician',      shift:'Night',     status:'on-leave',  phone:'9876543213' },
                { name:'Dr. Priya Nair',    role:'Transfusion Specialist',shift:'Afternoon',status:'on-duty',  phone:'9876543214' },
                { name:'Nurse Kavya Reddy', role:'Patient Care',        shift:'Night',     status:'on-duty',   phone:'9876543215' },
              ].map((s, i) => (
                <div key={i} className="staff-card">
                  <div className="staff-avatar">{s.name.charAt(0)}</div>
                  <div className="staff-info">
                    <div className="staff-name">{s.name}</div>
                    <div className="staff-role">{s.role}</div>
                    <div className="staff-shift">⏰ {s.shift} Shift</div>
                    <div className="staff-phone">📞 {s.phone}</div>
                  </div>
                  <span className={`badge ${s.status==='on-duty'?'badge-success':s.status==='off-duty'?'badge-warning':'badge-danger'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYTICS SECTION ───────────────── */}
        {activeSection === 'analytics' && (
          <div className="hosp-section animate-fadeInUp">
            <div className="page-title" style={{ fontSize:'1.8rem', marginBottom:24 }}>Analytics</div>
            <div className="grid-4" style={{ marginBottom:24 }}>
              {[
                { label:'Today\'s Donations', val:stats.todayDonations, icon:'🩸', sub:'units collected' },
                { label:'This Week',           val:stats.weeklyDonations,icon:'📅', sub:'units this week' },
                { label:'Fulfillment Rate',    val:'94%',                icon:'✅', sub:'requests fulfilled' },
                { label:'Avg Response Time',   val:'18min',              icon:'⏱', sub:'emergency response' },
              ].map((s,i)=>(
                <div key={i} className="stat-card">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-change up">↑ {s.sub}</div>
                </div>
              ))}
            </div>
            <div className="analytics-chart-placeholder">
              <div className="chart-bars">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                  const heights = [60, 80, 45, 95, 70, 40, 65];
                  return (
                    <div key={day} className="chart-bar-wrap">
                      <div className="chart-bar" style={{ height:`${heights[i]}%` }} />
                      <div className="chart-label">{day}</div>
                    </div>
                  );
                })}
              </div>
              <div className="chart-title">Weekly Blood Donations (units)</div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS SECTION ───────────── */}
        {activeSection === 'notifs' && (
          <div className="hosp-section animate-fadeInUp">
            <div className="page-title" style={{ fontSize:'1.8rem', marginBottom:24 }}>Notifications</div>
            <div className="notifs-list">
              {[
                { icon:'⚡', title:'Emergency: O- needed urgently', body:'Patient in ICU requires 3 units of O- within 1 hour.', time:'2 min ago', read:false, type:'urgent' },
                { icon:'✅', title:'Blood request fulfilled', body:'REQ-002 for patient Sunita Devi has been fulfilled.', time:'15 min ago', read:false, type:'success' },
                { icon:'📦', title:'Stock replenished', body:'10 units of A+ added to blood bank inventory.', time:'1 hr ago', read:true, type:'info' },
                { icon:'🔔', title:'Monthly report ready', body:'Your November blood bank analytics report is available.', time:'2 hr ago', read:true, type:'info' },
                { icon:'⚠️', title:'Low stock alert: B-', body:'B- blood type is critically low (4 units remaining).', time:'5 hr ago', read:true, type:'warning' },
              ].map((n, i) => (
                <div key={i} className={`notif-item ${!n.read ? 'unread' : ''} ${n.type}`}>
                  <div className="notif-icon">{n.icon}</div>
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-text">{n.body}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {!n.read && <div className="notif-dot" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Reusable requests table component
function RequestsTable({ requests, onAction, compact }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th><th>Patient</th><th>Blood</th><th>Units</th>
          <th>Urgency</th><th>Status</th><th>Time</th>
          {!compact && <th>Action</th>}
        </tr>
      </thead>
      <tbody>
        {requests.map(r => (
          <tr key={r.id}>
            <td><span style={{ fontFamily:'var(--font-mono)', color:'var(--info)', fontSize:'12px' }}>{r.id}</span></td>
            <td><strong>{r.patientName}</strong></td>
            <td><div className="blood-badge" style={{ width:34, height:34, fontSize:'0.72rem' }}>{r.bloodType}</div></td>
            <td>{r.units}</td>
            <td>
              <span className={`badge ${r.urgency==='Emergency'?'badge-danger':r.urgency==='Urgent'?'badge-warning':'badge-info'}`}>
                {r.urgency}
              </span>
            </td>
            <td>
              <span className={`badge ${r.status==='pending'?'badge-warning':r.status==='approved'?'badge-info':r.status==='fulfilled'?'badge-success':'badge-danger'}`}>
                {r.status}
              </span>
            </td>
            <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{r.time}</td>
            {!compact && (
              <td>
                {r.status === 'pending' && (
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn-primary" style={{ fontSize:'11px', padding:'5px 12px' }}
                      onClick={() => onAction(r.id, 'approve')}>Approve</button>
                    <button className="btn-ghost" style={{ fontSize:'11px', padding:'5px 10px', color:'var(--danger)' }}
                      onClick={() => onAction(r.id, 'reject')}>Reject</button>
                  </div>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}