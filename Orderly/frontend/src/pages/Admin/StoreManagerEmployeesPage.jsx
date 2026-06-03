import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

const STATUS_COLORS = {
  ONLINE:  "#22c55e",
  BUSY:    "#f472b6",
  AWAY:    "#9ca3af",
  OFFLINE: "transparent",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function StoreManagerEmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/users/store-manager/employees/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data.results || []);
          setStoreName(data.storeName || "");
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.detail || "Failed to load employees.");
        }
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = employees.filter((e) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const name = [e.firstName, e.lastName].filter(Boolean).join(" ").toLowerCase();
    return (
      name.includes(term) ||
      e.email?.toLowerCase().includes(term) ||
      e.username?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="ticket-detail__title">Employees</h1>
          {storeName && (
            <p style={{ color: "#64748b", marginTop: "2px", fontSize: ".9rem" }}>{storeName}</p>
          )}
        </div>
        <span className="roster__count">
          {loading ? "…" : `${employees.length} ${employees.length === 1 ? "employee" : "employees"}`}
        </span>
      </div>

      <div className="acct-page-controls">
        <div className="acct-page-controls__left">
          <label className="acct-search-label">Search employees</label>
          <input
            className="acct-search-input"
            type="text"
            placeholder="Name, email, username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="admin-loading">Loading…</p>
      ) : error ? (
        <p className="admin-loading" style={{ color: "#ef4444" }}>{error}</p>
      ) : filtered.length === 0 ? (
        <div className="my-tickets__empty">
          <p className="my-tickets__empty-icon">👤</p>
          <p className="my-tickets__empty-heading">
            {search ? "No employees match your search" : "No employees assigned to your store"}
          </p>
        </div>
      ) : (
        <table className="support-ticket-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Active</th>
              <th>Member Since</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id}>
                <td>{[emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.username}</td>
                <td>{emp.username}</td>
                <td>{emp.email}</td>
                <td>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: emp.status === "OFFLINE" ? "transparent" : STATUS_COLORS[emp.status] || "#9ca3af",
                        border: emp.status === "OFFLINE" ? "2px solid #9ca3af" : "none",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    {emp.status || "—"}
                  </span>
                </td>
                <td>
                  <span className={`acct-status-badge acct-status-badge--${emp.isActive ? "active" : "inactive"}`}>
                    {emp.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{fmtDate(emp.dateJoined)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="ticket-detail__footer">
        <button className="support-back-btn" onClick={() => navigate("/admin")}>
          <strong>←</strong> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
