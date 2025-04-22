import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Product from '../components/Product';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('http://localhost:5000/api/products');
        // Filter for featured products, or take first 4 if none are featured
        const featured = data.filter(product => product.featured === 1);
        setFeaturedProducts(featured.length > 0 ? featured : data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <Container>
      <div className="text-center py-5">
        <h1 className="display-4 fw-bold">Welcome to ArtiFx</h1>
        <p className="lead mb-0">Unleash Your Inner Maestro</p>
      </div>

      <h2 className="mb-4">Featured Products</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <Row>
          {featuredProducts.map((product) => (
            <Col key={product.id} sm={12} md={6} lg={4} xl={3} className="mb-4">
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}

      <Row className="my-5">
        <Col md={6} className="mb-4">
          <Card bg="light" className="shadow-sm h-100">
            <Card.Body className="text-center p-5">
              <Card.Title as="h3">Instruments</Card.Title>
              <Card.Text>
                Discover our wide selection of guitars, drums, keyboards and more.
              </Card.Text>
              <Link to="/products/category/1" className="btn btn-outline-primary">
                Shop Instruments
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card bg="light" className="shadow-sm h-100">
            <Card.Body className="text-center p-5">
              <Card.Title as="h3">Vinyl Records</Card.Title>
              <Card.Text>
                Explore our collection of vinyl records across all genres.
              </Card.Text>
              <Link to="/products/category/4" className="btn btn-outline-primary">
                Shop Vinyl
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <div className="bg-light p-5 rounded shadow-sm mb-5 text-center">
        <h3>Have instruments or vinyl to sell?</h3>
        <p className="lead">Join our community marketplace and list your items for sale!</p>
        <Link to="/used-items" className="btn btn-success me-2">Browse Used Items</Link>
        <Link to="/add-listing" className="btn btn-outline-secondary">Add Your Listing</Link>
      </div>
    </Container>
  );
};

export default HomePage;