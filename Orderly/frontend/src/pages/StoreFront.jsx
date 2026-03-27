// pages/StoreFront.jsx

import React, { useEffect, useState } from "react";

const StoreFront = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  // TEMPORARY DUMMY DATA — will replace with API later
  const dummyProducts = [
    {
      id: 1,
      name: "Red Binder",
      description: "A durable red binder.",
      price: 4.99,
      category: "Binders",
      stock: 12,
      imageUrl: "/products/red_binder.png"
    },
    {
      id: 2,
      name: "Blue Pen",
      description: "Smooth writing pen.",
      price: 1.49,
      category: "Pens",
      stock: 0,
      imageUrl: "/products/blue_pen.png"
    }
  ];


  useEffect(() => {
    setProducts(dummyProducts);
    setFiltered(dummyProducts);

    const uniqueCats = ["all", ...new Set(dummyProducts.map(p => p.category))];
    setCategories(uniqueCats);
  }, []);

  const handleFilter = (cat) => {
    setActiveCategory(cat);
    if (cat === "all") {
      setFiltered(products);
    } else {
      setFiltered(products.filter(p => p.category === cat));
    }
  };

  return (
    <div className="store">

      <div className="filter">
        <h3>Filter</h3>
        {categories.map(cat => (
          <button
            key={cat}
            className={activeCategory === cat ? "active" : ""}
            onClick={() => handleFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="product-grid">
        {filtered.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} />

            <h2>{product.name}</h2>
            <p>{product.description}</p>

            <div className="price-row">
              <span>${product.price.toFixed(2)}</span>
              {product.stock === 0 && (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            <div className="cart-controls">
              <button disabled={product.stock === 0}>-</button>
              <p>0</p>
              <button disabled={product.stock === 0}>+</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default StoreFront;
