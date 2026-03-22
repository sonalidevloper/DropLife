import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaTint, FaTruck } from 'react-icons/fa';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const hospitalId = user?._id;

  const [blood, setBlood] = useState({});
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hospitalId) return;

    Promise.all([
      api.get(`/hospitals/${hospitalId}/blood-availability`),
      api.get(`/deliveries/hospital/${hospitalId}`)
    ])
      .then(([b, d]) => {
        setBlood(b.data?.bloodAvailability || {});
        setDeliveries(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hospitalId]);

  const total = Object.values(blood).reduce((a, b) => a + Number(b || 0), 0);

  return (
    <Container className="py-4">

      {/* STATS */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <FaTint className="text-danger" />
            <h4>{loading ? '…' : total}</h4>
            <small>Total Units</small>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <FaTruck />
            <h4>{deliveries.length}</h4>
            <small>Deliveries</small>
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
      <Card>
        <Card.Body className="p-0">
          <Table>
            <thead>
              <tr>
                <th>Group</th>
                <th>Units</th>
              </tr>
            </thead>

            <tbody>
              {BLOOD_GROUPS.map(bg => (
                <tr key={bg}>
                  <td><Badge bg="danger">{bg}</Badge></td>
                  <td>{blood[bg] || 0}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

    </Container>
  );
};

export default HospitalDashboard;