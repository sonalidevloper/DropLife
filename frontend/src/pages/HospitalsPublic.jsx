import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const MOCK_HOSPITALS = [
  {
    _id: "h1",
    name: "AIIMS Bhubaneswar",
    city: "Bhubaneswar",
    state: "Odisha",
    address: "Sijua, Patrapada, Bhubaneswar",
    phone: "0674-2476789",
    email: "bloodbank@aiimsbbs.edu.in",
    type: "Government",
    bloodAvailable: ["A+", "B+", "O+", "AB+", "A-"],
    totalStock: 125,
    rating: 4.8,
    verified: true,
    emergency: true,
    operatingHours: "24/7",
    website: "https://aiimsbhubaneswar.nic.in",
    lat: 20.2961,
    lng: 85.8245,
  },
  {
    _id: "h2",
    name: "SCB Medical College & Hospital",
    city: "Cuttack",
    state: "Odisha",
    address: "Manglabag, Cuttack",
    phone: "0671-2414004",
    email: "scbmch@odisha.gov.in",
    type: "Government",
    bloodAvailable: ["A+", "B+", "O+", "O-"],
    totalStock: 78,
    rating: 4.5,
    verified: true,
    emergency: true,
    operatingHours: "24/7",
    website: "",
    lat: 20.4625,
    lng: 85.8830,
  },
  {
    _id: "h3",
    name: "Capital Hospital",
    city: "Bhubaneswar",
    state: "Odisha",
    address: "Unit 6, Bhubaneswar",
    phone: "0674-2391983",
    email: "capitalhospital@odisha.gov.in",
    type: "Government",
    bloodAvailable: ["A+", "B+", "AB-"],
    totalStock: 45,
    rating: 4.2,
    verified: true,
    emergency: true,
    operatingHours: "24/7",
    website: "",
    lat: 20.2699,
    lng: 85.8387,
  },
  {
    _id: "h4",
    name: "SUM Hospital",
    city: "Bhubaneswar",
    state: "Odisha",
    address: "K8 Kalinga Nagar, Bhubaneswar",
    phone: "0674-2359355",
    email: "bloodbank@sumhospital.in",
    type: "Private",
    bloodAvailable: ["O+", "B+", "B-"],
    totalStock: 32,
    rating: 4.6,
    verified: true,
    emergency: false,
    operatingHours: "8 AM – 8 PM",
    website: "https://sumhospital.in",
    lat: 20.2521,
    lng: 85.7954,
  },
  {
    _id: "h5",
    name: "Kalinga Hospital",
    city: "Bhubaneswar",
    state: "Odisha",
    address: "Nayapalli, Bhubaneswar",
    phone: "0674-2557776",
    email: "bloodbank@kalingahospital.com",
    type: "Private",
    bloodAvailable: ["A+", "B+", "O+", "A-", "AB+", "O-"],
    totalStock: 165,
    rating: 4.7,
    verified: true,
    emergency: true,
    operatingHours: "24/7",
    website: "https://kalingahospital.com",
    lat: 20.2784,
    lng: 85.8137,
  },
  {
    _id: "h6",
    name: "Apollo Hospitals",
    city: "Bhubaneswar",
    state: "Odisha",
    address: "Plot No. 251, Sainik School Road",
    phone: "0674-6661066",
    email: "bloodbank@apollobbsr.com",
    type: "Private",
    bloodAvailable: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    totalStock: 210,
    rating: 4.9,
    verified: true,
    emergency: true,
    operatingHours: "24/7",
    website: "https://apollohospitals.com",
    lat: 20.2956,
    lng: 85.8498,
  },
  {
    _id: "h7",
    name: "HI-Tech Medical College",
    city: "Bhubaneswar",
    state: "Odisha",
    address: "Pandara, Bhubaneswar",
    phone: "0674-6646700",
    email: "blood@hi-tech.ac.in",
    type: "Private",
    bloodAvailable: ["A+", "O+", "B+"],
    totalStock: 55,
    rating: 4.1,
    verified: true,
    emergency: false,
    operatingHours: "9 AM – 6 PM",
    website: "",
    lat: 20.3200,
    lng: 85.8150,
  },
  {
    _id: "h8",
    name: "KIMS Hospital",
    city: "Bhubaneswar",
    state: "Odisha",
    address: "KIIT Road, Bhubaneswar",
    phone: "0674-6699999",
    email: "bloodbank@kiims.ac.in",
    type: "Private",
    bloodAvailable: ["AB+", "A+", "B+", "O+", "O-"],
    totalStock: 88,
    rating: 4.4,
    verified: false,
    emergency: true,
    operatingHours: "24/7",
    website: "",
    lat: 20.3541,
    lng: 85.8192,
  },
];

