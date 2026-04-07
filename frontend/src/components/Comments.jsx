import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Comments.css';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/comments');
      setComments(response.data);
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setNewComment({ ...newComment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Create auth object depending on login state
      const token = localStorage.getItem('token');
      
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      await axios.post('http://localhost:5000/api/comments', newComment, config);
      
      // Try fetching fresh data to get the populated recorded_by fields
      fetchComments();
      setNewComment({ title: '', content: '' });
      
    } catch (err) {
      setError('Failed to post comment. Ensure you are signed in.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="comments-section">
      <h3>Comments</h3>
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit} className="comment-form">
        <input 
          type="text" 
          name="title" 
          placeholder="Comment Title" 
          value={newComment.title} 
          onChange={handleChange} 
          required 
        />
        <textarea 
          name="content" 
          placeholder="Write your comment..." 
          value={newComment.content} 
          onChange={handleChange} 
          required 
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <h4>{comment.title}</h4>
            <p>{comment.content}</p>
            <small>
              By {comment.recorded_by?.name || 'Anonymous'} on {new Date(comment.created).toLocaleDateString()}
            </small>
          </div>
        ))}
        {comments.length === 0 && <p>No comments yet. Be the first to comment!</p>}
      </div>
    </div>
  );
};

export default Comments;
