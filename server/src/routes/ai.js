const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { auth, adminAuth } = require('../middleware/auth');

// Initialize Gemini API with your API key
const genAI = new GoogleGenerativeAI('AIzaSyDFnDzuI_XtqBfiT4e43xfOaDuqDikjDnk');

// Generate product description
router.post('/generate-description', adminAuth, async (req, res) => {
  try {
    const { productName } = req.body;
    
    if (!productName) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    
    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt
    const prompt = `Generate a compelling product description for an e-commerce site selling musical instruments and vinyl records. The product is: "${productName}". The description should be professional, informative, and concise, highlighting key features and benefits. Maximum 150 words.`;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text();
    
    res.json({ description });
  } catch (error) {
    console.error('AI Description Error:', error);
    res.status(500).json({ message: 'Failed to generate description' });
  }
});

module.exports = router;