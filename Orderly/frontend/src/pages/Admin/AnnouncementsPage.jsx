import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

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

export default function AnnouncementsPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/support/announcements/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.results || []);
        }
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handlePost(e) {
    e.preventDefault();
    if (!body.trim()) { setPostError("Announcement cannot be empty."); return; }
    setPosting(true);
    setPostError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/announcements/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setAnnouncements((prev) => [created, ...prev]);
        setBody("");
      } else {
        const data = await res.json().catch(() => ({}));
        setPostError(data.message || "Failed to post announcement.");
      }
    } catch {
      setPostError("Something went wrong.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${API}/support/announcements/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-dash support-dash">
      <h1 className="ticket-detail__title">Team Announcements</h1>

      <div className="support-section">
        <p className="support-section-label">Post an Announcement</p>
        <form onSubmit={handlePost}>
          <textarea
            className="ticket-form__textarea"
            rows={3}
            placeholder="Write a message for the team…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={posting}
          />
          {postError && <p className="ticket-form__error">{postError}</p>}
          <div className="ticket-detail__save-row" style={{ marginTop: "8px" }}>
            <button type="submit" className="support-back-btn" disabled={posting}>
              {posting ? "Posting…" : "Post Announcement"}
            </button>
          </div>
        </form>
      </div>

      <div className="support-section">
        <p className="support-section-label">Active Announcements</p>
        {loading ? (
          <p className="admin-loading">Loading…</p>
        ) : announcements.length === 0 ? (
          <p className="support-empty">No active announcements.</p>
        ) : (
          <div className="announcements-list">
            {announcements.map((a) => (
              <div key={a.id} className="announcement-card">
                <p className="announcement-card__body">{a.body}</p>
                <div className="announcement-card__footer">
                  <span className="announcement-card__meta">
                    Posted by {a.createdBy} · {formatDateTime(a.createdAt)}
                  </span>
                  <button
                    className="support-back-btn"
                    disabled={deletingId === a.id}
                    onClick={() => handleDelete(a.id)}
                  >
                    {deletingId === a.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ticket-detail__footer">
        <button className="support-back-btn" onClick={() => navigate("/admin")}>
          <strong>←</strong> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
