import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BloodAvailability.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BLOOD_TYPES = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const INDIAN_CITIES = [
  'All Cities', 'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore',
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Bhubaneswar',
  'Lucknow', 'Chandigarh', 'Patna', 'Kochi', 'Indore',
];

// Fallback demo data
const DEMO_STOCK = [
  { id: 1, hospital: 'AIIMS Delhi', city: 'Delhi', bloodType: 'O+', units: 45, status: 'available', distance: '2.3 km', lastUpdated: '5 min ago', contact: '011-26588500' },
  { id: 2, hospital: 'Apollo Hospital', city: 'Delhi', bloodType: 'A+', units: 32, status: 'available', distance: '4.1 km', lastUpdated: '12 min ago', contact: '011-26092050' },
  { id: 3, hospital: 'Safdarjung Hospital', city: 'Delhi', bloodType: 'B+', units: 8, status: 'low', distance: '6.7 km', lastUpdated: '1 hr ago', contact: '011-26707444' },
  { id: 4, hospital: 'RML Hospital', city: 'Delhi', bloodType: 'AB+', units: 2, status: 'critical', distance: '3.5 km', lastUpdated: '30 min ago', contact: '011-23745525' },
  { id: 5, hospital: 'NIMHANS', city: 'Bangalore', bloodType: 'O-', units: 12, status: 'available', distance: '8.2 km', lastUpdated: '20 min ago', contact: '080-46110007' },
  { id: 6, hospital: 'KEM Hospital', city: 'Mumbai', bloodType: 'B-', units: 3, status: 'critical', distance: '1.9 km', lastUpdated: '45 min ago', contact: '022-24107000' },
  { id: 7, hospital: 'PGI Chandigarh', city: 'Chandigarh', bloodType: 'A-', units: 19, status: 'available', distance: '12.1 km', lastUpdated: '1 hr ago', contact: '0172-2752021' },
  { id: 8, hospital: 'SCBMCH', city: 'Bhubaneswar', bloodType: 'AB-', units: 5, status: 'low', distance: '3.0 km', lastUpdated: '10 min ago', contact: '0671-2411317' },
  { id: 9, hospital: 'KIMS Hospital', city: 'Bhubaneswar', bloodType: 'O+', units: 22, status: 'available', distance: '5.6 km', lastUpdated: '2 hr ago', contact: '0674-3011000' },
  { id: 10, hospital: 'Fortis Hospital', city: 'Mumbai', bloodType: 'A+', units: 0, status: 'unavailable', distance: '9.3 km', lastUpdated: '3 hr ago', contact: '022-66279999' },
  { id: 11, hospital: 'Max Super Specialty', city: 'Delhi', bloodType: 'O+', units: 67, status: 'available', distance: '7.8 km', lastUpdated: '15 min ago', contact: '011-26515050' },
  { id: 12, hospital: 'Manipal Hospital', city: 'Bangalore', bloodType: 'B+', units: 14, status: 'available', distance: '4.5 km', lastUpdated: '25 min ago', contact: '080-25023333' },
];

const BLOOD_SUMMARY = [
  { type: 'O+', available: 847, hospitals: 234, status: 'available' },
  { type: 'A+', available: 623, hospitals: 198, status: 'available' },
  { type: 'B+', available: 412, hospitals: 167, status: 'low' },
  { type: 'AB+', available: 98, hospitals: 87, status: 'low' },
  { type: 'O-', available: 145, hospitals: 112, status: 'available' },
  { type: 'A-', available: 189, hospitals: 134, status: 'available' },
  { type: 'B-', available: 67, hospitals: 78, status: 'critical' },
  { type: 'AB-', available: 43, hospitals: 56, status: 'critical' },
];

