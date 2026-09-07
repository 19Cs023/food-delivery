//ts-nocheck
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { cart, removeItemFromCart, user } = useAppContext();
  const navigate = useNavigate();

  // Calculate order total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!user) {
      alert("Please sign in to complete your checkout.");
      return;
    }

    navigate('/place-order');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2 className="cart-title">Your Cart</h2>
        <p className="empty-cart">Your cart is currently empty. Start adding some delicious items!</p>
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
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;