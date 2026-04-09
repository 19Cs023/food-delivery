import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './Navigation.css';

const Navigation = () => {
  const token = localStorage.getItem('token');
  const { cart, logout } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      navigate(`/search?q=${encodedQuery}`);
    } catch (err) {
      console.error('Error during search navigation:', err);
    }
  };

  return (
    <header className="header-container">
      <div className="logo">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>      
          <h2>Food Delivery</h2>
        </Link>
      </div>

      <form className="search-bar" onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', margin: '0 20px', flex: 1, justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search restaurants, foods..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', maxWidth: '400px' }}
        />
        <button type="submit" style={{ padding: '8px 15px', marginLeft: '8px', borderRadius: '4px', border: 'none', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      <div className="auth-buttons">
        <Link to="/dashboard" className="btn log-in">Menu & Shops</Link>
        <Link to="/cart" className="btn log-in" style={{position: 'relative'}}>
          Cart 
          {cartItemCount > 0 && (
            <span style={{
              background: 'red', color: 'white', borderRadius: '50%', 
              padding: '2px 6px', fontSize: '12px', position: 'absolute', top: '-8px', right: '-12px'
            }}>
              {cartItemCount}
            </span>
          )}
        </Link>

        {token ? (
          <>
            <Link to="/account" className="btn log-in">My Account</Link>
            <button className="btn log-in" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn log-in">Log In</Link>
            <Link to="/register" className="btn sign-in" style={{ backgroundColor: '#4CAF50' }}>Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navigation;
