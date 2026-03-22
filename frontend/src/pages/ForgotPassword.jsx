import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Alert
} from 'react-bootstrap';
import { FaTint, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // 🔹 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });

      setSent(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to send reset link. Try again.';

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5}>

            {/* HEADER */}
            <div className="text-center mb-4">
              <FaTint className="text-danger" style={{ fontSize: '3rem' }} />
              <h2 className="fw-bold mt-2">Forgot Password</h2>
              <p className="text-muted">
                Enter your email to receive a reset link
              </p>
            </div>

            {/* CARD */}
            <Card className="shadow border-0">
              <Card.Body className="p-4">

                {sent ? (
                  // ✅ SUCCESS STATE
                  <div className="text-center py-3">
                    <div style={{ fontSize: '3rem' }}>📧</div>

                    <h5 className="mt-3 fw-bold text-success">
                      Email Sent!
                    </h5>

                    <p className="text-muted">
                      Password reset link sent to{' '}
                      <strong>{email}</strong>.
                      <br />
                      Please check your inbox.
                    </p>

                    <Link to="/login" className="btn btn-danger mt-2">
                      Back to Login
                    </Link>
                  </div>
                ) : (
                  // 🔹 FORM
                  <Form onSubmit={handleSubmit}>

                    {error && (
                      <Alert variant="danger">
                        {error}
                      </Alert>
                    )}

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaEnvelope className="me-1" />
                        Email Address
                      </Form.Label>

                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="danger"
                      className="w-100 fw-semibold"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                  </Form>
                )}

              </Card.Body>
            </Card>

            {/* BACK LINK */}
            {!sent && (
              <div className="text-center mt-3">
                <Link to="/login" className="text-danger small">
                  ← Back to Login
                </Link>
              </div>
            )}

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;