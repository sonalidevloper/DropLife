import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaTint, FaHospital } from 'react-icons/fa';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Fix leaflet default icon
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const DEFAULT_CENTER = [20.2961, 85.8245]; // Bhubaneswar

const MapView = () => {
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);  const [loading, setLoading] = useState(true);
  const [showDonors, setShowDonors] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [radius] = useState(50000);

  const fetchData = useCallback(async () => {
    try {
      const [donorRes, hospitalRes] = await Promise.allSettled([
        (async () => {
  try {
    return await api.get('/donor/nearby', {
      params: { latitude: DEFAULT_CENTER[0], longitude: DEFAULT_CENTER[1], maxDistance: radius },
      headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
    });
  } catch (err) {
    console.log('Nearby donor API restricted');
    return { data: { data: [] } };
  }
})(),
        (async () => {
  try {
    return await api.get('/hospitals');
  } catch (err) {
    console.log('Hospital API error');
    return { data: { data: [] } };
  }
})()
      ]);

      if (donorRes.status === 'fulfilled') {
        setDonors(donorRes.value.data.data || []);
      }
      if (hospitalRes.status === 'fulfilled') {
        setHospitals(hospitalRes.value.data.data || []);
      }
    } catch {
      // silently ignore — map still renders
    } finally {
      setLoading(false);
    }
  }, [radius]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredDonors = selectedBloodGroup
    ? donors.filter((d) => d.bloodGroup === selectedBloodGroup)
    : donors;

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">
            <FaMapMarkerAlt className="me-2 text-danger" />
            Live Donor &amp; Hospital Map
          </h2>
          <p className="text-muted">
            Real-time locations of available donors and hospitals within 50 km
          </p>
        </Col>
      </Row>

      {donors.length === 0 && hospitals.length === 0 && (
        <Alert variant="info" className="mb-3">
          Showing base map — no donor/hospital data available without a backend connection.
        </Alert>
      )}

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-2 align-items-center">
            <Col md={3}>
              <Form.Label className="small fw-bold">Blood Group Filter</Form.Label>
              <Form.Select
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                size="sm"
              >
                <option value="">All Blood Groups</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Check
                type="switch"
                id="donors-switch"
                label={`Show Donors (${filteredDonors.length})`}
                checked={showDonors}
                onChange={(e) => setShowDonors(e.target.checked)}
                className="mt-4"
              />
            </Col>
            <Col md={3}>
              <Form.Check
                type="switch"
                id="hospitals-switch"
                label={`Show Hospitals (${hospitals.length})`}
                checked={showHospitals}
                onChange={(e) => setShowHospitals(e.target.checked)}
                className="mt-4"
              />
            </Col>
            <Col md={3} className="mt-4">
              <Badge bg="danger" className="me-2">
                <FaTint className="me-1" />Donors: {filteredDonors.length}
              </Badge>
              <Badge bg="primary">
                <FaHospital className="me-1" />Hospitals: {hospitals.length}
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Map */}
      <Card className="shadow">
        <Card.Body className="p-0" style={{ borderRadius: '8px', overflow: 'hidden' }}>
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={11}
            style={{ height: '550px', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Search radius */}
            <Circle
              center={DEFAULT_CENTER}
              radius={radius}
              pathOptions={{ color: '#dc3545', fillColor: '#dc3545', fillOpacity: 0.07, weight: 2 }}
            />

            {/* Donor markers */}
            {showDonors && filteredDonors.map((donor) => {
              const coords = donor.location?.coordinates;
              if (!coords || (coords[0] === 0 && coords[1] === 0)) return null;
              const [lng, lat] = coords;
              return (
                <Marker key={donor._id} position={[lat, lng]} icon={redIcon}>
                  <Popup>
                    <strong>{donor.name}</strong><br />
                    Blood: <Badge bg="danger">{donor.bloodGroup}</Badge><br />
                    Donations: {donor.donationCount}<br />
                    Status:{' '}
                    <span className={donor.isAvailable ? 'text-success' : 'text-secondary'}>
                      {donor.isAvailable ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </Popup>
                </Marker>
              );
            })}

            {/* Hospital markers */}
            {showHospitals && hospitals.map((h) => {
              const coords = h.location?.coordinates;
              if (!coords || (coords[0] === 0 && coords[1] === 0)) return null;
              const [lng, lat] = coords;
              return (
                <Marker key={h._id} position={[lat, lng]} icon={blueIcon}>
                  <Popup>
                    <strong>{h.name}</strong><br />
                    {h.address?.city}, {h.address?.state}<br />
                    Type: {h.type}<br />
                    Blood Bank: {h.capacity?.bloodBank ? '✅ Yes' : '❌ No'}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </Card.Body>
      </Card>

      {/* Legend */}
      <Card className="shadow-sm mt-3">
        <Card.Body className="py-2">
          <strong className="me-3">Legend:</strong>
          <span className="me-3">🔴 Donor</span>
          <span className="me-3">🔵 Hospital</span>
          <span>🔴 circle = 50 km search radius</span>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MapView;