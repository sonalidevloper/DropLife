import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Alert
} from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaTint, FaHospital } from 'react-icons/fa';
import api from '../services/api';

const HOSPITAL_TYPES = ['Government', 'Private', 'Trust', 'Clinic', 'NGO'];
const FACILITIES_LIST = [
  'ICU', 'Blood Bank', 'Trauma Center', 'Dialysis', 'Emergency',
  'Maternity', 'Pediatrics', 'Cardiac', 'Orthopedic', 'Neurology',
];
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const validationSchema = Yup.object({
  name: Yup.string().min(3).required('Hospital name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Confirm password is required'),
  phone: Yup.string().matches(/^[6-9]\d{9}$/, 'Enter valid 10-digit phone').required('Phone is required'),
  registrationNumber: Yup.string().required('Registration number is required'),
  type: Yup.string().required('Hospital type is required'),
  address: Yup.object({
    street: Yup.string().required('Street is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    pincode: Yup.string().matches(/^\d{6}$/, 'Enter valid 6-digit pincode').required('Pincode is required'),
  }),
});

const HospitalSignup = () => {
  const navigate = useNavigate();
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  const toggleFacility = (f) => {
    setSelectedFacilities((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    registrationNumber: '',
    type: '',
    address: { street: '', city: '', state: '', pincode: '' },
    hasBloodBank: false,
    operatingHours: { open: '08:00', close: '20:00', isOpen24Hours: false },
    emergencyContact: { name: '', phone: '' },
    website: '',
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const payload = { ...values, facilities: selectedFacilities };
      delete payload.confirmPassword;
      await api.post('/hospitals/register', payload);
      toast.success('Hospital registered successfully! Please login.');
      navigate('/hospital/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      setStatus(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="py-5"
      style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)', minHeight: '100vh' }}
    >
      <Container>
        <div className="text-center mb-4">
          <FaHospital className="text-danger" style={{ fontSize: '3rem' }} />
          <h2 className="fw-bold mt-2">Register Your Hospital</h2>
          <p className="text-muted">Join DropLife's hospital network</p>
        </div>

        <Card className="shadow border-0 mx-auto" style={{ maxWidth: 900 }}>
          <Card.Body className="p-4">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit, isSubmitting, status, setFieldValue }) => (
                <Form noValidate onSubmit={formikSubmit}>
                  {status && <Alert variant="danger">{status}</Alert>}

                  {/* Section 1: Basic Info */}
                  <h5 className="fw-bold text-danger border-bottom pb-2 mb-3">
                    <FaTint className="me-2" />Basic Information
                  </h5>
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Hospital Name *</Form.Label>
                        <Form.Control
                          name="name" value={values.name}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.name && !!errors.name}
                          placeholder="City General Hospital"
                        />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email" name="email" value={values.email}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.email && !!errors.email}
                          placeholder="admin@hospital.com"
                        />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Password *</Form.Label>
                        <Form.Control
                          type="password" name="password" value={values.password}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.password && !!errors.password}
                        />
                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Confirm Password *</Form.Label>
                        <Form.Control
                          type="password" name="confirmPassword" value={values.confirmPassword}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                        />
                        <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Phone *</Form.Label>
                        <Form.Control
                          name="phone" value={values.phone}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.phone && !!errors.phone}
                          placeholder="9876543210"
                        />
                        <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Registration Number *</Form.Label>
                        <Form.Control
                          name="registrationNumber" value={values.registrationNumber}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.registrationNumber && !!errors.registrationNumber}
                        />
                        <Form.Control.Feedback type="invalid">{errors.registrationNumber}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Hospital Type *</Form.Label>
                        <Form.Select
                          name="type" value={values.type}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.type && !!errors.type}
                        >
                          <option value="">Select type</option>
                          {HOSPITAL_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Website</Form.Label>
                        <Form.Control
                          name="website" value={values.website}
                          onChange={handleChange} placeholder="https://hospital.com"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <Form.Check
                        type="switch"
                        id="hasBloodBank"
                        name="hasBloodBank"
                        label="Has Blood Bank"
                        checked={values.hasBloodBank}
                        onChange={handleChange}
                        className="mb-2"
                      />
                    </Col>
                  </Row>

                  {/* Section 2: Address */}
                  <h5 className="fw-bold text-danger border-bottom pb-2 mb-3">Address</h5>
                  <Row className="g-3 mb-4">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Street *</Form.Label>
                        <Form.Control
                          name="address.street" value={values.address.street}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.address?.street && !!errors.address?.street}
                          placeholder="123 Hospital Road"
                        />
                        <Form.Control.Feedback type="invalid">{errors.address?.street}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>City *</Form.Label>
                        <Form.Control
                          name="address.city" value={values.address.city}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.address?.city && !!errors.address?.city}
                        />
                        <Form.Control.Feedback type="invalid">{errors.address?.city}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>State *</Form.Label>
                        <Form.Select
                          name="address.state" value={values.address.state}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.address?.state && !!errors.address?.state}
                        >
                          <option value="">Select state</option>
                          {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.address?.state}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Pincode *</Form.Label>
                        <Form.Control
                          name="address.pincode" value={values.address.pincode}
                          onChange={handleChange} onBlur={handleBlur}
                          isInvalid={touched.address?.pincode && !!errors.address?.pincode}
                          placeholder="400001"
                        />
                        <Form.Control.Feedback type="invalid">{errors.address?.pincode}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Section 3: Facilities */}
                  <h5 className="fw-bold text-danger border-bottom pb-2 mb-3">Facilities</h5>
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {FACILITIES_LIST.map((f) => (
                      <Button
                        key={f}
                        type="button"
                        variant={selectedFacilities.includes(f) ? 'danger' : 'outline-danger'}
                        size="sm"
                        onClick={() => toggleFacility(f)}
                      >
                        {f}
                      </Button>
                    ))}
                  </div>

                  {/* Section 4: Operating Hours */}
                  <h5 className="fw-bold text-danger border-bottom pb-2 mb-3">Operating Hours</h5>
                  <Row className="g-3 mb-4">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Open Time</Form.Label>
                        <Form.Control
                          type="time" name="operatingHours.open" value={values.operatingHours.open}
                          onChange={handleChange}
                          disabled={values.operatingHours.isOpen24Hours}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Close Time</Form.Label>
                        <Form.Control
                          type="time" name="operatingHours.close" value={values.operatingHours.close}
                          onChange={handleChange}
                          disabled={values.operatingHours.isOpen24Hours}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex align-items-end">
                      <Form.Check
                        type="switch"
                        id="isOpen24Hours"
                        name="operatingHours.isOpen24Hours"
                        label="24 Hours"
                        checked={values.operatingHours.isOpen24Hours}
                        onChange={handleChange}
                        className="mb-2"
                      />
                    </Col>
                  </Row>

                  {/* Section 5: Emergency Contact */}
                  <h5 className="fw-bold text-danger border-bottom pb-2 mb-3">Emergency Contact</h5>
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Contact Name</Form.Label>
                        <Form.Control
                          name="emergencyContact.name" value={values.emergencyContact.name}
                          onChange={handleChange} placeholder="Dr. Ramesh Kumar"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Contact Phone</Form.Label>
                        <Form.Control
                          name="emergencyContact.phone" value={values.emergencyContact.phone}
                          onChange={handleChange} placeholder="9876543210"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between align-items-center">
                    <Link to="/hospital/login" className="btn btn-outline-secondary">
                      Back to Login
                    </Link>
                    <Button type="submit" variant="danger" disabled={isSubmitting} className="px-5">
                      {isSubmitting ? 'Registering...' : 'Register Hospital'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default HospitalSignup;
