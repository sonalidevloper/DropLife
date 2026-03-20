import React, { useState, useEffect } from 'react';
import {
  Container, Card, Badge, Button, Table, Form, Modal, Row, Col
} from 'react-bootstrap';
import { FaUserMd, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const ROLES = ['Doctor', 'Nurse', 'Technician', 'Admin', 'Receptionist', 'Pharmacist'];
const DEPARTMENTS = [
  'Emergency', 'ICU', 'Cardiology', 'Blood Bank', 'Pediatrics',
  'Maternity', 'Orthopedic', 'Neurology', 'General Medicine', 'Administration',
];

const DEMO_STAFF = [
  { id: 1, name: 'Dr. Anand Sharma', role: 'Doctor', department: 'Cardiology', contact: '9876543210', email: 'anand@hospital.com' },
  { id: 2, name: 'Nurse Meena Patel', role: 'Nurse', department: 'ICU', contact: '9876543211', email: 'meena@hospital.com' },
  { id: 3, name: 'Rajesh Kumar', role: 'Technician', department: 'Blood Bank', contact: '9876543212', email: 'rajesh@hospital.com' },
];

const STORAGE_KEY = 'hospitalStaff';

const HospitalStaff = () => {
  const { user } = useSelector((state) => state.auth);
  const storageKey = `${STORAGE_KEY}_${user?.id || 'demo'}`;

  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [form, setForm] = useState({
    name: '', role: 'Doctor', department: '', contact: '', email: ''
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    setStaff(stored || DEMO_STAFF);
  }, [storageKey]);

  const save = (updated) => {
    setStaff(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const addStaff = () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    const newMember = { ...form, id: Date.now() };
    save([newMember, ...staff]);
    toast.success('Staff member added');
    setShowModal(false);
    setForm({ name: '', role: 'Doctor', department: '', contact: '', email: '' });
  };

  const removeStaff = (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    save(staff.filter((s) => s.id !== id));
    toast.success('Staff member removed');
  };

  const filtered = staff.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = ROLES.reduce((acc, r) => {
    acc[r] = staff.filter((s) => s.role === r).length;
    return acc;
  }, {});

  const roleColors = {
    Doctor: 'danger', Nurse: 'success', Technician: 'info',
    Admin: 'secondary', Receptionist: 'warning', Pharmacist: 'primary',
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">
          <FaUserMd className="text-danger me-2" />Staff Management
        </h2>
        <Button variant="danger" onClick={() => setShowModal(true)}>
          <FaPlus className="me-1" />Add Staff
        </Button>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        <Col xs={6} sm={3}>
          <Card className="border-start border-4 border-primary shadow-sm">
            <Card.Body>
              <div className="fw-bold fs-4">{staff.length}</div>
              <div className="text-muted small">Total Staff</div>
            </Card.Body>
          </Card>
        </Col>
        {Object.entries(roleCounts)
          .filter(([, count]) => count > 0)
          .slice(0, 3)
          .map(([role, count]) => (
            <Col key={role} xs={6} sm={3}>
              <Card className={`border-start border-4 border-${roleColors[role] || 'secondary'} shadow-sm`}>
                <Card.Body>
                  <div className="fw-bold fs-4">{count}</div>
                  <div className="text-muted small">{role}s</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
      </Row>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
        <Form.Control
          placeholder="Search by name or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <Form.Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ maxWidth: 180 }}
        >
          <option value="All">All Roles</option>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </Form.Select>
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-4 text-muted">No staff found</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-muted small">{i + 1}</td>
                    <td className="fw-semibold">{s.name}</td>
                    <td>
                      <Badge bg={roleColors[s.role] || 'secondary'}>{s.role}</Badge>
                    </td>
                    <td>{s.department || '—'}</td>
                    <td className="small">{s.contact || '—'}</td>
                    <td className="small text-muted">{s.email || '—'}</td>
                    <td>
                      <Button
                        variant="outline-danger" size="sm"
                        onClick={() => removeStaff(s.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Staff Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Add Staff Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Dr. Firstname Lastname"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                >
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Department</Form.Label>
                <Form.Select
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  placeholder="9876543210"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="staff@hospital.com"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={addStaff}>Add Staff</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HospitalStaff;
