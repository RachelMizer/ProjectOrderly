import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { saveRecentTicket } from "../../utils/recentTickets";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

const STATUS_OPTIONS = ["UNASSIGNED", "IN_PROGRESS", "IN_REVIEW", "CLOSED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const STATUS_LABELS = {
  UNASSIGNED: "Unassigned",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  CLOSED: "Closed",
};

const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const OPEN_STATUSES = new Set(["UNASSIGNED", "IN_PROGRESS", "IN_REVIEW"]);

function daysOpen(createdAt) {
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date(date);
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
}

function formatDateTime(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date(date);
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()} at ${hours}:${mins} ${ampm}`;
}

function agentDisplayName(agent) {
  const full = [agent.firstName, agent.lastName].filter(Boolean).join(" ");
  return full || agent.username;
}

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [draftCaseNotes, setDraftCaseNotes] = useState("");
  const [savingCaseNotes, setSavingCaseNotes] = useState(false);
  const [caseNotesSaved, setCaseNotesSaved] = useState(false);

  const [assignmentHistory, setAssignmentHistory] = useState([]);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteBody, setNewNoteBody] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [addNoteError, setAddNoteError] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteBody, setEditNoteBody] = useState("");
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  // Draft state — kept in sync with ticket after every save
  const [draftStatus, setDraftStatus] = useState("");
  const [draftPriority, setDraftPriority] = useState("");
  const [draftAssignedToId, setDraftAssignedToId] = useState("");

  // Sync drafts whenever the committed ticket changes
  useEffect(() => {
    if (!ticket) return;
    setDraftStatus(ticket.status);
    setDraftPriority(ticket.priority);
    setDraftAssignedToId(ticket.assignedTo?.id != null ? String(ticket.assignedTo.id) : "");
    setDraftCaseNotes(ticket.caseNotes || "");
  }, [ticket]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch(`${API}/support/agents/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setAgents(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/support/tickets/${ticketId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) { setNotFound(true); return; }
        if (res.ok) {
          const data = await res.json();
          setTicket(data);
          saveRecentTicket(data);
        }
      } catch (err) {
        console.error("Failed to load ticket:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ticketId]);

  async function loadAssignmentHistory() {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/tickets/${ticketId}/assignments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAssignmentHistory(data.results || []);
      }
    } catch (err) {
      console.error("Failed to load assignment history:", err);
    }
  }

  useEffect(() => { loadAssignmentHistory(); }, [ticketId]);

  useEffect(() => {
    async function loadNotes() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/support/tickets/${ticketId}/notes/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotes(data.results || []);
        }
      } catch (err) {
        console.error("Failed to load notes:", err);
      } finally {
        setNotesLoading(false);
      }
    }
    loadNotes();
  }, [ticketId]);

  function handleDownloadMarkdown() {
    const lines = [];
    lines.push(`# Ticket #${ticket.id} — ${ticket.title}`);
    lines.push("");
    lines.push(`**Status:** ${STATUS_LABELS[ticket.status] || ticket.status}  `);
    lines.push(`**Priority:** ${PRIORITY_LABELS[ticket.priority] || ticket.priority}  `);
    lines.push(`**Assigned To:** ${ticket.assignedTo ? agentDisplayName(ticket.assignedTo) : "Unassigned"}  `);
    if (ticket.customerEmail) lines.push(`**Submitted By:** ${ticket.customerEmail}  `);
    if (ticket.createdAt) lines.push(`**Opened:** ${formatDate(ticket.createdAt)}  `);
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## Description");
    lines.push("");
    lines.push(ticket.description || "_No description provided._");
    if (ticket.caseNotes) {
      lines.push("");
      lines.push("---");
      lines.push("");
      lines.push("## Case Notes");
      lines.push("");
      lines.push(ticket.caseNotes);
    }
    if (notes.length > 0) {
      lines.push("");
      lines.push("---");
      lines.push("");
      lines.push("## Progress Log");
      notes.forEach((note) => {
        lines.push("");
        lines.push(`**${note.authorName}** — ${formatDateTime(note.createdAt)}${note.updatedAt !== note.createdAt ? " _(edited)_" : ""}`);
        lines.push("");
        lines.push(note.body);
        lines.push("");
        lines.push("---");
      });
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${ticket.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSaveCaseNotes() {
    setSavingCaseNotes(true);
    setCaseNotesSaved(false);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/tickets/${ticketId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ caseNotes: draftCaseNotes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTicket(updated);
        saveRecentTicket(updated);
        setCaseNotesSaved(true);
        setTimeout(() => setCaseNotesSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save case notes:", err);
    } finally {
      setSavingCaseNotes(false);
    }
  }

  async function handleAddNote() {
    if (!newNoteBody.trim()) { setAddNoteError("Note cannot be empty."); return; }
    setAddingNote(true);
    setAddNoteError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/tickets/${ticketId}/notes/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ body: newNoteBody.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setNotes((prev) => [...prev, created]);
        setNewNoteBody("");
        setShowAddNote(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setAddNoteError(data.message || "Failed to save note.");
      }
    } catch {
      setAddNoteError("Something went wrong. Please try again.");
    } finally {
      setAddingNote(false);
    }
  }

  async function handleSaveNote(noteId) {
    if (!editNoteBody.trim()) return;
    setSavingNoteId(noteId);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/tickets/${ticketId}/notes/${noteId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ body: editNoteBody.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
        setEditingNoteId(null);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSavingNoteId(null);
    }
  }

  async function handleDeleteNote(noteId) {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    setDeletingNoteId(noteId);
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${API}/support/tickets/${ticketId}/notes/${noteId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (editingNoteId === noteId) setEditingNoteId(null);
    } catch (err) {
      console.error("Failed to delete note:", err);
    } finally {
      setDeletingNoteId(null);
    }
  }

  const savedAssignedId = ticket?.assignedTo?.id != null ? String(ticket.assignedTo.id) : "";
  const hasChanges = ticket && (
    draftStatus !== ticket.status ||
    draftPriority !== ticket.priority ||
    draftAssignedToId !== savedAssignedId
  );

  async function handleSave() {
    if (!hasChanges) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const body = {};
    if (draftStatus !== ticket.status) body.status = draftStatus;
    if (draftPriority !== ticket.priority) body.priority = draftPriority;
    if (draftAssignedToId !== savedAssignedId) {
      body.assignedToId = draftAssignedToId === "" ? null : Number(draftAssignedToId);
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/tickets/${ticketId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setTicket(updated);
        saveRecentTicket(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (body.assignedToId !== undefined) loadAssignmentHistory();
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

  if (loading) return <p className="admin-loading">Loading...</p>;
  if (notFound) return (
    <div className="admin-dash support-dash">
      <p className="support-empty">Ticket #{ticketId} was not found.</p>
      <button className="support-back-btn" onClick={() => navigate("/admin/support/tickets")}>
        Back to Tickets
      </button>
    </div>
  );
  if (!ticket) return null;

  const fileName = ticket.attachmentUrl
    ? ticket.attachmentUrl.split("/").pop().split("?")[0]
    : null;

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header">
        <div>
          <p className="ticket-detail__id">Ticket #{ticket.id}</p>
          <h1 className="ticket-detail__title">{ticket.title}</h1>
        </div>
        <div className="ticket-detail__badges">
          <span className={`support-badge support-badge--status support-badge--${ticket.status?.toLowerCase()}`}>
            {STATUS_LABELS[ticket.status] || ticket.status}
          </span>
          <span className={`support-badge support-badge--priority support-badge--${ticket.priority?.toLowerCase()}`}>
            {PRIORITY_LABELS[ticket.priority] || ticket.priority}
          </span>
        </div>
      </div>

      <div className="ticket-detail__meta">
        {(ticket.customerName || ticket.customerEmail) && (
          <span className="ticket-detail__meta-item">
            <strong>Submitted by:</strong>{" "}
            {ticket.customerId ? (
              <button
                className="ticket-detail__customer-link"
                onClick={() => navigate(`/admin/support/accounts/customer/${ticket.customerId}`)}
              >
                {ticket.customerName || ticket.customerEmail}
              </button>
            ) : (
              ticket.customerName || ticket.customerEmail
            )}
          </span>
        )}
        <span className="ticket-detail__meta-item">
          <strong>Opened:</strong> {ticket.createdAt ? formatDate(ticket.createdAt) : "—"}
        </span>
        {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
          <span className="ticket-detail__meta-item">
            <strong>Last updated:</strong> {formatDate(ticket.updatedAt)}
          </span>
        )}
        <span className="ticket-detail__meta-item">
          <strong>Assigned to:</strong>{" "}
          {ticket.assignedTo
            ? agentDisplayName(ticket.assignedTo)
            : "Unassigned"}
        </span>
        {ticket.createdAt && OPEN_STATUSES.has(ticket.status) && (
          <span className="ticket-detail__meta-item ticket-detail__days-open">
            <strong>Days open:</strong> {daysOpen(ticket.createdAt)}
          </span>
        )}
      </div>

      <div className="support-section">
        <p className="support-section-label">Description</p>
        <p className="ticket-detail__description">
          {ticket.description || <em>No description provided.</em>}
        </p>
      </div>

      {ticket.attachmentUrl && (
        <div className="support-section">
          <p className="support-section-label">Attachment</p>
          <a
            className="ticket-detail__attachment"
            href={ticket.attachmentUrl}
            target="_blank"
            rel="noreferrer"
          >
            📎 {fileName}
          </a>
        </div>
      )}

      <div className="support-section">
        <p className="support-section-label">Update Ticket</p>
        <div className="ticket-detail__controls">
          <label className="support-filter-label">
            Status
            <select
              className="support-filter-select"
              value={draftStatus}
              disabled={saving}
              onChange={(e) => setDraftStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </label>

          <label className="support-filter-label">
            Priority
            <select
              className="support-filter-select"
              value={draftPriority}
              disabled={saving}
              onChange={(e) => setDraftPriority(e.target.value)}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </label>

          <label className="support-filter-label">
            Assignee
            <select
              className="support-filter-select"
              value={draftAssignedToId}
              disabled={saving}
              onChange={(e) => setDraftAssignedToId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={String(agent.id)}>
                  {agentDisplayName(agent)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="ticket-detail__save-row">
          <button
            className="ticket-form__submit"
            disabled={saving || !hasChanges}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {hasChanges && !saving && (
            <span className="ticket-detail__unsaved">Unsaved changes</span>
          )}
          {saveSuccess && (
            <span className="ticket-detail__saved">Changes saved</span>
          )}
          {saveError && (
            <span className="ticket-detail__save-error">{saveError}</span>
          )}
        </div>
      </div>

      <div className="support-section">
        <p className="support-section-label">Case Notes</p>
        <textarea
          className="ticket-form__textarea"
          rows={5}
          placeholder="General technical notes about the problem — findings, environment details, reproduction steps…"
          value={draftCaseNotes}
          onChange={(e) => setDraftCaseNotes(e.target.value)}
          disabled={savingCaseNotes}
        />
        <div className="ticket-detail__save-row" style={{ marginTop: "10px" }}>
          <button
            className="ticket-form__submit"
            disabled={savingCaseNotes || draftCaseNotes === (ticket?.caseNotes || "")}
            onClick={handleSaveCaseNotes}
          >
            {savingCaseNotes ? "Saving..." : "Save Notes"}
          </button>
          {draftCaseNotes !== (ticket?.caseNotes || "") && !savingCaseNotes && (
            <span className="ticket-detail__unsaved">Unsaved changes</span>
          )}
          {caseNotesSaved && (
            <span className="ticket-detail__saved">Notes saved</span>
          )}
        </div>
      </div>

      <div className="support-section">
        <div className="ticket-notes__header">
          <p className="support-section-label" style={{ margin: 0 }}>Progress Log</p>
          <button
            className="ticket-notes__add-btn"
            onClick={() => { setShowAddNote((v) => !v); setAddNoteError(""); setNewNoteBody(""); }}
          >
            {showAddNote ? "Cancel" : "+ Add Note"}
          </button>
        </div>

        {showAddNote && (
          <div className="ticket-notes__compose">
            <textarea
              className="ticket-form__textarea"
              rows={4}
              placeholder="Describe the work done, findings, or next steps…"
              value={newNoteBody}
              onChange={(e) => setNewNoteBody(e.target.value)}
            />
            {addNoteError && <p className="ticket-form__error">{addNoteError}</p>}
            <div className="ticket-detail__save-row">
              <button className="ticket-form__submit" disabled={addingNote} onClick={handleAddNote}>
                {addingNote ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        )}

        {notesLoading ? (
          <p className="admin-loading" style={{ marginTop: "12px" }}>Loading notes...</p>
        ) : notes.length === 0 && !showAddNote ? (
          <p className="ticket-notes__empty">No log entries yet. Add the first one.</p>
        ) : (
          <div className="ticket-notes__list">
            {notes.map((note) => {
              const isEditing = editingNoteId === note.id;
              const isSaving  = savingNoteId === note.id;
              const isDeleting = deletingNoteId === note.id;
              return (
                <div key={note.id} className="ticket-note">
                  <div className="ticket-note__header">
                    <span className="ticket-note__author">{note.authorName}</span>
                    <span className="ticket-note__time">
                      {formatDateTime(note.createdAt)}
                      {note.updatedAt !== note.createdAt && " (edited)"}
                    </span>
                  </div>
                  {isEditing ? (
                    <>
                      <textarea
                        className="ticket-form__textarea"
                        rows={4}
                        value={editNoteBody}
                        onChange={(e) => setEditNoteBody(e.target.value)}
                      />
                      <div className="ticket-note__edit-actions">
                        <button className="ticket-form__submit" disabled={isSaving} onClick={() => handleSaveNote(note.id)}>
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button className="ticket-form__cancel" onClick={() => setEditingNoteId(null)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="ticket-note__body">{note.body}</p>
                      <div className="ticket-note__actions">
                        <button className="ticket-note__edit-btn"
                          onClick={() => { setEditingNoteId(note.id); setEditNoteBody(note.body); }}>
                          Edit
                        </button>
                        <button className="ticket-note__delete-btn" disabled={isDeleting}
                          onClick={() => handleDeleteNote(note.id)}>
                          {isDeleting ? "..." : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {assignmentHistory.length > 0 && (
        <div className="support-section">
          <p className="support-section-label">Assignment History</p>
          <div className="ticket-assignment-history">
            {assignmentHistory.map((h) => (
              <div key={h.id} className="ticket-assignment-entry">
                <span className="ticket-assignment-entry__text">
                  {h.assignedFrom ? h.assignedFrom : "Unassigned"}
                  {" → "}
                  {h.assignedTo ? h.assignedTo : "Unassigned"}
                </span>
                <span className="ticket-assignment-entry__meta">
                  by {h.changedBy || "Unknown"} · {formatDateTime(h.changedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ticket-detail__footer">
        <button className="support-back-btn" onClick={() => navigate("/admin/support/tickets")}>
          <strong>←</strong> Back to Tickets
        </button>
        <button className="support-back-btn" onClick={handleDownloadMarkdown}>
          <strong>↓</strong> Download as Markdown
        </button>
      </div>
    </div>
  );
}
