// STOREFRONT.JSX - Displays products in the database
import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

const StoreFront = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  // Load categories + initial products
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const catRes = await fetch("http://localhost:8000/api/v1/categories");
        const prodRes = await fetch("http://localhost:8000/api/v1/products");

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        setCategories(catData.results);

        // Enrich initial product list
        const enriched = await enrichProducts(prodData.results);
        setProducts(enriched);

      } catch (err) {
        console.error("Error loading storefront:", err);
      }
    };

    loadInitial();
  }, []);

  // Helper: enrich products with variants, minPrice, stock, etc.
  const enrichProducts = async (productList) => {
    return Promise.all(
      productList.map(async (product) => {
        const variantRes = await fetch(
          `http://localhost:8000/api/v1/products/${product.id}/variants`
        );
        const variantData = await variantRes.json();

        const variants = variantData.results || [];

        const prices = variants
          .map((v) => Number(v.unitPrice))
          .filter((p) => !isNaN(p));

        const minPrice = prices.length > 0 ? Math.min(...prices) : null;

        const defaultVariant = variants[0] || null;

        const inStock = variants.some(
          (v) => Number(v.stockQuantity) > 0
        );

        return {
          ...product,
          variants,
          minPrice,
          defaultVariant,
          inStock,
        };
      })
    );
  };

  const handleCheckbox = (categoryId) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const filteredProducts = selectedCategories.size === 0
    ? products
    : products.filter(p => selectedCategories.has(p.categoryId));

  return (
    <div className="store">

      {/* FILTER */}
      <div className="filter">
        <h3>Filter the Menu</h3>

        {categories.map((cat) => (
          <label key={cat.id}>
            <input
              type="checkbox"
              checked={selectedCategories.has(cat.id)}
              onChange={() => handleCheckbox(cat.id)}
            />
            {cat.name}
          </label>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <main className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </main>

    </div>
  );
};

export default StoreFront;
