import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

const TYPE_OPTIONS    = ["BUG", "FEATURE"];
const TYPE_LABELS     = { BUG: "Bug", FEATURE: "Feature Request" };
const STATUS_OPTIONS  = ["PENDING", "IN_PROGRESS", "DONE"];
const STATUS_LABELS   = { PENDING: "Pending", IN_PROGRESS: "In Progress", DONE: "Done" };
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const PRIORITY_LABELS  = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent" };

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date(date);
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
}

export default function BacklogItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [draft, setDraft]         = useState({});
  const [saving, setSaving]       = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [ticketInput, setTicketInput] = useState("");
  const [ticketError, setTicketError] = useState("");
  const [linking, setLinking]         = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/support/backlog/${itemId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) { setNotFound(true); return; }
        if (res.ok) setItem(await res.json());
      } catch (err) {
        console.error("Failed to load backlog item:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [itemId]);

  useEffect(() => {
    if (!item) return;
    setDraft({
      title: item.title,
      itemType: item.itemType,
      priority: item.priority,
      status: item.status,
      description: item.description || "",
      notes: item.notes || "",
    });
  }, [item]);

  const hasChanges = item && (
    draft.title       !== item.title       ||
    draft.itemType    !== item.itemType    ||
    draft.priority    !== item.priority    ||
    draft.status      !== item.status      ||
    draft.description !== (item.description || "") ||
    draft.notes       !== (item.notes || "")
  );

  async function handleSave() {
    if (!hasChanges) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/backlog/${itemId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        setItem(await res.json());
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.message || "Failed to save changes.");
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTicketLink(action) {
    const ticketId = parseInt(ticketInput.trim(), 10);
    if (!ticketInput.trim() || isNaN(ticketId)) {
      setTicketError("Enter a valid ticket number.");
      return;
    }
    setLinking(true);
    setTicketError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/backlog/${itemId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [action]: ticketId }),
      });
      if (res.ok) {
        setItem(await res.json());
        setTicketInput("");
      } else {
        const data = await res.json().catch(() => ({}));
        setTicketError(data.message || "Failed to update ticket link.");
      }
    } catch {
      setTicketError("Something went wrong.");
    } finally {
      setLinking(false);
    }
  }

  async function handleRemoveTicket(ticketId) {
    setLinking(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/backlog/${itemId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ removeTicketId: ticketId }),
      });
      if (res.ok) setItem(await res.json());
    } catch (err) {
      console.error("Failed to remove ticket link:", err);
    } finally {
      setLinking(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${API}/support/backlog/${itemId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      navigate("/admin/support/backlog");
    } catch (err) {
      console.error("Failed to delete item:", err);
      setDeleting(false);
    }
  }

  if (loading) return <p className="admin-loading">Loading...</p>;
  if (notFound) return (
    <div className="admin-dash support-dash">
      <p className="support-empty">Backlog item #{itemId} was not found.</p>
      <button className="support-back-btn" onClick={() => navigate("/admin/support/backlog")}>
        Back to Backlog
      </button>
    </div>
  );
  if (!item) return null;

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header">
        <div>
          <p className="ticket-detail__id">Backlog Item #{item.id}</p>
          <h1 className="ticket-detail__title">{item.title}</h1>
        </div>
        <div className="ticket-detail__badges">
          <span className={`backlog__type-badge backlog__type-badge--${item.itemType?.toLowerCase()}`}>
            {TYPE_LABELS[item.itemType] || item.itemType}
          </span>
          <span className={`backlog__status-badge backlog__status-badge--${item.status?.toLowerCase()}`}>
            {STATUS_LABELS[item.status] || item.status}
          </span>
          <span className={`support-badge support-badge--priority support-badge--${item.priority?.toLowerCase()}`}>
            {PRIORITY_LABELS[item.priority] || item.priority}
          </span>
        </div>
      </div>

      <div className="ticket-detail__meta">
        {item.createdBy && (
          <span className="ticket-detail__meta-item"><strong>Added by:</strong> {item.createdBy}</span>
        )}
        {item.createdAt && (
          <span className="ticket-detail__meta-item"><strong>Created:</strong> {formatDate(item.createdAt)}</span>
        )}
      </div>

      <div className="support-section">
        <p className="support-section-label">Edit Item</p>
        <div className="backlog__edit-grid">
          <label className="support-filter-label">
            Type
            <select className="support-filter-select" value={draft.itemType || ""}
              onChange={(e) => setDraft((d) => ({ ...d, itemType: e.target.value }))}
              disabled={saving}>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </label>
          <label className="support-filter-label">
            Priority
            <select className="support-filter-select" value={draft.priority || ""}
              onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))}
              disabled={saving}>
              {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
            </select>
          </label>
          <label className="support-filter-label">
            Status
            <select className="support-filter-select" value={draft.status || ""}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              disabled={saving}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </label>
        </div>
        <label className="backlog__edit-label--full">
          Title
          <input className="ticket-form__input" value={draft.title || ""}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            disabled={saving} />
        </label>
        <label className="support-filter-label backlog__edit-label--full">
          Description
          <textarea className="ticket-form__textarea" rows={4} value={draft.description || ""}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="Steps to reproduce, expected behaviour, or full feature description"
            disabled={saving} />
        </label>
        <label className="support-filter-label backlog__edit-label--full">
          Notes
          <textarea className="ticket-form__textarea" rows={4} value={draft.notes || ""}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Progress updates, workarounds, related context…"
            disabled={saving} />
        </label>

        <div className="ticket-detail__save-row">
          <button className="ticket-form__submit" disabled={saving || !hasChanges} onClick={handleSave}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {hasChanges && !saving && <span className="ticket-detail__unsaved">Unsaved changes</span>}
          {saveSuccess && <span className="ticket-detail__saved">Changes saved</span>}
          {saveError && <span className="ticket-detail__save-error">{saveError}</span>}
        </div>
      </div>

      <div className="support-section">
        <p className="support-section-label">Linked Tickets</p>
        {(item.linkedTickets || []).length === 0 ? (
          <p className="backlog__no-links">No tickets linked.</p>
        ) : (
          <div className="backlog__ticket-chips">
            {(item.linkedTickets || []).map((t) => (
              <div key={t.id} className="backlog__ticket-chip">
                <span>#{t.id} — {t.title}</span>
                <button className="backlog__chip-remove" disabled={linking}
                  onClick={() => handleRemoveTicket(t.id)} title="Remove link">×</button>
              </div>
            ))}
          </div>
        )}
        <div className="backlog__add-ticket-row">
          <input
            className="backlog__ticket-input"
            type="text"
            placeholder="Ticket ID"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleTicketLink("addTicketId"); } }}
            disabled={linking}
          />
          <button className="backlog__add-ticket-btn" disabled={linking}
            onClick={() => handleTicketLink("addTicketId")}>
            {linking ? "…" : "Add"}
          </button>
        </div>
        {ticketError && <p className="ticket-form__error" style={{ marginTop: "6px" }}>{ticketError}</p>}
      </div>

      <div className="ticket-detail__footer">
        <button className="support-back-btn" onClick={() => navigate("/admin/support/backlog")}>
          <strong>←</strong> Back to Backlog
        </button>
        {confirmDelete ? (
          <div className="acct-confirm-delete">
            <span className="acct-confirm-delete__msg">Archive this backlog item?</span>
            <button className="acct-delete-btn" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Archiving..." : "Yes, Archive"}
            </button>
            <button className="ticket-form__cancel" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="support-back-btn" onClick={() => setConfirmDelete(true)}>
            Archive Item
          </button>
        )}
      </div>
    </div>
  );
}
