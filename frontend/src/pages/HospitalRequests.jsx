import React, { useState, useEffect } from 'react';
import {
  Container, Card, Badge, Button, Table, Form, Modal, Row, Col, InputGroup
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaTint, FaPlus, FaSearch, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['All', 'Open', 'In Progress', 'Fulfilled', 'Cancelled'];

const statusColor = (s) => {
  const map = { Open: 'primary', 'In Progress': 'info', Fulfilled: 'success', Cancelled: 'secondary' };
  return map[s] || 'secondary';
};

const HospitalRequests = () => {
  const { user } = useSelector((state) => state.auth);
  const hospitalId = user?.hospitalId || user?.id || user?._id;

  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDonorsModal, setShowDonorsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donors, setDonors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    bloodGroup: 'A+', units: '', urgency: 'Normal', notes: '', patientName: ''
  });

  const fetchRequests = async () => {
    try {
      const res = await api.get(`/hospitals/${hospitalId}/requests`);
      const data = Array.isArray(res.data) ? res.data : res.data.requests || [];
      setRequests(data);
      setFiltered(data);
    } catch {
      setRequests([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) fetchRequests();
    else setLoading(false);
  }, [hospitalId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let data = requests;
    if (activeTab !== 'All') data = data.filter((r) => r.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          (r.bloodGroup || '').toLowerCase().includes(q) ||
          (r.patientName || '').toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [activeTab, search, requests]);

  const submitRequest = async () => {
    if (!form.units || isNaN(form.units)) {
      toast.error('Enter valid units');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/hospitals/${hospitalId}/blood-request`, form);
      toast.success('Blood request created!');
      setShowModal(false);
      setForm({ bloodGroup: 'A+', units: '', urgency: 'Normal', notes: '', patientName: '' });
      fetchRequests();
    } catch {
      toast.error('Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const viewDonors = async (request) => {
    setSelectedRequest(request);
    setDonors([]);
    setShowDonorsModal(true);
    try {
      const res = await api.get(`/blood-request/${request._id}/donors`);
      setDonors(Array.isArray(res.data) ? res.data : res.data.donors || []);
    } catch {
      setDonors([]);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"><FaTint className="text-danger me-2" />Blood Requests</h2>
        <Button variant="danger" onClick={() => setShowModal(true)}>
          <FaPlus className="me-1" />New Request
        </Button>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {STATUSES.map((s) => (
          <Button
            key={s}
            variant={activeTab === s ? 'danger' : 'outline-secondary'}
            size="sm"
            onClick={() => setActiveTab(s)}
          >
            {s}
            {s !== 'All' && (
              <Badge bg="light" text="dark" className="ms-1">
                {requests.filter((r) => r.status === s).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Search */}
      <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          placeholder="Search by blood group or patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* Table */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4 text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-4 text-muted">No requests found</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Patient</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id}>
                    <td><Badge bg="danger">{r.bloodGroup}</Badge></td>
                    <td>{r.units}</td>
                    <td className="small">{r.patientName || '—'}</td>
                    <td>
                      <Badge bg={r.urgency === 'Critical' ? 'danger' : r.urgency === 'Urgent' ? 'warning' : 'success'}>
                        {r.urgency}
                      </Badge>
                    </td>
                    <td><Badge bg={statusColor(r.status)}>{r.status}</Badge></td>
                    <td className="small text-muted">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary" size="sm"
                        onClick={() => viewDonors(r)}
                      >
                        <FaUsers className="me-1" />Donors
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create Request Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>New Blood Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Blood Group</Form.Label>
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
                <Form.Label>Units Required</Form.Label>
                <Form.Control
                  type="number" min="1"
                  value={form.units}
                  onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Urgency</Form.Label>
                <Form.Select
                  value={form.urgency}
                  onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value }))}
                >
                  {['Normal', 'Urgent', 'Critical'].map((u) => <option key={u}>{u}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Patient Name (optional)</Form.Label>
                <Form.Control
                  value={form.patientName}
                  onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea" rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={submitRequest} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Donors Modal */}
      <Modal show={showDonorsModal} onHide={() => setShowDonorsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Matched Donors — <Badge bg="danger">{selectedRequest?.bloodGroup}</Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {donors.length === 0 ? (
            <div className="text-center py-3 text-muted">No matched donors found</div>
          ) : (
            <Table hover responsive size="sm">
              <thead>
                <tr><th>Name</th><th>Blood Group</th><th>Phone</th><th>City</th></tr>
              </thead>
              <tbody>
                {donors.map((d) => (
                  <tr key={d._id}>
                    <td>{d.name}</td>
                    <td><Badge bg="danger">{d.bloodGroup}</Badge></td>
                    <td>{d.phone}</td>
                    <td>{d.city || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDonorsModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HospitalRequests;
