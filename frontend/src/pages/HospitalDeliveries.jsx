import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Card, Table, Badge, Button, Modal, Form
} from 'react-bootstrap';
import { FaTruck, FaPlus, FaEye } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const DEMO_DELIVERIES = [
  { _id: 'd1', trackingId: 'DL20240301ABC', bloodGroup: 'A+', units: 5, status: 'Delivered',
    fromAddress: 'City Blood Bank, Bhubaneswar', priority: 'Urgent',
    estimatedDelivery: new Date('2024-03-01'), actualDelivery: new Date('2024-03-01') },
  { _id: 'd2', trackingId: 'DL20240302DEF', bloodGroup: 'O+', units: 3, status: 'In Transit',
    fromAddress: 'KIMS Hospital, Bhubaneswar', priority: 'Critical',
    estimatedDelivery: new Date('2024-03-02'), actualDelivery: null },
  { _id: 'd3', trackingId: 'DL20240303GHI', bloodGroup: 'B+', units: 2, status: 'Pending',
    fromAddress: 'Apollo Hospital, Hyderabad', priority: 'Normal',
    estimatedDelivery: new Date('2024-03-04'), actualDelivery: null },
];

const STATUS_VARIANT = {
  Pending: 'warning', 'Picked Up': 'info', 'In Transit': 'primary',
  Delivered: 'success', Cancelled: 'danger'
};

const HospitalDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/deliveries');
      const data = res.data.data || [];
      setDeliveries(data.length ? data : DEMO_DELIVERIES);
    } catch {
      setDeliveries(DEMO_DELIVERIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/deliveries/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = statusFilter
    ? deliveries.filter((d) => d.status === statusFilter)
    : deliveries;

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold"><FaTruck className="me-2 text-danger" />Blood Deliveries</h2>
        <Button variant="danger" size="sm">
          <FaPlus className="me-1" />New Delivery
        </Button>
      </div>

      {/* Summary cards */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {Object.keys(STATUS_VARIANT).map((s) => (
          <Card key={s} className="text-center border-0 shadow-sm px-3 py-2" style={{ minWidth: 120 }}>
            <Badge bg={STATUS_VARIANT[s]} className="mb-1">{s}</Badge>
            <div className="fw-bold">{deliveries.filter(d => d.status === s).length}</div>
          </Card>
        ))}
      </div>

      <Card className="shadow">
        <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Delivery Records</h5>
          <Form.Select
            size="sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_VARIANT).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Form.Select>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Blood</th>
                <th>Units</th>
                <th>From</th>
                <th>Priority</th>
                <th>Status</th>
                <th>ETA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d._id}>
                  <td className="fw-bold text-danger">{d.trackingId}</td>
                  <td><Badge bg="danger">{d.bloodGroup}</Badge></td>
                  <td>{d.units}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.fromAddress}
                  </td>
                  <td>
                    <Badge bg={d.priority === 'Critical' ? 'danger' : d.priority === 'Urgent' ? 'warning' : 'secondary'}>
                      {d.priority}
                    </Badge>
                  </td>
                  <td><Badge bg={STATUS_VARIANT[d.status]}>{d.status}</Badge></td>
                  <td>{d.estimatedDelivery ? new Date(d.estimatedDelivery).toLocaleDateString() : '—'}</td>
                  <td>
                    <Button size="sm" variant="outline-info" className="me-1"
                      onClick={() => { setSelectedDelivery(d); setShowModal(true); }}>
                      <FaEye />
                    </Button>
                    {d.status === 'In Transit' && (
                      <Button size="sm" variant="success"
                        onClick={() => handleStatusUpdate(d._id, 'Delivered')}>
                        Mark Delivered
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Detail modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delivery Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDelivery && (
            <div>
              <p><strong>Tracking ID:</strong> {selectedDelivery.trackingId}</p>
              <p><strong>Blood Group:</strong> {selectedDelivery.bloodGroup}</p>
              <p><strong>Units:</strong> {selectedDelivery.units}</p>
              <p><strong>From:</strong> {selectedDelivery.fromAddress}</p>
              <p><strong>Priority:</strong> {selectedDelivery.priority}</p>
              <p><strong>Status:</strong> <Badge bg={STATUS_VARIANT[selectedDelivery.status]}>{selectedDelivery.status}</Badge></p>
              {selectedDelivery.actualDelivery && (
                <p><strong>Delivered:</strong> {new Date(selectedDelivery.actualDelivery).toLocaleString()}</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HospitalDeliveries;