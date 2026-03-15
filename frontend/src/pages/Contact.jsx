import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './InfoPages.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to backend
    toast.success('Message sent! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="info-page">
      <div className="info-hero bg-danger text-white py-5">
        <Container>
          <h1 className="display-4 fw-bold text-center">Contact Us</h1>
          <p className="lead text-center">We're here to help. Reach out anytime!</p>
        </Container>
      </div>

      <Container className="py-5">
        <Row>
          <Col md={4} className="mb-4">
            <Card className="contact-card shadow h-100 text-center p-4">
              <FaPhone size={50} className="text-danger mb-3" />
              <h4 className="fw-bold">Phone</h4>
              <p className="mb-0">General Inquiries</p>
              <a href="tel:+911234567890" className="text-danger fw-bold">
                +91 123-456-7890
              </a>
              <hr />
              <p className="mb-0 text-danger">Emergency Helpline</p>
              <a href="tel:18001234567" className="text-danger fw-bold fs-4">
                1800-123-4567
              </a>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="contact-card shadow h-100 text-center p-4">
              <FaEnvelope size={50} className="text-danger mb-3" />
              <h4 className="fw-bold">Email</h4>
              <p className="mb-0">General Support</p>
              <a href="mailto:support@droplife.com" className="text-danger">
                support@droplife.com
              </a>
              <hr />
              <p className="mb-0">Partnerships</p>
              <a href="mailto:partnerships@droplife.com" className="text-danger">
                partnerships@droplife.com
              </a>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="contact-card shadow h-100 text-center p-4">
              <FaMapMarkerAlt size={50} className="text-danger mb-3" />
              <h4 className="fw-bold">Address</h4>
              <p className="mb-0">
                DROPLIFE Headquarters
                <br />
                123 Life Saving Street
                <br />
                Bhubaneswar, Odisha 751001
                <br />
                India
              </p>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={8} className="mx-auto">
            <Card className="shadow">
              <Card.Body className="p-5">
                <h3 className="fw-bold mb-4 text-center">Send Us a Message</h3>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your name"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Subject *</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this about?"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Message *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Write your message here..."
                    />
                  </Form.Group>

                  <Button type="submit" variant="danger" size="lg" className="w-100">
                    Send Message
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col md={12}>
            <Card className="bg-light p-4">
              <h4 className="fw-bold mb-3">
                <FaClock className="me-2" />
                Operating Hours
              </h4>
              <Row>
                <Col md={6}>
                  <p className="mb-2">
                    <strong>Emergency Helpline:</strong> 24/7 (Always Available)
                  </p>
                  <p className="mb-2">
                    <strong>Customer Support:</strong> Monday - Saturday, 9:00 AM - 8:00 PM
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-2">
                    <strong>Email Support:</strong> Responses within 24 hours
                  </p>
                  <p className="mb-2">
                    <strong>Office Visit:</strong> Monday - Friday, 10:00 AM - 6:00 PM
                  </p>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;