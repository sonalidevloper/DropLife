import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MapView.css';

// Dynamic Leaflet import to avoid SSR issues
let L;
try { L = require('leaflet'); } catch(e) {}

// Fix Leaflet default marker icon issue
const fixLeafletIcons = () => {
  if (!L) return;
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

// Custom icons
const createIcon = (color, emoji) => {
  if (!L) return null;
  return L.divIcon({
    html: `<div style="
      background:${color};
      width:36px;height:36px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 3px 12px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:16px;display:block;text-align:center;line-height:30px;">${emoji}</span></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
};

const DEMO_HOSPITALS = [
  { id: 1, name: 'AIIMS Delhi', lat: 28.5672, lng: 77.2100, type: 'hospital', bloodTypes: ['O+','O-','A+'], urgentNeed: ['O-'], city: 'Delhi', contact: '011-26588500', beds: 2478 },
  { id: 2, name: 'Safdarjung Hospital', lat: 28.5693, lng: 77.2044, type: 'hospital', bloodTypes: ['A+','B+','AB+'], urgentNeed: [], city: 'Delhi', contact: '011-26707444', beds: 1531 },
  { id: 3, name: 'Apollo Hospital Delhi', lat: 28.5355, lng: 77.2837, type: 'hospital', bloodTypes: ['B-','A-'], urgentNeed: ['A-'], city: 'Delhi', contact: '011-71791090', beds: 695 },
  { id: 4, name: 'KEM Hospital', lat: 19.0038, lng: 72.8412, type: 'hospital', bloodTypes: ['O+','B+'], urgentNeed: ['B+'], city: 'Mumbai', contact: '022-24107000', beds: 1791 },
  { id: 5, name: 'KIMS Hospital', lat: 20.3547, lng: 85.8245, type: 'hospital', bloodTypes: ['O+','A+','B+'], urgentNeed: [], city: 'Bhubaneswar', contact: '0674-3011000', beds: 850 },
  { id: 6, name: 'NIMHANS', lat: 12.9411, lng: 77.5955, type: 'hospital', bloodTypes: ['A+','O+'], urgentNeed: [], city: 'Bangalore', contact: '080-46110007', beds: 1600 },
];

const DEMO_DONORS = [
  { id: 101, name: 'Rahul K.', lat: 28.5790, lng: 77.2050, bloodType: 'O+', lastDonated: '3 months ago', available: true },
  { id: 102, name: 'Priya S.', lat: 28.5620, lng: 77.2200, bloodType: 'A-', lastDonated: '6 months ago', available: true },
  { id: 103, name: 'Arjun M.', lat: 28.5700, lng: 77.1900, bloodType: 'B+', lastDonated: '4 months ago', available: true },
  { id: 104, name: 'Anita R.', lat: 28.5800, lng: 77.2300, bloodType: 'AB+', lastDonated: '5 months ago', available: false },
  { id: 105, name: 'Vikram T.', lat: 28.5550, lng: 77.2100, bloodType: 'O-', lastDonated: '2 months ago', available: true },
];

const DEMO_CAMPS = [
  { id: 201, name: 'Red Cross Camp', lat: 28.5750, lng: 77.2150, date: 'Dec 28, 2025', time: '9AM-5PM', expectedDonors: 200, city: 'Delhi' },
  { id: 202, name: 'NSS Blood Drive', lat: 28.5600, lng: 77.2000, date: 'Dec 30, 2025', time: '10AM-4PM', expectedDonors: 150, city: 'Delhi' },
];

const BLOOD_TYPES = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function MapView() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [showHospitals, setShowHospitals] = useState(true);
  const [showDonors, setShowDonors] = useState(true);
  const [showCamps, setShowCamps] = useState(true);
  const [filterBlood, setFilterBlood] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [nearbyCount, setNearbyCount] = useState({ hospitals: 0, donors: 0 });

  // Initialize Leaflet map
  useEffect(() => {
    if (!L) {
      setError('Map library not loaded. Run: npm install leaflet react-leaflet');
      return;
    }

    if (mapInstanceRef.current) return;

    try {
      fixLeafletIcons();

      // Add Leaflet CSS dynamically
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Wait for CSS then init map
      setTimeout(() => {
        if (!mapRef.current) return;
        const map = L.map(mapRef.current, {
          center: [20.5937, 78.9629], // India center
          zoom: 5,
          zoomControl: false,
        });

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        // Custom zoom control
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);

        // Try geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => {
              const { latitude, longitude } = pos.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              map.setView([latitude, longitude], 12);

              // User marker
              L.marker([latitude, longitude], {
                icon: L.divIcon({
                  html: `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.3)"></div>`,
                  className: '', iconSize: [16, 16], iconAnchor: [8, 8]
                })
              }).addTo(map).bindPopup('<b>📍 Your Location</b>');
            },
            () => { map.setView([28.6139, 77.2090], 11); } // Default to Delhi
          );
        } else {
          map.setView([28.6139, 77.2090], 11);
        }
      }, 200);
    } catch (err) {
      setError('Failed to initialize map: ' + err.message);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady || !L) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Hospital markers
    if (showHospitals) {
      DEMO_HOSPITALS.forEach(h => {
        const hasUrgent = h.urgentNeed?.length > 0;
        const marker = L.marker([h.lat, h.lng], {
          icon: createIcon(hasUrgent ? '#ef4444' : '#3b82f6', '🏥')
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:200px">
            <div style="font-weight:700;font-size:14px;margin-bottom:6px">${h.name}</div>
            <div style="color:#888;font-size:12px;margin-bottom:8px">📍 ${h.city} · 🛏 ${h.beds} beds</div>
            ${hasUrgent ? `<div style="color:#ef4444;font-size:12px;font-weight:600;margin-bottom:8px">⚡ Urgent: ${h.urgentNeed.join(', ')}</div>` : ''}
            <div style="color:#555;font-size:12px">Available: ${h.bloodTypes?.join(', ')}</div>
            <div style="margin-top:8px;font-size:12px">📞 ${h.contact}</div>
          </div>
        `);
        markersRef.current.push(marker);
      });
    }

    // Donor markers
    if (showDonors) {
      const donors = filterBlood === 'All' ? DEMO_DONORS : DEMO_DONORS.filter(d => d.bloodType === filterBlood);
      donors.forEach(d => {
        if (!d.available) return;
        const marker = L.marker([d.lat, d.lng], {
          icon: createIcon('#22c55e', '🩸')
        }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif">
            <div style="font-weight:700;font-size:14px">${d.name}</div>
            <div style="color:#e31b23;font-size:18px;font-weight:700;margin:4px 0">${d.bloodType}</div>
            <div style="color:#888;font-size:12px">Last donated: ${d.lastDonated}</div>
            <div style="color:#22c55e;font-size:12px;font-weight:600;margin-top:4px">✅ Available</div>
          </div>
        `);
        markersRef.current.push(marker);
      });
    }

    // Camp markers
    if (showCamps) {
      DEMO_CAMPS.forEach(c => {
        const marker = L.marker([c.lat, c.lng], {
          icon: createIcon('#f59e0b', '⛺')
        }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif">
            <div style="font-weight:700;font-size:14px">${c.name}</div>
            <div style="color:#888;font-size:12px">📅 ${c.date} · ⏰ ${c.time}</div>
            <div style="color:#f59e0b;font-size:12px;font-weight:600;margin-top:4px">👥 ${c.expectedDonors} expected donors</div>
          </div>
        `);
        markersRef.current.push(marker);
      });
    }

    setNearbyCount({ hospitals: DEMO_HOSPITALS.length, donors: DEMO_DONORS.filter(d => d.available).length });
  }, [mapReady, showHospitals, showDonors, showCamps, filterBlood]);

  const centerOnUser = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }
  };

  return (
    <div className="map-page">
      {/* Header */}
      <div className="map-header">
        <div>
          <h1 className="page-title">📍 Live Donor Map</h1>
          <p className="page-subtitle">Find nearby donors, hospitals and donation camps in real time</p>
        </div>
        <div className="map-legend">
          <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} />🏥 Hospital (Urgent)</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }} />🏥 Hospital</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }} />🩸 Donor</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} />⛺ Camp</span>
        </div>
      </div>

      <div className="map-layout">
        {/* Sidebar */}
        <div className="map-sidebar">
          {/* Nearby stats */}
          <div className="map-stats">
            <div className="map-stat-card">
              <div className="map-stat-val">{nearbyCount.hospitals}</div>
              <div className="map-stat-label">Nearby Hospitals</div>
            </div>
            <div className="map-stat-card">
              <div className="map-stat-val">{nearbyCount.donors}</div>
              <div className="map-stat-label">Available Donors</div>
            </div>
          </div>

          {/* Layer toggles */}
          <div className="map-panel">
            <h3 className="map-panel-title">Map Layers</h3>
            <label className="map-toggle">
              <input type="checkbox" checked={showHospitals} onChange={e => setShowHospitals(e.target.checked)} />
              <span>🏥 Hospitals</span>
            </label>
            <label className="map-toggle">
              <input type="checkbox" checked={showDonors} onChange={e => setShowDonors(e.target.checked)} />
              <span>🩸 Donors</span>
            </label>
            <label className="map-toggle">
              <input type="checkbox" checked={showCamps} onChange={e => setShowCamps(e.target.checked)} />
              <span>⛺ Donation Camps</span>
            </label>
          </div>

          {/* Blood type filter */}
          <div className="map-panel">
            <h3 className="map-panel-title">Filter Donors by Blood</h3>
            <div className="blood-filter-grid">
              {BLOOD_TYPES.map(bt => (
                <button key={bt}
                  className={`blood-filter-btn ${filterBlood === bt ? 'active' : ''}`}
                  onClick={() => setFilterBlood(bt)}>
                  {bt}
                </button>
              ))}
            </div>
          </div>

          {/* Nearby hospitals list */}
          <div className="map-panel">
            <h3 className="map-panel-title">Nearby Hospitals</h3>
            <div className="nearby-list">
              {DEMO_HOSPITALS.map(h => (
                <button key={h.id} className="nearby-item"
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([h.lat, h.lng], 14);
                    }
                  }}>
                  <span className="nearby-icon">🏥</span>
                  <div className="nearby-info">
                    <div className="nearby-name">{h.name}</div>
                    <div className="nearby-sub">{h.city}</div>
                  </div>
                  {h.urgentNeed?.length > 0 && <span className="badge badge-danger" style={{ fontSize: '10px' }}>Urgent</span>}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button className="btn-primary" style={{ width: '100%' }}
            onClick={() => navigate('/blood-request')}>
            🩸 Request Blood Now
          </button>
        </div>

        {/* Map container */}
        <div className="map-container-wrap">
          {error ? (
            <div className="map-error">
              <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
              <h3>Map Not Available</h3>
              <p>{error}</p>
              <div style={{ marginTop: 16, background: 'var(--bg-secondary)', padding: '12px 20px', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                npm install leaflet react-leaflet
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>After installing, restart your dev server.</p>
            </div>
          ) : (
            <>
              <div ref={mapRef} className="map-canvas" />
              {/* Map controls */}
              <div className="map-controls">
                <button className="map-ctrl-btn" onClick={centerOnUser} title="My Location">📍</button>
                <button className="map-ctrl-btn" onClick={() => navigate('/hospitals-public')} title="All Hospitals">🏥</button>
                <button className="map-ctrl-btn" onClick={() => navigate('/donation-camps')} title="All Camps">⛺</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}