// frontend/src/pages/Cart.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getGuestCartEmail } from "../api/orders";

function CartPage() {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("accessToken");
  const guestEmail = accessToken ? null : getGuestCartEmail();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const fullName = storedUser
    ? `${storedUser.firstName || ""} ${storedUser.lastName || ""}`.trim()
    : "";

  async function loadCart() {
    try {
      const draftRes = await fetch("http://localhost:8000/api/v1/orders/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` })
        },
        body: JSON.stringify(guestEmail ? { guestEmail } : {})
      });

      const draft = await draftRes.json();

      const detailUrl = guestEmail
        ? `http://localhost:8000/api/v1/orders/${draft.id}?guestEmail=${encodeURIComponent(guestEmail)}`
        : `http://localhost:8000/api/v1/orders/${draft.id}`;

      const detailRes = await fetch(detailUrl, {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` })
        }
      });

      const data = await detailRes.json();
      setOrder(data);
      setItems(data.items || []);
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function emptyCart() {
    if (!window.confirm("Remove all items from your cart?")) return;
    try {
      await Promise.all(
        items.map((item) =>
          fetch(`http://localhost:8000/api/v1/orders/items/${item.itemId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken && { Authorization: `Bearer ${accessToken}` })
            },
            body: JSON.stringify({
              quantity: 0,
              ...(guestEmail && { guestEmail })
            })
          })
        )
      );
      await loadCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Failed to empty cart:", err);
    }
  }

  async function updateQuantity(itemId, newQuantity) {
    try {
      await fetch(`http://localhost:8000/api/v1/orders/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          quantity: newQuantity,
          ...(guestEmail && { guestEmail })
        })
      });
      await loadCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.itemTotal), 0);
  const TAX_RATE = 0.0725;
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const grandTotal = subtotal + tax;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <div className="cart-pg">Loading cart…</div>;

  if (!items.length) {
    return (
      <div className="cart-pg">
        <div className="cart-head-cont"><h1>Your Cart</h1></div>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="cart-pg">
      <div className="cart-head-cont"><h1> Your Cart </h1></div>

      {items.map((item) => (
        <div className="cart-item" key={item.itemId}>

          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.productName} className="cart-item-img" />
            : <div className="cart-item-img cart-item-img--placeholder" />
          }

          <div className="cart-item-main">
            <h3 className="cart-item-name">
              <Link to={`/product/${item.productId}`}>{item.productName}</Link>
            </h3>
            {item.variantName !== 'Standard' && (
              <p className="cart-item-type">Option: {item.variantName}</p>
            )}
            <h4 className="cart-item-addons-label">Item Add-Ons / Mods:</h4>
            {item.modifiers?.length > 0 ? (
              <ul>
                {item.modifiers.map((m) => (
                  <li key={m.optionId}>
                    {m.name}
                    {parseFloat(m.priceAdjustmentCharged) > 0 &&
                      ` (+$${Number(m.priceAdjustmentCharged).toFixed(2)})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="noAO">No add-ons added</p>
            )}
          </div>

          <div className="cart-item-right">
            <button className="edit-button" onClick={() => {
              const modifierIds = item.modifiers?.map(m => m.optionId).join(',') || '';
              navigate(`/product/${item.productId}?editItem=${item.itemId}&variantId=${item.variantId}&modifiers=${modifierIds}`);
            }}>Edit Item</button>

            <div className="cart-item-controls">
              <span>Qty</span>
              <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>+</button>
            </div>

            <button className="cart-remove-btn" onClick={() => updateQuantity(item.itemId, 0)}>Remove</button>

            <p className="cart-item-price">${Number(item.itemTotal).toFixed(2)}</p>
          </div>

        </div>
      ))}

      <button className="empty-cart-btn" style={{marginTop: "15px"}} onClick={emptyCart}>Empty Cart</button>
      <div className="cart-totals">
        <table>
          <tr><td className="left">Total Items</td> <td className="right">{totalItems}</td></tr>
          <tr><td className="left">Subtotal</td> <td className="right">${subtotal.toFixed(2)}</td></tr>
          <tr><td className="left">Tax</td> <td className="right">${tax.toFixed(2)}</td></tr>
          <tr><td className="left">Grand Total</td> <td className="right">${grandTotal.toFixed(2)}</td></tr>
        </table>
      </div>
      <button className="checkout-btn" onClick={() => navigate("/checkout")}>Go to Checkout</button>
    </div>
  );
}

export default CartPage;
