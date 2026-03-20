import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { FaUserCircle, FaTint } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { t } = useTranslation();

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
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home">{t('nav.home', 'Home')}</Nav.Link>
            <Nav.Link as={Link} to="/blood-request">{t('nav.bloodRequest', 'Blood Request')}</Nav.Link>
            <Nav.Link as={Link} to="/blood-availability">{t('nav.bloodAvailability', 'Blood Availability')}</Nav.Link>
            <Nav.Link as={Link} to="/camps">{t('nav.camps', 'Donation Camps')}</Nav.Link>
            <Nav.Link as={Link} to="/map">{t('nav.map', 'Find Donors')}</Nav.Link>
            <Nav.Link as={Link} to="/hospitals">{t('nav.hospitals', 'Hospitals')}</Nav.Link>
            <Nav.Link as={Link} to="/analytics">{t('nav.analytics', 'Analytics')}</Nav.Link>
            <Nav.Link as={Link} to="/about">{t('nav.about', 'About')}</Nav.Link>
            <Nav.Link as={Link} to="/contact">{t('nav.contact', 'Contact')}</Nav.Link>
          </Nav>

          <Nav className="ms-auto align-items-center gap-1">
            <LanguageSelector />

            {token && user ? (
              <>
                <NotificationBell />
                <NavDropdown
                  title={<><FaUserCircle className="me-1" />{user.name}</>}
                  id="user-dropdown"
                  align="end"
                >
                  {user.role === 'admin' && (
                    <>
                      <NavDropdown.Item as={Link} to="/admin/dashboard">
                        {t('admin.dashboard', 'Admin Dashboard')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/donors">
                        {t('admin.donors', 'Manage Donors')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/blood-stock">
                        {t('admin.bloodStock', 'Blood Stock')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/deliveries">
                        {t('admin.deliveries', 'Deliveries')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/analytics">
                        {t('admin.analytics', 'Analytics')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/hospitals">
                        {t('admin.hospitals', 'Hospitals')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/camps">
                        Donation Camps
                      </NavDropdown.Item>
                    </>
                  )}

                  {user.role === 'hospital' && (
                    <>
                      <NavDropdown.Item as={Link} to="/hospital/dashboard">
                        {t('hospital.dashboard', 'Hospital Dashboard')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/hospital/blood-bank">
                        {t('hospital.bloodBank', 'Blood Bank')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/hospital/deliveries">
                        {t('hospital.deliveries', 'Deliveries')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/hospital/requests">
                        {t('hospital.requests', 'Blood Requests')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/hospital/patients">
                        {t('hospital.patients', 'Patients')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/hospital/staff">
                        {t('hospital.staff', 'Staff')}
                      </NavDropdown.Item>
                    </>
                  )}

                  {user.role === 'donor' && (
                    <>
                      <NavDropdown.Item as={Link} to="/donor/dashboard">
                        {t('donor.dashboard', 'Donor Dashboard')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/donor/profile">
                        {t('donor.profile', 'My Profile')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/donor/history">
                        {t('donor.history', 'Donation History')}
                      </NavDropdown.Item>
                    </>
                  )}

                  {user.role === 'user' && (
                    <>
                      <NavDropdown.Item as={Link} to="/user/dashboard">
                        {t('nav.dashboard', 'Dashboard')}
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/user/profile">
                        My Profile
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/user/requests">
                        My Requests
                      </NavDropdown.Item>
                    </>
                  )}

                  <NavDropdown.Item as={Link} to="/notifications">
                    {t('nav.notifications', 'Notifications')}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    {t('nav.logout', 'Logout')}
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button variant="outline-danger" size="sm">{t('nav.login', 'Login')}</Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  <Button variant="danger" size="sm">{t('nav.register', 'Register')}</Button>
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