import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  
  // In a real app, this would come from a user authentication context
  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;
  
  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };
  
  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect className="py-3">
        <Container>
          <Navbar.Brand as={Link} to="/">ArtiFx</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavDropdown title="Shop" id="shop-dropdown">
                <NavDropdown.Item as={Link} to="/products">All Products</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Header>Instruments</NavDropdown.Header>
                <NavDropdown.Item as={Link} to="/products/category/1">Guitars</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/products/category/2">Drums & Percussion</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/products/category/3">Keyboards</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Header>Records</NavDropdown.Header>
                <NavDropdown.Item as={Link} to="/products/category/4">Vinyl Records</NavDropdown.Item>
              </NavDropdown>
              
              <Nav.Link as={Link} to="/used-items">Used Items</Nav.Link>
              <Nav.Link as={Link} to="/about">About Us</Nav.Link>
            </Nav>
            
            <Nav>
              <Nav.Link as={Link} to="/cart">
                <i className="fas fa-shopping-cart"></i> Cart
                {cartItems.length > 0 && (
                  <Badge pill bg="success" className="ms-1">
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </Badge>
                )}
              </Nav.Link>
              
              {userInfo ? (
                <NavDropdown title={userInfo.name || userInfo.email} id="username">
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  {userInfo.role === 'admin' && (
                    <NavDropdown.Item as={Link} to="/admin">Admin Dashboard</NavDropdown.Item>
                  )}
                  <NavDropdown.Item as={Link} to="/add-listing">Add Listing</NavDropdown.Item>
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link} to="/login">
                  <i className="fas fa-user"></i> Sign In
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;