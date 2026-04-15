import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import './App.css';

// Public Pages
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Helpline from './pages/Helpline';
import VoiceAssistant from './components/VoiceAssistant';
// Donor Pages
import DonorDashboard from './pages/DonorDashboard';

// Hospital Pages
import HospitalSignup from './pages/HospitalSignup';
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalDetail from './pages/HospitalDetail';
import HospitalPatients from './pages/HospitalPatients';
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

// Protected Home component - only for logged in users
const ProtectedHome = () => {
  const { token } = useSelector((state) => state.auth);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Home />
  ;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Welcome Page - Always accessible */}
          <Route path="/" element={<Welcome />} />
          
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Hospital Auth */}
          <Route path="/hospital/signup" element={<HospitalSignup />} />
          
          {/* Protected Home - Requires login */}
          <Route path="/home" element={<ProtectedHome />} />
          
          {/* Public Info Pages - Accessible without login */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/helpline" element={<Helpline />} />
          
          {/* Protected Public Features - Requires login */}
          <Route
            path="/blood-request"
            element={
              <ProtectedRoute>
                <BloodRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blood-availability"
            element={
              <ProtectedRoute>
                <BloodAvailability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/camps"
            element={
              <ProtectedRoute>
                <DonationCamps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals"
            element={
              <ProtectedRoute>
                <HospitalsPublic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals/:id"
            element={
              <ProtectedRoute>
                <HospitalDetail />
              </ProtectedRoute>
            }
          />
          
          {/* Donor Protected Routes */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute role="donor">
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* User Protected Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Hospital Protected Routes */}
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
          
          {/* Admin Protected Routes */}
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

          {/* 404 Not Found */}
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
        <VoiceAssistant />
      </div>
    </Router>
    
  );
}

export default App;