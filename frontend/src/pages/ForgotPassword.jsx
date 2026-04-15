import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTint } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={5}>
            <Card className="auth-card shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <FaTint size={55} className="text-danger mb-3" />
                  <h2 className="fw-bold">Forgot Password</h2>
                  <p className="text-muted">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                {sent ? (
                  <div className="text-center">
                    <div className="alert alert-success">
                      ✅ Reset link sent! Check your email inbox.
                    </div>
                    <Link to="/login" className="btn btn-danger mt-3">
                      Back to Login
                    </Link>
                  </div>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your registered email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="danger"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Sending…' : 'Send Reset Link'}
                    </Button>

                    <div className="text-center">
                      <Link to="/login" className="text-muted">
                        ← Back to Login
                      </Link>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;