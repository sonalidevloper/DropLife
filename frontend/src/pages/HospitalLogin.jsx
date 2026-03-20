import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { FaTint } from 'react-icons/fa';
import api from '../services/api';
import { login } from '../redux/authSlice';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const HospitalLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const res = await api.post('/hospitals/login', values);
      const { token, hospital } = res.data;
      localStorage.setItem('token', token);
      const userObj = { ...hospital, role: 'hospital' };
      localStorage.setItem('user', JSON.stringify(userObj));
      dispatch(login.fulfilled({ token, user: userObj }, '', values));
      toast.success('Welcome to Hospital Portal!');
      navigate('/hospital/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      setStatus(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)' }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5}>
            <div className="text-center mb-4">
              <FaTint className="text-danger" style={{ fontSize: '3rem' }} />
              <h2 className="fw-bold mt-2">Hospital Portal Login</h2>
              <p className="text-muted">Access your hospital management dashboard</p>
            </div>
            <Card className="shadow border-0">
              <Card.Body className="p-4">
                <Formik
                  initialValues={{ email: '', password: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit, isSubmitting, status }) => (
                    <Form noValidate onSubmit={formikSubmit}>
                      {status && <Alert variant="danger">{status}</Alert>}

                      <Form.Group className="mb-3">
                        <Form.Label>Hospital Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.email && !!errors.email}
                          placeholder="hospital@example.com"
                        />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && !!errors.password}
                          placeholder="Enter password"
                        />
                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                      </Form.Group>

                      <div className="d-flex justify-content-end mb-3">
                        <Link to="/forgot-password" className="text-danger small">
                          Forgot Password?
                        </Link>
                      </div>

                      <Button
                        type="submit"
                        variant="danger"
                        className="w-100 fw-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>

            <div className="text-center mt-3">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/hospital/register" className="text-danger fw-semibold">
                Register your hospital
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HospitalLogin;
