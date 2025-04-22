const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Get all used items
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT ui.*, u.first_name, u.last_name, c.name as category_name
      FROM used_items ui
      JOIN users u ON ui.user_id = u.id
      LEFT JOIN categories c ON ui.category_id = c.id
      WHERE 
    `;
    
    // If user parameter is true and user is authenticated, return their listings
    if (req.query.user === 'true' && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        query += ` ui.user_id = ${decoded.id}`;
      } catch (err) {
        console.error('Token verification failed:', err);
        query += ` ui.approval_status = 'approved' AND ui.is_sold = FALSE`;
      }
    } else if (req.query.pending === 'true' && req.headers.authorization) {
      // Return pending listings for admin approval
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role === 'admin') {
          query += ` ui.approval_status = 'pending'`;
        } else {
          query += ` ui.approval_status = 'approved' AND ui.is_sold = FALSE`;
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        query += ` ui.approval_status = 'approved' AND ui.is_sold = FALSE`;
      }
    } else {
      // Regular listing view - only show approved, not sold items
      query += ` ui.approval_status = 'approved' AND ui.is_sold = FALSE`;
    }
    
    query += ` ORDER BY ui.created_at DESC`;
    
    const [items] = await pool.query(query);
    
    // Format the data for the frontend
    const formattedItems = items.map(item => ({
      ...item,
      seller: {
        id: item.user_id,
        name: `${item.first_name} ${item.last_name}`
      }
    }));
    
    res.json(formattedItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a listing (admin only)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Update the listing status
    await pool.query(
      'UPDATE used_items SET approval_status = ? WHERE id = ?',
      ['approved', req.params.id]
    );
    
    res.json({ message: 'Listing approved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deny a listing (admin only)
router.put('/:id/deny', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { reason } = req.body;
    
    // Get the listing to find the owner
    const [items] = await pool.query(
      'SELECT * FROM used_items WHERE id = ?',
      [req.params.id]
    );
    
    if (items.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const userId = items[0].user_id;
    const itemName = items[0].name;
    
    // Update the listing status
    await pool.query(
      'UPDATE used_items SET approval_status = ?, denial_reason = ? WHERE id = ?',
      ['denied', reason || null, req.params.id]
    );
    
    // Create notification for the user
    const notificationMessage = `Your listing "${itemName}" was not approved.${reason ? ` Reason: ${reason}` : ''}`;
    
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [userId, notificationMessage]
    );
    
    res.json({ message: 'Listing denied and notification sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get used item by ID
router.get('/:id', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT ui.*, u.first_name, u.last_name, c.name as category_name
      FROM used_items ui
      JOIN users u ON ui.user_id = u.id
      LEFT JOIN categories c ON ui.category_id = c.id
      WHERE ui.id = ?
    `, [req.params.id]);
    
    if (items.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const item = items[0];
    
    res.json({
      ...item,
      seller: {
        id: item.user_id,
        name: `${item.first_name} ${item.last_name}`
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new used item listing (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const { name, category_id, price, condition_status, description, image_url } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO used_items (user_id, name, category_id, price, condition_status, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, category_id, price, condition_status, description, image_url]
    );
    
    res.status(201).json({ 
      message: 'Item listing created',
      itemId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a used item listing (requires authentication and ownership)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if the user owns this listing
    const [items] = await pool.query(
      'SELECT * FROM used_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (items.length === 0) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }
    
    const { name, category_id, price, condition_status, description, image_url, is_sold } = req.body;
    
    await pool.query(
      'UPDATE used_items SET name = ?, category_id = ?, price = ?, condition_status = ?, description = ?, image_url = ?, is_sold = ? WHERE id = ?',
      [name, category_id, price, condition_status, description, image_url, is_sold, req.params.id]
    );
    
    res.json({ message: 'Item listing updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a used item listing (requires authentication and ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if the user owns this listing
    const [items] = await pool.query(
      'SELECT * FROM used_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (items.length === 0) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    
    await pool.query('DELETE FROM used_items WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Item listing deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;