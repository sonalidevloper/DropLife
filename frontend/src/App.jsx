import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';

// Pages
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

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
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
          
          {/* Donor Protected Routes */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
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