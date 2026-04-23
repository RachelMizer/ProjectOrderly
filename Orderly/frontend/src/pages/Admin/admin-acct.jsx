import { useEffect, useState } from "react";

const ROLE_PERMISSIONS = {
  BUSINESS: [
    "Access admin dashboard",
    "View and generate reports",
    "Manage inventory",
    "Manage product catalog",
    "Manage orders",
    "View and manage account settings",
  ],
  CUSTOMER: [
    "Browse product catalog",
    "Place orders",
    "View order history",
    "Manage personal account",
  ],
};

export default function AccountSettings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("http://localhost:8000/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to load account:", err));
  }, []);

  if (!user) return <p>Loading...</p>;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Not set";
  const permissions = ROLE_PERMISSIONS[user.role] || [];

  return (
    <div className="admin-acct">
      <h1>Account Settings</h1>

      <h2>Account Information</h2>
      <p><strong>Name:</strong> {fullName}</p>
      <p><strong>Username:</strong> {user.username || "Not set"}</p>
      <p><strong>Email:</strong> {user.email || "Not set"}</p>
      <p><strong>Password:</strong> ••••••••</p>
<br />
      <h2>Account Role and Permissions</h2>
      <p><strong>Role:</strong> {user.role || "Not set"}</p>
  
      <p><strong>Currently, you can:</strong></p>
      {permissions.length > 0 && (
        <ul className="admin-acct-permissions">
          {permissions.map((perm, i) => (
            <li key={i}>{perm}</li>
          ))}
        </ul>
      )}

      <p>If you require further permissions, please contact support.</p>
    </div>
  );
}
