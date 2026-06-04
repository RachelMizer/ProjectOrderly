import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_HOST from "../../config";
import { getAuthHeaders } from "../../api/auth";

const API = `${API_HOST}/api/v1/users`;

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtPhone(p) {
  if (!p) return "—";
  const d = p.replace(/\D/g, "");
  if (d.length === 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  return p;
}

export default function ExecutiveEmployeeListPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [stores, setStores]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [storeFilter, setStoreFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [empRes, locRes] = await Promise.all([
          fetch(`${API}/employee-profiles/`, { headers: getAuthHeaders() }),
          fetch(`${API_HOST}/api/v1/locations/`, { headers: getAuthHeaders() }),
        ]);
        if (!empRes.ok) throw new Error("Failed to load employees.");
        const empData = await empRes.json();
        setEmployees(empData.results || []);
        if (locRes.ok) {
          const locData = await locRes.json();
          setStores(locData.results || []);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = employees.filter(e => {
    const name = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || (e.username || "").toLowerCase().includes(search.toLowerCase()) || (e.job_title || "").toLowerCase().includes(search.toLowerCase());
    const matchStore = !storeFilter || String(e.storeNumber) === storeFilter;
    return matchSearch && matchStore;
  });

  return (
    <div className="admin-dash support-dash">
      <div className="submenu-bar">
        <span className="submenu-label">👥 Employee Directory</span>
        <div className="submenu-actions">
          <button className="submenu-action" onClick={() => window.print()}>🖨️ PRINT</button>
        </div>
      </div>

      <div className="acct-page-controls" style={{ marginTop: "16px" }}>
        <div className="acct-page-controls__left">
          <input
            className="acct-search-input"
            type="text"
            placeholder="Search name, username, title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="rpt-month-select"
            style={{ marginLeft: "10px" }}
            value={storeFilter}
            onChange={e => setStoreFilter(e.target.value)}
          >
            <option value="">All Stores</option>
            {stores.map(s => (
              <option key={s.id} value={String(s.location_number)}>
                #{s.location_number} {s.name}
              </option>
            ))}
          </select>
          {(search || storeFilter) && (
            <button
              className="submenu-action submenu-action--clear"
              style={{ marginLeft: "8px" }}
              onClick={() => { setSearch(""); setStoreFilter(""); }}
            >× CLEAR</button>
          )}
        </div>
        <span style={{ color: "#64748b", fontSize: ".85rem" }}>{filtered.length} employee{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {loading && <p className="admin-loading">Loading…</p>}
      {!loading && error && <p className="admin-loading" style={{ color: "#ef4444" }}>{error}</p>}

      {!loading && !error && (
        <table className="support-ticket-table" style={{ marginTop: "12px", textAlign: "center" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Name</th>
              <th style={{ textAlign: "center" }}>Employee ID</th>
              <th style={{ textAlign: "center" }}>Title</th>
              <th style={{ textAlign: "center" }}>Store</th>
              <th style={{ textAlign: "center" }}>Pay Rate</th>
              <th style={{ textAlign: "center" }}>Hire Date</th>
              <th style={{ textAlign: "center" }}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#94a3b8" }}>No employees found.</td></tr>
            ) : (
              filtered.map(e => (
                <tr key={e.userId}>
                  <td>
                    <Link
                      to={`/admin/employee-profile/${e.userId}`}
                      style={{ color: "#5a87a8", textDecoration: "none", fontWeight: 600 }}
                    >
                      {[e.firstName, e.lastName].filter(Boolean).join(" ") || e.username}
                    </Link>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: ".85rem" }}>{e.employee_id || "—"}</td>
                  <td>{e.job_title || "—"}</td>
                  <td>{e.storeName || "—"}</td>
                  <td>{e.pay_rate ? `$${parseFloat(e.pay_rate).toFixed(2)}/hr` : "—"}</td>
                  <td>{fmtDate(e.hire_date)}</td>
                  <td>{fmtPhone(e.phone)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <div className="ticket-detail__footer" style={{ marginTop: "20px" }}>
        <button className="support-back-btn" onClick={() => navigate(-1)}>
          <strong>←</strong> Back
        </button>
      </div>
    </div>
  );
}
