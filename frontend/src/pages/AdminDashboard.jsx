import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { FaUsers, FaTint, FaHospital, FaCampground, FaChartLine } from 'react-icons/fa';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-page">
      <Container className="py-5">
        <Row>
          <Col md={12} className="mb-4">
            <h2 className="fw-bold">Admin Dashboard</h2>
            <p className="text-muted">Manage blood donation system</p>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="stat-card bg-primary text-white shadow">
              <Card.Body className="text-center">
                <FaUsers size={40} className="mb-3" />
                <h3>{stats?.overview?.totalDonors}</h3>
                <p className="mb-0">Total Donors</p>
                <small>{stats?.overview?.availableDonors} Available</small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="stat-card bg-danger text-white shadow">
              <Card.Body className="text-center">
                <FaTint size={40} className="mb-3" />
                <h3>{stats?.overview?.totalRequests}</h3>
                <p className="mb-0">Blood Requests</p>
                <small>{stats?.overview?.pendingRequests} Pending</small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="stat-card bg-success text-white shadow">
              <Card.Body className="text-center">
                <FaHospital size={40} className="mb-3" />
                <h3>{stats?.overview?.fulfilledRequests}</h3>
                <p className="mb-0">Fulfilled</p>
                <small>Blood Requests</small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="stat-card bg-warning text-white shadow">
              <Card.Body className="text-center">
                <FaCampground size={40} className="mb-3" />
                <h3>{stats?.overview?.totalCamps}</h3>
                <p className="mb-0">Donation Camps</p>
                <small>{stats?.overview?.upcomingCamps} Upcoming</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Blood Group Distribution */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">
                  <FaChartLine className="me-2" />
                  Blood Group Distribution
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {stats?.bloodGroupStats?.map((bg) => (
                    <Col md={3} key={bg._id} className="mb-3">
                      <Card className="text-center">
                        <Card.Body>
                          <h3 className="text-danger">{bg._id}</h3>
                          <h4>{bg.count}</h4>
                          <p className="mb-0 text-muted">Donors</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Donations */}
        <Row>
          <Col md={12}>
            <Card className="shadow">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">Recent Donations</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Donor Name</th>
                      <th>Blood Group</th>
                      <th>Last Donation</th>
                      <th>Total Donations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentDonations?.map((donation) => (
                      <tr key={donation._id}>
                        <td>{donation.name}</td>
                        <td>
                          <Badge bg="danger">{donation.bloodGroup}</Badge>
                        </td>
                        <td>{new Date(donation.lastDonationDate).toLocaleDateString()}</td>
                        <td>{donation.donationCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Links */}
        <Row className="mt-4">
          <Col md={6} className="mb-3">
            <Card className="shadow text-center p-4">
              <h5>Manage Donors</h5>
              <p className="text-muted">View and manage registered donors</p>
              <Link to="/admin/donors" className="btn btn-danger">
                View Donor List
              </Link>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="shadow text-center p-4">
              <h5>Blood Stock Management</h5>
              <p className="text-muted">Update and monitor blood inventory</p>
              <Link to="/admin/blood-stock" className="btn btn-danger">
                Manage Stock
              </Link>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;