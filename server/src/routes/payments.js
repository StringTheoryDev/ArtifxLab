const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51RBn6hCpIyLjSYkkUWWYOKiQTCFUiM5JVlM7ipGdThCfYg9LDbTBRt41LLh65fPI4hYlRDYercXqx2PlLC6mgi7O002ATK5RYc');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Create a payment intent (initialize payment)
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, items } = req.body;
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe works with cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        user_id: req.user.id.toString(),
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          quantity: item.qty
        })))
      }
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Payment processing error' });
  }
});

// Handle successful payment
router.post('/payment-success', auth, async (req, res) => {
  try {
    const { paymentIntentId, items } = req.body;
    
    // Here we'd normally verify the payment intent with Stripe
    // But for demo purposes, we'll just create the order
    
    // Create the order in your database
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, status, total_amount, payment_method, payment_status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'processing', items.reduce((sum, item) => sum + item.price * item.qty, 0), 'credit_card', 'paid']
    );
    
    const orderId = orderResult.insertId;
    
    // Add order items
    const orderItems = items.map(item => [
      orderId,
      item.id,
      item.qty,
      item.price
    ]);
    
    if (orderItems.length > 0) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
        [orderItems]
      );
      
      // Update product stock
      for (const item of items) {
        await pool.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.qty, item.id]
        );
      }
    }
    
    res.json({ 
      success: true, 
      orderId: orderId
    });
  } catch (error) {
    console.error('Error processing successful payment:', error);
    res.status(500).json({ message: 'Order processing error' });
  }
});

module.exports = router;