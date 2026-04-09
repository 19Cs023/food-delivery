//ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItemToCart } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await res.json();
        
        if (res.ok) {
          setProduct(data);
        } else {
          setError(data.error || 'Product not found');
        }
      } catch (err) {
        console.error("Fetch Product Error:", err);
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // Adding product directly to the global cart
      addItemToCart(product);
      alert(`${product.name} added to cart!`);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
        <h3>{error || 'Product not found!'}</h3>
        <button onClick={() => navigate('/dashboard')} className="back-btn" style={{ marginTop: '20px' }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-image">
        {/* Grabbing image directly from backend image routing utilizing product id */}
        <img 
          src={`http://localhost:5000/api/product/image/${product._id}`} 
          alt={product.name} 
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available' }} // Fallback image
        />
      </div>
      <div className="product-info">
        <h2>{product.name}</h2>
        <h4 className="price">${product.price?.toFixed(2)}</h4>
        
        <p className="category"><strong>Category:</strong> {product.category}</p>
        <p className="shop-name"><strong>Shop:</strong> {product.shop?.name || 'Independent'}</p>
        
        <p className="description">{product.description}</p>
        
        <p className="stock">
          Status: <span style={{ color: product.quantity > 0 ? 'green' : 'red' }}>
            {product.quantity > 0 ? `In Stock (${product.quantity} available)` : 'Out of stock'}
          </span>
        </p>
        
        <button 
          className="add-to-cart-btn" 
          disabled={product.quantity <= 0}
          onClick={handleAddToCart}
        >
          {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
        
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;