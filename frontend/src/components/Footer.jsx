import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light py-5 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h4 className="text-danger mb-3">DR🩸PLIFE</h4>
            <p>
              Smart Blood Donation System connecting donors, recipients, and healthcare facilities
              in real-time to save lives.
            </p>
            <div className="social-icons mt-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-light me-3"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-light me-3"
                aria-label="Twitter"
              >
                <FaTwitter size={24} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-light me-3"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-light"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </Col>
          
          <Col md={4} className="mb-4">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/about" className="text-light">About Us</Link></li>
              <li><Link to="/blood-request" className="text-light">Blood Request</Link></li>
              <li><Link to="/camps" className="text-light">Donation Camps</Link></li>
              <li><Link to="/privacy" className="text-light">Privacy Policy</Link></li>
              <li><Link to="/helpline" className="text-light">Helpline</Link></li>
            </ul>
          </Col>
          
          <Col md={4} className="mb-4">
            <h5 className="mb-3">Contact Us</h5>
            <p>
              <FaEnvelope className="me-2" />
              <a href="mailto:support@droplife.com" className="text-light">
                support@droplife.com
              </a>
            </p>
            <p>
              <FaPhone className="me-2" />
              <a href="tel:+911234567890" className="text-light">
                +91 123-456-7890
              </a>
            </p>
            <p className="mt-3">
              <strong>Emergency Helpline:</strong><br />
              <a href="tel:18001234567" className="text-danger fs-4">
                1800-123-4567
              </a>
            </p>
          </Col>
        </Row>
        
        <hr className="bg-light" />
        
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} DROPLIFE. All rights reserved. | 
              Made with ❤️ for saving lives
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;