import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../services/api';
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../utils/constants';
import { FaHandHoldingMedical } from 'react-icons/fa';
import './BloodRequest.css';

const BloodRequest = () => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      patientName: '',
      bloodGroup: '',
      unitsRequired: 1,
      urgency: 'Normal',
      hospitalName: '',
      hospitalAddress: '',
      hospitalPhone: '',
      requesterName: '',
      requesterPhone: '',
      requesterEmail: '',
      needByDate: '',
      notes: '',
      latitude: 0,
      longitude: 0,
    },
    validationSchema: Yup.object({
      patientName: Yup.string().required('Patient name is required'),
      bloodGroup: Yup.string().required('Blood group is required'),
      unitsRequired: Yup.number().min(1, 'At least 1 unit required').required('Units required'),
      hospitalName: Yup.string().required('Hospital name is required'),
      hospitalAddress: Yup.string().required('Hospital address is required'),
      hospitalPhone: Yup.string().required('Hospital phone is required'),
      requesterName: Yup.string().required('Your name is required'),
      requesterPhone: Yup.string()
        .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
        .required('Your phone is required'),
      requesterEmail: Yup.string().email('Invalid email'),
      needByDate: Yup.date().required('Need by date is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        // Get coordinates from browser geolocation or use default
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const requestData = {
                patientName: values.patientName,
                bloodGroup: values.bloodGroup,
                unitsRequired: values.unitsRequired,
                urgency: values.urgency,
                hospital: {
                  name: values.hospitalName,
                  address: values.hospitalAddress,
                  phone: values.hospitalPhone,
                  location: {
                    type: 'Point',
                    coordinates: [position.coords.longitude, position.coords.latitude],
                  },
                },
                requesterName: values.requesterName,
                requesterPhone: values.requesterPhone,
                requesterEmail: values.requesterEmail,
                needByDate: values.needByDate,
                notes: values.notes,
              };

              const response = await api.post('/blood-request', requestData);
              toast.success(response.data.message);
              resetForm();
              setLoading(false);
            },
            (error) => {
              toast.warning('Location access denied. Using default location.');
              submitWithDefaultLocation(values, resetForm);
            }
          );
        } else {
          submitWithDefaultLocation(values, resetForm);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create blood request');
        setLoading(false);
      }
    },
  });

  const submitWithDefaultLocation = async (values, resetForm) => {
    try {
      const requestData = {
        patientName: values.patientName,
        bloodGroup: values.bloodGroup,
        unitsRequired: values.unitsRequired,
        urgency: values.urgency,
        hospital: {
          name: values.hospitalName,
          address: values.hospitalAddress,
          phone: values.hospitalPhone,
          location: {
            type: 'Point',
            coordinates: [85.8245, 20.2961], // Default to Bhubaneswar, Odisha
          },
        },
        requesterName: values.requesterName,
        requesterPhone: values.requesterPhone,
        requesterEmail: values.requesterEmail,
        needByDate: values.needByDate,
        notes: values.notes,
      };

      const response = await api.post('/blood-request', requestData);
      toast.success(response.data.message);
      resetForm();
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create blood request');
      setLoading(false);
    }
  };

  return (
    <div className="blood-request-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="request-card shadow-lg">
              <Card.Header className="bg-danger text-white text-center py-4">
                <FaHandHoldingMedical size={50} className="mb-3" />
                <h2 className="fw-bold mb-0">Emergency Blood Request</h2>
                <p className="mb-0">Help is on the way</p>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={formik.handleSubmit}>
                  <Row>
                    {/* Patient Information */}
                    <Col md={12}>
                      <h5 className="text-danger mb-3">Patient Information</h5>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Patient Name *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter patient name"
                          name="patientName"
                          value={formik.values.patientName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={formik.touched.patientName && formik.errors.patientName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.patientName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Blood Group *</Form.Label>
                        <Form.Select
                          name="bloodGroup"
                          value={formik.values.bloodGroup}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={formik.touched.bloodGroup && formik.errors.bloodGroup}
                        >
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.bloodGroup}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Units *</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          name="unitsRequired"
                          value={formik.values.unitsRequired}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={formik.touched.unitsRequired && formik.errors.unitsRequired}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.unitsRequired}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Urgency Level *</Form.Label>
                        <Form.Select
                          name="urgency"
                          value={formik.values.urgency}
                          onChange={formik.handleChange}
                        >
                          {URGENCY_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Need By Date *</Form.Label>
                        <Form.Control
                          type="date"
                          name="needByDate"
                          value={formik.values.needByDate}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={formik.touched.needByDate && formik.errors.needByDate}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.needByDate}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Hospital Information */}
                    <Col md={12}>
                      <h5 className="text-danger mb-3 mt-3">Hospital Information</h5>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Hospital Name *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter hospital name"
                          name="hospitalName"
                          value={formik.values.hospitalName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={formik.touched.hospitalName && formik.errors.hospitalName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.hospitalName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Hospital Phone *</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="10-digit phone"
                          name="hospitalPhone"
                          value={formik.values.hospitalPhone}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={formik.touched.hospitalPhone && formik.errors.hospitalPhone}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.hospitalPhone}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Hospital Address *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter complete hospital address"
                          name="hospitalAddress"
                          value={formik.values.hospitalAddress}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={formik.touched.hospitalAddress && formik.errors.hospitalAddress}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.hospitalAddress}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Requester Information */}
                    <Col md={12}>
                      <h5 className="text-danger mb-3 mt-3">Your Contact Information</h5>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Name *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your name"
                          name="requesterName"
                          value={formik.values.requesterName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={formik.touched.requesterName && formik.errors.requesterName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.requesterName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Phone *</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="10-digit phone"
                          name="requesterPhone"
                          value={formik.values.requesterPhone}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={formik.touched.requesterPhone && formik.errors.requesterPhone}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.requesterPhone}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter your email"
                          name="requesterEmail"
                          value={formik.values.requesterEmail}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={formik.touched.requesterEmail && formik.errors.requesterEmail}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.requesterEmail}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Additional Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Any additional information..."
                          name="notes"
                          value={formik.values.notes}
                          onChange={formik.handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-center mt-4">
                    <Button type="submit" variant="danger" size="lg" disabled={loading} className="px-5">
                      {loading ? 'Submitting Request...' : 'Submit Blood Request'}
                    </Button>
                  </div>

                  <div className="text-center mt-3">
                    <small className="text-muted">
                      * Your request will be sent to nearby donors matching the blood group
                    </small>
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

export default BloodRequest;