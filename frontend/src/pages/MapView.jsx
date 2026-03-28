import React, { useEffect, useRef, useState, useCallback } from "react";

// ─── Leaflet loaded via CDN to avoid import issues ───────────────────────────
const loadLeaflet = () =>
  new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_HOSPITALS = [
  { _id: "h1", name: "AIIMS Bhubaneswar", lat: 20.2961, lng: 85.8245, city: "Bhubaneswar", phone: "0674-2476789", bloodAvailable: ["A+", "B+", "O+", "AB+"], type: "hospital" },
  { _id: "h2", name: "SCB Medical College", lat: 20.4625, lng: 85.8830, city: "Cuttack", phone: "0671-2414004", bloodAvailable: ["A+", "B+", "O-"], type: "hospital" },
  { _id: "h3", name: "Capital Hospital", lat: 20.2699, lng: 85.8387, city: "Bhubaneswar", phone: "0674-2391983", bloodAvailable: ["A-", "B+", "AB-"], type: "hospital" },
  { _id: "h4", name: "SUM Hospital", lat: 20.2521, lng: 85.7954, city: "Bhubaneswar", phone: "0674-2359355", bloodAvailable: ["O+", "B-"], type: "hospital" },
  { _id: "h5", name: "Kalinga Hospital", lat: 20.2784, lng: 85.8137, city: "Bhubaneswar", phone: "0674-2557776", bloodAvailable: ["A+", "B+", "O+", "A-", "AB+"], type: "hospital" },
];

const MOCK_CAMPS = [
  { _id: "c1", name: "Red Cross Donation Camp", lat: 20.2830, lng: 85.8420, date: "2025-08-15", organizer: "Red Cross India", type: "camp" },
  { _id: "c2", name: "NSS Blood Drive", lat: 20.4700, lng: 85.8790, date: "2025-08-20", organizer: "NSS Unit KIIT", type: "camp" },
  { _id: "c3", name: "Corporate Donation Drive", lat: 20.2650, lng: 85.8200, date: "2025-08-25", organizer: "Infosys CSR", type: "camp" },
];

const MOCK_DONORS = [
  { _id: "d1", name: "Donor Near AIIMS", lat: 20.2980, lng: 85.8260, bloodGroup: "O+", available: true, type: "donor" },
  { _id: "d2", name: "Donor Near SCB", lat: 20.4640, lng: 85.8810, bloodGroup: "A+", available: true, type: "donor" },
  { _id: "d3", name: "Donor in Cuttack", lat: 20.4600, lng: 85.8800, bloodGroup: "B-", available: false, type: "donor" },
];

// ─── SVG Icons as data URIs ───────────────────────────────────────────────────
const HOSPITAL_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50">
  <filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter>
  <path d="M20 48 L4 24 Q4 2 20 2 Q36 2 36 24 Z" fill="#dc2626" filter="url(#sh)"/>
  <circle cx="20" cy="20" r="12" fill="white"/>
  <text x="20" y="26" text-anchor="middle" font-size="16" fill="#dc2626">🏥</text>
</svg>`;

const CAMP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50">
  <filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter>
  <path d="M20 48 L4 24 Q4 2 20 2 Q36 2 36 24 Z" fill="#2563eb" filter="url(#sh)"/>
  <circle cx="20" cy="20" r="12" fill="white"/>
  <text x="20" y="26" text-anchor="middle" font-size="16" fill="#2563eb">⛺</text>
</svg>`;

const DONOR_ICON_SVG = (available) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50">
  <filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter>
  <path d="M20 48 L4 24 Q4 2 20 2 Q36 2 36 24 Z" fill="${available ? "#16a34a" : "#9ca3af"}" filter="url(#sh)"/>
  <circle cx="20" cy="20" r="12" fill="white"/>
  <text x="20" y="26" text-anchor="middle" font-size="16" fill="${available ? "#16a34a" : "#9ca3af"}">🩸</text>
