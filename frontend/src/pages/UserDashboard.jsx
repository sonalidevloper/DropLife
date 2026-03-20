import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaTint, FaHospital, FaBell, FaMap, FaChartBar, FaUser, FaEdit, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ requests: 0, hospitals: 0, camps: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, notifRes] = await Promise.all([
          api.get('/blood-request').catch(() => ({ data: [] })),
          api.get('/notifications?limit=3').catch(() => ({ data: [] })),
        ]);
        const allRequests = Array.isArray(reqRes.data)
          ? reqRes.data
          : reqRes.data.requests || [];
        const myRequests = allRequests.filter(
          (r) => r.requestedBy === user?.id || r.userId === user?.id
        );
        setRequests(myRequests.slice(0, 5));
        setStats((s) => ({ ...s, requests: myRequests.length }));

        const notifData = Array.isArray(notifRes.data)
          ? notifRes.data
          : notifRes.data.notifications || [];
        setNotifications(notifData.slice(0, 3));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const urgencyBadge = (urgency) => {
    const map = { Critical: 'danger', Urgent: 'warning', Normal: 'success' };
    return <Badge bg={map[urgency] || 'secondary'}>{urgency}</Badge>;
  };

  const statusBadge = (status) => {
    const map = { Open: 'primary', 'In Progress': 'info', Fulfilled: 'success', Cancelled: 'secondary' };
    return <Badge bg={map[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Welcome back, <span className="text-danger">{user?.name}</span> 👋
          </h2>
          <p className="text-muted mb-0">
            Blood Group: <Badge bg="danger">{user?.bloodGroup || 'N/A'}</Badge>
          </p>
        </div>
        <div className="text-end">
          <span className="badge bg-light text-dark border">
            <FaUser className="me-1" /> {user?.role || 'User'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { icon: <FaTint className="text-danger" />, label: 'My Blood Requests', value: stats.requests, color: 'border-danger' },
          { icon: <FaHospital className="text-primary" />, label: 'Nearby Hospitals', value: '—', color: 'border-primary' },
          { icon: <FaCheckCircle className="text-success" />, label: 'Upcoming Camps', value: '—', color: 'border-success' },
        ].map((s, i) => (
          <Col key={i} xs={12} sm={4}>
            <Card className={`h-100 border-start border-4 ${s.color} shadow-sm`}>
              <Card.Body className="d-flex align-items-center gap-3">
                <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                <div>
                  <div className="fw-bold fs-4">{loading ? '…' : s.value}</div>
                  <div className="text-muted small">{s.label}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="fw-bold bg-danger text-white">Quick Actions</Card.Header>
        <Card.Body>
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/blood-request" variant="danger">
              <FaTint className="me-1" /> Request Blood
            </Button>
            <Button as={Link} to="/map" variant="outline-primary">
              <FaMap className="me-1" /> Find Donors on Map
            </Button>
            <Button as={Link} to="/hospitals" variant="outline-info">
              <FaHospital className="me-1" /> View Hospitals
            </Button>
            <Button as={Link} to="/analytics" variant="outline-success">
              <FaChartBar className="me-1" /> View Analytics
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {/* Recent Requests */}
        <Col xs={12} lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-bold">My Recent Blood Requests</span>
              <Link to="/blood-request" className="btn btn-sm btn-danger">+ New Request</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4 text-muted">Loading...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <FaTint className="text-danger mb-2" style={{ fontSize: '2rem' }} />
                  <p>No blood requests yet</p>
                  <Button as={Link} to="/blood-request" variant="danger" size="sm">
                    Make a Request
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Blood Group</th>
                        <th>Units</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r) => (
                        <tr key={r._id}>
                          <td><Badge bg="danger">{r.bloodGroup}</Badge></td>
                          <td>{r.units}</td>
                          <td>{urgencyBadge(r.urgency)}</td>
                          <td>{statusBadge(r.status)}</td>
                          <td className="text-muted small">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Profile + Notifications */}
        <Col xs={12} lg={4}>
          {/* Profile */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="fw-bold">
              <FaUser className="me-2 text-danger" />My Profile
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div
                  className="rounded-circle bg-danger text-white d-inline-flex align-items-center justify-content-center fw-bold mb-2"
                  style={{ width: 60, height: 60, fontSize: '1.5rem' }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="fw-semibold">{user?.name}</div>
                <div className="text-muted small">{user?.email}</div>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Phone</span>
                <span>{user?.phone || '—'}</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Blood Group</span>
                <Badge bg="danger">{user?.bloodGroup || 'N/A'}</Badge>
              </div>
              <div className="d-flex justify-content-between small mb-3">
                <span className="text-muted">Role</span>
                <span className="text-capitalize">{user?.role}</span>
              </div>
              <Button as={Link} to="/donor/dashboard" variant="outline-danger" size="sm" className="w-100">
                <FaEdit className="me-1" /> Edit Profile
              </Button>
            </Card.Body>
          </Card>

          {/* Notifications */}
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-bold"><FaBell className="me-2 text-warning" />Notifications</span>
              <Link to="/notifications" className="small text-danger">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {notifications.length === 0 ? (
                <div className="text-center py-3 text-muted small">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className={`px-3 py-2 border-bottom ${!n.read ? 'bg-light' : ''}`}>
                    <div className="small fw-semibold">{n.title || 'Notification'}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{n.message}</div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;
