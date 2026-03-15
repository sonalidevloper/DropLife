import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin, reset } from '../redux/authSlice';
import { toast } from 'react-toastify';
import { FaUserShield } from 'react-icons/fa';
import './Auth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: (values) => {
      dispatch(adminLogin(values));
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && user && user.role === 'admin') {
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="auth-card shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <FaUserShield size={60} className="text-danger mb-3" />
                  <h2 className="fw-bold">Admin Portal</h2>
                  <p className="text-muted">Secure Admin Access</p>
                </div>

                <Form onSubmit={formik.handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Admin Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter admin email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={formik.touched.email && formik.errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Admin Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter admin password"
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={formik.touched.password && formik.errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="danger"
                    className="w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Admin Login'}
                  </Button>
                </Form>

                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Default: admin@droplife.com / Admin@123
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;