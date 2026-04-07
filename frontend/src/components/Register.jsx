import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setErrorMsg('');
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords don't match!");
      return;
    }
    
    try {
      // Matches userCtrl.create in backend expecting { name, email, password }
      const response = await axios.post('http://localhost:5000/api/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Backend responds with { message: "Successfully signed up!" }
      setSuccessMsg(response.data.message || 'Registration successful!');
      
      // Wait briefly so the user can see the success message, then route them to signin
      setTimeout(() => {
        navigate('/signin');
      }, 1500);

    } catch (error) {
      // Backend catches model validation errors and responds with { error: "error message" }
      setErrorMsg(error.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        
        {/* On-screen display for Backend Errors/Success instead of alerts */}
        {errorMsg && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{errorMsg}</div>}
        {successMsg && <div className="success-message" style={{ color: 'green', marginBottom: '15px' }}>{successMsg}</div>}

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            minLength="6"
          />
        </div>

        <button type="submit" className="btn-register">Sign Up</button>
        <p className="login-link">
          Already have an account? <Link to="/signin">Sign in here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;