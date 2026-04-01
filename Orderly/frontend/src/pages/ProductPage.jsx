import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProductPage = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {

        const prodRes = await fetch("http://localhost:8000/api/v1/products");
        const prodData = await prodRes.json();

        const found = prodData.results.find(
          (p) => p.id === Number(id)
        );

        if (!found) {
          console.error("Product not found");
          setLoading(false);
          return;
        }

        setProduct(found);

        // Fetch variants for this product
        const variantRes = await fetch(
          `http://localhost:8000/api/v1/products/${id}/variants`
        );
        const variantData = await variantRes.json();

        const v = variantData.results || [];
        setVariants(v);

        if (v.length > 0) {
          setSelectedVariant(v[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading product:", err);
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading product…</div>;
  }

  if (!product) {
    return <div style={{ padding: "2rem" }}>Product not found.</div>;
  }

  return (
    <div className="ind-product-pg">

      <h1>{product.name}</h1>

      <div className="img">Placeholder</div>

      {variants.length > 0 && (
        <select
          value={selectedVariant?.id}
          onChange={(e) => {
            const v = variants.find(
              (v) => v.id === Number(e.target.value)
            );
            setSelectedVariant(v);
          }}
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      )}

      {selectedVariant && (
        <>
          <p className="price">
            ${Number(selectedVariant.unitPrice).toFixed(2)}
          </p>

          {selectedVariant.sku && (
            <p className="sku">SKU: {selectedVariant.sku}</p>
          )}

          {Number(selectedVariant.stockQuantity) === 0 && (
            <p className="OOS">Out of Stock</p>
          )}

          {Number(selectedVariant.stockQuantity) !== 0 && (
            <div className="add-to-cart">
              <button>-</button>
              <p>0</p>
              <button>+</button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default ProductPage;
