import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:8000/api/v1";
const PAGE_SIZE = 8;

const STATUS_LABELS = {
  NEW: "Submitted",
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const STATUS_CLASS = {
  NEW: "new",
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

const FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "NEW", label: "Submitted" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date(date);
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
}

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/support/my-tickets/`, {
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
  }, []);

  function handleFilterChange(value) {
    setStatusFilter(value);
    setPage(1);
  }

  const filtered = statusFilter
    ? tickets.filter((t) => t.status === statusFilter)
    : tickets;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="admin-dash support-dash">
      <div className="my-tickets__header">
        <h1 className="ticket-detail__title">My Support Tickets</h1>
        <Link to="/admin/support/tickets/new" className="ticket-form__submit my-tickets__new-btn">
          + Submit a New Ticket
        </Link>
      </div>

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : tickets.length === 0 ? (
        <div className="my-tickets__empty">
          <p className="my-tickets__empty-icon">🎫</p>
          <p className="my-tickets__empty-heading">No tickets yet</p>
          <p className="my-tickets__empty-body">
            Need help? Submit a ticket and our support team will follow up shortly.
          </p>
          <Link to="/admin/support/tickets/new" className="ticket-form__submit">
            Submit a Ticket
          </Link>
        </div>
      ) : (
        <>
          <div className="my-tickets__filters">
            <span className="my-tickets__filter-label">Sort:</span>
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`my-tickets__filter-pill${statusFilter === opt.value ? " my-tickets__filter-pill--active" : ""}`}
                onClick={() => handleFilterChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="support-empty">No tickets match this filter.</p>
          ) : (
            <>
              <div className="my-tickets__table-wrap">
                <table className="my-tickets__table">
                  <thead>
                    <tr>
                      <th className="my-tickets__th my-tickets__th--id">Ticket #</th>
                      <th className="my-tickets__th my-tickets__th--subject">Subject</th>
                      <th className="my-tickets__th my-tickets__th--desc">Description</th>
                      <th className="my-tickets__th my-tickets__th--status">Status</th>
                      <th className="my-tickets__th my-tickets__th--date">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((ticket) => (
                      <tr key={ticket.id} className="my-tickets__row">
                        <td className="my-tickets__td my-tickets__td--id">#{ticket.id}</td>
                        <td className="my-tickets__td my-tickets__td--subject">{ticket.title}</td>
                        <td className="my-tickets__td my-tickets__td--desc" title={ticket.description}>
                          {truncate(ticket.description, 80)}
                        </td>
                        <td className="my-tickets__td my-tickets__td--status">
                          <span className={`support-badge support-badge--status support-badge--${STATUS_CLASS[ticket.status] || ticket.status?.toLowerCase()}`}>
                            {STATUS_LABELS[ticket.status] || ticket.status}
                          </span>
                        </td>
                        <td className="my-tickets__td my-tickets__td--date">
                          {ticket.createdAt ? formatDate(ticket.createdAt) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="my-tickets__pagination">
                  <button
                    className="my-tickets__page-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Previous
                  </button>
                  <span className="my-tickets__page-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="my-tickets__page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
