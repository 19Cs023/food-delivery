import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import defaultProductImage from '../assets/restaurant-logo-images-vector.jpg';
import defaultShopImage from '../assets/reatarent.avif' // Ensure you have a default image in your assets

const Dashboard = () => {
  const { addItemToCart } = useAppContext();
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

  // States
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);

  const fetchProducts = async () => {
    // Assuming default GET route for products
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchShops = async () => {
    // Assuming default GET route for shops
    try {
      const res = await fetch('http://localhost:5000/api/shops');
      const data = await res.json();
      if (Array.isArray(data)) setShops(data);
    } catch (err) {
      console.error('Failed to fetch shops', err);
    }
  };

  useEffect(() => {
    // Wrap initial fetch calls in a function to avoid lint warnings about synchronous setState
    const initData = () => {
      fetchProducts();
      fetchShops();
    };
    initData();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Main Content Area */}
      <div className="main-content">
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            All Products
          </button>
          <button
            className={`tab-btn ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => setActiveTab('shops')}
          >
            All Shops
          </button>
        </div>

        <div className="grid-view">
          {activeTab === 'products' && products.map((product, index) => (
            <div className="card" key={product._id || `prod-${index}`}>
              <h4
                style={{ cursor: 'pointer', color: '#2196F3', textDecoration: 'underline' }}
                onClick={() => navigate(`/product/${product._id}`)}
              >
                {product.name || 'Unnamed Product'}
              </h4>
              <div className="card-image">
                <img
                  className="product-image"
                  src={product.image || defaultProductImage}
                  alt={product.name || 'Product Image'}
                />
              </div>
              <p>{product.description || 'Tasty food'}</p>
              <p><strong>${product.price ? product.price.toFixed(2) : '0.00'}</strong></p>
              <button
                className="add-btn"
                onClick={() => addItemToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          ))}

          {activeTab === 'shops' && shops.map((shop, index) => (
            <div className="card" key={shop._id || `shop-${index}`}>
              <h4>{shop.name || 'Unnamed Shop'}</h4>
              <p>{shop.address || shop.description || 'Top tier restaurant'}</p>
              <div className="card-image">
                <img
                  className="shop-image"
                  src={shop.image || defaultShopImage}
                  alt={shop.name || 'Shop Image'}
                />
              </div>
              <button
                onClick={() => navigate(`/shop/${shop._id}`)}
                className="view-btn"
              >
                View Menu
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;