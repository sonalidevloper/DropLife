import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Form, Modal
} from 'react-bootstrap';
import {
  FaTint, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle,
  FaBell, FaCamera, FaMap
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, shadowUrl: iconShadow });

const DonorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/donor/profile');
      setProfile(response.data.data);
      setIsAvailable(response.data.data.isAvailable);
    } catch {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBloodRequests = useCallback(async () => {
    try {
      const response = await api.get('/blood-request?status=Open');
      setBloodRequests(response.data.data || []);
    } catch {
      // Silently ignore
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchBloodRequests();
  }, [fetchProfile, fetchBloodRequests]);

  const handleAvailabilityToggle = async () => {
    try {
      const response = await api.put('/donor/availability', {
        isAvailable: !isAvailable
      });
      setIsAvailable(!isAvailable);
      toast.success(response.data.message);
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const handleRespondToRequest = async (requestId, response) => {
    try {
      await api.put(`/blood-request/${requestId}/respond`, { response });
      toast.success(`You have ${response.toLowerCase()} the blood request`);
      fetchBloodRequests();
    } catch {
      toast.error('Failed to respond to request');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be under 5 MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) { toast.error('Select an image first'); return; }
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await api.put('/donor/profile-image', { imageUrl: uploadRes.data.data.url });
      toast.success('Profile picture updated!');
      setShowImageModal(false);
      fetchProfile();
    } catch {
      toast.error('Upload failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  const canDonate = profile?.lastDonationDate
    ? Math.floor((Date.now() - new Date(profile.lastDonationDate).getTime()) / 86400000) >= 90
    : true;

  const donorCoords = profile?.location?.coordinates;
  const mapCenter = donorCoords && donorCoords[0] !== 0
    ? [donorCoords[1], donorCoords[0]]
    : [20.2961, 85.8245];

  return (
    <div className="dashboard-page">
      <Container className="py-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="dashboard-header">
              <h2 className="fw-bold">
                Welcome back, {user?.name}! <FaTint className="text-danger" />
              </h2>
              <p className="text-muted">Thank you for being a lifesaver</p>
            </div>
          </Col>
        </Row>

        <Row>
          {/* ── Profile Card ─────────────────────────────────── */}
          <Col md={4} className="mb-4">
            <Card className="dashboard-card h-100 shadow">
              <Card.Body>
                <div className="text-center mb-3">
                  {/* Profile image */}
                  <div
                    className="profile-avatar mb-2"
                    style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                    onClick={() => setShowImageModal(true)}
                  >
                    {profile?.profileImage &&
                    profile.profileImage !== 'https://res.cloudinary.com/demo/image/upload/avatar.jpg' ? (
                      <img
                        src={profile.profileImage}
                        alt="Profile"
                        style={{
                          width: '100px', height: '100px',
                          borderRadius: '50%', objectFit: 'cover',
                          border: '3px solid #dc3545'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100px', height: '100px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto'
                        }}
                      >
                        <FaTint size={40} className="text-white" />
                      </div>
                    )}
                    <span
                      style={{
                        position: 'absolute', bottom: 0, right: 0,
                        background: '#dc3545', borderRadius: '50%',
                        width: 26, height: 26, display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <FaCamera size={12} className="text-white" />
                    </span>
                  </div>

                  <h4 className="fw-bold mt-2">{profile?.name}</h4>
                  <Badge bg="danger" style={{ fontSize: '1.1rem' }}>
                    {profile?.bloodGroup}
                  </Badge>
                  <p className="text-muted mb-0 mt-1">{profile?.email}</p>
                  <p className="text-muted">{profile?.phone}</p>
                </div>

                {/* Availability toggle */}
                <div
                  className="availability-toggle"
                  style={{
                    background: '#f8f9fa', padding: '12px',
                    borderRadius: '10px', textAlign: 'center'
                  }}
                >
                  <Form.Check
                    type="switch"
                    id="availability-switch"
                    label={isAvailable ? '✅ Available to Donate' : '❌ Not Available'}
                    checked={isAvailable}
                    onChange={handleAvailabilityToggle}
                  />
                </div>

                <hr />

                <div className="donor-stats">
                  <div className="stat-item mb-2">
                    <FaCalendarAlt className="me-2 text-danger" />
                    <strong>Donations:</strong> {profile?.donationCount || 0}
                  </div>
                  <div className="stat-item mb-2">
                    <FaMapMarkerAlt className="me-2 text-danger" />
                    <strong>Location:</strong> {profile?.address?.city}, {profile?.address?.state}
                  </div>
                  {profile?.lastDonationDate && (
                    <div className="stat-item mb-2">
                      <FaCheckCircle className="me-2 text-success" />
                      <strong>Last Donation:</strong>{' '}
                      {new Date(profile.lastDonationDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className={`stat-item ${canDonate ? 'text-success' : 'text-warning'}`}>
                    <strong>
                      {canDonate ? '✅ Eligible to Donate' : '⏳ Wait 90 days'}
                    </strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* ── Blood Requests ────────────────────────────────── */}
          <Col md={8} className="mb-4">
            <Card className="dashboard-card shadow">
              <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaBell className="me-2" />Active Blood Requests
                </h5>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                >
                  <FaMap className="me-1" />
                  {showMap ? 'Hide Map' : 'Show on Map'}
                </Button>
              </Card.Header>

              {/* Map toggle */}
              {showMap && (
                <div style={{ borderBottom: '1px solid #dee2e6' }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={11}
                    style={{ height: '280px', width: '100%' }}
                    scrollWheelZoom
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Circle
                      center={mapCenter}
                      radius={50000}
                      pathOptions={{
                        color: '#dc3545', fillColor: '#dc3545', fillOpacity: 0.07
                      }}
                    />
                    {bloodRequests.map((req) => {
                      const coords = req.hospital?.location?.coordinates;
                      if (!coords || (coords[0] === 0 && coords[1] === 0)) return null;
                      return (
                        <Marker key={req._id} position={[coords[1], coords[0]]}>
                          <Popup>
                            <strong>{req.hospital.name}</strong><br />
                            Patient: {req.patientName}<br />
                            Blood: <Badge bg="danger">{req.bloodGroup}</Badge><br />
                            Urgency: {req.urgency}
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              )}

              <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {bloodRequests.length === 0 ? (
                  <p className="text-center text-muted py-4">
                    No active blood requests at the moment
                  </p>
                ) : (
                  bloodRequests.map((request) => (
                    <Card
                      key={request._id}
                      className="mb-3 border-start border-danger border-4"
                    >
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={8}>
                            <h5 className="fw-bold">{request.patientName}</h5>
                            <p className="mb-1">
                              <Badge bg="danger">{request.bloodGroup}</Badge>{' '}
                              <Badge
                                bg={request.urgency === 'Critical' ? 'danger' : 'warning'}
                              >
                                {request.urgency}
                              </Badge>
                            </p>
                            <p className="mb-1">
                              <strong>Units:</strong> {request.unitsRequired}
                            </p>
                            <p className="mb-1">
                              <strong>Hospital:</strong> {request.hospital?.name}
                            </p>
                            <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
                              <FaMapMarkerAlt className="me-1" />
                              {request.hospital?.address}
                            </p>
                            <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                              <strong>Contact:</strong> {request.requesterName} —{' '}
                              {request.requesterPhone}
                            </p>
                          </Col>
                          <Col md={4} className="text-end">
                            <Button
                              variant="success"
                              size="sm"
                              className="mb-2 d-block ms-auto"
                              onClick={() => handleRespondToRequest(request._id, 'Accepted')}
                              disabled={!canDonate}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="d-block ms-auto"
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

        {/* ── Quick stats row ───────────────────────────────────── */}
        <Row>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-primary text-white shadow text-center p-3">
              <h3>{profile?.donationCount || 0}</h3>
              <p className="mb-0">Total Donations</p>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-success text-white shadow text-center p-3">
              <h3>{(profile?.donationCount || 0) * 3}</h3>
              <p className="mb-0">Lives Saved</p>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-warning text-white shadow text-center p-3">
              <h3>{bloodRequests.length}</h3>
              <p className="mb-0">Active Requests</p>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-danger text-white shadow text-center p-3">
              <h3>{profile?.bloodGroup}</h3>
              <p className="mb-0">Blood Group</p>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ── Profile image upload modal ───────────────────────────── */}
      <Modal
        show={showImageModal}
        onHide={() => { setShowImageModal(false); setImagePreview(null); setSelectedFile(null); }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCamera className="me-2 text-danger" />Update Profile Picture
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: '120px', height: '120px',
                borderRadius: '50%', objectFit: 'cover',
                border: '3px solid #dc3545', marginBottom: '16px'
              }}
            />
          )}
          <Form.Group>
            <Form.Label>Select Image (max 5 MB)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <Form.Text className="text-muted">JPG, PNG, GIF accepted</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => { setShowImageModal(false); setImagePreview(null); setSelectedFile(null); }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleImageUpload} disabled={!selectedFile}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DonorDashboard;