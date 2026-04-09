import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ManageProduct = () => {
  const { user, token } = useAppContext();
  const navigate = useNavigate();
  const { shopId } = useParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [shopId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/products/by/${shopId}`);
      setProducts(res.data);
    } catch (err) {
      setErrorMsg('Could not fetch products for this shop');
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/product/${shopId}/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProducts(products.filter(p => p._id !== productId));
      } catch (err) {
        alert(err.response?.data?.error || "Failed to remove product");
      }
    }
  }

  if (!user || !user.is_shop_keeper) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You must be a shop owner to manage products.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h2>Manage Products</h2>
      <Link to="/profile" className="action-btn" style={{ marginBottom: '20px', display: 'inline-block' }}>Back to Shops</Link>
      
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p className="empty-state">No products added yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {products.map(product => (
            <div key={product._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
                <p style={{ margin: 0, color: '#666' }}>Price: ${product.price} | Stock: {product.quantity}</p>
              </div>
              <button 
                onClick={() => removeProduct(product._id)}
                style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Delete Product
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProduct;
