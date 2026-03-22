import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table, Badge, Form
} from 'react-bootstrap';
import { FaHistory, FaTint } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const BLOOD_GROUP_COLORS = {
  'A+': 'danger',
  'A-': 'warning',
  'B+': 'primary',
  'B-': 'info',
  'AB+': 'success',
  'AB-': 'secondary',
  'O+': 'dark',
  'O-': 'danger'
};

const DonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [stats, setStats] = useState({
    total: 0,
    thisYear: 0,
    lifeSaved: 0,
    nextEligible: null
  });

  // 🔹 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/donor/history');

        const data = res.data.data || res.data;

        const records = Array.isArray(data) ? data : [];

        setHistory(records);

        const total = Array.isArray(data)
          ? records.length
          : (data?.donationCount || 0);

        const lastDate = Array.isArray(data)
          ? (records.length > 0
              ? new Date(records[0].date || records[0].createdAt)
              : null)
          : (data?.lastDonationDate
              ? new Date(data.lastDonationDate)
              : null);

        const thisYear = records.filter(d =>
          new Date(d.date || d.createdAt).getFullYear() === new Date().getFullYear()
        ).length;

        const nextEligible = lastDate
          ? new Date(lastDate.getTime() + 56 * 24 * 60 * 60 * 1000)
          : null;

        setStats({
          total,
          thisYear,
          lifeSaved: total * 3,
          nextEligible
        });

      } catch {
        toast.error('Failed to load donation history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Filtering
  const filtered = filter === 'all'
    ? history
    : history.filter(d =>
        (d.year || new Date(d.createdAt).getFullYear()).toString() === filter
      );

  const years = [
    ...new Set(
      history.map(d =>
        new Date(d.date || d.createdAt).getFullYear()
      )
    )
  ];

  return (
    <Container className="py-4">

      {/* HEADER */}
      <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <FaHistory className="text-danger" />
        Donation History
      </h3>

      {/* STATS */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Total Donations', value: stats.total, color: 'danger' },
          { label: 'This Year', value: stats.thisYear, color: 'primary' },
          { label: 'Lives Impacted', value: stats.lifeSaved, color: 'success' },
          {
            label: 'Next Eligible',
            value: stats.nextEligible
              ? new Date(stats.nextEligible).toLocaleDateString()
              : 'Now!',
            color: 'info'
          }
        ].map((s, i) => (
          <Col md={3} key={i}>
            <Card className={`border-start border-4 border-${s.color} shadow-sm text-center`}>
              <Card.Body>
                <div className={`fw-bold fs-3 text-${s.color}`}>
                  {loading ? '…' : s.value}
                </div>
                <small className="text-muted">{s.label}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* TABLE */}
      <Card className="shadow-sm border-0">

        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <span className="fw-bold d-flex align-items-center gap-2">
            <FaTint className="text-danger" />
            Donation Records
          </span>

          <Form.Select
            size="sm"
            style={{ width: '150px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Form.Select>
        </Card.Header>

        <Card.Body className="p-0">

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FaTint className="fs-1 mb-3" />
              <p>No donation records found.</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d._id || i}>
                    <td>{i + 1}</td>

                    <td>
                      {new Date(d.date || d.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <Badge bg={BLOOD_GROUP_COLORS[d.bloodGroup] || 'secondary'}>
                        {d.bloodGroup || '—'}
                      </Badge>
                    </td>

                    <td>{d.units || 1}</td>

                    <td>
                      {d.location || d.camp || 'Blood Bank'}
                    </td>

                    <td>
                      <Badge bg="success">Completed</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

        </Card.Body>
      </Card>

    </Container>
  );
};

export default DonationHistory;