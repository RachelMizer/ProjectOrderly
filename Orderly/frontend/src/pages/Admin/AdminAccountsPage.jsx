import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

const ROLE_OPTIONS = ["STORE_MANAGER", "EMPLOYEE", "EXECUTIVE", "SUPPORT"];
const ROLE_LABELS  = { STORE_MANAGER: "Store Manager", EMPLOYEE: "Employee", EXECUTIVE: "Executive", SUPPORT: "Support" };

const EMPTY_FORM = { firstName: "", lastName: "", email: "", role: "STORE_MANAGER", password: "" };

const ROLE_LABELS_DEL = { STORE_MANAGER: "Store Manager", EMPLOYEE: "Employee", EXECUTIVE: "Executive", SUPPORT: "Support" };

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function AdminAccountsPage() {
  const navigate  = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleted, setDeleted]   = useState([]);
  const [deletedLoading, setDeletedLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    async function loadActive() {
      try {
        const res = await fetch(`${API}/users/admin-accounts/`, {
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

    async function loadDeleted() {
      try {
        const res = await fetch(`${API}/users/deleted-accounts/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDeleted(data.results || []);
        }
      } catch (err) {
        console.error("Failed to load deleted accounts:", err);
      } finally {
        setDeletedLoading(false);
      }
    }

    loadActive();
    loadDeleted();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.firstName.trim()) { setCreateError("First name is required."); return; }
    if (!form.lastName.trim())  { setCreateError("Last name is required."); return; }
    if (!form.email.trim())     { setCreateError("Email is required."); return; }
    if (!form.password.trim())  { setCreateError("Password is required."); return; }
    setCreating(true);
    setCreateError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/users/admin-accounts/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json();
        setAccounts((prev) => [...prev, created].sort((a, b) =>
          (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)
        ));
        setForm(EMPTY_FORM);
        setShowCreate(false);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.firstName?.[0] || data?.lastName?.[0] || data?.email?.[0] ||
                    data?.password?.[0] || data?.message || "Failed to create account.";
        setCreateError(Array.isArray(msg) ? msg[0] : msg);
      }
    } catch {
      setCreateError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="admin-dash support-dash">
      <div className="backlog__header">
        <h1>User Accounts</h1>
        <button
          className="ticket-form__submit backlog__new-btn"
          onClick={() => { setShowCreate((v) => !v); setCreateError(""); setForm(EMPTY_FORM); }}
        >
          {showCreate ? "Cancel" : "+ New Account"}
        </button>
      </div>

      {showCreate && (
        <div className="backlog__create-form">
          <p className="support-section-label">New Admin Account</p>
          <form onSubmit={handleCreate}>
            <div className="acct-create-grid">
              <label className="support-filter-label">
                <span>First Name <span className="ticket-form__required">*</span></span>
                <input className="ticket-form__input" value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="First name" disabled={creating} />
              </label>
              <label className="support-filter-label">
                <span>Last Name <span className="ticket-form__required">*</span></span>
                <input className="ticket-form__input" value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="Last name" disabled={creating} />
              </label>
              <label className="support-filter-label">
                <span>Email <span className="ticket-form__required">*</span></span>
                <input className="ticket-form__input" type="email" value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com" disabled={creating} />
              </label>
              <label className="support-filter-label">
                Role
                <select className="support-filter-select" value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  disabled={creating}>
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </label>
              <label className="support-filter-label">
                <span>Password <span className="ticket-form__required">*</span></span>
                <input className="ticket-form__input" type="password" value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimum 8 characters" disabled={creating} />
              </label>
            </div>
            {createError && <p className="ticket-form__error">{createError}</p>}
            <div className="ticket-form__actions">
              <button type="submit" className="ticket-form__submit" disabled={creating}>
                {creating ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : accounts.length === 0 ? (
        <div className="my-tickets__empty">
          <p className="my-tickets__empty-icon">👤</p>
          <p className="my-tickets__empty-heading">No accounts yet</p>
          <p className="my-tickets__empty-body">Create the first admin account using the button above.</p>
        </div>
      ) : (
        <table className="support-ticket-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acct) => (
              <tr key={acct.id} onClick={() => navigate(`/admin/support/accounts/${acct.id}`)}>
                <td>{[acct.firstName, acct.lastName].filter(Boolean).join(" ") || acct.email}</td>
                <td>{acct.email}</td>
                <td>
                  <span className={`acct-role-badge acct-role-badge--${acct.role?.toLowerCase()}`}>
                    {ROLE_LABELS[acct.role] || acct.role}
                  </span>
                </td>
                <td>
                  <span className={`acct-status-badge acct-status-badge--${acct.isActive ? "active" : "inactive"}`}>
                    {acct.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: "36px" }}>
        <h2 className="acct-deleted-heading">Deleted Accounts</h2>
        {deletedLoading ? (
          <p className="admin-loading">Loading...</p>
        ) : deleted.length === 0 ? (
          <p className="acct-deleted-empty">No accounts have been deleted.</p>
        ) : (
          <table className="support-ticket-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Deleted By</th>
                <th>Date Deleted</th>
              </tr>
            </thead>
            <tbody>
              {deleted.map((rec) => (
                <tr key={rec.id} style={{ cursor: "default" }}>
                  <td>{[rec.firstName, rec.lastName].filter(Boolean).join(" ") || rec.email}</td>
                  <td>{rec.email}</td>
                  <td>
                    <span className={`acct-role-badge acct-role-badge--${rec.role?.toLowerCase()}`}>
                      {ROLE_LABELS_DEL[rec.role] || rec.role || "—"}
                    </span>
                  </td>
                  <td>{rec.deletedByName || "—"}</td>
                  <td>{fmtDate(rec.deletedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
