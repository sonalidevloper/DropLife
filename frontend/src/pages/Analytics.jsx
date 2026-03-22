import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Row,
  Col,
  Nav,
  Spinner,
  Alert
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaChartBar } from 'react-icons/fa';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

import api from '../services/api';

const COLORS = [
  '#dc3545', '#fd7e14', '#0d6efd', '#198754',
  '#6f42c1', '#20c997', '#ffc107', '#6c757d'
];

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
    geographic: null
  });

  // 🔹 Fetch per tab (lazy loading)
  const fetchTab = async (tab) => {
    if (data[tab]) return;

    setLoading(true);
    setError(null);

    const endpoints = {
      blood: '/analytics/blood-stats',
      trends: '/analytics/donation-trends',
      requests: '/analytics/request-stats',
      hospital: '/analytics/hospital-stats',
      geographic: '/analytics/geographic'
    };

    try {
      const res = await api.get(endpoints[tab]);
      setData(prev => ({ ...prev, [tab]: res.data }));
    } catch {
      setError('Failed to load analytics data. Using sample data.');

      // 🔹 fallback sample data
      const samples = {
        blood: {
          bloodGroups: [
            { bloodGroup: 'A+', donors: 320, requests: 280, available: 45 },
            { bloodGroup: 'O+', donors: 400, requests: 380, available: 60 }
          ],
          totalDonors: 1350,
          totalRequests: 1211,
          totalAvailable: 192
        },
        trends: {
          monthly: [
            { month: 'Jan', donations: 120 },
            { month: 'Feb', donations: 145 }
          ]
        },
        requests: {
          byUrgency: [
            { urgency: 'Critical', count: 145 },
            { urgency: 'Normal', count: 746 }
          ],
          byStatus: [
            { status: 'Open', count: 180 },
            { status: 'Fulfilled', count: 850 }
          ]
        },
        hospital: {
          byType: [
            { type: 'Government', count: 45 },
            { type: 'Private', count: 120 }
          ],
          totalHospitals: 300,
          withBloodBank: 180,
          totalBeds: 45000
        },
        geographic: {
          byCityState: [
            { location: 'Mumbai', donors: 420 },
            { location: 'Delhi', donors: 380 }
          ]
        }
      };

      setData(prev => ({ ...prev, [tab]: samples[tab] }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTab(activeTab);
  }, [activeTab]);

  // 🔹 Renderers

  const renderBloodStats = () => {
    const d = data.blood;
    if (!d) return null;

    return (
      <>
        <Row className="g-3 mb-4">
          <Col><StatCard label="Total Donors" value={d.totalDonors} /></Col>
          <Col><StatCard label="Total Requests" value={d.totalRequests} color="warning" /></Col>
          <Col><StatCard label="Available Units" value={d.totalAvailable} color="success" /></Col>
        </Row>

        <Card>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={d.bloodGroups}>
                <XAxis dataKey="bloodGroup" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="donors" fill="#dc3545" />
                <Bar dataKey="requests" fill="#0d6efd" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </>
    );
  };

  const renderTrends = () => {
    const d = data.trends;
    if (!d) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={d.monthly}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line dataKey="donations" stroke="#dc3545" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      );
    }

    const map = {
      blood: renderBloodStats,
      trends: renderTrends
    };

    return map[activeTab]?.() || null;
  };

  const tabs = [
    { key: 'blood', label: t('analytics.bloodStats', 'Blood Stats') },
    { key: 'trends', label: t('analytics.donationTrends', 'Donation Trends') },
    { key: 'requests', label: t('analytics.requestStats', 'Request Stats') },
    { key: 'hospital', label: t('analytics.hospitalStats', 'Hospital Stats') },
    { key: 'geographic', label: 'Geographic' }
  ];

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-center mb-4">
        <FaChartBar className="me-2 text-danger" />
        {t('analytics.title', 'Blood Donation Analytics')}
      </h2>

      {error && <Alert variant="warning">{error}</Alert>}

      <Nav variant="tabs" className="mb-4">
        {tabs.map(tab => (
          <Nav.Item key={tab.key}>
            <Nav.Link
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
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