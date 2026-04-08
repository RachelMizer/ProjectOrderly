import { useEffect, useState } from "react";

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

  return (
    <div>
      <h1>Account Settings</h1>

      <h2>Account Information</h2>
      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Username / Email:</strong> {user.email}</p>
      <p><strong>Password:</strong> ••••••••</p>

      <h2>Permissions</h2>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  );
}
