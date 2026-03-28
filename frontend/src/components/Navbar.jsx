import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import LanguageSelector from "./LanguageSelector";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setProfileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    const roleMap = {
      admin: "/admin/dashboard",
      donor: "/donor/dashboard",
      hospital: "/hospital/dashboard",
      user: "/user/dashboard",
    };
    return roleMap[user.role] || "/donor/dashboard";
  };

  const NAV_LINKS = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/hospitals", label: "Hospitals", icon: "🏥" },
    { to: "/blood-availability", label: "Blood Stock", icon: "🩸" },
    { to: "/donation-camps", label: "Camps", icon: "⛺" },
    { to: "/map", label: "Map", icon: "🗺️" },
    { to: "/blood-request", label: "Request Blood", icon: "📋", highlight: true },
  ];

  const isActive = (to) => location.pathname === to;

  const s = {
    nav: {
      position: "sticky",
      top: 0,
      zIndex: 8000,
      background: scrolled
        ? "rgba(10, 10, 30, 0.97)"
        : "linear-gradient(135deg, rgba(139, 0, 0, 0.97), rgba(60, 0, 0, 0.97))",
      backdropFilter: "blur(20px)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
      boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
      transition: "all 0.3s ease",
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    },
    inner: {
      maxWidth: 1300,
      margin: "0 auto",
      padding: "0 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 64,
      gap: "1rem",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      textDecoration: "none",
      color: "#fff",
      fontWeight: 900,
      fontSize: "1.3rem",
      letterSpacing: "-0.02em",
    },
    logoIcon: {
      fontSize: "1.6rem",
      animation: "heartbeat 2s ease-in-out infinite",
    },
    logoDrop: { color: "#f87171" },
    links: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
      flex: 1,
      justifyContent: "center",
    },
    link: (active, highlight) => ({
      padding: "0.5rem 0.85rem",
      borderRadius: "10px",
      textDecoration: "none",
      color: active ? "#fff" : highlight ? "#fca5a5" : "rgba(255,255,255,0.75)",
      fontWeight: active || highlight ? 700 : 500,
      fontSize: "0.88rem",
      background: active
        ? "rgba(255,255,255,0.15)"
        : highlight
        ? "rgba(220,38,38,0.3)"
        : "transparent",
      border: highlight ? "1px solid rgba(220,38,38,0.5)" : "none",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
    }),
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
    },
    profileBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "10px",
      padding: "0.45rem 0.9rem",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "0.85rem",
      fontFamily: "inherit",
    },
    profileAvatar: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: "0.85rem",
    },
    dropdown: {
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      width: 220,
      background: "#1a1a2e",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "16px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      overflow: "hidden",
      zIndex: 9000,
    },
    dropHeader: {
      padding: "1rem",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
    },
    dropName: { fontWeight: 700, fontSize: "0.95rem", color: "#fff" },
    dropEmail: { fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" },
    dropRole: { display: "inline-block", background: "rgba(220,38,38,0.2)", color: "#f87171", borderRadius: "6px", padding: "1px 8px", fontSize: "0.7rem", fontWeight: 700, marginTop: "4px", textTransform: "capitalize" },
    dropItem: {
      display: "block",
      padding: "0.7rem 1rem",
      color: "rgba(255,255,255,0.8)",
      textDecoration: "none",
      fontSize: "0.88rem",
      transition: "background 0.15s",
      cursor: "pointer",
      border: "none",
      background: "transparent",
      width: "100%",
      textAlign: "left",
      fontFamily: "inherit",
    },
    logoutBtn: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "0.7rem 1rem",
      color: "#f87171",
      background: "transparent",
      border: "none",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      fontSize: "0.88rem",
      cursor: "pointer",
      fontFamily: "inherit",
    },
    authBtns: {
      display: "flex",
      gap: "0.5rem",
    },
    loginBtn: {
      padding: "0.5rem 1rem",
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "10px",
      color: "#fff",
      textDecoration: "none",
      fontWeight: 600,
      fontSize: "0.85rem",
    },
    signupBtn: {
      padding: "0.5rem 1rem",
      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
      border: "none",
      borderRadius: "10px",
      color: "#fff",
      textDecoration: "none",
      fontWeight: 700,
      fontSize: "0.85rem",
    },
    hamburger: {
      display: "none",
      background: "none",
      border: "none",
      color: "#fff",
      fontSize: "1.5rem",
      cursor: "pointer",
      padding: "0.3rem",
    },
    mobileMenu: {
      background: "rgba(10, 10, 30, 0.99)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    mobileLink: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.8rem 1rem",
      borderRadius: "12px",
      textDecoration: "none",
      color: active ? "#fff" : "rgba(255,255,255,0.75)",
      background: active ? "rgba(255,255,255,0.1)" : "transparent",
      fontWeight: active ? 700 : 500,
      fontSize: "0.95rem",
      transition: "all 0.15s",
    }),
  };

  return (
    <nav style={s.nav}>
      <style>{`
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .hamburger { display: block !important; }
          .right-section { gap: 0.4rem !important; }
          .lang-label { display: none !important; }
        }
      `}</style>

      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.logo}>
          <span style={s.logoIcon}>🩸</span>
          <span><span style={s.logoDrop}>Drop</span>Life</span>
        </Link>

        {/* Nav Links */}
        <div className="nav-links" style={s.links}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={s.link(isActive(link.to), link.highlight)}
              onMouseEnter={(e) => { if (!isActive(link.to)) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { if (!isActive(link.to) && !link.highlight) e.currentTarget.style.background = "transparent"; else if (link.highlight && !isActive(link.to)) e.currentTarget.style.background = "rgba(220,38,38,0.3)"; }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="right-section" style={s.rightSection}>
          <LanguageSelector compact />
          {user && <NotificationBell />}

          {user ? (
            <div ref={profileRef} style={{ position: "relative" }}>
              <button style={s.profileBtn} onClick={() => setProfileOpen(!profileOpen)}>
                <div style={s.profileAvatar}>{user.name?.[0]?.toUpperCase() || "U"}</div>
                <span className="lang-label">{user.name?.split(" ")[0]}</span>
                <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{profileOpen ? "▲" : "▼"}</span>
              </button>
              {profileOpen && (
                <div style={s.dropdown}>
                  <div style={s.dropHeader}>
                    <div style={s.dropName}>{user.name}</div>
                    <div style={s.dropEmail}>{user.email}</div>
                    <span style={s.dropRole}>{user.role}</span>
                  </div>
                  {getDashboardLink() && (
                    <Link to={getDashboardLink()} style={s.dropItem}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      📊 Dashboard
                    </Link>
                  )}
                  <Link to="/profile" style={s.dropItem}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    👤 Profile
                  </Link>
                  <Link to="/notifications" style={s.dropItem}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    🔔 Notifications
                  </Link>
                  <button style={s.logoutBtn} onClick={handleLogout}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={s.authBtns}>
              <Link to="/login" style={s.loginBtn}>Login</Link>
              <Link to="/signup" style={s.signupBtn}>Sign Up</Link>
            </div>
          )}

          {/* Hamburger */}
          <button className="hamburger" style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} style={s.mobileLink(isActive(link.to))}>
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          {!user && (
            <>
              <Link to="/login" style={s.mobileLink(false)}>🔑 Login</Link>
              <Link to="/signup" style={{ ...s.mobileLink(false), background: "rgba(220,38,38,0.2)", color: "#f87171" }}>🩸 Sign Up</Link>
            </>
          )}
          {user && (
            <>
              {getDashboardLink() && <Link to={getDashboardLink()} style={s.mobileLink(false)}>📊 Dashboard</Link>}
              <button onClick={handleLogout} style={{ ...s.mobileLink(false), border: "none", cursor: "pointer", color: "#f87171", background: "rgba(220,38,38,0.1)" }}>
                🚪 Sign Out
              </button>
            </>
          )}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
            <LanguageSelector />
          </div>
        </div>
      )}
    </nav>
  );
}