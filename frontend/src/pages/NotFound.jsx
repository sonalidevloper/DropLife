import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="not-found-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container className="text-center">
        <FaExclamationTriangle size={100} className="text-danger mb-4" />
        <h1 className="display-1 fw-bold">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="lead mb-4">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Button as={Link} to="/home" variant="danger" size="lg">
          <FaHome className="me-2" />
          Back to Home
        </Button>
      </Container>
    </div>
  );
};

export default NotFound;