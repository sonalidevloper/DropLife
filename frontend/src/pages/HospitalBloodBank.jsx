// ============================================================
// HospitalBloodBank.jsx  (remove unused Table, CartesianGrid, Legend)
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Modal, Form, Badge, ProgressBar
} from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { FaTint, FaPlus, FaMinus, FaExclamationTriangle } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DEMO_INV = BLOOD_GROUPS.map((bg, i) => ({
  bloodGroup: bg, units: [45,8,30,3,20,0,70,12][i], lastUpdated: new Date()
}));

const HospitalBloodBank = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [opType, setOpType] = useState('add');
  const [units, setUnits] = useState('');
  const [notes, setNotes] = useState('');

  const fetchInventory = useCallback(async () => {
    try {
      const res = await api.get('/hospitals/profile/me');
      setInventory(res.data.data?.bloodInventory || DEMO_INV);
    } catch { setInventory(DEMO_INV); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleUpdate = async () => {
    if (!units || Number(units) <= 0) { toast.error('Enter valid units'); return; }
    try {
      await api.put(`/hospitals/inventory/${selected}`, { units: Number(units), type: opType, notes });
      toast.success('Inventory updated');
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const getStatus = (u) => u === 0 ? { v: 'danger', l: 'Out of Stock' }
    : u < 10 ? { v: 'danger', l: 'Critical' }
    : u < 25 ? { v: 'warning', l: 'Low' }
    : { v: 'success', l: 'Sufficient' };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4"><FaTint className="me-2 text-danger" />Blood Bank Management</h2>

      {inventory.some(i => i.units < 10) && (
        <div className="alert alert-danger mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>Critical stock alert!</strong>{' '}
          {inventory.filter(i => i.units < 10).map(i =>
            <Badge key={i.bloodGroup} bg="danger" className="me-1">{i.bloodGroup}: {i.units}u</Badge>
          )}
        </div>
      )}

      <Row className="mb-4">
        {inventory.map((item) => {
          const s = getStatus(item.units);
          return (
            <Col md={3} key={item.bloodGroup} className="mb-3">
              <Card className="shadow-sm text-center border">
                <Card.Body>
                  <h4 className="text-danger fw-bold">{item.bloodGroup}</h4>
                  <h3>{item.units}</h3>
                  <small className="text-muted">units</small>
                  <ProgressBar variant={s.v} now={Math.min(item.units * 1.5, 100)} className="my-2" style={{ height: 6 }} />
                  <Badge bg={s.v} className="mb-3">{s.l}</Badge><br />
                  <Button size="sm" variant="success" className="me-1"
                    onClick={() => { setSelected(item.bloodGroup); setOpType('add'); setShowModal(true); }}>
                    <FaPlus />
                  </Button>
                  <Button size="sm" variant="danger"
                    onClick={() => { setSelected(item.bloodGroup); setOpType('remove'); setShowModal(true); }}
                    disabled={item.units === 0}>
                    <FaMinus />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card className="shadow">
        <Card.Header className="bg-danger text-white"><h5 className="mb-0">Inventory Chart</h5></Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={inventory.map(i => ({ name: i.bloodGroup, Units: i.units }))}>
              <XAxis dataKey="name" /><YAxis /><Tooltip />
              <Bar dataKey="Units" fill="#dc3545" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{opType === 'add' ? 'Add' : 'Remove'} Units — {selected}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Units</Form.Label>
            <Form.Control type="number" min="1" value={units} onChange={e => setUnits(e.target.value)} placeholder="Enter units" />
          </Form.Group>
          <Form.Group>
            <Form.Label>Notes (optional)</Form.Label>
            <Form.Control as="textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reference, donor ID..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant={opType === 'add' ? 'success' : 'danger'} onClick={handleUpdate}>
            {opType === 'add' ? 'Add Units' : 'Remove Units'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HospitalBloodBank;