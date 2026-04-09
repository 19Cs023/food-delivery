import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout
import Navigation from './layout/Navigation';
import Footer from './layout/Footer';

// Components
import Hero from './components/Hero';
import SignIn from './components/SignIn';
import Register from './components/Register';
import SignOut from './components/SignOut';
import SearchResults from './components/SearchResults';
import UserAccount from './components/UserAccount';
import Dashboard from './components/Dashboard';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import PlaceOrder from './components/PlaceOrder';
import AddShop from './components/AddShop';
import AddProduct from './components/AddProduct';
import ManageProduct from './components/ManageProduct';
import ShopDetail from './components/ShopDetail';

// Pages


import './App.css';

function App() {
  return (
    <Router>
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navigation />

        <main className="main-content" style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signout" element={<SignOut />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/profile" element={<UserAccount />} />
            <Route path="/account" element={<UserAccount />} />

            {/* Food Delivery specific routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/product/:id" element={<ProductDetail />} />          <Route path="/shop/:id" element={<ShopDetail />} />            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<PlaceOrder />} />
            <Route path="/place-order" element={<PlaceOrder />} />

            {/* Shop Keeper routes */}
            <Route path="/add-shop" element={<AddShop />} />
            <Route path="/add-product/:shopId" element={<AddProduct />} />
            <Route path="/manage-product/:shopId" element={<ManageProduct />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
