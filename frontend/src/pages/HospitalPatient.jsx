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
];

const HospitalPatients = () => {
  const { user } = useSelector((state) => state.auth);

  const STORAGE_KEY = `patients_${user?._id || 'demo'}`;

  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    bloodGroup: 'A+',
    ward: '',
    admissionDate: '',
    unitsGiven: 0
  });

  // 🔹 Load safely
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      setPatients(stored || DEMO_PATIENTS);
    } catch {
      setPatients(DEMO_PATIENTS);
    }
  }, [STORAGE_KEY]);

  const save = (data) => {
    setPatients(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const addPatient = () => {
    if (!form.name.trim() || !form.ward.trim()) {
      toast.error('Name and ward required');
      return;
    }

    const newPatient = { ...form, id: Date.now() };

    save([newPatient, ...patients]);

    setShowModal(false);
    setForm({ name: '', bloodGroup: 'A+', ward: '', admissionDate: '', unitsGiven: 0 });

    toast.success('Added');
  };

  const remove = (id) => {
    if (!window.confirm('Delete?')) return;
    save(patients.filter(p => p.id !== id));
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container className="py-4">

      <div className="d-flex justify-content-between mb-3">
        <h3><FaUserInjured /> Patients</h3>

        <Button onClick={() => setShowModal(true)}>
          <FaPlus /> Add
        </Button>
      </div>

      <Form.Control
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Blood</th>
              <th>Units</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td><Badge bg="danger">{p.bloodGroup}</Badge></td>
                <td>{p.unitsGiven}</td>
                <td>
                  <Button size="sm" onClick={() => remove(p.id)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Body>
          <Form.Control
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={addPatient}>Add</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default HospitalPatients;