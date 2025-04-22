import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Product = ({ product }) => {
  // Make sure we're accessing the image URL correctly
  const imageUrl = product.primary_image || 
                   (product.images && product.images[0]?.image_url) || 
                   "https://via.placeholder.com/300x200?text=No+Image";
  
  return (
    <Card className="h-100 product-card shadow-sm">
      <div className="image-container position-relative" style={{ height: '200px' }}>
        <Card.Img 
          variant="top" 
          src={imageUrl}
          alt={product.name}
          className="product-image"
          style={{ 
            height: '100%', 
            objectFit: 'contain', 
            padding: '10px',
            transition: 'transform 0.3s'
          }}
        />
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h5" className="product-title">{product.name}</Card.Title>
        <Card.Text className="text-muted mb-0">{product.brand}</Card.Text>
        <Card.Text className="mb-2 fw-bold">${product.price}</Card.Text>
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