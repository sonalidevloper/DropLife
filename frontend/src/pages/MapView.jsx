import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup } from 'react-bootstrap';
import {
  MapContainer, TileLayer, Marker, Popup, Circle, useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaTint, FaHospital, FaLocationArrow } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const donorIcon = new L.DivIcon({
  html: '<div style="background:#dc3545;width:26px;height:26px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-size:12px;color:white;font-weight:bold">🩸</div>',
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const hospitalIcon = new L.DivIcon({
  html: '<div style="background:#0d6efd;width:26px;height:26px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-size:12px;color:white;font-weight:bold">🏥</div>',
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const userIcon = new L.DivIcon({
  html: '<div style="background:#198754;width:30px;height:30px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);font-size:14px">📍</div>',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const DEFAULT_LOCATION = { lat: 19.076, lng: 72.8777 }; // Mumbai

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
};

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MapView = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationGranted, setLocationGranted] = useState(false);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(10);
  const [bloodGroup, setBloodGroup] = useState('All');

  const fetchNearby = useCallback(
    async (lat, lng) => {
      setLoading(true);
      try {
        const params = { lat, lng, radius };
        const bg = bloodGroup !== 'All' ? bloodGroup : null;
        const [donorRes, hospRes] = await Promise.all([
          api.get('/donor/nearby', { params: bg ? { ...params, bloodGroup: bg } : params }).catch(() => ({ data: [] })),
          api.get('/hospitals/nearby', { params }).catch(() => ({ data: [] })),
        ]);
        setDonors(Array.isArray(donorRes.data) ? donorRes.data : donorRes.data.donors || []);
        setHospitals(Array.isArray(hospRes.data) ? hospRes.data : hospRes.data.hospitals || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [radius, bloodGroup]
  );

  useEffect(() => {
    fetchNearby(location.lat, location.lng);
  }, [location, radius, bloodGroup, fetchNearby]);

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLocationGranted(true);
      },
      () => {
        setLocation(DEFAULT_LOCATION);
        setLocationGranted(false);
      }
    );
  };

  const calcDistance = (loc) => {
    if (!loc?.coordinates) return '—';
    const [lng2, lat2] = loc.coordinates;
    const R = 6371;
    const dLat = ((lat2 - location.lat) * Math.PI) / 180;
    const dLng = ((lng2 - location.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((location.lat * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return `${(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1)} km`;
  };

  return (
    <Container fluid className="py-3">
      <h3 className="fw-bold mb-3 text-center">
        <FaMapMarkerAlt className="text-danger me-2" />
        {t('map.title', 'Find Nearest Donors & Hospitals')}
      </h3>

      <Row className="g-3">
        {/* Controls */}
        <Col xs={12} md={3} lg={3}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="fw-bold bg-danger text-white">Filters</Card.Header>
            <Card.Body>
              <Button
                variant={locationGranted ? 'success' : 'outline-danger'}
                className="w-100 mb-3"
                onClick={getMyLocation}
              >
                <FaLocationArrow className="me-2" />
                {locationGranted ? 'Location Active' : 'Use My Location'}
              </Button>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">
                  Radius: <strong>{radius} km</strong>
                </Form.Label>
                <Form.Range
                  min={5} max={50} step={5}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.7rem' }}>
                  <span>5 km</span><span>50 km</span>
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Label className="small fw-semibold">Blood Group</Form.Label>
                <Form.Select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  size="sm"
                >
                  {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Nearby Donors List */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="fw-bold d-flex justify-content-between align-items-center">
              <span><FaTint className="text-danger me-1" />Nearby Donors</span>
              <Badge bg="danger">{donors.length}</Badge>
            </Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: 220, overflowY: 'auto' }}>
              {loading ? (
                <ListGroup.Item className="text-muted small text-center">Loading...</ListGroup.Item>
              ) : donors.length === 0 ? (
                <ListGroup.Item className="text-muted small text-center">No donors found</ListGroup.Item>
              ) : (
                donors.slice(0, 10).map((d) => (
                  <ListGroup.Item key={d._id} className="py-2 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small fw-semibold">{d.name}</span>
                      <Badge bg="danger">{d.bloodGroup}</Badge>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {d.city || '—'} · {calcDistance(d.location)}
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>

          {/* Nearby Hospitals List */}
          <Card className="shadow-sm">
            <Card.Header className="fw-bold d-flex justify-content-between align-items-center">
              <span><FaHospital className="text-primary me-1" />Nearby Hospitals</span>
              <Badge bg="primary">{hospitals.length}</Badge>
            </Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: 220, overflowY: 'auto' }}>
              {loading ? (
                <ListGroup.Item className="text-muted small text-center">Loading...</ListGroup.Item>
              ) : hospitals.length === 0 ? (
                <ListGroup.Item className="text-muted small text-center">No hospitals found</ListGroup.Item>
              ) : (
                hospitals.slice(0, 10).map((h) => (
                  <ListGroup.Item key={h._id} className="py-2 px-3">
                    <div className="small fw-semibold">{h.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {h.address?.city || '—'} · {calcDistance(h.location)}
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Map */}
        <Col xs={12} md={9} lg={9}>
          <Card className="shadow-sm overflow-hidden">
            <div style={{ height: '600px' }}>
              <MapContainer
                center={[location.lat, location.lng]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap center={location} />

                {/* User location */}
                <Marker position={[location.lat, location.lng]} icon={userIcon}>
                  <Popup>
                    <strong>Your Location</strong>
                    {!locationGranted && (
                      <><br /><small className="text-muted">Default: Mumbai</small></>
                    )}
                  </Popup>
                </Marker>

                {/* Radius circle */}
                <Circle
                  center={[location.lat, location.lng]}
                  radius={radius * 1000}
                  pathOptions={{ color: '#dc3545', fillColor: '#dc3545', fillOpacity: 0.05 }}
                />

                {/* Donor markers */}
                {donors.map((d) => {
                  if (!d.location?.coordinates) return null;
                  const [lng2, lat2] = d.location.coordinates;
                  return (
                    <Marker key={d._id} position={[lat2, lng2]} icon={donorIcon}>
                      <Popup>
                        <strong>{d.name}</strong><br />
                        Blood Group: <Badge bg="danger">{d.bloodGroup}</Badge><br />
                        {d.phone && <>Phone: {d.phone}<br /></>}
                        {d.city && <>City: {d.city}<br /></>}
                        Distance: {calcDistance(d.location)}
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Hospital markers */}
                {hospitals.map((h) => {
                  if (!h.location?.coordinates) return null;
                  const [lng2, lat2] = h.location.coordinates;
                  return (
                    <Marker key={h._id} position={[lat2, lng2]} icon={hospitalIcon}>
                      <Popup>
                        <strong>{h.name}</strong><br />
                        Type: {h.type}<br />
                        {h.phone && <>Phone: {h.phone}<br /></>}
                        {h.address?.city && <>City: {h.address.city}<br /></>}
                        Distance: {calcDistance(h.location)}
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </Card>
          <div className="d-flex gap-3 mt-2 small text-muted justify-content-center">
            <span>🩸 Donor</span>
            <span>🏥 Hospital</span>
            <span>📍 Your Location</span>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MapView;
