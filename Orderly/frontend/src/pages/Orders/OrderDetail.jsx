import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderDetail, cancelOrder } from "../../api/orders";

export default function OrderDetails() {
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");

    useEffect(function () {
        fetchOrder();
    }, [orderId]);

    async function fetchOrder() {
        setLoading(true);
        setErrorMessage("");

        try {
            const data = await getOrderDetail(orderId);
            setOrder(data);
        }   catch (error) {
            setErrorMessage(error.message || "Failed to load order");
        }   finally {
            setLoading(false);
        }
    }

    function renderModifiers(modifiers) {
        if (!modifiers || modifiers.length === 0) {
            return null;
        }

        return (
            <div className="order-detail-modifiers">
                <h4>Modifiers:</h4>
                <ul>
                    {modifiers.map(renderModifierItem)}
                </ul>
            </div>
        );
    }

    function renderModifierItem(mod) {
        return (
            <li key={mod.optionId}>
                {mod.name} (+${mod.priceAdjustmentCharged})
            </li>
        );
    }

    function renderOrderItem(item) {
        return (
            <tr key={item.itemId} className="order-detail-item">
                <td><strong>{item.productName}</strong>{item.variantName !== "Standard" ? ` (${item.variantName})` : ""}</td>
                <td>x{item.quantity}</td>
                <td>${item.unitPriceCharged} ea.</td>
                <td>${item.itemTotal}</td>
                <td>
                    {item.modifiers?.length > 0
                        ? item.modifiers.map(m => m.name).join(", ")
                        : "—"}
                </td>
            </tr>
        );
    }

    function renderItems(items) {
        if (!items || items.length === 0) {
            return <tr><td colSpan={5}>No items in this order.</td></tr>;
        }

        return items.map(renderOrderItem);
    }

    if (loading) {
        return <p>Loading order...</p>;
    }

    if (errorMessage) {
        return <p>{errorMessage}</p>;
    }

    if (!order) {
        return <p>No order found.</p>;
    }

    async function handleCancel() {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        setCancelling(true);
        setCancelError("");
        try {
            await cancelOrder(order.id);
            setOrder({ ...order, status: "CANCELLED" });
        } catch (error) {
            setCancelError(error.message || "Failed to cancel order.");
        } finally {
            setCancelling(false);
        }
    }

    return (
        <div className="order-detail-pg">
            <div className="order-detail-pg-actions no-print">
                <button className="order-detail-print-btn" onClick={() => window.print()}>
                    🖨️ Print Receipt
                </button>
            </div>
            <h2>Order #{order.id}</h2>

            <p style={{ marginBottom: 0 }}>
                <strong>Date:</strong>{" "}
                {new Date(order.date).toLocaleString()}
            </p>

            <p style={{ marginTop: 0 }}>
                <strong>Status:</strong> {order.status}
            </p>

            {order.status === "PENDING" && (
                <div style={{ marginBottom: "12px" }}>
                    <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="cancel-order-btn"
                    >
                        {cancelling ? "Cancelling..." : "Cancel Order"}
                    </button>
                    {cancelError && <p style={{ color: "red", marginTop: "6px", fontSize: "0.85rem" }}>{cancelError}</p>}
                </div>
            )}

            <div className="order-detail-items">
                <table className="order-detail-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                            <th>Modifications</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderItems(order.items)}
                    </tbody>
                </table>
            </div>

            <div className="order-detail-totals">
                <table className="order-detail-totals-table">
                    <tbody>
                        <tr>
                            <td>Tax:</td>
                            <td>${order.taxAmount}</td>
                        </tr>
                        <tr>
                            <td><strong>Total:</strong></td>
                            <td><strong>${order.totalDue}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <Link to="/order-history" style={{ display: "block", marginTop: "16px", letterSpacing: "normal", color: "var(--sf-main-link)" }}>← Back to Order History</Link>
        </div>
    );
}
