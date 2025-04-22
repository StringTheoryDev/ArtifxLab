const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { auth } = require('../middleware/auth');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'public-anonymous-key'; // Replace with your key
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini API with your API key
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyDFnDzuI_XtqBfiT4e43xfOaDuqDikjDnk');

// Generate product description
router.post('/generate-description', auth, async (req, res) => {
  try {
    console.log('AI Description request received:', req.body);
    const { productName } = req.body;
    
    if (!productName) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Generate a professional product description for a music instrument e-commerce site based on the product name: "${productName}". ...`; // truncated for brevity
    
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }]
    });
    const response = await result.response;
    let description = response.text();
    description = description.replace(/```html|```/g, '').trim();

    res.json({ description });
  } catch (error) => {
    console.error('AI Description Error:', error);
    res.status(500).json({ message: 'Failed to generate description: ' + error.message });
  }
});

module.exports = router;
