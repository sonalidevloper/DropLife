import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Alert, Badge
} from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaUser, FaSave } from 'react-icons/fa';
import api from '../services/api';

// 🔹 Validation Schema
const profileSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Enter valid 10-digit phone')
    .required('Phone is required'),
  address: Yup.string(),
});

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setProfile(res.data.data || res.data);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 🔴 Loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-danger" />
      </Container>
    );
  }

  // 🔴 Safety check
  if (!profile) {
    return (
      <Container className="py-5">
        <Alert variant="danger">User data not available</Alert>
      </Container>
    );
  }

  // 🔹 Initial values
  const initialValues = {
    name: profile.name || '',
    phone: profile.phone || '',
    address: profile.address || '',
  };

  // 🔹 Submit
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const res = await api.put('/auth/update-profile', values);

      setProfile(res.data.data || values);

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">

      <Row className="justify-content-center">
        <Col lg={6}>

          <Card className="shadow-sm border-0">

            {/* HEADER */}
            <Card.Header className="bg-danger text-white d-flex align-items-center">
              <FaUser className="me-2" />
              <strong>User Profile</strong>

              {profile?.isVerified && (
                <Badge bg="success" className="ms-auto">
                  Verified
                </Badge>
              )}
            </Card.Header>

            {/* FORM */}
            <Card.Body className="p-4">

              <Formik
                initialValues={initialValues}
                validationSchema={profileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit: formSubmit,
                  isSubmitting
                }) => (
                  <Form noValidate onSubmit={formSubmit}>

                    {/* NAME */}
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && !!errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* PHONE */}
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.phone && !!errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* ADDRESS */}
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>

                    {/* EMAIL (READ ONLY) */}
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        value={profile.email || ''}
                        readOnly
                        disabled
                      />
                    </Form.Group>

                    {/* SAVE BUTTON */}
                    <Button
                      type="submit"
                      variant="danger"
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
                      disabled={isSubmitting}
                    >
                      <FaSave />
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>

                  </Form>
                )}
              </Formik>

            </Card.Body>

          </Card>

        </Col>
      </Row>

    </Container>
  );
};

export default UserProfile;