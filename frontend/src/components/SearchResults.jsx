import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`http://localhost:5000/api/products?search=${encodeURIComponent(query)}`);
        setProducts(response.data);
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
      
      {products.length === 0 ? (
        <div className="no-search-results">No products found matching your query.</div>
      ) : (
        <div className="search-blogs-list">
          {products.map(product => (
            <div key={product._id} className="search-blog-card">
              <Link to={`/product/${product._id}`} className="search-blog-title-link">
                <h4>{product.name}</h4>
              </Link>
              <span className="search-blog-tag">{product.category || 'Food'}</span>
              <p className="search-blog-excerpt">
                {(product.description || '').length > 150 ? `${product.description.substring(0, 150)}...` : product.description}
              </p>
              <div className="search-blog-meta">
                Price: ${product.price}
                {product.shop && ` • Shop: ${product.shop.name}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;