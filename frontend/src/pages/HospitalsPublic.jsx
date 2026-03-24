import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HospitalsPublic.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEMO_HOSPITALS = [
  { id: 1, name: 'AIIMS New Delhi', city: 'Delhi', state: 'Delhi', type: 'Government', speciality: 'Multi-Specialty', bloodBank: true, contact: '011-26588500', rating: 4.8, beds: 2478, established: 1956, address: 'Sri Aurobindo Marg, Ansari Nagar', lat: 28.5672, lng: 77.2100, totalDonors: 1240, urgentNeed: ['O-', 'AB-'], image: '🏥' },
  { id: 2, name: 'Safdarjung Hospital', city: 'Delhi', state: 'Delhi', type: 'Government', speciality: 'Multi-Specialty', bloodBank: true, contact: '011-26707444', rating: 4.5, beds: 1531, established: 1954, address: 'Sri Aurobindo Marg', lat: 28.5693, lng: 77.2044, totalDonors: 890, urgentNeed: ['B-'], image: '🏥' },
  { id: 3, name: 'Apollo Hospital', city: 'Delhi', state: 'Delhi', type: 'Private', speciality: 'Cardiac Care', bloodBank: true, contact: '011-71791090', rating: 4.9, beds: 695, established: 1983, address: 'Sarita Vihar, Mathura Road', lat: 28.5355, lng: 77.2837, totalDonors: 567, urgentNeed: ['A-'], image: '🏥' },
  { id: 4, name: 'KEM Hospital', city: 'Mumbai', state: 'Maharashtra', type: 'Government', speciality: 'Multi-Specialty', bloodBank: true, contact: '022-24107000', rating: 4.6, beds: 1791, established: 1926, address: 'Acharya Donde Marg, Parel', lat: 19.0038, lng: 72.8412, totalDonors: 1100, urgentNeed: ['O+', 'B+'], image: '🏥' },
  { id: 5, name: 'Fortis Hospital', city: 'Mumbai', state: 'Maharashtra', type: 'Private', speciality: 'Oncology', bloodBank: true, contact: '022-66279999', rating: 4.7, beds: 312, established: 2000, address: 'Mulund Goregaon Link Road', lat: 19.1663, lng: 72.9576, totalDonors: 234, urgentNeed: [], image: '🏥' },
  { id: 6, name: 'PGI Chandigarh', city: 'Chandigarh', state: 'Punjab', type: 'Government', speciality: 'Multi-Specialty', bloodBank: true, contact: '0172-2752021', rating: 4.8, beds: 2000, established: 1962, address: 'Sector 12, Chandigarh', lat: 30.7589, lng: 76.7765, totalDonors: 876, urgentNeed: ['AB+'], image: '🏥' },
  { id: 7, name: 'SCBMCH Cuttack', city: 'Cuttack', state: 'Odisha', type: 'Government', speciality: 'Multi-Specialty', bloodBank: true, contact: '0671-2411317', rating: 4.3, beds: 1080, established: 1944, address: 'Mangalabag, Cuttack', lat: 20.4634, lng: 85.8852, totalDonors: 456, urgentNeed: ['O-', 'B-'], image: '🏥' },
  { id: 8, name: 'KIMS Hospital', city: 'Bhubaneswar', state: 'Odisha', type: 'Private', speciality: 'Multi-Specialty', bloodBank: true, contact: '0674-3011000', rating: 4.7, beds: 850, established: 2005, address: 'Patia, Bhubaneswar', lat: 20.3547, lng: 85.8245, totalDonors: 345, urgentNeed: [], image: '🏥' },
  { id: 9, name: 'NIMHANS', city: 'Bangalore', state: 'Karnataka', type: 'Government', speciality: 'Neuroscience', bloodBank: true, contact: '080-46110007', rating: 4.9, beds: 1600, established: 1974, address: 'Hosur Road, Bangalore', lat: 12.9411, lng: 77.5955, totalDonors: 678, urgentNeed: ['A+'], image: '🏥' },
  { id: 10, name: 'Manipal Hospital', city: 'Bangalore', state: 'Karnataka', type: 'Private', speciality: 'Multi-Specialty', bloodBank: true, contact: '080-25023333', rating: 4.8, beds: 608, established: 1991, address: '98 HAL Airport Road', lat: 12.9682, lng: 77.6435, totalDonors: 290, urgentNeed: [], image: '🏥' },
  { id: 11, name: 'Christian Medical College', city: 'Vellore', state: 'Tamil Nadu', type: 'Private', speciality: 'Multi-Specialty', bloodBank: true, contact: '0416-2281000', rating: 4.9, beds: 2600, established: 1900, address: 'Ida Scudder Road, Vellore', lat: 12.9252, lng: 79.1323, totalDonors: 1450, urgentNeed: ['AB-'], image: '🏥' },
  { id: 12, name: 'PGIMER Chandigarh', city: 'Chandigarh', state: 'Punjab', type: 'Government', speciality: 'Research Hospital', bloodBank: true, contact: '0172-2746018', rating: 4.7, beds: 1890, established: 1962, address: 'Sector 12, Chandigarh', lat: 30.7567, lng: 76.7783, totalDonors: 780, urgentNeed: ['B+'], image: '🏥' },
];

