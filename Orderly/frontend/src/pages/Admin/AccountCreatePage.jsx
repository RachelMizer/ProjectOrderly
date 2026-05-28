import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

const PAGE_CONFIG = {
  SUPPORT:       { title: "New Support Account",       roleLabel: "Support",       backPath: "/admin/support/accounts/support" },
  EXECUTIVE:     { title: "New Executive Account",     roleLabel: "Executive",     backPath: "/admin/support/accounts/executive" },
  STORE_MANAGER: { title: "New Store Manager Account", roleLabel: "Store Manager", backPath: "/admin/support/accounts/store-manager" },
  EMPLOYEE:      { title: "New Employee Account",      roleLabel: "Employee",      backPath: "/admin/support/accounts/employee" },
  CUSTOMER:      { title: "New Customer Account",      roleLabel: "Customer",      backPath: "/admin/support/accounts/customer" },
};

export default function AccountCreatePage({ role }) {
  const navigate   = useNavigate();
  const isCustomer = role === "CUSTOMER";
  const isEmployee = role === "EMPLOYEE";
  const config     = PAGE_CONFIG[role] || { title: "New Account", roleLabel: role, backPath: "/admin/support/accounts" };

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phone: "", streetAddress: "", city: "", state: "", zipcode: "",
    storeId: null,
  });
  const [locations, setLocations] = useState([]);
  const [creating,  setCreating]  = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => {
    if (!isEmployee) return;
    const token = localStorage.getItem("accessToken");
    fetch(`${API}/locations/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((data) => setLocations(data.results || []))
      .catch(() => {});
  }, [isEmployee]);

  function field(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName.trim()) { setError("First name is required."); return; }
    if (!form.lastName.trim())  { setError("Last name is required."); return; }
    if (!form.email.trim())     { setError("Email is required."); return; }
    if (!form.password.trim())  { setError("Password is required."); return; }

    setCreating(true);
    setError("");

    const payload = { role, firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password };
    if (isCustomer) {
      payload.phone         = form.phone;
      payload.streetAddress = form.streetAddress;
      payload.city          = form.city;
      payload.state         = form.state;
      payload.zipcode       = form.zipcode;
    }
    if (isEmployee && form.storeId) {
      payload.storeId = form.storeId;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/users/admin-accounts/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        const detailPath = isCustomer
          ? `/admin/support/accounts/customer/${created.id}`
          : `/admin/support/accounts/${created.id}`;
        navigate(detailPath);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.firstName?.[0] || data?.lastName?.[0] || data?.email?.[0] ||
                    data?.password?.[0] || data?.message || "Failed to create account.";
        setError(Array.isArray(msg) ? msg[0] : msg);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header" style={{ marginBottom: "24px" }}>
        <div>
          <p className="ticket-detail__id">{config.roleLabel} Account</p>
          <h1 className="ticket-detail__title">{config.title}</h1>
        </div>
      </div>

      <div className="support-section">
        <p className="support-section-label">Account Information</p>
        <form onSubmit={handleSubmit}>
          <div className="acct-edit-grid">
            <label className="support-filter-label">
              First Name <span className="ticket-form__required">*</span>
              <input className="ticket-form__input" value={form.firstName}
                onChange={(e) => field("firstName", e.target.value)}
                placeholder="First name" disabled={creating} />
            </label>
            <label className="support-filter-label">
              Last Name <span className="ticket-form__required">*</span>
              <input className="ticket-form__input" value={form.lastName}
                onChange={(e) => field("lastName", e.target.value)}
                placeholder="Last name" disabled={creating} />
            </label>
            <label className="support-filter-label">
              Email <span className="ticket-form__required">*</span>
              <input className="ticket-form__input" type="email" value={form.email}
                onChange={(e) => field("email", e.target.value)}
                placeholder="email@example.com" disabled={creating} />
            </label>
            <label className="support-filter-label">
              Password <span className="ticket-form__required">*</span>
              <input className="ticket-form__input" type="password" value={form.password}
                onChange={(e) => field("password", e.target.value)}
                placeholder="Minimum 8 characters" disabled={creating} />
            </label>

            {isEmployee && (
              <label className="support-filter-label">
                Store Assignment
                <select
                  className="support-filter-select"
                  value={form.storeId ?? ""}
                  onChange={(e) => field("storeId", e.target.value === "" ? null : Number(e.target.value))}
                  disabled={creating}
                >
                  <option value="">— Unassigned —</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      #{String(loc.location_number).padStart(3, "0")} {loc.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {isCustomer && (
              <>
                <label className="support-filter-label">
                  Phone
                  <input className="ticket-form__input" value={form.phone}
                    onChange={(e) => field("phone", e.target.value)}
                    placeholder="e.g. 5551234567" disabled={creating} />
                </label>
                <label className="support-filter-label">
                  Street Address
                  <input className="ticket-form__input" value={form.streetAddress}
                    onChange={(e) => field("streetAddress", e.target.value)}
                    placeholder="123 Main St" disabled={creating} />
                </label>
                <label className="support-filter-label">
                  City
                  <input className="ticket-form__input" value={form.city}
                    onChange={(e) => field("city", e.target.value)}
                    placeholder="City" disabled={creating} />
                </label>
                <label className="support-filter-label">
                  State
                  <input className="ticket-form__input" value={form.state}
                    onChange={(e) => field("state", e.target.value.toUpperCase())}
                    placeholder="NC" maxLength={2} disabled={creating} />
                </label>
                <label className="support-filter-label">
                  ZIP Code
                  <input className="ticket-form__input" value={form.zipcode}
                    onChange={(e) => field("zipcode", e.target.value)}
                    placeholder="12345" disabled={creating} />
                </label>
              </>
            )}
          </div>

          {error && <p className="ticket-form__error" style={{ marginTop: "10px" }}>{error}</p>}

          <div className="ticket-detail__save-row" style={{ marginTop: "16px" }}>
            <button type="submit" className="ticket-form__submit" disabled={creating}>
              {creating ? "Creating…" : "Create Account"}
            </button>
            <button type="button" className="ticket-form__cancel" disabled={creating}
              onClick={() => navigate(config.backPath)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
