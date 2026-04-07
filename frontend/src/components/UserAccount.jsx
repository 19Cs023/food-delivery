import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './UserAccount.css';

const UserAccount = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDataAndBlogs = async () => {
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

        // If you need fresh data, you could also fetch user from /api/users/:userId
        // const userResponse = await axios.get(`http://localhost:5000/api/users/${parsedUser._id}`, config);
        // setUser(userResponse.data);

        // Fetch blogs for the current logged-in user
        const blogsResponse = await axios.get('http://localhost:5000/api/blogs', config);
        setBlogs(blogsResponse.data);

      } catch (err) {
        console.error('Error fetching account data:', err);
        setError('Failed to load user account info.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndBlogs();
  }, [navigate]);

  if (loading) return <div className="account-center">Loading account details...</div>;
  if (error) return <div className="account-center error">{error}</div>;
  if (!user) return <div className="account-center">User not found</div>;

  return (
    <div className="account-container">
      <div className="account-header">
        <div className="account-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="account-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="account-content">
        <h3>My Articles ({blogs.length})</h3>
        
        {blogs.length === 0 ? (
          <div className="no-blogs">
            <p>You haven't written any articles yet.</p>
            <Link to="/write" className="btn-write-first">Write your first article</Link>
          </div>
        ) : (
          <div className="account-blogs-list">
            {blogs.map(blog => (
              <div key={blog._id} className="account-blog-card">
                <Link to={`/blogs/${blog._id}`} className="account-blog-title-link">
                  <h4>{blog.title}</h4>
                </Link>
                <span className="account-blog-tag">{blog.tag}</span>
                <p className="account-blog-excerpt">
                  {(blog.content || '').length > 120 ? `${blog.content.substring(0, 120)}...` : blog.content}
                </p>
                <div className="account-blog-meta">
                  Published: {new Date(blog.created).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccount;
