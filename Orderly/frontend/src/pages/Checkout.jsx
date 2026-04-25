import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { submitOrder } from "../api/orders";

const PAYMENT_TYPES = [
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "CASH",        label: "Cash" },
  { value: "OTHER",       label: "Other" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  const [loading, setLoading]     = useState(true);
  const [order, setOrder]         = useState(null);
  const [items, setItems]         = useState([]);
  const [taxRate, setTaxRate]     = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [payment, setPayment] = useState({
    name: `${storedUser.firstName || ""} ${storedUser.lastName || ""}`.trim(),
    address: storedUser.streetAddress || "",
    city: storedUser.city || "",
    state: storedUser.state || "",
    zip: storedUser.zipcode || "",
    phone: storedUser.phone || "",
    paymentType: "CREDIT_CARD",
    cardLast4: "",
    otherDetails: "",
  });

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }
    loadCart();
    fetch("http://localhost:8000/api/v1/settings/")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.taxRate) setTaxRate(Number(data.taxRate)); })
      .catch(() => {});
  }, []);

  async function loadCart() {
    try {
      const draftRes = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/orders/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({}),
      });
      const draft = await draftRes.json();

      const detailRes = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/orders/${draft.id}`, {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });
      const data = await detailRes.json();
      setOrder(data);
      setItems(data.items || []);
    } catch (err) {
      console.error("Error loading cart:", err);
      setErrorMessage("Failed to load cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentChange(e) {
    const { name, value } = e.target;
    setPayment((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const paymentData = { paymentType: payment.paymentType };
    if (payment.paymentType === "CREDIT_CARD") paymentData.cardLast4 = payment.cardLast4;
    if (payment.paymentType === "OTHER")       paymentData.otherDetails = payment.otherDetails;

    try {
      const result = await submitOrder(order.id, paymentData);
      window.dispatchEvent(new Event("cart-updated"));
      navigate(`/orders/${result.id}`);
    } catch (err) {
      setErrorMessage(err.message || "Order submission failed. Please try again.");
      setSubmitting(false);
    }
  }

  const subtotal   = items.reduce((sum, item) => sum + Number(item.itemTotal), 0);
  const tax        = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
  const grandTotal = subtotal + tax;

  if (loading) return <div className="checkout-pg">Loading…</div>;

  if (!items.length) {
    return (
      <div className="checkout-pg">
        <div className="cart-head-cont"><h1>Checkout</h1></div>
        <p className="checkout-empty">Your cart is empty. <Link to="/cart">Go back to cart</Link></p>
      </div>
    );
  }

  return (
    <div className="checkout-pg">
      <div className="cart-head-cont"><h1>Checkout</h1></div>

      <section className="checkout-section">
        <h2>Order Review</h2>
        {items.map((item) => (
          <div className="checkout-item" key={item.itemId}>
            <div className="checkout-item-row">
              <span className="checkout-item-name">
                {item.productName}
                {item.variantName !== "Standard" && (
                  <span className="checkout-item-variant"> — {item.variantName}</span>
                )}
              </span>
              <span className="checkout-item-price">${Number(item.itemTotal).toFixed(2)}</span>
            </div>
            {item.modifiers?.length > 0 && (
              <ul className="checkout-modifiers">
                {item.modifiers.map((m) => (
                  <li key={m.optionId}>
                    {m.name}
                    {parseFloat(m.priceAdjustmentCharged) > 0 &&
                      ` (+$${Number(m.priceAdjustmentCharged).toFixed(2)})`}
                  </li>
                ))}
              </ul>
            )}
            <p className="checkout-item-qty">Qty: {item.quantity}</p>
          </div>
        ))}

        <div className="checkout-totals">
          <table>
            <tbody>
              <tr><td className="left">Subtotal</td><td className="right">${subtotal.toFixed(2)}</td></tr>
              <tr><td className="left">Tax</td><td className="right">${tax.toFixed(2)}</td></tr>
              <tr className="grand-total-row">
                <td className="left">Total</td>
                <td className="right">${grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr />

      <section className="checkout-section">
        <h2>Payment</h2>
        {errorMessage && <p className="checkout-error">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <fieldset className="checkout-fieldset" disabled={submitting}>

            <div className="checkout-field">
              <label htmlFor="name">Name on Order</label>
              <input id="name" name="name" type="text" value={payment.name}
                onChange={handlePaymentChange} required />
            </div>

            <div className="checkout-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" value={payment.phone}
                onChange={handlePaymentChange} required />
            </div>

            <div className="checkout-field">
              <label htmlFor="address">Address</label>
              <input id="address" name="address" type="text" value={payment.address}
                onChange={handlePaymentChange} required />
            </div>

            <div className="checkout-field-row">
              <div className="checkout-field">
                <label htmlFor="city">City</label>
                <input id="city" name="city" type="text" value={payment.city}
                  onChange={handlePaymentChange} required />
              </div>
              <div className="checkout-field checkout-field-sm">
                <label htmlFor="state">State</label>
                <input id="state" name="state" type="text" maxLength={2}
                  value={payment.state} onChange={handlePaymentChange} required />
              </div>
              <div className="checkout-field checkout-field-sm">
                <label htmlFor="zip">ZIP</label>
                <input id="zip" name="zip" type="text" maxLength={10}
                  value={payment.zip} onChange={handlePaymentChange} required />
              </div>
            </div>

            <div className="checkout-field">
              <label htmlFor="paymentType">Payment Type</label>
              <select id="paymentType" name="paymentType" value={payment.paymentType}
                onChange={handlePaymentChange}>
                {PAYMENT_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>

            {payment.paymentType === "CREDIT_CARD" && (
              <div className="checkout-field">
                <label htmlFor="cardLast4">Last 4 Digits of Card</label>
                <input id="cardLast4" name="cardLast4" type="text"
                  maxLength={4} pattern="\d{4}" placeholder="0000"
                  value={payment.cardLast4} onChange={handlePaymentChange} required />
              </div>
            )}

            {payment.paymentType === "OTHER" && (
              <div className="checkout-field">
                <label htmlFor="otherDetails">Payment Details</label>
                <input id="otherDetails" name="otherDetails" type="text"
                  value={payment.otherDetails} onChange={handlePaymentChange} required />
              </div>
            )}

            <div className="checkout-actions">
              <Link to="/cart" className="checkout-back-link">← Back to Cart</Link>
              <button type="submit" className="submit-order-btn">
                {submitting ? "Placing Order…" : `Place Order — $${grandTotal.toFixed(2)}`}
              </button>
            </div>

          </fieldset>
        </form>
      </section>
    </div>
  );
}
