import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaUser, FaSave } from 'react-icons/fa';
import api from '../services/api';

const profileSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone: Yup.string().required('Phone is required'),
  address: Yup.string(),
});

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setProfile(res.data.data || res.data);
    }).catch(() => {
      toast.error('Failed to load profile');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Container className="py-5 text-center"><div className="spinner-border text-danger" /></Container>;

  const initial = { name: profile?.name || '', phone: profile?.phone || '', address: profile?.address || '' };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white d-flex align-items-center gap-2">
              <FaUser /> <strong>My Profile</strong>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#0d6efd', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white' }}>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <h5 className="mt-2">{profile?.name}</h5>
                <small className="text-muted">{profile?.email}</small>
              </div>
              <Formik initialValues={initial} validationSchema={profileSchema} enableReinitialize
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    await api.put('/auth/update-profile', values);
                    toast.success('Profile updated!');
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Update failed');
                  } finally { setSubmitting(false); }
                }}>
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control name="name" value={values.name} onChange={handleChange} onBlur={handleBlur}
                        isInvalid={touched.name && errors.name} />
                      <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control name="phone" value={values.phone} onChange={handleChange} onBlur={handleBlur}
                        isInvalid={touched.phone && errors.phone} />
                      <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label>Address</Form.Label>
                      <Form.Control name="address" value={values.address} onChange={handleChange} onBlur={handleBlur} />
                    </Form.Group>
                    <Button type="submit" variant="primary" disabled={isSubmitting} className="d-flex align-items-center gap-2">
                      <FaSave /> {isSubmitting ? 'Saving...' : 'Save Changes'}
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
