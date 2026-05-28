import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const PRIORITY_LABELS = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent" };

export default function FeatureRequestForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/feature-request/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to submit request.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return (
    <div className="admin-dash support-dash">
      <div className="feature-request__success">
        <p className="feature-request__success-icon">✓</p>
        <h2 className="feature-request__success-heading">Feature Request Submitted</h2>
        <p className="feature-request__success-body">
          Your request has been added to the support backlog for review.
        </p>
        <div className="feature-request__success-actions">
          <button
            className="ticket-form__submit"
            onClick={() => { setSubmitted(false); setForm({ title: "", description: "", priority: "MEDIUM" }); }}
          >
            Submit Another
          </button>
          <button className="ticket-form__cancel" onClick={() => navigate("/admin")}>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dash support-dash">
      <h1 className="ticket-detail__title" style={{ marginBottom: "6px" }}>Submit a Feature Request</h1>
      <p className="feature-request__subtitle">
        Have an idea to improve Orderly? Describe it below and it'll be added to the support backlog for review.
      </p>

      <form className="feature-request__form" onSubmit={handleSubmit}>
        <label className="support-filter-label feature-request__label--full">
          <span>Title <span className="ticket-form__required">*</span></span>
          <input
            className="ticket-form__input feature-request__input--full"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Brief summary of the feature"
            maxLength={255}
            disabled={submitting}
          />
        </label>

        <label className="support-filter-label feature-request__label--full">
          <span>Description <span className="ticket-form__required">*</span></span>
          <textarea
            className="ticket-form__textarea"
            rows={6}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe the feature — what problem does it solve, how would it work, who would benefit?"
            disabled={submitting}
          />
        </label>

        <label className="support-filter-label">
          Priority
          <select
            className="support-filter-select"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            disabled={submitting}
          >
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
        </label>

        {error && <p className="ticket-form__error">{error}</p>}

        <div className="ticket-form__actions">
          <button type="submit" className="ticket-form__submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
