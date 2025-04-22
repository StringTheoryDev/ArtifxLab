import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Product = ({ product }) => {
  return (
    <Card className="h-100">
      <Card.Img 
        variant="top" 
        src={product.primary_image || "https://via.placeholder.com/300x200?text=No+Image"} 
        alt={product.name}
        height="200"
        style={{ objectFit: 'contain', padding: '10px' }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h5">{product.name}</Card.Title>
        <Card.Text className="text-muted mb-0">{product.brand}</Card.Text>
        <Card.Text className="mb-2">${product.price}</Card.Text>
        <div className="mt-auto">
          <Link to={`/product/${product.id}`} className="btn btn-primary w-100">
            View Details
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;
