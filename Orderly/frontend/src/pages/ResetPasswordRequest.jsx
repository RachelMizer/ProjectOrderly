import { useState } from "react";
import { requestPasswordReset } from "../api/auth";

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await requestPasswordReset(email);
      setSuccessMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to send reset email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Forgot Password</h1>

      {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div style={{ color: "green", marginBottom: "1rem" }}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={submitting}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email">Email</label>
            <br />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              required
            />
          </div>

          <button type="submit">
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}