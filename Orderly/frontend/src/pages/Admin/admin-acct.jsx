import { useEffect, useState } from "react";
import API_HOST from '../../config';

const ROLE_LABELS = {
  STORE_MANAGER: "Store Manager",
  EMPLOYEE: "Employee",
  CUSTOMER: "Customer User",
  EXECUTIVE: "Executive",
  SUPPORT: "Support",
};

const ROLE_PERMISSIONS = {
  STORE_MANAGER: [
    "Access admin dashboard",
    "View and generate reports for their store",
    "Manage inventory for their store",
    "Manage product catalog",
    "Manage orders",
    "View and manage account settings",
  ],
  EMPLOYEE: [
    "Access admin dashboard",
    "View their store's inventory",
    "Manage orders",
  ],
  CUSTOMER: [
    "Browse product catalog",
    "Place orders",
    "View order history",
    "Manage personal account",
  ],
  EXECUTIVE: [
    "Access admin dashboard",
    "View all locations",
    "View aggregate reports across locations",
    "View inventory across locations",
    "View orders across locations",
    "View and manage account settings",
  ],
  SUPPORT: [
    "Access admin dashboard",
    "View and generate reports",
    "Manage inventory",
    "Manage product catalog",
    "Manage orders",
    "View and manage account settings",
  ],
};

function InfoRow({ label, value }) {
  return (
    <div className="acct-info-row">
      <span className="acct-info-label">{label}</span>
      <span className="acct-info-value">{value}</span>
    </div>
  );
}

export default function AccountSettings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch(`${API_HOST}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to load account:", err));
  }, []);

  if (!user) return <p className="acct-loading">Loading account...</p>;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Not set";
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  const initials = (user.username?.[0] || "?").toUpperCase();

  return (
    <div className="admin-acct">
      <div className="acct-header">
        <div className="acct-avatar">{initials}</div>
        <div className="acct-header-text">
          <h1 className="acct-name">{fullName}</h1>
          <span className="acct-role-badge">{ROLE_LABELS[user.role] || user.role || "Unknown Role"}</span>
        </div>
      </div>

      <div className="acct-section">
        <p className="acct-section-title">Account Information</p>
        <div className="acct-info-card">
          <InfoRow label="Full Name"  value={fullName} />
          <InfoRow label="Username"   value={user.username || "Not set"} />
          <InfoRow label="Email"      value={user.email || "Not set"} />
          <InfoRow label="Password"   value="••••••••" />
        </div>
      </div>

      <div className="acct-section">
        <p className="acct-section-title">Role &amp; Permissions</p>
        <div className="acct-info-card">
          <InfoRow label="Role" value={ROLE_LABELS[user.role] || user.role || "Not set"} />
          {permissions.length > 0 && (
            <div className="acct-permissions-block">
              <span className="acct-info-label">Access</span>
              <ul className="acct-permissions-list">
                {permissions.map((perm, i) => (
                  <li key={i}>
                    <span className="acct-perm-check">✓</span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="acct-support-note">
            Need additional permissions? Contact your Orderly administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
