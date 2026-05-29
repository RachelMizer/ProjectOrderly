import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../api/auth";
import { handleApiError } from "../../api/handleApiError";
import { formatPhone } from "../../utils/formatPhone";
import API_HOST from '../../config';

const API_BASE = `${API_HOST}/api/v1/admin/suppliers`;

async function parseJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return {};
  try { return await res.json(); } catch { return {}; }
}

export default function AdminSuppliersPage() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [editId, setEditId]         = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState("");
  const [deleting, setDeleting]     = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(API_BASE, { headers: { ...getAuthHeaders() } });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      if (!res.ok) throw new Error("Failed to load suppliers.");
      const data = await parseJson(res);
      setSuppliers(data.results || []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setError(err.message || "Unable to load suppliers.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(supplier) {
    setEditId(supplier.id);
    setEditValues({ name: supplier.name, email: supplier.email || "", phone: supplier.phone || "" });
    setSaveError("");
  }

  function cancelEdit() {
    setEditId(null);
    setEditValues({});
    setSaveError("");
  }

  async function handleSave(supplierId) {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${API_BASE}/${supplierId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body:    JSON.stringify({
          name:  editValues.name,
          email: editValues.email || null,
          phone: editValues.phone || null,
        }),
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      const data = await parseJson(res);
      if (!res.ok) {
        const msgs = Object.entries(data).flatMap(([f, v]) =>
          Array.isArray(v) ? v : [String(v)]
        );
        throw new Error(msgs.join(" | ") || "Validation error");
      }
      setSuppliers((prev) => prev.map((s) => (s.id === supplierId ? data : s)));
      setEditId(null);
      setEditValues({});
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setSaveError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(supplierId) {
    if (!window.confirm("Delete this supplier? This cannot be undone.")) return;
    setDeleting(supplierId);
    try {
      const res = await fetch(`${API_BASE}/${supplierId}`, {
        method:  "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      if (!res.ok) throw new Error("Failed to delete supplier.");
      setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
      if (editId === supplierId) cancelEdit();
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setError(err.message || "Failed to delete.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label"><span style={{ marginRight: "-1px" }}>🏭</span> Supplier Management</span>
        <div className="submenu-actions">
          <button type="button" className="submenu-action" onClick={() => navigate("/admin/suppliers/new")}>
            + ADD SUPPLIER
          </button>
        </div>
      </div>

      {loading && <p className="rpt-loading">Loading suppliers...</p>}
      {!loading && error && <p className="orders-load-error">{error}</p>}

      {!loading && !error && (
        suppliers.length === 0 ? (
          <p className="rpt-empty">No suppliers yet. Add one to get started.</p>
        ) : (
          <>
            {saveError && <p className="inv-error" style={{ padding: "0 20px" }}>{saveError}</p>}
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Supplier Name</th>
                  <th className="admin-th">Email</th>
                  <th className="admin-th">Phone</th>
                  <th className="admin-th admin-th--no-sort no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) =>
                  editId === s.id ? (
                    <tr key={s.id}>
                      <td>
                        <input
                          className="inv-text-input"
                          value={editValues.name}
                          onChange={(e) => setEditValues((p) => ({ ...p, name: e.target.value }))}
                        />
                      </td>
                      <td>
                        <input
                          className="inv-text-input"
                          type="email"
                          value={editValues.email}
                          placeholder="—"
                          onChange={(e) => setEditValues((p) => ({ ...p, email: e.target.value }))}
                        />
                      </td>
                      <td>
                        <input
                          className="inv-text-input"
                          type="tel"
                          value={editValues.phone}
                          placeholder="—"
                          onChange={(e) => setEditValues((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </td>
                      <td className="td-actions">
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => handleSave(s.id)}
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={s.id}>
                      <td className="td-name" style={{ fontSize: "1.1rem" }}>{s.name}</td>
                      <td>{s.email || "—"}</td>
                      <td>{formatPhone(s.phone)}</td>
                      <td className="td-actions">
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => startEdit(s)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                        >
                          {deleting === s.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </>
        )
      )}
    </div>
  );
}
