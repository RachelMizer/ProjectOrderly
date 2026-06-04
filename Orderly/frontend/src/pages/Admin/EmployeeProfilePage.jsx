import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API_HOST from "../../config";
import { getAuthHeaders } from "../../api/auth";

const API = `${API_HOST}/api/v1/users`;

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function Row({ label, value }) {
  return (
    <div className="emp-prof-row">
      <span className="emp-prof-label">{label}</span>
      <span className="emp-prof-value">{value || "—"}</span>
    </div>
  );
}

export default function EmployeeProfilePage({ userRole, currentUserId }) {
  const { userId } = useParams();
  const navigate   = useNavigate();
  const targetId   = userId || "me";

  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [editTitle, setEditTitle]   = useState("");
  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState("");

  const canEditTitle = userRole === "STORE_MANAGER" || userRole === "EXECUTIVE";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = targetId === "me"
          ? `${API}/employee-profile/me/`
          : `${API}/employee-profile/${targetId}/`;
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.detail || "Failed to load profile.");
        }
        const data = await res.json();
        setProfile(data);
        setEditTitle(data.job_title || "");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [targetId]);

  async function saveTitle() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`${API}/employee-profile/${profile.userId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ job_title: editTitle }),
      });
      if (!res.ok) throw new Error("Failed to save.");
      const data = await res.json();
      setProfile(data);
      setEditing(false);
      setSaveMsg("Saved.");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      setSaveMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  const isOwnProfile = !userId || String(userId) === String(currentUserId);

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="ticket-detail__title">Employee Profile</h1>
          {profile && (
            <p style={{ color: "#64748b", marginTop: "2px", fontSize: ".9rem" }}>
              {profile.storeName ? `#${profile.storeNumber} ${profile.storeName}` : ""}
            </p>
          )}
        </div>
        {profile?.employee_id && (
          <span className="roster__count" style={{ fontSize: ".8rem" }}>
            ID: {profile.employee_id}
          </span>
        )}
      </div>

      {loading && <p className="admin-loading">Loading…</p>}
      {!loading && error && <p className="admin-loading" style={{ color: "#ef4444" }}>{error}</p>}

      {!loading && !error && profile && (
        <>
          <div className="emp-prof-card">
            <p className="emp-prof-section-title">Personal Information</p>
            <Row label="Full Name"    value={`${profile.firstName || ""} ${profile.lastName || ""}`.trim()} />
            <Row label="Username"     value={profile.username} />
            <Row label="Email"        value={profile.email} />
            <Row label="Phone"        value={profile.phone} />
            <Row label="Home Address" value={[profile.home_address, profile.city, profile.state].filter(Boolean).join(", ")} />
            <Row label="Date of Birth" value={fmtDate(profile.date_of_birth)} />
          </div>

          <div className="emp-prof-card">
            <p className="emp-prof-section-title">Employment</p>

            <div className="emp-prof-row">
              <span className="emp-prof-label">Job Title</span>
              {editing ? (
                <span className="emp-prof-value" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    className="acct-field-input"
                    style={{ fontSize: ".85rem" }}
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                  />
                  <button className="sched-panel__add-btn" onClick={saveTitle} disabled={saving}>Save</button>
                  <button className="sched-panel__cancel-btn" onClick={() => { setEditing(false); setEditTitle(profile.job_title || ""); }}>Cancel</button>
                  {saveMsg && <span style={{ color: "#22c55e", fontSize: ".8rem" }}>{saveMsg}</span>}
                </span>
              ) : (
                <span className="emp-prof-value">
                  {profile.job_title || "—"}
                  {canEditTitle && (
                    <button
                      className="sched-panel__cancel-btn"
                      style={{ marginLeft: "10px", fontSize: ".75rem" }}
                      onClick={() => setEditing(true)}
                    >Edit</button>
                  )}
                  {saveMsg && <span style={{ color: "#22c55e", fontSize: ".8rem", marginLeft: "8px" }}>{saveMsg}</span>}
                </span>
              )}
            </div>

            <Row label="Hire Date"   value={fmtDate(profile.hire_date)} />
            <Row label="Pay Rate"    value={profile.pay_rate ? `$${parseFloat(profile.pay_rate).toFixed(2)}/hr` : "—"} />
            <Row label="Role"        value={profile.role?.replace(/_/g, " ")} />
            <Row label="Employee ID" value={profile.employee_id} />
          </div>

          {isOwnProfile && (
            <p className="emp-prof-ticket-note">
              If any of this information is incorrect,{" "}
              <Link to="/admin/support/tickets/new" style={{ color: "#5a87a8" }}>
                please submit a support ticket
              </Link>{" "}
              and a support agent will update it for you.
            </p>
          )}
        </>
      )}

      <div className="ticket-detail__footer">
        <button className="support-back-btn" onClick={() => navigate(-1)}>
          <strong>←</strong> Back
        </button>
      </div>
    </div>
  );
}
