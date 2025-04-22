const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { auth } = require('../middleware/auth');

// Initialize Gemini API with your API key
const genAI = new GoogleGenerativeAI('AIzaSyDFnDzuI_XtqBfiT4e43xfOaDuqDikjDnk');

// Generate product description
router.post('/generate-description', auth, async (req, res) => {
  try {
    console.log('AI Description request received:', req.body);
    const { productName } = req.body;
    
    if (!productName) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    
    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Create prompt

    const prompt = `Generate a professional, HTML-formatted product description for a music instrument e-commerce site based on the product name: "${productName}". Follow this exact structure:

1. Start with the product name enclosed in <h2> tags.

2. If the product is a guitar, add a paragraph with <p><em>~Guitar pictured is the actual guitar that you will receive~</em></p>.

3. Include 2-3 concise paragraphs (each in <p> tags) highlighting the product's key features, historical significance, and appeal. Each paragraph should be 4-5 sentences maximum.

4. End with a specifications section: <h4>Specifications:</h4> followed by a <ul> list. Each <li> should contain a specification with the label in <strong> tags (e.g., <li><strong>Model #:</strong> [value]</li>).

Tailor the specifications to the instrument type based on the product name. For example:

- Guitars: Model #, Series, Orientation, Color, Country Of Origin, Body Material, Neck Material, Fingerboard Material, Pickup Configuration, etc.

- Pianos: Model #, Number of Keys, Pedal Types, Finish, Dimensions, Weight, etc.

- Drums: Model #, Drum Sizes, Cymbal Types, Hardware, Finish, etc.

Exclude instance-specific details like serial numbers and pricing. Ensure the text content (excluding HTML tags) is under 360 words.`;
    
    console.log('Sending prompt to Gemini:', prompt);
    
    // Generate content
    const result = await model.generateContent({
      contents: [{
        parts: [{ text: prompt }]
      }]
    });
    const response = await result.response;
    const description = response.text();
    
    console.log('Generated description:', description.substring(0, 50) + '...');
    
    res.json({ description });
  } catch (error) {
    console.error('AI Description Error:', error);
    res.status(500).json({ message: 'Failed to generate description: ' + error.message });
  }
});

module.exports = router;