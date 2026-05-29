import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

const ROLE_LABELS = { STORE_MANAGER: "Store Manager", EMPLOYEE: "Employee", EXECUTIVE: "Executive", SUPPORT: "Support" };

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function initials(first, last, email) {
  if (first || last) return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
  return email?.[0]?.toUpperCase() ?? "?";
}

export default function SupportTeamRoster() {
  const navigate  = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/users/admin-accounts/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMembers((data.results || []).filter((u) => u.role === "SUPPORT"));
        }
      } catch (err) {
        console.error("Failed to load team roster:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header">
        <div>
          <h1 className="ticket-detail__title">Support Team</h1>
          <p className="ticket-detail__description" style={{ marginTop: "4px" }}>
            Active roster of support team members
          </p>
        </div>
        <span className="roster__count">{members.length} {members.length === 1 ? "member" : "members"}</span>
      </div>

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : members.length === 0 ? (
        <div className="my-tickets__empty">
          <p className="my-tickets__empty-icon">👥</p>
          <p className="my-tickets__empty-heading">No support members found</p>
          <p className="my-tickets__empty-body">Add support accounts via User Accounts to populate this roster.</p>
        </div>
      ) : (
        <div className="roster__grid">
          {members.map((m) => {
            const fullName = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email;
            return (
              <div key={m.id} className={`roster__card${m.isActive ? "" : " roster__card--inactive"}`}>
                <div className="roster__avatar">{initials(m.firstName, m.lastName, m.email)}</div>
                <div className="roster__info">
                  <p className="roster__name">{fullName}</p>
                  <p className="roster__email">{m.email}</p>
                  <div className="roster__meta">
                    <span className={`acct-status-badge acct-status-badge--${m.isActive ? "active" : "inactive"}`}>
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                    {(m.city || m.state) && (
                      <span className="roster__location">
                        📍 {[m.city, m.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                  <span className="roster__joined">Member since {fmtDate(m.dateJoined)}</span>
                </div>
                <Link
                  to={`/admin/support/accounts/${m.id}`}
                  className="roster__edit-link"
                  title="Edit account"
                >
                  ✏️
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="ticket-detail__footer">
        <button className="support-back-btn" onClick={() => navigate("/admin/support/accounts")}>
          <strong>←</strong> Back to User Accounts
        </button>
      </div>
    </div>
  );
}
