import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

const EMPTY_FORM = {
  location_number: "",
  name: "",
  region: "",
  state_province: "",
  manager_name: "",
  address: "",
  city: "",
  zip_code: "",
  phone: "",
  email: "",
  is_active: true,
};

export default function LocationCreatePage() {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [assignManager, setAssignManager] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    Promise.all([
      fetch(`${API}/locations/regions/`, { headers: { Authorization: `Bearer ${t}` } })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d) => d.results || []),
      fetch(`${API}/users/admin-accounts/?role=STORE_MANAGER`, { headers: { Authorization: `Bearer ${t}` } })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d) => d.results || []),
    ]).then(([r, m]) => {
      setRegions(r);
      setManagers(m);
    }).catch(() => {});
  }, []);

  // States filtered by selected region
  const statesForRegion = form.region
    ? (regions.find((r) => String(r.id) === form.region)?.states || [])
    : [];

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === "region") {
      setForm((f) => ({ ...f, region: value, state_province: "" }));
    } else {
      setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    }
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.location_number) return setError("Location number is required.");
    if (!form.name.trim()) return setError("Location name is required.");
    setSaving(true);
    try {
      const t = localStorage.getItem("accessToken");
      const body = {
        location_number: Number(form.location_number),
        name: form.name.trim(),
        region: form.region ? Number(form.region) : null,
        state_province: form.state_province ? Number(form.state_province) : null,
        manager_name: form.manager_name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        zip_code: form.zip_code.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        is_active: form.is_active,
      };

      // assignManager is sent as a separate field handled by the view
      if (assignManager) body.assignManager = Number(assignManager);

      const res = await fetch(`${API}/locations/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        const detail = data?.details || data?.message || data?.error || "Failed to create location.";
        setError(typeof detail === "object" ? JSON.stringify(detail) : detail);
        return;
      }
      navigate("/admin/locations");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-dash support-dash">
      <button className="sidebar-back" style={{ marginBottom: "16px" }} onClick={() => navigate("/admin/locations")}>
        ⬅️ Back to Location Management
      </button>

      <h1 className="ticket-detail__title" style={{ marginBottom: "4px" }}>New Location</h1>
      <p className="ticket-detail__description" style={{ marginBottom: "28px" }}>
        Add a new company location. Location numbers are permanent and must be unique.
        Set up countries, regions, and states first using Region Management in the sidebar.
      </p>

      <form onSubmit={handleSubmit}>

        <div className="rgn-form-card" style={{ marginBottom: "20px" }}>
          <h2 className="rgn-section-heading">Location Identity</h2>

          <div className="acct-edit-grid">
            <div className="acct-field-group">
              <label className="acct-field-label">Location Number *</label>
              <input className="acct-field-input" type="number" name="location_number" min="1"
                value={form.location_number} onChange={handleChange} placeholder="e.g. 4" />
            </div>

            <div className="acct-field-group">
              <label className="acct-field-label">Location Name *</label>
              <input className="acct-field-input" type="text" name="name"
                value={form.name} onChange={handleChange} placeholder="e.g. Southpark Mall" />
            </div>
          </div>
        </div>

        <div className="rgn-form-card" style={{ marginBottom: "20px" }}>
          <h2 className="rgn-section-heading">Geography</h2>

          <div className="acct-edit-grid">
            <div className="acct-field-group">
              <label className="acct-field-label">Region</label>
              <select className="acct-field-input" name="region" value={form.region} onChange={handleChange}>
                <option value="">— Select region —</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.country} → {r.name}</option>
                ))}
              </select>
            </div>

            <div className="acct-field-group">
              <label className="acct-field-label">State / Province</label>
              <select className="acct-field-input" name="state_province" value={form.state_province}
                onChange={handleChange} disabled={!form.region}>
                <option value="">— Select state —</option>
                {statesForRegion.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.abbreviation ? ` (${s.abbreviation})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="acct-field-group">
              <label className="acct-field-label">City</label>
              <input className="acct-field-input" type="text" name="city"
                value={form.city} onChange={handleChange} placeholder="Raleigh" />
            </div>

            <div className="acct-field-group">
              <label className="acct-field-label">ZIP Code</label>
              <input className="acct-field-input" type="text" name="zip_code"
                value={form.zip_code} onChange={handleChange} placeholder="27601" />
            </div>
          </div>
        </div>

        <div className="rgn-form-card" style={{ marginBottom: "20px" }}>
          <h2 className="rgn-section-heading">Contact Information</h2>

          <div className="acct-edit-grid">
            <div className="acct-field-group" style={{ flexBasis: "100%", maxWidth: "100%" }}>
              <label className="acct-field-label">Address</label>
              <input className="acct-field-input" type="text" name="address"
                value={form.address} onChange={handleChange} placeholder="123 Main St" />
            </div>

            <div className="acct-field-group">
              <label className="acct-field-label">Phone</label>
              <input className="acct-field-input" type="text" name="phone"
                value={form.phone} onChange={handleChange} placeholder="9195550100" />
            </div>

            <div className="acct-field-group">
              <label className="acct-field-label">Email</label>
              <input className="acct-field-input" type="email" name="email"
                value={form.email} onChange={handleChange} placeholder="location@company.com" />
            </div>
          </div>
        </div>

        <div className="rgn-form-card" style={{ marginBottom: "20px" }}>
          <h2 className="rgn-section-heading">Manager</h2>
          <p className="ticket-detail__description" style={{ marginBottom: "14px" }}>
            Enter a name for display purposes, and optionally link an existing store manager account.
          </p>

          <div className="acct-edit-grid">
            <div className="acct-field-group">
              <label className="acct-field-label">Manager Name</label>
              <input className="acct-field-input" type="text" name="manager_name"
                value={form.manager_name} onChange={handleChange}
                placeholder="e.g. John Smith" />
            </div>

            <div className="acct-field-group">
              <label className="acct-field-label">Assign Manager Account</label>
              <select className="acct-field-input" value={assignManager}
                onChange={(e) => setAssignManager(e.target.value)}>
                <option value="">— None —</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {[m.firstName, m.lastName].filter(Boolean).join(" ") || m.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="acct-field-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <label className="acct-field-label" style={{ marginBottom: 0 }}>Active</label>
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange}
            style={{ width: "18px", height: "18px", cursor: "pointer" }} />
        </div>

        {error && <p className="acct-form-error" style={{ marginBottom: "12px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="ticket-action-btn ticket-action-btn--save" type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Location"}
          </button>
          <button type="button" className="ticket-action-btn"
            onClick={() => navigate("/admin/locations")} disabled={saving}>
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
