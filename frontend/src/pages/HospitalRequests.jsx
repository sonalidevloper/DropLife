import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Card, Badge, Button, Table, Form, Modal, Row, Col, InputGroup
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaTint, FaPlus, FaSearch, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['All', 'Open', 'In Progress', 'Fulfilled', 'Cancelled'];

const statusColor = (s) => ({
  Open: 'primary',
  'In Progress': 'info',
  Fulfilled: 'success',
  Cancelled: 'secondary'
}[s] || 'secondary');

const HospitalRequests = () => {
  const { user } = useSelector((state) => state.auth);
  const hospitalId = user?.hospitalId || user?._id;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [showDonorsModal, setShowDonorsModal] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donors, setDonors] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    bloodGroup: 'A+',
    units: '',
    urgency: 'Normal',
    notes: '',
    patientName: ''
  });

  // 🔹 Fetch requests
  const fetchRequests = async () => {
    try {
      const res = await api.get(`/hospitals/${hospitalId}/requests`);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.requests || [];

      setRequests(data);
    } catch {
      setRequests([]);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) fetchRequests();
  }, [hospitalId]);

  // 🔹 Optimized filtering (useMemo)
  const filtered = useMemo(() => {
    let data = [...requests];

    if (activeTab !== 'All') {
      data = data.filter(r => r.status === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        `${r.bloodGroup} ${r.patientName}`
          .toLowerCase()
          .includes(q)
      );
    }

    return data;
  }, [requests, activeTab, search]);

  // 🔹 Create request
  const submitRequest = async () => {
    if (!form.units || isNaN(form.units)) {
      toast.error('Enter valid units');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/hospitals/${hospitalId}/blood-request`, form);

      toast.success('Request created');
      setShowModal(false);

      setForm({
        bloodGroup: 'A+',
        units: '',
        urgency: 'Normal',
        notes: '',
        patientName: ''
      });

      fetchRequests();
    } catch {
      toast.error('Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 View donors
  const viewDonors = async (request) => {
    setSelectedRequest(request);
    setDonors([]);
    setShowDonorsModal(true);

    try {
      const res = await api.get(`/blood-request/${request._id}/donors`);
      setDonors(res.data?.donors || res.data || []);
    } catch {
      toast.error('Failed to fetch donors');
      setDonors([]);
    }
  };

  return (
    <Container className="py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h2><FaTint className="text-danger" /> Blood Requests</h2>

        <Button onClick={() => setShowModal(true)}>
          <FaPlus /> New
        </Button>
      </div>

      {/* FILTER TABS */}
      <div className="mb-3">
        {STATUSES.map(s => (
          <Button
            key={s}
            size="sm"
            variant={activeTab === s ? 'danger' : 'outline-secondary'}
            onClick={() => setActiveTab(s)}
            className="me-2"
          >
            {s}
          </Button>
        ))}
      </div>

      {/* SEARCH */}
      <InputGroup className="mb-3">
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* TABLE */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-4">No data</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Blood</th>
                  <th>Units</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(r => (
                  <tr key={r._id}>
                    <td><Badge bg="danger">{r.bloodGroup}</Badge></td>
                    <td>{r.units}</td>
                    <td>{r.patientName}</td>
                    <td><Badge bg={statusColor(r.status)}>{r.status}</Badge></td>
                    <td>
                      <Button size="sm" onClick={() => viewDonors(r)}>
                        <FaUsers /> Donors
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* CREATE MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Body>
          <Form.Control
            placeholder="Patient Name"
            value={form.patientName}
            onChange={(e) =>
              setForm({ ...form, patientName: e.target.value })
            }
          />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={submitRequest} disabled={submitting}>
            {submitting ? 'Saving...' : 'Submit'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* DONORS MODAL */}
      <Modal show={showDonorsModal} onHide={() => setShowDonorsModal(false)}>
        <Modal.Body>
          {donors.length === 0 ? (
            <div>No donors</div>
          ) : (
            donors.map(d => (
              <div key={d._id}>{d.name}</div>
            ))
          )}
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default HospitalRequests;