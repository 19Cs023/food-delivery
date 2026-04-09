import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { addItemToCart, user, token } = useAppContext();
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();
  
  // States
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

 
  const fetchProducts = async () => {
    // Assuming default GET route for products
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if(Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchShops = async () => {
    // Assuming default GET route for shops
    try {
      const res = await fetch('http://localhost:5000/api/shops');
      const data = await res.json();
      if(Array.isArray(data)) setShops(data);
    } catch (err) {
      console.error('Failed to fetch shops', err);
    }
  };

  const fetchComments = async () => {
    // Assuming default GET route for comments
    try {
      const res = await fetch('http://localhost:5000/api/comments');
      const data = await res.json();
      if(Array.isArray(data)) setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  };

  const handlePostComment = async () => {
    if (!user || !token) {
      alert('Please log in to post a comment');
      return;
    }
    if (!newComment.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Dashboard Comment',
          content: newComment,
          incurred_on: new Date()
        })
      });
      const data = await res.json();
      if(data) {
        setNewComment('');
        fetchComments(); // Refresh comment list
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  useEffect(() => {
    // Wrap initial fetch calls in a function to avoid lint warnings about synchronous setState 
    const initData = () => {
      fetchProducts();
      fetchShops();
      fetchComments();
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
               <button onClick={() => window.location.href = `/shop/${shop._id}`} className="view-btn">View Menu</button>
             </div>
          ))}
        </div>
      </div>

      {/* Side Panel for Comments */}
      <div className="side-panel">
        <h3>Community Comments</h3>
        <div className="comments-list">
          {comments.map((c, i) => (
             <div className="comment-item" key={c._id || i}>
               <strong>{c.recorded_by?.name || 'Anonymous'}</strong>
               <span>{c.content || '...'}</span>
             </div>
          ))}
        </div>
        <div className="comment-input-area">
          <textarea 
            placeholder="Share your thoughts..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="comment-btn" onClick={handlePostComment}>
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;