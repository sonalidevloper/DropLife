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

const statusColor = (s) => ({
  Pending: 'warning',
  'In Transit': 'info',
  Delivered: 'success',
  Cancelled: 'secondary'
}[s] || 'secondary');

const HospitalDeliveries = () => {
  const { user } = useSelector((state) => state.auth);
  const hospitalId = user?._id;

  const [deliveries, setDeliveries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    bloodGroup: 'A+',
    units: '',
    priority: 'Normal',
    notes: ''
  });

  // 🔹 Fetch
  const fetchData = async () => {
    try {
      const res = await api.get(`/deliveries/hospital/${hospitalId}`);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.deliveries || [];

      setDeliveries(data);
    } catch {
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) fetchData();
  }, [hospitalId]);

  // 🔹 Filter
  useEffect(() => {
    let data = [...deliveries];

    if (activeTab !== 'All') {
      data = data.filter(d => d.status === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        (d.trackingCode || '').toLowerCase().includes(q)
      );
    }

    setFiltered(data);
  }, [deliveries, activeTab, search]);

  // 🔹 Cancel
  const cancelDelivery = async (id) => {
    if (!window.confirm('Cancel delivery?')) return;

    try {
      await api.put(`/deliveries/${id}/status`, { status: 'Cancelled' });
      toast.success('Cancelled');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  // 🔹 Request
  const submitRequest = async () => {
    if (!form.units || isNaN(form.units)) {
      toast.error('Invalid units');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/deliveries', { ...form, hospitalId });

      toast.success('Request sent');
      setShowModal(false);
      fetchData();
    } catch {
      toast.error('Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h3><FaTruck className="text-info me-2" />Deliveries</h3>

        <Button variant="danger" onClick={() => setShowModal(true)}>
          <FaPlus /> Request
        </Button>
      </div>

      {/* FILTER */}
      <InputGroup className="mb-3">
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          placeholder="Search tracking..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* TABLE */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Tracking</th>
                  <th>Blood</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(d => (
                  <tr key={d._id}>
                    <td>{d.trackingCode || d._id.slice(-6)}</td>
                    <td><Badge bg="danger">{d.bloodGroup}</Badge></td>
                    <td>{d.units}</td>
                    <td><Badge bg={statusColor(d.status)}>{d.status}</Badge></td>
                    <td>
                      {d.status === 'Pending' && (
                        <Button size="sm" onClick={() => cancelDelivery(d._id)}>
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

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Body>
          <Form.Control
            placeholder="Units"
            value={form.units}
            onChange={(e) =>
              setForm({ ...form, units: e.target.value })
            }
          />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={submitRequest} disabled={submitting}>
            {submitting ? 'Sending...' : 'Submit'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default HospitalDeliveries;