const express = require('express');
const router = express.Router();

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'public-anonymous-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*, (select count(*) from products where category_id = categories.id) as product_count')
      .order('name');

    if (error) throw error;
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, parent_id, description, image_url } = req.body;

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert([{ name, parent_id: parent_id || null, description, image_url }])
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Category created', categoryId: newCategory.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, parent_id, description, image_url } = req.body;

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({ name, parent_id: parent_id || null, description, image_url })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Category updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
