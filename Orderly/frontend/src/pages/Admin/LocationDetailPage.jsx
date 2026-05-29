import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { saveRecentView } from "../../utils/recentViews";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

const EMPTY_DRAFT = {
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

export default function LocationDetailPage() {
  const { locationId } = useParams();
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [regions, setRegions] = useState([]);
  const [managers, setManagers] = useState([]);

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [assignManager, setAssignManager] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");


  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    Promise.all([
      fetch(`${API}/locations/${locationId}/`, { headers: { Authorization: `Bearer ${t}` } }),
      fetch(`${API}/locations/regions/`, { headers: { Authorization: `Bearer ${t}` } })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d) => d.results || []),
      fetch(`${API}/users/admin-accounts/?role=STORE_MANAGER`, { headers: { Authorization: `Bearer ${t}` } })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d) => d.results || []),
    ])
      .then(async ([locRes, r, m]) => {
        if (locRes.status === 404) { setNotFound(true); return; }
        if (locRes.ok) {
          const loc = await locRes.json();
          setLocation(loc);
          saveRecentView({
            section: `location-${loc.id}`,
            label: `Location #${loc.location_number} — ${loc.name}`,
            sublabel: [loc.city, loc.state_province_abbr || loc.state_province_name].filter(Boolean).join(", ") || "Location detail",
            path: `/admin/locations/${loc.id}`,
          });
          setDraft({
            location_number: loc.location_number ?? "",
            name: loc.name ?? "",
            region: loc.region != null ? String(loc.region) : "",
            state_province: loc.state_province != null ? String(loc.state_province) : "",
            manager_name: loc.manager_name ?? "",
            address: loc.address ?? "",
            city: loc.city ?? "",
            zip_code: loc.zip_code ?? "",
            phone: loc.phone ?? "",
            email: loc.email ?? "",
            is_active: loc.is_active ?? true,
          });
        }
        setRegions(r);
        setManagers(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locationId]);

  const statesForRegion = draft.region
    ? (regions.find((r) => String(r.id) === draft.region)?.states || [])
    : [];

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === "region") {
      setDraft((d) => ({ ...d, region: value, state_province: "" }));
    } else {
      setDraft((d) => ({ ...d, [name]: type === "checkbox" ? checked : value }));
    }
    setSaveError("");
    setSaveSuccess(false);
  }

  const hasChanges = location && (
    String(draft.location_number) !== String(location.location_number) ||
    draft.name !== (location.name ?? "") ||
    draft.region !== (location.region != null ? String(location.region) : "") ||
    draft.state_province !== (location.state_province != null ? String(location.state_province) : "") ||
    draft.manager_name !== (location.manager_name ?? "") ||
    draft.address !== (location.address ?? "") ||
    draft.city !== (location.city ?? "") ||
    draft.zip_code !== (location.zip_code ?? "") ||
    draft.phone !== (location.phone ?? "") ||
    draft.email !== (location.email ?? "") ||
    draft.is_active !== location.is_active ||
    assignManager !== ""
  );

  async function handleSave() {
    if (!hasChanges) return;
    if (!draft.location_number) return setSaveError("Location number is required.");
    if (!draft.name.trim()) return setSaveError("Location name is required.");
    setSaving(true); setSaveError(""); setSaveSuccess(false);
    try {
      const t = localStorage.getItem("accessToken");
      const body = {
        location_number: Number(draft.location_number),
        name: draft.name.trim(),
        region: draft.region ? Number(draft.region) : null,
        state_province: draft.state_province ? Number(draft.state_province) : null,
        manager_name: draft.manager_name.trim(),
        address: draft.address.trim(),
        city: draft.city.trim(),
        zip_code: draft.zip_code.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim(),
        is_active: draft.is_active,
      };
      if (assignManager) body.assignManager = Number(assignManager);

      const res = await fetch(`${API}/locations/${locationId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setLocation(data);
        setAssignManager("");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const detail = data?.details || data?.message || data?.error || "Failed to save changes.";
        setSaveError(typeof detail === "object" ? JSON.stringify(detail) : detail);
      }
    } catch {
      setSaveError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }


  if (loading) return <div className="admin-dash support-dash"><p className="admin-loading">Loading location...</p></div>;
  if (notFound) return (
    <div className="admin-dash support-dash">
      <button className="sidebar-back" onClick={() => navigate("/admin/locations")}>⬅️ Back to Location Management</button>
      <p className="acct-deleted-empty" style={{ marginTop: "24px" }}>Location not found.</p>
    </div>
  );

  return (
    <div className="admin-dash support-dash">
      <button className="sidebar-back" style={{ marginBottom: "16px" }} onClick={() => navigate("/admin/locations")}>
        ⬅️ Back to Location Management
      </button>

      <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "4px", flexWrap: "wrap" }}>
        <h1 className="ticket-detail__title" style={{ marginBottom: 0 }}>
          Location #{location.location_number} — {location.name}
        </h1>
        <span className={`status-badge status-badge--${location.is_active ? "open" : "closed"}`}>
          {location.is_active ? "Active" : "Inactive"}
        </span>
      </div>
      <p className="ticket-detail__description" style={{ marginBottom: "28px" }}>
        Edit the details for this location. Changes are saved when you click Save Changes.
      </p>

      <div className="rgn-form-card" style={{ marginBottom: "20px" }}>
        <h2 className="rgn-section-heading">Location Identity</h2>
        <div className="acct-edit-grid">
          <div className="acct-field-group">
            <label className="acct-field-label">Location Number *</label>
            <input className="acct-field-input" type="number" name="location_number" min="1"
              value={draft.location_number} onChange={handleChange} />
          </div>
          <div className="acct-field-group">
            <label className="acct-field-label">Location Name *</label>
            <input className="acct-field-input" type="text" name="name"
              value={draft.name} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="rgn-form-card" style={{ marginBottom: "20px" }}>
        <h2 className="rgn-section-heading">Geography</h2>
        <div className="acct-edit-grid">
          <div className="acct-field-group">
            <label className="acct-field-label">Region</label>
            <select className="acct-field-input" name="region" value={draft.region} onChange={handleChange}>
              <option value="">— Select region —</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.country} → {r.name}</option>
              ))}
            </select>
          </div>
          <div className="acct-field-group">
            <label className="acct-field-label">State / Province</label>
            <select className="acct-field-input" name="state_province" value={draft.state_province}
              onChange={handleChange} disabled={!draft.region}>
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
              value={draft.city} onChange={handleChange} />
          </div>
          <div className="acct-field-group">
            <label className="acct-field-label">ZIP Code</label>
            <input className="acct-field-input" type="text" name="zip_code"
              value={draft.zip_code} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="rgn-form-card" style={{ marginBottom: "20px" }}>
        <h2 className="rgn-section-heading">Contact Information</h2>
        <div className="acct-edit-grid">
          <div className="acct-field-group" style={{ flexBasis: "100%", maxWidth: "100%" }}>
            <label className="acct-field-label">Address</label>
            <input className="acct-field-input" type="text" name="address"
              value={draft.address} onChange={handleChange} />
          </div>
          <div className="acct-field-group">
            <label className="acct-field-label">Phone</label>
            <input className="acct-field-input" type="text" name="phone"
              value={draft.phone} onChange={handleChange} />
          </div>
          <div className="acct-field-group">
            <label className="acct-field-label">Email</label>
            <input className="acct-field-input" type="email" name="email"
              value={draft.email} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="rgn-form-card" style={{ marginBottom: "20px" }}>
        <h2 className="rgn-section-heading">Manager</h2>
        <div className="acct-edit-grid">
          <div className="acct-field-group">
            <label className="acct-field-label">Manager Name</label>
            <input className="acct-field-input" type="text" name="manager_name"
              value={draft.manager_name} onChange={handleChange} />
          </div>
          <div className="acct-field-group">
            <label className="acct-field-label">Reassign Manager Account</label>
            <select className="acct-field-input" value={assignManager}
              onChange={(e) => { setAssignManager(e.target.value); setSaveSuccess(false); }}>
              <option value="">— No change —</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {[m.firstName, m.lastName].filter(Boolean).join(" ") || m.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {location.staff && location.staff.length > 0 && (
          <div style={{ marginTop: "14px" }}>
            <p className="acct-field-label" style={{ marginBottom: "8px" }}>Currently Assigned Staff</p>
            <table className="support-ticket-table" style={{ marginTop: 0 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {location.staff.map((s) => (
                  <tr key={s.id}>
                    <td style={{ textAlign: "left" }}>{s.name || "—"}</td>
                    <td>{s.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="acct-field-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <label className="acct-field-label" style={{ marginBottom: 0 }}>Active</label>
        <input type="checkbox" name="is_active" checked={draft.is_active} onChange={handleChange}
          style={{ width: "18px", height: "18px", cursor: "pointer" }} />
      </div>

      {saveError && <p className="acct-form-error" style={{ marginBottom: "12px" }}>{saveError}</p>}
      {saveSuccess && <p className="acct-form-success" style={{ marginBottom: "12px" }}>Changes saved successfully.</p>}

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <button
          className="ticket-action-btn ticket-action-btn--save"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
