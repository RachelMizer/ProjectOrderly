import React, { useState } from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(product.defaultVariant);

  return (
    <div className="product-card">
      <h3>{product.name}</h3>

      <div className="img">Placeholder</div>

      {/* Variant dropdown */}
      <select
        value={selectedVariant?.id}
        onChange={(e) => {
          const v = product.variants.find(
            (v) => v.id === Number(e.target.value)
          );
          setSelectedVariant(v);
        }}
      >
        {product.variants.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      <br />
      <p className="price">
        ${Number(selectedVariant.unitPrice).toFixed(2)}
      </p>

      {selectedVariant.sku && (
        <p className="sku">SKU: {selectedVariant.sku}</p>
      )}

      
      {Number(selectedVariant.stockQuantity) === 0 && (
      <p className="OOS">Out of Stock</p>
      )}


      {Number(selectedVariant.stockQuantity) > 0 && (
        <div className="add-to-cart">
          <button>-</button>
          <p>0</p>
          <button>+</button>
        </div>
      )}
    <br />
      <Link to={`/product/${product.id}`} className="view-link">
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;
