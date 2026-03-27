import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';

// ── Lazy-loaded pages ─────────────────────────────────────────────
const Welcome           = lazy(() => import('./pages/Welcome'));
const Home              = lazy(() => import('./pages/Home'));
const Login             = lazy(() => import('./pages/Login'));
const Signup            = lazy(() => import('./pages/Signup'));
const ForgotPassword    = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword     = lazy(() => import('./pages/ResetPassword'));

const DonorDashboard    = lazy(() => import('./pages/DonorDashboard'));
const UserDashboard     = lazy(() => import('./pages/UserDashboard'));

const HospitalLogin     = lazy(() => import('./pages/HospitalLogin'));
const HospitalSignup    = lazy(() => import('./pages/HospitalSignup'));
const HospitalDashboard = lazy(() => import('./pages/HospitalDashboard'));
const HospitalBloodBank = lazy(() => import('./pages/HospitalBloodBank'));
const HospitalDeliveries= lazy(() => import('./pages/HospitalDeliveries'));
const HospitalRequests  = lazy(() => import('./pages/HospitalRequests'));
const HospitalPatients  = lazy(() => import('./pages/HospitalPatients'));
const HospitalStaff     = lazy(() => import('./pages/HospitalStaff'));

const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'));
const DeliveryRecords   = lazy(() => import('./pages/DeliveryRecords'));

const BloodRequest      = lazy(() => import('./pages/BloodRequest'));
const BloodAvailability = lazy(() => import('./pages/BloodAvailability'));
const DonationCamps     = lazy(() => import('./pages/DonationCamps'));
const DonorList         = lazy(() => import('./pages/DonorList'));
const BloodStockManagement = lazy(() => import('./pages/BloodStockManagement'));
const HospitalsPublic   = lazy(() => import('./pages/HospitalsPublic'));
const MapView           = lazy(() => import('./pages/MapView'));
const Analytics         = lazy(() => import('./pages/Analytics'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

const About             = lazy(() => import('./pages/About'));
const Contact           = lazy(() => import('./pages/Contact'));
const Privacy           = lazy(() => import('./pages/Privacy'));
const Helpline          = lazy(() => import('./pages/Helpline'));

// ── Route guards ──────────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector(s => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/home" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { token } = useSelector(s => s.auth);
  if (token) return <Navigate to="/home" replace />;
  return children;
}

// ── Fallback spinner ──────────────────────────────────────────────
const Fallback = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'70vh', flexDirection:'column', gap:16 }}>
    <div className="spinner" />
    <p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading...</p>
  </div>
);

export default function App() {
  return (
    <Router
      future={{
        v7_startTransition:   true,   // ← silences React Router v7 warnings
        v7_relativeSplatPath: true,
      }}
    >
      <Navbar />
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* ── Public ───────────────────────────────────────────── */}
          <Route path="/"                   element={<Welcome />} />
          <Route path="/home"               element={<Home />} />
          <Route path="/blood-availability" element={<BloodAvailability />} />
          <Route path="/donation-camps"     element={<DonationCamps />} />
          <Route path="/hospitals-public"   element={<HospitalsPublic />} />
          <Route path="/map"                element={<MapView />} />
          <Route path="/donor-list"         element={<DonorList />} />
          <Route path="/about"              element={<About />} />
          <Route path="/contact"            element={<Contact />} />
          <Route path="/privacy"            element={<Privacy />} />
          <Route path="/helpline"           element={<Helpline />} />

          {/* ── Auth (public only) ───────────────────────────────── */}
          <Route path="/login"          element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup"         element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/forgot-password"element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
          <Route path="/hospital-login" element={<PublicOnlyRoute><HospitalLogin /></PublicOnlyRoute>} />
          <Route path="/hospital-signup"element={<PublicOnlyRoute><HospitalSignup /></PublicOnlyRoute>} />

          {/* ── Donor / User ─────────────────────────────────────── */}
          <Route path="/donor-dashboard" element={<ProtectedRoute roles={['donor']}><DonorDashboard /></ProtectedRoute>} />
          <Route path="/user-dashboard"  element={<ProtectedRoute roles={['user','donor']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/blood-request"   element={<ProtectedRoute><BloodRequest /></ProtectedRoute>} />
          <Route path="/notifications"   element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* ── Hospital ─────────────────────────────────────────── */}
          <Route path="/hospital-dashboard"  element={<ProtectedRoute roles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
          <Route path="/hospital-blood-bank" element={<ProtectedRoute roles={['hospital']}><HospitalBloodBank /></ProtectedRoute>} />
          <Route path="/hospital-deliveries" element={<ProtectedRoute roles={['hospital']}><HospitalDeliveries /></ProtectedRoute>} />
          <Route path="/hospital-requests"   element={<ProtectedRoute roles={['hospital']}><HospitalRequests /></ProtectedRoute>} />
          <Route path="/hospital-patients"   element={<ProtectedRoute roles={['hospital']}><HospitalPatients /></ProtectedRoute>} />
          <Route path="/hospital-staff"      element={<ProtectedRoute roles={['hospital']}><HospitalStaff /></ProtectedRoute>} />

          {/* ── Admin ────────────────────────────────────────────── */}
          <Route path="/admin-dashboard"       element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/blood-stock-management"element={<ProtectedRoute roles={['admin','hospital']}><BloodStockManagement /></ProtectedRoute>} />
          <Route path="/delivery-records"      element={<ProtectedRoute roles={['admin','hospital']}><DeliveryRecords /></ProtectedRoute>} />
          <Route path="/analytics"             element={<ProtectedRoute roles={['admin','hospital']}><Analytics /></ProtectedRoute>} />

          {/* ── Catch-all ────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}