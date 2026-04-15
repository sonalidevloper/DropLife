import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Card, Table, Button, Modal, Form, Badge, InputGroup
} from 'react-bootstrap';
import { FaUsers, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const DEMO_STAFF = [
  { _id: 's1', name: 'Dr. Anjali Singh',  role: 'Doctor',        phone: '9876543210', email: 'anjali@hospital.com' },
  { _id: 's2', name: 'Nurse Priya Patel', role: 'Nurse',         phone: '8765432109', email: 'priya@hospital.com'  },
  { _id: 's3', name: 'Ram Technician',    role: 'Lab Technician',phone: '7654321098', email: 'ram@hospital.com'    },
  { _id: 's4', name: 'Sita Coordinator',  role: 'Coordinator',   phone: '6543210987', email: 'sita@hospital.com'   },
];

const ROLE_VARIANT = {
  Doctor: 'primary', Nurse: 'success', 'Lab Technician': 'info',
  Coordinator: 'warning', Pharmacist: 'secondary', Other: 'dark'
};

const HospitalStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', phone: '', email: '' });

  const fetchStaff = useCallback(async () => {
    try {
      const res = await api.get('/hospitals/staff/list');
      const data = res.data.data || [];
      setStaff(data.length ? data : DEMO_STAFF);
    } catch {
      setStaff(DEMO_STAFF);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hospitals/staff', newStaff);
      toast.success('Staff member added');
      setShowModal(false);
      setNewStaff({ name: '', role: '', phone: '', email: '' });
      fetchStaff();
    } catch { toast.error('Failed to add staff'); }
  };

  const handleRemove = async (staffId) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await api.delete(`/hospitals/staff/${staffId}`);
      toast.success('Staff member removed');
      fetchStaff();
    } catch { toast.error('Failed to remove staff'); }
  };

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold"><FaUsers className="me-2 text-danger" />Staff Management</h2>
        <Button variant="danger" size="sm" onClick={() => setShowModal(true)}>
          <FaPlus className="me-1" />Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {Object.keys(ROLE_VARIANT).map((role) => {
          const count = staff.filter((s) => s.role === role).length;
          if (count === 0) return null;
          return (
            <Card key={role} className="border-0 shadow-sm text-center px-3 py-2" style={{ minWidth: 100 }}>
              <Badge bg={ROLE_VARIANT[role]} className="mb-1">{role}</Badge>
              <div className="fw-bold">{count}</div>
            </Card>
          );
        })}
        <Card className="border-0 shadow-sm text-center px-3 py-2" style={{ minWidth: 100 }}>
          <Badge bg="dark" className="mb-1">Total</Badge>
          <div className="fw-bold">{staff.length}</div>
        </Card>
      </div>

      <Card className="shadow">
        <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Hospital Staff</h5>
          <div style={{ width: '220px' }}>
            <InputGroup size="sm">
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                placeholder="Search name or role…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member, idx) => (
                <tr key={member._id}>
                  <td>{idx + 1}</td>
                  <td className="fw-bold">{member.name}</td>
                  <td>
                    <Badge bg={ROLE_VARIANT[member.role] || 'dark'}>{member.role}</Badge>
                  </td>
                  <td>{member.phone}</td>
                  <td>{member.email}</td>
                  <td>
                    <Button size="sm" variant="danger" onClick={() => handleRemove(member._id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add Staff Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FaPlus className="me-2 text-danger" />Add Staff Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAdd}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control required value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                placeholder="Staff member name" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role *</Form.Label>
              <Form.Select required value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
                <option value="">Select role</option>
                {Object.keys(ROLE_VARIANT).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="tel" value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                placeholder="10-digit number" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                placeholder="staff@hospital.com" />
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">Add Staff</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default HospitalStaff;