import React, { useState, useEffect } from 'react';
import {
  Container, Card, Badge, Button, Table, Form, InputGroup, Modal, Row, Col
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaTruck, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];

const statusColor = (s) => {
  const map = { Pending: 'warning', 'In Transit': 'info', Delivered: 'success', Cancelled: 'secondary' };
  return map[s] || 'secondary';
};

const HospitalDeliveries = () => {
  const { user } = useSelector((state) => state.auth);
  const hospitalId = user?.hospitalId || user?.id || user?._id;

  const [deliveries, setDeliveries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ bloodGroup: 'A+', units: '', priority: 'Normal', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDeliveries = async () => {
    try {
      const res = await api.get(`/deliveries/hospital/${hospitalId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.deliveries || [];
      setDeliveries(data);
      setFiltered(data);
    } catch {
      setDeliveries([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) fetchDeliveries();
    else setLoading(false);
  }, [hospitalId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let data = deliveries;
    if (activeTab !== 'All') data = data.filter((d) => d.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (d) =>
          (d.trackingCode || '').toLowerCase().includes(q) ||
          (d.bloodGroup || '').toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [activeTab, search, deliveries]);

  const cancelDelivery = async (id) => {
    if (!window.confirm('Cancel this delivery?')) return;
    try {
      await api.put(`/deliveries/${id}/status`, { status: 'Cancelled' });
      toast.success('Delivery cancelled');
      fetchDeliveries();
    } catch {
      toast.error('Failed to cancel delivery');
    }
  };

  const submitRequest = async () => {
    if (!form.units || isNaN(form.units)) {
      toast.error('Enter valid units');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/deliveries', { ...form, hospitalId });
      toast.success('Delivery request submitted!');
      setShowModal(false);
      setForm({ bloodGroup: 'A+', units: '', priority: 'Normal', notes: '' });
      fetchDeliveries();
    } catch {
      toast.error('Failed to request delivery');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"><FaTruck className="text-info me-2" />Delivery Records</h2>
        <Button variant="danger" onClick={() => setShowModal(true)}>
          <FaPlus className="me-1" />Request New Delivery
        </Button>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {STATUSES.map((s) => (
          <Button
            key={s}
            variant={activeTab === s ? 'danger' : 'outline-secondary'}
            size="sm"
            onClick={() => setActiveTab(s)}
          >
            {s}
            {s !== 'All' && (
              <Badge bg="light" text="dark" className="ms-1">
                {deliveries.filter((d) => d.status === s).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Search */}
      <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          placeholder="Search by tracking code or blood group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* Table */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4 text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-4 text-muted">No deliveries found</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tracking Code</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>From</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d._id}>
                    <td className="fw-semibold small">{d.trackingCode || d._id?.slice(-8)}</td>
                    <td><Badge bg="danger">{d.bloodGroup}</Badge></td>
                    <td>{d.units}</td>
                    <td className="small">{d.from?.name || d.fromHospital || '—'}</td>
                    <td>
                      <Badge bg={d.priority === 'Urgent' ? 'danger' : d.priority === 'High' ? 'warning' : 'secondary'}>
                        {d.priority || 'Normal'}
                      </Badge>
                    </td>
                    <td><Badge bg={statusColor(d.status)}>{d.status}</Badge></td>
                    <td className="small text-muted">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {d.status === 'Pending' && (
                        <Button
                          variant="outline-danger" size="sm"
                          onClick={() => cancelDelivery(d._id)}
                        >
                          <FaTimes />
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

      {/* Request Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Request New Delivery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Blood Group</Form.Label>
                <Form.Select
                  value={form.bloodGroup}
                  onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                >
                  {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Units Required</Form.Label>
                <Form.Control
                  type="number" min="1"
                  value={form.units}
                  onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))}
                  placeholder="e.g. 2"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                >
                  {['Normal', 'High', 'Urgent', 'Critical'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea" rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Any special instructions..."
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={submitRequest} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HospitalDeliveries;
