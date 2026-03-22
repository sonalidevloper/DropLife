import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  FaTint, FaHospital, FaBell, FaMap,
  FaChartBar, FaUser, FaEdit, FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ requests: 0 });
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH DATA (FIXED + SAFE)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, notifRes] = await Promise.all([
          api.get('/blood-request/my'), // ✅ FIXED (no frontend filtering)
          api.get('/notifications?limit=3')
        ]);

        const reqData = Array.isArray(reqRes.data)
          ? reqRes.data
          : reqRes.data.requests || [];

        setRequests(reqData.slice(0, 5));
        setStats({ requests: reqData.length });

        const notifData = Array.isArray(notifRes.data)
          ? notifRes.data
          : notifRes.data.notifications || [];

        setNotifications(notifData.slice(0, 3));

      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchData();
  }, [user]);

  // 🔥 BADGE HELPERS
  const urgencyBadge = (urgency) => {
    const map = { Critical: 'danger', Urgent: 'warning', Normal: 'success' };
    return <Badge bg={map[urgency] || 'secondary'}>{urgency}</Badge>;
  };

  const statusBadge = (status) => {
    const map = {
      Open: 'primary',
      'In Progress': 'info',
      Fulfilled: 'success',
      Cancelled: 'secondary'
    };
    return <Badge bg={map[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Container className="py-4">

      {/* HEADER */}
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

      {/* STATS */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={4}>
          <Card className="h-100 border-start border-4 border-danger shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3">
              <FaTint className="text-danger" size={30} />
              <div>
                <div className="fw-bold fs-4">
                  {loading ? '…' : stats.requests}
                </div>
                <div className="text-muted small">My Blood Requests</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={4}>
          <Card className="h-100 border-start border-4 border-primary shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3">
              <FaHospital className="text-primary" size={30} />
              <div>
                <div className="fw-bold fs-4">—</div>
                <div className="text-muted small">Nearby Hospitals</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={4}>
          <Card className="h-100 border-start border-4 border-success shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3">
              <FaCheckCircle className="text-success" size={30} />
              <div>
                <div className="fw-bold fs-4">—</div>
                <div className="text-muted small">Upcoming Camps</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* QUICK ACTIONS */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="fw-bold bg-danger text-white">
          Quick Actions
        </Card.Header>

        <Card.Body>
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/blood-request" variant="danger">
              <FaTint className="me-1" /> Request Blood
            </Button>

            <Button as={Link} to="/map" variant="outline-primary">
              <FaMap className="me-1" /> Find Donors
            </Button>

            <Button as={Link} to="/hospitals" variant="outline-info">
              <FaHospital className="me-1" /> Hospitals
            </Button>

            <Button as={Link} to="/analytics" variant="outline-success">
              <FaChartBar className="me-1" /> Analytics
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">

        {/* REQUESTS */}
        <Col xs={12} lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between">
              <span className="fw-bold">My Recent Blood Requests</span>
              <Link to="/blood-request" className="btn btn-sm btn-danger">
                + New
              </Link>
            </Card.Header>

            <Card.Body className="p-0">

              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-4">
                  No requests yet
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Blood</th>
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
                          <td>
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

        {/* PROFILE + NOTIFICATIONS */}
        <Col xs={12} lg={4}>

          {/* PROFILE */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="fw-bold">
              <FaUser className="me-2 text-danger" /> My Profile
            </Card.Header>

            <Card.Body className="text-center">
              <div className="fw-bold">{user?.name}</div>
              <div className="text-muted small">{user?.email}</div>

              <Button as={Link} to="/profile" variant="outline-danger" size="sm" className="mt-2">
                <FaEdit /> Edit
              </Button>
            </Card.Body>
          </Card>

          {/* NOTIFICATIONS */}
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between">
              <span><FaBell /> Notifications</span>
              <Link to="/notifications">View All</Link>
            </Card.Header>

            <Card.Body className="p-0">
              {notifications.length === 0 ? (
                <div className="text-center py-3">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`px-3 py-2 border-bottom ${!n.isRead ? 'bg-light' : ''}`}
                  >
                    <div className="fw-semibold">{n.title}</div>
                    <div className="small text-muted">{n.message}</div>
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