</svg>`;

const svgToDataUrl = (svg) => `data:image/svg+xml;base64,${btoa(svg)}`;

export default function MapView() {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const [L, setL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showCamps, setShowCamps] = useState(true);
  const [showDonors, setShowDonors] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapStyle, setMapStyle] = useState("street");

  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const MAP_TILES = {
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attr: "© OpenStreetMap contributors",
      label: "Street",
    },
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attr: "© CARTO",
      label: "Dark",
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attr: "© Esri",
      label: "Satellite",
    },
  };

  useEffect(() => {
    loadLeaflet()
      .then((leaflet) => {
        setL(leaflet);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load map library. Please check your internet connection.");
        setLoading(false);
      });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !mapRef.current || leafletMapRef.current) return;
    const map = L.map(mapRef.current, {
      center: [20.2961, 85.8245],
      zoom: 11,
      zoomControl: true,
    });
    L.tileLayer(MAP_TILES[mapStyle].url, {
      attribution: MAP_TILES[mapStyle].attr,
      maxZoom: 19,
    }).addTo(map);
    leafletMapRef.current = map;
    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [L]);

  // Update tile layer when style changes
  useEffect(() => {
    if (!leafletMapRef.current || !L) return;
    leafletMapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) leafletMapRef.current.removeLayer(layer);
    });
    L.tileLayer(MAP_TILES[mapStyle].url, {
      attribution: MAP_TILES[mapStyle].attr,
      maxZoom: 19,
    }).addTo(leafletMapRef.current);
  }, [mapStyle, L]);

  // Re-render markers when filters change
  const renderMarkers = useCallback(() => {
    if (!L || !leafletMapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const makeIcon = (svgStr) =>
      L.icon({
        iconUrl: svgToDataUrl(svgStr),
        iconSize: [36, 46],
        iconAnchor: [18, 46],
        popupAnchor: [0, -46],
      });

    const searchLower = searchQuery.toLowerCase();

    if (showHospitals) {
      MOCK_HOSPITALS.filter((h) => {
        const groupMatch = selectedBloodGroup === "all" || h.bloodAvailable.includes(selectedBloodGroup);
        const searchMatch = !searchQuery || h.name.toLowerCase().includes(searchLower) || h.city.toLowerCase().includes(searchLower);
        return groupMatch && searchMatch;
      }).forEach((h) => {
        const marker = L.marker([h.lat, h.lng], { icon: makeIcon(HOSPITAL_ICON_SVG) })
          .addTo(leafletMapRef.current)
          .bindPopup(`
            <div style="font-family:Poppins,sans-serif;min-width:200px">
              <div style="font-weight:800;font-size:1rem;color:#dc2626;margin-bottom:6px">🏥 ${h.name}</div>
              <div style="color:#666;font-size:0.85rem">📍 ${h.city}</div>
              <div style="color:#666;font-size:0.85rem">📞 ${h.phone}</div>
              <div style="margin-top:8px">
                <strong style="font-size:0.8rem">Blood Available:</strong>
                <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px">
                  ${h.bloodAvailable.map((g) => `<span style="background:#fee2e2;color:#dc2626;border-radius:4px;padding:2px 6px;font-size:0.75rem;font-weight:700">${g}</span>`).join("")}
                </div>
              </div>
              <button onclick="window.location='/hospitals/${h._id}'" style="margin-top:10px;background:#dc2626;color:white;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:0.8rem;font-weight:600">View Hospital →</button>
            </div>
          `);
        markersRef.current.push(marker);
      });
    }

    if (showCamps) {
      MOCK_CAMPS.filter((c) => {
        return !searchQuery || c.name.toLowerCase().includes(searchLower) || c.organizer.toLowerCase().includes(searchLower);
      }).forEach((c) => {
        const marker = L.marker([c.lat, c.lng], { icon: makeIcon(CAMP_ICON_SVG) })
          .addTo(leafletMapRef.current)
          .bindPopup(`
            <div style="font-family:Poppins,sans-serif;min-width:200px">
              <div style="font-weight:800;font-size:1rem;color:#2563eb;margin-bottom:6px">⛺ ${c.name}</div>
              <div style="color:#666;font-size:0.85rem">📅 ${new Date(c.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
              <div style="color:#666;font-size:0.85rem">🏢 ${c.organizer}</div>
              <button style="margin-top:10px;background:#2563eb;color:white;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:0.8rem;font-weight:600">Register →</button>
            </div>
          `);
        markersRef.current.push(marker);
      });
    }

    if (showDonors) {
      MOCK_DONORS.filter((d) => {
        const groupMatch = selectedBloodGroup === "all" || d.bloodGroup === selectedBloodGroup;
        const searchMatch = !searchQuery || d.bloodGroup.includes(searchQuery.toUpperCase());
        return groupMatch && searchMatch;
      }).forEach((d) => {
        const marker = L.marker([d.lat, d.lng], { icon: makeIcon(DONOR_ICON_SVG(d.available)) })
          .addTo(leafletMapRef.current)
          .bindPopup(`
            <div style="font-family:Poppins,sans-serif;min-width:160px">
              <div style="font-weight:800;font-size:1rem;color:${d.available ? "#16a34a" : "#9ca3af"};margin-bottom:6px">🩸 ${d.name}</div>
              <div style="font-size:0.85rem">Blood Group: <strong>${d.bloodGroup}</strong></div>
              <div style="margin-top:6px">
                <span style="background:${d.available ? "#dcfce7" : "#f3f4f6"};color:${d.available ? "#16a34a" : "#9ca3af"};border-radius:20px;padding:2px 10px;font-size:0.8rem;font-weight:700">
                  ${d.available ? "✅ Available" : "⛔ Unavailable"}
                </span>
              </div>
            </div>
          `);
        markersRef.current.push(marker);
      });
    }

    if (userLocation) {
      const pulsingIcon = L.divIcon({
        html: `<div style="width:20px;height:20px;background:#4ade80;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(74,222,128,0.4);animation:pulse 1.5s infinite"></div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: pulsingIcon })
        .addTo(leafletMapRef.current)
        .bindPopup("📍 Your Location");
      markersRef.current.push(userMarker);
    }
  }, [L, showHospitals, showCamps, showDonors, selectedBloodGroup, searchQuery, userLocation]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  const locateUser = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        if (leafletMapRef.current) leafletMapRef.current.setView([loc.lat, loc.lng], 13);
      },
      () => alert("Could not get your location")
    );
  };

  const styles = {
    wrapper: {
      minHeight: "100vh",
      background: "#0f172a",
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      color: "#fff",
    },
    header: {
      background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
      padding: "1.5rem 2rem",
      display: "flex",
      alignItems: "center",
      gap: "1.5rem",
      flexWrap: "wrap",
    },
    headerTitle: { fontSize: "1.5rem", fontWeight: 800, margin: 0 },
    searchBar: {
      flex: 1,
      minWidth: 220,
      background: "rgba(255,255,255,0.15)",
      border: "1px solid rgba(255,255,255,0.25)",
      borderRadius: "100px",
      padding: "0.6rem 1.5rem",
      color: "#fff",
      fontSize: "0.95rem",
      outline: "none",
    },
    controlsBar: {
      padding: "1rem 1.5rem",
      display: "flex",
      gap: "0.75rem",
      flexWrap: "wrap",
      alignItems: "center",
      background: "#1e293b",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    filterBtn: (active) => ({
      padding: "0.5rem 1rem",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "0.85rem",
      background: active ? "rgba(220,38,38,0.7)" : "rgba(255,255,255,0.08)",
      color: "#fff",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "0.3rem",
    }),
    select: {
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "10px",
      padding: "0.5rem 1rem",
      color: "#fff",
      fontSize: "0.85rem",
      cursor: "pointer",
    },
    mapContainer: { position: "relative" },
    map: { height: "calc(100vh - 160px)", width: "100%" },
    mapControls: {
      position: "absolute",
      top: 12,
      right: 12,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    mapBtn: {
      background: "rgba(15,23,42,0.9)",
      border: "1px solid rgba(255,255,255,0.15)",
      color: "#fff",
      borderRadius: "10px",
      padding: "0.6rem 1rem",
      cursor: "pointer",
      fontSize: "0.85rem",
      fontWeight: 600,
      backdropFilter: "blur(10px)",
      whiteSpace: "nowrap",
    },
    legend: {
      position: "absolute",
      bottom: 30,
      left: 12,
      zIndex: 1000,
      background: "rgba(15,23,42,0.9)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      padding: "1rem",
      minWidth: 160,
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.82rem",
      marginBottom: "0.4rem",
    },
  };

  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 4px rgba(74,222,128,0.4)} 50%{box-shadow:0 0 0 8px rgba(74,222,128,0.1)} }
        .leaflet-popup-content-wrapper { border-radius: 12px !important; font-family: 'Poppins', sans-serif !important; }
        .leaflet-popup-tip { display: none; }
        input::placeholder { color: rgba(255,255,255,0.5); }
        select option { background: #1e293b; color: white; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>🗺️ DropLife Map</h2>
        <input
          style={styles.searchBar}
          placeholder="🔍 Search hospitals, camps, cities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Controls */}
      <div style={styles.controlsBar}>
        <button style={styles.filterBtn(showHospitals)} onClick={() => setShowHospitals(!showHospitals)}>
          🏥 Hospitals {showHospitals ? "✓" : "✗"}
        </button>
        <button style={styles.filterBtn(showCamps)} onClick={() => setShowCamps(!showCamps)}>
          ⛺ Camps {showCamps ? "✓" : "✗"}
        </button>
        <button style={styles.filterBtn(showDonors)} onClick={() => setShowDonors(!showDonors)}>
          🩸 Donors {showDonors ? "✓" : "✗"}
        </button>
        <select style={styles.select} value={selectedBloodGroup} onChange={(e) => setSelectedBloodGroup(e.target.value)}>
          <option value="all">All Blood Groups</option>
          {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select style={styles.select} value={mapStyle} onChange={(e) => setMapStyle(e.target.value)}>
          {Object.entries(MAP_TILES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <span style={{ marginLeft: "auto", opacity: 0.6, fontSize: "0.82rem" }}>
          {MOCK_HOSPITALS.length} hospitals · {MOCK_CAMPS.length} camps · {MOCK_DONORS.length} donors
        </span>
      </div>

      {/* Map */}
      <div style={styles.mapContainer}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
            <p>Loading map...</p>
          </div>
        )}
        {error && (
          <div style={{ position: "absolute", inset: 0, background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem" }}>⚠️</div>
            <h3 style={{ color: "#f87171" }}>Map Failed to Load</h3>
            <p style={{ opacity: 0.7, maxWidth: 400 }}>{error}</p>
            <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>Make sure you have an internet connection for the map tiles.</p>
          </div>
        )}
        <div ref={mapRef} style={styles.map} />

        {/* Map Controls */}
        <div style={styles.mapControls}>
          <button style={styles.mapBtn} onClick={locateUser} title="Find your location">
            📍 My Location
          </button>
          <button
            style={styles.mapBtn}
            onClick={() => leafletMapRef.current?.setView([20.2961, 85.8245], 11)}
          >
            🏠 Reset View
          </button>
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.6rem" }}>Legend</div>
          <div style={styles.legendItem}><span>🏥</span> Hospital</div>
          <div style={styles.legendItem}><span>⛺</span> Donation Camp</div>
          <div style={styles.legendItem}><span>🩸</span> Available Donor</div>
          <div style={styles.legendItem}><span style={{ color: "#9ca3af" }}>🩸</span> Unavailable Donor</div>
          <div style={styles.legendItem}><span style={{ background: "#4ade80", borderRadius: "50%", width: 14, height: 14, display: "inline-block" }}></span> You</div>
        </div>
      </div>
    </div>
  );
}