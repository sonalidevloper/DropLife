import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner
} from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaTint, FaLock } from 'react-icons/fa';
import api from '../services/api';

const schema = Yup.object({
  password: Yup.string()
    .min(6, 'Minimum 6 characters')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Required'),
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [validToken, setValidToken] = useState(true);
  const [checking, setChecking] = useState(true);

  // 🔥 Validate token first
  useEffect(() => {
    const checkToken = async () => {
      try {
        await api.get(`/auth/validate-reset-token/${token}`);
      } catch {
        setValidToken(false);
      } finally {
        setChecking(false);
      }
    };

    if (token) checkToken();
    else setValidToken(false);
  }, [token]);

  // 🔥 Submit
  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      await api.put(`/auth/reset-password/${token}`, {
        password: values.password,
      });

      toast.success('Password reset successful');
      navigate('/login');

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Reset failed. Link expired.';

      setStatus(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 🔥 Loading state
  if (checking) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  // 🔴 Invalid token
  if (!validToken) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          Invalid or expired link.
          <br />
          <Link to="/forgot-password">Request again</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>

            <Card className="shadow">
              <Card.Body>

                <h3 className="text-center mb-4">
                  <FaTint /> Reset Password
                </h3>

                <Formik
                  initialValues={{ password: '', confirmPassword: '' }}
                  validationSchema={schema}
                  onSubmit={handleSubmit}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleSubmit,
                    isSubmitting,
                    status
                  }) => (
                    <Form onSubmit={handleSubmit}>

                      {status && <Alert>{status}</Alert>}

                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="New Password"
                        value={values.password}
                        onChange={handleChange}
                        isInvalid={touched.password && !!errors.password}
                      />

                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                        className="mt-3"
                      />

                      <Button
                        type="submit"
                        className="w-100 mt-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                      </Button>

                    </Form>
                  )}
                </Formik>

              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword;