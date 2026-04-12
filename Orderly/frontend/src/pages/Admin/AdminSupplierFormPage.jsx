import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../api/handleApiError";
import { getAuthHeaders } from "../../api/auth";

const API_BASE = "http://127.0.0.1:8000/api/v1";

export default function AdminSupplierFormPage() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE}/admin/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
        }),
      });

      let data = {};
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) data = await response.json();

      if (response.status === 401 || response.status === 403) throw { status: response.status };
      if (response.status === 400) {
        const messages = Object.entries(data).flatMap(([field, value]) =>
          Array.isArray(value) ? value.map((m) => `${field}: ${m}`) : [`${field}: ${String(value)}`]
        );
        throw new Error(messages.join(" | ") || "Validation error");
      }
      if (!response.ok) throw new Error("Failed to create supplier");

      navigate("/admin/catalog");
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleApiError(error, navigate);
      } else {
        setErrorMessage(error.message || "Failed to save supplier");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-create-prod">
      <h2>Add New Supplier</h2>

      <form onSubmit={handleSubmit}>
        {errorMessage && <p>{errorMessage}</p>}

        <table className="product-form-table">
          <tbody>
            <tr>
              <td className="form-label-cell"><label>Supplier Name *</label></td>
              <td>
                <input
                  name="name"
                  placeholder="Supplier name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td className="form-label-cell"><label>Email</label></td>
              <td>
                <input
                  name="email"
                  type="email"
                  placeholder="contact@supplier.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td className="form-label-cell"><label>Phone</label></td>
              <td>
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Supplier"}
          </button>
          <button type="button" onClick={() => navigate("/admin/catalog")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
