import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { FaCampground, FaCalendar, FaMapMarkerAlt, FaClock, FaUsers } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import './DonationCamps.css';

const DonationCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchCamps();
  }, [filter]);

  const fetchCamps = async () => {
    try {
      const response = await api.get(`/camps?status=${filter === 'upcoming' ? 'Upcoming' : ''}&upcoming=${filter === 'upcoming'}`);
      setCamps(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch camps');
      setLoading(false);
    }
  };

  const handleRegister = async (campId) => {
    if (!token) {
      toast.warning('Please login to register for camps');
      return;
    }

    try {
      const response = await api.post(`/camps/${campId}/register`);
      toast.success(response.data.message);
      fetchCamps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const isRegistered = (camp) => {
    if (!user) return false;
    return camp.registeredDonors?.some((rd) => rd.donor._id === user.id);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="donation-camps-page">
      <Container className="py-5">
        <Row>
          <Col md={12} className="text-center mb-5">
            <FaCampground size={60} className="text-danger mb-3" />
            <h2 className="fw-bold">Blood Donation Camps</h2>
            <p className="text-muted">Join a camp and save lives</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6} className="mx-auto">
            <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="upcoming">Upcoming Camps</option>
              <option value="all">All Camps</option>
            </Form.Select>
          </Col>
        </Row>

        <Row>
          {camps.length === 0 ? (
            <Col md={12} className="text-center">
              <p className="text-muted">No camps available at the moment</p>
            </Col>
          ) : (
            camps.map((camp) => (
              <Col md={6} lg={4} key={camp._id} className="mb-4">
                <Card className="camp-card h-100 shadow">
                  {camp.image && (
                    <Card.Img
                      variant="top"
                      src={camp.image}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <div className="mb-2">
                      <Badge bg={camp.status === 'Upcoming' ? 'success' : 'secondary'}>
                        {camp.status}
                      </Badge>
                    </div>
                    <Card.Title className="fw-bold">{camp.name}</Card.Title>
                    <Card.Text className="text-muted">{camp.description}</Card.Text>

                    <div className="camp-details">
                      <p className="mb-2">
                        <FaCalendar className="me-2 text-danger" />
                        <strong>Date:</strong> {new Date(camp.date).toLocaleDateString()}
                      </p>
                      <p className="mb-2">
                        <FaClock className="me-2 text-danger" />
                        <strong>Time:</strong> {camp.startTime} - {camp.endTime}
                      </p>
                      <p className="mb-2">
                        <FaMapMarkerAlt className="me-2 text-danger" />
                        <strong>Venue:</strong> {camp.venue.name}
                      </p>
                      <p className="mb-2 text-muted">{camp.venue.address}</p>
                      <p className="mb-2">
                        <FaUsers className="me-2 text-danger" />
                        <strong>Registered:</strong> {camp.registeredDonors?.length || 0} donors
                      </p>
                      <p className="mb-2">
                        <strong>Organizer:</strong> {camp.organizer}
                      </p>
                      <p className="mb-0">
                        <strong>Contact:</strong> {camp.contactPerson?.name} -{' '}
                        {camp.contactPerson?.phone}
                      </p>
                    </div>

                    {camp.bloodGroups && camp.bloodGroups.length > 0 && (
                      <div className="mt-3">
                        <strong>Blood Groups Needed:</strong>
                        <div className="mt-2">
                          {camp.bloodGroups.map((bg) => (
                            <Badge key={bg} bg="danger" className="me-1">
                              {bg}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-white border-0 text-center">
                    {isRegistered(camp) ? (
                      <Badge bg="success" className="py-2 px-4">
                        ✓ Registered
                      </Badge>
                    ) : (
                      <Button
                        variant="danger"
                        onClick={() => handleRegister(camp._id)}
                        disabled={camp.status !== 'Upcoming'}
                      >
                        Register for Camp
                      </Button>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </div>
  );
};

export default DonationCamps;