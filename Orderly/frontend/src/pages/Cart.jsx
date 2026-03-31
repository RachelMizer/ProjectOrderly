// frontend/src/pages/Cart.jsx

import React, { useEffect, useState } from "react";

function CartPage() {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  const accessToken = localStorage.getItem("access");

  useEffect(() => {
    async function loadCart() {
      try {
        // Fetch the draft order (this returns the cart)
        const res = await fetch("http://localhost:8000/api/v1/orders/draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` })
          },
          body: JSON.stringify({})
        });

        const data = await res.json();
        setOrder(data);

        // The backend returns items directly inside the draft order
        setItems(data.items || []);
      } catch (err) {
        console.error("Error loading cart:", err);
      }

      setLoading(false);
    }

    loadCart();
  }, []);

  if (loading) return <div style={{ padding: "2rem" }}>Loading cart…</div>;

  if (!items.length) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Your Cart</h1>

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            borderBottom: "1px solid #ccc",
            padding: "1rem 0",
            marginBottom: "1rem"
          }}
        >
          <h3>{item.variantName}</h3>
          <p>Quantity: {item.quantity}</p>
          <p>Price: ${Number(item.totalPrice).toFixed(2)}</p>

          {item.modifiers?.length > 0 && (
            <ul>
              {item.modifiers.map((m) => (
                <li key={m.id}>
                  {m.name}
                  {m.priceAdjustment > 0 &&
                    ` (+$${Number(m.priceAdjustment).toFixed(2)})`}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default CartPage;
