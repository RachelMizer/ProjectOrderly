import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../api/auth";
import { handleApiError } from "../../api/handleApiError";
import { pushRecentOrder, removeRecentOrder } from "../../utils/recentOrders";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/v1`;

const STATUS_LABELS = {
  PENDING:   "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function StatusBadge({ status }) {
  const mod =
    status === "COMPLETED" ? "inv-badge--completed"
    : status === "CANCELLED" ? "inv-badge--cancelled"
    : "inv-badge--pending";
  return (
    <span className={`inv-badge ${mod}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function formatCurrency(value) {
  return parseFloat(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [completing, setCompleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        headers: { ...getAuthHeaders() },
      });

      if (response.status === 401 || response.status === 403) {
        throw { status: response.status };
      }

      if (response.status === 404) {
        removeRecentOrder(parseInt(orderId));
        throw new Error("Order not found.");
      }

      if (!response.ok) throw new Error("Failed to load order.");

      const data = await response.json();
      setOrder(data);
      pushRecentOrder(data);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        handleApiError(err, navigate);
      } else {
        setError(err.message || "Unable to load order.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkComplete() {
    setCompleting(true);
    setFeedback({ type: null, message: "" });

    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/complete`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body:    JSON.stringify({}),
      });

      if (response.status === 401 || response.status === 403) {
        throw { status: response.status };
      }

      if (!response.ok) throw new Error("Failed to complete order.");

      setOrder((prev) => ({ ...prev, status: "COMPLETED" }));
      setFeedback({ type: "success", message: "Order marked as complete." });
      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        handleApiError(err, navigate);
      } else {
        setFeedback({ type: "error", message: err.message || "Failed to complete order." });
        setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
      }
    } finally {
      setCompleting(false);
    }
  }

  const subtotal = order
    ? parseFloat(order.totalDue) - parseFloat(order.taxAmount)
    : 0;

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label">
          {order ? `Order #${order.id}` : "Order Detail"}
        </span>
        <div className="submenu-actions">
          <button
            type="button"
            className="submenu-action"
            onClick={() => navigate("/admin/orders")}
          >
            <span style={{marginRight:"-4px"}}>⬅️</span> BACK TO ORDERS
          </button>
          <span className="submenu-divider" />
          <button type="button" className="submenu-action" onClick={() => window.print()}>
            <span style={{marginRight:"-1px"}}>🖨️</span>PRINT
          </button>
        </div>
      </div>

      {loading && <p className="rpt-loading">Loading order...</p>}

      {!loading && error && <p className="inv-error">{error}</p>}

      {!loading && !error && !order && (
        <p className="rpt-empty">Order not found.</p>
      )}

      {!loading && !error && order && (
        <>
          {/* Order header */}
          <div className="order-detail-header">
            <div className="order-detail-meta">
              <p className="order-detail-id">Order #{order.id}</p>
              <p className="order-detail-date"><strong>{formatDateTime(order.date)}</strong></p>
              <p className="order-detail-customer">
                <strong>
                  {order.customerFirstName || order.customerLastName
                    ? `${order.customerFirstName || ""} ${order.customerLastName || ""}`.trim()
                    : order.customerId ? `Customer #${order.customerId}` : "—"}
                </strong>
              </p>
            </div>
            <div className="order-detail-status-wrap">
              <span className="order-detail-status-label">Status:</span>
              <StatusBadge status={order.status} />
              {order.status === "PENDING" && (
                <button
                  type="button"
                  className="table-action-btn order-detail-complete-btn"
                  onClick={handleMarkComplete}
                  disabled={completing}
                >
                  {completing ? "Completing..." : "Mark Complete"}
                </button>
              )}
              {feedback.type === "success" && (
                <span className="inv-save-success"> {feedback.message}</span>
              )}
              {feedback.type === "error" && (
                <span className="inv-error"> {feedback.message}</span>
              )}
            </div>
          </div>

          {/* Items table */}
          <p className="inv-section-header">Order Details</p>

          {(!order.items || order.items.length === 0) ? (
            <p className="rpt-empty">No items on this order.</p>
          ) : (
            <div className="order-detail-items">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-th admin-th--no-sort inv-td-left">Product</th>
                    <th className="admin-th admin-th--no-sort">Variant</th>
                    <th className="admin-th admin-th--no-sort" style={{textAlign:"center"}}>Modifiers</th>
                    <th className="admin-th admin-th--no-sort">Qty</th>
                    <th className="admin-th admin-th--no-sort">Unit Price</th>
                    <th className="admin-th admin-th--no-sort">Item Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.itemId}>
                      <td className="inv-td-left td-name">{item.productName}</td>
                      <td>{item.variantName}</td>
                      <td className="order-detail-modifiers" style={{textAlign:"center"}}>
                        {item.modifiers && item.modifiers.length > 0
                          ? item.modifiers.map((m) => (
                              <span key={m.id} className="order-detail-modifier-tag">
                                {m.name}
                                {m.priceAdjustmentCharged > 0 && ` +$${formatCurrency(m.priceAdjustmentCharged)}`}
                              </span>
                            ))
                          : <span className="order-detail-no-modifiers">—</span>
                        }
                      </td>
                      <td>{item.quantity}</td>
                      <td>${formatCurrency(item.unitPriceCharged)}</td>
                      <td>${formatCurrency(item.itemTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Totals */}
              <div className="order-detail-totals">
            <div className="order-detail-totals__row">
              <span>Subtotal</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div className="order-detail-totals__row">
              <span>Tax</span>
              <span>${formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="order-detail-totals__row order-detail-totals__row--total">
              <span>Total</span>
              <span>${formatCurrency(order.totalDue)}</span>
            </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          {order.updatedAt && order.updatedAt !== order.createdAt && (
            <p className="order-detail-timestamps">
              Last updated: {formatDateTime(order.updatedAt)}
            </p>
          )}
        </>
      )}
    </div>
  );
}
