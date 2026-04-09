import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './PlaceOrder.css';

const PlaceOrder = () => {
  const { cart, user, token, clearCart } = useAppContext();
  const navigate = useNavigate();
  
  // Checkout Fields
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState(user ? user.name : '');
  const [customerEmail, setCustomerEmail] = useState(user ? user.email : '');
  
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper calculation
  const cartTotal = cart.reduce((tot, item) => tot + (item.price * item.quantity), 0);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be signed in to place an order.');
      navigate('/signin');
      return;
    }

    if (!address.trim()) {
      alert('Please provide a delivery address.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('Processing your order securely...');

    try {
      // 1. Format the items array precisely for the backend
      // order.controller.js and product.controller.js expect "products" -> [{ product: { _id }, quantity: 1, shop: "shopId" }]
      const orderProducts = cart.map(item => ({
        product: item._id, // Matches product._id
        quantity: item.quantity,
        shop: item.shop?._id || item.shop // Ensures orders can be tracked by shop
      }));

      // 2. Prepare payload according to backend constraints
      const payload = {
        order: {
          products: orderProducts,
          customer_name: customerName,
          customer_email: customerEmail,
          delivery_address: {
            street: address,
          },
          total_price: cartTotal
        },
        token: "tok_visa" // Hardcoded test mocked Stripe token. Would come from react-stripe-elements normally.
      };

      // 3. Post to the backend controller
      const response = await fetch(`http://localhost:5000/api/orders/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to place the order.');
      }
      
      // 4. Handle success gracefully
      setPaymentStatus('Order placed successfully! Redirecting...');
      clearCart();
      setTimeout(() => {
        navigate('/dashboard'); // Route user back to dashboard or their "My Orders" tab
      }, 2500);

    } catch (err) {
      setPaymentStatus(`Payment failed: ${err.message}`);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="place-order-container">
        <h2>Your cart is empty!</h2>
        <button className="btn-place-order" onClick={() => navigate('/dashboard')}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="place-order-container">
      <h2>Complete Your Order</h2>
      
      <div className="order-summary">
        <h3>Order Summary</h3>
        {cart.map((item, idx) => (
          <div key={idx} className="order-summary-item">
            <span>{item.quantity}x {item.name}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="order-total">
          Total to Pay: ${cartTotal.toFixed(2)}
        </div>
      </div>

      <form className="order-form" onSubmit={handleOrderSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            value={customerName} 
            onChange={(e) => setCustomerName(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            value={customerEmail} 
            onChange={(e) => setCustomerEmail(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Delivery Address</label>
          <textarea 
            placeholder="Enter your complete delivery address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)} 
            required 
          />
        </div>

        <button 
          type="submit" 
          className="btn-place-order"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing Securely...' : `Pay $${cartTotal.toFixed(2)} & Order`}
        </button>

        {paymentStatus && (
          <p className="payment-status" style={{ color: paymentStatus.includes('failed') ? 'red' : 'green' }}>
            {paymentStatus}
          </p>
        )}
      </form>
    </div>
  );
};

export default PlaceOrder;