import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Form, InputGroup, Pagination
} from 'react-bootstrap';
import { FaHospital, FaSearch, FaPhone, FaMapMarkerAlt, FaMap } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';

const HOSPITAL_TYPES = ['All', 'Government', 'Private', 'Trust', 'Clinic', 'NGO'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const PER_PAGE = 12;

const HospitalsPublic = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [bloodBankFilter, setBloodBankFilter] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/hospitals');
        const list = Array.isArray(res.data) ? res.data : (res.data.data || res.data.hospitals || []);
        setHospitals(list);
      } catch {
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    let data = hospitals;
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (h) =>
          h.name?.toLowerCase().includes(q) ||
          h.address?.city?.toLowerCase().includes(q) ||
          h.address?.state?.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'All') data = data.filter((h) => h.type === typeFilter);
    if (bloodBankFilter === 'Yes') data = data.filter((h) => h.bloodBank?.hasBloodBank);
    if (bloodBankFilter === 'No') data = data.filter((h) => !h.bloodBank?.hasBloodBank);
    setFiltered(data);
    setPage(1);
  }, [search, typeFilter, bloodBankFilter, hospitals]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const typeColor = (type) => ({
    Government: 'primary', Private: 'danger', Trust: 'success',
    Clinic: 'info', NGO: 'warning'
  }[type] || 'secondary');

  // bloodAvailability is stored as [{bloodGroup, unitsAvailable}] — build a lookup map
  const availabilityMap = (arr) => {
    if (!Array.isArray(arr)) return {};
    return arr.reduce((acc, item) => {
      acc[item.bloodGroup] = item.unitsAvailable;
      return acc;
    }, {});
  };

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <FaHospital className="text-danger me-2" />Hospitals
        </h2>
        <p className="text-muted">Find hospitals and blood banks near you</p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by name or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {HOSPITAL_TYPES.map((t) => <option key={t}>{t}</option>)}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select value={bloodBankFilter} onChange={(e) => setBloodBankFilter(e.target.value)}>
                <option value="All">Blood Bank: All</option>
                <option value="Yes">Has Blood Bank</option>
                <option value="No">No Blood Bank</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={2}>
              <Button as={Link} to="/map" variant="outline-danger" className="w-100">
                <FaMap className="me-1" />Map View
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Results count */}
      <div className="mb-3 text-muted small">
        {loading ? 'Loading...' : `Showing ${filtered.length} hospital${filtered.length !== 1 ? 's' : ''}`}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading hospitals...</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaHospital style={{ fontSize: '3rem' }} className="mb-3 text-danger" />
          <p>No hospitals found matching your criteria</p>
        </div>
      ) : (
        <Row className="g-3">
          {paginated.map((h) => {
            const avail = availabilityMap(h.bloodAvailability);
            return (
              <Col key={h._id} xs={12} sm={6} lg={4}>
                <Card className="h-100 shadow-sm hover-shadow">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">{h.name}</h6>
                      <Badge bg={typeColor(h.type)}>{h.type}</Badge>
                    </div>

                    <div className="text-muted small mb-2">
                      <FaMapMarkerAlt className="me-1 text-danger" />
                      {h.address?.city || '—'}{h.address?.state ? `, ${h.address.state}` : ''}
                    </div>

                    {h.phone && (
                      <div className="text-muted small mb-2">
                        <FaPhone className="me-1" />{h.phone}
                      </div>
                    )}

                    {h.bloodBank?.hasBloodBank && (
                      <Badge bg="danger" className="mb-2">🩸 Blood Bank</Badge>
                    )}

                    {/* Blood availability summary */}
                    {Object.keys(avail).length > 0 && (
                      <div className="mb-2">
                        <small className="text-muted fw-semibold">Available: </small>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {BLOOD_GROUPS.filter((bg) => Number(avail[bg] || 0) > 0).map((bg) => (
                            <Badge key={bg} bg="danger" style={{ fontSize: '0.65rem' }}>
                              {bg}: {avail[bg]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {h.operatingHours?.isOpen24Hours && (
                      <Badge bg="success" className="mb-2">24/7 Open</Badge>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-white border-top-0 d-flex gap-2">
                    <Button
                      as={Link}
                      to={`/hospitals/${h._id}`}
                      variant="outline-danger"
                      size="sm"
                      className="flex-grow-1"
                    >
                      View Details
                    </Button>
                    <Button
                      as={Link}
                      to="/map"
                      variant="outline-primary"
                      size="sm"
                    >
                      <FaMap />
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => p - 1)} />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i + 1}
                active={page === i + 1}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default HospitalsPublic;
