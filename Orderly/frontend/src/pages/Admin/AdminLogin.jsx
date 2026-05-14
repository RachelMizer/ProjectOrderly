// ADMINLOGIN.JSX - Login page for business users
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Orderly";
    const link = document.querySelector("link[rel='icon']");
    if (link) link.href = "/o_favicon.ico";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || data?.non_field_errors?.[0] || "Login failed.");
        return;
      }

      const role = data.customer?.role;
      if (role !== "BUSINESS" && role !== "EXECUTIVE") {
        setError("This account does not have admin access.");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.customer));
      navigate("/admin");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-wrap">
      <div className="admin-login">
        <h1>Orderly</h1>

        <form onSubmit={handleSubmit}>
          {error && <p>{error}</p>}

            <label htmlFor="email">Email</label><br />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <br />
            <br />

            <label htmlFor="password">Password</label><br />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            /><br />


          <button type="submit" disabled={submitting}>
            Sign In
          </button>
        </form>
        </div> {/* admin-login div close */}
    </div>
  );
}