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

const HospitalBloodBank = () => {
  const { user } = useSelector((state) => state.auth);
  const hospitalId = user?.hospitalId || user?._id;

  const [bloodData, setBloodData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    bloodGroup: 'A+',
    units: '',
    operation: 'Add'
  });

  // 🔹 Fetch
  useEffect(() => {
    if (!hospitalId) return setLoading(false);

    api.get(`/hospitals/${hospitalId}/blood-availability`)
      .then(res => setBloodData(res.data?.bloodAvailability || res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hospitalId]);

  // 🔹 Update
  const handleUpdate = async () => {
    if (!form.units || isNaN(form.units)) {
      toast.error('Enter valid units');
      return;
    }

    setSaving(true);

    try {
      const current = Number(bloodData[form.bloodGroup] || 0);
      const newUnits =
        form.operation === 'Add'
          ? current + Number(form.units)
          : Number(form.units);

      await api.put(`/hospitals/${hospitalId}/blood-availability`, {
        bloodGroup: form.bloodGroup,
        units: newUnits
      });

      setBloodData(prev => ({
        ...prev,
        [form.bloodGroup]: newUnits
      }));

      toast.success('Stock updated');
      setShowModal(false);
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const getColor = (u) =>
    u < 5 ? '#dc3545' : u < 15 ? '#fd7e14' : '#198754';

  const alerts = BLOOD_GROUPS.filter(bg => Number(bloodData[bg] || 0) < 5);

  const chartData = BLOOD_GROUPS.map(bg => ({
    name: bg,
    units: Number(bloodData[bg] || 0)
  }));

  return (
    <Container className="py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h3 className="fw-bold">
          <FaTint className="text-danger me-2" />
          Blood Bank
        </h3>

        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => window.print()}>
            <FaPrint /> Export
          </Button>

          <Button variant="danger" onClick={() => setShowModal(true)}>
            + Update
          </Button>
        </div>
      </div>

      {/* ALERT */}
      {alerts.length > 0 && (
        <Alert variant="danger">
          <FaExclamationTriangle className="me-2" />
          Low stock: {alerts.join(', ')}
        </Alert>
      )}

      {/* CARDS */}
      <Row className="g-3 mb-4">
        {BLOOD_GROUPS.map(bg => {
          const units = Number(bloodData[bg] || 0);

          return (
            <Col key={bg} md={3}>
              <Card className="text-center shadow-sm">
                <Card.Body>
                  <h4 className="text-danger">{bg}</h4>
                  <h3 style={{ color: getColor(units) }}>
                    {loading ? '…' : units}
                  </h3>
                  <Badge bg="secondary">units</Badge>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* CHART */}
      <Card className="shadow-sm">
        <Card.Body>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="units">
                {chartData.map((d, i) => (
                  <Cell key={i} fill={getColor(d.units)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Stock</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Select
            value={form.bloodGroup}
            onChange={(e) =>
              setForm({ ...form, bloodGroup: e.target.value })
            }
          >
            {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
          </Form.Select>

          <Form.Control
            type="number"
            className="mt-3"
            placeholder="Units"
            value={form.units}
            onChange={(e) =>
              setForm({ ...form, units: e.target.value })
            }
          />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleUpdate} disabled={saving}>
            {saving ? 'Saving...' : 'Update'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default HospitalBloodBank;