const STATES = ['All States', 'Delhi', 'Maharashtra', 'Punjab', 'Odisha', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Gujarat', 'Telangana'];
const HOSPITAL_TYPES = ['All Types', 'Government', 'Private', 'Trust'];
const BLOOD_TYPES = ['Any Blood Type', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function HospitalsPublic() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedBlood, setSelectedBlood] = useState('Any Blood Type');
  const [bloodBankOnly, setBloodBankOnly] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await axios.get(`${API_BASE}/hospitals/public`);
        setHospitals(res.data?.data || res.data || DEMO_HOSPITALS);
      } catch {
        setHospitals(DEMO_HOSPITALS);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  // Live search suggestions
  useEffect(() => {
    if (searchQuery.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const matches = hospitals
      .filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.speciality?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 6);
    setSuggestions(matches);
    setShowSuggestions(true);
  }, [searchQuery, hospitals]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = hospitals.filter(h => {
    const matchSearch = !searchQuery ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchState = selectedState === 'All States' || h.state === selectedState;
    const matchType = selectedType === 'All Types' || h.type === selectedType;
    const matchBlood = selectedBlood === 'Any Blood Type' || h.urgentNeed?.includes(selectedBlood);
    const matchBloodBank = !bloodBankOnly || h.bloodBank;
    const matchUrgent = !urgentOnly || h.urgentNeed?.length > 0;
    return matchSearch && matchState && matchType && matchBlood && matchBloodBank && matchUrgent;
  });

  const clearFilters = () => {
    setSearchQuery(''); setSelectedState('All States'); setSelectedType('All Types');
    setSelectedBlood('Any Blood Type'); setBloodBankOnly(false); setUrgentOnly(false);
  };

  return (
    <div className="hospitals-page">
      {/* Header */}
      <div className="hosp-header">
        <div>
          <h1 className="page-title">🏥 Find Hospitals</h1>
          <p className="page-subtitle">{hospitals.length} partner hospitals across India with blood banks</p>
        </div>
        <div className="hosp-header-stats">
          <div className="hosp-stat"><span className="hosp-stat-val">{hospitals.filter(h => h.urgentNeed?.length > 0).length}</span><span>Urgent Need</span></div>
          <div className="hosp-stat"><span className="hosp-stat-val">{hospitals.filter(h => h.bloodBank).length}</span><span>Blood Banks</span></div>
          <div className="hosp-stat"><span className="hosp-stat-val">{hospitals.reduce((a, h) => a + (h.totalDonors || 0), 0).toLocaleString()}</span><span>Total Donors</span></div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="hosp-filters-wrap">
        {/* Search with live suggestions */}
        <div className="hosp-search-container" ref={searchRef}>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search hospital name, city, state or speciality..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => { setSearchQuery(''); setSuggestions([]); }}>
                ×
              </button>
            )}
          </div>

          {/* Live suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map(h => (
                <button key={h.id} className="suggestion-item"
                  onClick={() => { setSearchQuery(h.name); setShowSuggestions(false); setSelectedHospital(h); }}>
                  <span className="sug-icon">🏥</span>
                  <div className="sug-info">
                    <span className="sug-name">{h.name}</span>
                    <span className="sug-sub">{h.city}, {h.state} · {h.type}</span>
                  </div>
                  {h.urgentNeed?.length > 0 && (
                    <span className="badge badge-danger" style={{ fontSize: '10px' }}>Urgent</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter row */}
        <div className="hosp-filter-row">
          <select className="form-select" value={selectedState} onChange={e => setSelectedState(e.target.value)}>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            {HOSPITAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="form-select" value={selectedBlood} onChange={e => setSelectedBlood(e.target.value)}>
            {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <label className="toggle-label">
            <input type="checkbox" checked={bloodBankOnly} onChange={e => setBloodBankOnly(e.target.checked)} />
            Blood Bank Only
          </label>
          <label className="toggle-label urgent">
            <input type="checkbox" checked={urgentOnly} onChange={e => setUrgentOnly(e.target.checked)} />
            🔴 Urgent Need
          </label>
          {(searchQuery || selectedState !== 'All States' || selectedType !== 'All Types' || bloodBankOnly || urgentOnly) && (
            <button className="btn-ghost" onClick={clearFilters} style={{ fontSize: '13px' }}>Clear All ×</button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="hosp-results-info">
        Showing {filtered.length} of {hospitals.length} hospitals
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" /><p className="loading-text">Loading hospitals...</p>
        </div>
      ) : (
        <div className="hosp-grid">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon">🏥</div>
              <h3>No hospitals found</h3>
              <p>Try different search terms or remove some filters.</p>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : filtered.map(h => (
            <div key={h.id} className="hosp-card" onClick={() => setSelectedHospital(h)}>
              <div className="hosp-card-top">
                <div className="hosp-icon">🏥</div>
                <div className="hosp-card-main">
                  <div className="hosp-name">{h.name}</div>
                  <div className="hosp-location">📍 {h.city}, {h.state}</div>
                  <div className="hosp-meta">
                    <span className={`badge ${h.type === 'Government' ? 'badge-info' : 'badge-success'}`}>{h.type}</span>
                    {h.bloodBank && <span className="badge badge-red">🩸 Blood Bank</span>}
                    {h.urgentNeed?.length > 0 && <span className="badge badge-danger">⚡ Urgent</span>}
                  </div>
                </div>
                <div className="hosp-rating">
                  <span className="rating-star">★</span>
                  <span className="rating-val">{h.rating}</span>
                </div>
              </div>

              {h.urgentNeed?.length > 0 && (
                <div className="hosp-urgent-strip">
                  <span className="urgent-label">⚡ Urgent need:</span>
                  <div className="urgent-types">
                    {h.urgentNeed.map(bt => (
                      <span key={bt} className="blood-badge critical" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{bt}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="hosp-stats-row">
                <div className="hosp-mini-stat">
                  <span className="hms-val">{(h.beds || 0).toLocaleString()}</span>
                  <span className="hms-label">Beds</span>
                </div>
                <div className="hosp-mini-stat">
                  <span className="hms-val">{h.established}</span>
                  <span className="hms-label">Est.</span>
                </div>
                <div className="hosp-mini-stat">
                  <span className="hms-val">{(h.totalDonors || 0).toLocaleString()}</span>
                  <span className="hms-label">Donors</span>
                </div>
              </div>

              <div className="hosp-card-footer">
                <span className="hosp-speciality">🔬 {h.speciality}</span>
                <button className="btn-primary" style={{ fontSize: '12px', padding: '7px 14px' }}
                  onClick={e => { e.stopPropagation(); window.open(`tel:${h.contact}`); }}>
                  📞 Call
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hospital detail modal */}
      {selectedHospital && (
        <div className="modal-overlay" onClick={() => setSelectedHospital(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedHospital.name}</h2>
              <button className="modal-close" onClick={() => setSelectedHospital(null)}>×</button>
            </div>
            <div className="hosp-detail-content">
              <div className="hosp-detail-row">
                <span>📍 Address</span>
                <strong>{selectedHospital.address}, {selectedHospital.city}</strong>
              </div>
              <div className="hosp-detail-row">
                <span>📞 Contact</span>
                <strong style={{ color: 'var(--info)' }}>{selectedHospital.contact}</strong>
              </div>
              <div className="hosp-detail-row">
                <span>🏥 Type</span>
                <strong>{selectedHospital.type} Hospital</strong>
              </div>
              <div className="hosp-detail-row">
                <span>🔬 Speciality</span>
                <strong>{selectedHospital.speciality}</strong>
              </div>
              <div className="hosp-detail-row">
                <span>🛏 Beds</span>
                <strong>{selectedHospital.beds?.toLocaleString()}</strong>
              </div>
              <div className="hosp-detail-row">
                <span>⭐ Rating</span>
                <strong>{selectedHospital.rating} / 5.0</strong>
              </div>
              {selectedHospital.urgentNeed?.length > 0 && (
                <div className="hosp-detail-urgent">
                  <span>⚡ Urgent Blood Need:</span>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {selectedHospital.urgentNeed.map(bt => (
                      <div key={bt} className="blood-badge critical">{bt}</div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn-outline" style={{ flex: 1 }}
                  onClick={() => navigate(`/map?hospital=${selectedHospital.id}`)}>
                  📍 View on Map
                </button>
                <button className="btn-primary" style={{ flex: 2 }}
                  onClick={() => navigate('/blood-request')}>
                  Request Blood Here →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}