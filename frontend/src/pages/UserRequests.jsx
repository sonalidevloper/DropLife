import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { FaDroplet, FaPlus } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const STATUS_COLOR = {
  pending: 'warning',
  fulfilled: 'success',
  cancelled: 'secondary'
};

const UserRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blood-request/my')
      .then(res => setRequests(res.data.data || res.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    try {
      await api.put(`/blood-request/${id}/cancel`);

      setRequests(prev =>
        prev.map(r =>
          r._id === id ? { ...r, status: 'cancelled' } : r
        )
      );

      toast.success('Cancelled');
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <Container className="py-4">

      <div className="d-flex justify-content-between mb-4">
        <h3><FaDroplet className="text-danger" /> My Requests</h3>

        <Link to="/blood-request">
          <Button><FaPlus /> New</Button>
        </Link>
      </div>

      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : requests.length === 0 ? (
            <Alert>No requests</Alert>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Blood</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td><Badge bg="danger">{r.bloodGroup}</Badge></td>
                    <td><Badge bg={STATUS_COLOR[r.status]}>{r.status}</Badge></td>
                    <td>
                      {r.status === 'pending' && (
                        <Button size="sm" onClick={() => cancel(r._id)}>
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

    </Container>
  );
};

export default UserRequests;