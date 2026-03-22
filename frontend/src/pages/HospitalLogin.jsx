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

const schema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required()
});

const HospitalLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const res = await api.post('/hospitals/login', values);

      const { token, hospital } = res.data;

      const user = { ...hospital, role: 'hospital' };

      // ❗ FIX: proper Redux dispatch
      dispatch(login({ token, user }));

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login success');
      navigate('/hospital/dashboard');

    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setStatus(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4">

        <h3><FaTint /> Hospital Login</h3>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, handleChange, values, status }) => (
            <Form onSubmit={handleSubmit}>

              {status && <Alert>{status}</Alert>}

              <Form.Control
                name="email"
                placeholder="Email"
                value={values.email}
                onChange={handleChange}
              />

              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={values.password}
                onChange={handleChange}
              />

              <Button type="submit">Login</Button>

            </Form>
          )}
        </Formik>

        <Link to="/forgot-password">Forgot Password?</Link>

      </Card>
    </Container>
  );
};

export default HospitalLogin;