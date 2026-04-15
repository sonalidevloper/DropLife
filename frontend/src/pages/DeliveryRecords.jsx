import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Table, Badge, Button, Modal,
  Form, InputGroup
} from 'react-bootstrap';
import {
  FaTruck, FaSearch, FaEye, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_VARIANT = {
  Pending:     'warning',
  'Picked Up': 'info',
  'In Transit':'primary',
  Delivered:  'success',
  Cancelled:  'danger'
};

const PRIORITY_VARIANT = { Critical: 'danger', Urgent: 'warning', Normal: 'secondary' };

const DEMO = [
  {
    _id: 'd1', trackingId: 'DL2024031ABC', bloodGroup: 'A+', units: 5,
    fromAddress: 'City Blood Bank, Bhubaneswar', toAddress: 'KIMS Hospital, Bhubaneswar',
    status: 'Delivered', priority: 'Critical',
    estimatedDelivery: new Date('2024-03-01'), actualDelivery: new Date('2024-03-01'),
    createdAt: new Date('2024-03-01')
  },
  {
    _id: 'd2', trackingId: 'DL2024032DEF', bloodGroup: 'O+', units: 3,
    fromAddress: 'Apollo Hospital, Hyderabad', toAddress: 'Yashoda Hospital, Hyderabad',
    status: 'In Transit', priority: 'Urgent',
    estimatedDelivery: new Date('2024-03-05'), actualDelivery: null,
    createdAt: new Date('2024-03-04')
  },
  {
    _id: 'd3', trackingId: 'DL2024033GHI', bloodGroup: 'B-', units: 2,
    fromAddress: 'AIIMS, New Delhi', toAddress: 'Max Hospital, New Delhi',
    status: 'Pending', priority: 'Normal',
    estimatedDelivery: new Date('2024-03-07'), actualDelivery: null,
    createdAt: new Date('2024-03-05')
  }
];

const DeliveryRecords = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDeliveries = useCallback(async () => {
    try {
      const res = await api.get('/deliveries');
      const data = res.data.data || [];
      setDeliveries(data.length ? data : DEMO);
    } catch {
      setDeliveries(DEMO);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/deliveries/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchDeliveries();
    } catch { toast.error('Failed to update status'); }
  };

  const deleteDelivery = async (id) => {
    if (!window.confirm('Delete this delivery record?')) return;
    try {
      await api.delete(`/deliveries/${id}`);
      toast.success('Delivery record deleted');
      fetchDeliveries();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = deliveries.filter((d) => {
    const matchSearch = !searchTerm ||
      d.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary counts
  const counts = Object.keys(STATUS_VARIANT).reduce((acc, s) => {
    acc[s] = deliveries.filter((d) => d.status === s).length;
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">
            <FaTruck className="me-2 text-danger" />Blood Delivery Records
          </h2>
          <p className="text-muted">Track and manage all blood deliveries</p>
        </Col>
      </Row>

      {/* Summary cards */}
      <Row className="mb-4">
        {Object.entries(counts).map(([status, count]) => (
          <Col key={status} className="mb-2">
            <Card className="border-0 shadow-sm text-center py-2 px-1">
              <Badge bg={STATUS_VARIANT[status]} className="mb-1 mx-auto"
                style={{ fontSize: '0.75rem' }}>
                {status}
              </Badge>
              <div className="fw-bold fs-5">{count}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-2">
            <Col md={5}>
              <InputGroup size="sm">
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search tracking ID or blood group…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select size="sm" value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {Object.keys(STATUS_VARIANT).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Badge bg="primary" className="py-2 px-3">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="shadow">
        <Card.Header className="bg-danger text-white">
          <h5 className="mb-0">All Delivery Records</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Blood</th>
                <th>Units</th>
                <th>From → To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>ETA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d._id}>
                  <td className="fw-bold text-danger" style={{ fontSize: '0.85rem' }}>
                    {d.trackingId}
                  </td>
                  <td><Badge bg="danger">{d.bloodGroup}</Badge></td>
                  <td>{d.units}</td>
                  <td style={{ maxWidth: 180, fontSize: '0.82rem' }}>
                    <div className="text-truncate">{d.fromAddress}</div>
                    <div className="text-muted text-truncate">→ {d.toAddress}</div>
                  </td>
                  <td>
                    <Badge bg={PRIORITY_VARIANT[d.priority]}>{d.priority}</Badge>
                  </td>
                  <td>
                    <Badge bg={STATUS_VARIANT[d.status]}>{d.status}</Badge>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {d.estimatedDelivery
                      ? new Date(d.estimatedDelivery).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button size="sm" variant="outline-info"
                        onClick={() => { setSelected(d); setShowModal(true); }}>
                        <FaEye />
                      </Button>
                      {d.status === 'In Transit' && (
                        <Button size="sm" variant="success"
                          onClick={() => updateStatus(d._id, 'Delivered')}>
                          <FaCheckCircle />
                        </Button>
                      )}
                      {d.status === 'Pending' && (
                        <Button size="sm" variant="danger"
                          onClick={() => deleteDelivery(d._id)}>
                          <FaTimesCircle />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTruck className="me-2 text-danger" />Delivery Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <Row>
                <Col md={6}><p><strong>Tracking ID:</strong></p></Col>
                <Col md={6}><p className="text-danger fw-bold">{selected.trackingId}</p></Col>
                <Col md={6}><p><strong>Blood Group:</strong></p></Col>
                <Col md={6}><p><Badge bg="danger">{selected.bloodGroup}</Badge></p></Col>
                <Col md={6}><p><strong>Units:</strong></p></Col>
                <Col md={6}><p>{selected.units}</p></Col>
                <Col md={6}><p><strong>Priority:</strong></p></Col>
                <Col md={6}>
                  <p><Badge bg={PRIORITY_VARIANT[selected.priority]}>{selected.priority}</Badge></p>
                </Col>
                <Col md={6}><p><strong>Status:</strong></p></Col>
                <Col md={6}>
                  <p><Badge bg={STATUS_VARIANT[selected.status]}>{selected.status}</Badge></p>
                </Col>
                <Col md={6}><p><strong>From:</strong></p></Col>
                <Col md={6}><p>{selected.fromAddress}</p></Col>
                <Col md={6}><p><strong>To:</strong></p></Col>
                <Col md={6}><p>{selected.toAddress}</p></Col>
                <Col md={6}><p><strong>ETA:</strong></p></Col>
                <Col md={6}>
                  <p>{selected.estimatedDelivery
                    ? new Date(selected.estimatedDelivery).toLocaleDateString()
                    : '—'}</p>
                </Col>
                {selected.actualDelivery && (
                  <>
                    <Col md={6}><p><strong>Delivered:</strong></p></Col>
                    <Col md={6}>
                      <p>{new Date(selected.actualDelivery).toLocaleString()}</p>
                    </Col>
                  </>
                )}
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          {selected?.status === 'In Transit' && (
            <Button variant="success"
              onClick={() => { updateStatus(selected._id, 'Delivered'); setShowModal(false); }}>
              Mark as Delivered
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DeliveryRecords;