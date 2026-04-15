import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Card, Table, Badge, Button, Modal, Form
} from 'react-bootstrap';
import { FaHandHoldingMedical, FaEye, FaCheck } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const DEMO_REQUESTS = [
  {
    _id: 'r1', patientName: 'Ramesh Kumar', bloodGroup: 'O+', unitsRequired: 3,
    urgency: 'Critical', status: 'Open',
    hospital: { name: 'AIIMS Delhi', address: 'Ansari Nagar, New Delhi' },
    requesterName: 'Suresh Kumar', requesterPhone: '9876543210',
    needByDate: new Date('2024-03-05'), createdAt: new Date('2024-03-03')
  },
  {
    _id: 'r2', patientName: 'Priya Sharma', bloodGroup: 'A+', unitsRequired: 2,
    urgency: 'Urgent', status: 'In Progress',
    hospital: { name: 'Apollo Hospital', address: 'Jubilee Hills, Hyderabad' },
    requesterName: 'Anand Sharma', requesterPhone: '8765432109',
    needByDate: new Date('2024-03-06'), createdAt: new Date('2024-03-04')
  },
  {
    _id: 'r3', patientName: 'Mohan Das', bloodGroup: 'B-', unitsRequired: 1,
    urgency: 'Normal', status: 'Fulfilled',
    hospital: { name: 'KIMS Hospital', address: 'KIIT Road, Bhubaneswar' },
    requesterName: 'Gita Das', requesterPhone: '7654321098',
    needByDate: new Date('2024-03-07'), createdAt: new Date('2024-03-05')
  }
];

const URGENCY_VARIANT = { Critical: 'danger', Urgent: 'warning', Normal: 'secondary' };
const STATUS_VARIANT  = { Open: 'primary', 'In Progress': 'warning', Fulfilled: 'success', Cancelled: 'danger' };

const HospitalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/blood-request', { params });
      const data = res.data.data || [];
      setRequests(data.length ? data : DEMO_REQUESTS);
    } catch {
      setRequests(DEMO_REQUESTS);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleFulfill = async (id) => {
    try {
      await api.put(`/blood-request/${id}/status`, { status: 'Fulfilled' });
      toast.success('Request marked as fulfilled');
      fetchRequests();
    } catch { toast.error('Failed to update request'); }
  };

  const filtered = requests; // filter already applied via API param

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">
        <FaHandHoldingMedical className="me-2 text-danger" />Blood Requests
      </h2>

      {/* Summary */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {Object.keys(STATUS_VARIANT).map((s) => (
          <Card key={s} className="border-0 shadow-sm text-center px-3 py-2" style={{ minWidth: 110 }}>
            <Badge bg={STATUS_VARIANT[s]} className="mb-1">{s}</Badge>
            <div className="fw-bold">{requests.filter(r => r.status === s).length}</div>
          </Card>
        ))}
      </div>

      <Card className="shadow">
        <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">All Blood Requests</h5>
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
              {filtered.map((req) => (
                <tr key={req._id}>
                  <td className="fw-bold">{req.patientName}</td>
                  <td><Badge bg="danger">{req.bloodGroup}</Badge></td>
                  <td>{req.unitsRequired}</td>
                  <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {req.hospital?.name}
                  </td>
                  <td><Badge bg={URGENCY_VARIANT[req.urgency]}>{req.urgency}</Badge></td>
                  <td><Badge bg={STATUS_VARIANT[req.status]}>{req.status}</Badge></td>
                  <td>{req.needByDate ? new Date(req.needByDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <Button size="sm" variant="outline-info" className="me-1"
                      onClick={() => { setViewRequest(req); setShowModal(true); }}>
                      <FaEye />
                    </Button>
                    {req.status === 'In Progress' && (
                      <Button size="sm" variant="success" onClick={() => handleFulfill(req._id)}>
                        <FaCheck />
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
          <Modal.Title>Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewRequest && (
            <div>
              <p><strong>Patient:</strong> {viewRequest.patientName}</p>
              <p><strong>Blood Group:</strong> <Badge bg="danger">{viewRequest.bloodGroup}</Badge></p>
              <p><strong>Units Required:</strong> {viewRequest.unitsRequired}</p>
              <p><strong>Urgency:</strong> <Badge bg={URGENCY_VARIANT[viewRequest.urgency]}>{viewRequest.urgency}</Badge></p>
              <p><strong>Hospital:</strong> {viewRequest.hospital?.name}</p>
              <p><strong>Address:</strong> {viewRequest.hospital?.address}</p>
              <p><strong>Requester:</strong> {viewRequest.requesterName} — {viewRequest.requesterPhone}</p>
              <p><strong>Need By:</strong> {viewRequest.needByDate ? new Date(viewRequest.needByDate).toLocaleDateString() : '—'}</p>
              <p><strong>Status:</strong> <Badge bg={STATUS_VARIANT[viewRequest.status]}>{viewRequest.status}</Badge></p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          {viewRequest?.status === 'In Progress' && (
            <Button variant="success" onClick={() => { handleFulfill(viewRequest._id); setShowModal(false); }}>
              Mark Fulfilled
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HospitalRequests;