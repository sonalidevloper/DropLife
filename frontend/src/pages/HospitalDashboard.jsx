import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const MOCK_DATA = {
  hospital: {
    name: "AIIMS Bhubaneswar",
    city: "Bhubaneswar",
    licenseNo: "AIIMS/BBN/2024",
    email: "bloodbank@aiimsbbs.edu.in",
    phone: "0674-2476789",
    verified: true,
  },
  stats: {
    totalRequests: 142,
    pendingRequests: 8,
    fulfilledToday: 12,
    criticalStock: 2,
    totalDeliveries: 89,
    activePatients: 24,
    staffCount: 15,
    totalDonations: 210,
  },
  bloodStock: { "A+": 25, "A-": 4, "B+": 32, "B-": 2, "AB+": 15, "AB-": 1, "O+": 40, "O-": 6 },
  recentRequests: [
    { id: "REQ001", patient: "Ramesh Kumar", bloodGroup: "O+", units: 2, status: "pending", urgency: "emergency", time: "10 min ago" },
    { id: "REQ002", patient: "Priya Mohanty", bloodGroup: "A+", units: 1, status: "fulfilled", urgency: "normal", time: "1 hr ago" },
    { id: "REQ003", patient: "Suresh Patra", bloodGroup: "B-", units: 3, status: "pending", urgency: "urgent", time: "2 hrs ago" },
    { id: "REQ004", patient: "Anita Das", bloodGroup: "AB+", units: 2, status: "processing", urgency: "normal", time: "3 hrs ago" },
    { id: "REQ005", patient: "Bikash Nayak", bloodGroup: "A-", units: 1, status: "fulfilled", urgency: "normal", time: "5 hrs ago" },
  ],
  weeklyActivity: [
    { day: "Mon", requests: 18, fulfilled: 15 },
    { day: "Tue", requests: 22, fulfilled: 20 },
    { day: "Wed", requests: 16, fulfilled: 14 },
    { day: "Thu", requests: 25, fulfilled: 22 },
    { day: "Fri", requests: 19, fulfilled: 17 },
    { day: "Sat", requests: 28, fulfilled: 24 },
    { day: "Sun", requests: 14, fulfilled: 12 },
  ],
};

const getStockStatus = (units) => {
  if (units === 0) return { color: "#ef4444", label: "Empty", bg: "#fee2e2" };
  if (units < 5) return { color: "#ef4444", label: "Critical", bg: "#fee2e2" };
  if (units < 15) return { color: "#f97316", label: "Low", bg: "#fff7ed" };
  if (units < 30) return { color: "#eab308", label: "Moderate", bg: "#fefce8" };
  return { color: "#22c55e", label: "Good", bg: "#f0fdf4" };
};

const getRequestStatusStyle = (status) => {
  const map = {
    pending: { bg: "#fef3c7", color: "#d97706", label: "⏳ Pending" },
    fulfilled: { bg: "#d1fae5", color: "#059669", label: "✅ Fulfilled" },
    processing: { bg: "#dbeafe", color: "#2563eb", label: "🔄 Processing" },
    rejected: { bg: "#fee2e2", color: "#dc2626", label: "❌ Rejected" },
  };
  return map[status] || map.pending;
};

const getUrgencyStyle = (urgency) => {
  const map = {
    emergency: { bg: "#fecaca", color: "#dc2626", label: "🚨 Emergency" },
    urgent: { bg: "#fed7aa", color: "#ea580c", label: "⚡ Urgent" },
    normal: { bg: "#e0e7ff", color: "#4338ca", label: "📋 Normal" },
  };
  return map[urgency] || map.normal;
};

