import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, Table
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaTint, FaExclamationTriangle, FaPrint } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const COMPATIBILITY = {
  'A+': { canReceiveFrom: ['A+', 'A-', 'O+', 'O-'], canDonateTo: ['A+', 'AB+'] },
  'A-': { canReceiveFrom: ['A-', 'O-'], canDonateTo: ['A+', 'A-', 'AB+', 'AB-'] },
  'B+': { canReceiveFrom: ['B+', 'B-', 'O+', 'O-'], canDonateTo: ['B+', 'AB+'] },
  'B-': { canReceiveFrom: ['B-', 'O-'], canDonateTo: ['B+', 'B-', 'AB+', 'AB-'] },
  'AB+': { canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canDonateTo: ['AB+'] },
  'AB-': { canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'], canDonateTo: ['AB+', 'AB-'] },
  'O+': { canReceiveFrom: ['O+', 'O-'], canDonateTo: ['A+', 'B+', 'AB+', 'O+'] },
  'O-': { canReceiveFrom: ['O-'], canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
};

const HospitalBloodBank = () => {
  const { user } = useSelector((state) => state.auth);
  const hospitalId = user?.hospitalId || user?.id || user?._id;

  const [bloodData, setBloodData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ bloodGroup: 'A+', units: '', operation: 'Add' });
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const fetchBlood = async () => {
    try {
      const res = await api.get(`/hospitals/${hospitalId}/blood-availability`);
      setBloodData(res.data?.bloodAvailability || res.data || {});
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) fetchBlood();
    else setLoading(false);

    // Load mock transactions from localStorage
    const stored = JSON.parse(localStorage.getItem(`bloodTransactions_${hospitalId}`) || '[]');
    setTransactions(stored);
  }, [hospitalId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = async () => {
    if (!form.units || isNaN(form.units) || Number(form.units) < 0) {
      toast.error('Enter valid units');
      return;
    }
    setSaving(true);
    try {
      const currentUnits = Number(bloodData[form.bloodGroup] || 0);
      const newUnits =
        form.operation === 'Add'
          ? currentUnits + Number(form.units)
          : Number(form.units);

      await api.put(`/hospitals/${hospitalId}/blood-availability`, {
        bloodGroup: form.bloodGroup,
        units: newUnits,
      });

      const tx = {
        id: Date.now(),
        bloodGroup: form.bloodGroup,
        units: form.units,
        operation: form.operation,
        date: new Date().toISOString(),
        by: user?.name || 'Staff',
      };
      const stored = JSON.parse(localStorage.getItem(`bloodTransactions_${hospitalId}`) || '[]');
      const updated = [tx, ...stored].slice(0, 50);
      localStorage.setItem(`bloodTransactions_${hospitalId}`, JSON.stringify(updated));
      setTransactions(updated);

      setBloodData((prev) => ({ ...prev, [form.bloodGroup]: newUnits }));
      toast.success('Blood stock updated!');
      setShowModal(false);
      setForm({ bloodGroup: 'A+', units: '', operation: 'Add' });
    } catch {
      toast.error('Failed to update blood stock');
    } finally {
      setSaving(false);
    }
  };

  const chartData = BLOOD_GROUPS.map((bg) => ({
    name: bg,
    units: Number(bloodData[bg] || 0),
  }));

  const getColor = (units) => {
    if (units < 5) return '#dc3545';
    if (units < 15) return '#fd7e14';
    return '#198754';
  };

  const alerts = BLOOD_GROUPS.filter((bg) => Number(bloodData[bg] || 0) < 5);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"><FaTint className="text-danger me-2" />Blood Bank Management</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => window.print()}>
            <FaPrint className="me-1" />Export Report
          </Button>
          <Button variant="danger" onClick={() => setShowModal(true)}>
            + Update Stock
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert variant="danger" className="mb-4 d-flex align-items-center gap-2">
          <FaExclamationTriangle />
          <span>
            <strong>Low Stock Alert!</strong> Blood groups with critical levels:{' '}
            {alerts.map((bg) => (
              <Badge key={bg} bg="danger" className="me-1">{bg}</Badge>
            ))}
          </span>
        </Alert>
      )}

      {/* Blood Group Cards */}
      <Row className="g-3 mb-4">
        {BLOOD_GROUPS.map((bg) => {
          const units = Number(bloodData[bg] || 0);
          const color = getColor(units);
          const level = units < 5 ? 'Critical' : units < 15 ? 'Low' : 'Good';
          return (
            <Col key={bg} xs={6} sm={4} md={3}>
              <Card
                className="h-100 shadow-sm text-center"
                style={{ borderTop: `4px solid ${color}`, cursor: 'pointer' }}
                onClick={() => setSelectedGroup(selectedGroup === bg ? null : bg)}
              >
                <Card.Body>
                  <div className="fw-bold fs-2 text-danger">{bg}</div>
                  <div className="display-6 fw-bold" style={{ color }}>{loading ? '…' : units}</div>
                  <div className="small text-muted">units</div>
                  <Badge style={{ background: color }} className="mt-1">{level}</Badge>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Compatibility Info */}
      {selectedGroup && (
        <Card className="shadow-sm mb-4 border-danger">
          <Card.Header className="bg-danger text-white fw-bold">
            Blood Type {selectedGroup} — Compatibility
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <strong>Can receive from:</strong>
                <div className="mt-1 d-flex flex-wrap gap-1">
                  {COMPATIBILITY[selectedGroup]?.canReceiveFrom.map((bg) => (
                    <Badge key={bg} bg="success">{bg}</Badge>
                  ))}
                </div>
              </Col>
              <Col md={6}>
                <strong>Can donate to:</strong>
                <div className="mt-1 d-flex flex-wrap gap-1">
                  {COMPATIBILITY[selectedGroup]?.canDonateTo.map((bg) => (
                    <Badge key={bg} bg="primary">{bg}</Badge>
                  ))}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Chart */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="fw-bold">Blood Group Availability Chart</Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="units" name="Units Available">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.units)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Transaction History */}
      <Card className="shadow-sm">
        <Card.Header className="fw-bold">Transaction History</Card.Header>
        <Card.Body className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-4 text-muted">No transactions yet</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Operation</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="small text-muted">{new Date(tx.date).toLocaleString()}</td>
                    <td><Badge bg="danger">{tx.bloodGroup}</Badge></td>
                    <td>{tx.units}</td>
                    <td>
                      <Badge bg={tx.operation === 'Add' ? 'success' : 'info'}>{tx.operation}</Badge>
                    </td>
                    <td className="small">{tx.by}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Update Blood Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Blood Group</Form.Label>
            <Form.Select
              value={form.bloodGroup}
              onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}
            >
              {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Units</Form.Label>
            <Form.Control
              type="number" min="0"
              value={form.units}
              onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))}
              placeholder="Enter units"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Operation</Form.Label>
            <div className="d-flex gap-3">
              {['Add', 'Set'].map((op) => (
                <Form.Check
                  key={op} type="radio" id={`op-${op}`} label={op}
                  checked={form.operation === op}
                  onChange={() => setForm((f) => ({ ...f, operation: op }))}
                />
              ))}
            </div>
            <Form.Text className="text-muted">
              Add: adds to current stock. Set: sets exact value.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleUpdate} disabled={saving}>
            {saving ? 'Saving...' : 'Update'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HospitalBloodBank;
