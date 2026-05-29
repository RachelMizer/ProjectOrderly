import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

const PAGE_CONFIG = {
  SUPPORT:       { title: "Support Team Accounts",   roleLabel: "Support",       createPath: "/admin/support/accounts/support/new" },
  EXECUTIVE:     { title: "Executive Accounts",       roleLabel: "Executive",     createPath: "/admin/support/accounts/executive/new" },
  STORE_MANAGER: { title: "Store Manager Accounts",  roleLabel: "Store Manager", createPath: "/admin/support/accounts/store-manager/new" },
  EMPLOYEE:      { title: "Employee Accounts",        roleLabel: "Employee",      createPath: "/admin/support/accounts/employee/new" },
  CUSTOMER:      { title: "Customer Accounts",        roleLabel: "Customer",      createPath: "/admin/support/accounts/customer/new" },
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function AccountsListPage({ role }) {
  const navigate   = useNavigate();
  const isCustomer = role === "CUSTOMER";
  const config     = PAGE_CONFIG[role] || { title: "Accounts", roleLabel: role, createPath: "/admin/support/accounts" };

  const [accounts, setAccounts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/users/admin-accounts/?role=${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAccounts(data.results || []);
        }
      } catch (err) {
        console.error("Failed to load accounts:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role]);

  const filtered = accounts.filter((a) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const name = [a.firstName, a.lastName].filter(Boolean).join(" ").toLowerCase();
    return (
      name.includes(term) ||
      a.email?.toLowerCase().includes(term) ||
      (isCustomer && a.phone?.includes(term))
    );
  });

  function detailPath(id) {
    return isCustomer
      ? `/admin/support/accounts/customer/${id}`
      : `/admin/support/accounts/${id}`;
  }

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header" style={{ marginBottom: "20px" }}>
        <h1 className="ticket-detail__title">{config.title}</h1>
        <span className="roster__count">
          {loading ? "…" : `${accounts.length} ${accounts.length === 1 ? "account" : "accounts"}`}
        </span>
      </div>

      <div className="acct-page-controls">
        <div className="acct-page-controls__left">
          <label className="acct-search-label">Search accounts</label>
          <input
            className="acct-search-input"
            type="text"
            placeholder="Name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="ticket-form__submit acct-create-btn"
          onClick={() => navigate(config.createPath)}
        >
          + New Account
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="my-tickets__empty">
          <p className="my-tickets__empty-icon">👤</p>
          <p className="my-tickets__empty-heading">
            {search ? "No accounts match your search" : `No ${config.roleLabel.toLowerCase()} accounts yet`}
          </p>
          {!search && (
            <p className="my-tickets__empty-body">
              Use the "+ New Account" button above to create one.
            </p>
          )}
        </div>
      ) : (
        <table className="support-ticket-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {isCustomer && <th>Phone</th>}
              <th>Status</th>
              <th>Member Since</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((acct) => (
              <tr key={acct.id} onClick={() => navigate(detailPath(acct.id))}>
                <td>{[acct.firstName, acct.lastName].filter(Boolean).join(" ") || acct.email}</td>
                <td>{acct.email}</td>
                {isCustomer && <td>{acct.phone || "—"}</td>}
                <td>
                  <span className={`acct-status-badge acct-status-badge--${acct.isActive ? "active" : "inactive"}`}>
                    {acct.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{fmtDate(acct.dateJoined)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="ticket-detail__footer">
        <button className="support-back-btn" onClick={() => navigate("/admin/support/accounts")}>
          <strong>←</strong> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
