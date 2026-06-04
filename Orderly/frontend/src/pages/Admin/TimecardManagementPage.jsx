import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_HOST from "../../config";
import { getAuthHeaders } from "../../api/auth";

const API = `${API_HOST}/api/v1/users`;

export default function TimecardManagementPage() {
  const navigate    = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/store-manager/employees/`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to load employees.");
        const data = await res.json();
        setEmployees(data.results || []);
        setStoreName(data.storeName || "");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = employees.filter(e => {
    if (!search) return true;
    const name = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
    return name.includes(search.toLowerCase()) || (e.username || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="ticket-detail__title">Timecard Management</h1>
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
            placeholder="Name or username…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <p className="admin-loading">Loading…</p>}
      {!loading && error && <p className="admin-loading" style={{ color: "#ef4444" }}>{error}</p>}

      {!loading && !error && (
        <table className="support-ticket-table" style={{ marginTop: "12px" }}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Username</th>
              <th>Timecard</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", color: "#94a3b8" }}>
                  {search ? "No employees match your search." : "No employees assigned to your store."}
                </td>
              </tr>
            ) : (
              filtered.map(emp => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link
                      to={`/admin/employee-profile/${emp.id}`}
                      style={{ color: "#5a87a8", textDecoration: "none" }}
                    >
                      {[emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.username}
                    </Link>
                  </td>
                  <td>{emp.username}</td>
                  <td>
                    <Link
                      to={`/admin/timecard/${emp.id}`}
                      className="sched-panel__assign-btn"
                      style={{ display: "inline-block" }}
                    >
                      ⏱ View / Edit Timecard
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <div className="ticket-detail__footer" style={{ marginTop: "20px" }}>
        <button className="support-back-btn" onClick={() => navigate("/admin/my-store/employees")}>
          <strong>←</strong> Employee Management
        </button>
      </div>
    </div>
  );
}
