import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

const TILES = [
  {
    role: "SUPPORT",
    label: "Support Accounts",
    description: "Support team members who manage tickets and customer issues",
    icon: "🎧",
    path: "/admin/support/accounts/support",
    colorClass: "accounts-tile--support",
  },
  {
    role: "EXECUTIVE",
    label: "Executive Accounts",
    description: "Executive-level users with elevated reporting and dashboard access",
    icon: "💼",
    path: "/admin/support/accounts/executive",
    colorClass: "accounts-tile--executive",
  },
  {
    role: "BUSINESS",
    label: "Admin Accounts",
    description: "Business administrators with full dashboard and management access",
    icon: "⚙️",
    path: "/admin/support/accounts/business",
    colorClass: "accounts-tile--business",
  },
  {
    role: "CUSTOMER",
    label: "Customer Accounts",
    description: "Registered customer accounts on the storefront",
    icon: "👤",
    path: "/admin/support/accounts/customer",
    colorClass: "accounts-tile--customer",
  },
];

const ROLE_LABELS = { BUSINESS: "Admin", EXECUTIVE: "Executive", SUPPORT: "Support", CUSTOMER: "Customer" };

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function UserAccountsDashboard() {
  const [counts, setCounts]             = useState({});
  const [deleted, setDeleted]           = useState([]);
  const [deletedLoading, setDeletedLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    Promise.all(
      TILES.map(({ role }) =>
        fetch(`${API}/users/admin-accounts/?role=${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => (r.ok ? r.json() : { count: 0 }))
          .then((data) => [role, data.count])
          .catch(() => [role, null])
      )
    ).then((results) => setCounts(Object.fromEntries(results)));

    fetch(`${API}/users/deleted-accounts/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((data) => setDeleted(data.results || []))
      .catch(() => {})
      .finally(() => setDeletedLoading(false));
  }, []);

  return (
    <div className="admin-dash support-dash">
      <h1 className="ticket-detail__title" style={{ marginBottom: "4px" }}>User Accounts Dashboard</h1>
      <p className="ticket-detail__description" style={{ marginBottom: "28px" }}>
        Manage all account types across the platform
      </p>

      <div className="accounts-tile-grid">
        {TILES.map(({ role, label, description, icon, path, colorClass }) => (
          <Link key={role} to={path} className={`accounts-tile ${colorClass}`}>
            <div className="accounts-tile__body">
              <p className="accounts-tile__label">
                <span className="accounts-tile__icon">{icon}</span>
                {label}
              </p>
              <p className="accounts-tile__desc">{description}</p>
              <div className="accounts-tile__count">
                <span className="accounts-tile__num">
                  {counts[role] == null ? "—" : counts[role]}
                </span>
                <span className="accounts-tile__count-label">{counts[role] === 1 ? "account" : "accounts"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2 className="acct-deleted-heading">Deleted Accounts</h2>
        {deletedLoading ? (
          <p className="admin-loading">Loading...</p>
        ) : deleted.length === 0 ? (
          <p className="acct-deleted-empty">No accounts have been deleted.</p>
        ) : (
          <div className="backlog__list">
            <div className="backlog__list-header acct-list-header">
              <span className="acct-col acct-col--name">Name</span>
              <span className="acct-col acct-col--email">Email</span>
              <span className="acct-col acct-col--role">Role</span>
              <span className="acct-col acct-col--deleted-by">Deleted By</span>
              <span className="acct-col acct-col--deleted-at">Date Deleted</span>
            </div>
            {deleted.map((rec) => (
              <div key={rec.id} className="backlog__item acct-deleted-row">
                <span className="acct-col acct-col--name">
                  {[rec.firstName, rec.lastName].filter(Boolean).join(" ") || rec.email}
                </span>
                <span className="acct-col acct-col--email">{rec.email}</span>
                <span className="acct-col acct-col--role">
                  {ROLE_LABELS[rec.role] || rec.role || "—"}
                </span>
                <span className="acct-col acct-col--deleted-by">{rec.deletedByName || "—"}</span>
                <span className="acct-col acct-col--deleted-at">{fmtDate(rec.deletedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
