import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BLOOD_COLORS = {
  "A+": { bg: "#fff0f0", border: "#ff4444", text: "#cc0000", badge: "#ff4444" },
  "A-": { bg: "#fff5f5", border: "#ff6666", text: "#bb0000", badge: "#ff6666" },
  "B+": { bg: "#fff8f0", border: "#ff8c00", text: "#cc6600", badge: "#ff8c00" },
  "B-": { bg: "#fffaf0", border: "#ffa500", text: "#bb7700", badge: "#ffa500" },
  "AB+": { bg: "#f0f8ff", border: "#4169e1", text: "#1a3a8a", badge: "#4169e1" },
  "AB-": { bg: "#f5f8ff", border: "#5a7de8", text: "#2244aa", badge: "#5a7ae8" },
  "O+": { bg: "#f0fff4", border: "#28a745", text: "#155724", badge: "#28a745" },
  "O-": { bg: "#f5fff8", border: "#34b558", text: "#1a6b30", badge: "#34b558" },
};

const getStockLevel = (units) => {
  if (units === 0) return { label: "Out of Stock", color: "#dc3545", bg: "#ffe6ea", icon: "⛔" };
  if (units < 5) return { label: "Critical", color: "#dc3545", bg: "#ffe6ea", icon: "🔴" };
  if (units < 15) return { label: "Low", color: "#fd7e14", bg: "#fff3e0", icon: "🟠" };
  if (units < 30) return { label: "Moderate", color: "#ffc107", bg: "#fffde7", icon: "🟡" };
  return { label: "Available", color: "#28a745", bg: "#e8f5e9", icon: "🟢" };
};

// Mock data for when backend is unavailable
const MOCK_STOCK_DATA = [
  {
    _id: "1",
    hospital: { name: "AIIMS Bhubaneswar", address: "Sijua, Patrapada", city: "Bhubaneswar", phone: "0674-2476789", lat: 20.2961, lng: 85.8245 },
    stocks: { "A+": 25, "A-": 8, "B+": 32, "B-": 3, "AB+": 15, "AB-": 2, "O+": 40, "O-": 6 },
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: "2",
    hospital: { name: "SCB Medical College", address: "Manglabag", city: "Cuttack", phone: "0671-2414004", lat: 20.4625, lng: 85.8830 },
    stocks: { "A+": 12, "A-": 0, "B+": 18, "B-": 1, "AB+": 7, "AB-": 0, "O+": 22, "O-": 4 },
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: "3",
    hospital: { name: "Capital Hospital", address: "Unit 6", city: "Bhubaneswar", phone: "0674-2391983", lat: 20.2699, lng: 85.8387 },
    stocks: { "A+": 5, "A-": 2, "B+": 8, "B-": 0, "AB+": 3, "AB-": 1, "O+": 10, "O-": 2 },
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: "4",
    hospital: { name: "SUM Hospital", address: "K8 Kalinga Nagar", city: "Bhubaneswar", phone: "0674-2359355", lat: 20.2521, lng: 85.7954 },
    stocks: { "A+": 0, "A-": 0, "B+": 2, "B-": 0, "AB+": 0, "AB-": 0, "O+": 4, "O-": 0 },
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: "5",
    hospital: { name: "Kalinga Hospital", address: "Nayapalli", city: "Bhubaneswar", phone: "0674-2557776", lat: 20.2784, lng: 85.8137 },
    stocks: { "A+": 35, "A-": 10, "B+": 42, "B-": 7, "AB+": 20, "AB-": 4, "O+": 55, "O-": 9 },
    lastUpdated: new Date().toISOString(),
  },
];

