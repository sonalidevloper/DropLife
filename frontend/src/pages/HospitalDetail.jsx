import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaHospital, FaTint, FaPhone, FaMapMarkerAlt, FaClock, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const BLOOD_GROUP_COLORS = { 'A+': 'danger', 'A-': 'warning', 'B+': 'primary', 'B-': 'info', 'AB+': 'success', 'AB-': 'secondary', 'O+': 'dark', 'O-': 'danger' };

const HospitalDetail = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/hospitals/${id}`);
        setHospital(res.data.data || res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Hospital not found');
        toast.error('Failed to load hospital details');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <Container className="py-5 text-center"><div className="spinner-border text-danger" /></Container>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert><Link to="/hospitals"><Button variant="danger">Back to Hospitals</Button></Link></Container>;
  if (!hospital) return null;

  return (
    <Container className="py-4">
      <Link to="/hospitals" className="btn btn-outline-secondary btn-sm mb-3 d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
        <FaArrowLeft /> Back to Hospitals
      </Link>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-start gap-3">
                <div style={{ width: 60, height: 60, borderRadius: 12, background: '#0d6efd20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaHospital className="text-primary fs-4" />
                </div>
                <div className="flex-grow-1">
                  <h4 className="fw-bold mb-1">{hospital.name}</h4>
                  <p className="text-muted mb-1"><FaMapMarkerAlt className="me-1" />{hospital.address?.city}, {hospital.address?.state}</p>
                  <div className="d-flex gap-2 flex-wrap">
                    {hospital.isVerified && <Badge bg="success"><FaCheckCircle /> Verified</Badge>}
                    {hospital.hasBloodBank && <Badge bg="danger"><FaTint /> Blood Bank</Badge>}
                    {hospital.type && <Badge bg="secondary">{hospital.type}</Badge>}
                    {hospital.operatingHours?.isOpen24Hours && <Badge bg="warning" text="dark"><FaClock /> 24/7 Open</Badge>}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white fw-bold d-flex align-items-center gap-2">
              <FaTint className="text-danger" /> Blood Availability
            </Card.Header>
            <Card.Body>
              {hospital.bloodAvailability?.length > 0 ? (
                <Row className="g-2">
                  {hospital.bloodAvailability.map((b) => (
                    <Col xs={6} md={3} key={b.bloodGroup}>
                      <div className={`text-center p-2 rounded ${b.unitsAvailable > 10 ? 'bg-success bg-opacity-10' : b.unitsAvailable > 0 ? 'bg-warning bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                        <Badge bg={BLOOD_GROUP_COLORS[b.bloodGroup] || 'secondary'} className="d-block mb-1">{b.bloodGroup}</Badge>
                        <div className="fw-bold">{b.unitsAvailable} units</div>
                        <small className={`text-${b.unitsAvailable > 10 ? 'success' : b.unitsAvailable > 0 ? 'warning' : 'danger'}`}>
                          {b.unitsAvailable > 10 ? 'Available' : b.unitsAvailable > 0 ? 'Low Stock' : 'Unavailable'}
                        </small>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info" className="mb-0">Blood availability data not published.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Header className="bg-white fw-bold">Contact Information</Card.Header>
            <Card.Body>
              <p className="mb-2"><FaPhone className="me-2 text-primary" />{hospital.phone || 'Not available'}</p>
              <p className="mb-2"><strong>Email:</strong> {hospital.email || 'Not available'}</p>
              <p className="mb-0"><FaMapMarkerAlt className="me-2 text-danger" />{hospital.address?.street}, {hospital.address?.city}</p>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0 mb-3">
            <Card.Header className="bg-white fw-bold">Services</Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                {hospital.services?.map(s => <li key={s} className="mb-1">✓ {s}</li>) || <li className="text-muted">No services listed</li>}
              </ul>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold">Operating Hours</Card.Header>
            <Card.Body>
              {hospital.operatingHours?.isOpen24Hours ? (
                <Badge bg="success">Open 24/7</Badge>
              ) : (
                <>
                  <p className="mb-1"><strong>Open:</strong> {hospital.operatingHours?.open || '—'}</p>
                  <p className="mb-0"><strong>Close:</strong> {hospital.operatingHours?.close || '—'}</p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HospitalDetail;
