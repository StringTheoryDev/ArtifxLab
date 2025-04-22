const express = require('express');
const router = express.Router();

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'public-anonymous-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all products
router.get('/', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category_name: categories(name),
        primary_image: product_images!inner(image_url)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category_name: categories(name),
        images: product_images,
        attributes: product_attributes
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, sale_price, category_id, stock_quantity, brand, sku, featured, attributes, images, image_url } = req.body;

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([{ name, description, price, sale_price, category_id, stock_quantity, brand, sku, featured }])
      .single();

    if (error) throw error;
    const productId = newProduct.id;

    // Handle images
    if (image_url) {
      await supabase
        .from('product_images')
        .insert([{ product_id: productId, image_url, is_primary: true }]);
    } else if (images && images.length > 0) {
      const imageValues = images.map((img, index) => ({
        product_id: productId,
        image_url: img.url,
        is_primary: index === 0,
      }));
      await supabase.from('product_images').insert(imageValues);
    }

    res.status(201).json({ message: 'Product created', productId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, sale_price, category_id, stock_quantity, brand, sku, featured, image_url } = req.body;
    // Update product
    await supabase
      .from('products')
      .update({ name, description, price, sale_price, category_id, stock_quantity, brand, sku, featured })
      .eq('id', req.params.id);

    if (image_url) {
      // Update or insert primary image
      const { data: existingImages } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', req.params.id)
        .eq('is_primary', true);

      if (existingImages.length > 0) {
        await supabase
          .from('product_images')
          .update({ image_url })
          .eq('product_id', req.params.id)
          .eq('is_primary', true);
      } else {
        await supabase
          .from('product_images')
          .insert([{ product_id: req.params.id, image_url, is_primary: true }]);
      }
    }

    res.json({ message: 'Product updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
