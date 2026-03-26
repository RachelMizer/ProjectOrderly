import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "../api/auth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      await confirmPasswordReset({ uid, token, newPassword: password });

      alert("Password successfully reset.");
      navigate("/login");
    } catch (err) {
      const backend = err?.response?.data || {};

      setErrors({
        password: Array.isArray(backend.newPassword)
          ? backend.newPassword[0]
          : backend.newPassword,
        general:
          backend.message ||
          backend.detail ||
          "Password reset failed.",
      });
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

      <form onSubmit={handleSubmit}>
        <fieldset disabled={submitting}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password">New Password</label>
            <br />
            <input
              id="password"
              type="password"
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

          <button type="submit">
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}