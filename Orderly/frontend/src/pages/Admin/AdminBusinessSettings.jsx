import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1/settings/`;
const CACHE_KEY = "settings_business";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}`, ...extra };
}

function parseBusinessData(data) {
  return {
    storeName: data.storeName || "",
    taxRate: data.taxRate ?? "",
    contactPhone: data.contactPhone || "",
    contactEmail: data.contactEmail || "",
    hqAddress: data.hqAddress || "",
  };
}

export default function AdminBusinessSettings() {
  const [form, setForm] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : { storeName: "", taxRate: "", contactPhone: "", contactEmail: "", hqAddress: "" };
    } catch {
      return { storeName: "", taxRate: "", contactPhone: "", contactEmail: "", hqAddress: "" };
    }
  });
  const baseline = useRef(null);
  const [loading, setLoading] = useState(() => !localStorage.getItem(CACHE_KEY));
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(API, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const loaded = parseBusinessData(data);
        setForm(loaded);
        baseline.current = loaded;
        localStorage.setItem(CACHE_KEY, JSON.stringify(loaded));
      })
      .catch(() => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try { baseline.current = JSON.parse(cached); } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const isDirty =
    baseline.current &&
    Object.keys(form).some((k) => String(form[k]) !== String(baseline.current[k]));

  function handleChange(e) {
    const { name, value } = e.target;
    setSaveStatus(null);
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);

    fetch(API, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(form),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const saved = parseBusinessData(data);
        setForm(saved);
        baseline.current = saved;
        localStorage.setItem(CACHE_KEY, JSON.stringify(saved));
        setSaveStatus("success");
      })
      .catch(() => {
        setSaveStatus("error");
        setErrorMsg("Failed to save settings.");
      })
      .finally(() => setSaving(false));
  }

  if (loading) return <p className="rpt-loading">Loading...</p>;

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label">Business Settings</span>
        <div className="submenu-actions">
          <Link to="/admin/settings" className="table-action-btn">« Back to Settings</Link>
        </div>
      </div>

      <form className="sett-form" onSubmit={handleSubmit}>

        <div className="sett-section">
          <table className="product-form-table">
            <tbody>
              <tr>
                <td className="form-label-cell"><label htmlFor="storeName">Business Name</label></td>
                <td>
                  <input
                    id="storeName"
                    name="storeName"
                    type="text"
                    value={form.storeName}
                    onChange={handleChange}
                    placeholder="e.g. Quick Sips Coffee"
                  />
                </td>
              </tr>
              <tr>
                <td className="form-label-cell"><label htmlFor="taxRate">Tax Rate (%)</label></td>
                <td>
                  <input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.taxRate}
                    onChange={handleChange}
                    placeholder="e.g. 7.25"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="sett-section">
          <p className="inv-section-header">Headquarters / Home Office Information</p>
          <table className="product-form-table">
            <tbody>
              <tr>
                <td className="form-label-cell"><label htmlFor="hqAddress">Address</label></td>
                <td>
                  <textarea
                    id="hqAddress"
                    name="hqAddress"
                    rows={3}
                    value={form.hqAddress}
                    onChange={handleChange}
                    placeholder={"e.g. 123 Main St\nRaleigh, NC 27601"}
                  />
                </td>
              </tr>
              <tr>
                <td className="form-label-cell"><label htmlFor="contactPhone">Phone Number</label></td>
                <td>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={form.contactPhone}
                    onChange={handleChange}
                    placeholder="e.g. 9195550123"
                  />
                </td>
              </tr>
              <tr>
                <td className="form-label-cell"><label htmlFor="contactEmail">Email</label></td>
                <td>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={handleChange}
                    placeholder="e.g. hello@quicksips.com"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="sett-form-actions">
          {isDirty && <span className="sett-unsaved">Unsaved changes</span>}
          {saveStatus === "success" && <span className="inv-save-success">Settings saved!</span>}
          {saveStatus === "error" && <span className="inv-error">{errorMsg}</span>}
          <button type="submit" className="sett-save-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
