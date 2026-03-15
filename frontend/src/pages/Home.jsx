import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTint, FaHandHoldingHeart, FaHospital, FaUsers, FaMapMarkedAlt, FaBell } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="hero-text">
              <h1 className="display-3 fw-bold text-white mb-4 animate-fade-in">
                Save Lives, <span className="text-warning">Donate Blood</span>
              </h1>
              <p className="lead text-white mb-4 animate-slide-up">
                Join DROPLIFE, the smart blood donation platform connecting donors with those in need. 
                Every donation can save up to 3 lives.
              </p>
              <div className="hero-buttons animate-slide-up">
                <Button as={Link} to="/signup" variant="danger" size="lg" className="me-3">
                  Register as Donor
                </Button>
                <Button as={Link} to="/blood-request" variant="outline-light" size="lg">
                  Request Blood
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500" 
                alt="Blood Donation" 
                className="img-fluid rounded hero-image animate-zoom-in"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <h2 className="text-center mb-5 fw-bold">Why Choose DROPLIFE?</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100 text-center p-4 border-0 shadow">
                <div className="feature-icon mb-3">
                  <FaMapMarkedAlt size={50} className="text-danger" />
                </div>
                <Card.Body>
                  <Card.Title className="fw-bold">Real-Time Location</Card.Title>
                  <Card.Text>
                    Find nearby donors instantly with our GPS-enabled matching system. 
                    Get help when you need it most.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100 text-center p-4 border-0 shadow">
                <div className="feature-icon mb-3">
                  <FaBell size={50} className="text-danger" />
                </div>
                <Card.Body>
                  <Card.Title className="fw-bold">Instant Notifications</Card.Title>
                  <Card.Text>
                    Receive real-time alerts for blood requests matching your profile. 
                    Respond quickly and save lives.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100 text-center p-4 border-0 shadow">
                <div className="feature-icon mb-3">
                  <FaHospital size={50} className="text-danger" />
                </div>
                <Card.Body>
                  <Card.Title className="fw-bold">Hospital Integration</Card.Title>
                  <Card.Text>
                    Seamlessly connected with hospitals and blood banks for verified requests 
                    and updated blood stock.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-danger text-white">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-4">
              <FaUsers size={50} className="mb-3" />
              <h2 className="fw-bold">10,000+</h2>
              <p>Registered Donors</p>
            </Col>
            <Col md={3} className="mb-4">
              <FaTint size={50} className="mb-3" />
              <h2 className="fw-bold">5,000+</h2>
              <p>Lives Saved</p>
            </Col>
            <Col md={3} className="mb-4">
              <FaHospital size={50} className="mb-3" />
              <h2 className="fw-bold">200+</h2>
              <p>Partner Hospitals</p>
            </Col>
            <Col md={3} className="mb-4">
              <FaHandHoldingHeart size={50} className="mb-3" />
              <h2 className="fw-bold">100+</h2>
              <p>Active Camps</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Blood Groups Section */}
      <section className="blood-groups-section py-5">
        <Container>
          <h2 className="text-center mb-5 fw-bold">Blood Group Compatibility</h2>
          <Row className="justify-content-center">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <Col key={bg} xs={6} md={3} lg={1.5} className="mb-3">
                <div className="blood-group-card text-center p-3 rounded shadow">
                  <FaTint size={30} className="text-danger mb-2" />
                  <h4 className="fw-bold">{bg}</h4>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 bg-light">
        <Container className="text-center">
          <h2 className="fw-bold mb-4">Ready to Make a Difference?</h2>
          <p className="lead mb-4">
            Join thousands of heroes who are saving lives every day. Register now and become a lifesaver!
          </p>
          <Button as={Link} to="/signup" variant="danger" size="lg" className="px-5">
            Register Now
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default Home;