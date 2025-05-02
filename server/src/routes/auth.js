const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Assuming you use the pool from db.js
const { auth } = require('../middleware/auth'); // *** ADD THIS LINE TO IMPORT AUTH MIDDLEWARE ***

// Register user
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, address, city, state, postal_code, country, phone } = req.body;

    // --- Input Validation ---
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: 'Email, password, first name, and last name are required.' });
    }
    // Add more validation as needed (e.g., password strength, email format)
    //------------------------

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user into the database
    const insertQuery = `
      INSERT INTO users (email, password, first_name, last_name, address, city, state, postal_code, country, phone, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(insertQuery, [
      email,
      hashedPassword,
      first_name,
      last_name,
      address || null,
      city || null,
      state || null,
      postal_code || null,
      country || null,
      phone || null,
      'customer' // Default role
    ]);

    const userId = result.insertId;

    // Generate JWT token
    const tokenPayload = {
      id: userId,
      email: email,
      role: 'customer' // Set role in token
    };
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET, // Ensure JWT_SECRET is in your .env
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Return token and basic user info (excluding password)
    res.status(201).json({
      token,
      user: {
        id: userId,
        email: email,
        first_name: first_name,
        last_name: last_name,
        role: 'customer',
        name: `${first_name} ${last_name}` // Convenience field
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login user
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      console.log(`Login attempt failed: Email not found - ${email}`);
      return res.status(401).json({ message: 'Invalid credentials.' }); // Use 401 for authentication failure
    }

    const user = users[0];

    // Compare provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Login attempt failed: Incorrect password for email - ${email}`);
      return res.status(401).json({ message: 'Invalid credentials.' }); // Use 401
    }

    // Passwords match, generate JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role // Include user role in the token
    };
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`Login successful for email: ${email}, Role: ${user.role}`);

    // Return token and user info (excluding password)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Get current user profile
// GET /api/auth/me (Requires authentication)
router.get('/me', auth, async (req, res) => { // 'auth' middleware is used here
  try {
    // The 'auth' middleware already verified the token and added 'req.user'
    const userId = req.user.id;
    console.log(`Fetching profile for user ID: ${userId}`);

    // Fetch user details from DB, excluding the password
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, role, address, city, state, postal_code, country, phone, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      // This shouldn't happen if the token was valid, but check anyway
      console.error(`User not found in DB despite valid token. User ID: ${userId}`);
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];
    // Add convenience 'name' field
    user.name = `${user.first_name || ''} ${user.last_name || ''}`.trim();

    res.json(user); // Return user profile data

  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error retrieving profile.' });
  }
});

// --- TODO: Add routes for password update, profile update etc. ---
// Example: PUT /api/auth/update-password (Requires authentication)
// router.put('/update-password', auth, async (req, res) => { ... });


module.exports = router;
