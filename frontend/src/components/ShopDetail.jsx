import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

const ShopDetail = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItemToCart } = useAppContext();

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      setLoading(true);
      try {
        // Fetch Shop Data
        const shopRes = await axios.get(`http://localhost:5000/api/shops/${id}`);
        setShop(shopRes.data);

        // Fetch Shop's Products
        const productsRes = await axios.get(`http://localhost:5000/api/products/by/${id}`);
        setProducts(productsRes.data);
      } catch (err) {
        console.error('Error fetching shop details:', err);
        setError('Failed to load shop details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopAndProducts();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading menu...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>{error}</div>;
  if (!shop) return <div style={{ textAlign: 'center', padding: '40px' }}>Shop not found!</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        position: 'relative', 
        height: '250px', 
        borderRadius: '12px', 
        overflow: 'hidden',
        marginBottom: '20px',
        backgroundColor: '#333'
      }}>
        <img
          src={`http://localhost:5000/api/shops/logo/${shop._id}`}
          alt={shop.name}
          onError={(e) => { e.target.src = 'http://localhost:5000/api/shops/defaultphoto'; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
        />
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>{shop.name}</h1>
          <p style={{ margin: 0, fontSize: '1.2rem', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>{shop.address || shop.description}</p>
        </div>
      </div>

      <h2>Menu</h2>
      {products.length === 0 ? (
        <p style={{ color: '#666' }}>This shop hasn't added any products yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {products.map(product => (
            <div key={product._id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column' }}>
              <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: '#333' }}>
                <div style={{ height: '180px', marginBottom: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', overflow: 'hidden' }}>
                   <img
                      src={`http://localhost:5000/api/product/image/${product._id}`}
                      alt={product.name}
                      onError={(e) => { e.target.src = 'http://localhost:5000/api/product/defaultphoto'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <h3 style={{ margin: '0 0 10px 0' }}>{product.name}</h3>
                <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '15px', flexGrow: 1 }}>
                  {product.description?.substring(0, 80)}{product.description?.length > 80 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${product.price?.toFixed(2)}</span>
                </div>
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); addItemToCart(product); alert(`${product.name} added to cart!`); }}
                style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#ff5722', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopDetail;
