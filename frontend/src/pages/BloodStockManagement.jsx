import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { FaTint, FaPlus, FaMinus } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const BloodStockManagement = () => {
  const [bloodStock, setBloodStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(null);
  const [transactionType, setTransactionType] = useState('Addition');
  const [units, setUnits] = useState(0);
  const [reference, setReference] = useState('');

  useEffect(() => {
    fetchBloodStock();
  }, []);

  const fetchBloodStock = async () => {
    try {
      const response = await api.get('/admin/blood-stock');
      setBloodStock(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch blood stock');
      setLoading(false);
    }
  };

  const handleOpenModal = (bloodGroup, type) => {
    setSelectedBloodGroup(bloodGroup);
    setTransactionType(type);
    setUnits(0);
    setReference('');
    setShowModal(true);
  };

  const handleUpdateStock = async () => {
    if (units <= 0) {
      toast.error('Please enter valid units');
      return;
    }

    try {
      await api.put(`/admin/blood-stock/${selectedBloodGroup}`, {
        units: parseInt(units),
        type: transactionType,
        reference,
      });
      toast.success(`Stock ${transactionType.toLowerCase()} successful`);
      setShowModal(false);
      fetchBloodStock();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const getTotalUnits = () => {
    return bloodStock.reduce((total, stock) => total + stock.unitsAvailable, 0);
  };

  const getCriticalStock = () => {
    return bloodStock.filter(
      (stock) => stock.unitsAvailable < stock.minimumThreshold
    ).length;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={12} className="mb-4">
          <h2 className="fw-bold">Blood Stock Management</h2>
          <p className="text-muted">Manage blood inventory and transactions</p>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="bg-primary text-white text-center p-3">
            <h3>{getTotalUnits()}</h3>
            <p className="mb-0">Total Units Available</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-success text-white text-center p-3">
            <h3>{bloodStock.length}</h3>
            <p className="mb-0">Blood Groups</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-danger text-white text-center p-3">
            <h3>{getCriticalStock()}</h3>
            <p className="mb-0">Critical Stock Levels</p>
          </Card>
        </Col>
      </Row>

      {/* Blood Stock Table */}
      <Row>
        <Col md={12}>
          <Card className="shadow">
            <Card.Header className="bg-danger text-white">
              <h5 className="mb-0">Current Blood Stock</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Blood Group</th>
                    <th>Units Available</th>
                    <th>Status</th>
                    <th>Min Threshold</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodStock.map((stock) => {
                    const isCritical = stock.unitsAvailable < stock.minimumThreshold;
                    const isLow =
                      stock.unitsAvailable >= stock.minimumThreshold &&
                      stock.unitsAvailable < stock.minimumThreshold * 1.5;

                    return (
                      <tr key={stock._id}>
                        <td className="fw-bold fs-5">{stock.bloodGroup}</td>
                        <td className="fs-5">{stock.unitsAvailable}</td>
                        <td>
                          {stock.unitsAvailable === 0 ? (
                            <Badge bg="danger">Out of Stock</Badge>
                          ) : isCritical ? (
                            <Badge bg="danger">Critical</Badge>
                          ) : isLow ? (
                            <Badge bg="warning">Low</Badge>
                          ) : (
                            <Badge bg="success">Good</Badge>
                          )}
                        </td>
                        <td>{stock.minimumThreshold}</td>
                        <td>{new Date(stock.lastUpdated).toLocaleString()}</td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenModal(stock.bloodGroup, 'Addition')}
                          >
                            <FaPlus /> Add
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenModal(stock.bloodGroup, 'Withdrawal')}
                            disabled={stock.unitsAvailable === 0}
                          >
                            <FaMinus /> Withdraw
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Transaction History */}
      <Row className="mt-4">
        <Col md={12}>
          <Card className="shadow">
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">Recent Transactions</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {bloodStock.map((stock) =>
                stock.transactions.slice(-5).reverse().map((transaction, index) => (
                  <div key={index} className="mb-2 p-2 border-bottom">
                    <strong>{stock.bloodGroup}</strong> -{' '}
                    <Badge bg={transaction.type === 'Addition' ? 'success' : 'danger'}>
                      {transaction.type}
                    </Badge>{' '}
                    {transaction.units} units
                    <br />
                    <small className="text-muted">
                      {new Date(transaction.date).toLocaleString()}
                      {transaction.reference && ` | Ref: ${transaction.reference}`}
                    </small>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Update Stock Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {transactionType} Blood Stock - {selectedBloodGroup}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Number of Units</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="Enter units"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reference (Optional)</Form.Label>
              <Form.Control
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., Donor ID, Camp Name, etc."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant={transactionType === 'Addition' ? 'success' : 'danger'}
            onClick={handleUpdateStock}
          >
            {transactionType === 'Addition' ? 'Add Units' : 'Withdraw Units'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BloodStockManagement;