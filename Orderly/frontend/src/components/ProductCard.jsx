import React, { useState } from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(product.defaultVariant);

  const accessToken = localStorage.getItem("accessToken");


  const handleVariantChange = (e) => {
    const v = product.variants.find(
      (v) => v.id === Number(e.target.value)
    );
    setSelectedVariant(v);
  };

   const handleAddToCart = async () => {
    try {
      console.log("Add to Cart clicked!", selectedVariant);

      // 1. Get or create draft order
      const draftRes = await fetch("http://localhost:8000/api/v1/orders/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` })
        },
        body: JSON.stringify({})
      });

      const draft = await draftRes.json();
      console.log("Draft order:", draft);


      const addItemRes = await fetch("http://localhost:8000/api/v1/orders/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity: 1
        })
      });

      const addedItem = await addItemRes.json();
      console.log("Item added:", addedItem);

      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>

      <div className="img">Placeholder</div>

      {product.description && <p className="prod-desc">{product.description}</p>}

      {/* Variant selector */}
      {product.variants.length > 1 && (
        <div className="variant-radios">
          {product.variants.map((v) => (
            <label key={v.id} className="variant-radio-label">
              <input
                type="radio"
                name={`variant-${product.id}`}
                value={v.id}
                checked={selectedVariant?.id === v.id}
                onChange={handleVariantChange}
              />
              {v.name}
            </label>
          ))}
        </div>
      )}

      {/* Price */}
      <p className="price">
        ${Number(selectedVariant.unitPrice).toFixed(2)}
      </p>

      {/* Stock */}
      {Number(selectedVariant.stockQuantity) === 0 && (
        <p className="OOS">Out of Stock</p>
      )}

      {Number(selectedVariant.stockQuantity) > 0 && (
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      )}

      <Link to={`/product/${product.id}`} className="view-link">
        View & Customize
      </Link>
    </div>
  );
};

export default ProductCard;