export default function BloodAvailability() {
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('units');
  const [viewMode, setViewMode] = useState('grid'); // grid | table
  const [requestModal, setRequestModal] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedType !== 'All') params.bloodType = selectedType;
      if (selectedCity !== 'All Cities') params.city = selectedCity;
      const res = await axios.get(`${API_BASE}/blood-stock`, { params });
      setStock(res.data?.data || res.data || []);
      setLastRefresh(new Date());
    } catch (err) {
      // Use demo data when backend not available
      setStock(DEMO_STOCK);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedCity]);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  // Auto refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchStock, 120000);
    return () => clearInterval(interval);
  }, [fetchStock]);

  // Filter + sort
  const filtered = stock
    .filter(item => {
      const matchType = selectedType === 'All' || item.bloodType === selectedType;
      const matchCity = selectedCity === 'All Cities' || item.city === selectedCity;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchSearch = !searchQuery || 
        item.hospital?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bloodType?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchCity && matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'units') return (b.units || 0) - (a.units || 0);
      if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance);
      if (sortBy === 'hospital') return a.hospital?.localeCompare(b.hospital);
      return 0;
    });

  const getStatusBadge = (status, units) => {
    if (units === 0 || status === 'unavailable') return <span className="badge badge-danger">Unavailable</span>;
    if (units <= 5 || status === 'critical') return <span className="badge badge-danger">Critical</span>;
    if (units <= 15 || status === 'low') return <span className="badge badge-warning">Low Stock</span>;
    return <span className="badge badge-success">Available</span>;
  };

  const getBloodBadgeClass = (status, units) => {
    if (!units || units === 0) return '';
    if (units <= 5) return 'critical';
    if (units <= 15) return 'low';
    return 'available';
  };

  return (
    <div className="blood-avail-page">
      {/* ── HEADER ────────────────────────────────── */}
      <div className="ba-header">
        <div>
          <h1 className="page-title">🩸 Blood Availability</h1>
          <p className="page-subtitle">
            Real-time blood stock across India · Last updated {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="ba-header-actions">
          <button className="btn-outline" onClick={fetchStock} disabled={loading}>
            {loading ? '...' : '🔄 Refresh'}
          </button>
          <button className="btn-primary" onClick={() => navigate('/blood-request')}>
            + Request Blood
          </button>
        </div>
      </div>

      {/* ── BLOOD TYPE SUMMARY CARDS ───────────────── */}
      <div className="blood-summary-grid">
        {BLOOD_SUMMARY.map(b => (
          <button
            key={b.type}
            className={`blood-sum-card ${selectedType === b.type ? 'selected' : ''} ${b.status}`}
            onClick={() => setSelectedType(selectedType === b.type ? 'All' : b.type)}
          >
            <div className={`blood-badge ${b.status}`} style={{ width: 44, height: 44, fontSize: '1rem' }}>
              {b.type}
            </div>
            <div className="bsc-info">
              <div className="bsc-units">{b.available.toLocaleString()}</div>
              <div className="bsc-label">units · {b.hospitals} hospitals</div>
            </div>
            <div className={`bsc-dot ${b.status}`} />
          </button>
        ))}
      </div>

      {/* ── FILTERS ───────────────────────────────── */}
      <div className="ba-filters">
        <div className="search-wrapper" style={{ flex: 2 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search hospital, city or blood type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select className="form-select" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
          {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
        </select>

        <select className="form-select" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
          {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="available">✅ Available</option>
          <option value="low">🟡 Low Stock</option>
          <option value="critical">🔴 Critical</option>
        </select>

        <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="units">Sort: Units</option>
          <option value="distance">Sort: Distance</option>
          <option value="hospital">Sort: Hospital</option>
        </select>

        <div className="view-toggle">
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>⊞</button>
          <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>☰</button>
        </div>
      </div>

      {/* ── RESULTS COUNT ─────────────────────────── */}
      <div className="ba-results-info">
        <span>{loading ? 'Loading...' : `${filtered.length} results found`}</span>
        {selectedType !== 'All' && (
          <span className="filter-tag">
            Blood: {selectedType} <button onClick={() => setSelectedType('All')}>×</button>
          </span>
        )}
        {selectedCity !== 'All Cities' && (
          <span className="filter-tag">
            City: {selectedCity} <button onClick={() => setSelectedCity('All Cities')}>×</button>
          </span>
        )}
      </div>

      {/* ── LOADING ───────────────────────────────── */}
      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Fetching blood availability...</p>
        </div>
      )}

      {/* ── GRID VIEW ─────────────────────────────── */}
      {!loading && viewMode === 'grid' && (
        <div className="ba-grid">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon">🩸</div>
              <h3>No results found</h3>
              <p>Try changing the blood type, city, or search query.</p>
              <button className="btn-primary" style={{ marginTop: 16 }}
                onClick={() => { setSelectedType('All'); setSelectedCity('All Cities'); setSearchQuery(''); }}>
                Clear Filters
              </button>
            </div>
          ) : filtered.map(item => (
            <div key={item.id} className="ba-card">
              <div className="ba-card-header">
                <div className={`blood-badge ${getBloodBadgeClass(item.status, item.units)}`}>
                  {item.bloodType}
                </div>
                <div className="ba-card-hospital">
                  <div className="ba-hospital-name">{item.hospital}</div>
                  <div className="ba-hospital-city">📍 {item.city}</div>
                </div>
                {getStatusBadge(item.status, item.units)}
              </div>

              <div className="ba-card-stats">
                <div className="ba-stat">
                  <div className="ba-stat-val">{item.units || 0}</div>
                  <div className="ba-stat-label">Units Available</div>
                </div>
                <div className="ba-stat-divider" />
                <div className="ba-stat">
                  <div className="ba-stat-val">{item.distance || 'N/A'}</div>
                  <div className="ba-stat-label">Distance</div>
                </div>
              </div>

              {/* Units bar */}
              <div className="units-bar-wrap">
                <div className="units-bar-fill"
                  style={{
                    width: `${Math.min((item.units / 50) * 100, 100)}%`,
                    background: item.units <= 5 ? 'linear-gradient(90deg,#ef4444,#dc2626)' :
                                item.units <= 15 ? 'linear-gradient(90deg,#f59e0b,#d97706)' :
                                'linear-gradient(90deg,#22c55e,#16a34a)'
                  }}
                />
              </div>

              <div className="ba-card-footer">
                <span className="ba-updated">🕐 {item.lastUpdated}</span>
                <div className="ba-actions">
                  <button className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => window.open(`tel:${item.contact}`)}>
                    📞 Call
                  </button>
                  <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}
                    onClick={() => setRequestModal(item)}>
                    Request
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TABLE VIEW ────────────────────────────── */}
      {!loading && viewMode === 'table' && (
        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🩸</div>
              <h3>No blood stock found</h3>
              <p>Adjust your filters to see results.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Blood Type</th>
                  <th>Hospital</th>
                  <th>City</th>
                  <th>Units</th>
                  <th>Distance</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className={`blood-badge ${getBloodBadgeClass(item.status, item.units)}`}
                        style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                        {item.bloodType}
                      </div>
                    </td>
                    <td><strong>{item.hospital}</strong></td>
                    <td>{item.city}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600,
                        color: item.units <= 5 ? 'var(--danger)' : item.units <= 15 ? 'var(--warning)' : 'var(--success)' }}>
                        {item.units}
                      </span>
                    </td>
                    <td>{item.distance}</td>
                    <td>{getStatusBadge(item.status, item.units)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.lastUpdated}</td>
                    <td>
                      <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}
                        onClick={() => setRequestModal(item)}>
                        Request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── REQUEST MODAL ─────────────────────────── */}
      {requestModal && (
        <div className="modal-overlay" onClick={() => setRequestModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Request Blood</h2>
              <button className="modal-close" onClick={() => setRequestModal(null)}>×</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
              background: 'rgba(227,27,35,0.07)', borderRadius: 12, padding: 16, border: '1px solid var(--border-red)' }}>
              <div className="blood-badge">{requestModal.bloodType}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{requestModal.hospital}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{requestModal.city} · {requestModal.distance}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{requestModal.units} units available</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Patient Name</label>
              <input className="form-input" placeholder="Enter patient name" />
            </div>
            <div className="form-group">
              <label className="form-label">Units Required</label>
              <input className="form-input" type="number" min={1} max={requestModal.units} placeholder="e.g. 2" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input className="form-input" placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label className="form-label">Urgency</label>
              <select className="form-select">
                <option>Normal</option>
                <option>Urgent (within 24hrs)</option>
                <option>Emergency (within 2hrs)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setRequestModal(null)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2 }}
                onClick={() => { navigate('/blood-request'); setRequestModal(null); }}>
                Submit Request →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}