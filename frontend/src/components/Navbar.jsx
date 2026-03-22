import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { FaUserCircle, FaTint } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <BsNavbar bg="light" expand="lg" className="shadow-sm" sticky="top">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="fw-bold text-danger">
          <FaTint /> DR🩸PLIFE
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Public links - always visible */}
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            <Nav.Link as={Link} to="/helpline">Helpline</Nav.Link>
            
            {/* Protected links - only for logged in users */}
            {token && (
              <>
                <Nav.Link as={Link} to="/home">Home</Nav.Link>
                <Nav.Link as={Link} to="/blood-request">Request Blood</Nav.Link>
                <Nav.Link as={Link} to="/blood-availability">Availability</Nav.Link>
                <Nav.Link as={Link} to="/camps">Camps</Nav.Link>
                <Nav.Link as={Link} to="/hospitals">Hospitals</Nav.Link>
                <Nav.Link as={Link} to="/map">Map</Nav.Link>
              </>
            )}
            
            {/* User menu or login/register buttons */}
            {token && user ? (
              <NavDropdown title={<><FaUserCircle /> {user.name}</>} id="user-dropdown">
                {user.role === 'admin' && (
                  <>
                    <NavDropdown.Item as={Link} to="/admin/dashboard">
                      Dashboard
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/donors">
                      Donors
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/blood-stock">
                      Blood Stock
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/analytics">
                      Analytics
                    </NavDropdown.Item>
                  </>
                )}
                {user.role === 'donor' && (
                  <NavDropdown.Item as={Link} to="/donor/dashboard">
                    My Dashboard
                  </NavDropdown.Item>
                )}
                {user.role === 'hospital' && (
                  <>
                    <NavDropdown.Item as={Link} to="/hospital/dashboard">
                      Dashboard
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/hospital/blood-bank">
                      Blood Bank
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/hospital/patients">
                      Patients
                    </NavDropdown.Item>
                  </>
                )}
                {user.role === 'user' && (
                  <NavDropdown.Item as={Link} to="/user/dashboard">
                    My Dashboard
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button variant="outline-danger" size="sm">Login</Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="danger" size="sm">Register</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;