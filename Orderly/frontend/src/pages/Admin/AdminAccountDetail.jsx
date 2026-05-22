import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:8000/api/v1";

const ROLE_OPTIONS = ["STORE_MANAGER", "EMPLOYEE", "EXECUTIVE", "SUPPORT"];
const ROLE_LABELS  = { STORE_MANAGER: "Store Manager", EMPLOYEE: "Employee", EXECUTIVE: "Executive", SUPPORT: "Support" };
const BACK_PATHS   = {
  SUPPORT:       "/admin/support/accounts/support",
  EXECUTIVE:     "/admin/support/accounts/executive",
  STORE_MANAGER: "/admin/support/accounts/store-manager",
  EMPLOYEE:      "/admin/support/accounts/employee",
};

export default function AdminAccountDetail() {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [account,  setAccount]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [draft,       setDraft]       = useState({});
  const [locations,   setLocations]   = useState([]);
  const [saving,      setSaving]      = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError,   setSaveError]   = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [savingPw,    setSavingPw]    = useState(false);
  const [pwSuccess,   setPwSuccess]   = useState(false);
  const [pwError,     setPwError]     = useState("");

  const [toggling,      setToggling]      = useState(false);
  const [deleting,      setDeleting]      = useState(false);
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
      role:      account.role      || "STORE_MANAGER",
      city:      account.city      || "",
      state:     account.state     || "",
      storeId:   account.store     ?? null,
    });
  }, [account]);

  useEffect(() => {
    if (draft.role !== "EMPLOYEE" || locations.length > 0) return;
    const token = localStorage.getItem("accessToken");
    fetch(`${API}/locations/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((data) => setLocations(data.results || []))
      .catch(() => {});
  }, [draft.role]);

  const hasChanges = account && (
    draft.firstName !== (account.firstName || "") ||
    draft.lastName  !== (account.lastName  || "") ||
    draft.email     !== (account.email     || "") ||
    draft.role      !== account.role             ||
    draft.city      !== (account.city      || "") ||
    draft.state     !== (account.state     || "") ||
    draft.storeId   !== (account.store     ?? null)
  );

  async function handleSave() {
    if (!hasChanges) return;
    setSaving(true); setSaveError(""); setSaveSuccess(false);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/users/admin-accounts/${userId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        setAccount(await res.json());
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.firstName?.[0] || data?.lastName?.[0] || data?.email?.[0] ||
                    data?.role?.[0] || data?.message || "Failed to save changes.";
        setSaveError(Array.isArray(msg) ? msg[0] : msg);
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
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
      console.error("Failed to toggle account status:", err);
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
      if (res.ok) navigate(BACK_PATHS[account?.role] || "/admin/support/accounts");
    } catch (err) {
      console.error("Failed to delete account:", err);
      setDeleting(false);
    }
  }

  if (loading) return <p className="admin-loading">Loading...</p>;
  if (notFound) return (
    <div className="admin-dash support-dash">
      <p className="support-empty">Account not found.</p>
      <button className="ticket-form__cancel" onClick={() => navigate("/admin/support/accounts")}>
        Back to Accounts
      </button>
    </div>
  );
  if (!account) return null;

  const fullName  = [account.firstName, account.lastName].filter(Boolean).join(" ") || account.email;
  const isSelf    = account.id === currentUserId;
  const backPath  = BACK_PATHS[account.role] || "/admin/support/accounts";
  const roleLabel = ROLE_LABELS[account.role] || account.role;

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header">
        <div>
          <p className="ticket-detail__id">{roleLabel} Account #{account.id}</p>
          <h1 className="ticket-detail__title">{fullName}</h1>
        </div>
        <div className="ticket-detail__badges">
          <span className={`acct-role-badge acct-role-badge--${account.role?.toLowerCase()}`}>
            {roleLabel}
          </span>
          <span className={`acct-status-badge acct-status-badge--${account.isActive ? "active" : "inactive"}`}>
            {account.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="ticket-detail__meta">
        <span className="ticket-detail__meta-item"><strong>Email:</strong> {account.email}</span>
        {account.role === "EMPLOYEE" && (
          <span className="ticket-detail__meta-item">
            <strong>Store:</strong>{" "}
            {account.storeName || "Unassigned"}
          </span>
        )}
        {account.role === "SUPPORT" && (account.city || account.state) && (
          <span className="ticket-detail__meta-item">
            <strong>Location:</strong>{" "}
            {[account.city, account.state].filter(Boolean).join(", ")}
          </span>
        )}
      </div>

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
          <label className="support-filter-label">
            Role
            <select className="support-filter-select" value={draft.role || "STORE_MANAGER"}
              onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
              disabled={saving}>
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </label>
          {draft.role === "EMPLOYEE" && (
            <label className="support-filter-label">
              Store Assignment
              <select
                className="support-filter-select"
                value={draft.storeId ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, storeId: e.target.value === "" ? null : Number(e.target.value) }))}
                disabled={saving}
              >
                <option value="">— Unassigned —</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    #{String(loc.location_number).padStart(3, "0")} {loc.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {account.role === "SUPPORT" && (
            <>
              <label className="support-filter-label">
                City
                <input className="ticket-form__input" value={draft.city || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                  placeholder="City" disabled={saving} />
              </label>
              <label className="support-filter-label">
                State
                <input className="ticket-form__input" value={draft.state || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, state: e.target.value.toUpperCase() }))}
                  placeholder="NC" maxLength={2} disabled={saving} />
              </label>
            </>
          )}
        </div>
        <div className="ticket-detail__save-row">
          <button className="ticket-form__submit" disabled={saving || !hasChanges} onClick={handleSave}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {hasChanges && !saving && <span className="ticket-detail__unsaved">Unsaved changes</span>}
          {saveSuccess && <span className="ticket-detail__saved">Changes saved</span>}
          {saveError && <span className="ticket-detail__save-error">{saveError}</span>}
        </div>
      </div>

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
            placeholder="Minimum 8 characters"
            disabled={savingPw} />
        </label>
        {pwError && <p className="ticket-form__error" style={{ marginTop: "6px" }}>{pwError}</p>}
        <div className="ticket-detail__save-row" style={{ marginTop: "12px" }}>
          <button className="ticket-form__submit" disabled={savingPw || !newPassword.trim()} onClick={handlePasswordChange}>
            {savingPw ? "Updating..." : "Update Password"}
          </button>
          {pwSuccess && <span className="ticket-detail__saved">Password updated</span>}
        </div>
      </div>

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
        <button className="ticket-form__cancel" onClick={() => navigate(backPath)}>
          <strong>←</strong> Back to {roleLabel} Accounts
        </button>
      </div>
    </div>
  );
}
