import React, { useState, useEffect } from 'react';
import {
  Container, Card, Badge, Button, Table, Form,
  Modal, Row, Col, InputGroup
} from 'react-bootstrap';
import { FaTruck, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];
const PRIORITIES = ['Normal', 'High', 'Urgent', 'Critical'];

const statusColor = (s) => ({
  Pending: 'warning',
  'In Transit': 'info',
  Delivered: 'success',
  Cancelled: 'secondary'
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
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    bloodGroup: 'A+',
    units: '',
    fromHospital: '',
    toHospital: '',
    priority: 'Normal',
    notes: ''
  });

  // 🔹 Fetch deliveries
  const fetchDeliveries = async () => {
    try {
      const res = await api.get('/deliveries');

      const list = Array.isArray(res.data)
        ? res.data
        : res.data.deliveries || [];

      setDeliveries(list);
    } catch {
      setDeliveries([]);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // 🔹 Filtering
  useEffect(() => {
    let data = [...deliveries];

    if (statusFilter !== 'All')
      data = data.filter(d => d.status === statusFilter);

    if (bgFilter !== 'All')
      data = data.filter(d => d.bloodGroup === bgFilter);

    if (priorityFilter !== 'All')
      data = data.filter(d => d.priority === priorityFilter);

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(d =>
        (d.trackingCode || '').toLowerCase().includes(q) ||
        (d.bloodGroup || '').toLowerCase().includes(q)
      );
    }

    setFiltered(data);
  }, [deliveries, statusFilter, bgFilter, priorityFilter, search]);

  // 🔹 Update status
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/deliveries/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchDeliveries();
    } catch {
      toast.error('Failed to update status');
    }
  };

  // 🔹 Create delivery
  const createDelivery = async () => {
    if (!form.units || isNaN(form.units)) {
      toast.error('Enter valid units');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/deliveries', form);
      toast.success('Delivery created!');

      setShowCreate(false);
      setForm({
        bloodGroup: 'A+',
        units: '',
        fromHospital: '',
        toHospital: '',
        priority: 'Normal',
        notes: ''
      });

      fetchDeliveries();
    } catch {
      toast.error('Failed to create delivery');
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Stats
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'Pending').length,
    inTransit: deliveries.filter(d => d.status === 'In Transit').length,
    delivered: deliveries.filter(d => d.status === 'Delivered').length
  };

  return (
    <Container className="py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          <FaTruck className="text-info me-2" />
          Delivery Records
        </h2>

        <Button variant="danger" onClick={() => setShowCreate(true)}>
          <FaPlus className="me-1" /> New Delivery
        </Button>
      </div>

      {/* STATS */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'In Transit', value: stats.inTransit },
          { label: 'Delivered', value: stats.delivered }
        ].map((s, i) => (
          <Col key={i} xs={6} sm={3}>
            <Card className="border-start border-4 shadow-sm">
              <Card.Body>
                <div className="fw-bold fs-4">{loading ? '…' : s.value}</div>
                <div className="text-muted small">{s.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* FILTERS */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <InputGroup style={{ maxWidth: 240 }}>
          <InputGroup.Text><FaSearch /></InputGroup.Text>
          <Form.Control
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </Form.Select>

        <Form.Select value={bgFilter} onChange={(e) => setBgFilter(e.target.value)}>
          <option value="All">All Groups</option>
          {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
        </Form.Select>

        <Form.Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </Form.Select>
      </div>

      {/* TABLE */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-4 text-muted">No deliveries found</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tracking</th>
                  <th>Blood</th>
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
                {filtered.map(d => (
                  <tr key={d._id}>
                    <td>{d.trackingCode || d._id?.slice(-6)}</td>
                    <td><Badge bg="danger">{d.bloodGroup}</Badge></td>
                    <td>{d.units}</td>
                    <td>{d.fromHospital || '—'}</td>
                    <td>{d.toHospital || '—'}</td>
                    <td><Badge bg="info">{d.priority}</Badge></td>
                    <td><Badge bg={statusColor(d.status)}>{d.status}</Badge></td>
                    <td>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}</td>

                    {user?.role === 'admin' && (
                      <td>
                        {d.status === 'Pending' && (
                          <Button size="sm" onClick={() => updateStatus(d._id, 'In Transit')}>
                            Dispatch
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

        </Card.Body>
      </Card>

      {/* MODAL */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Delivery</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            placeholder="Units"
            value={form.units}
            onChange={(e) => setForm({ ...form, units: e.target.value })}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={createDelivery} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default DeliveryRecords;