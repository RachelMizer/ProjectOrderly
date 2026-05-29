import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export default function TicketCreateForm() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0] || null;
    if (file && !ALLOWED_TYPES.includes(file.type)) {
      setFileError("File type not supported. Please upload an image, PDF, Word document, spreadsheet, or plain text file.");
      setAttachment(null);
      e.target.value = "";
      return;
    }
    setFileError("");
    setAttachment(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) {
      setError("Subject and details are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("title", subject.trim());
      formData.append("description", details.trim());
      if (attachment) formData.append("attachment", attachment);

      const res = await fetch(`${API}/support/tickets/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedId(data.id);
      } else {
        let message = "Failed to submit ticket.";
        try {
          const data = await res.json();
          message = data.message || message;
        } catch {
          message = `Server error (${res.status}). Please try again.`;
        }
        setError(message);
      }
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedId !== null) {
    return (
      <div className="admin-dash support-dash">
        <div className="ticket-success">
          <div className="ticket-success__icon">✓</div>
          <h1 className="ticket-success__heading">Ticket Submitted</h1>
          <p className="ticket-success__body">
            Your ticket has been received. A support team member will follow up shortly.
          </p>
          <p className="ticket-success__id">Your ticket number is <strong>#{submittedId}</strong></p>
          <div className="ticket-success__actions">
            <button className="ticket-form__submit" onClick={() => navigate("/admin/support/my-tickets")}>
              View My Tickets
            </button>
            <button className="ticket-form__cancel" onClick={() => navigate("/admin")}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dash support-dash">
      <h1 className="ticket-detail__title">Submit a Ticket</h1>

      <div className="support-section">
        <form className="ticket-form" onSubmit={handleSubmit}>

          <label className="ticket-form__label">
            <span>Subject <span className="ticket-form__required">*</span></span>
            <input
              className="ticket-form__input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              maxLength={200}
            />
          </label>

          <label className="ticket-form__label">
            <span>Details <span className="ticket-form__required">*</span></span>
            <textarea
              className="ticket-form__textarea"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the issue in detail"
              rows={6}
            />
          </label>

          <div className="ticket-form__label">
            <span>Attachment <span className="ticket-form__optional">(optional)</span></span>
            <div className="ticket-form__file-wrap">
              <label className="ticket-form__file-btn" htmlFor="ticket-attachment">
                📎 Choose File
              </label>
              <input
                id="ticket-attachment"
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                onChange={handleFileChange}
                className="ticket-form__file-input"
              />
              <span className="ticket-form__file-name">
                {attachment ? attachment.name : "No file chosen"}
              </span>
            </div>
            {fileError && <p className="ticket-form__error">{fileError}</p>}
            <p className="ticket-form__file-hint">Images, PDF, Word, Excel, or plain text.</p>
          </div>

          {error && <p className="ticket-form__error">{error}</p>}

          <div className="ticket-form__actions">
            <button type="submit" className="ticket-form__submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
            <button type="button" className="ticket-form__cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
