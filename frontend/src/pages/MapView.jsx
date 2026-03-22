import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Badge } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt } from 'react-icons/fa';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Fix Leaflet default marker icon
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = () => {
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [location] = useState([20.2961, 85.8245]); // Default: Bhubaneswar
  const [loading, setLoading] = useState(true);
  const [radius] = useState(50000); // 50km
  const [showDonors, setShowDonors] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [selectedBloodGroup]);

  const fetchData = async () => {
    try {
      // Fetch donors
      const donorResponse = await api.get('/donor/nearby', {
        params: {
          latitude: location[0],
          longitude: location[1],
          maxDistance: radius,
          bloodGroup: selectedBloodGroup || undefined
        }
      });
      setDonors(donorResponse.data.data || []);

      // Fetch hospitals
      const hospitalResponse = await api.get('/hospitals/public');
      setHospitals(hospitalResponse.data.data || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch map data');
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">
            <FaMapMarkerAlt className="me-2 text-danger" />
            Live Donor & Hospital Map
          </h2>
          <p className="text-muted">Real-time locations of available donors and hospitals</p>
        </Col>
      </Row>

      <Card className="shadow mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter by Blood Group</Form.Label>
                <Form.Select 
                  value={selectedBloodGroup}
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                >
                  <option value="">All Blood Groups</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Check
                type="switch"
                label="Show Donors"
                checked={showDonors}
                onChange={(e) => setShowDonors(e.target.checked)}
                className="mt-4"
              />
            </Col>
            <Col md={3}>
              <Form.Check
                type="switch"
                label="Show Hospitals"
                checked={showHospitals}
                onChange={(e) => setShowHospitals(e.target.checked)}
                className="mt-4"
              />
            </Col>
            <Col md={3} className="mt-4">
              <Badge bg="danger" className="me-2">Donors: {donors.length}</Badge>
              <Badge bg="primary">Hospitals: {hospitals.length}</Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow">
        <Card.Body className="p-0">
          <MapContainer
            center={location}
            zoom={12}
            style={{ height: '600px', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Search radius circle */}
            <Circle
              center={location}
              radius={radius}
              pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
            />

            {/* Donor markers */}
            {showDonors && donors.map((donor) => {
              const [lng, lat] = donor.location?.coordinates || [0, 0];
              if (lat === 0) return null;
              
              return (
                <Marker key={donor._id} position={[lat, lng]}>
                  <Popup>
                    <div>
                      <h6 className="fw-bold">{donor.name}</h6>
                      <p className="mb-1">
                        <strong>Blood Group:</strong>{' '}
                        <Badge bg="danger">{donor.bloodGroup}</Badge>
                      </p>
                      <p className="mb-1">
                        <strong>Donations:</strong> {donor.donationCount}
                      </p>
                      <p className="mb-0">
                        <strong>Status:</strong>{' '}
                        <span className={donor.isAvailable ? 'text-success' : 'text-secondary'}>
                          {donor.isAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Hospital markers */}
            {showHospitals && hospitals.map((hospital) => {
              const [lng, lat] = hospital.location?.coordinates || [0, 0];
              if (lat === 0) return null;

              return (
                <Marker key={hospital._id} position={[lat, lng]}>
                  <Popup>
                    <div>
                      <h6 className="fw-bold">{hospital.name}</h6>
                      <p className="mb-1">{hospital.address?.city}</p>
                      <p className="mb-1">
                        <strong>Type:</strong> {hospital.type}
                      </p>
                      <p className="mb-0">
                        <strong>Blood Bank:</strong>{' '}
                        {hospital.capacity?.bloodBank ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </Card.Body>
      </Card>

      <Row className="mt-4">
        <Col md={12}>
          <Card className="shadow">
            <Card.Body>
              <h5 className="mb-3">Map Legend</h5>
              <div className="d-flex align-items-center mb-2">
                <div style={{ width: '20px', height: '20px', background: 'red', marginRight: '10px' }}></div>
                <span>Search Radius (50km)</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FaMapMarkerAlt className="text-primary me-2" />
                <span>Donor Locations</span>
              </div>
              <div className="d-flex align-items-center">
                <FaMapMarkerAlt className="text-danger me-2" />
                <span>Hospital Locations</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MapView;