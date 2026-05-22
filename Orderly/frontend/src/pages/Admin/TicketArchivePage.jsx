import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

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

function agentDisplayName(agent) {
  if (!agent) return "—";
  const full = [agent.firstName, agent.lastName].filter(Boolean).join(" ");
  return full || agent.username;
}

export default function TicketArchivePage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [count, setCount] = useState(0);

  function buildUrl() {
    const params = new URLSearchParams();
    params.set("status", "CLOSED");
    if (dateFrom) params.set("created_after", dateFrom);
    if (dateTo) params.set("created_before", dateTo);
    return `${API}/support/tickets/?${params}`;
  }

  async function load(url) {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.results || []);
        setNextUrl(data.next || null);
        setPrevUrl(data.previous || null);
        setCount(data.count || 0);
      }
    } catch (err) {
      console.error("Failed to load ticket archive:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(buildUrl());
  }, [dateFrom, dateTo]);

  return (
    <div className="admin-dash support-dash">
      <h1 className="ticket-detail__title">Ticket Archive</h1>
      <p className="support-archive-desc">A record of all closed tickets. Use the date filters to narrow results by when a ticket was opened.</p>

      <div className="support-filters">
        <label className="support-filter-label">
          From
          <input
            type="date"
            className="support-filter-select"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </label>
        <label className="support-filter-label">
          To
          <input
            type="date"
            className="support-filter-select"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </label>
        {(dateFrom || dateTo) && (
          <button
            className="archive-clear-btn"
            onClick={() => { setDateFrom(""); setDateTo(""); }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : tickets.length === 0 ? (
        <p className="support-empty">No closed tickets found for the selected date range.</p>
      ) : (
        <>
          <table className="support-ticket-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Assigned To</th>
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
                    <span className={`support-badge support-badge--priority support-badge--${ticket.priority?.toLowerCase()}`}>
                      {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                    </span>
                  </td>
                  <td>{agentDisplayName(ticket.assignedTo)}</td>
                  <td>{ticket.createdAt ? formatDate(ticket.createdAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="archive-pagination">
            <span className="archive-pagination__count">{count} ticket{count !== 1 ? "s" : ""}</span>
            <div className="archive-pagination__controls">
              <button
                className="archive-pagination__btn"
                disabled={!prevUrl}
                onClick={() => load(prevUrl)}
              >
                ← Previous
              </button>
              <button
                className="archive-pagination__btn"
                disabled={!nextUrl}
                onClick={() => load(nextUrl)}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
