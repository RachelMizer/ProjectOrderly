import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_HOST from "../../config";
import { getAuthHeaders } from "../../api/auth";

const API = `${API_HOST}/api/v1/store-manager/pay-periods`;

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PayPeriodPage() {
  const navigate = useNavigate();
  const [periods, setPeriods]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm]         = useState({ name: "", startDate: "", endDate: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(API + "/", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load pay periods.");
      const data = await res.json();
      setPeriods(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    setFormError("");
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      setFormError("Name, start date, and end date are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(API + "/", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ name: form.name.trim(), startDate: form.startDate, endDate: form.endDate }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.name?.[0] || d.endDate?.[0] || d.detail || "Failed to create.");
      }
      const p = await res.json();
      setPeriods(prev => [p, ...prev]);
      setForm({ name: "", startDate: "", endDate: "" });
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(id) {
    setSaving(true);
    try {
      const res = await fetch(`${API}/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name: editForm.name,
          startDate: editForm.startDate,
          endDate: editForm.endDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to save.");
      const updated = await res.json();
      setPeriods(prev => prev.map(p => p.id === id ? updated : p));
      setEditingId(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deletePeriod(id) {
    if (!window.confirm("Delete this pay period?")) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/${id}/`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to delete.");
      setPeriods(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header" style={{ marginBottom: "20px" }}>
        <h1 className="ticket-detail__title">Pay Periods</h1>
      </div>

      {/* Create form */}
      <div className="emp-prof-card">
        <p className="emp-prof-section-title">Create New Pay Period</p>
        {formError && <p style={{ color: "#ef4444", fontSize: ".85rem", marginBottom: "8px" }}>{formError}</p>}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label className="acct-field-label">Name</label>
            <input
              className="acct-field-input"
              placeholder="e.g. July 2025"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="acct-field-label">Start Date</label>
            <input
              className="acct-field-input"
              type="date"
              value={form.startDate}
              onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="acct-field-label">End Date</label>
            <input
              className="acct-field-input"
              type="date"
              value={form.endDate}
              onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
            />
          </div>
          <button
            className="ticket-action-btn ticket-action-btn--save"
            onClick={create}
            disabled={saving}
          >Add Period</button>
        </div>
      </div>

      {loading && <p className="admin-loading">Loading…</p>}
      {!loading && error && <p className="admin-loading" style={{ color: "#ef4444" }}>{error}</p>}

      {!loading && !error && (
        <table className="support-ticket-table" style={{ marginTop: "16px" }}>
          <thead>
            <tr><th>Name</th><th>Start</th><th>End</th><th></th></tr>
          </thead>
          <tbody>
            {periods.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8" }}>No pay periods yet.</td></tr>
            ) : (
              periods.map(p => {
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id}>
                    {isEditing ? (
                      <>
                        <td><input className="acct-field-input" style={{ fontSize: ".8rem", width: "100%" }} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></td>
                        <td><input className="acct-field-input" type="date" style={{ fontSize: ".8rem" }} value={editForm.startDate} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))} /></td>
                        <td><input className="acct-field-input" type="date" style={{ fontSize: ".8rem" }} value={editForm.endDate} onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))} /></td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <button className="sched-panel__add-btn" style={{ fontSize: ".75rem", marginRight: "4px" }} onClick={() => saveEdit(p.id)} disabled={saving}>Save</button>
                          <button className="sched-panel__cancel-btn" style={{ fontSize: ".75rem" }} onClick={() => setEditingId(null)}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{fmtDate(p.startDate)}</td>
                        <td>{fmtDate(p.endDate)}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <button className="sched-panel__cancel-btn" style={{ fontSize: ".75rem", marginRight: "4px" }} onClick={() => { setEditingId(p.id); setEditForm({ name: p.name, startDate: p.startDate, endDate: p.endDate }); }} disabled={saving}>Edit</button>
                          <button className="sched-panel__emp-remove" style={{ fontSize: ".8rem", padding: "5px 8px 2px" }} onClick={() => deletePeriod(p.id)} disabled={saving}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
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
