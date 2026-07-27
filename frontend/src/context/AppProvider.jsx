import React, { useState, useEffect } from 'react';
import { AppContext } from './AppContext';

const safeParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error(`Failed to parse localStorage key "${key}":`, err);
    return null;
  }
};

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => safeParse('user'));
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [cart, setCart] = useState(() => safeParse('cart') || []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  };

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
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item._id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const deleteItemFromCart = (itemId) => {
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
    deleteItemFromCart,
    clearCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;