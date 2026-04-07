import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setBlogs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/search?searchQuery=${encodeURIComponent(query)}`);
        setBlogs(response.data);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) return <div className="search-results-center">Searching...</div>;
  if (error) return <div className="search-results-center error">{error}</div>;

  return (
    <div className="search-results-container">
      <h2>Search Results for "{query}"</h2>
      
      {blogs.length === 0 ? (
        <div className="no-search-results">No articles found matching your query.</div>
      ) : (
        <div className="search-blogs-list">
          {blogs.map(blog => (
            <div key={blog._id} className="search-blog-card">
              <Link to={`/blogs/${blog._id}`} className="search-blog-title-link">
                <h4>{blog.title}</h4>
              </Link>
              <span className="search-blog-tag">{blog.tag}</span>
              <p className="search-blog-excerpt">
                {(blog.content || '').length > 150 ? `${blog.content.substring(0, 150)}...` : blog.content}
              </p>
              <div className="search-blog-meta">
                Published: {new Date(blog.created).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;