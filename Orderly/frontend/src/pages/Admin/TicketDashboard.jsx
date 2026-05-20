import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

const STATUS_OPTIONS = ["", "NEW", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITY_OPTIONS = ["", "LOW", "MEDIUM", "HIGH", "URGENT"];

const STATUS_LABELS = {
  NEW: "New",
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date(date);
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
}

export default function TicketDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
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
  }, [statusFilter, priorityFilter]);

  return (
    <div className="admin-dash support-dash">
      <h1 className="ticket-detail__title">Ticket Dashboard</h1>

      <div className="support-filters">
        <label className="support-filter-label">
          Status
          <select
            className="support-filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s ? STATUS_LABELS[s] : "All"}</option>
            ))}
          </select>
        </label>

        <label className="support-filter-label">
          Priority
          <select
            className="support-filter-select"
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setLoading(true); }}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p ? PRIORITY_LABELS[p] : "All"}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : tickets.length === 0 ? (
        <p className="support-empty">No tickets match the selected filters.</p>
      ) : (
        <table className="support-ticket-table">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Description</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date Opened</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="support-ticket-table__row"
                onClick={() => navigate(`/admin/support/tickets/${ticket.id}`)}
              >
                <td>#{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>
                  <span className={`support-badge support-badge--status support-badge--${ticket.status?.toLowerCase()}`}>
                    {STATUS_LABELS[ticket.status] || ticket.status}
                  </span>
                </td>
                <td>
                  <span className={`support-badge support-badge--priority support-badge--${ticket.priority?.toLowerCase()}`}>
                    {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                  </span>
                </td>
                <td>{ticket.createdAt ? formatDate(ticket.createdAt) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
