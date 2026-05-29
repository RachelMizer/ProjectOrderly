import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../api/auth";
import { handleApiError } from "../../api/handleApiError";
import API_HOST from '../../config';

const API_BASE = `${API_HOST}/api/v1/admin/categories`;

async function parseJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return {};
  try { return await res.json(); } catch { return {}; }
}

export default function AdminCategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const [newName, setNewName]   = useState("");
  const [adding, setAdding]     = useState(false);
  const [addError, setAddError] = useState("");

  const [editId, setEditId]       = useState(null);
  const [editName, setEditName]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting]   = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(API_BASE, { headers: { ...getAuthHeaders() } });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      if (!res.ok) throw new Error("Failed to load categories.");
      const data = await parseJson(res);
      setCategories(data.results || []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setError(err.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch(API_BASE, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body:    JSON.stringify({ name }),
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      const data = await parseJson(res);
      if (!res.ok) {
        const msgs = Object.entries(data).flatMap(([, v]) =>
          Array.isArray(v) ? v : [String(v)]
        );
        throw new Error(msgs.join(" | ") || "Validation error.");
      }
      setCategories((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewName("");
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setAddError(err.message || "Failed to add category.");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(cat) {
    setEditId(cat.id);
    setEditName(cat.name);
    setSaveError("");
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
    setSaveError("");
  }

  async function handleSave(catId) {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${API_BASE}/${catId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body:    JSON.stringify({ name: editName }),
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      const data = await parseJson(res);
      if (!res.ok) {
        const msgs = Object.entries(data).flatMap(([, v]) =>
          Array.isArray(v) ? v : [String(v)]
        );
        throw new Error(msgs.join(" | ") || "Validation error.");
      }
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? data : c))
            .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditId(null);
      setEditName("");
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setSaveError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(catId) {
    if (!window.confirm("Delete this category? This cannot be undone.")) return;
    setDeleting(catId);
    try {
      const res = await fetch(`${API_BASE}/${catId}`, {
        method:  "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      if (!res.ok) {
        const data = await parseJson(res);
        throw new Error(data.detail || "Failed to delete category.");
      }
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      if (editId === catId) cancelEdit();
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
        <span className="submenu-label"><span style={{ marginRight: "-1px" }}>🏷️</span> Category Management</span>
      </div>

      <div className="inv-create-panel">
        <p className="inv-create-panel__title">Add Category</p>
        <form onSubmit={handleAdd}>
          <div className="inv-create-grid">
            <div className="inv-field">
              <label>Category Name</label>
              <input
                className="inv-text-input"
                placeholder="e.g. Beverages"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={adding}
              />
            </div>
            <div className="inv-create-actions">
              <button type="submit" disabled={adding || !newName.trim()}>
                {adding ? "Adding..." : "Add Category"}
              </button>
            </div>
          </div>
          {addError && <p className="inv-error" style={{ marginTop: "8px" }}>{addError}</p>}
        </form>
      </div>

      {loading && <p className="rpt-loading">Loading categories...</p>}
      {!loading && error && <p className="orders-load-error">{error}</p>}

      {!loading && !error && (
        categories.length === 0 ? (
          <p className="rpt-empty" style={{ padding: "0 4px" }}>No categories yet. Add one above to get started.</p>
        ) : (
          <>
            {saveError && <p className="inv-error" style={{ padding: "0 20px" }}>{saveError}</p>}
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th admin-th--no-sort">Category Name</th>
                  <th className="admin-th admin-th--no-sort no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) =>
                  editId === cat.id ? (
                    <tr key={cat.id}>
                      <td>
                        <input
                          className="inv-text-input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </td>
                      <td className="td-actions">
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => handleSave(cat.id)}
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
                    <tr key={cat.id}>
                      <td className="td-name" style={{ fontSize: "1.1rem" }}>{cat.name}</td>
                      <td className="td-actions">
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => startEdit(cat)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => handleDelete(cat.id)}
                          disabled={deleting === cat.id}
                        >
                          {deleting === cat.id ? "Deleting..." : "Delete"}
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
