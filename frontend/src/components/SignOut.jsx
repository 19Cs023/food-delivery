import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignOut.css';

const SignOut = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignOut = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Backend authCtrl.signout returns { message: "signed out" } and clears the "t" cookie
      await axios.get('http://localhost:5000/api/auth/signout');
      
      // Clear localStorage matching what was stored in SignIn
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Successfully signed out, navigate to signin route avoiding full reloads
      navigate('/signin');

    } catch (err) {
      console.error('Error from server during signout', err);
      // In case something fails at the network level
      setErrorMsg('Could not sign out properly. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigates securely back without leaving React Router context if possible
    navigate(-1);
  };

  // Get current user name to personalize prompt if available
  const getUsername = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.name;
      } catch {
        return null;
      }
    }
    return null;
  };

  const userName = getUsername();

  return (
    <div className="signout-container">
      <div className="signout-card">
        <h2>Sign Out</h2>
        <p>
          {userName ? `Are you sure you want to sign out, ${userName}?` : 'Are you sure you want to sign out?'}
        </p>
        
        {errorMsg && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{errorMsg}</div>}

        <div className="signout-actions">
          <button 
            className="btn-cancel" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleSignOut}
            disabled={loading}
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOut;