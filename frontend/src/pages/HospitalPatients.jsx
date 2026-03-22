import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEye } from 'react-icons/fa';

const HospitalPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients] = useState([
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      bloodGroup: 'O+',
      ward: 'General',
      admitted: '2024-03-20',
      status: 'Stable'
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 32,
      bloodGroup: 'A+',
      ward: 'ICU',
      admitted: '2024-03-22',
      status: 'Critical'
    }
  ]);

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Patient Management</h2>
        </Col>
        <Col className="text-end">
          <Button variant="danger">
            <FaPlus className="me-2" />
            Add Patient
          </Button>
        </Col>
      </Row>

      <Card className="shadow">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Age</th>
                <th>Blood Group</th>
                <th>Ward</th>
                <th>Admitted Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td><Badge bg="danger">{patient.bloodGroup}</Badge></td>
                  <td>{patient.ward}</td>
                  <td>{patient.admitted}</td>
                  <td>
                    <Badge bg={patient.status === 'Critical' ? 'danger' : 'success'}>
                      {patient.status}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="info" size="sm">
                      <FaEye />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HospitalPatients;