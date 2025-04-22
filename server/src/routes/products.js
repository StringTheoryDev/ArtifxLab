const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, c.name as category_name, 
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get product images
    const [images] = await pool.query(
      'SELECT * FROM product_images WHERE product_id = ?',
      [req.params.id]
    );
    
    // Get product attributes
    const [attributes] = await pool.query(
      'SELECT * FROM product_attributes WHERE product_id = ?',
      [req.params.id]
    );
    
    res.json({
      ...products[0],
      images,
      attributes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      sale_price, 
      category_id, 
      stock_quantity, 
      brand,
      sku,
      featured,
      attributes,
      images
    } = req.body;
    
    // Insert product
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, sale_price, category_id, stock_quantity, brand, sku, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, sale_price, category_id, stock_quantity, brand, sku, featured]
    );
    
    const productId = result.insertId;
    
    // Insert attributes if provided
    if (attributes && attributes.length > 0) {
      const attributeValues = attributes.map(attr => [
        productId,
        attr.name,
        attr.value
      ]);
      
      await pool.query(
        'INSERT INTO product_attributes (product_id, attribute_name, attribute_value) VALUES ?',
        [attributeValues]
      );
    }
    
    // Insert images if provided
    if (images && images.length > 0) {
      const imageValues = images.map((img, index) => [
        productId,
        img.url,
        index === 0 // First image is primary
      ]);
      
      await pool.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
        [imageValues]
      );
    }
    
    res.status(201).json({ 
      message: 'Product created',
      productId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      sale_price, 
      category_id, 
      stock_quantity, 
      brand,
      sku,
      featured
    } = req.body;
    
    // Update product
    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, sale_price = ?, category_id = ?, stock_quantity = ?, brand = ?, sku = ?, featured = ? WHERE id = ?',
      [name, description, price, sale_price, category_id, stock_quantity, brand, sku, featured, req.params.id]
    );
    
    res.json({ message: 'Product updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
