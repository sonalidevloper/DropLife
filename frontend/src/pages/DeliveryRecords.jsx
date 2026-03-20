import React, { useState, useEffect } from 'react';
import {
  Container, Card, Badge, Button, Table, Form, Modal, Row, Col, InputGroup
} from 'react-bootstrap';
import { FaTruck, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];
const PRIORITIES = ['Normal', 'High', 'Urgent', 'Critical'];

const statusColor = (s) => ({
  Pending: 'warning', 'In Transit': 'info', Delivered: 'success', Cancelled: 'secondary'
}[s] || 'secondary');

const DeliveryRecords = () => {
  const { user } = useSelector((state) => state.auth);
  const [deliveries, setDeliveries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [bgFilter, setBgFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    bloodGroup: 'A+', units: '', fromHospital: '', toHospital: '', priority: 'Normal', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDeliveries = async () => {
    try {
      const res = await api.get('/deliveries');
      setDeliveries(Array.isArray(res.data) ? res.data : res.data.deliveries || []);
    } catch {
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  useEffect(() => {
    let data = deliveries;
    if (statusFilter !== 'All') data = data.filter((d) => d.status === statusFilter);
    if (bgFilter !== 'All') data = data.filter((d) => d.bloodGroup === bgFilter);
    if (priorityFilter !== 'All') data = data.filter((d) => d.priority === priorityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((d) =>
        (d.trackingCode || '').toLowerCase().includes(q) ||
        (d.bloodGroup || '').toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [deliveries, statusFilter, bgFilter, priorityFilter, search]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/deliveries/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchDeliveries();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const createDelivery = async () => {
    if (!form.units || isNaN(form.units)) { toast.error('Enter valid units'); return; }
    setSubmitting(true);
    try {
      await api.post('/deliveries', form);
      toast.success('Delivery created!');
      setShowCreate(false);
      setForm({ bloodGroup: 'A+', units: '', fromHospital: '', toHospital: '', priority: 'Normal', notes: '' });
      fetchDeliveries();
    } catch {
      toast.error('Failed to create delivery');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter((d) => d.status === 'Pending').length,
    inTransit: deliveries.filter((d) => d.status === 'In Transit').length,
    delivered: deliveries.filter((d) => d.status === 'Delivered').length,
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"><FaTruck className="text-info me-2" />Delivery Records</h2>
        <Button variant="danger" onClick={() => setShowCreate(true)}>
          <FaPlus className="me-1" />New Delivery
        </Button>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Total', value: stats.total, color: 'border-secondary' },
          { label: 'Pending', value: stats.pending, color: 'border-warning' },
          { label: 'In Transit', value: stats.inTransit, color: 'border-info' },
          { label: 'Delivered', value: stats.delivered, color: 'border-success' },
        ].map((s, i) => (
          <Col key={i} xs={6} sm={3}>
            <Card className={`border-start border-4 ${s.color} shadow-sm`}>
              <Card.Body>
                <div className="fw-bold fs-4">{loading ? '…' : s.value}</div>
                <div className="text-muted small">{s.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
        <InputGroup style={{ maxWidth: 240 }}>
          <InputGroup.Text><FaSearch /></InputGroup.Text>
          <Form.Control
            placeholder="Search tracking code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
          />
        </InputGroup>
        <Form.Select size="sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 150 }}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </Form.Select>
        <Form.Select size="sm" value={bgFilter} onChange={(e) => setBgFilter(e.target.value)} style={{ maxWidth: 120 }}>
          <option value="All">All Groups</option>
          {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
        </Form.Select>
        <Form.Select size="sm" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ maxWidth: 140 }}>
          <option value="All">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </Form.Select>
      </div>

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
                  <th>To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d._id}>
                    <td className="fw-semibold small">{d.trackingCode || d._id?.slice(-8)}</td>
                    <td><Badge bg="danger">{d.bloodGroup}</Badge></td>
                    <td>{d.units}</td>
                    <td className="small">{d.from?.name || d.fromHospital || '—'}</td>
                    <td className="small">{d.to?.name || d.toHospital || '—'}</td>
                    <td>
                      <Badge bg={d.priority === 'Critical' ? 'danger' : d.priority === 'Urgent' ? 'warning' : d.priority === 'High' ? 'info' : 'secondary'}>
                        {d.priority || 'Normal'}
                      </Badge>
                    </td>
                    <td><Badge bg={statusColor(d.status)}>{d.status}</Badge></td>
                    <td className="small text-muted">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}
                    </td>
                    {user?.role === 'admin' && (
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {d.status === 'Pending' && (
                            <Button variant="outline-info" size="sm" onClick={() => updateStatus(d._id, 'In Transit')}>
                              Dispatch
                            </Button>
                          )}
                          {d.status === 'In Transit' && (
                            <Button variant="outline-success" size="sm" onClick={() => updateStatus(d._id, 'Delivered')}>
                              Delivered
                            </Button>
                          )}
                          {(d.status === 'Pending' || d.status === 'In Transit') && (
                            <Button variant="outline-danger" size="sm" onClick={() => updateStatus(d._id, 'Cancelled')}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create Delivery Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Create New Delivery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Blood Group</Form.Label>
                <Form.Select value={form.bloodGroup} onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}>
                  {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Units</Form.Label>
                <Form.Control type="number" min="1" value={form.units} onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>From Hospital</Form.Label>
                <Form.Control value={form.fromHospital} onChange={(e) => setForm((f) => ({ ...f, fromHospital: e.target.value }))} placeholder="Source hospital" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>To Hospital</Form.Label>
                <Form.Control value={form.toHospital} onChange={(e) => setForm((f) => ({ ...f, toHospital: e.target.value }))} placeholder="Destination hospital" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Priority</Form.Label>
                <Form.Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Notes</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button variant="danger" onClick={createDelivery} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DeliveryRecords;
