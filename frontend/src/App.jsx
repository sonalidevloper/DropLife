import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';

// Public Pages
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Register from './pages/Register'; // FIXED
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Helpline from './pages/Helpline';

// Donor Pages
import DonorDashboard from './pages/DonorDashboard';

// Hospital Pages
import HospitalSignup from './pages/HospitalSignup';
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalDetail from './pages/HospitalDetail'; // FIXED
import HospitalPatients from './pages/HospitalPatients'; // FIXED
import HospitalBloodBank from './pages/HospitalBloodBank';
import HospitalsPublic from './pages/HospitalsPublic';

// Shared Pages
import BloodRequest from './pages/BloodRequest';
import BloodAvailability from './pages/BloodAvailability';
import DonationCamps from './pages/DonationCamps';
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DonorList from './pages/DonorList';
import BloodStockManagement from './pages/BloodStockManagement';

// User Pages
import UserDashboard from './pages/UserDashboard';

// Auth Pages
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/helpline" element={<Helpline />} />
          <Route path="/blood-request" element={<BloodRequest />} />
          <Route path="/blood-availability" element={<BloodAvailability />} />
          <Route path="/camps" element={<DonationCamps />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/hospitals" element={<HospitalsPublic />} />
          <Route path="/hospitals/:id" element={<HospitalDetail />} />
          
          {/* Donor Routes */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute role="donor">
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Hospital Routes */}
          <Route path="/hospital/signup" element={<HospitalSignup />} />
          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute role="hospital">
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/blood-bank"
            element={
              <ProtectedRoute role="hospital">
                <HospitalBloodBank />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/patients"
            element={
              <ProtectedRoute role="hospital">
                <HospitalPatients />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donors"
            element={
              <ProtectedRoute role="admin">
                <DonorList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blood-stock"
            element={
              <ProtectedRoute role="admin">
                <BloodStockManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute role="admin">
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
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
          theme="colored"
        />
      </div>
    </Router>
  );
}

export default App;