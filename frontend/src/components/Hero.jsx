import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

function Hero() {
  return (
    <section className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title">Delicious Food, Delivered Faster</h1>       
        <p className="hero-subtitle">
          Craving your favorite meal? Order from top local restaurants and get it delivered 
          hot and fresh right to your doorstep. Eat great today!
        </p>
        <div className="hero-buttons">
          <Link to="/dashboard" className="btn-primary" style={{ backgroundColor: '#4CAF50', border: 'none' }}>Order Now</Link>
          <Link to="/register" className="btn-secondary">Sign Up</Link>
        </div>
      </div>
      <div className="hero-image">
        <img 
          src="/hero.png" 
          alt="Food Delivery Hero" 
          style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }} 
        />
      </div>
    </section>
  );
}

export default Hero;
