import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaHospital } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { login } from '../redux/authSlice';
import './Auth.css';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal'
];

const SERVICES_OPTIONS = [
  'Blood Bank','ICU','Emergency','Surgery','Maternity',
  'Dialysis','Oncology','Orthopaedics','Cardiology','Neurology'
];

const HospitalSignup = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  const [form, setForm] = useState({
    name: '', registrationNumber: '', email: '', password: '',
    confirmPassword: '', phone: '', type: '',
    street: '', city: '', state: '', pincode: '',
    bloodBankAvailable: false, beds: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (!form.type) { toast.error('Please select hospital type'); return; }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }

    setLoading(true);
    try {
      // Step 1 — register
      await api.post('/hospitals', {
        name:               form.name,
        registrationNumber: form.registrationNumber,
        email:              form.email,
        password:           form.password,
        phone:              form.phone,
        type:               form.type,
        address:  { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        capacity: { bloodBank: form.bloodBankAvailable, beds: form.beds ? parseInt(form.beds) : 0 },
        services: selectedServices
      });

      toast.success('Hospital registered successfully! Logging you in…');

      // Step 2 — login via Redux thunk (sets store + localStorage correctly)
      const result = await dispatch(
        login({ email: form.email, password: form.password })
      );

      if (login.fulfilled.match(result)) {
        navigate('/hospital/dashboard');
      } else {
        // Registration succeeded but auto-login failed — redirect to login page
        navigate('/hospital/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center py-5">
          <Col md={9} lg={8}>
            <Card className="auth-card shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <FaHospital size={55} className="text-danger mb-3" />
                  <h2 className="fw-bold">Register Your Hospital</h2>
                  <p className="text-muted">Join DROPLIFE's hospital network</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  {/* ── Hospital info ──────────────────────── */}
                  <h5 className="text-danger mb-3">Hospital Information</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Hospital Name *</Form.Label>
                        <Form.Control name="name" required value={form.name}
                          onChange={handleChange} placeholder="e.g. City General Hospital" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Registration Number *</Form.Label>
                        <Form.Control name="registrationNumber" required
                          value={form.registrationNumber} onChange={handleChange}
                          placeholder="Government-issued reg. no." />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control type="email" name="email" required
                          autoComplete="email" value={form.email} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone *</Form.Label>
                        <Form.Control type="tel" name="phone" required
                          value={form.phone} onChange={handleChange}
                          placeholder="10-digit number" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password *</Form.Label>
                        <Form.Control type="password" name="password" required
                          autoComplete="new-password" minLength={6}
                          value={form.password} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password *</Form.Label>
                        <Form.Control type="password" name="confirmPassword" required
                          autoComplete="new-password"
                          value={form.confirmPassword} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Hospital Type *</Form.Label>
                        <Form.Select name="type" required value={form.type} onChange={handleChange}>
                          <option value="">Select type</option>
                          <option value="Government">Government</option>
                          <option value="Private">Private</option>
                          <option value="Trust">Trust</option>
                          <option value="Charitable">Charitable</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Total Beds</Form.Label>
                        <Form.Control type="number" name="beds" min="0"
                          value={form.beds} onChange={handleChange} placeholder="e.g. 200" />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Check type="checkbox" name="bloodBankAvailable"
                        label="This hospital has a blood bank"
                        checked={form.bloodBankAvailable} onChange={handleChange}
                        className="mb-3" />
                    </Col>
                  </Row>

                  {/* ── Address ─────────────────────────────── */}
                  <h5 className="text-danger mb-3 mt-2">Address</h5>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control name="street" value={form.street}
                          onChange={handleChange} placeholder="Street / Locality" />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>City *</Form.Label>
                        <Form.Control name="city" required value={form.city}
                          onChange={handleChange} placeholder="City" />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>State *</Form.Label>
                        <Form.Select name="state" required value={form.state} onChange={handleChange}>
                          <option value="">Select state</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Pincode</Form.Label>
                        <Form.Control name="pincode" value={form.pincode}
                          onChange={handleChange} placeholder="6-digit" maxLength={6} />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* ── Services ────────────────────────────── */}
                  <h5 className="text-danger mb-3 mt-2">Services Offered</h5>
                  <div className="mb-4 d-flex flex-wrap gap-2">
                    {SERVICES_OPTIONS.map((svc) => (
                      <Badge
                        key={svc}
                        bg={selectedServices.includes(svc) ? 'danger' : 'secondary'}
                        style={{ cursor: 'pointer', fontSize: '0.85rem', padding: '8px 12px' }}
                        onClick={() => toggleService(svc)}
                      >
                        {svc}
                      </Badge>
                    ))}
                  </div>

                  <Button type="submit" variant="danger" className="w-100" disabled={loading}>
                    {loading ? 'Registering…' : 'Register Hospital'}
                  </Button>

                  <p className="text-center text-muted mt-3">
                    Already registered?{' '}
                    <span
                      className="text-danger fw-bold"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/hospital/login')}
                    >
                      Login
                    </span>
                  </p>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HospitalSignup;