export default function BloodAvailability() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [searchHospital, setSearchHospital] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("table"); // table | cards
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [usingMock, setUsingMock] = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/blood-stock/availability`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setStockData(Array.isArray(data) ? data : data.data || []);
      setUsingMock(false);
    } catch {
      // fallback to mock
      setStockData(MOCK_STOCK_DATA);
      setUsingMock(true);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchStock();
    const interval = setInterval(fetchStock, 60000);
    return () => clearInterval(interval);
  }, [fetchStock]);

  const filtered = stockData
    .filter((item) => {
      const city = item.hospital?.city?.toLowerCase() || "";
      const name = item.hospital?.name?.toLowerCase() || "";
      const cityMatch = city.includes(searchCity.toLowerCase());
      const nameMatch = name.includes(searchHospital.toLowerCase());
      const groupMatch =
        selectedGroup === "all" || (item.stocks && (item.stocks[selectedGroup] ?? 0) > 0);
      return cityMatch && nameMatch && groupMatch;
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.hospital?.name || "").localeCompare(b.hospital?.name || "");
      if (sortBy === "city") return (a.hospital?.city || "").localeCompare(b.hospital?.city || "");
      if (sortBy === "stock" && selectedGroup !== "all") {
        return (b.stocks?.[selectedGroup] || 0) - (a.stocks?.[selectedGroup] || 0);
      }
      return 0;
    });

  const totalsByGroup = BLOOD_GROUPS.reduce((acc, grp) => {
    acc[grp] = stockData.reduce((sum, item) => sum + (item.stocks?.[grp] || 0), 0);
    return acc;
  }, {});

  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      color: "#fff",
    },
    hero: {
      background: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 50%, #1a0505 100%)",
      padding: "3rem 2rem 2rem",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },
    heroTitle: {
      fontSize: "clamp(2rem, 5vw, 3rem)",
      fontWeight: 800,
      margin: 0,
      letterSpacing: "-0.02em",
      textShadow: "0 2px 20px rgba(0,0,0,0.4)",
    },
    heroSub: {
      opacity: 0.85,
      fontSize: "1.1rem",
      marginTop: "0.5rem",
      fontWeight: 400,
    },
    dropBadge: {
      display: "inline-block",
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "100px",
      padding: "0.3rem 1rem",
      fontSize: "0.85rem",
      marginBottom: "1rem",
      fontWeight: 600,
    },
    container: { maxWidth: 1300, margin: "0 auto", padding: "2rem 1.5rem" },
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
      gap: "1rem",
      marginBottom: "2rem",
    },
    summaryCard: (grp) => ({
      background: "rgba(255,255,255,0.07)",
      backdropFilter: "blur(12px)",
      border: `2px solid ${BLOOD_COLORS[grp].badge}33`,
      borderRadius: "16px",
      padding: "1.2rem 0.8rem",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.25s ease",
      outline: selectedGroup === grp ? `3px solid ${BLOOD_COLORS[grp].badge}` : "none",
      transform: selectedGroup === grp ? "scale(1.05)" : "scale(1)",
    }),
    summaryGroupLabel: (grp) => ({
      fontSize: "1.5rem",
      fontWeight: 800,
      color: BLOOD_COLORS[grp].badge,
    }),
    summaryUnits: { fontSize: "0.9rem", opacity: 0.8, marginTop: "0.2rem" },
    controlsRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      marginBottom: "1.5rem",
      alignItems: "center",
    },
    searchInput: {
      flex: 1,
      minWidth: 180,
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "12px",
      padding: "0.75rem 1.2rem",
      color: "#fff",
      fontSize: "0.95rem",
      outline: "none",
    },
    select: {
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "12px",
      padding: "0.75rem 1rem",
      color: "#fff",
      fontSize: "0.9rem",
      cursor: "pointer",
    },
    viewToggle: {
      display: "flex",
      background: "rgba(255,255,255,0.08)",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.15)",
    },
    toggleBtn: (active) => ({
      padding: "0.6rem 1.2rem",
      background: active ? "rgba(220,38,38,0.7)" : "transparent",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      fontWeight: active ? 700 : 400,
      transition: "all 0.2s",
      fontSize: "0.9rem",
    }),
    refreshBtn: {
      background: "rgba(220,38,38,0.6)",
      border: "none",
      borderRadius: "12px",
      color: "#fff",
      padding: "0.7rem 1.2rem",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "0.9rem",
      display: "flex",
      alignItems: "center",
      gap: "0.4rem",
    },
    resultsInfo: {
      opacity: 0.7,
      fontSize: "0.9rem",
      marginBottom: "1rem",
    },
    tableWrapper: {
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      borderRadius: "20px",
      border: "1px solid rgba(255,255,255,0.1)",
      overflow: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      padding: "1rem 1.2rem",
      textAlign: "left",
      fontSize: "0.8rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      opacity: 0.6,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      whiteSpace: "nowrap",
    },
    td: {
      padding: "1rem 1.2rem",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      verticalAlign: "middle",
    },
    hospitalName: {
      fontWeight: 700,
      fontSize: "1rem",
      color: "#fff",
    },
    hospitalSub: {
      fontSize: "0.8rem",
      opacity: 0.6,
      marginTop: "2px",
    },
    stockPill: (units) => {
      const level = getStockLevel(units);
      return {
        display: "inline-block",
        background: level.bg,
        color: level.color,
        borderRadius: "8px",
        padding: "0.25rem 0.6rem",
        fontSize: "0.82rem",
        fontWeight: 700,
        minWidth: 36,
        textAlign: "center",
      };
    },
    cardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: "1.5rem",
    },
    card: {
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "20px",
      padding: "1.5rem",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "1rem",
    },
    cardStockGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "0.5rem",
    },
    cardStockItem: (grp) => ({
      background: BLOOD_COLORS[grp].bg,
      border: `1px solid ${BLOOD_COLORS[grp].border}`,
      borderRadius: "10px",
      padding: "0.5rem",
      textAlign: "center",
    }),
    cardStockLabel: (grp) => ({
      fontSize: "0.75rem",
      fontWeight: 800,
      color: BLOOD_COLORS[grp].text,
    }),
    cardStockCount: (units) => ({
      fontSize: "1.1rem",
      fontWeight: 900,
      color: getStockLevel(units).color,
    }),
    emptyState: {
      textAlign: "center",
      padding: "4rem 2rem",
      opacity: 0.6,
    },
    mockBanner: {
      background: "rgba(255, 193, 7, 0.15)",
      border: "1px solid rgba(255, 193, 7, 0.4)",
      borderRadius: "12px",
      padding: "0.75rem 1.5rem",
      marginBottom: "1.5rem",
      fontSize: "0.9rem",
      color: "#ffc107",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    phoneLink: {
      color: "#ff6b6b",
      textDecoration: "none",
      fontSize: "0.82rem",
    },
    allBtn: {
      background: selectedGroup === "all" ? "rgba(220,38,38,0.7)" : "rgba(255,255,255,0.07)",
      border: "2px solid rgba(220,38,38,0.4)",
      borderRadius: "12px",
      color: "#fff",
      padding: "0.6rem 1.2rem",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "0.9rem",
    },
  };

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,0,0,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(120,0,0,0.2) 0%, transparent 60%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={styles.dropBadge}>🩸 Live Blood Availability</div>
          <h1 style={styles.heroTitle}>Find Blood. Save Lives.</h1>
          <p style={styles.heroSub}>
            Real-time blood stock across hospitals — updated every minute
          </p>
          <p style={{ opacity: 0.6, fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div style={styles.container}>
        {/* Mock data banner */}
        {usingMock && (
          <div style={styles.mockBanner}>
            ⚠️ Showing demo data — connect your backend for live stock updates
          </div>
        )}

        {/* Summary strip */}
        <div style={styles.summaryGrid}>
          <button style={styles.allBtn} onClick={() => setSelectedGroup("all")}>
            All Groups
          </button>
          {BLOOD_GROUPS.map((grp) => (
            <div
              key={grp}
              style={styles.summaryCard(grp)}
              onClick={() => setSelectedGroup(selectedGroup === grp ? "all" : grp)}
              title={`Click to filter by ${grp}`}
            >
              <div style={styles.summaryGroupLabel(grp)}>{grp}</div>
              <div style={styles.summaryUnits}>
                {loading ? "..." : `${totalsByGroup[grp]} units`}
              </div>
              <div style={{ fontSize: "0.7rem", marginTop: "0.3rem", opacity: 0.7 }}>
                {!loading && getStockLevel(totalsByGroup[grp]).icon}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={styles.controlsRow}>
          <input
            style={styles.searchInput}
            placeholder="🔍 Search by hospital name..."
            value={searchHospital}
            onChange={(e) => setSearchHospital(e.target.value)}
          />
          <input
            style={styles.searchInput}
            placeholder="📍 Filter by city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          <select
            style={styles.select}
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="all">All Blood Groups</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select style={styles.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="city">Sort: City</option>
            {selectedGroup !== "all" && <option value="stock">Sort: Stock</option>}
          </select>
          <div style={styles.viewToggle}>
            <button style={styles.toggleBtn(viewMode === "table")} onClick={() => setViewMode("table")}>
              ☰ Table
            </button>
            <button style={styles.toggleBtn(viewMode === "cards")} onClick={() => setViewMode("cards")}>
              ⊞ Cards
            </button>
          </div>
          <button style={styles.refreshBtn} onClick={fetchStock} disabled={loading}>
            {loading ? "⏳" : "🔄"} Refresh
          </button>
        </div>

        <p style={styles.resultsInfo}>
          Showing <strong>{filtered.length}</strong> of {stockData.length} hospitals
          {selectedGroup !== "all" && ` with ${selectedGroup} blood`}
        </p>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem", fontSize: "1.2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🩸</div>
            Fetching live blood stock...
          </div>
        )}

        {/* Table View */}
        {!loading && viewMode === "table" && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Hospital</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Contact</th>
                  {BLOOD_GROUPS.map((g) => (
                    <th
                      key={g}
                      style={{
                        ...styles.th,
                        color: selectedGroup === g ? BLOOD_COLORS[g].badge : undefined,
                      }}
                    >
                      {g}
                    </th>
                  ))}
                  <th style={styles.th}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ ...styles.td, textAlign: "center", padding: "3rem", opacity: 0.5 }}>
                      No hospitals match your search
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item._id} style={{ transition: "background 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={styles.td}>
                        <div style={styles.hospitalName}>{item.hospital?.name}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: "0.85rem" }}>{item.hospital?.city}</div>
                        <div style={styles.hospitalSub}>{item.hospital?.address}</div>
                      </td>
                      <td style={styles.td}>
                        {item.hospital?.phone && (
                          <a href={`tel:${item.hospital.phone}`} style={styles.phoneLink}>
                            📞 {item.hospital.phone}
                          </a>
                        )}
                      </td>
                      {BLOOD_GROUPS.map((g) => {
                        const units = item.stocks?.[g] ?? 0;
                        return (
                          <td key={g} style={styles.td}>
                            <span style={styles.stockPill(units)}>{units}</span>
                          </td>
                        );
                      })}
                      <td style={{ ...styles.td, fontSize: "0.8rem", opacity: 0.6 }}>
                        {item.lastUpdated
                          ? new Date(item.lastUpdated).toLocaleTimeString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Cards View */}
        {!loading && viewMode === "cards" && (
          <div style={styles.cardsGrid}>
            {filtered.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: "3rem" }}>🩸</div>
                <p>No hospitals found matching your criteria</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div key={item._id} style={styles.card}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.3 }}>
                        {item.hospital?.name}
                      </div>
                      <div style={{ opacity: 0.6, fontSize: "0.8rem", marginTop: "2px" }}>
                        📍 {item.hospital?.city}
                        {item.hospital?.address && `, ${item.hospital.address}`}
                      </div>
                      {item.hospital?.phone && (
                        <a href={`tel:${item.hospital.phone}`} style={{ ...styles.phoneLink, display: "block", marginTop: "4px" }}>
                          📞 {item.hospital.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div style={styles.cardStockGrid}>
                    {BLOOD_GROUPS.map((grp) => {
                      const units = item.stocks?.[grp] ?? 0;
                      const level = getStockLevel(units);
                      return (
                        <div key={grp} style={styles.cardStockItem(grp)}>
                          <div style={styles.cardStockLabel(grp)}>{grp}</div>
                          <div style={styles.cardStockCount(units)}>{units}</div>
                          <div style={{ fontSize: "0.6rem", color: level.color }}>{level.icon}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: "0.8rem", fontSize: "0.75rem", opacity: 0.5 }}>
                    Updated: {item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : "N/A"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Legend */}
        <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", opacity: 0.7, fontSize: "0.85rem" }}>
          <span>Stock Legend:</span>
          {[["🟢", "30+ units", "Available"], ["🟡", "15–29", "Moderate"], ["🟠", "5–14", "Low"], ["🔴", "1–4", "Critical"], ["⛔", "0", "Out of Stock"]].map(([icon, range, label]) => (
            <span key={label}>{icon} {label} ({range})</span>
          ))}
        </div>
      </div>
    </div>
  );
}