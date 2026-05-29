import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

const TYPE_LABELS   = { BUG: "Bug", FEATURE: "Feature Request" };
const STATUS_LABELS = { PENDING: "Pending", IN_PROGRESS: "In Progress", DONE: "Done" };
const PRIORITY_LABELS = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent" };
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const TYPE_OPTIONS  = ["BUG", "FEATURE"];

const TYPE_FILTERS   = [{ value: "", label: "All" }, { value: "BUG", label: "Bug" }, { value: "FEATURE", label: "Feature Request" }];
const STATUS_FILTERS = [{ value: "", label: "All" }, { value: "PENDING", label: "Pending" }, { value: "IN_PROGRESS", label: "In Progress" }, { value: "DONE", label: "Done" }];

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date(date);
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
}

const EMPTY_CREATE = { title: "", itemType: "BUG", priority: "MEDIUM", description: "" };

export default function BacklogPage() {
  const navigate = useNavigate();
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [typeFilter, setTypeFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate]     = useState(false);
  const [createForm, setCreateForm]     = useState(EMPTY_CREATE);
  const [createError, setCreateError]   = useState("");
  const [creating, setCreating]         = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((u) => { if (u?.role !== "SUPPORT") setUnauthorized(true); });
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/support/backlog/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 403) { setUnauthorized(true); return; }
        if (res.ok) {
          const data = await res.json();
          setItems(data.results || []);
        }
      } catch (err) {
        console.error("Failed to load backlog:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (unauthorized) return (
    <div className="admin-dash support-dash">
      <p className="support-empty">You don't have permission to view this page.</p>
      <button className="support-back-btn" onClick={() => navigate("/admin")}>Return to Dashboard</button>
    </div>
  );

  const filtered = items.filter((item) =>
    (!typeFilter   || item.itemType === typeFilter) &&
    (!statusFilter || item.status   === statusFilter)
  );

  async function handleCreate(e) {
    e.preventDefault();
    if (!createForm.title.trim()) { setCreateError("Title is required."); return; }
    setCreating(true);
    setCreateError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/backlog/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [created, ...prev]);
        setCreateForm(EMPTY_CREATE);
        setShowCreate(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.message || "Failed to create item.");
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
        <h1 className="ticket-detail__title">Support Backlog</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="support-back-btn"
            onClick={() => { setShowCreate((v) => !v); setCreateError(""); }}
          >
            {showCreate ? "Cancel" : "+ New Item"}
          </button>
          <button
            className="support-back-btn"
            onClick={() => navigate("/admin/support/backlog/archive")}
          >
            Archive
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="backlog__create-form">
          <p className="support-section-label">New Backlog Item</p>
          <form onSubmit={handleCreate}>
            <div className="backlog__create-row">
              <label className="support-filter-label backlog__create-label--wide">
                <span>Title <span className="ticket-form__required">*</span></span>
                <input
                  className="ticket-form__input"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Brief description of the issue or request"
                  maxLength={255}
                />
              </label>
              <label className="support-filter-label">
                Type
                <select className="support-filter-select" value={createForm.itemType}
                  onChange={(e) => setCreateForm((f) => ({ ...f, itemType: e.target.value }))}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </label>
              <label className="support-filter-label">
                Priority
                <select className="support-filter-select" value={createForm.priority}
                  onChange={(e) => setCreateForm((f) => ({ ...f, priority: e.target.value }))}>
                  {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                </select>
              </label>
            </div>
            <label className="support-filter-label backlog__create-label--full">
              Description
              <textarea className="ticket-form__textarea" rows={3}
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Steps to reproduce, expected behaviour, or full feature description"
              />
            </label>
            {createError && <p className="ticket-form__error">{createError}</p>}
            <div className="ticket-form__actions">
              <button type="submit" className="support-back-btn" disabled={creating}>
                {creating ? "Adding..." : "Add to Backlog"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="backlog__filter-row">
        <div className="backlog__filter-group">
          <span className="my-tickets__filter-label">Type:</span>
          {TYPE_FILTERS.map((f) => (
            <button key={f.value}
              className={`support-back-btn${typeFilter === f.value ? " support-back-btn--active" : ""}`}
              onClick={() => setTypeFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="backlog__filter-group">
          <span className="my-tickets__filter-label">Status:</span>
          {STATUS_FILTERS.map((f) => (
            <button key={f.value}
              className={`support-back-btn${statusFilter === f.value ? " support-back-btn--active" : ""}`}
              onClick={() => setStatusFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="my-tickets__empty">
          <p className="my-tickets__empty-icon">📋</p>
          <p className="my-tickets__empty-heading">
            {items.length === 0 ? "Backlog is clear" : "No items match this filter"}
          </p>
          <p className="my-tickets__empty-body">
            {items.length === 0
              ? "Add a bug report or feature request to get started."
              : "Try adjusting the type or status filters."}
          </p>
        </div>
      ) : (
        <table className="support-ticket-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Type</th>
              <th>Title</th>
              <th>Status</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => navigate(`/admin/support/backlog/${item.id}`)}>
                <td>
                  <span className={`support-badge support-badge--priority support-badge--${item.priority?.toLowerCase()}`}>
                    {PRIORITY_LABELS[item.priority] || item.priority}
                  </span>
                </td>
                <td>
                  <span className={`backlog__type-badge backlog__type-badge--${item.itemType?.toLowerCase()}`}>
                    {TYPE_LABELS[item.itemType] || item.itemType}
                  </span>
                </td>
                <td>{item.title}</td>
                <td>
                  <span className={`backlog__status-badge backlog__status-badge--${item.status?.toLowerCase()}`}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                </td>
                <td>{item.createdAt ? formatDate(item.createdAt) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
