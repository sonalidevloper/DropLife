import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaTint, FaTruck, FaBell, FaUsers, FaBoxes, FaChartBar } from 'react-icons/fa';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const hospitalId = user?.hospitalId || user?.id || user?._id;

  const [bloodAvailability, setBloodAvailability] = useState({});
  const [deliveries, setDeliveries] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bloodRes, delRes, reqRes, notifRes] = await Promise.all([
          api.get(`/hospitals/${hospitalId}/blood-availability`).catch(() => ({ data: {} })),
          api.get(`/deliveries/hospital/${hospitalId}`).catch(() => ({ data: [] })),
          api.get(`/hospitals/${hospitalId}/requests`).catch(() => ({ data: [] })),
          api.get('/notifications?limit=5').catch(() => ({ data: [] })),
        ]);
        setBloodAvailability(bloodRes.data?.bloodAvailability || bloodRes.data || {});
        setDeliveries(Array.isArray(delRes.data) ? delRes.data : delRes.data.deliveries || []);
        setRequests(Array.isArray(reqRes.data) ? reqRes.data : reqRes.data.requests || []);
        const notifData = Array.isArray(notifRes.data) ? notifRes.data : notifRes.data.notifications || [];
        setNotifications(notifData.slice(0, 5));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    if (hospitalId) fetchData();
    else setLoading(false);
  }, [hospitalId]);

  const totalBlood = Object.values(bloodAvailability).reduce(
    (sum, v) => sum + (Number(v) || 0), 0
  );
  const pendingRequests = requests.filter((r) => r.status === 'Open' || r.status === 'In Progress').length;
  const recentDeliveries = deliveries.filter((d) => d.status !== 'Delivered' && d.status !== 'Cancelled').length;

  const statusBadge = (status) => {
    const map = {
      Open: 'primary', 'In Progress': 'info', Fulfilled: 'success', Cancelled: 'secondary',
      Pending: 'warning', 'In Transit': 'info', Delivered: 'success',
    };
    return <Badge bg={map[status] || 'secondary'}>{status}</Badge>;
  };

  const bloodLevel = (units) => {
    if (units < 5) return 'table-danger';
    if (units < 15) return 'table-warning';
    return '';
  };

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <span className="text-danger">🏥</span> {user?.name || 'Hospital'} Dashboard
          </h2>
          <p className="text-muted mb-0">{user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { icon: <FaTint className="text-danger" />, label: 'Total Blood Units', value: totalBlood, color: 'border-danger' },
          { icon: <FaBoxes className="text-warning" />, label: 'Pending Requests', value: pendingRequests, color: 'border-warning' },
          { icon: <FaTruck className="text-info" />, label: 'Active Deliveries', value: recentDeliveries, color: 'border-info' },
          { icon: <FaUsers className="text-success" />, label: 'Blood Groups', value: BLOOD_GROUPS.length, color: 'border-success' },
        ].map((s, i) => (
          <Col key={i} xs={6} md={3}>
            <Card className={`h-100 border-start border-4 ${s.color} shadow-sm`}>
              <Card.Body className="d-flex align-items-center gap-3">
                <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
                <div>
                  <div className="fw-bold fs-5">{loading ? '…' : s.value}</div>
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
            <Button as={Link} to="/hospital/blood-bank" variant="danger">
              <FaTint className="me-1" /> Update Blood Stock
            </Button>
            <Button as={Link} to="/hospital/requests" variant="outline-primary">
              Request Blood
            </Button>
            <Button as={Link} to="/hospital/deliveries" variant="outline-info">
              <FaTruck className="me-1" /> View Deliveries
            </Button>
            <Button as={Link} to="/hospital/patients" variant="outline-success">
              <FaUsers className="me-1" /> Patients
            </Button>
            <Button as={Link} to="/hospital/staff" variant="outline-secondary">
              Staff
            </Button>
            <Button as={Link} to="/analytics" variant="outline-warning">
              <FaChartBar className="me-1" /> Analytics
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {/* Blood Availability */}
        <Col xs={12} lg={7}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-bold"><FaTint className="text-danger me-2" />Blood Availability</span>
              <Link to="/hospital/blood-bank" className="btn btn-sm btn-outline-danger">Manage</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4 text-muted">Loading...</div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Blood Group</th>
                      <th>Units Available</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BLOOD_GROUPS.map((bg) => {
                      const units = Number(bloodAvailability[bg] || 0);
                      return (
                        <tr key={bg} className={bloodLevel(units)}>
                          <td><Badge bg="danger">{bg}</Badge></td>
                          <td className="fw-semibold">{units}</td>
                          <td>
                            {units === 0 ? (
                              <Badge bg="danger">Out of Stock</Badge>
                            ) : units < 5 ? (
                              <Badge bg="danger">Critical</Badge>
                            ) : units < 15 ? (
                              <Badge bg="warning" text="dark">Low</Badge>
                            ) : (
                              <Badge bg="success">Adequate</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right side: Recent Deliveries + Notifications */}
        <Col xs={12} lg={5}>
          {/* Recent Deliveries */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-bold"><FaTruck className="text-info me-2" />Recent Deliveries</span>
              <Link to="/hospital/deliveries" className="small text-danger">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {deliveries.length === 0 ? (
                <div className="text-center py-3 text-muted small">No deliveries</div>
              ) : (
                deliveries.slice(0, 4).map((d) => (
                  <div key={d._id} className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small fw-semibold">{d.trackingCode || d._id?.slice(-6)}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {d.bloodGroup} · {d.units} units
                      </div>
                    </div>
                    {statusBadge(d.status)}
                  </div>
                ))
              )}
            </Card.Body>
          </Card>

          {/* Recent Requests */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-bold">Recent Requests</span>
              <Link to="/hospital/requests" className="small text-danger">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {requests.length === 0 ? (
                <div className="text-center py-3 text-muted small">No requests</div>
              ) : (
                requests.slice(0, 4).map((r) => (
                  <div key={r._id} className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small fw-semibold">
                        <Badge bg="danger" className="me-2">{r.bloodGroup}</Badge>
                        {r.units} units
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{r.urgency}</div>
                    </div>
                    {statusBadge(r.status)}
                  </div>
                ))
              )}
            </Card.Body>
          </Card>

          {/* Notifications */}
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-bold"><FaBell className="text-warning me-2" />Notifications</span>
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

export default HospitalDashboard;
