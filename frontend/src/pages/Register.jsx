import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUserMd, FaHospital, FaTint } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={10}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <h2 className="text-center fw-bold mb-4">Choose Registration Type</h2>
                <p className="text-center text-muted mb-5">Select how you want to join DROPLIFE</p>
                
                <Row>
                  <Col md={4} className="mb-3">
                    <Card 
                      className="text-center p-4 h-100 border-danger cursor-pointer hover-card"
                      onClick={() => navigate('/signup')}
                      style={{ cursor: 'pointer' }}
                    >
                      <FaTint size={60} className="text-danger mb-3 mx-auto" />
                      <h4>Blood Donor</h4>
                      <p className="text-muted">Register to donate blood and save lives</p>
                      <Button variant="danger">Register as Donor</Button>
                    </Card>
                  </Col>
                  
                  <Col md={4} className="mb-3">
                    <Card 
                      className="text-center p-4 h-100 border-primary cursor-pointer hover-card"
                      onClick={() => navigate('/hospital/signup')}
                      style={{ cursor: 'pointer' }}
                    >
                      <FaHospital size={60} className="text-primary mb-3 mx-auto" />
                      <h4>Hospital</h4>
                      <p className="text-muted">Register your hospital to manage blood inventory</p>
                      <Button variant="primary">Register Hospital</Button>
                    </Card>
                  </Col>
                  
                  <Col md={4} className="mb-3">
                    <Card 
                      className="text-center p-4 h-100 border-success cursor-pointer hover-card"
                      onClick={() => navigate('/login')}
                      style={{ cursor: 'pointer' }}
                    >
                      <FaUserMd size={60} className="text-success mb-3 mx-auto" />
                      <h4>Request Blood</h4>
                      <p className="text-muted">Create an account to request blood</p>
                      <Button variant="success">Get Started</Button>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;