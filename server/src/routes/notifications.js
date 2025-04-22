const express = require('express');
const router = express.Router();

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'public-anonymous-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .lt('seen_count', 2)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as seen
router.put('/:id/seen', async (req, res) => {
  try {
    const { error } }= await supabase
      .from('notifications')
      .update({ seen_count: 'seen_count' + 1 }) // Error: in Supabase, we need to increment properly
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
      
    if (error) throw error;
    res.json({ message: 'Notification updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
