import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

const EMPTY_REGION = { name: "", country: "" };
const EMPTY_STATE = { name: "", abbreviation: "", region: "" };

export default function RegionManagementPage() {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [regionForm, setRegionForm] = useState(EMPTY_REGION);
  const [regionSaving, setRegionSaving] = useState(false);
  const [regionError, setRegionError] = useState("");

  const [stateForm, setStateForm] = useState(EMPTY_STATE);
  const [stateSaving, setStateSaving] = useState(false);
  const [stateError, setStateError] = useState("");

  // Inline editing for existing states
  const [editingStateId, setEditingStateId] = useState(null);
  const [editDraft, setEditDraft] = useState({ name: "", abbreviation: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  function token() { return localStorage.getItem("accessToken"); }

  function loadRegions() {
    fetch(`${API}/locations/regions/`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((data) => setRegions(data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadRegions(); }, []);

  function handleRegionChange(e) {
    setRegionForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setRegionError("");
  }

  function handleStateChange(e) {
    setStateForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setStateError("");
  }

  function startEditState(s) {
    setEditingStateId(s.id);
    setEditDraft({ name: s.name, abbreviation: s.abbreviation || "" });
    setEditError("");
  }

  function cancelEdit() {
    setEditingStateId(null);
    setEditDraft({ name: "", abbreviation: "" });
    setEditError("");
  }

  async function saveEditState(stateId) {
    if (!editDraft.name.trim()) return setEditError("Name is required.");
    setEditSaving(true); setEditError("");
    try {
      const res = await fetch(`${API}/locations/states/${stateId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editDraft.name.trim(),
          abbreviation: editDraft.abbreviation.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data?.details?.name?.[0] || data?.message || "Failed to save.");
        return;
      }
      setEditingStateId(null);
      loadRegions();
    } catch {
      setEditError("An unexpected error occurred.");
    } finally {
      setEditSaving(false);
    }
  }

  async function submitRegion(e) {
    e.preventDefault();
    if (!regionForm.name.trim()) return setRegionError("Region name is required.");
    if (!regionForm.country.trim()) return setRegionError("Country is required.");
    setRegionSaving(true);
    try {
      const res = await fetch(`${API}/locations/regions/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: regionForm.name.trim(), country: regionForm.country.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegionError(data?.details?.name?.[0] || data?.message || "Failed to create region.");
        return;
      }
      setRegionForm(EMPTY_REGION);
      loadRegions();
    } catch {
      setRegionError("An unexpected error occurred.");
    } finally {
      setRegionSaving(false);
    }
  }

  async function submitState(e) {
    e.preventDefault();
    if (!stateForm.name.trim()) return setStateError("State/Province name is required.");
    if (!stateForm.region) return setStateError("Please select a region.");
    setStateSaving(true);
    try {
      const res = await fetch(`${API}/locations/states/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: stateForm.name.trim(),
          abbreviation: stateForm.abbreviation.trim().toUpperCase(),
          region: Number(stateForm.region),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStateError(data?.details?.name?.[0] || data?.message || "Failed to create state/province.");
        return;
      }
      setStateForm(EMPTY_STATE);
      loadRegions();
    } catch {
      setStateError("An unexpected error occurred.");
    } finally {
      setStateSaving(false);
    }
  }

  return (
    <div className="admin-dash support-dash">
      <button className="sidebar-back" style={{ marginBottom: "16px" }} onClick={() => navigate("/admin/locations")}>
        ⬅️ Back to Location Management
      </button>

      <h1 className="ticket-detail__title" style={{ marginBottom: "4px" }}>Region Management</h1>
      <p className="ticket-detail__description" style={{ marginBottom: "28px" }}>
        Set up the geographic hierarchy used when creating locations: Country → Region → State / Province.
        Click any state chip to edit it.
      </p>

      <div className="rgn-layout">

        {/* ── Left column: existing hierarchy ── */}
        <div className="rgn-col rgn-col--list">
          <h2 className="rgn-section-heading">Current Hierarchy</h2>
          {loading ? (
            <p className="admin-loading">Loading...</p>
          ) : regions.length === 0 ? (
            <p className="acct-deleted-empty">No regions yet. Add one using the form.</p>
          ) : (
            <table className="support-ticket-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Region</th>
                  <th>States / Provinces</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r) => (
                  <tr key={r.id}>
                    <td style={{ textAlign: "left" }}>{r.country || "—"}</td>
                    <td style={{ fontWeight: 700, textAlign: "left" }}>{r.name}</td>
                    <td style={{ textAlign: "left" }}>
                      {r.states && r.states.length > 0
                        ? r.states.map((s) => (
                            editingStateId === s.id ? (
                              <span key={s.id} className="rgn-state-edit">
                                <input
                                  className="rgn-state-edit__input"
                                  value={editDraft.name}
                                  onChange={(e) => { setEditDraft((d) => ({ ...d, name: e.target.value })); setEditError(""); }}
                                  placeholder="Name"
                                  autoFocus
                                />
                                <input
                                  className="rgn-state-edit__input rgn-state-edit__input--abbr"
                                  value={editDraft.abbreviation}
                                  onChange={(e) => { setEditDraft((d) => ({ ...d, abbreviation: e.target.value })); setEditError(""); }}
                                  placeholder="Abbr"
                                  maxLength={10}
                                />
                                <button className="rgn-state-edit__btn rgn-state-edit__btn--save"
                                  onClick={() => saveEditState(s.id)} disabled={editSaving}>
                                  {editSaving ? "..." : "Save"}
                                </button>
                                <button className="rgn-state-edit__btn" onClick={cancelEdit} disabled={editSaving}>
                                  Cancel
                                </button>
                                {editError && <span className="rgn-state-edit__error">{editError}</span>}
                              </span>
                            ) : (
                              <span key={s.id} className="rgn-state-chip rgn-state-chip--editable"
                                onClick={() => startEditState(s)} title="Click to edit">
                                {s.name}{s.abbreviation ? ` (${s.abbreviation})` : ""}
                              </span>
                            )
                          ))
                        : <span style={{ color: "#8faabf", fontSize: ".8rem" }}>None added yet</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Right column: add forms ── */}
        <div className="rgn-col rgn-col--forms">

          {/* Add Region */}
          <div className="rgn-form-card">
            <h2 className="rgn-section-heading">Add a Region</h2>
            <p className="ticket-detail__description" style={{ marginBottom: "14px" }}>
              A region groups locations by geography under a country (e.g., "Southeast" under "United States").
            </p>
            <form onSubmit={submitRegion}>
              <div className="acct-field-group" style={{ marginBottom: "10px" }}>
                <label className="acct-field-label">Country *</label>
                <input
                  className="acct-field-input"
                  type="text"
                  name="country"
                  value={regionForm.country}
                  onChange={handleRegionChange}
                  placeholder="e.g. United States"
                />
              </div>
              <div className="acct-field-group" style={{ marginBottom: "10px" }}>
                <label className="acct-field-label">Region Name *</label>
                <input
                  className="acct-field-input"
                  type="text"
                  name="name"
                  value={regionForm.name}
                  onChange={handleRegionChange}
                  placeholder="e.g. Southeast"
                />
              </div>
              {regionError && <p className="acct-form-error">{regionError}</p>}
              <button className="ticket-action-btn ticket-action-btn--save" type="submit" disabled={regionSaving}>
                {regionSaving ? "Saving..." : "Add Region"}
              </button>
            </form>
          </div>

          {/* Add State/Province */}
          <div className="rgn-form-card" style={{ marginTop: "20px" }}>
            <h2 className="rgn-section-heading">Add a State / Province</h2>
            <p className="ticket-detail__description" style={{ marginBottom: "14px" }}>
              States and provinces are nested under a region and appear as options when creating a location.
            </p>
            <form onSubmit={submitState}>
              <div className="acct-field-group" style={{ marginBottom: "10px" }}>
                <label className="acct-field-label">Region *</label>
                <select
                  className="acct-field-input"
                  name="region"
                  value={stateForm.region}
                  onChange={handleStateChange}
                >
                  <option value="">— Select a region —</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.country} → {r.name}</option>
                  ))}
                </select>
              </div>
              <div className="acct-field-group" style={{ marginBottom: "10px" }}>
                <label className="acct-field-label">State / Province Name *</label>
                <input
                  className="acct-field-input"
                  type="text"
                  name="name"
                  value={stateForm.name}
                  onChange={handleStateChange}
                  placeholder="e.g. North Carolina"
                />
              </div>
              <div className="acct-field-group" style={{ marginBottom: "10px" }}>
                <label className="acct-field-label">Abbreviation</label>
                <input
                  className="acct-field-input"
                  type="text"
                  name="abbreviation"
                  value={stateForm.abbreviation}
                  onChange={handleStateChange}
                  placeholder="e.g. NC"
                  maxLength={10}
                  style={{ maxWidth: "100px" }}
                />
              </div>
              {stateError && <p className="acct-form-error">{stateError}</p>}
              <button className="ticket-action-btn ticket-action-btn--save" type="submit" disabled={stateSaving}>
                {stateSaving ? "Saving..." : "Add State / Province"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
