import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaTint, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './BloodAvailability.css';

const BloodAvailability = () => {
  const [bloodStock, setBloodStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBloodStock();
  }, []);

  const fetchBloodStock = async () => {
    try {
      const response = await api.get('/admin/blood-stock');
      setBloodStock(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch blood stock');
      setLoading(false);
    }
  };

  const getStockStatus = (units, threshold) => {
    if (units === 0) return { label: 'Out of Stock', variant: 'danger' };
    if (units < threshold) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'Available', variant: 'success' };
  };

  const filteredStock = bloodStock.filter((stock) =>
    stock.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="blood-availability-page">
      <Container className="py-5">
        <Row>
          <Col md={12} className="text-center mb-5">
            <FaTint size={60} className="text-danger mb-3" />
            <h2 className="fw-bold">Blood Availability</h2>
            <p className="text-muted">Real-time blood stock information</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6} className="mx-auto">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search blood group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>

        <Row>
          {filteredStock.map((stock) => {
            const status = getStockStatus(stock.unitsAvailable, stock.minimumThreshold);
            return (
              <Col md={6} lg={3} key={stock._id} className="mb-4">
                <Card className="blood-card h-100 shadow text-center">
                  <Card.Body>
                    <div className="blood-icon mb-3">
                      <FaTint size={50} className="text-danger" />
                    </div>
                    <h2 className="fw-bold">{stock.bloodGroup}</h2>
                    <h3 className="text-danger mb-3">{stock.unitsAvailable} Units</h3>
                    <Badge bg={status.variant} className="px-3 py-2">
                      {status.label}
                    </Badge>
                    <hr />
                    <small className="text-muted">
                      Min Threshold: {stock.minimumThreshold} units
                    </small>
                    <br />
                    <small className="text-muted">
                      Last Updated: {new Date(stock.lastUpdated).toLocaleDateString()}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        <Row className="mt-5">
          <Col md={12}>
            <Card className="shadow">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">Detailed Stock Information</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Units Available</th>
                      <th>Status</th>
                      <th>Minimum Threshold</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.map((stock) => {
                      const status = getStockStatus(stock.unitsAvailable, stock.minimumThreshold);
                      return (
                        <tr key={stock._id}>
                          <td className="fw-bold">{stock.bloodGroup}</td>
                          <td>{stock.unitsAvailable}</td>
                          <td>
                            <Badge bg={status.variant}>{status.label}</Badge>
                          </td>
                          <td>{stock.minimumThreshold}</td>
                          <td>{new Date(stock.lastUpdated).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BloodAvailability;