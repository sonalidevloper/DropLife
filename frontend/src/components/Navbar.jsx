import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { FaUserCircle, FaTint } from 'react-icons/fa';
import LanguageSelector    from './LanguageSelector';
import NotificationBell    from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Dashboard path per role
  const dashboardPath = () => {
    if (!user) return '/home';
    const map = { admin: '/admin/dashboard', donor: '/donor/dashboard',
                  hospital: '/hospital/dashboard', user: '/user/dashboard' };
    return map[user.role] || '/home';
  };

  return (
    <BsNavbar bg="light" expand="lg" className="shadow-sm" sticky="top">
      <Container>
        <BsNavbar.Brand as={Link} to="/home" className="fw-bold text-danger">
          <FaTint /> DR🩸PLIFE
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="droplife-nav" />
        <BsNavbar.Collapse id="droplife-nav">
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link as={Link} to="/home">Home</Nav.Link>
            <Nav.Link as={Link} to="/blood-availability">Availability</Nav.Link>
            <Nav.Link as={Link} to="/camps">Camps</Nav.Link>
            <Nav.Link as={Link} to="/hospitals">Hospitals</Nav.Link>
            <Nav.Link as={Link} to="/map">Map</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>

            {/* Language selector (no i18n dependency) */}
            <LanguageSelector />

            {/* Notification bell — only when logged in */}
            {token && <NotificationBell />}

            {/* User menu */}
            {token && user ? (
              <NavDropdown
                title={<><FaUserCircle className="me-1" />{user.name}</>}
                id="user-nav-dropdown"
              >
                <NavDropdown.Item as={Link} to={dashboardPath()}>
                  My Dashboard
                </NavDropdown.Item>

                {user.role === 'admin' && (
                  <>
                    <NavDropdown.Item as={Link} to="/admin/donors">Manage Donors</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/blood-stock">Blood Stock</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/deliveries">Deliveries</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/analytics">Analytics</NavDropdown.Item>
                  </>
                )}

                {user.role === 'hospital' && (
                  <>
                    <NavDropdown.Item as={Link} to="/hospital/blood-bank">Blood Bank</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/hospital/requests">Requests</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/hospital/deliveries">Deliveries</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/hospital/staff">Staff</NavDropdown.Item>
                  </>
                )}

                <NavDropdown.Item as={Link} to="/notifications">Notifications</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex gap-2 ms-2">
                <Button as={Link} to="/login" variant="outline-danger" size="sm">
                  Login
                </Button>
                <Button as={Link} to="/register" variant="danger" size="sm">
                  Register
                </Button>
              </div>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;