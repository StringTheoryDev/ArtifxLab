import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Tab, Nav, Alert, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userListings, setUserListings] = useState([]);
  
  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const { data } = await axios.get('http://localhost:5000/api/auth/me', config);
        setName(`${data.first_name} ${data.last_name}`);
        setEmail(data.email);
        
        // Also fetch user's listings
        const { data: listings } = await axios.get('http://localhost:5000/api/used-items?user=true', config);
        setUserListings(listings);
      } catch (err) {
        setError('Failed to load profile information');
      }
    };
    
    fetchUserProfile();
  }, [navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      // Update profile logic will be implemented later
      console.log('Update profile', { name, email, password });
    }
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h1>My Profile</h1>
        </Col>
      </Row>
      <Tab.Container id="profile-tabs" defaultActiveKey="info">
        <Row>
          <Col md={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="info">Profile Info</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="listings">My Listings</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="orders">My Orders</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="info">
                {message && <Alert variant="danger">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={submitHandler}>
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit">
                    Update
                  </Button>
                </Form>
              </Tab.Pane>
              
              <Tab.Pane eventKey="listings">
                <h2>My Listings</h2>
                {userListings.length === 0 ? (
                  <div className="text-center py-4">
                    <p>You haven't created any listings yet.</p>
                    <Link to="/add-listing" className="btn btn-primary">
                      Add Your First Listing
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link to="/add-listing" className="btn btn-success mb-3">
                      + Add New Listing
                    </Link>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Price</th>
                          <th>Condition</th>
                          <th>Created</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userListings.map((listing) => (
                          <tr key={listing.id}>
                            <td>{listing.name}</td>
                            <td>${listing.price}</td>
                            <td>{listing.condition_status}</td>
                            <td>{new Date(listing.created_at).toLocaleDateString()}</td>
                            <td>
                              {listing.is_sold ? (
                                <span className="text-success">Sold</span>
                              ) : (
                                <span className="text-primary">Active</span>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => navigate(`/edit-listing/${listing.id}`)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  // Delete confirmation logic here
                                }}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}
              </Tab.Pane>
              
              <Tab.Pane eventKey="orders">
                <h2>My Orders</h2>
                <p>You have no orders yet.</p>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default ProfilePage;