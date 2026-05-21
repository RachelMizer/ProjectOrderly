import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

const PAGE_CONFIG = {
  SUPPORT:   { title: "Support Team Accounts",   roleLabel: "Support" },
  EXECUTIVE:     { title: "Executive Accounts",     roleLabel: "Executive" },
  STORE_MANAGER: { title: "Store Manager Accounts", roleLabel: "Store Manager" },
  EMPLOYEE:      { title: "Employee Accounts",      roleLabel: "Employee" },
  CUSTOMER:  { title: "Customer Accounts",  roleLabel: "Customer" },
};

const EMPTY_ADMIN_FORM = { firstName: "", lastName: "", email: "", password: "" };
const EMPTY_CUSTOMER_FORM = {
  firstName: "", lastName: "", email: "", password: "",
  phone: "", streetAddress: "", city: "", state: "", zipcode: "",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function AccountsListPage({ role }) {
  const navigate    = useNavigate();
  const isCustomer  = role === "CUSTOMER";
  const config      = PAGE_CONFIG[role] || { title: "Accounts", roleLabel: role };

  const [accounts,    setAccounts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [showCreate,  setShowCreate]  = useState(false);
  const [form,        setForm]        = useState(isCustomer ? EMPTY_CUSTOMER_FORM : EMPTY_ADMIN_FORM);
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState("");

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

  function resetCreate() {
    setForm(isCustomer ? EMPTY_CUSTOMER_FORM : EMPTY_ADMIN_FORM);
    setCreateError("");
    setShowCreate(false);
  }

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
      const payload = isCustomer ? { ...form, role } : { ...form, role };
      const res = await fetch(`${API}/users/admin-accounts/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setAccounts((prev) =>
          [...prev, created].sort((a, b) =>
            (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)
          )
        );
        resetCreate();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.firstName?.[0] || data?.lastName?.[0] || data?.email?.[0] ||
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
      <div className="ticket-detail__header" style={{ marginBottom: "20px" }}>
        <h1 className="ticket-detail__title">{config.title}</h1>
        <span className="roster__count">
          {loading ? "…" : `${accounts.length} ${accounts.length === 1 ? "account" : "accounts"}`}
        </span>
      </div>

      {/* Submenu / controls */}
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
          onClick={() => { setShowCreate((v) => !v); setCreateError(""); }}
        >
          {showCreate ? "Cancel" : "+ New Account"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="backlog__create-form" style={{ marginBottom: "20px" }}>
          <p className="support-section-label">New {config.roleLabel} Account</p>
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
                <span>Password <span className="ticket-form__required">*</span></span>
                <input className="ticket-form__input" type="password" value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimum 8 characters" disabled={creating} />
              </label>
              {isCustomer && (
                <>
                  <label className="support-filter-label">
                    Phone
                    <input className="ticket-form__input" value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="e.g. 5551234567" disabled={creating} />
                  </label>
                  <label className="support-filter-label">
                    Street Address
                    <input className="ticket-form__input" value={form.streetAddress}
                      onChange={(e) => setForm((f) => ({ ...f, streetAddress: e.target.value }))}
                      placeholder="123 Main St" disabled={creating} />
                  </label>
                  <label className="support-filter-label">
                    City
                    <input className="ticket-form__input" value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      placeholder="City" disabled={creating} />
                  </label>
                  <label className="support-filter-label">
                    State
                    <input className="ticket-form__input" value={form.state}
                      onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                      placeholder="NC" maxLength={2} disabled={creating} />
                  </label>
                  <label className="support-filter-label">
                    ZIP Code
                    <input className="ticket-form__input" value={form.zipcode}
                      onChange={(e) => setForm((f) => ({ ...f, zipcode: e.target.value }))}
                      placeholder="12345" disabled={creating} />
                  </label>
                </>
              )}
            </div>
            {createError && <p className="ticket-form__error" style={{ marginTop: "8px" }}>{createError}</p>}
            <div className="ticket-form__actions" style={{ marginTop: "14px" }}>
              <button type="submit" className="ticket-form__submit" disabled={creating}>
                {creating ? "Creating…" : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
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
