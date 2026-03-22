import React, { useState, useEffect, useMemo } from 'react';
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
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [bloodBankFilter, setBloodBankFilter] = useState('All');
  const [page, setPage] = useState(1);

  // 🔹 Fetch
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/hospitals');
        const list = Array.isArray(res.data)
          ? res.data
          : res.data.data || res.data.hospitals || [];

        setHospitals(list);
      } catch {
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // 🔹 Optimized filtering
  const filtered = useMemo(() => {
    let data = [...hospitals];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(h =>
        `${h.name} ${h.address?.city} ${h.address?.state}`
          .toLowerCase()
          .includes(q)
      );
    }

    if (typeFilter !== 'All') {
      data = data.filter(h => h.type === typeFilter);
    }

    if (bloodBankFilter === 'Yes') {
      data = data.filter(h => h.bloodBank?.hasBloodBank);
    }

    if (bloodBankFilter === 'No') {
      data = data.filter(h => !h.bloodBank?.hasBloodBank);
    }

    return data;
  }, [hospitals, search, typeFilter, bloodBankFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  }, [filtered, page]);

  const availabilityMap = (arr) => {
    if (!Array.isArray(arr)) return {};
    return arr.reduce((acc, item) => {
      acc[item.bloodGroup] = item.unitsAvailable;
      return acc;
    }, {});
  };

  return (
    <Container className="py-4">

      <h2 className="text-center mb-4">
        <FaHospital className="text-danger" /> Hospitals
      </h2>

      {/* SEARCH */}
      <InputGroup className="mb-3">
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          placeholder="Search hospital..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* LIST */}
      <Row>
        {paginated.map(h => {
          const avail = availabilityMap(h.bloodAvailability);

          return (
            <Col md={4} key={h._id}>
              <Card className="mb-3">
                <Card.Body>

                  <h6>{h.name}</h6>

                  <div className="text-muted">
                    <FaMapMarkerAlt /> {h.address?.city}
                  </div>

                  {Object.keys(avail).length > 0 && (
                    <div>
                      {BLOOD_GROUPS.map(bg => (
                        avail[bg] > 0 && (
                          <Badge key={bg} bg="danger">{bg}</Badge>
                        )
                      ))}
                    </div>
                  )}

                </Card.Body>

                <Card.Footer>
                  <Button as={Link} to={`/hospitals/${h._id}`}>
                    View
                  </Button>
                </Card.Footer>

              </Card>
            </Col>
          );
        })}
      </Row>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination>
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i}
              active={page === i + 1}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

    </Container>
  );
};

export default HospitalsPublic;