import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Table } from 'react-bootstrap';
import { FaHospital, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const HospitalDetail = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalDetails();
    // eslint-disable-next-line
  }, [id]);

  const fetchHospitalDetails = async () => {
    try {
      const response = await api.get(`/hospitals/${id}`);
      setHospital(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch hospital details');
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!hospital) return <div className="text-center p-5">Hospital not found</div>;

  return (
    <Container className="py-5">
      <Row>
        <Col md={12}>
          <Card className="shadow mb-4">
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <FaHospital size={50} className="text-danger me-3" />
                <div>
                  <h2 className="mb-0">{hospital.name}</h2>
                  <Badge bg="success">Verified</Badge>
                </div>
              </div>

              <Row>
                <Col md={6}>
                  <p><FaMapMarkerAlt className="me-2" />{hospital.address?.street}, {hospital.address?.city}</p>
                  <p><FaPhone className="me-2" />{hospital.phone}</p>
                  <p><FaEnvelope className="me-2" />{hospital.email}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Type:</strong> {hospital.type}</p>
                  <p><strong>Blood Bank:</strong> {hospital.capacity?.bloodBank ? 'Yes' : 'No'}</p>
                  <p><strong>Beds:</strong> {hospital.capacity?.beds || 'N/A'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow">
            <Card.Header className="bg-danger text-white">
              <h5 className="mb-0">Blood Availability</h5>
            </Card.Header>
            <Card.Body>
              {hospital.bloodInventory && hospital.bloodInventory.length > 0 ? (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Units Available</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospital.bloodInventory.map((item, index) => (
                      <tr key={index}>
                        <td><Badge bg="danger">{item.bloodGroup}</Badge></td>
                        <td>{item.units}</td>
                        <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No blood inventory data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HospitalDetail;