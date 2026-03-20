import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';

// Existing Pages
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DonorDashboard from './pages/DonorDashboard';
import BloodRequest from './pages/BloodRequest';
import BloodAvailability from './pages/BloodAvailability';
import DonationCamps from './pages/DonationCamps';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DonorList from './pages/DonorList';
import BloodStockManagement from './pages/BloodStockManagement';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Helpline from './pages/Helpline';

// New Pages
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';
import HospitalsPublic from './pages/HospitalsPublic';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import HospitalLogin from './pages/HospitalLogin';
import HospitalSignup from './pages/HospitalSignup';
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalBloodBank from './pages/HospitalBloodBank';
import HospitalDeliveries from './pages/HospitalDeliveries';
import HospitalRequests from './pages/HospitalRequests';
import HospitalPatients from './pages/HospitalPatients';
import HospitalStaff from './pages/HospitalStaff';
import NotificationsPage from './pages/NotificationsPage';
import UserDashboard from './pages/UserDashboard';
import DeliveryRecords from './pages/DeliveryRecords';

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
          {/* Public Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/helpline" element={<Helpline />} />
          <Route path="/blood-request" element={<BloodRequest />} />
          <Route path="/blood-availability" element={<BloodAvailability />} />
          <Route path="/camps" element={<DonationCamps />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/hospitals" element={<HospitalsPublic />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/hospital/login" element={<HospitalLogin />} />
          <Route path="/hospital/register" element={<HospitalSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected — any logged-in user */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Donor Protected Routes */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Hospital Protected Routes */}
          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute hospitalOnly={true}>
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/blood-bank"
            element={
              <ProtectedRoute hospitalOnly={true}>
                <HospitalBloodBank />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/deliveries"
            element={
              <ProtectedRoute hospitalOnly={true}>
                <HospitalDeliveries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/requests"
            element={
              <ProtectedRoute hospitalOnly={true}>
                <HospitalRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/patients"
            element={
              <ProtectedRoute hospitalOnly={true}>
                <HospitalPatients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/staff"
            element={
              <ProtectedRoute hospitalOnly={true}>
                <HospitalStaff />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donors"
            element={
              <ProtectedRoute adminOnly={true}>
                <DonorList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blood-stock"
            element={
              <ProtectedRoute adminOnly={true}>
                <BloodStockManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/deliveries"
            element={
              <ProtectedRoute adminOnly={true}>
                <DeliveryRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute adminOnly={true}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hospitals"
            element={
              <ProtectedRoute adminOnly={true}>
                <HospitalsPublic />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;