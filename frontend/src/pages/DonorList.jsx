import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaCheckCircle, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');

  useEffect(() => {
    fetchDonors();
  }, [filterBloodGroup]);

  const fetchDonors = async () => {
    try {
      const url = filterBloodGroup
        ? `/admin/donors?bloodGroup=${filterBloodGroup}`
        : '/admin/donors';
      const response = await api.get(url);
      setDonors(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch donors');
      setLoading(false);
    }
  };

  const handleVerify = async (donorId) => {
    try {
      await api.put(`/admin/donors/${donorId}/verify`);
      toast.success('Donor verified successfully');
      fetchDonors();
    } catch (error) {
      toast.error('Failed to verify donor');
    }
  };

  const handleDelete = async (donorId) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      try {
        await api.delete(`/admin/donors/${donorId}`);
        toast.success('Donor deleted successfully');
        fetchDonors();
      } catch (error) {
        toast.error('Failed to delete donor');
      }
    }
  };

  const filteredDonors = donors.filter(
    (donor) =>
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={12} className="mb-4">
          <h2 className="fw-bold">Donor Management</h2>
          <p className="text-muted">Manage registered blood donors</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select value={filterBloodGroup} onChange={(e) => setFilterBloodGroup(e.target.value)}>
            <option value="">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Badge bg="primary" className="p-3 w-100">
            Total Donors: {filteredDonors.length}
          </Badge>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="shadow">
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Blood Group</th>
                    <th>Location</th>
                    <th>Donations</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.map((donor) => (
                    <tr key={donor._id}>
                      <td>{donor.name}</td>
                      <td>{donor.email}</td>
                      <td>{donor.phone}</td>
                      <td>
                        <Badge bg="danger">{donor.bloodGroup}</Badge>
                      </td>
                      <td>
                        {donor.address?.city}, {donor.address?.state}
                      </td>
                      <td>{donor.donationCount}</td>
                      <td>
                        {donor.isVerified ? (
                          <Badge bg="success">Verified</Badge>
                        ) : (
                          <Badge bg="warning">Unverified</Badge>
                        )}
                        {donor.isAvailable ? (
                          <Badge bg="success" className="ms-1">
                            Available
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="ms-1">
                            Unavailable
                          </Badge>
                        )}
                      </td>
                      <td>
                        {!donor.isVerified && (
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleVerify(donor._id)}
                          >
                            <FaCheckCircle /> Verify
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(donor._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DonorList;