import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Product from '../components/Product';

const ProductsPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryName, setCategoryName] = useState('All Products');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('http://localhost:5000/api/products');
        
        if (categoryId) {
          console.log('Category ID:', categoryId);
          console.log('All products:', data);
          
          // Make sure categoryId is parsed as a number for comparison
          const catId = parseInt(categoryId);
          
          // Also check for subcategories with this parent_id
          const categoriesResponse = await axios.get('http://localhost:5000/api/categories');
          const subcategoryIds = categoriesResponse.data
            .filter(cat => cat.parent_id === catId)
            .map(cat => cat.id);
          
          // Filter products by category or its subcategories
          const filteredByCategory = data.filter(product => 
            product.category_id === catId || subcategoryIds.includes(product.category_id)
          );
          
          console.log('Filtered products:', filteredByCategory);
          
          setProducts(filteredByCategory);
          setFilteredProducts(filteredByCategory);
          
          try {
            const categoryResponse = await axios.get(`http://localhost:5000/api/categories/${categoryId}`);
            setCategoryName(categoryResponse.data.name || `Category ${categoryId}`);
          } catch (err) {
            console.error('Error fetching category:', err);
            setCategoryName(`Category ${categoryId}`);
          }
        } else {
          setProducts(data);
          setFilteredProducts(data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  return (
    <Container>
      <h1 className="my-4">{categoryName}</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <Row>
          {filteredProducts.map((product) => (
            <Col key={product.id} sm={12} md={6} lg={4} xl={3} className="mb-4">
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ProductsPage;
