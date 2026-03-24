// src/pages/ResetPassword.jsx

import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPasswordReset } from "../api/auth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const uid = params.get("uid");
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setMessage("");

    if (!uid || !token) {
      setErrors({
        general: "Invalid or missing reset link.",
      });
      setSubmitting(false);
      return;
    }

    try {
      await confirmPasswordReset({
        uid,
        token,
        newPassword: password,
      });

      setMessage("Password reset successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const backend = err?.response?.data || {};

      const extractedFieldErrors = {
        password: Array.isArray(backend.newPassword)
          ? backend.newPassword[0]
          : Array.isArray(backend.password)
          ? backend.password[0]
          : backend.newPassword || backend.password,
      };

      const hasFieldErrors = extractedFieldErrors.password;

      if (backend) {
        setErrors({
          ...extractedFieldErrors,
          general:
            backend.message ||
            backend.detail ||
            (!hasFieldErrors
              ? "Password reset failed. The link may be invalid or expired."
              : null),
        });
      } else {
        setErrors({
          general: "Password reset failed. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Set New Password</h1>

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
          <label htmlFor="password">New Password</label>
          <br />
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({
                ...prev,
                password: null,
                general: null,
              }));
            }}
            required
          />
          {errors.password && (
            <div style={{ color: "red" }}>{errors.password}</div>
          )}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}