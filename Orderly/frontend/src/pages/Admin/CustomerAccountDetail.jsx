import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

export default function CustomerAccountDetail() {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [account,   setAccount]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);

  const [draft,        setDraft]        = useState({});
  const [saving,       setSaving]       = useState(false);
  const [saveSuccess,  setSaveSuccess]  = useState(false);
  const [saveError,    setSaveError]    = useState("");

  const [contactDraft,       setContactDraft]       = useState({});
  const [savingContact,      setSavingContact]      = useState(false);
  const [contactSaveSuccess, setContactSaveSuccess] = useState(false);
  const [contactSaveError,   setContactSaveError]   = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [savingPw,    setSavingPw]    = useState(false);
  const [pwSuccess,   setPwSuccess]   = useState(false);
  const [pwError,     setPwError]     = useState("");

  const [toggling,    setToggling]    = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const currentUserId = parseInt(localStorage.getItem("currentUserId") || "0");

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/users/admin-accounts/${userId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) { setNotFound(true); return; }
        if (res.ok) setAccount(await res.json());
      } catch (err) {
        console.error("Failed to load account:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  useEffect(() => {
    if (!account) return;
    setDraft({
      firstName: account.firstName || "",
      lastName:  account.lastName  || "",
      email:     account.email     || "",
    });
    setContactDraft({
      phone:         account.phone         || "",
      streetAddress: account.streetAddress || "",
      city:          account.city          || "",
      state:         account.state         || "",
      zipcode:       account.zipcode       || "",
    });
  }, [account]);

  const hasChanges = account && (
    draft.firstName !== (account.firstName || "") ||
    draft.lastName  !== (account.lastName  || "") ||
    draft.email     !== (account.email     || "")
  );

  const hasContactChanges = account && (
    contactDraft.phone         !== (account.phone         || "") ||
    contactDraft.streetAddress !== (account.streetAddress || "") ||
    contactDraft.city          !== (account.city          || "") ||
    contactDraft.state         !== (account.state         || "") ||
    contactDraft.zipcode       !== (account.zipcode       || "")
  );

  async function patch(payload, handlers) {
    const { setS, setSuc, setErr } = handlers;
    setS(true); setErr(""); setSuc(false);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/users/admin-accounts/${userId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setAccount(await res.json());
        setSuc(true);
        setTimeout(() => setSuc(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = Object.values(data).flat()[0] || data?.message || "Failed to save.";
        setErr(Array.isArray(msg) ? msg[0] : String(msg));
      }
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setS(false);
    }
  }

  function handleSaveInfo() {
    if (!hasChanges) return;
    patch(draft, { setS: setSaving, setSuc: setSaveSuccess, setErr: setSaveError });
  }

  function handleSaveContact() {
    if (!hasContactChanges) return;
    patch(contactDraft, { setS: setSavingContact, setSuc: setContactSaveSuccess, setErr: setContactSaveError });
  }

  async function handlePasswordChange() {
    if (!newPassword.trim()) { setPwError("Password cannot be empty."); return; }
    setSavingPw(true); setPwError(""); setPwSuccess(false);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/users/admin-accounts/${userId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setAccount(await res.json());
        setNewPassword("");
        setPwSuccess(true);
        setTimeout(() => setPwSuccess(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.password?.[0] || data?.message || "Failed to update password.";
        setPwError(Array.isArray(msg) ? msg[0] : msg);
      }
    } catch {
      setPwError("Something went wrong. Please try again.");
    } finally {
      setSavingPw(false);
    }
  }

  async function handleToggleActive() {
    setToggling(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/users/admin-accounts/${userId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !account.isActive }),
      });
      if (res.ok) setAccount(await res.json());
    } catch (err) {
      console.error("Toggle active failed:", err);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setConfirmDelete(false);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/users/admin-accounts/${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) navigate("/admin/support/accounts/customer");
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleting(false);
    }
  }

  if (loading) return <p className="admin-loading">Loading...</p>;
  if (notFound) return (
    <div className="admin-dash support-dash">
      <p className="support-empty">Account not found.</p>
      <button className="ticket-form__cancel" onClick={() => navigate("/admin/support/accounts/customer")}>
        Back to Customer Accounts
      </button>
    </div>
  );
  if (!account) return null;

  const fullName  = [account.firstName, account.lastName].filter(Boolean).join(" ") || account.email;
  const isSelf    = account.id === currentUserId;

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header">
        <div>
          <p className="ticket-detail__id">Customer Account #{account.id}</p>
          <h1 className="ticket-detail__title">{fullName}</h1>
        </div>
        <div className="ticket-detail__badges">
          <span className="acct-role-badge acct-role-badge--customer">Customer</span>
          <span className={`acct-status-badge acct-status-badge--${account.isActive ? "active" : "inactive"}`}>
            {account.isActive ? "Active" : "Inactive"}
          </span>
          {account.emailVerified && (
            <span className="acct-status-badge acct-status-badge--active" style={{ background: "#1a6b4a" }}>
              Email Verified
            </span>
          )}
        </div>
      </div>

      <div className="ticket-detail__meta">
        <span className="ticket-detail__meta-item"><strong>Email:</strong> {account.email}</span>
        {account.dateJoined && (
          <span className="ticket-detail__meta-item">
            <strong>Member since:</strong>{" "}
            {new Date(account.dateJoined).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Account Information */}
      <div className="support-section">
        <p className="support-section-label">Account Information</p>
        <div className="acct-edit-grid">
          <label className="support-filter-label">
            First Name
            <input className="ticket-form__input" value={draft.firstName || ""}
              onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
              disabled={saving} />
          </label>
          <label className="support-filter-label">
            Last Name
            <input className="ticket-form__input" value={draft.lastName || ""}
              onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
              disabled={saving} />
          </label>
          <label className="support-filter-label">
            Email
            <input className="ticket-form__input" type="email" value={draft.email || ""}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              disabled={saving} />
          </label>
        </div>
        <div className="ticket-detail__save-row">
          <button className="ticket-form__submit" disabled={saving || !hasChanges} onClick={handleSaveInfo}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {hasChanges && !saving && <span className="ticket-detail__unsaved">Unsaved changes</span>}
          {saveSuccess && <span className="ticket-detail__saved">Changes saved</span>}
          {saveError && <span className="ticket-detail__save-error">{saveError}</span>}
        </div>
      </div>

      {/* Contact Information */}
      <div className="support-section">
        <p className="support-section-label">Contact Information</p>
        <div className="acct-edit-grid">
          <label className="support-filter-label">
            Phone
            <input className="ticket-form__input" value={contactDraft.phone || ""}
              onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))}
              placeholder="e.g. 5551234567" disabled={savingContact} />
          </label>
          <label className="support-filter-label">
            Street Address
            <input className="ticket-form__input" value={contactDraft.streetAddress || ""}
              onChange={(e) => setContactDraft((d) => ({ ...d, streetAddress: e.target.value }))}
              placeholder="123 Main St" disabled={savingContact} />
          </label>
          <label className="support-filter-label">
            City
            <input className="ticket-form__input" value={contactDraft.city || ""}
              onChange={(e) => setContactDraft((d) => ({ ...d, city: e.target.value }))}
              placeholder="City" disabled={savingContact} />
          </label>
          <label className="support-filter-label">
            State
            <input className="ticket-form__input" value={contactDraft.state || ""}
              onChange={(e) => setContactDraft((d) => ({ ...d, state: e.target.value }))}
              placeholder="NC" maxLength={2} disabled={savingContact} />
          </label>
          <label className="support-filter-label">
            ZIP Code
            <input className="ticket-form__input" value={contactDraft.zipcode || ""}
              onChange={(e) => setContactDraft((d) => ({ ...d, zipcode: e.target.value }))}
              placeholder="12345" disabled={savingContact} />
          </label>
        </div>
        <div className="ticket-detail__save-row">
          <button className="ticket-form__submit" disabled={savingContact || !hasContactChanges} onClick={handleSaveContact}>
            {savingContact ? "Saving..." : "Save Contact Info"}
          </button>
          {hasContactChanges && !savingContact && <span className="ticket-detail__unsaved">Unsaved changes</span>}
          {contactSaveSuccess && <span className="ticket-detail__saved">Contact info saved</span>}
          {contactSaveError && <span className="ticket-detail__save-error">{contactSaveError}</span>}
        </div>
      </div>

      {/* Change Password */}
      <div className="support-section">
        <p className="support-section-label">Change Password</p>
        {account.passwordChangedAt && (
          <p className="acct-pw-changed">
            Last changed:{" "}
            {new Date(account.passwordChangedAt).toLocaleString("en-US", {
              month: "long", day: "numeric", year: "numeric",
              hour: "numeric", minute: "2-digit", hour12: true,
            })}
          </p>
        )}
        <label className="support-filter-label" style={{ maxWidth: "360px" }}>
          New Password
          <input className="ticket-form__input" type="password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters" disabled={savingPw} />
        </label>
        {pwError && <p className="ticket-form__error" style={{ marginTop: "6px" }}>{pwError}</p>}
        <div className="ticket-detail__save-row" style={{ marginTop: "12px" }}>
          <button className="ticket-form__submit" disabled={savingPw || !newPassword.trim()} onClick={handlePasswordChange}>
            {savingPw ? "Updating..." : "Update Password"}
          </button>
          {pwSuccess && <span className="ticket-detail__saved">Password updated</span>}
        </div>
      </div>

      {/* Account Status */}
      <div className="support-section">
        <p className="support-section-label">Account Status</p>
        {isSelf ? (
          <p className="ticket-detail__description">You cannot modify your own account's status.</p>
        ) : (
          <>
            <p className="ticket-detail__description" style={{ marginBottom: "14px" }}>
              {account.isActive
                ? "This account is currently active. Deactivating it will prevent the user from logging in."
                : "This account is currently inactive. Reactivating it will restore login access."}
            </p>
            <div className="acct-status-actions">
              <button
                className={account.isActive ? "backlog__delete-btn acct-deactivate-btn" : "ticket-form__submit"}
                disabled={toggling}
                onClick={handleToggleActive}
              >
                {toggling ? "Updating..." : account.isActive ? "Deactivate Account" : "Reactivate Account"}
              </button>
              {confirmDelete ? (
                <div className="acct-confirm-delete">
                  <span className="acct-confirm-delete__msg">Permanently delete this account?</span>
                  <button className="acct-delete-btn" disabled={deleting} onClick={handleDelete}>
                    {deleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button className="ticket-form__cancel" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="acct-delete-btn" disabled={deleting} onClick={() => setConfirmDelete(true)}>
                  Permanently Delete Account
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="ticket-detail__footer">
        <button className="ticket-form__cancel" onClick={() => navigate("/admin/support/accounts/customer")}>
          <strong>←</strong> Back to Customer Accounts
        </button>
      </div>
    </div>
  );
}
