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
    navigate('/');
  };

  return (
    <BsNavbar bg="light" expand="lg" className="shadow-sm" sticky="top">
      <Container>
        <BsNavbar.Brand as={Link} to="/home" className="fw-bold text-danger">
          <FaTint /> DR🩸PLIFE
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/home">Home</Nav.Link>
            <Nav.Link as={Link} to="/blood-request">Blood Request</Nav.Link>
            <Nav.Link as={Link} to="/blood-availability">Blood Availability</Nav.Link>
            <Nav.Link as={Link} to="/camps">Donation Camps</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            
            {token && user ? (
              <NavDropdown title={<><FaUserCircle /> {user.name}</>} id="user-dropdown">
                {user.role === 'admin' ? (
                  <>
                    <NavDropdown.Item as={Link} to="/admin/dashboard">
                      Dashboard
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/donors">
                      Donor List
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/blood-stock">
                      Blood Stock
                    </NavDropdown.Item>
                  </>
                ) : (
                  <NavDropdown.Item as={Link} to="/donor/dashboard">
                    Dashboard
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
                <Nav.Link as={Link} to="/signup">
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