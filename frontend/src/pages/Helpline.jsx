import React from 'react';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import { FaPhoneAlt, FaQuestionCircle, FaHeadset } from 'react-icons/fa';
import './InfoPages.css';

const Helpline = () => {
  return (
    <div className="info-page">
      <div className="info-hero bg-danger text-white py-5">
        <Container>
          <h1 className="display-4 fw-bold text-center">Emergency Helpline</h1>
          <p className="lead text-center">24/7 Support When You Need It Most</p>
        </Container>
      </div>

      <Container className="py-5">
        {/* Emergency Numbers */}
        <Row className="mb-5">
          <Col md={4} className="mb-4">
            <Card className="helpline-card shadow text-center p-4 h-100">
              <FaPhoneAlt size={60} className="text-danger mb-3" />
              <h3 className="fw-bold text-danger">1800-123-4567</h3>
              <h5 className="mb-3">National Emergency Helpline</h5>
              <p className="mb-0">24/7 Available | Toll-Free</p>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="helpline-card shadow text-center p-4 h-100">
              <FaHeadset size={60} className="text-danger mb-3" />
              <h3 className="fw-bold text-danger">+91 123-456-7890</h3>
              <h5 className="mb-3">Customer Support</h5>
              <p className="mb-0">Mon-Sat: 9 AM - 8 PM</p>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="helpline-card shadow text-center p-4 h-100">
              <FaQuestionCircle size={60} className="text-danger mb-3" />
              <h3 className="fw-bold text-danger">support@droplife.com</h3>
              <h5 className="mb-3">Email Support</h5>
              <p className="mb-0">Response within 24 hours</p>
            </Card>
          </Col>
        </Row>

        {/* State-wise Helplines */}
        <Row className="mb-5">
          <Col md={12}>
            <h2 className="fw-bold mb-4 text-center">State-wise Blood Bank Helplines</h2>
            <Card className="shadow">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5 className="text-danger">Odisha</h5>
                    <p>
                      <strong>State Blood Cell:</strong> 0674-2536297
                      <br />
                      <strong>KIMS Blood Bank:</strong> 0674-2386007
                    </p>

                    <h5 className="text-danger mt-3">Delhi</h5>
                    <p>
                      <strong>Red Cross:</strong> 011-23711551
                      <br />
                      <strong>AIIMS Blood Bank:</strong> 011-26588500
                    </p>

                    <h5 className="text-danger mt-3">Maharashtra</h5>
                    <p>
                      <strong>Mumbai Blood Bank:</strong> 022-24167310
                      <br />
                      <strong>KEM Hospital:</strong> 022-24107000
                    </p>
                  </Col>
                  <Col md={6}>
                    <h5 className="text-danger">Karnataka</h5>
                    <p>
                      <strong>State Blood Bank:</strong> 080-26565676
                      <br />
                      <strong>Victoria Hospital:</strong> 080-26700301
                    </p>

                    <h5 className="text-danger mt-3">Tamil Nadu</h5>
                    <p>
                      <strong>Chennai Blood Bank:</strong> 044-28511039
                      <br />
                      <strong>Apollo Hospital:</strong> 044-28296000
                    </p>

                    <h5 className="text-danger mt-3">West Bengal</h5>
                    <p>
                      <strong>Kolkata Blood Bank:</strong> 033-22265413
                      <br />
                      <strong>Medical College:</strong> 033-22441706
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* FAQ Section */}
        <Row>
          <Col md={12}>
            <h2 className="fw-bold mb-4 text-center">Frequently Asked Questions</h2>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>How quickly can I get help in an emergency?</Accordion.Header>
                <Accordion.Body>
                  Our emergency helpline (1800-123-4567) is available 24/7. Once you call, our
                  team will immediately start searching for nearby donors and coordinate with
                  blood banks to fulfill your request as quickly as possible.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  What information should I have ready when calling?
                </Accordion.Header>
                <Accordion.Body>
                  Please have the following ready: Patient name, blood group required, number of
                  units needed, hospital name and location, contact number, and urgency level
                  (critical/urgent/normal).
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
                <Accordion.Header>Is the helpline toll-free?</Accordion.Header>
                <Accordion.Body>
                  Yes, our national emergency helpline (1800-123-4567) is completely toll-free.
                  You can call from any phone, anywhere in India, without any charges.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3">
                <Accordion.Header>What languages are supported?</Accordion.Header>
                <Accordion.Body>
                  Our helpline supports Hindi, English, and major regional languages including
                  Odia, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, and Gujarati.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="4">
                <Accordion.Header>
                  Can I register a blood request through the helpline?
                </Accordion.Header>
                <Accordion.Body>
                  Yes! Our helpline team can register blood requests on your behalf. They will
                  collect all necessary information and immediately start the donor matching
                  process.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="5">
                <Accordion.Header>What if I need help using the website/app?</Accordion.Header>
                <Accordion.Body>
                  Our customer support team (+91 123-456-7890) can guide you through the
                  registration process, help you create blood requests, or troubleshoot any
                  technical issues you're facing.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>

        {/* Emergency Tips */}
        <Row className="mt-5">
          <Col md={12}>
            <Card className="bg-danger text-white p-4">
              <h3 className="fw-bold mb-3">Emergency Tips</h3>
              <ul>
                <li>Always call the helpline first in critical situations</li>
                <li>Keep patient's blood group information readily available</li>
                <li>Have hospital contact details and location ready</li>
                <li>Inform hospital staff that you've registered on DROPLIFE</li>
                <li>
                  Save our helpline number (1800-123-4567) in your phone for quick access
                </li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Helpline;