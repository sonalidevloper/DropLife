import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaTint, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle, FaBell } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const DonorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [bloodRequests, setBloodRequests] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchBloodRequests();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/donor/profile');
      setProfile(response.data.data);
      setIsAvailable(response.data.data.isAvailable);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch profile');
      setLoading(false);
    }
  };

  const fetchBloodRequests = async () => {
    try {
      const response = await api.get('/blood-request?status=Open');
      setBloodRequests(response.data.data);
    } catch (error) {
      console.error('Failed to fetch blood requests');
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      const response = await api.put('/donor/availability', {
        isAvailable: !isAvailable,
      });
      setIsAvailable(!isAvailable);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleRespondToRequest = async (requestId, response) => {
    try {
      await api.put(`/blood-request/${requestId}/respond`, { response });
      toast.success(`You have ${response.toLowerCase()} the blood request`);
      fetchBloodRequests();
    } catch (error) {
      toast.error('Failed to respond to request');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const canDonate = profile?.lastDonationDate
    ? Math.floor((Date.now() - new Date(profile.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)) >= 90
    : true;

  return (
    <div className="dashboard-page">
      <Container className="py-5">
        <Row>
          <Col md={12}>
            <div className="dashboard-header mb-4">
              <h2 className="fw-bold">
                Welcome back, {user?.name}! <FaTint className="text-danger" />
              </h2>
              <p className="text-muted">Thank you for being a lifesaver</p>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Profile Card */}
          <Col md={4} className="mb-4">
            <Card className="dashboard-card h-100 shadow">
              <Card.Body>
                <div className="text-center mb-3">
                  <div className="profile-avatar mb-3">
                    <FaTint size={50} className="text-danger" />
                  </div>
                  <h4 className="fw-bold">{profile?.name}</h4>
                  <Badge bg="danger" className="mb-2" style={{ fontSize: '1.2rem' }}>
                    {profile?.bloodGroup}
                  </Badge>
                  <p className="text-muted mb-0">{profile?.email}</p>
                  <p className="text-muted">{profile?.phone}</p>
                </div>

                <div className="availability-toggle">
                  <Form.Check
                    type="switch"
                    id="availability-switch"
                    label={isAvailable ? 'Available to Donate' : 'Not Available'}
                    checked={isAvailable}
                    onChange={handleAvailabilityToggle}
                    className={isAvailable ? 'text-success' : 'text-danger'}
                  />
                </div>

                <hr />

                <div className="donor-stats">
                  <div className="stat-item mb-2">
                    <FaCalendarAlt className="me-2" />
                    <strong>Total Donations:</strong> {profile?.donationCount}
                  </div>
                  <div className="stat-item mb-2">
                    <FaMapMarkerAlt className="me-2" />
                    <strong>Location:</strong> {profile?.address?.city}, {profile?.address?.state}
                  </div>
                  {profile?.lastDonationDate && (
                    <div className="stat-item mb-2">
                      <FaCheckCircle className="me-2" />
                      <strong>Last Donation:</strong>{' '}
                      {new Date(profile.lastDonationDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className={`stat-item ${canDonate ? 'text-success' : 'text-warning'}`}>
                    <strong>Status:</strong> {canDonate ? 'Eligible to Donate' : 'Wait 90 days'}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Blood Requests */}
          <Col md={8} className="mb-4">
            <Card className="dashboard-card shadow">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">
                  <FaBell className="me-2" />
                  Active Blood Requests Nearby
                </h5>
              </Card.Header>
              <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {bloodRequests.length === 0 ? (
                  <p className="text-center text-muted">No active blood requests at the moment</p>
                ) : (
                  bloodRequests.map((request) => (
                    <Card key={request._id} className="mb-3 border-start border-danger border-4">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={8}>
                            <h5 className="fw-bold">{request.patientName}</h5>
                            <p className="mb-1">
                              <Badge bg="danger">{request.bloodGroup}</Badge>{' '}
                              <Badge bg={request.urgency === 'Critical' ? 'danger' : 'warning'}>
                                {request.urgency}
                              </Badge>
                            </p>
                            <p className="mb-1">
                              <strong>Units Required:</strong> {request.unitsRequired}
                            </p>
                            <p className="mb-1">
                              <strong>Hospital:</strong> {request.hospital.name}
                            </p>
                            <p className="mb-1 text-muted">
                              <FaMapMarkerAlt className="me-1" />
                              {request.hospital.address}
                            </p>
                            <p className="mb-0 text-muted">
                              <strong>Contact:</strong> {request.requesterName} - {request.requesterPhone}
                            </p>
                          </Col>
                          <Col md={4} className="text-end">
                            <Button
                              variant="success"
                              className="me-2 mb-2"
                              onClick={() => handleRespondToRequest(request._id, 'Accepted')}
                              disabled={!canDonate}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline-secondary"
                              onClick={() => handleRespondToRequest(request._id, 'Declined')}
                            >
                              Decline
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Stats */}
        <Row>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-primary text-white text-center p-3">
              <h3>{profile?.donationCount}</h3>
              <p className="mb-0">Total Donations</p>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-success text-white text-center p-3">
              <h3>{profile?.donationCount * 3}</h3>
              <p className="mb-0">Lives Saved</p>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-warning text-white text-center p-3">
              <h3>{bloodRequests.length}</h3>
              <p className="mb-0">Active Requests</p>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-danger text-white text-center p-3">
              <h3>{profile?.bloodGroup}</h3>
              <p className="mb-0">Blood Group</p>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DonorDashboard;