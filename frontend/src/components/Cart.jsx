//ts-nocheck
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeItemFromCart, clearCart, user } = useAppContext();
  const [paymentStatus, setPaymentStatus] = useState('');

  // Calculate order total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!user) {
      alert("Please sign in to complete your checkout.");
      return;
    }

    setPaymentStatus('Processing payment...');

    // Assuming Stripe payload/mocking for checkout here
    // Here you would typically integrate with backend /api/orders/:userId
    try {
      // Mock hitting the auth/order route
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentStatus('Payment successful! Your order has been placed.');
      clearCart();
    } catch (error) {
       console.error('Checkout error:', error);
       setPaymentStatus('Payment failed. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2 className="cart-title">Your Cart</h2>
        {paymentStatus ? (
             <p className="empty-cart" style={{ color: 'green' }}>{paymentStatus}</p>
        ) : (
            <p className="empty-cart">Your cart is currently empty. Start adding some delicious items!</p>
        )}
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item._id} className="cart-item">
            <div className="item-details">
              <h4>{item.name}</h4>
              <p>${item.price?.toFixed(2)} x {item.quantity}</p>
            </div>
            <div className="item-actions">
              <span><strong>${(item.price * item.quantity).toFixed(2)}</strong></span>
              <button 
                className="remove-btn" 
                onClick={() => removeItemFromCart(item._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Total: ${cartTotal.toFixed(2)}</h3>
        <button 
          className="checkout-btn" 
          onClick={handleCheckout}
          disabled={paymentStatus === 'Processing payment...'}
        >
          {paymentStatus === 'Processing payment...' ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
      {paymentStatus && <p style={{ textAlign: 'center', marginTop: '10px' }}>{paymentStatus}</p>}
    </div>
  );
};

export default Cart;