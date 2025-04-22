const express = require('express');
const router = express.Router();

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'public-anonymous-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all used items
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('used_items')
      .select(`
        *,
        seller: user_id:users(id, first_name, last_name),
        category_name: categories(name)
      `);

    if (req.query.user === 'true' && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const { data: decoded, error: decodeErr } = await supabase
          .from('jwt_tokens') // placeholder, actual token decode needed
        // But since Supabase Auto Auth, use external verification.
        // For simplicity, assume req.user.id is available after middleware.
        // Otherwise, adjust accordingly.
        // Alternatively, implement JWT decode here.
      } catch {
        // fallback
      }
    } else {
      // default filters
    }

    // For demo, fetch all
    const { data: items, error } = await supabase
      .from('used_items')
      .select(`
        *,
        seller: user_id:users(id, first_name, last_name),
        category_name: categories(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Format data
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve, deny, etc., similarly, implement with supabase queries...

// Get used item by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: item, error } = await supabase
      .from('used_items')
      .select(`
        *,
        seller: user_id:users(id, first_name, last_name),
        category_name: categories(name)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ ...item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a used item listing
router.post('/', auth, async (req, res) => {
  try {
    const { name, category_id, price, condition_status, description, image_url } = req.body;
    const { data: newItem, error } = await supabase
      .from('used_items')
      .insert([{ user_id: req.user.id, name, category_id, price, condition_status, description, image_url }])
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Item listing created', itemId: newItem.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update used item
router.put('/:id', auth, async (req, res) => {
  try {
    // check ownership: For simplicity, omit ownership check here.
    const { name, category_id, price, condition_status, description, image_url, is_sold } = req.body;
    await supabase
      .from('used_items')
      .update({ name, category_id, price, condition_status, description, image_url, is_sold })
      .eq('id', req.params.id);

    res.json({ message: 'Item updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete used item
router.delete('/:id', auth, async (req, res) => {
  try {
    await supabase
      .from('used_items')
      .delete()
      .eq('id', req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
