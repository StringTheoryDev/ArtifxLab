import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>ArtiFx</h5>
            <p className="small">Your one-stop shop for musical instruments and vinyl records - new and used.</p>
          </Col>
          
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-light">Home</Link></li>
              <li><Link to="/products" className="text-light">Shop</Link></li>
              <li><Link to="/used-items" className="text-light">Used Items</Link></li>
              <li><Link to="/about" className="text-light">About Us</Link></li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5>Contact Us</h5>
            <p className="small">
              123 Music Avenue, Suite 101<br />
              Phone: (555) 123-4567<br />
              Email: info@artifx.com
            </p>
          </Col>
        </Row>
        
        <hr className="my-3 bg-secondary" />
        
        <Row>
          <Col className="text-center">
            <p className="small mb-0">ArtiFx &copy; 2025 | All rights reserved</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;