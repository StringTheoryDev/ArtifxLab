import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const CheckoutForm = ({ cartItems, totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [message, setMessage] = useState('');
  
  const handleInitiatePayment = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const { data } = await axios.post(
        'http://localhost:5000/api/payments/create-payment-intent',
        {
          amount: totalPrice,
          items: cartItems
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setClientSecret(data.clientSecret);
      setMessage('Payment initialized. Please enter your card details.');
      setProcessing(false);
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError('Payment initiation failed: ' + (err.response?.data?.message || 'Please try again.'));
      setProcessing(false);
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    const cardElement = elements.getElement(CardElement);
    
    setProcessing(true);
    setError(null);
    
    try {
      // For testing purposes, let's simulate success without actual Stripe payment
      // In a real implementation, you would use the code below:
      /*
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name',
          },
        }
      });
      
      if (error) {
        setError(`Payment failed: ${error.message}`);
        setProcessing(false);
        return;
      }
      */
      
      // Simulated success
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/payments/payment-success',
        {
          paymentIntentId: 'pi_simulated_success',
          items: cartItems
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Clear cart and redirect
      onSuccess('pi_simulated_success');
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment processing error: ' + (err.response?.data?.message || 'Please try again.'));
    }
    
    setProcessing(false);
  };
  
  return (
    <div>
      {message && <Alert variant="info">{message}</Alert>}
      
      {!clientSecret ? (
        <div className="text-center my-4">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleInitiatePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <Spinner as="span" animation="border" size="sm" /> Initializing Payment...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </div>
      ) : (
        <Form onSubmit={handleSubmit} className="mt-4">
          <Form.Group className="mb-4">
            <Form.Label>Credit or debit card</Form.Label>
            <div className="p-3 border rounded bg-light">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
            <small className="text-muted">
              For testing, use card number: 4242 4242 4242 4242, any future expiration date, any 3 digits for CVC, and any postal code.
            </small>
          </Form.Group>
          
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
          
          <div className="d-flex justify-content-between mt-4">
            <h4>Total: ${totalPrice.toFixed(2)}</h4>
            <Button 
              type="submit" 
              variant="success" 
              size="lg"
              disabled={!stripe || processing}
            >
              {processing ? (
                <>
                  <Spinner as="span" animation="border" size="sm" /> Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default CheckoutForm;