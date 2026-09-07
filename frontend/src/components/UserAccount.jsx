import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './UserAccount.css';

const UserAccount = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
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
        if (!parsedUser?._id) {
          throw new Error('Saved user information is invalid.');
        }
        setUser(parsedUser);

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        let accountUser = parsedUser;
        try {
          const userResponse = await axios.get(`http://localhost:5000/api/users/${parsedUser._id}`, config);
          accountUser = userResponse.data;
          setUser(accountUser);
        } catch (profileError) {
          console.error('Error refreshing user profile:', profileError);
        }

        const requests = [
          axios.get(`http://localhost:5000/api/orders/user/${parsedUser._id}`, config)
        ];

        if (accountUser.is_shop_keeper) {
          requests.push(axios.get(`http://localhost:5000/api/shops/by/${parsedUser._id}`, config));
        }

        const [ordersResult, shopsResult] = await Promise.allSettled(requests);
        if (ordersResult.status === 'fulfilled') {
          setOrders(Array.isArray(ordersResult.value.data) ? ordersResult.value.data : []);
        } else {
          console.error('Error fetching user orders:', ordersResult.reason);
        }
        if (shopsResult?.status === 'fulfilled') {
          const loadedShops = Array.isArray(shopsResult.value.data) ? shopsResult.value.data : [];
          setShops(loadedShops);

          const shopOrderResults = await Promise.allSettled(
            loadedShops.map((shop) => axios.get(`http://localhost:5000/api/orders/shop/${shop._id}`, config))
          );
          setShopOrders(shopOrderResults.flatMap((result, index) => (
            result.status === 'fulfilled' && Array.isArray(result.value.data)
              ? result.value.data.map((order) => ({ ...order, shopId: loadedShops[index]._id }))
              : []
          )));
        } else if (shopsResult) {
          console.error('Error fetching user shops:', shopsResult.reason);
        }

      } catch (err) {
        console.error('Error fetching account data:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        setError(err.response?.data?.error || err.message || 'Failed to load user account info.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const updateOrderStatus = async (shopId, cartItemId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/order/status/${shopId}`,
        { cartItemId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrder = response.data;
      setOrders((currentOrders) => currentOrders.map((order) => (
        order._id === updatedOrder._id ? updatedOrder : order
      )));
      setShopOrders((currentOrders) => currentOrders.map((order) => (
        order._id === updatedOrder._id ? { ...updatedOrder, shopId } : order
      )));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order status.');
    }
  };

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
                  <p>Date: {new Date(order.created).toLocaleDateString()}</p>
                  <p>Items: {order.products?.reduce((total, item) => total + (item.quantity || 0), 0) || 0}</p>
                  <p>Status: <span className="status-badge">{order.products?.[0]?.status || 'Not processed'}</span></p>
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
                  {shopOrders
                    .filter(order => order.shopId === shop._id)
                    .map(order => (
                      <div key={order._id} className="order-card">
                        <h4>Order #{order._id.substring(0, 8)}</h4>
                        {order.products
                          .filter(item => String(item.shop) === String(shop._id))
                          .map(item => (
                            <label key={item._id} style={{ display: 'block', marginBottom: '8px' }}>
                              Product status:
                              <select
                                value={item.status}
                                onChange={(event) => updateOrderStatus(shop._id, item._id, event.target.value)}
                                style={{ marginLeft: '8px' }}
                              >
                                {['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </label>
                          ))}
                      </div>
                    ))}
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