const CITIES = ["All Cities", "Bhubaneswar", "Cuttack"];
const TYPES = ["All Types", "Government", "Private"];

export default function HospitalsPublic() {
  const [hospitals, setHospitals] = useState([]);   const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState("grid");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5003/api"}/hospitals`);
        setHospitals(
  Array.isArray(data)
    ? data
    : (data?.data && data.data.length > 0)
      ? data.data
      : MOCK_HOSPITALS
);
        setHospitals(MOCK_HOSPITALS);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const startVoiceSearch = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported in your browser. Try Chrome.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      setSearchQuery(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, []);

  const filtered = hospitals
    .filter((h) => {
      const q = searchQuery.toLowerCase();
      const searchMatch = !searchQuery ||
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q);
      const cityMatch = selectedCity === "All Cities" || h.city === selectedCity;
      const typeMatch = selectedType === "All Types" || h.type === selectedType;
      const bloodMatch = selectedBloodGroup === "all" || h.bloodAvailable.includes(selectedBloodGroup);
      const emergencyMatch = !emergencyOnly || h.emergency;
      const verifiedMatch = !verifiedOnly || h.verified;
      return searchMatch && cityMatch && typeMatch && bloodMatch && emergencyMatch && verifiedMatch;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "stock") return b.totalStock - a.totalStock;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const s = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
    },
    hero: {
      background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
      padding: "3rem 2rem",
      textAlign: "center",
    },
    heroTitle: { fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 900, margin: 0 },
    heroSub: { opacity: 0.85, fontSize: "1rem", marginTop: "0.5rem" },
    statsBar: {
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "center",
      gap: "3rem",
      flexWrap: "wrap",
    },
    statItem: { textAlign: "center" },
    statNum: { fontSize: "1.5rem", fontWeight: 900, color: "#f87171" },
    statLabel: { fontSize: "0.75rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.06em" },
    container: { maxWidth: 1300, margin: "0 auto", padding: "2rem 1.5rem" },
    searchRow: {
      display: "flex",
      gap: "0.75rem",
      marginBottom: "1.5rem",
      flexWrap: "wrap",
    },
    searchBox: {
      flex: 1,
      minWidth: 260,
      display: "flex",
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "14px",
      overflow: "hidden",
      alignItems: "center",
    },
    searchInput: {
      flex: 1,
      background: "transparent",
      border: "none",
      padding: "0.85rem 1.2rem",
      color: "#fff",
      fontSize: "0.95rem",
      outline: "none",
    },
    voiceBtn: (active) => ({
      background: active ? "#dc2626" : "transparent",
      border: "none",
      color: active ? "#fff" : "rgba(255,255,255,0.5)",
      padding: "0 1rem",
      cursor: "pointer",
      fontSize: "1.2rem",
      animation: active ? "pulse 1s infinite" : "none",
    }),
    filtersRow: {
      display: "flex",
      gap: "0.75rem",
      marginBottom: "1.5rem",
      flexWrap: "wrap",
      alignItems: "center",
    },
    select: {
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "10px",
      padding: "0.6rem 1rem",
      color: "#fff",
      fontSize: "0.88rem",
      cursor: "pointer",
    },
    toggleChip: (active) => ({
      background: active ? "rgba(220,38,38,0.6)" : "rgba(255,255,255,0.07)",
      border: `1px solid ${active ? "rgba(220,38,38,0.5)" : "rgba(255,255,255,0.12)"}`,
      borderRadius: "10px",
      padding: "0.6rem 1rem",
      color: "#fff",
      cursor: "pointer",
      fontWeight: active ? 700 : 400,
      fontSize: "0.85rem",
      transition: "all 0.2s",
    }),
    bloodGroupRow: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "1.5rem",
      flexWrap: "wrap",
      alignItems: "center",
    },
    bgBtn: (grp) => ({
      background: selectedBloodGroup === grp ? "rgba(220,38,38,0.7)" : "rgba(255,255,255,0.06)",
      border: `1px solid ${selectedBloodGroup === grp ? "rgba(220,38,38,0.6)" : "rgba(255,255,255,0.1)"}`,
      borderRadius: "8px",
      padding: "0.4rem 0.9rem",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "0.85rem",
    }),
    resultsRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
      flexWrap: "wrap",
      gap: "0.5rem",
    },
    viewToggle: {
      display: "flex",
      background: "rgba(255,255,255,0.06)",
      borderRadius: "10px",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.1)",
    },
    vBtn: (active) => ({
      padding: "0.5rem 1rem",
      border: "none",
      background: active ? "rgba(220,38,38,0.6)" : "transparent",
      color: "#fff",
      cursor: "pointer",
      fontWeight: active ? 700 : 400,
      fontSize: "0.85rem",
    }),
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: "1.25rem",
    },
    card: {
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "20px",
      padding: "1.5rem",
      transition: "all 0.25s ease",
      display: "flex",
      flexDirection: "column",
      gap: "0.9rem",
    },
    cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" },
    cardName: { fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.3 },
    cardAddr: { opacity: 0.6, fontSize: "0.8rem", marginTop: "3px" },
    typeBadge: (type) => ({
      background: type === "Government" ? "#1e3a5f" : "#1e1b4b",
      color: type === "Government" ? "#60a5fa" : "#a78bfa",
      borderRadius: "6px",
      padding: "0.25rem 0.6rem",
      fontSize: "0.72rem",
      fontWeight: 700,
      whiteSpace: "nowrap",
    }),
    tagRow: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
    tag: (color) => ({
      background: `${color}22`,
      color,
      borderRadius: "6px",
      padding: "0.2rem 0.6rem",
      fontSize: "0.72rem",
      fontWeight: 700,
    }),
    bloodRow: { display: "flex", flexWrap: "wrap", gap: "0.4rem" },
    bloodTag: (highlight) => ({
      background: highlight ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.07)",
      border: highlight ? "1px solid rgba(220,38,38,0.5)" : "1px solid rgba(255,255,255,0.1)",
      color: highlight ? "#f87171" : "#e2e8f0",
      borderRadius: "6px",
      padding: "0.2rem 0.6rem",
      fontSize: "0.78rem",
      fontWeight: 700,
    }),
    infoRow: { display: "flex", gap: "1rem", fontSize: "0.82rem", opacity: 0.7, flexWrap: "wrap" },
    ratingRow: { display: "flex", alignItems: "center", gap: "0.3rem" },
    star: { color: "#fbbf24", fontSize: "0.9rem" },
    actionRow: { display: "flex", gap: "0.6rem", marginTop: "0.25rem" },
    actionBtn: (primary) => ({
      flex: primary ? 1 : 0,
      background: primary ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "rgba(255,255,255,0.07)",
      border: primary ? "none" : "1px solid rgba(255,255,255,0.12)",
      borderRadius: "10px",
      color: "#fff",
      padding: "0.6rem 1rem",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "0.85rem",
      textDecoration: "none",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.3rem",
    }),
    listRow: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "14px",
      padding: "1rem 1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      marginBottom: "0.75rem",
      transition: "all 0.2s",
      flexWrap: "wrap",
    },
    emptyState: { textAlign: "center", padding: "4rem 2rem", opacity: 0.5 },
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={s.star}>{i < full ? "★" : i === full && half ? "½" : "☆"}</span>
    ));
  };

  return (
    <div style={s.page}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input::placeholder { color: rgba(255,255,255,0.4); }
        select option { background: #1e293b; color: white; }
      `}</style>

      {/* Hero */}
      <div style={s.hero}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏥</div>
        <h1 style={s.heroTitle}>Find Hospitals & Blood Banks</h1>
        <p style={s.heroSub}>Search verified hospitals with real-time blood stock availability</p>
      </div>

      {/* Quick Stats */}
      <div style={s.statsBar}>
        {[
          ["Total Hospitals", (hospitals || []).length],
          ["With 24/7 Service", hospitals.filter((h) => h.operatingHours === "24/7").length],
          ["Verified", hospitals.filter((h) => h.verified).length],
          ["Emergency Ready", hospitals.filter((h) => h.emergency).length],
        ].map(([label, val]) => (
          <div key={label} style={s.statItem}>
            <div style={s.statNum}>{val}</div>
            <div style={s.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div style={s.container}>
        {/* Search */}
        <div style={s.searchRow}>
          <div style={s.searchBox}>
            <span style={{ padding: "0 0.5rem 0 1.2rem", opacity: 0.5, fontSize: "1rem" }}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search hospital name, city, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button style={s.voiceBtn(isListening)} onClick={startVoiceSearch} title="Voice Search">
              🎙️
            </button>
          </div>
          <select style={s.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rating">Sort: Rating</option>
            <option value="stock">Sort: Stock</option>
            <option value="name">Sort: Name A-Z</option>
          </select>
          <Link to="/map" style={{ ...s.actionBtn(false), padding: "0.6rem 1.2rem", textDecoration: "none", borderRadius: "10px" }}>
            🗺️ Map View
          </Link>
        </div>

        {/* Filters */}
        <div style={s.filtersRow}>
          <select style={s.select} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select style={s.select} value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <button style={s.toggleChip(emergencyOnly)} onClick={() => setEmergencyOnly(!emergencyOnly)}>
            🚨 Emergency 24/7
          </button>
          <button style={s.toggleChip(verifiedOnly)} onClick={() => setVerifiedOnly(!verifiedOnly)}>
            ✓ Verified Only
          </button>
        </div>

        {/* Blood Group Filter */}
        <div style={s.bloodGroupRow}>
          <span style={{ opacity: 0.6, fontSize: "0.85rem", fontWeight: 600 }}>Blood Group:</span>
          <button style={s.bgBtn("all")} onClick={() => setSelectedBloodGroup("all")}>All</button>
          {BLOOD_GROUPS.map((g) => (
            <button key={g} style={s.bgBtn(g)} onClick={() => setSelectedBloodGroup(selectedBloodGroup === g ? "all" : g)}>
              {g}
            </button>
          ))}
        </div>

        {/* Results row */}
        <div style={s.resultsRow}>
          <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>
            <strong style={{ color: "#f87171" }}>{filtered.length}</strong> hospitals found
            {selectedBloodGroup !== "all" && ` with ${selectedBloodGroup} blood available`}
            {isListening && <span style={{ color: "#f87171", marginLeft: "1rem" }}>🎙️ Listening...</span>}
          </div>
          <div style={s.viewToggle}>
            <button style={s.vBtn(viewMode === "grid")} onClick={() => setViewMode("grid")}>⊞ Grid</button>
            <button style={s.vBtn(viewMode === "list")} onClick={() => setViewMode("list")}>☰ List</button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div style={{ fontSize: "3rem" }}>🏥</div>
            <p>Loading hospitals...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={s.emptyState}>
            <div style={{ fontSize: "3rem" }}>🔍</div>
            <h3>No hospitals found</h3>
            <p>Try adjusting your search or filters</p>
            <button style={{ ...s.actionBtn(true), display: "inline-block", padding: "0.7rem 2rem", borderRadius: "12px", width: "auto" }}
              onClick={() => { setSearchQuery(""); setSelectedBloodGroup("all"); setSelectedCity("All Cities"); setSelectedType("All Types"); setEmergencyOnly(false); setVerifiedOnly(false); }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Grid View */}
        {!loading && viewMode === "grid" && (
          <div style={s.grid}>
            {filtered.map((h) => (
              <div key={h._id} style={s.card}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)"; e.currentTarget.style.border = "1px solid rgba(220,38,38,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.09)"; }}
              >
                <div style={s.cardTop}>
                  <div>
                    <div style={s.cardName}>{h.name}</div>
                    <div style={s.cardAddr}>📍 {h.address}</div>
                  </div>
                  <span style={s.typeBadge(h.type)}>{h.type}</span>
                </div>

                <div style={s.tagRow}>
                  {h.verified && <span style={s.tag("#22c55e")}>✓ Verified</span>}
                  {h.emergency && <span style={s.tag("#ef4444")}>🚨 Emergency</span>}
                  <span style={s.tag("#a78bfa")}>⏰ {h.operatingHours}</span>
                </div>

                <div>
                  <div style={{ fontSize: "0.78rem", opacity: 0.6, marginBottom: "0.4rem" }}>Blood Available ({h.bloodAvailable.length} groups):</div>
                  <div style={s.bloodRow}>
                    {BLOOD_GROUPS.map((g) => (
                      h.bloodAvailable.includes(g) ? (
                        <span key={g} style={s.bloodTag(selectedBloodGroup === g)}>{g}</span>
                      ) : null
                    ))}
                    {h.bloodAvailable.length === 0 && <span style={{ opacity: 0.4, fontSize: "0.8rem" }}>No stock data</span>}
                  </div>
                </div>

                <div style={s.infoRow}>
                  <div style={s.ratingRow}>
                    {renderStars(h.rating)}
                    <span style={{ marginLeft: "0.25rem" }}>{h.rating}</span>
                  </div>
                  <span>🩸 {h.totalStock} units</span>
                  <span>📞 <a href={`tel:${h.phone}`} style={{ color: "#f87171", textDecoration: "none" }}>{h.phone}</a></span>
                </div>

                <div style={s.actionRow}>
                  <Link to={`/blood-availability?hospital=${h._id}`} style={s.actionBtn(true)}>
                    🩸 View Stock
                  </Link>
                  <a href={`tel:${h.phone}`} style={{ ...s.actionBtn(false), padding: "0.6rem 0.8rem" }} title="Call">📞</a>
                  <Link to={`/map?hospital=${h._id}`} style={{ ...s.actionBtn(false), padding: "0.6rem 0.8rem" }} title="Map">🗺️</Link>
                  {h.website && (
                    <a href={h.website} target="_blank" rel="noopener noreferrer" style={{ ...s.actionBtn(false), padding: "0.6rem 0.8rem" }} title="Website">🌐</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {!loading && viewMode === "list" && (
          <div>
            {filtered.map((h) => (
              <div key={h._id} style={s.listRow}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              >
                <div style={{ flex: 2, minWidth: 200 }}>
                  <div style={{ fontWeight: 700 }}>{h.name}</div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>📍 {h.city} · {h.type}</div>
                </div>
                <div style={{ flex: 1, minWidth: 160, display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                  {h.bloodAvailable.map((g) => (
                    <span key={g} style={{ background: selectedBloodGroup === g ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "1px 6px", fontSize: "0.75rem", fontWeight: 700 }}>
                      {g}
                    </span>
                  ))}
                </div>
                <div style={{ minWidth: 80, textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: "#f87171" }}>{h.totalStock}</div>
                  <div style={{ fontSize: "0.72rem", opacity: 0.5 }}>units</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {h.verified && <span style={{ color: "#22c55e", fontSize: "0.8rem" }}>✓</span>}
                  {h.emergency && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>🚨</span>}
                  <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>{h.rating}⭐</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a href={`tel:${h.phone}`} style={{ ...s.actionBtn(false), padding: "0.4rem 0.8rem", textDecoration: "none", borderRadius: "8px" }}>📞</a>
                  <Link to={`/blood-availability?hospital=${h._id}`} style={{ ...s.actionBtn(true), padding: "0.4rem 1rem", textDecoration: "none", borderRadius: "8px", whiteSpace: "nowrap" }}>
                    View Stock →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}