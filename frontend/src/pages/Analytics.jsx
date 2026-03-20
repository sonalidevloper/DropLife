import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Nav, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaChartBar } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../services/api';

const COLORS = ['#dc3545', '#fd7e14', '#0d6efd', '#198754', '#6f42c1', '#20c997', '#ffc107', '#6c757d'];

const StatCard = ({ label, value, color = 'danger' }) => (
  <Card className={`border-start border-4 border-${color} shadow-sm`}>
    <Card.Body>
      <div className="fw-bold fs-3">{value ?? '—'}</div>
      <div className="text-muted small">{label}</div>
    </Card.Body>
  </Card>
);

const Analytics = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('blood');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    blood: null,
    trends: null,
    requests: null,
    hospital: null,
    geographic: null,
  });

  const fetchTab = async (tab) => {
    if (data[tab]) return;
    setLoading(true);
    setError(null);
    const endpoints = {
      blood: '/analytics/blood-stats',
      trends: '/analytics/donation-trends',
      requests: '/analytics/request-stats',
      hospital: '/analytics/hospital-stats',
      geographic: '/analytics/geographic',
    };
    try {
      const res = await api.get(endpoints[tab]);
      setData((prev) => ({ ...prev, [tab]: res.data }));
    } catch {
      setError('Failed to load analytics data. Using sample data.');
      // Provide sample data as fallback
      const samples = {
        blood: {
          bloodGroups: [
            { bloodGroup: 'A+', donors: 320, requests: 280, available: 45 },
            { bloodGroup: 'A-', donors: 80, requests: 60, available: 12 },
            { bloodGroup: 'B+', donors: 290, requests: 250, available: 38 },
            { bloodGroup: 'B-', donors: 60, requests: 55, available: 8 },
            { bloodGroup: 'AB+', donors: 100, requests: 90, available: 15 },
            { bloodGroup: 'AB-', donors: 30, requests: 28, available: 4 },
            { bloodGroup: 'O+', donors: 400, requests: 380, available: 60 },
            { bloodGroup: 'O-', donors: 70, requests: 68, available: 10 },
          ],
          totalDonors: 1350, totalRequests: 1211, totalAvailable: 192,
        },
        trends: {
          monthly: [
            { month: 'Jan', donations: 120 }, { month: 'Feb', donations: 145 },
            { month: 'Mar', donations: 160 }, { month: 'Apr', donations: 138 },
            { month: 'May', donations: 175 }, { month: 'Jun', donations: 190 },
            { month: 'Jul', donations: 210 }, { month: 'Aug', donations: 185 },
            { month: 'Sep', donations: 200 }, { month: 'Oct', donations: 220 },
            { month: 'Nov', donations: 195 }, { month: 'Dec', donations: 230 },
          ],
        },
        requests: {
          byUrgency: [
            { urgency: 'Critical', count: 145 },
            { urgency: 'Urgent', count: 320 },
            { urgency: 'Normal', count: 746 },
          ],
          byStatus: [
            { status: 'Open', count: 180 },
            { status: 'In Progress', count: 95 },
            { status: 'Fulfilled', count: 850 },
            { status: 'Cancelled', count: 86 },
          ],
        },
        hospital: {
          byType: [
            { type: 'Government', count: 45 },
            { type: 'Private', count: 120 },
            { type: 'Trust', count: 35 },
            { type: 'Clinic', count: 80 },
            { type: 'NGO', count: 20 },
          ],
          totalHospitals: 300, withBloodBank: 180, totalBeds: 45000,
        },
        geographic: {
          byCityState: [
            { location: 'Mumbai', donors: 420 },
            { location: 'Delhi', donors: 380 },
            { location: 'Bangalore', donors: 290 },
            { location: 'Chennai', donors: 240 },
            { location: 'Hyderabad', donors: 210 },
            { location: 'Pune', donors: 180 },
            { location: 'Kolkata', donors: 160 },
            { location: 'Ahmedabad', donors: 140 },
          ],
        },
      };
      setData((prev) => ({ ...prev, [tab]: samples[tab] }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTab(activeTab);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderBloodStats = () => {
    const d = data.blood;
    if (!d) return null;
    const bg = d.bloodGroups || [];
    return (
      <>
        <Row className="g-3 mb-4">
          {[
            { label: 'Total Donors', value: d.totalDonors, color: 'danger' },
            { label: 'Total Requests', value: d.totalRequests, color: 'warning' },
            { label: 'Units Available', value: d.totalAvailable, color: 'success' },
          ].map((s, i) => (
            <Col key={i} xs={12} sm={4}>
              <StatCard {...s} />
            </Col>
          ))}
        </Row>
        <Row className="g-4">
          <Col xs={12} lg={7}>
            <Card className="shadow-sm">
              <Card.Header className="fw-bold">Blood Group Distribution — Donors vs Requests</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={bg}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bloodGroup" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="donors" fill="#dc3545" name="Donors" />
                    <Bar dataKey="requests" fill="#0d6efd" name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} lg={5}>
            <Card className="shadow-sm">
              <Card.Header className="fw-bold">Donor Distribution by Blood Group</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={bg} dataKey="donors" nameKey="bloodGroup" cx="50%" cy="50%" outerRadius={100} label={({ bloodGroup, percent }) => `${bloodGroup} ${(percent * 100).toFixed(0)}%`}>
                      {bg.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderTrends = () => {
    const d = data.trends;
    if (!d) return null;
    const monthly = d.monthly || [];
    return (
      <Card className="shadow-sm">
        <Card.Header className="fw-bold">Monthly Donation Trends (12 Months)</Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="donations" stroke="#dc3545" strokeWidth={2} dot={{ r: 4 }} name="Donations" />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    );
  };

  const renderRequestStats = () => {
    const d = data.requests;
    if (!d) return null;
    const byUrgency = d.byUrgency || [];
    const byStatus = d.byStatus || [];
    return (
      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Requests by Urgency</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byUrgency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="urgency" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Requests">
                    {byUrgency.map((_, i) => <Cell key={i} fill={['#dc3545', '#fd7e14', '#198754'][i] || '#6c757d'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={5}>
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Requests by Status</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}>
                    {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderHospitalStats = () => {
    const d = data.hospital;
    if (!d) return null;
    const byType = d.byType || [];
    return (
      <>
        <Row className="g-3 mb-4">
          {[
            { label: 'Total Hospitals', value: d.totalHospitals, color: 'primary' },
            { label: 'With Blood Bank', value: d.withBloodBank, color: 'danger' },
            { label: 'Total Beds', value: d.totalBeds?.toLocaleString(), color: 'success' },
          ].map((s, i) => (
            <Col key={i} xs={12} sm={4}>
              <StatCard {...s} />
            </Col>
          ))}
        </Row>
        <Card className="shadow-sm">
          <Card.Header className="fw-bold">Hospitals by Type</Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={110} label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}>
                  {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </>
    );
  };

  const renderGeographic = () => {
    const d = data.geographic;
    if (!d) return null;
    const locs = d.byCityState || [];
    return (
      <Card className="shadow-sm">
        <Card.Header className="fw-bold">Donors by City / State</Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={locs} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="location" width={100} />
              <Tooltip />
              <Bar dataKey="donors" fill="#dc3545" name="Donors" />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    );
  };

  const tabs = [
    { key: 'blood', label: t('analytics.bloodStats', 'Blood Stats') },
    { key: 'trends', label: t('analytics.donationTrends', 'Donation Trends') },
    { key: 'requests', label: t('analytics.requestStats', 'Request Stats') },
    { key: 'hospital', label: t('analytics.hospitalStats', 'Hospital Stats') },
    { key: 'geographic', label: 'Geographic' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Loading analytics...</p>
        </div>
      );
    }
    const renderers = {
      blood: renderBloodStats,
      trends: renderTrends,
      requests: renderRequestStats,
      hospital: renderHospitalStats,
      geographic: renderGeographic,
    };
    return renderers[activeTab]?.() || null;
  };

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <FaChartBar className="text-danger me-2" />
          {t('analytics.title', 'Blood Donation Analytics')}
        </h2>
      </div>

      {error && <Alert variant="warning" className="mb-3">{error}</Alert>}

      <Nav variant="tabs" className="mb-4">
        {tabs.map((tab) => (
          <Nav.Item key={tab.key}>
            <Nav.Link
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={activeTab === tab.key ? 'text-danger border-danger' : 'text-muted'}
              style={{ cursor: 'pointer' }}
            >
              {tab.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {renderContent()}
    </Container>
  );
};

export default Analytics;
