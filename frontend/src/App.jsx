import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import VoiceAssistant from "./components/VoiceAssistant";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Welcome           = lazy(() => import("./pages/Welcome"));
const Home              = lazy(() => import("./pages/Home"));
const Login             = lazy(() => import("./pages/Login"));
const Signup            = lazy(() => import("./pages/Signup"));
const ForgotPassword    = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword     = lazy(() => import("./pages/ResetPassword"));

// Donor
const DonorDashboard    = lazy(() => import("./pages/DonorDashboard"));

// User
const UserDashboard     = lazy(() => import("./pages/UserDashboard"));

// Hospital
const HospitalLogin     = lazy(() => import("./pages/HospitalLogin"));
const HospitalSignup    = lazy(() => import("./pages/HospitalSignup"));
const HospitalDashboard = lazy(() => import("./pages/HospitalDashboard"));
const HospitalBloodBank = lazy(() => import("./pages/HospitalBloodBank"));
const HospitalDeliveries= lazy(() => import("./pages/HospitalDeliveries"));
const HospitalRequests  = lazy(() => import("./pages/HospitalRequests"));
const HospitalPatients  = lazy(() => import("./pages/HospitalPatients"));
const HospitalStaff     = lazy(() => import("./pages/HospitalStaff"));

// Public
const HospitalsPublic   = lazy(() => import("./pages/HospitalsPublic"));
const BloodAvailability = lazy(() => import("./pages/BloodAvailability"));
const BloodRequest      = lazy(() => import("./pages/BloodRequest"));
const DonationCamps     = lazy(() => import("./pages/DonationCamps"));
const DonorList         = lazy(() => import("./pages/DonorList"));
const MapView           = lazy(() => import("./pages/MapView"));

// Admin
const AdminDashboard    = lazy(() => import("./pages/AdminDashboard"));
const BloodStockManagement = lazy(() => import("./pages/BloodStockManagement"));
const DeliveryRecords   = lazy(() => import("./pages/DeliveryRecords"));
const Analytics         = lazy(() => import("./pages/Analytics"));

// Other
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const About             = lazy(() => import("./pages/About"));
const Contact           = lazy(() => import("./pages/Contact"));
const Privacy           = lazy(() => import("./pages/Privacy"));
const Helpline          = lazy(() => import("./pages/Helpline"));

// ─── Layout wrapper ───────────────────────────────────────────────────────────
function Layout({ children, hideNav = false, hideFooter = false }) {
  return (
    <>
      {!hideNav && <Navbar />}
      <main style={{ minHeight: "100vh" }}>
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
      </main>
      {!hideFooter && <Footer />}
      <VoiceAssistant />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Welcome (no navbar/footer) */}
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Welcome />
              <VoiceAssistant />
            </Suspense>
          }
        />

        {/* Auth (no footer) */}
        <Route path="/login"           element={<Layout hideFooter><Login /></Layout>} />
        <Route path="/signup"          element={<Layout hideFooter><Signup /></Layout>} />
        <Route path="/forgot-password" element={<Layout hideFooter><ForgotPassword /></Layout>} />
        <Route path="/reset-password/:token" element={<Layout hideFooter><ResetPassword /></Layout>} />

        {/* Hospital Auth */}
        <Route path="/hospital/login"  element={<Layout hideFooter><HospitalLogin /></Layout>} />
        <Route path="/hospital/signup" element={<Layout hideFooter><HospitalSignup /></Layout>} />

        {/* Public pages with navbar */}
        <Route path="/home"              element={<Layout><Home /></Layout>} />
        <Route path="/hospitals"         element={<Layout><HospitalsPublic /></Layout>} />
        <Route path="/blood-availability" element={<Layout><BloodAvailability /></Layout>} />
        <Route path="/blood-request"     element={<Layout><BloodRequest /></Layout>} />
        <Route path="/donation-camps"    element={<Layout><DonationCamps /></Layout>} />
        <Route path="/donors"            element={<Layout><DonorList /></Layout>} />
        <Route path="/map"               element={<Layout><MapView /></Layout>} />
        <Route path="/about"             element={<Layout><About /></Layout>} />
        <Route path="/contact"           element={<Layout><Contact /></Layout>} />
        <Route path="/privacy"           element={<Layout><Privacy /></Layout>} />
        <Route path="/helpline"          element={<Layout><Helpline /></Layout>} />

        {/* Protected: Donor */}
        <Route
          path="/donor/dashboard"
          element={
            <Layout>
              <ProtectedRoute role="donor">
                <DonorDashboard />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Protected: User */}
        <Route
          path="/user/dashboard"
          element={
            <Layout>
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Protected: Hospital */}
        <Route
          path="/hospital/dashboard"
          element={
            <Layout hideNav>
              <ProtectedRoute hospitalOnly>
                <HospitalDashboard />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/hospital/blood-bank"
          element={
            <Layout hideNav>
              <ProtectedRoute hospitalOnly>
                <HospitalBloodBank />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/hospital/deliveries"
          element={
            <Layout hideNav>
              <ProtectedRoute hospitalOnly>
                <HospitalDeliveries />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/hospital/requests"
          element={
            <Layout hideNav>
              <ProtectedRoute hospitalOnly>
                <HospitalRequests />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/hospital/patients"
          element={
            <Layout hideNav>
              <ProtectedRoute hospitalOnly>
                <HospitalPatients />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/hospital/staff"
          element={
            <Layout hideNav>
              <ProtectedRoute hospitalOnly>
                <HospitalStaff />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Protected: Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <Layout hideNav>
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin/blood-stock"
          element={
            <Layout>
              <ProtectedRoute role="admin">
                <BloodStockManagement />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin/deliveries"
          element={
            <Layout>
              <ProtectedRoute role="admin">
                <DeliveryRecords />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <Layout>
              <ProtectedRoute role="admin">
                <Analytics />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Notifications (any logged-in user) */}
        <Route
          path="/notifications"
          element={
            <Layout>
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <Layout>
              <div style={{
                minHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Poppins', sans-serif",
                color: "#fff",
                background: "#0f172a",
                textAlign: "center",
                padding: "2rem",
              }}>
                <div style={{ fontSize: "4rem" }}>🩸</div>
                <h1 style={{ fontSize: "3rem", fontWeight: 900, color: "#f87171" }}>404</h1>
                <p style={{ opacity: 0.7 }}>Page not found</p>
                <a href="/" style={{ marginTop: "1rem", background: "#dc2626", color: "#fff", padding: "0.75rem 2rem", borderRadius: "12px", textDecoration: "none", fontWeight: 700 }}>
                  Go Home
                </a>
              </div>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}