import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date(date);
  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
}

const EMPTY_FORM = { title: "", category: "", body: "" };

export default function KnowledgeBasePage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/support/knowledge/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setArticles(data.results || []);
        }
      } catch (err) {
        console.error("Failed to load knowledge base:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
  });

  const categories = [...new Set(articles.map((a) => a.category).filter(Boolean))].sort();

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) { setCreateError("Title is required."); return; }
    if (!form.body.trim()) { setCreateError("Body is required."); return; }
    setCreating(true);
    setCreateError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/knowledge/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json();
        setArticles((prev) => [...prev, created].sort((a, b) => a.title.localeCompare(b.title)));
        setForm(EMPTY_FORM);
        setShowCreate(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.message || "Failed to create article.");
      }
    } catch {
      setCreateError("Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveEdit(id) {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/support/knowledge/${id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setArticles((prev) => prev.map((a) => a.id === id ? updated : a));
        setEditingId(null);
      }
    } catch (err) {
      console.error("Failed to save article:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${API}/support/knowledge/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles((prev) => prev.filter((a) => a.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error("Failed to delete article:", err);
    } finally {
      setDeletingId(null);
    }
  }

  function groupByCategory(items) {
    const grouped = {};
    items.forEach((a) => {
      const cat = a.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(a);
    });
    return grouped;
  }

  const grouped = groupByCategory(filtered);

  return (
    <div className="admin-dash support-dash">
      <div className="ticket-detail__header">
        <h1 className="ticket-detail__title">Knowledge Base</h1>
        <button className="support-back-btn" onClick={() => { setShowCreate((v) => !v); setCreateError(""); setForm(EMPTY_FORM); }}>
          {showCreate ? "Cancel" : "+ New Article"}
        </button>
      </div>

      {showCreate && (
        <div className="support-section">
          <p className="support-section-label">New Article</p>
          <form onSubmit={handleCreate} className="knowledge-form">
            <div style={{ display: "flex", gap: "12px" }}>
              <label className="support-filter-label" style={{ flex: 2 }}>
                Title
                <input
                  className="ticket-form__input"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Article title"
                  disabled={creating}
                />
              </label>
              <label className="support-filter-label" style={{ flex: 1 }}>
                Category
                <input
                  className="ticket-form__input"
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Returns, Shipping, Billing"
                  list="kb-categories"
                  disabled={creating}
                />
                <datalist id="kb-categories">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </label>
            </div>
            <label className="support-filter-label">
              Body
              <textarea
                className="ticket-form__textarea"
                rows={6}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Write the article content here…"
                disabled={creating}
              />
            </label>
            {createError && <p className="ticket-form__error">{createError}</p>}
            <div className="ticket-detail__save-row" style={{ marginTop: "8px" }}>
              <button type="submit" className="support-back-btn" disabled={creating}>
                {creating ? "Saving…" : "Save Article"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="support-section">
        <input
          className="ticket-form__input"
          type="text"
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "14px" }}
        />

        {loading ? (
          <p className="admin-loading">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="support-empty">{articles.length === 0 ? "No articles yet. Add the first one." : "No articles match your search."}</p>
        ) : (
          Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
            <div key={cat} className="kb-category-group">
              <p className="kb-category-heading">{cat}</p>
              {items.map((article) => (
                <div key={article.id} className="kb-article-card">
                  {editingId === article.id ? (
                    <div className="kb-article-edit">
                      <input
                        className="ticket-form__input"
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        disabled={saving}
                      />
                      <input
                        className="ticket-form__input"
                        value={editForm.category}
                        onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                        list="kb-categories"
                        disabled={saving}
                        style={{ marginTop: "6px" }}
                      />
                      <textarea
                        className="ticket-form__textarea"
                        rows={5}
                        value={editForm.body}
                        onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))}
                        disabled={saving}
                        style={{ marginTop: "6px" }}
                      />
                      <div className="ticket-note__edit-actions" style={{ marginTop: "8px" }}>
                        <button className="support-back-btn" disabled={saving} onClick={() => handleSaveEdit(article.id)}>
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button className="support-back-btn" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="kb-article-card__header"
                        onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                      >
                        <span className="kb-article-card__title">{article.title}</span>
                        <span className="kb-article-card__chevron">{expandedId === article.id ? "▲" : "▼"}</span>
                      </div>
                      {expandedId === article.id && (
                        <div className="kb-article-card__body">
                          <p className="kb-article-card__text">{article.body}</p>
                          <div className="kb-article-card__meta">
                            {article.createdBy && <span>Added by {article.createdBy}</span>}
                            {article.updatedAt && <span> · Updated {formatDate(article.updatedAt)}</span>}
                          </div>
                          <div className="ticket-note__actions" style={{ marginTop: "10px" }}>
                            <button className="ticket-note__edit-btn" onClick={() => { setEditingId(article.id); setEditForm({ title: article.title, category: article.category, body: article.body }); }}>
                              Edit
                            </button>
                            <button className="ticket-note__delete-btn" disabled={deletingId === article.id} onClick={() => handleDelete(article.id)}>
                              {deletingId === article.id ? "…" : "Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="ticket-detail__footer">
        <button className="support-back-btn" onClick={() => navigate("/admin")}>
          <strong>←</strong> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
