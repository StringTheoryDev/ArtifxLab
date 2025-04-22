import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddListingPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Excellent');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // In a real app, we would check if user is logged in here
  const isLoggedIn = localStorage.getItem('userInfo') ? true : false;

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/categories');
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    
    setUploadLoading(true);
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    try {
      // In a real implementation, you would send the file to a server endpoint
      // For demo purposes, we'll simulate an upload and return a fake URL
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a fake URL that would normally come from the server response
      const fakeUploadedUrl = URL.createObjectURL(selectedFile);
      
      setUploadLoading(false);
      setImage(fakeUploadedUrl);
      
      return fakeUploadedUrl;
    } catch (err) {
      setUploadLoading(false);
      setError('Failed to upload image. Please try again.');
      return null;
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Upload image if selected
      let imageUrl = image;
      if (selectedFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          setIsLoading(false);
          return;
        }
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to add a listing');
        setIsLoading(false);
        return;
      }
      
      // Send request to add listing
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      
      const listingData = {
        name,
        category_id: category,
        price,
        condition_status: condition,
        description,
        image_url: imageUrl
      };
      
      const { data } = await axios.post(
        'http://localhost:5000/api/used-items',
        listingData,
        config
      );
      
      setIsLoading(false);
      setMessage('Your listing has been successfully added!');
      
      // Reset form
      setName('');
      setCategory('');
      setPrice('');
      setCondition('Excellent');
      setDescription('');
      setImage('');
      setImagePreview(null);
      setSelectedFile(null);
      
      // After a delay, redirect to used items page
      setTimeout(() => {
        navigate('/used-items');
      }, 2000);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Error adding listing. Please try again.'
      );
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Container className="py-5 text-center">
        <h2>You need to be logged in to add a listing</h2>
        <Button className="mt-3" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-md-center my-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h1 className="mb-4">Add Your Listing</h1>
              
              {error && (
                <Alert variant="danger">{error}</Alert>
              )}
              
              {message && (
                <Alert variant="success">{message}</Alert>
              )}
              
              <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter item name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="category">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    as="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="price">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="condition">
                  <Form.Label>Condition</Form.Label>
                  <Form.Control
                    as="select"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    required
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </Form.Control>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Describe your item (include details like age, any damage, etc.)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Item Image</Form.Label>
                  <div className="d-flex align-items-end mb-3">
                    <div className="flex-grow-1 me-3">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mb-0"
                      />
                    </div>
                    {selectedFile && !image && (
                      <Button
                        variant="outline-primary"
                        onClick={uploadImage}
                        disabled={uploadLoading}
                      >
                        {uploadLoading ? 'Uploading...' : 'Upload'}
                      </Button>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <div className="mt-2 text-center border rounded p-3 bg-light">
                      <p className="mb-2">Image Preview:</p>
                      <Image 
                        src={imagePreview} 
                        alt="Preview" 
                        fluid 
                        style={{ maxHeight: '200px' }} 
                      />
                    </div>
                  )}
                  
                  <Form.Text className="text-muted">
                    Upload a clear photo of your item. JPG, PNG or GIF formats accepted.
                  </Form.Text>
                </Form.Group>
                
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding Listing...' : 'Add Listing'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddListingPage;