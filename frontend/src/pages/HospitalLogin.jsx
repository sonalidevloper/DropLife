import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../redux/authSlice';
import { FaHospital } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth.css';

const HospitalLogin = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user, isLoading, isError, isSuccess, message } =
    useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email:    Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required')
    }),
    onSubmit: (values) => dispatch(login(values))
  });

  useEffect(() => {
    if (isError) toast.error(message);

    if (isSuccess && user && user.role === 'hospital') {
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/hospital/dashboard');
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
                  <FaHospital size={60} className="text-danger mb-3" />
                  <h2 className="fw-bold">Hospital Login</h2>
                  <p className="text-muted">Access your hospital panel</p>
                </div>

                <Form onSubmit={formik.handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hospital Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter hospital email"
                      name="email"
                      autoComplete="email"
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
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      name="password"
                      autoComplete="current-password"
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
                    className="w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in…' : 'Login'}
                  </Button>

                  <div className="text-center">
                    <p className="mb-1">
                      Not registered?{' '}
                      <Link to="/hospital/signup" className="text-danger fw-bold">
                        Register Hospital
                      </Link>
                    </p>
                    <p className="mb-0">
                      <Link to="/login" className="text-muted">
                        Donor / User Login
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HospitalLogin;