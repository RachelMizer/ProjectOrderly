import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getGuestCartEmail } from "../api/orders";

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
    const guestEmail = accessToken ? null : getGuestCartEmail();

    try {
      await fetch("http://localhost:8000/api/v1/orders/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` })
        },
        body: JSON.stringify(guestEmail ? { guestEmail } : {})
      });

      await fetch("http://localhost:8000/api/v1/orders/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity: 1,
          ...(guestEmail && { guestEmail })
        })
      });

      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>

      {product.imageUrl
        ? <img src={product.imageUrl} alt={product.name} className="img" />
        : <div className="img">Placeholder</div>
      }

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
        {selectedVariant?.unitPrice != null
          ? `$${Number(selectedVariant.unitPrice).toFixed(2)}`
          : "N/A"}
      </p>

      {/* Stock */}
      {selectedVariant?.stockQuantity !== null &&
        Number(selectedVariant?.stockQuantity) === 0 && (
          <p className="OOS">Out of Stock</p>
      )}

      {(selectedVariant?.stockQuantity === null ||
        Number(selectedVariant?.stockQuantity) > 0) && (
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!selectedVariant}
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
