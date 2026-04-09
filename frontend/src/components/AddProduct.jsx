import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";

const AddProduct = () => {
  const { user, token } = useAppContext();
  const navigate = useNavigate();
  const { shopId } = useParams();

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    category: "",
    quantity: 1,
    price: 0,
  });
  const [image, setImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!user || !user.is_shop_keeper) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You must be a shop owner to add products to this shop.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("description", productData.description);
      formData.append("category", productData.category);
      formData.append("quantity", productData.quantity);
      formData.append("price", productData.price);

      if (image) {
        formData.append("image", image);
      }

      const res = await fetch(
        `http://localhost:5000/api/products/by/${shopId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      setSuccessMsg("Product added successfully!");

      // Clear form
      setProductData({
        name: "",
        description: "",
        category: "",
        quantity: 1,
        price: 0,
      });
      setImage(null);

      setTimeout(() => {
        navigate("/account"); // Head back to their profile
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "30px",
        border: "1px solid #eee",
        borderRadius: "12px",
        background: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        Add New Product
      </h2>

      {errorMsg && (
        <div
          style={{
            color: "#d32f2f",
            background: "#ffcdd2",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px",
          }}
        >
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div
          style={{
            color: "#388e3c",
            background: "#c8e6c9",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px",
          }}
        >
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <div>
          <label
            style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}
          >
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              display: "block",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </div>

        <div>
          <label
            style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}
          >
            Description
          </label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              display: "block",
              minHeight: "100px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontWeight: "500",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={productData.price}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                display: "block",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontWeight: "500",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Quantity/Stock
            </label>
            <input
              type="number"
              name="quantity"
              value={productData.quantity}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                display: "block",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
          </div>
        </div>

        <div>
          <label
            style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}
          >
            Category
          </label>
          <input
            type="text"
            name="category"
            value={productData.category}
            onChange={handleChange}
            placeholder="e.g. Appetizers, Drinks"
            style={{
              width: "100%",
              padding: "10px",
              display: "block",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </div>

        <div>
          <label
            style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}
          >
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            marginTop: "10px",
          }}
        >
          Add Product to Shop
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
