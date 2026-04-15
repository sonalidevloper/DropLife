import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Badge, Button, Table, Modal, Form
} from 'react-bootstrap';
import {
  FaUser, FaTint, FaHandHoldingMedical, FaMapMarkerAlt,
  FaBell, FaClock, FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const URGENCY_VARIANT = { Critical: 'danger', Urgent: 'warning', Normal: 'secondary' };
const STATUS_VARIANT  = { Open: 'primary', 'In Progress': 'warning', Fulfilled: 'success', Cancelled: 'danger' };

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  const fetchMyRequests = useCallback(async () => {
    try {
      const res = await api.get('/blood-request');
      // Show only requests made by this user
      const all = res.data.data || [];
      const mine = all.filter(
        (r) => r.requestedBy === user?.id || r.requesterEmail === user?.email
      );
      setMyRequests(mine);
    } catch {
      setMyRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchMyRequests(); }, [fetchMyRequests]);

  const handleCancel = async () => {
    try {
      await api.put(`/blood-request/${cancelId}/status`, { status: 'Cancelled' });
      toast.success('Request cancelled');
      setShowCancelModal(false);
      fetchMyRequests();
    } catch { toast.error('Failed to cancel request'); }
  };

  const openCount    = myRequests.filter((r) => r.status === 'Open').length;
  const progressCount = myRequests.filter((r) => r.status === 'In Progress').length;
  const fulfilledCount = myRequests.filter((r) => r.status === 'Fulfilled').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-page">
      <Container className="py-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="dashboard-header">
              <h2 className="fw-bold">
                <FaUser className="me-2 text-danger" />
                Welcome, {user?.name}!
              </h2>
              <p className="text-muted">Manage your blood requests here</p>
            </div>
          </Col>
          <Col className="text-end">
            <Link to="/blood-request" className="btn btn-danger">
              <FaHandHoldingMedical className="me-2" />New Blood Request
            </Link>
          </Col>
        </Row>

        {/* Stats */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-primary text-white shadow text-center p-3">
              <FaTint size={30} className="mb-2" />
              <h3>{myRequests.length}</h3>
              <p className="mb-0">Total Requests</p>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-warning text-white shadow text-center p-3">
              <FaClock size={30} className="mb-2" />
              <h3>{openCount}</h3>
              <p className="mb-0">Open</p>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-info text-white shadow text-center p-3">
              <FaBell size={30} className="mb-2" />
              <h3>{progressCount}</h3>
              <p className="mb-0">In Progress</p>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-success text-white shadow text-center p-3">
              <FaCheckCircle size={30} className="mb-2" />
              <h3>{fulfilledCount}</h3>
              <p className="mb-0">Fulfilled</p>
            </Card>
          </Col>
        </Row>

        {/* My Requests */}
        <Row>
          <Col>
            <Card className="dashboard-card shadow">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">
                  <FaHandHoldingMedical className="me-2" />My Blood Requests
                </h5>
              </Card.Header>
              <Card.Body>
                {myRequests.length === 0 ? (
                  <div className="text-center py-5">
                    <FaTint size={60} className="text-muted mb-3" />
                    <p className="text-muted">No blood requests yet.</p>
                    <Link to="/blood-request" className="btn btn-danger mt-2">
                      Create Your First Request
                    </Link>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Blood</th>
                        <th>Units</th>
                        <th>Hospital</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Need By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.map((req) => (
                        <tr key={req._id}>
                          <td className="fw-bold">{req.patientName}</td>
                          <td><Badge bg="danger">{req.bloodGroup}</Badge></td>
                          <td>{req.unitsRequired}</td>
                          <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.hospital?.name}
                          </td>
                          <td>
                            <Badge bg={URGENCY_VARIANT[req.urgency]}>{req.urgency}</Badge>
                          </td>
                          <td>
                            <Badge bg={STATUS_VARIANT[req.status]}>{req.status}</Badge>
                          </td>
                          <td>
                            {req.needByDate
                              ? new Date(req.needByDate).toLocaleDateString()
                              : '—'}
                          </td>
                          <td>
                            {req.status === 'Open' && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => { setCancelId(req._id); setShowCancelModal(true); }}
                              >
                                Cancel
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick links */}
        <Row className="mt-4">
          {[
            { to: '/blood-availability', label: 'Check Blood Availability', icon: FaTint,          variant: 'outline-danger'  },
            { to: '/hospitals',          label: 'Find Hospitals',            icon: FaMapMarkerAlt,  variant: 'outline-primary' },
            { to: '/camps',              label: 'Donation Camps',            icon: FaBell,          variant: 'outline-success' },
            { to: '/helpline',           label: 'Emergency Helpline',        icon: FaHandHoldingMedical, variant: 'outline-warning' },
          ].map(({ to, label, icon: Icon, variant }) => (
            <Col md={3} key={to} className="mb-3">
              <Card className="dashboard-card shadow text-center p-3 h-100">
                <Icon size={30} className="text-danger mb-2 mx-auto" />
                <Link to={to} className={`btn btn-sm ${variant}`}>{label}</Link>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Cancel Confirmation */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Request?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this blood request?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>No, Keep It</Button>
          <Button variant="danger" onClick={handleCancel}>Yes, Cancel</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserDashboard;