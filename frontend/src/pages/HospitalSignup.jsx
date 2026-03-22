import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Alert
} from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaHospital, FaTint } from 'react-icons/fa';
import api from '../services/api';

const HOSPITAL_TYPES = ['Government', 'Private', 'Trust', 'Clinic', 'NGO'];

const validationSchema = Yup.object({
  name: Yup.string().min(3).required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required(),
  phone: Yup.string().matches(/^[6-9]\d{9}$/).required(),
  registrationNumber: Yup.string().required(),
  type: Yup.string().required(),
  address: Yup.object({
    street: Yup.string().required(),
    city: Yup.string().required(),
    state: Yup.string().required(),
    pincode: Yup.string().matches(/^\d{6}$/).required(),
  }),
});

const HospitalSignup = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);

  const toggleFacility = (f) => {
    setFacilities(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
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
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const payload = {
        ...values,
        facilities,
      };

      delete payload.confirmPassword;

      await api.post('/hospitals/register', payload);

      toast.success('Hospital registered!');
      navigate('/hospital/login');

    } catch (err) {
      const msg = err.response?.data?.message || 'Failed';
      setStatus(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">

      <Card className="p-4">
        <h3><FaHospital /> Register Hospital</h3>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values, errors, touched,
            handleChange, handleBlur,
            handleSubmit, isSubmitting, status
          }) => (
            <Form onSubmit={handleSubmit}>

              {status && <Alert>{status}</Alert>}

              <Form.Control
                name="name"
                placeholder="Hospital Name"
                value={values.name}
                onChange={handleChange}
              />

              <Form.Control
                name="email"
                placeholder="Email"
                value={values.email}
                onChange={handleChange}
              />

              <Button type="submit" disabled={isSubmitting}>
                Register
              </Button>

            </Form>
          )}
        </Formik>

      </Card>

    </Container>
  );
};

export default HospitalSignup;