const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.*, 
      (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.name
    `);
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(categories[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, parent_id, description, image_url } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO categories (name, parent_id, description, image_url) VALUES (?, ?, ?, ?)',
      [name, parent_id || null, description, image_url]
    );
    
    res.status(201).json({ 
      message: 'Category created',
      categoryId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, parent_id, description, image_url } = req.body;
    
    await pool.query(
      'UPDATE categories SET name = ?, parent_id = ?, description = ?, image_url = ? WHERE id = ?',
      [name, parent_id || null, description, image_url, req.params.id]
    );
    
    res.json({ message: 'Category updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;