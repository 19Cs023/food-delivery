import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const AddShop = () => {
  const { user, token } = useAppContext();
  const navigate = useNavigate();

  const [shopData, setShopData] = useState({
    name: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If user is not logged in or not a shop keeper, redirect or show error
  if (!user || !user.is_shop_keeper) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You must be signed in as a shop owner to access this page.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShopData({ ...shopData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('name', shopData.name);
      formData.append('description', shopData.description);
      if (image) {
        formData.append('image', image);
      }

      // Ensure your backend has the matching POST /api/shops/by/:userId route
      const res = await fetch(`http://localhost:5000/api/shops/by/${user._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create shop');
      }

      setSuccessMsg('Shop created successfully!');
      setTimeout(() => {
        navigate('/dashboard'); // or redirect to the shop's management page
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create a New Shop</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Shop Name: </label><br/>
          <input 
            type="text" 
            name="name" 
            value={shopData.name} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>
        
        <div>
          <label>Description: </label><br/>
          <textarea 
            name="description" 
            value={shopData.description} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px', minHeight: '80px' }} 
          />
        </div>

        <div>
          <label>Shop Logo/Image: </label><br/>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            style={{ marginTop: '5px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Create Shop
        </button>
      </form>
    </div>
  );
};

export default AddShop;