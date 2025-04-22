const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); // Add this line
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Routes
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/used-items', require('./src/routes/used-items'));
app.use('/api/notifications', require('./src/routes/notifications')); // Added notifications route
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/uploads', require('./src/routes/uploads')); // Added uploads route

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Uncommented routes
// app.use('/api/orders', require('./src/routes/orders'));
// app.use('/api/cart', require('./src/routes/cart'));
// app.use('/api/reviews', require('./src/routes/reviews'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
