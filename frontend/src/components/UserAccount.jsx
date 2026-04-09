import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './UserAccount.css';

const UserAccount = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        navigate('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // Fetch orders
        const ordersResponse = await axios.get(`http://localhost:5000/api/orders/user/${parsedUser._id}`, config);
        setOrders(ordersResponse.data);

        // If shop keeper, fetch shops
        if (parsedUser.is_shop_keeper) {
          const shopsResponse = await axios.get(`http://localhost:5000/api/shops/by/${parsedUser._id}`, config);
          setShops(shopsResponse.data);
        }

      } catch (err) {
        console.error('Error fetching account data:', err);
        setError('Failed to load user account info.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) return <div className="empty-state">Loading account details...</div>;
  if (error) return <div className="empty-state">{error}</div>;
  if (!user) return <div className="empty-state">User not found</div>;

  return (
    <div className="user-account-container">
      <div className="profile-header">
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p>Role: {user.is_shop_keeper ? 'Shop Keeper' : 'Customer'}</p>
        </div>
      </div>

      <div className="account-tabs">
        <button 
          className={`account-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          My Orders
        </button>
        {user.is_shop_keeper && (
          <button 
            className={`account-tab ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => setActiveTab('shops')}
          >
            My Shops
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'orders' && (
          <div>
            <h3>Order History</h3>
            {orders.length === 0 ? (
              <div className="empty-state">You have no orders yet.</div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="order-card">
                  <h4>Order #{order._id.substring(0, 8)}</h4>
                  <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p>Total: ${order.totalAmount}</p>
                  <p>Status: <span className="status-badge">{order.status}</span></p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'shops' && user.is_shop_keeper && (
          <div>
            <h3>My Shops</h3>
            <Link to="/add-shop" className="action-btn">Add New Shop</Link>
            {shops.length === 0 ? (
              <div className="empty-state">You haven't created any shops yet.</div>
            ) : (
              shops.map(shop => (
                <div key={shop._id} className="shop-card">
                  <h4>{shop.name}</h4>
                  <p>{shop.address}</p>
                  <Link to={`/add-product/${shop._id}`} className="action-btn" style={{backgroundColor: '#4CAF50'}}>Add Product</Link>
                  <Link to={`/manage-product/${shop._id}`} className="action-btn">Manage Products</Link>                    <button 
                      onClick={() => {
                        const currentToken = localStorage.getItem('token');
                        if(window.confirm('Are you sure you want to delete this shop?')) {
                          fetch(`http://localhost:5000/api/shops/${shop._id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${currentToken}`
                            }
                          }).then(res => res.json()).then(() => {
                            setShops(shops.filter(s => s._id !== shop._id));
                          })
                        }
                      }} 
                      className="action-btn" 
                      style={{backgroundColor: '#f44336', marginLeft: '10px'}}
                    >
                      Delete Shop
                    </button>                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccount;