export default function HospitalDashboard() {
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data: res } = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/hospital/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData({ ...MOCK_DATA, ...res });
      } catch {
        // use mock data
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const maxActivity = Math.max(...data.weeklyActivity.map((d) => d.requests));

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#0f172a",
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
    },
    topbar: {
      background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
      padding: "1rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "1rem",
    },
    topbarLeft: { display: "flex", alignItems: "center", gap: "1rem" },
    hospitalBadge: {
      background: "rgba(255,255,255,0.2)",
      borderRadius: "12px",
      padding: "0.5rem 1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    verifiedBadge: {
      background: "#22c55e",
      color: "#fff",
      borderRadius: "20px",
      padding: "0.2rem 0.7rem",
      fontSize: "0.7rem",
      fontWeight: 700,
    },
    clock: { fontSize: "0.9rem", opacity: 0.85, fontWeight: 600 },
    topbarRight: { display: "flex", gap: "0.75rem", alignItems: "center" },
    quickBtn: (color) => ({
      background: color,
      border: "none",
      borderRadius: "10px",
      color: "#fff",
      padding: "0.5rem 1rem",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "0.85rem",
    }),
    tabs: {
      background: "#1e293b",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 2rem",
      display: "flex",
      gap: "0.25rem",
      overflowX: "auto",
    },
    tab: (active) => ({
      padding: "0.9rem 1.5rem",
      border: "none",
      background: "transparent",
      color: active ? "#f87171" : "rgba(255,255,255,0.5)",
      borderBottom: active ? "3px solid #f87171" : "3px solid transparent",
      cursor: "pointer",
      fontWeight: active ? 700 : 400,
      fontSize: "0.9rem",
      whiteSpace: "nowrap",
      transition: "all 0.2s",
    }),
    container: { maxWidth: 1400, margin: "0 auto", padding: "2rem" },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "1rem",
      marginBottom: "2rem",
    },
    statCard: (accent) => ({
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(12px)",
      border: `1px solid ${accent}33`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: "16px",
      padding: "1.5rem",
      position: "relative",
      overflow: "hidden",
    }),
    statNum: (accent) => ({
      fontSize: "2rem",
      fontWeight: 900,
      color: accent,
      lineHeight: 1,
    }),
    statLabel: { fontSize: "0.8rem", opacity: 0.6, marginTop: "0.4rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
    statIcon: { fontSize: "2rem", position: "absolute", right: "1rem", top: "1rem", opacity: 0.2 },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 340px",
      gap: "1.5rem",
    },
    section: {
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
    },
    sectionTitle: {
      fontWeight: 700,
      fontSize: "1rem",
      marginBottom: "1.2rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    stockGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "0.75rem",
    },
    stockItem: (grp) => {
      const st = getStockStatus(data.bloodStock[grp] || 0);
      return {
        background: `${st.bg}15`,
        border: `2px solid ${st.color}33`,
        borderRadius: "12px",
        padding: "0.8rem",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s",
      };
    },
    stockGroup: { fontSize: "1.2rem", fontWeight: 900 },
    stockUnits: (grp) => ({
      fontSize: "1.6rem",
      fontWeight: 900,
      color: getStockStatus(data.bloodStock[grp] || 0).color,
    }),
    stockStatus: (grp) => ({
      fontSize: "0.65rem",
      fontWeight: 700,
      color: getStockStatus(data.bloodStock[grp] || 0).color,
      background: getStockStatus(data.bloodStock[grp] || 0).bg,
      borderRadius: "20px",
      padding: "1px 6px",
      display: "inline-block",
      marginTop: "2px",
    }),
    requestTable: { width: "100%", borderCollapse: "collapse" },
    th: {
      padding: "0.7rem 1rem",
      textAlign: "left",
      fontSize: "0.75rem",
      fontWeight: 700,
      textTransform: "uppercase",
      opacity: 0.5,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    td: {
      padding: "0.9rem 1rem",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      fontSize: "0.87rem",
      verticalAlign: "middle",
    },
    pill: (style) => ({
      background: style.bg,
      color: style.color,
      borderRadius: "20px",
      padding: "0.2rem 0.7rem",
      fontSize: "0.75rem",
      fontWeight: 700,
      display: "inline-block",
    }),
    actionBtn: (color) => ({
      background: color,
      border: "none",
      borderRadius: "8px",
      color: "#fff",
      padding: "0.3rem 0.8rem",
      cursor: "pointer",
      fontSize: "0.78rem",
      fontWeight: 600,
      marginRight: "0.3rem",
    }),
    chartBar: (pct, color) => ({
      height: "120px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "4px",
    }),
    chartBarFill: (pct, color) => ({
      width: "100%",
      height: `${pct * 100}%`,
      background: color,
      borderRadius: "4px 4px 0 0",
      minHeight: 2,
    }),
    quickLinks: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "0.75rem",
    },
    quickLink: (color) => ({
      background: `${color}15`,
      border: `1px solid ${color}33`,
      borderRadius: "12px",
      padding: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      cursor: "pointer",
      textDecoration: "none",
      color: "#e2e8f0",
      transition: "all 0.2s",
      fontWeight: 600,
      fontSize: "0.87rem",
    }),
  };

  if (loading) return (
    <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏥</div>
        <p>Loading hospital dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Top Bar */}
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <div style={{ fontSize: "1.5rem" }}>🏥</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>{data.hospital.name}</span>
              {data.hospital.verified && <span style={styles.verifiedBadge}>✓ Verified</span>}
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              {data.hospital.city} · {data.hospital.licenseNo}
            </div>
          </div>
        </div>
        <div style={styles.topbarRight}>
          <div style={styles.clock}>{time.toLocaleTimeString()}</div>
          <button style={styles.quickBtn("rgba(255,255,255,0.2)")} onClick={() => navigate("/hospital/blood-bank")}>
            🩸 Blood Bank
          </button>
          <button style={styles.quickBtn("rgba(239,68,68,0.8)")} onClick={() => alert("Emergency alert sent!")}>
            🚨 Emergency
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["overview", "requests", "blood-bank", "deliveries"].map((tab) => (
          <button key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab === "overview" && "📊 Overview"}
            {tab === "requests" && "📋 Requests"}
            {tab === "blood-bank" && "🩸 Blood Bank"}
            {tab === "deliveries" && "🚚 Deliveries"}
          </button>
        ))}
      </div>

      <div style={styles.container}>
        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: "Total Requests", value: data.stats.totalRequests, color: "#6366f1", icon: "📋" },
            { label: "Pending", value: data.stats.pendingRequests, color: "#f59e0b", icon: "⏳" },
            { label: "Fulfilled Today", value: data.stats.fulfilledToday, color: "#22c55e", icon: "✅" },
            { label: "Critical Stock", value: data.stats.criticalStock, color: "#ef4444", icon: "⚠️" },
            { label: "Deliveries", value: data.stats.totalDeliveries, color: "#0ea5e9", icon: "🚚" },
            { label: "Active Patients", value: data.stats.activePatients, color: "#a855f7", icon: "🧑‍⚕️" },
            { label: "Staff", value: data.stats.staffCount, color: "#14b8a6", icon: "👩‍💼" },
            { label: "Total Donations", value: data.stats.totalDonations, color: "#f43f5e", icon: "🩸" },
          ].map((s) => (
            <div key={s.label} style={styles.statCard(s.color)}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={styles.statNum(s.color)}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={styles.mainGrid}>
          {/* Left Column */}
          <div>
            {/* Blood Stock */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                🩸 Blood Stock Overview
                <Link to="/hospital/blood-bank" style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#f87171", textDecoration: "none" }}>
                  Manage →
                </Link>
              </div>
              <div style={styles.stockGrid}>
                {BLOOD_GROUPS.map((grp) => (
                  <div key={grp} style={styles.stockItem(grp)}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <div style={styles.stockGroup}>{grp}</div>
                    <div style={styles.stockUnits(grp)}>{data.bloodStock[grp] ?? 0}</div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>units</div>
                    <div style={styles.stockStatus(grp)}>{getStockStatus(data.bloodStock[grp] || 0).label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Requests */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                📋 Recent Blood Requests
                <Link to="/hospital/requests" style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#f87171", textDecoration: "none" }}>
                  View All →
                </Link>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.requestTable}>
                  <thead>
                    <tr>
                      {["Request ID", "Patient", "Blood Group", "Units", "Urgency", "Status", "Actions"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentRequests.map((req) => (
                      <tr key={req.id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={styles.td}><strong style={{ color: "#f87171" }}>#{req.id}</strong></td>
                        <td style={styles.td}>{req.patient}</td>
                        <td style={styles.td}>
                          <span style={{ background: "#dc262615", color: "#f87171", borderRadius: "6px", padding: "2px 8px", fontWeight: 800 }}>
                            {req.bloodGroup}
                          </span>
                        </td>
                        <td style={styles.td}>{req.units} unit{req.units > 1 ? "s" : ""}</td>
                        <td style={styles.td}><span style={styles.pill(getUrgencyStyle(req.urgency))}>{getUrgencyStyle(req.urgency).label}</span></td>
                        <td style={styles.td}><span style={styles.pill(getRequestStatusStyle(req.status))}>{getRequestStatusStyle(req.status).label}</span></td>
                        <td style={styles.td}>
                          {req.status === "pending" && (
                            <>
                              <button style={styles.actionBtn("#22c55e")} onClick={() => alert(`Approving ${req.id}`)}>✓ Approve</button>
                              <button style={styles.actionBtn("#ef4444")} onClick={() => alert(`Rejecting ${req.id}`)}>✗ Reject</button>
                            </>
                          )}
                          {req.status !== "pending" && (
                            <button style={styles.actionBtn("#6366f1")} onClick={() => alert(`Viewing ${req.id}`)}>View</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>📈 Weekly Activity</div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", height: 150 }}>
                {data.weeklyActivity.map((d) => (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                      <div
                        style={{
                          width: "80%",
                          height: `${(d.fulfilled / maxActivity) * 100}%`,
                          background: "#22c55e",
                          borderRadius: "4px 4px 0 0",
                          minHeight: 4,
                          transition: "height 0.5s ease",
                        }}
                        title={`Fulfilled: ${d.fulfilled}`}
                      />
                      <div
                        style={{
                          width: "80%",
                          height: `${((d.requests - d.fulfilled) / maxActivity) * 100}%`,
                          background: "#ef4444",
                          borderRadius: "0",
                          minHeight: 0,
                        }}
                        title={`Pending: ${d.requests - d.fulfilled}`}
                      />
                    </div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>{d.day}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.78rem", opacity: 0.7 }}>
                <span><span style={{ color: "#22c55e" }}>■</span> Fulfilled</span>
                <span><span style={{ color: "#ef4444" }}>■</span> Pending</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Quick Links */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>⚡ Quick Actions</div>
              <div style={styles.quickLinks}>
                {[
                  { to: "/hospital/blood-bank", label: "Blood Bank", icon: "🩸", color: "#ef4444" },
                  { to: "/hospital/requests", label: "Requests", icon: "📋", color: "#6366f1" },
                  { to: "/hospital/patients", label: "Patients", icon: "🧑‍⚕️", color: "#a855f7" },
                  { to: "/hospital/staff", label: "Staff", icon: "👩‍💼", color: "#14b8a6" },
                  { to: "/hospital/deliveries", label: "Deliveries", icon: "🚚", color: "#0ea5e9" },
                  { to: "/map", label: "Map View", icon: "🗺️", color: "#f59e0b" },
                ].map((link) => (
                  <Link key={link.to} to={link.to} style={styles.quickLink(link.color)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = `${link.color}25`)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = `${link.color}15`)}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Critical Stock Alert */}
            {BLOOD_GROUPS.filter((g) => (data.bloodStock[g] || 0) < 5).length > 0 && (
              <div style={{ ...styles.section, border: "1px solid #ef444433", background: "rgba(239,68,68,0.08)" }}>
                <div style={{ ...styles.sectionTitle, color: "#f87171" }}>🚨 Critical Stock Alert</div>
                {BLOOD_GROUPS.filter((g) => (data.bloodStock[g] || 0) < 5).map((g) => (
                  <div key={g} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem", fontSize: "0.88rem" }}>
                    <span><strong style={{ color: "#f87171" }}>{g}</strong> blood group</span>
                    <span style={{ color: "#ef4444", fontWeight: 700 }}>{data.bloodStock[g] || 0} units left</span>
                  </div>
                ))}
                <button style={{ ...styles.actionBtn("#ef4444"), width: "100%", padding: "0.6rem", marginTop: "0.5rem", borderRadius: "10px" }}>
                  Request Emergency Supply
                </button>
              </div>
            )}

            {/* Hospital Info */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>ℹ️ Hospital Info</div>
              {[
                ["📧 Email", data.hospital.email],
                ["📞 Phone", data.hospital.phone],
                ["📍 City", data.hospital.city],
                ["🪪 License", data.hospital.licenseNo],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem", fontSize: "0.85rem" }}>
                  <span style={{ opacity: 0.6, minWidth: 90 }}>{label}</span>
                  <span style={{ fontWeight: 600, wordBreak: "break-all" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}