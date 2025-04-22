import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Nav, Table, Button, Form, Alert, Modal, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HtmlRenderer from '../components/HtmlRenderer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [usedItems, setUsedItems] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatingDescription, setGeneratingDescription] = useState(false);
  
  // For product add/edit
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    category_id: '',
    stock_quantity: '',
    brand: '',
    sku: '',
    featured: false,
    image_url: ''
  });
  
  useEffect(() => {
    // Check authentication on load
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      
      // Log the token for debugging (first 20 chars)
      console.log('Current token:', token.substring(0, 20) + '...');
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    // Check if user is logged in as admin
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch products
        const { data: productsData } = await axios.get('http://localhost:5000/api/products');
        setProducts(productsData);
        
        // Fetch used items
        const { data: usedItemsData } = await axios.get('http://localhost:5000/api/used-items', config);
        setUsedItems(usedItemsData);
        
        // Fetch pending listings
        const { data: pendingData } = await axios.get('http://localhost:5000/api/used-items?pending=true', config);
        setPendingListings(pendingData);
        
        // Fetch categories
        const { data: categoriesData } = await axios.get('http://localhost:5000/api/categories');
        setCategories(categoriesData);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setProducts(products.filter(product => product.id !== id));
        setSuccess('Product deleted successfully');
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };
  
  const deleteUsedItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/used-items/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUsedItems(usedItems.filter(item => item.id !== id));
        setSuccess('Listing deleted successfully');
      } catch (err) {
        setError('Failed to delete listing');
      }
    }
  };
  
  const approveListing = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`http://localhost:5000/api/used-items/${id}/approve`, {}, config);
      
      // Update listings after approval
      setPendingListings(pendingListings.filter(item => item.id !== id));
      setSuccess('Listing approved successfully');
    } catch (err) {
      setError('Failed to approve listing');
    }
  };
  
  const denyListing = async (id) => {
    const reason = prompt('Please provide a reason for denial:');
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      await axios.put(
        `http://localhost:5000/api/used-items/${id}/deny`, 
        { reason }, 
        config
      );
      
      // Update listings after denial
      setPendingListings(pendingListings.filter(item => item.id !== id));
      setSuccess('Listing denied successfully');
    } catch (err) {
      setError('Failed to deny listing');
    }
  };
  
  const generateAIDescription = async () => {
    if (!productForm.name) return;
    
    try {
      setGeneratingDescription(true);
      setError('');
      
      const token = localStorage.getItem('token');
      console.log('Using token for AI:', token ? 'Token exists' : 'No token');
      
      const response = await axios.post(
        'http://localhost:5000/api/ai/generate-description',
        { productName: productForm.name },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('AI Response:', response.data);
      
      if (response.data && response.data.description) {
        setProductForm({
          ...productForm,
          description: response.data.description
        });
        setSuccess('AI description generated successfully');
      } else {
        setError('No description returned from AI service');
      }
    } catch (err) {
      console.error('AI Description Error:', err);
      let errorMsg = 'Failed to generate AI description';
      
      if (err.response) {
        errorMsg += ': ' + (err.response.data?.message || err.response.statusText);
        console.error('Error response:', err.response.data);
      } else if (err.request) {
        errorMsg += ': No response received from server';
      } else {
        errorMsg += ': ' + err.message;
      }
      
      setError(errorMsg);
    } finally {
      setGeneratingDescription(false);
    }
  };
  
  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm({
      ...productForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      sale_price: '',
      category_id: '',
      stock_quantity: '',
      brand: '',
      sku: '',
      featured: false,
      image_url: ''
    });
    setShowProductModal(true);
  };
  
  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      sale_price: product.sale_price || '',
      category_id: product.category_id || '',
      stock_quantity: product.stock_quantity || '',
      brand: product.brand || '',
      sku: product.sku || '',
      featured: product.featured || false,
      image_url: product.primary_image || ''
    });
    setShowProductModal(true);
  };
  
  const submitProductForm = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        return;
      }
      
      console.log('Submitting product with token:', token.substring(0, 20) + '...');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Format the form data - pass image_url directly
      const formattedData = {
        ...productForm,
        price: parseFloat(productForm.price),
        sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : null,
        stock_quantity: parseInt(productForm.stock_quantity),
        category_id: parseInt(productForm.category_id) || null,
        featured: Boolean(productForm.featured),
        image_url: productForm.image_url // Ensure this is passed directly
      };
      
      console.log('Submitting data:', formattedData);
      
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, formattedData, config);
        setSuccess('Product updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/products', formattedData, config);
        setSuccess('Product added successfully');
      }
      
      // Refresh products list
      const { data } = await axios.get('http://localhost:5000/api/products');
      setProducts(data);
      
      setShowProductModal(false);
    } catch (err) {
      console.error('Save product error:', err.response || err);
      setError('Failed to save product: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Container className="my-4">
      <h1>Admin Dashboard</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tab.Container id="admin-tabs" defaultActiveKey="products">
        <Row>
          <Col md={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="products">Manage Products</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="used-items">Manage Used Listings</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="pending-listings">
                  Pending Listings
                  {pendingListings.length > 0 && (
                    <Badge pill bg="warning" className="ms-2">
                      {pendingListings.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="categories">Manage Categories</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="products">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2>Products</h2>
                  <Button variant="success" onClick={openAddProductModal}>
                    Add New Product
                  </Button>
                </div>
                
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>${product.price}</td>
                        <td>{product.category_name}</td>
                        <td>{product.stock_quantity}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => openEditProductModal(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>
              
              <Tab.Pane eventKey="used-items">
                <h2>Used Listings</h2>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Seller</th>
                      <th>Condition</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usedItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>${item.price}</td>
                        <td>{item.seller?.name}</td>
                        <td>{item.condition_status}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteUsedItem(item.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>
              
              <Tab.Pane eventKey="pending-listings">
                <h2>Pending Listings</h2>
                {pendingListings.length === 0 ? (
                  <p>No listings waiting for approval</p>
                ) : (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Seller</th>
                        <th>Condition</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingListings.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td>${item.price}</td>
                          <td>{item.seller?.name}</td>
                          <td>{item.condition_status}</td>
                          <td>
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
                              onClick={() => approveListing(item.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => denyListing(item.id)}
                            >
                              Deny
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab.Pane>
              
              <Tab.Pane eventKey="categories">
                <h2>Categories</h2>
                <p>Category management coming soon...</p>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
      
      {/* Product Add/Edit Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitProductForm}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={productForm.name}
                onChange={handleProductFormChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <div className="mb-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={generateAIDescription}
                  disabled={!productForm.name || generatingDescription}
                  className="me-2"
                >
                  {generatingDescription ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-1" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-robot me-1"></i> Generate AI Description
                    </>
                  )}
                </Button>
              </div>
              
              {/* Preview of HTML content */}
              {productForm.description && (
                <div className="border rounded p-3 mb-3 bg-light">
                  <h6>Preview:</h6>
                  <HtmlRenderer htmlContent={productForm.description} />
                </div>
              )}
              
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={productForm.description}
                onChange={handleProductFormChange}
              />
            </Form.Group>
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Sale Price (optional)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="sale_price"
                    value={productForm.sale_price}
                    onChange={handleProductFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    as="select"
                    name="category_id"
                    value={productForm.category_id}
                    onChange={handleProductFormChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock_quantity"
                    value={productForm.stock_quantity}
                    onChange={handleProductFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={productForm.brand}
                    onChange={handleProductFormChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>SKU</Form.Label>
                  <Form.Control
                    type="text"
                    name="sku"
                    value={productForm.sku}
                    onChange={handleProductFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                name="image_url"
                value={productForm.image_url}
                onChange={handleProductFormChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Featured Product"
                name="featured"
                checked={productForm.featured}
                onChange={handleProductFormChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowProductModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;