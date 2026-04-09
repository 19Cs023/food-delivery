import React, { createContext, useState, useEffect, useContext } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [cart, setCart] = useState([]);

  // Auth related functions interacting with backend/routes/auth.route.js       
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Cart / Order related functions interacting with backend/routes/order.route.js
  const addItemToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((c) => c._id === item._id);
      if (existingItem) {
        return prevCart.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeItemFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = {
    user,
    token,
    cart,
    login,
    logout,
    addItemToCart,
    removeItemFromCart,
    clearCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for easier access
export const useAppContext = () => {
  return useContext(AppContext);
};
