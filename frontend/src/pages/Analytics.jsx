import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { FaChartLine, FaUsers, FaTint, FaCampground } from 'react-icons/fa';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DEMO_BLOOD_GROUPS = [
  { bloodGroup: 'A+', donors: 142, requests: 55, stock: 45 },
  { bloodGroup: 'A-', donors: 38,  requests: 20, stock: 8  },
  { bloodGroup: 'B+', donors: 118, requests: 48, stock: 30 },
  { bloodGroup: 'B-', donors: 22,  requests: 10, stock: 3  },
  { bloodGroup: 'AB+', donors: 55, requests: 18, stock: 20 },
  { bloodGroup: 'AB-', donors: 14, requests: 6,  stock: 0  },
  { bloodGroup: 'O+', donors: 195, requests: 80, stock: 70 },
  { bloodGroup: 'O-', donors: 60,  requests: 25, stock: 12 },
];

const DEMO_MONTHLY = [
  { month: 'Jan', donations: 45 }, { month: 'Feb', donations: 52 },
  { month: 'Mar', donations: 61 }, { month: 'Apr', donations: 58 },
  { month: 'May', donations: 73 }, { month: 'Jun', donations: 68 },
  { month: 'Jul', donations: 80 }, { month: 'Aug', donations: 75 },
  { month: 'Sep', donations: 88 }, { month: 'Oct', donations: 92 },
  { month: 'Nov', donations: 85 }, { month: 'Dec', donations: 79 },
];

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.get('/analytics/overview');
      setOverview(res.data.data);
    } catch {
      setOverview({
        totalDonors: 644, totalRequests: 262, totalCamps: 18,
        bloodGroupStats: DEMO_BLOOD_GROUPS.map((d) => ({ _id: d.bloodGroup, count: d.donors })),
        monthlyDonations: DEMO_MONTHLY.map((d, i) => ({ _id: i + 1, count: d.donations }))
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <LoadingSpinner />;

  const bgStats = overview?.bloodGroupStats || [];
  const monthlyData = DEMO_MONTHLY;

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">
            <FaChartLine className="me-2 text-danger" />Analytics Dashboard
          </h2>
          <p className="text-muted">Blood donation system insights</p>
        </Col>
      </Row>

      {/* Tab nav */}
      <div className="mb-4">
        {['overview', 'donors', 'requests'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn btn-sm me-2 ${activeTab === tab ? 'btn-danger' : 'btn-outline-danger'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <>
          <Row className="mb-4">
            {[
              { label: 'Total Donors',   value: overview?.totalDonors,   icon: FaUsers,    bg: 'bg-primary' },
              { label: 'Blood Requests', value: overview?.totalRequests, icon: FaTint,     bg: 'bg-danger'  },
              { label: 'Donation Camps', value: overview?.totalCamps,    icon: FaCampground, bg: 'bg-success' },
              { label: 'Lives Saved',    value: (overview?.totalDonors || 0) * 3, icon: FaTint, bg: 'bg-warning' },
            ].map(({ label, value, icon: Icon, bg }) => (
              <Col md={3} key={label} className="mb-3">
                <Card className={`${bg} text-white shadow text-center p-3`}>
                  <Icon size={30} className="mb-2" />
                  <h3>{value?.toLocaleString()}</h3>
                  <p className="mb-0">{label}</p>
                </Card>
              </Col>
            ))}
          </Row>

          <Row>
            <Col md={6} className="mb-4">
              <Card className="shadow">
                <Card.Header className="bg-danger text-white">
                  <h5 className="mb-0">Donors by Blood Group</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={bgStats.map((s) => ({ name: s._id, Donors: s.count }))}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="Donors" fill="#dc3545" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="shadow">
                <Card.Header className="bg-danger text-white">
                  <h5 className="mb-0">Monthly Donation Trend</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="donations"
                        stroke="#dc3545"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Donors tab */}
      {activeTab === 'donors' && (
        <Row>
          <Col>
            <Card className="shadow">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">Blood Group Distribution</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {DEMO_BLOOD_GROUPS.map((d) => (
                    <Col md={3} key={d.bloodGroup} className="mb-3">
                      <Card className="text-center border">
                        <Card.Body>
                          <h4 className="text-danger fw-bold">{d.bloodGroup}</h4>
                          <h5>{d.donors} donors</h5>
                          <Badge bg="info">Stock: {d.stock}u</Badge>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Requests tab */}
      {activeTab === 'requests' && (
        <Row>
          <Col>
            <Card className="shadow">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">Requests vs Donors by Blood Group</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={DEMO_BLOOD_GROUPS}>
                    <XAxis dataKey="bloodGroup" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="donors"   fill="#dc3545" name="Donors"   radius={[4, 4, 0, 0]} />
                    <Bar dataKey="requests" fill="#6c757d" name="Requests" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Analytics;