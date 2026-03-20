import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaUser, FaTint, FaSave } from 'react-icons/fa';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const profileSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone: Yup.string().required('Phone is required'),
  bloodGroup: Yup.string().required('Blood group is required'),
  address: Yup.string(),
  age: Yup.number().min(18, 'Must be at least 18').max(65, 'Must be under 65'),
  weight: Yup.number().min(45, 'Minimum weight 45 kg'),
  medicalConditions: Yup.string(),
});

const DonorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/donor/profile');
        setProfile(res.data.data || res.data);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await api.put('/donor/profile', values);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Container className="py-5 text-center">
      <div className="spinner-border text-danger" role="status" />
    </Container>
  );

  const initial = {
    name: profile?.name || '',
    phone: profile?.phone || '',
    bloodGroup: profile?.bloodGroup || '',
    address: profile?.address || '',
    age: profile?.age || '',
    weight: profile?.weight || '',
    medicalConditions: profile?.medicalConditions || '',
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-danger text-white d-flex align-items-center gap-2">
              <FaUser /> <strong>Donor Profile</strong>
              {profile?.isVerified && (
                <Badge bg="success" className="ms-auto">✓ Verified</Badge>
              )}
            </Card.Header>
            <Card.Body className="p-4">
              <Formik initialValues={initial} validationSchema={profileSchema} onSubmit={handleSubmit} enableReinitialize>
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formSubmit, isSubmitting }) => (
                  <Form onSubmit={formSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            name="name" value={values.name}
                            onChange={handleChange} onBlur={handleBlur}
                            isInvalid={touched.name && errors.name}
                          />
                          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            name="phone" value={values.phone}
                            onChange={handleChange} onBlur={handleBlur}
                            isInvalid={touched.phone && errors.phone}
                          />
                          <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label><FaTint className="text-danger" /> Blood Group</Form.Label>
                          <Form.Select
                            name="bloodGroup" value={values.bloodGroup}
                            onChange={handleChange} onBlur={handleBlur}
                            isInvalid={touched.bloodGroup && errors.bloodGroup}
                          >
                            <option value="">Select Blood Group</option>
                            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors.bloodGroup}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Age</Form.Label>
                          <Form.Control
                            type="number" name="age" value={values.age}
                            onChange={handleChange} onBlur={handleBlur}
                            isInvalid={touched.age && errors.age}
                          />
                          <Form.Control.Feedback type="invalid">{errors.age}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Weight (kg)</Form.Label>
                          <Form.Control
                            type="number" name="weight" value={values.weight}
                            onChange={handleChange} onBlur={handleBlur}
                            isInvalid={touched.weight && errors.weight}
                          />
                          <Form.Control.Feedback type="invalid">{errors.weight}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            name="address" value={values.address}
                            onChange={handleChange} onBlur={handleBlur}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Medical Conditions (if any)</Form.Label>
                          <Form.Control
                            as="textarea" rows={2}
                            name="medicalConditions" value={values.medicalConditions}
                            onChange={handleChange} onBlur={handleBlur}
                            placeholder="None"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button type="submit" variant="danger" disabled={isSubmitting} className="d-flex align-items-center gap-2">
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

export default DonorProfile;
