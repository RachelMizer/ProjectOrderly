import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

const COLUMNS = ["UNASSIGNED", "IN_PROGRESS", "IN_REVIEW", "CLOSED"];
const PRIORITY_OPTIONS = ["", "LOW", "MEDIUM", "HIGH", "URGENT"];

const COLUMN_LABELS = {
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

// Moving into these columns requires an assigned agent
const REQUIRES_ASSIGNEE = new Set(["IN_PROGRESS", "IN_REVIEW"]);

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date(date);
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
}

function getInitials(assignedTo) {
  if (!assignedTo) return null;
  const first = assignedTo.firstName?.[0] || "";
  const last = assignedTo.lastName?.[0] || "";
  const initials = (first + last).toUpperCase();
  return initials || assignedTo.username?.slice(0, 2).toUpperCase() || "?";
}

function agentDisplayName(agent) {
  const full = [agent.firstName, agent.lastName].filter(Boolean).join(" ");
  return full || agent.username;
}

export default function TicketDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dropError, setDropError] = useState("");
  const draggedTicket = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        if (priorityFilter) params.set("priority", priorityFilter);
        const res = await fetch(`${API}/support/tickets/?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTickets(data.results || []);
        }
      } catch (err) {
        console.error("Failed to load tickets:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [priorityFilter]);

  const byColumn = COLUMNS.reduce((acc, col) => {
    acc[col] = tickets.filter((t) => t.status === col);
    return acc;
  }, {});

  function handleDragStart(e, ticket, fromColumn) {
    draggedTicket.current = { ticket, fromColumn };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(ticket.id));
  }

  function handleDragOver(e, column) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== column) setDragOverColumn(column);
  }

  function handleDragLeave(e) {
    // Only clear when the cursor genuinely leaves the column, not when
    // it moves over a child element inside it.
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  }

  async function handleDrop(e, targetColumn) {
    e.preventDefault();
    setDragOverColumn(null);

    const dragged = draggedTicket.current;
    draggedTicket.current = null;
    if (!dragged || targetColumn === dragged.fromColumn) return;

    const { ticket } = dragged;

    // Block move to IN_PROGRESS or IN_REVIEW if ticket has no assignee
    if (REQUIRES_ASSIGNEE.has(targetColumn) && !ticket.assignedTo) {
      setDropError("Assign this ticket to a team member before moving it to In Progress or In Review.");
      setTimeout(() => setDropError(""), 4000);
      return;
    }

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, status: targetColumn } : t))
    );

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/tickets/${ticket.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: targetColumn }),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } catch {
      // Revert on failure
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: ticket.status } : t))
      );
    }
  }

  return (
    <div className="admin-dash support-dash">
      <h1 className="ticket-detail__title">Ticket Dashboard</h1>

      <div className="support-filters">
        <label className="support-filter-label">
          Priority
          <select
            className="support-filter-select"
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setLoading(true); }}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p ? PRIORITY_LABELS[p] : "All Priorities"}</option>
            ))}
          </select>
        </label>
      </div>

      {dropError && (
        <p className="kanban-drop-error">{dropError}</p>
      )}

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map((column) => (
              <div
                key={column}
                className={`kanban-column kanban-column--${column.toLowerCase()}${dragOverColumn === column ? " kanban-column--drag-over" : ""}`}
                onDragOver={(e) => handleDragOver(e, column)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column)}
              >
                <div className="kanban-column__header">
                  <span className="kanban-column__label">{COLUMN_LABELS[column]}</span>
                  <span className="kanban-column__count">{byColumn[column].length}</span>
                </div>
                <div className="kanban-column__cards">
                  {byColumn[column].length === 0 ? (
                    <p className="kanban-empty">No tickets</p>
                  ) : (
                    byColumn[column].map((ticket) => (
                      <div
                        key={ticket.id}
                        className="kanban-card"
                        draggable
                        onDragStart={(e) => handleDragStart(e, ticket, column)}
                        onClick={() => navigate(`/admin/support/tickets/${ticket.id}`)}
                      >
                        <div className="kanban-card__top">
                          <span className="kanban-card__id">#{ticket.id}</span>
                          {ticket.assignedTo ? (
                            <span
                              className="kanban-card__assignee"
                              title={agentDisplayName(ticket.assignedTo)}
                            >
                              {getInitials(ticket.assignedTo)}
                            </span>
                          ) : (
                            <span className="kanban-card__assignee kanban-card__assignee--none" title="Unassigned">
                              —
                            </span>
                          )}
                        </div>
                        <p className="kanban-card__title">{ticket.title}</p>
                        <div className="kanban-card__footer">
                          <span className={`support-badge support-badge--priority support-badge--${ticket.priority?.toLowerCase()}`}>
                            {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                          </span>
                          {ticket.createdAt && (
                            <span className="kanban-card__date">{formatDate(ticket.createdAt)}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
}
