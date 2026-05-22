import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentTickets, setRecentTickets as persistRecentTickets } from "../../utils/recentTickets";

const API = "http://localhost:8000/api/v1";

const STATUSES = ["IN_PROGRESS", "IN_REVIEW"];

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

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date(date);
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
}

function formatToday() {
  return formatDate(new Date());
}

function TicketTable({ tickets, onRowClick }) {
  return (
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
          <tr key={ticket.id} onClick={() => onRowClick(ticket.id)}>
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
  );
}

export default function SupportDashboard() {
  const navigate = useNavigate();
  const [recentTickets, setRecentTickets] = useState([]);
  const [newTickets, setNewTickets] = useState([]);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        const cached = getRecentTickets();

        const [newRes, assignedRes, ...rest] = await Promise.all([
          fetch(`${API}/support/tickets/new/`, { headers }),
          fetch(`${API}/support/tickets/assigned/`, { headers }),
          ...STATUSES.map((s) => fetch(`${API}/support/tickets/?status=${s}`, { headers })),
          ...cached.map((t) => fetch(`${API}/support/tickets/${t.id}/`, { headers })),
        ]);

        if (newRes.ok) {
          const data = await newRes.json();
          setNewTickets(data.results || []);
        }
        if (assignedRes.ok) {
          const data = await assignedRes.json();
          setAssignedTickets(data.results || []);
        }

        const countResults = rest.slice(0, STATUSES.length);
        const recentResults = rest.slice(STATUSES.length);
        const counts = {};
        await Promise.all(
          STATUSES.map(async (s, i) => {
            if (countResults[i].ok) {
              const data = await countResults[i].json();
              counts[s] = data.count ?? 0;
            }
          })
        );
        setStatusCounts(counts);

        const validRecent = cached.filter((_, i) => recentResults[i]?.ok);
        if (validRecent.length !== cached.length) {
          persistRecentTickets(validRecent);
        }
        setRecentTickets(validRecent);
      } catch (err) {
        console.error("Failed to load support dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="admin-loading">Loading...</p>;

  return (
    <div className="admin-dash support-dash">
      <h1 className="ticket-detail__title">Support Dashboard</h1>

      <div className="dash-info-bar">
        <p>📅 Today is {formatToday()}</p>
      </div>

      <div className="dash-status-tiles">
        {STATUSES.map((s) => (
          <div key={s} className={`dash-status-tile dash-status-tile--${s.toLowerCase()}`}>
            <span className="dash-status-tile__count">
              {statusCounts[s] ?? "—"}
            </span>
            <span className="dash-status-tile__label">{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>

      {/* Section 1 — Pick Up Where You Left Off */}
      <div className="support-section">
        <p className="support-section-label">🔖 Pick Up Where You Left Off</p>
        {recentTickets.length === 0 ? (
          <p className="support-empty">No recently viewed tickets. Open a ticket to get started.</p>
        ) : (
          <TicketTable tickets={recentTickets} onRowClick={(id) => navigate(`/admin/support/tickets/${id}`)} />
        )}
      </div>

      {/* Section 2 — New Tickets */}
      <div className="support-section">
        <p className="support-section-label">🎫 New Tickets</p>
        {newTickets.length === 0 ? (
          <p className="support-empty">No new tickets at this time.</p>
        ) : (
          <TicketTable tickets={newTickets} onRowClick={(id) => navigate(`/admin/support/tickets/${id}`)} />
        )}
      </div>

      {/* Section 3 — Assigned Tickets */}
      <div className="support-section">
        <p className="support-section-label">📌 Assigned to Me</p>
        {assignedTickets.length === 0 ? (
          <p className="support-empty">No tickets currently assigned to you.</p>
        ) : (
          <TicketTable tickets={assignedTickets} onRowClick={(id) => navigate(`/admin/support/tickets/${id}`)} />
        )}
      </div>
    </div>
  );
}
