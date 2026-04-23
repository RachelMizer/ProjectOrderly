import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:8000/api/v1/settings/";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}`, ...extra };
}

export default function AdminStorefrontSettings() {
  const [form, setForm] = useState({
    storeTagline: "",
    storeAddress: "",
    hours: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const baseline = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(API, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const loaded = {
          storeTagline: data.storeTagline || "",
          storeAddress: data.storeAddress || "",
          hours: data.hours || "",
        };
        setForm(loaded);
        baseline.current = loaded;
        setCurrentImage(data.storeImage || null);
      })
      .catch(() => setErrorMsg("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const isDirty =
    imageFile !== null ||
    (baseline.current &&
      Object.keys(form).some((k) => form[k] !== baseline.current[k]));

  function handleChange(e) {
    const { name, value } = e.target;
    setSaveStatus(null);
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    setSaveStatus(null);
    setImageFile(e.target.files[0] || null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);

    const body = new FormData();
    body.append("storeTagline", form.storeTagline);
    body.append("storeAddress", form.storeAddress);
    body.append("hours", form.hours);
    if (imageFile) body.append("storeImage", imageFile);

    fetch(API, {
      method: "PATCH",
      headers: authHeaders(),
      body,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const saved = {
          storeTagline: data.storeTagline || "",
          storeAddress: data.storeAddress || "",
          hours: data.hours || "",
        };
        setForm(saved);
        baseline.current = saved;
        setCurrentImage(data.storeImage || null);
        setImageFile(null);
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
        <span className="submenu-label">Storefront Settings</span>
        <div className="submenu-actions">
          <Link to="/admin/settings" className="table-action-btn">« Back to Settings</Link>
        </div>
      </div>

      <form className="sett-form" onSubmit={handleSubmit}>

        <div className="sett-section">
          <p className="inv-section-header">Storefront Identity</p>
          <table className="product-form-table">
            <tbody>
              <tr>
                <td className="form-label-cell"><label htmlFor="storeTagline">Tagline</label></td>
                <td>
                  <input
                    id="storeTagline"
                    name="storeTagline"
                    type="text"
                    value={form.storeTagline}
                    onChange={handleChange}
                    placeholder="e.g. Your neighborhood coffee spot"
                  />
                </td>
              </tr>
              <tr>
                <td className="form-label-cell"><label htmlFor="storeImage">Store Image</label></td>
                <td>
                  {currentImage && (
                    <img
                      src={currentImage}
                      alt="Current store"
                      className="sett-image-preview"
                    />
                  )}
                  <input
                    id="storeImage"
                    name="storeImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="sett-section">
          <p className="inv-section-header">Location & Hours</p>
          <table className="product-form-table">
            <tbody>
              <tr>
                <td className="form-label-cell"><label htmlFor="storeAddress">Store Address</label></td>
                <td>
                  <textarea
                    id="storeAddress"
                    name="storeAddress"
                    rows={3}
                    value={form.storeAddress}
                    onChange={handleChange}
                    placeholder={"e.g. 123 Main St\nRaleigh, NC 27601"}
                  />
                </td>
              </tr>
              <tr>
                <td className="form-label-cell"><label htmlFor="hours">Hours</label></td>
                <td>
                  <textarea
                    id="hours"
                    name="hours"
                    rows={4}
                    value={form.hours}
                    onChange={handleChange}
                    placeholder={"e.g. Mon–Fri: 7am–6pm\nSat–Sun: 8am–4pm"}
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
