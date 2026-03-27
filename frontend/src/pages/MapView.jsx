import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// ── Import Leaflet CSS from local node_modules (no CDN, no tracking blocks) ──
import 'leaflet/dist/leaflet.css';
import './MapView.css';

const BLOOD_TYPES = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DEMO_HOSPITALS = [
  { id:1, name:'AIIMS New Delhi',     lat:28.5672, lng:77.2100, urgentNeed:['O-'], bloodTypes:['O+','O-','A+'], city:'Delhi',       contact:'011-26588500', beds:2478 },
  { id:2, name:'Safdarjung Hospital', lat:28.5693, lng:77.2044, urgentNeed:[],     bloodTypes:['A+','B+','AB+'],city:'Delhi',       contact:'011-26707444', beds:1531 },
  { id:3, name:'Apollo Hospital',     lat:28.5355, lng:77.2837, urgentNeed:['A-'], bloodTypes:['B-','A-'],      city:'Delhi',       contact:'011-71791090', beds:695  },
  { id:4, name:'KEM Hospital',        lat:19.0038, lng:72.8412, urgentNeed:['B+'], bloodTypes:['O+','B+'],      city:'Mumbai',      contact:'022-24107000', beds:1791 },
  { id:5, name:'KIMS Hospital',       lat:20.3547, lng:85.8245, urgentNeed:[],     bloodTypes:['O+','A+','B+'], city:'Bhubaneswar', contact:'0674-3011000', beds:850  },
  { id:6, name:'NIMHANS',             lat:12.9411, lng:77.5955, urgentNeed:[],     bloodTypes:['A+','O+'],      city:'Bangalore',   contact:'080-46110007', beds:1600 },
];

const DEMO_DONORS = [
  { id:101, name:'Rahul K.',  lat:28.5790, lng:77.2050, bloodType:'O+',  lastDonated:'3 months ago', available:true  },
  { id:102, name:'Priya S.',  lat:28.5620, lng:77.2200, bloodType:'A-',  lastDonated:'6 months ago', available:true  },
  { id:103, name:'Arjun M.',  lat:28.5700, lng:77.1900, bloodType:'B+',  lastDonated:'4 months ago', available:true  },
  { id:104, name:'Anita R.',  lat:28.5800, lng:77.2300, bloodType:'AB+', lastDonated:'5 months ago', available:false },
  { id:105, name:'Vikram T.', lat:28.5550, lng:77.2100, bloodType:'O-',  lastDonated:'2 months ago', available:true  },
];

const DEMO_CAMPS = [
  { id:201, name:'Red Cross Camp',  lat:28.5750, lng:77.2150, date:'Dec 28, 2025', time:'9AM–5PM',  expectedDonors:200 },
  { id:202, name:'NSS Blood Drive', lat:28.5600, lng:77.2000, date:'Dec 30, 2025', time:'10AM–4PM', expectedDonors:150 },
];

const makeIcon = (L, color, emoji) =>
  L.divIcon({
    html:`<div style="background:${color};width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:15px;display:block;line-height:28px;text-align:center">${emoji}</span></div>`,
    className:'', iconSize:[34,34], iconAnchor:[17,34], popupAnchor:[0,-36],
  });

