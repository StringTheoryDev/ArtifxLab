const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'public-anonymous-key'; // Replace with your key
const supabase = createClient(supabaseUrl, supabaseKey);

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, address, city, state, postal_code, country, phone } = req.body;
    // Check if user exists
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([
        { email, password: hashedPassword, first_name, last_name, address, city, state, postal_code, country, phone }
      ]).select('*');

    if (insertError) throw insertError;

    const token = jwt.sign(
      { id: user[0].id, email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user[0].id,
        email,
        first_name,
        last_name,
        role: 'customer',
        name: `${first_name} ${last_name}`
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, address, city, state, postal_code, country, phone')
      .eq('id', req.user.id);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    user.name = `${user.first_name} ${user.last_name}`;

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
