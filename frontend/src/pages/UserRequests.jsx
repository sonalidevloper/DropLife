import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { FaDroplet, FaPlus } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const STATUS_COLOR = { pending: 'warning', fulfilled: 'success', cancelled: 'secondary', active: 'primary', expired: 'dark' };

const UserRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blood-requests/my').then(res => {
      setRequests(res.data.data || res.data || []);
    }).catch(() => {
      toast.error('Failed to load requests');
    }).finally(() => setLoading(false));
  }, []);

  const cancelRequest = async (id) => {
    if (!window.confirm('Cancel this request?')) return;
    try {
      await api.put(`/blood-requests/${id}/cancel`);
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'cancelled' } : r));
      toast.success('Request cancelled');
    } catch {
      toast.error('Failed to cancel');
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="fw-bold d-flex align-items-center gap-2">
          <FaDroplet className="text-danger" /> My Blood Requests
        </h3>
        <Link to="/blood-request">
          <Button variant="danger" size="sm" className="d-flex align-items-center gap-2">
            <FaPlus /> New Request
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-danger" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-5">
              <Alert variant="info" className="m-4">
                <FaDroplet className="me-2" />
                No blood requests yet. <Link to="/blood-request">Create your first request</Link>
              </Alert>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th><th>Blood Group</th><th>Units</th><th>Hospital</th><th>Date</th><th>Urgency</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td><Badge bg="danger">{r.bloodGroup}</Badge></td>
                    <td>{r.unitsRequired || r.units || 1}</td>
                    <td>{r.hospital || r.hospitalName || 'Not specified'}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><Badge bg={r.urgency === 'Critical' ? 'danger' : r.urgency === 'High' ? 'warning' : 'info'}>{r.urgency || 'Normal'}</Badge></td>
                    <td><Badge bg={STATUS_COLOR[r.status] || 'secondary'}>{r.status}</Badge></td>
                    <td>
                      {r.status === 'pending' && (
                        <Button size="sm" variant="outline-danger" onClick={() => cancelRequest(r._id)}>Cancel</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserRequests;
