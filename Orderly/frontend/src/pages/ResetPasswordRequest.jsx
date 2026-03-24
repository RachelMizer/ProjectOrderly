// src/pages/ResetPasswordRequest.jsx

import { useState } from "react";
import { requestPasswordReset } from "../api/auth";

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setMessage("");

    try {
      const data = await requestPasswordReset(email);

      setMessage(
        data?.message ||
          "If an account with that email exists, a reset link has been sent."
      );
    } catch (err) {
      const backend = err?.response?.data;

      if (backend) {
        setErrors({
          general:
            backend.message ||
            backend.detail ||
            "Password reset request failed.",
        });
      } else {
        setErrors({
          general: "Password reset request failed. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Reset Password</h1>

      {errors.general && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {errors.general}
        </div>
      )}

      {message && (
        <div style={{ color: "green", marginBottom: "1rem" }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, general: null }));
              setMessage("");
            }}
            required
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}