export default function MapView() {
  const navigate    = useNavigate();
  const mapRef      = useRef(null);
  const mapInst     = useRef(null);
  const markersRef  = useRef([]);
  const didInit     = useRef(false);

  const [showHospitals, setShowHospitals] = useState(true);
  const [showDonors,    setShowDonors]    = useState(true);
  const [showCamps,     setShowCamps]     = useState(true);
  const [filterBlood,   setFilterBlood]   = useState('All');
  const [userLoc,       setUserLoc]       = useState(null);
  const [mapReady,      setMapReady]      = useState(false);
  const [error,         setError]         = useState('');
  const [counts,        setCounts]        = useState({ hospitals:0, donors:0 });

  // ── init ────────────────────────────────────────────────────────
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    let L, tid;
    try { L = require('leaflet'); } catch {
      setError('Run: npm install leaflet'); return;
    }

    // Fix default marker icons pointing to missing webpack URLs
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl:       require('leaflet/dist/images/marker-icon.png'),
      shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
    });

    tid = setTimeout(() => {
      const el = mapRef.current;
      if (!el) return;

      // Wipe any stale Leaflet state on the DOM node
      if (el._leaflet_id != null) el._leaflet_id = undefined;

      let map;
      try {
        map = L.map(el, { center:[20.5937,78.9629], zoom:5, zoomControl:false });
      } catch (e) { setError('Map init: ' + e.message); return; }

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution:'© OpenStreetMap © CARTO', subdomains:'abcd', maxZoom:19,
      }).addTo(map);
      L.control.zoom({ position:'bottomright' }).addTo(map);

      mapInst.current = map;
      setMapReady(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords:{ latitude:lat, longitude:lng } }) => {
            setUserLoc({ lat, lng });
            map.setView([lat, lng], 12);
            L.marker([lat, lng], {
              icon: L.divIcon({
                html:`<div style="width:13px;height:13px;background:#3b82f6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 5px rgba(59,130,246,.3)"></div>`,
                className:'', iconSize:[13,13], iconAnchor:[7,7],
              }),
            }).addTo(map).bindPopup('<b>📍 Your Location</b>');
          },
          () => map.setView([28.6139,77.2090], 11)
        );
      } else {
        map.setView([28.6139,77.2090], 11);
      }
    }, 100);

    return () => {
      clearTimeout(tid);
      if (mapInst.current) { try { mapInst.current.remove(); } catch (_){} mapInst.current = null; }
      if (mapRef.current)  mapRef.current._leaflet_id = undefined;
      didInit.current = false;
    };
  }, []);

  // ── markers ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInst.current) return;
    let L; try { L = require('leaflet'); } catch { return; }

    markersRef.current.forEach(m => { try { m.remove(); } catch (_){} });
    markersRef.current = [];
    const map = mapInst.current;

    if (showHospitals) DEMO_HOSPITALS.forEach(h => {
      const urgent = h.urgentNeed?.length > 0;
      markersRef.current.push(
        L.marker([h.lat,h.lng], { icon: makeIcon(L, urgent?'#ef4444':'#3b82f6', '🏥') })
         .addTo(map)
         .bindPopup(`<div style="font-family:sans-serif;min-width:190px"><b style="font-size:13px">${h.name}</b><div style="color:#888;font-size:12px;margin:4px 0">📍 ${h.city} · 🛏 ${h.beds} beds</div>${urgent?`<div style="color:#ef4444;font-size:12px;font-weight:600">⚡ Urgent: ${h.urgentNeed.join(', ')}</div>`:''}<div style="font-size:12px;margin-top:4px">Available: ${h.bloodTypes?.join(', ')}</div><div style="font-size:12px;margin-top:4px">📞 ${h.contact}</div></div>`)
      );
    });

    if (showDonors) {
      const list = filterBlood==='All' ? DEMO_DONORS : DEMO_DONORS.filter(d=>d.bloodType===filterBlood);
      list.filter(d=>d.available).forEach(d => {
        markersRef.current.push(
          L.marker([d.lat,d.lng], { icon: makeIcon(L,'#22c55e','🩸') })
           .addTo(map)
           .bindPopup(`<div style="font-family:sans-serif"><b style="font-size:13px">${d.name}</b><div style="color:#e31b23;font-size:17px;font-weight:700;margin:3px 0">${d.bloodType}</div><div style="color:#888;font-size:12px">Last donated: ${d.lastDonated}</div><div style="color:#22c55e;font-size:12px;font-weight:600;margin-top:3px">✅ Available</div></div>`)
        );
      });
    }

    if (showCamps) DEMO_CAMPS.forEach(c => {
      markersRef.current.push(
        L.marker([c.lat,c.lng], { icon: makeIcon(L,'#f59e0b','⛺') })
         .addTo(map)
         .bindPopup(`<div style="font-family:sans-serif"><b style="font-size:13px">${c.name}</b><div style="color:#888;font-size:12px">📅 ${c.date} · ⏰ ${c.time}</div><div style="color:#f59e0b;font-size:12px;font-weight:600;margin-top:3px">👥 ${c.expectedDonors} expected</div></div>`)
      );
    });

    setCounts({ hospitals:DEMO_HOSPITALS.length, donors:DEMO_DONORS.filter(d=>d.available).length });
  }, [mapReady, showHospitals, showDonors, showCamps, filterBlood]);

  const flyTo = (lat, lng, z=14) => { if (mapInst.current) mapInst.current.setView([lat,lng],z); };

  return (
    <div className="map-page">
      <div className="map-header">
        <div>
          <h1 className="page-title">📍 Live Donor Map</h1>
          <p className="page-subtitle">Find nearby donors, hospitals and donation camps in real time</p>
        </div>
        <div className="map-legend">
          <span className="legend-item"><span className="legend-dot" style={{background:'#ef4444'}}/>Hospital (Urgent)</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#3b82f6'}}/>Hospital</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#22c55e'}}/>Donor</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#f59e0b'}}/>Camp</span>
        </div>
      </div>

      <div className="map-layout">
        <div className="map-sidebar">
          <div className="map-stats">
            <div className="map-stat-card"><div className="map-stat-val">{counts.hospitals}</div><div className="map-stat-label">Nearby Hospitals</div></div>
            <div className="map-stat-card"><div className="map-stat-val">{counts.donors}</div><div className="map-stat-label">Available Donors</div></div>
          </div>

          <div className="map-panel">
            <h3 className="map-panel-title">Map Layers</h3>
            {[
              {label:'🏥 Hospitals', val:showHospitals, set:setShowHospitals},
              {label:'🩸 Donors',    val:showDonors,    set:setShowDonors},
              {label:'⛺ Camps',     val:showCamps,     set:setShowCamps},
            ].map(item=>(
              <label key={item.label} className="map-toggle">
                <input type="checkbox" checked={item.val} onChange={e=>item.set(e.target.checked)}/>
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <div className="map-panel">
            <h3 className="map-panel-title">Filter Donors by Blood</h3>
            <div className="blood-filter-grid">
              {BLOOD_TYPES.map(bt=>(
                <button key={bt} className={`blood-filter-btn ${filterBlood===bt?'active':''}`} onClick={()=>setFilterBlood(bt)}>{bt}</button>
              ))}
            </div>
          </div>

          <div className="map-panel">
            <h3 className="map-panel-title">Nearby Hospitals</h3>
            <div className="nearby-list">
              {DEMO_HOSPITALS.map(h=>(
                <button key={h.id} className="nearby-item" onClick={()=>flyTo(h.lat,h.lng)}>
                  <span className="nearby-icon">🏥</span>
                  <div className="nearby-info">
                    <div className="nearby-name">{h.name}</div>
                    <div className="nearby-sub">{h.city}</div>
                  </div>
                  {h.urgentNeed?.length>0 && <span className="badge badge-danger" style={{fontSize:'10px'}}>Urgent</span>}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" style={{width:'100%'}} onClick={()=>navigate('/blood-request')}>
            🩸 Request Blood Now
          </button>
        </div>

        <div className="map-container-wrap">
          {error ? (
            <div className="map-error">
              <div style={{fontSize:48,marginBottom:16}}>🗺️</div>
              <h3>Map Not Available</h3><p>{error}</p>
            </div>
          ) : (
            <>
              <div ref={mapRef} className="map-canvas"/>
              <div className="map-controls">
                <button className="map-ctrl-btn" onClick={()=>userLoc&&flyTo(userLoc.lat,userLoc.lng,13)}>📍</button>
                <button className="map-ctrl-btn" onClick={()=>navigate('/hospitals-public')}>🏥</button>
                <button className="map-ctrl-btn" onClick={()=>navigate('/donation-camps')}>⛺</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}