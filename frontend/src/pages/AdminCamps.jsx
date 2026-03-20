import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaCalendarAlt, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const AdminCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', date: '', location: '', organizer: '', capacity: '', description: '' });

  useEffect(() => {
    api.get('/camps').then(res => {
      setCamps(res.data.data || res.data || []);
    }).catch(() => toast.error('Failed to load camps')).finally(() => setLoading(false));
  }, []);

  const handleOpen = (camp = null) => {
    if (camp) {
      setEditing(camp._id);
      setForm({ name: camp.name, date: camp.date?.substring(0, 10) || '', location: camp.location || '', organizer: camp.organizer || '', capacity: camp.capacity || '', description: camp.description || '' });
    } else {
      setEditing(null);
      setForm({ name: '', date: '', location: '', organizer: '', capacity: '', description: '' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        const res = await api.put(`/camps/${editing}`, form);
        setCamps(prev => prev.map(c => c._id === editing ? (res.data.data || res.data) : c));
        toast.success('Camp updated');
      } else {
        const res = await api.post('/camps', form);
        setCamps(prev => [...prev, res.data.data || res.data]);
        toast.success('Camp created');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this camp?')) return;
    try {
      await api.delete(`/camps/${id}`);
      setCamps(prev => prev.filter(c => c._id !== id));
      toast.success('Camp deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="fw-bold d-flex align-items-center gap-2"><FaCalendarAlt className="text-primary" /> Donation Camps Management</h3>
        <Button variant="primary" size="sm" onClick={() => handleOpen()} className="d-flex align-items-center gap-2"><FaPlus /> Add Camp</Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr><th>#</th><th>Camp Name</th><th>Date</th><th>Location</th><th>Organizer</th><th>Capacity</th><th>Registrations</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {camps.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-4 text-muted">No camps found</td></tr>
                ) : camps.map((c, i) => (
                  <tr key={c._id}>
                    <td>{i + 1}</td>
                    <td className="fw-semibold">{c.name}</td>
                    <td>{c.date ? new Date(c.date).toLocaleDateString() : '—'}</td>
                    <td>{c.location || '—'}</td>
                    <td>{c.organizer || '—'}</td>
                    <td>{c.capacity || '—'}</td>
                    <td>{c.registrations?.length || 0}</td>
                    <td><Badge bg={new Date(c.date) >= new Date() ? 'success' : 'secondary'}>{new Date(c.date) >= new Date() ? 'Upcoming' : 'Past'}</Badge></td>
                    <td>
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => handleOpen(c)}><FaEdit /></Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(c._id)}><FaTrash /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? 'Edit Camp' : 'Add New Camp'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            {[['name', 'Camp Name', 'text'], ['date', 'Date', 'date'], ['location', 'Location', 'text'], ['organizer', 'Organizer', 'text'], ['capacity', 'Capacity', 'number']].map(([k, l, t]) => (
              <Col md={k === 'description' ? 12 : 6} key={k}>
                <Form.Group>
                  <Form.Label>{l}</Form.Label>
                  <Form.Control type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
                </Form.Group>
              </Col>
            ))}
            <Col md={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminCamps;
