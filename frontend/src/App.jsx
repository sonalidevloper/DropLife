import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';

// Existing Pages
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BloodRequest from './pages/BloodRequest';
import BloodAvailability from './pages/BloodAvailability';
import DonationCamps from './pages/DonationCamps';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Helpline from './pages/Helpline';

// New Pages
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';
import HospitalsPublic from './pages/HospitalsPublic';
import HospitalDetail from './pages/HospitalDetail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Hospital
import HospitalLogin from './pages/HospitalLogin';
import HospitalSignup from './pages/HospitalSignup';
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalBloodBank from './pages/HospitalBloodBank';
import HospitalDeliveries from './pages/HospitalDeliveries';
import HospitalRequests from './pages/HospitalRequests';
import HospitalPatients from './pages/HospitalPatients';
import HospitalStaff from './pages/HospitalStaff';

// User
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import UserRequests from './pages/UserRequests';

// Donor
import DonorDashboard from './pages/DonorDashboard';
import DonorProfile from './pages/DonorProfile';
import DonationHistory from './pages/DonationHistory';

// Admin
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DeliveryRecords from './pages/DeliveryRecords';
import AdminCamps from './pages/AdminCamps';

// Notifications
import NotificationsPage from './pages/NotificationsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  return (
    <Router>
      <div className="App">

        <Navbar />
        <VoiceAssistant />

        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blood-request" element={<BloodRequest />} />
          <Route path="/blood-availability" element={<BloodAvailability />} />
          <Route path="/camps" element={<DonationCamps />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/helpline" element={<Helpline />} />

          {/* PUBLIC FEATURES */}
          <Route path="/map" element={<MapView />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/hospitals" element={<HospitalsPublic />} />
          <Route path="/hospitals/:id" element={<HospitalDetail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* AUTH */}
          <Route path="/hospital/login" element={<HospitalLogin />} />
          <Route path="/hospital/register" element={<HospitalSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* COMMON PROTECTED */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* USER ROUTES */}
          <Route
            path="/user/dashboard"
            element={<ProtectedRoute><UserDashboard /></ProtectedRoute>}
          />
          <Route
            path="/user/profile"
            element={<ProtectedRoute><UserProfile /></ProtectedRoute>}
          />
          <Route
            path="/user/requests"
            element={<ProtectedRoute><UserRequests /></ProtectedRoute>}
          />

          {/* DONOR ROUTES */}
          <Route
            path="/donor/dashboard"
            element={<ProtectedRoute><DonorDashboard /></ProtectedRoute>}
          />
          <Route
            path="/donor/profile"
            element={<ProtectedRoute><DonorProfile /></ProtectedRoute>}
          />
          <Route
            path="/donor/history"
            element={<ProtectedRoute><DonationHistory /></ProtectedRoute>}
          />

          {/* HOSPITAL ROUTES */}
          <Route
            path="/hospital/dashboard"
            element={<ProtectedRoute hospitalOnly><HospitalDashboard /></ProtectedRoute>}
          />
          <Route
            path="/hospital/blood-bank"
            element={<ProtectedRoute hospitalOnly><HospitalBloodBank /></ProtectedRoute>}
          />
          <Route
            path="/hospital/deliveries"
            element={<ProtectedRoute hospitalOnly><HospitalDeliveries /></ProtectedRoute>}
          />
          <Route
            path="/hospital/requests"
            element={<ProtectedRoute hospitalOnly><HospitalRequests /></ProtectedRoute>}
          />
          <Route
            path="/hospital/patients"
            element={<ProtectedRoute hospitalOnly><HospitalPatients /></ProtectedRoute>}
          />
          <Route
            path="/hospital/staff"
            element={<ProtectedRoute hospitalOnly><HospitalStaff /></ProtectedRoute>}
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/deliveries"
            element={<ProtectedRoute adminOnly><DeliveryRecords /></ProtectedRoute>}
          />
          <Route
            path="/admin/analytics"
            element={<ProtectedRoute adminOnly><Analytics /></ProtectedRoute>}
          />
          <Route
            path="/admin/hospitals"
            element={<ProtectedRoute adminOnly><HospitalsPublic /></ProtectedRoute>}
          />
          <Route
            path="/admin/camps"
            element={<ProtectedRoute adminOnly><AdminCamps /></ProtectedRoute>}
          />

        </Routes>

        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />

      </div>
    </Router>
  );
}

export default App;