import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UsedItemsPage = () => {
  const [usedItems, setUsedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCondition, setFilterCondition] = useState('');

useEffect(() => {
  const fetchUsedItems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/used-items');
      setUsedItems(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching used items:', err);
      setError('Failed to load used items. Please try again later.');
      setLoading(false);
    }
  };

  fetchUsedItems();
}, []);

  // Filter the items based on selected filters
  const filteredItems = usedItems.filter(item => {
    let matchesCategory = true;
    let matchesCondition = true;
    
    if (filterCategory && item.category_id.toString() !== filterCategory) {
      matchesCategory = false;
    }
    
    if (filterCondition && item.condition !== filterCondition) {
      matchesCondition = false;
    }
    
    return matchesCategory && matchesCondition;
  });

  return (
    <Container>
      <h1 className="my-4">Used Instruments & Vinyl</h1>
      <p className="lead mb-4">Browse pre-owned instruments and vinyl records from our community</p>
      
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Form.Group>
            <Form.Label>Filter by Category</Form.Label>
            <Form.Control
              as="select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="1">Guitars</option>
              <option value="2">Drums & Percussion</option>
              <option value="3">Keyboards</option>
              <option value="4">Vinyl Records</option>
            </Form.Control>
          </Form.Group>
        </Col>
        
        <Col md={6} lg={3} className="mb-3">
          <Form.Group>
            <Form.Label>Filter by Condition</Form.Label>
            <Form.Control
              as="select"
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
            >
              <option value="">All Conditions</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </Form.Control>
          </Form.Group>
        </Col>
        
        <Col lg={6} className="d-flex align-items-end mb-3">
          <Link to="/add-listing" className="btn btn-success ml-auto">
            + Add Your Listing
          </Link>
        </Col>
      </Row>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-5">
          <h3>No used items found matching your criteria</h3>
          <p>Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <Row>
          {filteredItems.map((item) => (
            <Col key={item.id} sm={6} md={4} lg={3} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={item.primary_image || "https://via.placeholder.com/300x200?text=No+Image"}
                  height="180"
                  style={{ objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title as="h5" className="mb-0">{item.name}</Card.Title>
                    <Badge 
                      bg={
                        item.condition === 'Excellent' ? 'success' :
                        item.condition === 'Good' ? 'info' :
                        item.condition === 'Fair' ? 'warning' : 'danger'
                      }
                    >
                      {item.condition}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted small mb-1">
                    Seller: {item.seller.name}
                  </Card.Text>
                  <Card.Text className="mb-2">${item.price}</Card.Text>
                  <div className="mt-auto">
                    <Link to={`/product/${item.id}`} className="btn btn-primary w-100">
                      View Details
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default UsedItemsPage;