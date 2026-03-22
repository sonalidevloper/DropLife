import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Card, Badge, Button, Table, Form, Modal, Row, Col
} from 'react-bootstrap';
import { FaUserMd, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const ROLES = ['Doctor', 'Nurse', 'Technician', 'Admin', 'Receptionist', 'Pharmacist'];

const HospitalStaff = () => {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const [form, setForm] = useState({
    name: '',
    role: 'Doctor',
    department: '',
    contact: '',
    email: ''
  });

  // 🔹 Fetch staff
  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaff(res.data);
    } catch {
      toast.error('Failed to load staff');
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // 🔹 Add staff
  const addStaff = async () => {
    if (!form.name.trim()) {
      toast.error('Name required');
      return;
    }

    try {
      await api.post('/staff', form);
      toast.success('Added');
      setShowModal(false);
      setForm({ name: '', role: 'Doctor', department: '', contact: '', email: '' });
      fetchStaff();
    } catch {
      toast.error('Failed');
    }
  };

  // 🔹 Delete staff
  const removeStaff = async (id) => {
    if (!window.confirm('Delete?')) return;

    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch {
      toast.error('Delete failed');
    }
  };

  // 🔹 Filter
  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.department?.toLowerCase().includes(search.toLowerCase());

      const matchRole = roleFilter === 'All' || s.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [staff, search, roleFilter]);

  return (
    <Container className="py-4">

      <div className="d-flex justify-content-between mb-3">
        <h2><FaUserMd className="text-danger" /> Staff</h2>

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
              <th>Role</th>
              <th>Department</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td><Badge bg="danger">{s.role}</Badge></td>
                <td>{s.department}</td>
                <td>
                  <Button size="sm" onClick={() => removeStaff(s._id)}>
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
          <Button onClick={addStaff}>Save</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default HospitalStaff;