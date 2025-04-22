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
    const prompt = `Generate a professional product description for a music instrument e-commerce site based on the product name: "${productName}".

Follow this exact structure without adding code backticks or markdown formatting:

<h2>${productName}</h2>

${productName.toLowerCase().includes('guitar') ? '<p class="note">~Guitar pictured is the actual guitar that you will receive~</p>' : ''}

<p>[First paragraph highlighting the product's key features and historical significance. 3-4 sentences maximum.]</p>

<p>[Second paragraph describing sound characteristics and appeal to musicians. 3-4 sentences maximum.]</p>

<h3>Product specs</h3>
<table class="specs-table">
  <tr>
    <td class="spec-name">Condition</td>
    <td class="spec-value">Brand New (New)</td>
  </tr>
  <tr>
    <td class="spec-name">Brand</td>
    <td class="spec-value">[Extract brand from product name]</td>
  </tr>
  [Additional specification rows based on product type]
</table>

Tailor the specifications to the instrument type. Include all relevant specifications in rows like the example above. For guitars, include: Model, Finish, Categories, Year, Made In, Pickup Configuration, Series, Right/Left Handed, Fretboard Material, Number of Strings, etc.

Do NOT include code formatting, backticks, or markdown. Provide ONLY the HTML that will be directly inserted into the page. Keep the total text content under 350 words.`;
    
    console.log('Sending prompt to Gemini:', prompt);
    
    // Generate content
    const result = await model.generateContent({
      contents: [{
        parts: [{ text: prompt }]
      }]
    });
    const response = await result.response;
    let description = response.text();
    
    // Strip any markdown code blocks if they exist
    description = description.replace(/```html|```/g, '').trim();
    
    console.log('Generated description:', description.substring(0, 50) + '...');
    
    res.json({ description });
  } catch (error) {
    console.error('AI Description Error:', error);
    res.status(500).json({ message: 'Failed to generate description: ' + error.message });
  }
});

module.exports = router;