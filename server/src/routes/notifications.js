const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? AND seen_count < 2 ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as seen
router.put('/:id/seen', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET seen_count = seen_count + 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    res.json({ message: 'Notification updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;