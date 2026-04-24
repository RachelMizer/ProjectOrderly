import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../api/handleApiError";
import { getAuthHeaders } from "../../api/auth";
import { pushRecentOrder } from "../../utils/recentOrders";

const API_BASE = "http://127.0.0.1:8000/api/v1";
const PAGE_SIZE = 25;

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

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

function SortIndicator({ sortKey, col, sortDir }) {
  if (sortKey !== col)
    return <span className="sort-indicator sort-indicator--inactive">⇅</span>;
  return <span className="sort-indicator">{sortDir === "asc" ? "▲" : "▼"}</span>;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatCurrency(value) {
  return parseFloat(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getOrderDate(order) {
  return new Date(order.date || order.createdAt);
}

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter]     = useState("");
  const [monthFilter, setMonthFilter]   = useState("");
  const [dayFilter, setDayFilter]       = useState("");
  const [page, setPage]                 = useState(1);
  const [totalCount, setTotalCount]     = useState(0);
  const [hasNext, setHasNext]           = useState(false);
  const [hasPrev, setHasPrev]           = useState(false);
  const [sortKey, setSortKey]           = useState("date");
  const [sortDir, setSortDir]           = useState("desc");
  const [completing, setCompleting]     = useState(null);
  const [feedback, setFeedback]         = useState({ id: null, type: null, message: "" });

  useEffect(() => {
    loadOrders();
  }, [statusFilter, yearFilter, monthFilter, dayFilter, page]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", page);
      params.set("pageSize", PAGE_SIZE);
      if (statusFilter) params.set("status", statusFilter);
      if (yearFilter && monthFilter && dayFilter) {
        const mm = String(monthFilter).padStart(2, "0");
        const dd = String(dayFilter).padStart(2, "0");
        params.set("dateCreated", `${yearFilter}-${mm}-${dd}`);
      }

      const response = await fetch(`${API_BASE}/orders?${params.toString()}`, {
        headers: { ...getAuthHeaders() },
      });

      if (response.status === 401 || response.status === 403) {
        throw { status: response.status };
      }

      if (!response.ok) throw new Error("Order record retrieval unsuccessful.");

      const data = await response.json();
      const results = data.results || [];

      setOrders(results);
      setTotalCount(data.count || 0);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);

    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        handleApiError(err, navigate);
      } else {
        setError(err.message || "Unable to load orders.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkComplete(orderId) {
    setCompleting(orderId);
    setFeedback({ id: null, type: null, message: "" });

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

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "COMPLETED" } : o))
      );
      setFeedback({ id: orderId, type: "success", message: "Marked complete." });
      setTimeout(() => setFeedback({ id: null, type: null, message: "" }), 3000);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        handleApiError(err, navigate);
      } else {
        setFeedback({
          id: orderId,
          type: "error",
          message: err.message || "Failed to complete order.",
        });
        setTimeout(() => setFeedback({ id: null, type: null, message: "" }), 3000);
      }
    } finally {
      setCompleting(null);
    }
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function getSortValue(order, key) {
    switch (key) {
      case "id":       return order.id;
      case "date":     return order.date || "";
      case "customer": return order.customerId || 0;
      case "status":   return order.status || "";
      case "total":    return parseFloat(order.totalDue) || 0;
      default:         return "";
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("");
    setYearFilter("");
    setMonthFilter("");
    setDayFilter("");
    setPage(1);
  }

  const hasActiveFilters = searchQuery || statusFilter || yearFilter || monthFilter || dayFilter;

  // Client-side search applied on top of server/mock filters
  const searchedOrders = searchQuery.trim()
    ? orders.filter((o) => {
        const q = searchQuery.toLowerCase();
        const customer = String(o.customerId || "");
        return (
          String(o.id).includes(q) ||
          customer.toLowerCase().includes(q)
        );
      })
    : orders;

  const sortedOrders = [...searchedOrders].sort((a, b) => {
    const av = getSortValue(a, sortKey);
    const bv = getSortValue(b, sortKey);
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Dynamic title
  function buildTitle() {
    const parts = [];
    if (dayFilter && monthFilter && yearFilter) {
      parts.push(`${MONTH_NAMES[parseInt(monthFilter) - 1]} ${dayFilter}, ${yearFilter}`);
    } else if (monthFilter && yearFilter) {
      parts.push(`${MONTH_NAMES[parseInt(monthFilter) - 1]} ${yearFilter}`);
    } else if (yearFilter) {
      parts.push(yearFilter);
    }

    const statusLabel = statusFilter ? STATUS_LABELS[statusFilter] : null;

    if (parts.length && statusLabel) return `${statusLabel} Orders from ${parts[0]}`;
    if (parts.length)                return `Orders from ${parts[0]}`;
    if (statusLabel)                 return `${statusLabel} Orders`;
    return "All Orders";
  }

  // Available years derived from loaded data for the dropdowns
  const availableYears = [...new Set(
    orders.map((o) => getOrderDate(o).getFullYear())
  )].sort((a, b) => b - a);

  const showEmpty = !loading && !error && sortedOrders.length === 0;

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label">Order Management</span>
        <div className="submenu-actions">
          <div className="submenu-filter-group">
            <input
              className="submenu-search submenu-search--sm"
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="rpt-month-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              className="rpt-month-select"
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setMonthFilter(""); setDayFilter(""); setPage(1); }}
            >
              <option value="">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              className="rpt-month-select"
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setDayFilter(""); setPage(1); }}
              disabled={!yearFilter}
            >
              <option value="">All Months</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
            <select
              className="rpt-month-select"
              value={dayFilter}
              onChange={(e) => { setDayFilter(e.target.value); setPage(1); }}
              disabled={!monthFilter}
            >
              <option value="">All Days</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                className="submenu-action submenu-action--clear"
                onClick={clearFilters}
              >
                &times;&#x202F;CLEAR FILTERS
              </button>
            )}
          </div>
          <span className="submenu-divider" />
          <button type="button" className="submenu-action" title="Pending further development">
            &gt; EXPORT
          </button>
          <button type="button" className="submenu-action" title="Pending further development">
            &gt; PRINT
          </button>
        </div>
      </div>

      {loading && (
        <p className="rpt-loading">Loading orders...</p>
      )}

      {!loading && error && (
        <p className="orders-load-error">{error}</p>
      )}

      {!loading && !error && (
        <>
          <h1 className="orders-view-title">Orders</h1>

          {feedback.message && (
            <div key={feedback.id + feedback.message} className={`orders-feedback orders-feedback--${feedback.type}`}>
              {feedback.message}
            </div>
          )}

          {showEmpty ? (
            <p className="rpt-empty">No orders found.</p>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-th" onClick={() => handleSort("id")}>
                      Order # <SortIndicator sortKey={sortKey} col="id" sortDir={sortDir} />
                    </th>
                    <th className="admin-th" onClick={() => handleSort("date")}>
                      Date <SortIndicator sortKey={sortKey} col="date" sortDir={sortDir} />
                    </th>
                    <th className="admin-th" onClick={() => handleSort("customer")}>
                      Customer <SortIndicator sortKey={sortKey} col="customer" sortDir={sortDir} />
                    </th>
                    <th className="admin-th" onClick={() => handleSort("status")}>
                      Status <SortIndicator sortKey={sortKey} col="status" sortDir={sortDir} />
                    </th>
                    <th className="admin-th" onClick={() => handleSort("total")}>
                      Total <SortIndicator sortKey={sortKey} col="total" sortDir={sortDir} />
                    </th>
                    <th className="admin-th admin-th--no-sort">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span
                          className="order-id-link"
                          onClick={() => { pushRecentOrder(order); navigate(`/admin/orders/${order.id}`); }}
                        >
                          #{order.id}
                        </span>
                      </td>
                      <td>{formatDate(order.date)}</td>
                      <td>
                        {order.customerFirstName || order.customerLastName
                          ? `${order.customerFirstName || ""} ${order.customerLastName || ""}`.trim()
                          : "—"}
                      </td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>${formatCurrency(order.totalDue)}</td>
                      <td className="td-actions">
                        {order.status === "PENDING" && (
                          <button
                            type="button"
                            className="table-action-btn"
                            onClick={() => handleMarkComplete(order.id)}
                            disabled={completing === order.id}
                          >
                            {completing === order.id ? "Completing..." : "Mark Complete"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="orders-pagination">
                <span className="orders-pagination__count">
                  {sortedOrders.length} order{sortedOrders.length !== 1 ? "s" : ""}
                </span>
                <div className="orders-pagination__controls">
                  <button
                    type="button"
                    className="submenu-action"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={!hasPrev}
                  >
                    &lt; PREV
                  </button>
                  <span className="orders-pagination__page">
                    {`Pg ${page} of ${Math.ceil(totalCount / PAGE_SIZE)}`}
                  </span>
                  <button
                    type="button"
                    className="submenu-action"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasNext}
                  >
                    NEXT &gt;
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
