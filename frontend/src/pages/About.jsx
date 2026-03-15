import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaHeart, FaBullseye, FaEye, FaHandshake } from 'react-icons/fa';
import './InfoPages.css';

const About = () => {
  return (
    <div className="info-page">
      <div className="info-hero bg-danger text-white py-5">
        <Container>
          <h1 className="display-4 fw-bold text-center">About DR🩸PLIFE</h1>
          <p className="lead text-center">Connecting Lives, One Drop at a Time</p>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="mb-5">
          <Col md={12}>
            <h2 className="fw-bold mb-4">Our Story</h2>
            <p className="lead">
              DROPLIFE was born from a simple yet powerful idea: What if finding blood donors
              could be as easy as ordering food online? In emergency situations, every second
              counts, and the traditional methods of finding blood donors through phone calls
              and social media posts are often too slow and inefficient.
            </p>
            <p>
              We created DROPLIFE as a smart, real-time blood donation system that connects
              donors, recipients, and healthcare facilities seamlessly. Using cutting-edge
              technology including GPS-based donor matching, instant notifications, and AI-powered
              optimization, we're making blood donation faster, easier, and more efficient than
              ever before.
            </p>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col md={6} className="mb-4">
            <Card className="info-card h-100 shadow text-center p-4">
              <FaBullseye size={60} className="text-danger mb-3" />
              <h3 className="fw-bold">Our Mission</h3>
              <p>
                To eliminate the gap between blood donors and recipients by providing a
                technology-driven platform that makes blood donation accessible, transparent,
                and efficient for everyone.
              </p>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="info-card h-100 shadow text-center p-4">
              <FaEye size={60} className="text-danger mb-3" />
              <h3 className="fw-bold">Our Vision</h3>
              <p>
                A world where no life is lost due to blood shortage. We envision a future where
                every person in need of blood receives it within minutes, not hours or days.
              </p>
            </Card>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col md={12}>
            <h2 className="fw-bold mb-4">Our Core Values</h2>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="value-card shadow h-100">
              <Card.Body>
                <FaHeart size={40} className="text-danger mb-3" />
                <h4 className="fw-bold">Compassion</h4>
                <p>
                  Every donation is an act of love. We treat every donor and recipient with
                  dignity, respect, and care.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="value-card shadow h-100">
              <Card.Body>
                <FaBullseye size={40} className="text-danger mb-3" />
                <h4 className="fw-bold">Reliability</h4>
                <p>
                  We ensure our platform is always available, accurate, and trustworthy when
                  lives depend on it.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="value-card shadow h-100">
              <Card.Body>
                <FaHandshake size={40} className="text-danger mb-3" />
                <h4 className="fw-bold">Transparency</h4>
                <p>
                  We maintain complete transparency in our operations, ensuring donors and
                  recipients have full information.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card className="bg-light p-5">
              <h2 className="fw-bold mb-4 text-center">How We Work</h2>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <div className="step-number">1</div>
                  <h5>Register</h5>
                  <p>Donors sign up with their blood type and location</p>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="step-number">2</div>
                  <h5>Request</h5>
                  <p>Recipients create urgent blood requests</p>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="step-number">3</div>
                  <h5>Match</h5>
                  <p>Our AI finds nearby compatible donors instantly</p>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="step-number">4</div>
                  <h5>Save Lives</h5>
                  <p>Donors respond and help save lives</p>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;