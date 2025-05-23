import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Image, ListGroup, Card, Button, Form, Modal } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import HtmlRenderer from '../components/HtmlRenderer';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useContext(CartContext);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data);
        
        // Set an initial image if available
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0].image_url);
        } else if (data.primary_image) {
          setSelectedImage(data.primary_image);
        }
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    addToCart(product, Number(qty));
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Determine the image to display
  const productImage = product?.images && product.images.length > 0 
    ? product.images[0].image_url 
    : (product?.primary_image || "https://via.placeholder.com/500x500?text=No+Image");

  return (
    <Container>
      <Link to="/" className="btn btn-light my-3">Go Back</Link>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : !product ? (
        <p>Product not found</p>
      ) : (
        <Row>
          <Col md={5}>
            <Image 
              src={productImage}
              alt={product.name} 
              fluid 
              className="product-detail-image"
              style={{ cursor: 'pointer' }}
              onClick={() => openImageModal(productImage)}
            />
          </Col>
          
          <Col md={4}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h3>{product.name}</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Brand:</strong> {product.brand}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Category:</strong> {product.category_name}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Price:</strong> ${product.price}
              </ListGroup.Item>
              <ListGroup.Item>
                <HtmlRenderer htmlContent={product.description || ''} />
              </ListGroup.Item>
            </ListGroup>
          </Col>
          
          <Col md={3}>
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>${product.price}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>{product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</Col>
                  </Row>
                </ListGroup.Item>
                
                {product.stock_quantity > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Qty</Col>
                      <Col>
                        <Form.Control
                          as="select"
                          value={qty}
                          onChange={(e) => setQty(Number(e.target.value))}
                        >
                          {[...Array(Math.min(product.stock_quantity, 10)).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Control>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}
                
                <ListGroup.Item>
                  <Button
                    className="w-100"
                    type="button"
                    disabled={product.stock_quantity === 0}
                    onClick={addToCartHandler}
                  >
                    Add to Cart
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}

      {/* Image Modal with improved styling */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)} 
        size="lg"
        centered
        dialogClassName="image-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{product?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          <div className="image-container p-3 d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <Image 
              src={selectedImage} 
              alt={product?.name} 
              fluid 
              className="product-modal-image"
            />
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductDetailPage;