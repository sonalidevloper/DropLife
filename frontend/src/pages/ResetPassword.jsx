import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaTint, FaLock } from 'react-icons/fa';
import api from '../services/api';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      await api.put(`/auth/reset-password/${token}`, { password: values.password });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Link may be expired.';
      setStatus(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">Invalid reset link. <Link to="/forgot-password">Request a new one</Link></Alert>
      </Container>
    );
  }

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
              <h2 className="fw-bold mt-2">Reset Password</h2>
              <p className="text-muted">Enter your new password below</p>
            </div>

            <Card className="shadow border-0">
              <Card.Body className="p-4">
                <Formik
                  initialValues={{ password: '', confirmPassword: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit, isSubmitting, status }) => (
                    <Form noValidate onSubmit={formikSubmit}>
                      {status && <Alert variant="danger">{status}</Alert>}

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaLock className="me-1" />New Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && !!errors.password}
                          placeholder="Enter new password"
                        />
                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>
                          <FaLock className="me-1" />Confirm Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                          placeholder="Confirm new password"
                        />
                        <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="danger"
                        className="w-100 fw-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>

            <div className="text-center mt-3">
              <Link to="/login" className="text-danger small">← Back to Login</Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword;
