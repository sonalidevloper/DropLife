import React, { useEffect, useCallback } from 'react';
import { useState } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Form, Tabs, Tab
} from 'react-bootstrap';
import {
  FaCampground, FaCalendar, FaMapMarkerAlt, FaClock, FaUsers, FaMap
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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

  const fetchCamps = useCallback(async () => {
    try {
      const response = await api.get(
        `/camps?status=${filter === 'upcoming' ? 'Upcoming' : ''}&upcoming=${filter === 'upcoming'}`
      );
      setCamps(response.data.data || []);
    } catch {
      setCamps([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

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
    return camp.registeredDonors?.some(
      (rd) => (rd.donor?._id || rd.donor) === user.id
    );
  };

  if (loading) return <LoadingSpinner />;

  const mapCamps = camps.filter(
    (c) => c.venue?.location?.coordinates?.some((v) => v !== 0)
  );

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
          <Col md={6}>
            <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="upcoming">Upcoming Camps</option>
              <option value="all">All Camps</option>
            </Form.Select>
          </Col>
        </Row>

        <Tabs defaultActiveKey="list" className="mb-4">
          <Tab eventKey="list" title={<><FaCampground className="me-1" />List View</>}>
            <Row>
              {camps.length === 0 ? (
                <Col className="text-center py-5">
                  <p className="text-muted">No camps available at the moment.</p>
                </Col>
              ) : (
                camps.map((camp) => (
                  <Col md={6} lg={4} key={camp._id} className="mb-4">
                    <Card className="camp-card h-100 shadow">
                      {camp.image && (
                        <Card.Img
                          variant="top"
                          src={camp.image}
                          style={{ height: '180px', objectFit: 'cover' }}
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
                          <p className="mb-1">
                            <FaCalendar className="me-2 text-danger" />
                            {new Date(camp.date).toLocaleDateString()}
                          </p>
                          <p className="mb-1">
                            <FaClock className="me-2 text-danger" />
                            {camp.startTime} – {camp.endTime}
                          </p>
                          <p className="mb-1">
                            <FaMapMarkerAlt className="me-2 text-danger" />
                            {camp.venue?.name}
                          </p>
                          <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
                            {camp.venue?.address}
                          </p>
                          <p className="mb-1">
                            <FaUsers className="me-2 text-danger" />
                            {camp.registeredDonors?.length || 0} registered
                          </p>
                        </div>
                        {camp.bloodGroups?.length > 0 && (
                          <div className="mt-2">
                            {camp.bloodGroups.map((bg) => (
                              <Badge key={bg} bg="danger" className="me-1">{bg}</Badge>
                            ))}
                          </div>
                        )}
                      </Card.Body>
                      <Card.Footer className="bg-white border-0 text-center">
                        {isRegistered(camp) ? (
                          <Badge bg="success" className="py-2 px-4">✓ Registered</Badge>
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
          </Tab>

          <Tab eventKey="map" title={<><FaMap className="me-1" />Map View</>}>
            <Card className="shadow">
              <Card.Body className="p-0" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                {mapCamps.length === 0 ? (
                  <div className="text-center p-5 text-muted">
                    No camps with location data available.
                  </div>
                ) : (
                  <MapContainer
                    center={[
                      mapCamps[0].venue.location.coordinates[1],
                      mapCamps[0].venue.location.coordinates[0]
                    ]}
                    zoom={11}
                    style={{ height: '480px', width: '100%' }}
                    scrollWheelZoom
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mapCamps.map((camp) => (
                      <Marker
                        key={camp._id}
                        position={[
                          camp.venue.location.coordinates[1],
                          camp.venue.location.coordinates[0]
                        ]}
                      >
                        <Popup>
                          <strong>{camp.name}</strong><br />
                          {new Date(camp.date).toLocaleDateString()}<br />
                          {camp.startTime} – {camp.endTime}<br />
                          {camp.venue.name}
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default DonationCamps;