import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
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
          <h2>Tech Articles</h2>
        </Link>
      </div>

      <form className="search-bar" onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', margin: '0 20px', flex: 1, justifyContent: 'center' }}>
        <input 
          type="text" 
          placeholder="Search articles..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', maxWidth: '400px' }}
        />
        <button type="submit" style={{ padding: '8px 15px', marginLeft: '8px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      <div className="auth-buttons">
        {token ? (
          <>
            <Link to="/dashboard" className="btn log-in">Dashboard</Link>
            <Link to="/details" className="btn log-in">Categories</Link>
            <Link to="/profile" className="btn log-in">Profile</Link>
            <button className="btn sign-in" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn log-in">Log In</Link>
            <Link to="/register" className="btn sign-in">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navigation;
