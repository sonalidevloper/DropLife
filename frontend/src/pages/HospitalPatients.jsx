import React, { useState, useEffect } from 'react';
import {
  Container, Card, Badge, Button, Table, Form, Modal, Row, Col
} from 'react-bootstrap';
import { FaUserInjured, FaPlus, FaTint } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DEMO_PATIENTS = [
  { id: 1, name: 'Ramesh Kumar', bloodGroup: 'A+', ward: 'Cardiology', admissionDate: '2024-01-10', unitsGiven: 2 },
  { id: 2, name: 'Priya Sharma', bloodGroup: 'O-', ward: 'ICU', admissionDate: '2024-01-14', unitsGiven: 4 },
  { id: 3, name: 'Anita Patel', bloodGroup: 'B+', ward: 'Maternity', admissionDate: '2024-01-15', unitsGiven: 1 },
];

const STORAGE_KEY = 'hospitalPatients';

const HospitalPatients = () => {
  const { user } = useSelector((state) => state.auth);
  const storageKey = `${STORAGE_KEY}_${user?.id || 'demo'}`;

  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', bloodGroup: 'A+', ward: '', admissionDate: '', unitsGiven: 0
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    setPatients(stored || DEMO_PATIENTS);
  }, [storageKey]);

  const save = (updated) => {
    setPatients(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const addPatient = () => {
    if (!form.name.trim() || !form.ward.trim()) {
      toast.error('Name and ward are required');
      return;
    }
    const newPatient = { ...form, id: Date.now() };
    const updated = [newPatient, ...patients];
    save(updated);
    toast.success('Patient record added');
    setShowModal(false);
    setForm({ name: '', bloodGroup: 'A+', ward: '', admissionDate: '', unitsGiven: 0 });
  };

  const deletePatient = (id) => {
    if (!window.confirm('Remove this patient record?')) return;
    save(patients.filter((p) => p.id !== id));
    toast.success('Patient removed');
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ward.toLowerCase().includes(search.toLowerCase()) ||
      p.bloodGroup.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnits = patients.reduce((sum, p) => sum + (Number(p.unitsGiven) || 0), 0);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-0">
            <FaUserInjured className="text-danger me-2" />Patient Blood Records
          </h2>
          <small className="text-muted">
            Demo data stored locally. Connect to your Hospital Information System (HIS) for live data.
          </small>
        </div>
        <Button variant="danger" onClick={() => setShowModal(true)}>
          <FaPlus className="me-1" />Add Patient
        </Button>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Total Patients', value: patients.length, color: 'border-primary' },
          { label: 'Blood Units Dispensed', value: totalUnits, color: 'border-danger' },
          {
            label: 'Most Needed Group',
            value: (() => {
              const counts = {};
              patients.forEach((p) => { counts[p.bloodGroup] = (counts[p.bloodGroup] || 0) + 1; });
              return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
            })(),
            color: 'border-warning',
          },
        ].map((s, i) => (
          <Col key={i} xs={12} sm={4}>
            <Card className={`border-start border-4 ${s.color} shadow-sm`}>
              <Card.Body>
                <div className="fw-bold fs-4">{s.value}</div>
                <div className="text-muted small">{s.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Search */}
      <Form.Control
        placeholder="Search by name, ward, or blood group..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
        style={{ maxWidth: 400 }}
      />

      {/* Table */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-4 text-muted">No patients found</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Blood Group</th>
                  <th>Ward</th>
                  <th>Admission Date</th>
                  <th>Units Given</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, i) => (
                  <tr key={p.id}>
                    <td className="text-muted small">{i + 1}</td>
                    <td className="fw-semibold">{p.name}</td>
                    <td><Badge bg="danger">{p.bloodGroup}</Badge></td>
                    <td>{p.ward}</td>
                    <td className="small text-muted">
                      {p.admissionDate ? new Date(p.admissionDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <Badge bg="info">{p.unitsGiven} <FaTint style={{ fontSize: '0.7rem' }} /></Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-danger" size="sm"
                        onClick={() => deletePatient(p.id)}
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

      {/* Add Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Add Patient Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Patient Name *</Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Blood Group *</Form.Label>
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
                <Form.Label>Ward *</Form.Label>
                <Form.Control
                  value={form.ward}
                  onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}
                  placeholder="e.g. ICU, Cardiology"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Admission Date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.admissionDate}
                  onChange={(e) => setForm((f) => ({ ...f, admissionDate: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Blood Units Given</Form.Label>
                <Form.Control
                  type="number" min="0"
                  value={form.unitsGiven}
                  onChange={(e) => setForm((f) => ({ ...f, unitsGiven: e.target.value }))}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={addPatient}>Add Patient</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HospitalPatients;
