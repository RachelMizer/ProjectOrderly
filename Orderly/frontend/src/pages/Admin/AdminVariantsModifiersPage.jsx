import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../api/auth";
import { handleApiError } from "../../api/handleApiError";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1/admin`;

async function parseJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return {};
  try { return await res.json(); } catch { return {}; }
}

function flatErrors(data, fallback = "Validation error.") {
  if (!data || typeof data !== "object") return fallback;
  const msgs = Object.entries(data).flatMap(([, v]) => Array.isArray(v) ? v : [String(v)]);
  return msgs.join(" | ") || fallback;
}

function fmtAdj(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return "$0.00";
  return (n >= 0 ? "+" : "-") + "$" + Math.abs(n).toFixed(2);
}

export default function AdminVariantsModifiersPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  // --- Variants ---
  const [variants, setVariants] = useState([]);
  const [varLoading, setVarLoading] = useState(true);
  const [varError, setVarError] = useState("");
  const [filterVarProd, setFilterVarProd] = useState("");

  const [addVarProd, setAddVarProd] = useState("");
  const [addVarName, setAddVarName] = useState("");
  const [addVarSku, setAddVarSku] = useState("");
  const [addVarPrice, setAddVarPrice] = useState("");
  const [addVarStock, setAddVarStock] = useState("");
  const [addingVar, setAddingVar] = useState(false);
  const [addVarError, setAddVarError] = useState("");

  const [editVarId, setEditVarId] = useState(null);
  const [editVarVals, setEditVarVals] = useState({});
  const [savingVar, setSavingVar] = useState(false);
  const [saveVarError, setSaveVarError] = useState("");
  const [deletingVarId, setDeletingVarId] = useState(null);

  // --- Modifier Groups ---
  const [groups, setGroups] = useState([]);
  const [grpLoading, setGrpLoading] = useState(true);
  const [grpError, setGrpError] = useState("");
  const [filterGrpProd, setFilterGrpProd] = useState("");

  const [addGrpProd, setAddGrpProd] = useState("");
  const [addGrpVars, setAddGrpVars] = useState([]);
  const [addGrpVar, setAddGrpVar] = useState("");
  const [addGrpName, setAddGrpName] = useState("");
  const [addGrpRequired, setAddGrpRequired] = useState(false);
  const [addGrpMin, setAddGrpMin] = useState("0");
  const [addGrpMax, setAddGrpMax] = useState("1");
  const [addingGrp, setAddingGrp] = useState(false);
  const [addGrpError, setAddGrpError] = useState("");

  const [editGrpId, setEditGrpId] = useState(null);
  const [editGrpVals, setEditGrpVals] = useState({});
  const [savingGrp, setSavingGrp] = useState(false);
  const [saveGrpError, setSaveGrpError] = useState("");
  const [deletingGrpId, setDeletingGrpId] = useState(null);

  // --- Options within expanded group ---
  const [expandedGrpId, setExpandedGrpId] = useState(null);
  const [addOptName, setAddOptName] = useState("");
  const [addOptPrice, setAddOptPrice] = useState("0.00");
  const [addingOpt, setAddingOpt] = useState(false);
  const [addOptError, setAddOptError] = useState("");
  const [editOptId, setEditOptId] = useState(null);
  const [editOptVals, setEditOptVals] = useState({});
  const [savingOpt, setSavingOpt] = useState(false);
  const [saveOptError, setSaveOptError] = useState("");
  const [deletingOptId, setDeletingOptId] = useState(null);

  useEffect(() => {
    loadProducts();
    loadVariants();
    loadGroups();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/products`, { headers: { ...getAuthHeaders() } });
      if (!res.ok) return;
      const data = await parseJson(res);
      setProducts(data.results || []);
    } catch { /* non-fatal */ }
  }

  async function loadVariants() {
    try {
      setVarLoading(true);
      setVarError("");
      const res = await fetch(`${API}/variants`, { headers: { ...getAuthHeaders() } });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      if (!res.ok) throw new Error("Failed to load variants.");
      const data = await parseJson(res);
      setVariants(data.results || []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setVarError(err.message || "Unable to load variants.");
    } finally {
      setVarLoading(false);
    }
  }

  async function loadGroups() {
    try {
      setGrpLoading(true);
      setGrpError("");
      const res = await fetch(`${API}/modifier-groups`, { headers: { ...getAuthHeaders() } });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      if (!res.ok) throw new Error("Failed to load modifier groups.");
      const data = await parseJson(res);
      setGroups(data.results || []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setGrpError(err.message || "Unable to load modifier groups.");
    } finally {
      setGrpLoading(false);
    }
  }

  // ---- Variants CRUD ----

  async function handleAddVariant(e) {
    e.preventDefault();
    if (!addVarProd) return setAddVarError("Please select a product.");
    if (!addVarName.trim()) return setAddVarError("Variant name is required.");
    if (!addVarSku.trim()) return setAddVarError("SKU is required.");
    if (!addVarPrice) return setAddVarError("Unit price is required.");
    setAddingVar(true);
    setAddVarError("");
    try {
      const body = {
        product: parseInt(addVarProd),
        name: addVarName.trim(),
        sku: addVarSku.trim(),
        unit_price: addVarPrice,
        stock_quantity: addVarStock !== "" ? parseInt(addVarStock) : null,
      };
      const res = await fetch(`${API}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      const data = await parseJson(res);
      if (!res.ok) throw new Error(flatErrors(data));
      setVariants((prev) =>
        [...prev, data].sort((a, b) =>
          (a.product_name + a.name).localeCompare(b.product_name + b.name)
        )
      );
      setAddVarProd(""); setAddVarName(""); setAddVarSku(""); setAddVarPrice(""); setAddVarStock("");
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setAddVarError(err.message || "Failed to add variant.");
    } finally {
      setAddingVar(false);
    }
  }

  function startEditVar(v) {
    setEditVarId(v.id);
    setEditVarVals({
      name: v.name,
      sku: v.sku,
      unit_price: String(v.unit_price),
      stock_quantity: v.stock_quantity !== null ? String(v.stock_quantity) : "",
    });
    setSaveVarError("");
  }

  function cancelEditVar() {
    setEditVarId(null);
    setEditVarVals({});
    setSaveVarError("");
  }

  async function handleSaveVar(varId) {
    setSavingVar(true);
    setSaveVarError("");
    try {
      const body = {
        name: editVarVals.name,
        sku: editVarVals.sku,
        unit_price: editVarVals.unit_price,
        stock_quantity: editVarVals.stock_quantity !== "" ? parseInt(editVarVals.stock_quantity) : null,
      };
      const res = await fetch(`${API}/variants/${varId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      const data = await parseJson(res);
      if (!res.ok) throw new Error(flatErrors(data));
      setVariants((prev) =>
        prev.map((v) => (v.id === varId ? data : v))
            .sort((a, b) => (a.product_name + a.name).localeCompare(b.product_name + b.name))
      );
      cancelEditVar();
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setSaveVarError(err.message || "Failed to save.");
    } finally {
      setSavingVar(false);
    }
  }

  async function handleDeleteVar(varId) {
    if (!window.confirm("Delete this variant? This cannot be undone.")) return;
    setDeletingVarId(varId);
    try {
      const res = await fetch(`${API}/variants/${varId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      if (!res.ok) {
        const data = await parseJson(res);
        throw new Error(data.detail || "Failed to delete variant.");
      }
      setVariants((prev) => prev.filter((v) => v.id !== varId));
      if (editVarId === varId) cancelEditVar();
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setVarError(err.message || "Failed to delete variant.");
    } finally {
      setDeletingVarId(null);
    }
  }

  // ---- Modifier Groups CRUD ----

  async function loadVarsForProduct(productId) {
    if (!productId) { setAddGrpVars([]); setAddGrpVar(""); return; }
    try {
      const res = await fetch(`${API}/products/${productId}/variants`, {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error();
      const data = await parseJson(res);
      setAddGrpVars(data.results || []);
      setAddGrpVar("");
    } catch {
      setAddGrpVars([]);
      setAddGrpVar("");
    }
  }

  async function handleAddGroup(e) {
    e.preventDefault();
    if (!addGrpVar) return setAddGrpError("Please select a variant.");
    if (!addGrpName.trim()) return setAddGrpError("Group name is required.");
    setAddingGrp(true);
    setAddGrpError("");
    try {
      const body = {
        variant: parseInt(addGrpVar),
        name: addGrpName.trim(),
        required: addGrpRequired,
        min_selections: parseInt(addGrpMin) || 0,
        max_selections: parseInt(addGrpMax) || 1,
      };
      const res = await fetch(`${API}/modifier-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      const data = await parseJson(res);
      if (!res.ok) throw new Error(flatErrors(data));
      setGroups((prev) =>
        [...prev, data].sort((a, b) =>
          (a.product_name + a.variant_name + a.name).localeCompare(b.product_name + b.variant_name + b.name)
        )
      );
      setAddGrpProd(""); setAddGrpVars([]); setAddGrpVar(""); setAddGrpName("");
      setAddGrpRequired(false); setAddGrpMin("0"); setAddGrpMax("1");
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setAddGrpError(err.message || "Failed to add group.");
    } finally {
      setAddingGrp(false);
    }
  }

  function startEditGrp(g) {
    setEditGrpId(g.id);
    setEditGrpVals({
      name: g.name,
      required: g.required,
      min_selections: String(g.min_selections),
      max_selections: String(g.max_selections),
    });
    setSaveGrpError("");
  }

  function cancelEditGrp() {
    setEditGrpId(null);
    setEditGrpVals({});
    setSaveGrpError("");
  }

  async function handleSaveGrp(grpId) {
    setSavingGrp(true);
    setSaveGrpError("");
    try {
      const body = {
        name: editGrpVals.name,
        required: editGrpVals.required,
        min_selections: parseInt(editGrpVals.min_selections) || 0,
        max_selections: parseInt(editGrpVals.max_selections) || 1,
      };
      const res = await fetch(`${API}/modifier-groups/${grpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      const data = await parseJson(res);
      if (!res.ok) throw new Error(flatErrors(data));
      setGroups((prev) => prev.map((g) => (g.id === grpId ? { ...g, ...data } : g)));
      cancelEditGrp();
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setSaveGrpError(err.message || "Failed to save.");
    } finally {
      setSavingGrp(false);
    }
  }

  async function handleDeleteGrp(grpId) {
    if (!window.confirm("Delete this modifier group and all its options? This cannot be undone.")) return;
    setDeletingGrpId(grpId);
    try {
      const res = await fetch(`${API}/modifier-groups/${grpId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      if (!res.ok) {
        const data = await parseJson(res);
        throw new Error(data.detail || "Failed to delete group.");
      }
      setGroups((prev) => prev.filter((g) => g.id !== grpId));
      if (editGrpId === grpId) cancelEditGrp();
      if (expandedGrpId === grpId) setExpandedGrpId(null);
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setGrpError(err.message || "Failed to delete group.");
    } finally {
      setDeletingGrpId(null);
    }
  }

  // ---- Modifier Options CRUD ----

  function toggleExpand(grpId) {
    if (expandedGrpId === grpId) {
      setExpandedGrpId(null);
    } else {
      setExpandedGrpId(grpId);
      setAddOptName(""); setAddOptPrice("0.00"); setAddOptError("");
      setEditOptId(null); setSaveOptError("");
    }
  }

  async function handleAddOption(grpId) {
    if (!addOptName.trim()) return setAddOptError("Option name is required.");
    setAddingOpt(true);
    setAddOptError("");
    try {
      const res = await fetch(`${API}/modifier-groups/${grpId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ name: addOptName.trim(), price_adjustment: addOptPrice || "0.00" }),
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      const data = await parseJson(res);
      if (!res.ok) throw new Error(flatErrors(data));
      setGroups((prev) =>
        prev.map((g) =>
          g.id === grpId
            ? { ...g, options: [...g.options, data].sort((a, b) => a.name.localeCompare(b.name)) }
            : g
        )
      );
      setAddOptName(""); setAddOptPrice("0.00");
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setAddOptError(err.message || "Failed to add option.");
    } finally {
      setAddingOpt(false);
    }
  }

  function startEditOpt(opt) {
    setEditOptId(opt.id);
    setEditOptVals({ name: opt.name, price_adjustment: String(opt.price_adjustment) });
    setSaveOptError("");
  }

  function cancelEditOpt() {
    setEditOptId(null);
    setEditOptVals({});
    setSaveOptError("");
  }

  async function handleSaveOpt(grpId, optId) {
    setSavingOpt(true);
    setSaveOptError("");
    try {
      const res = await fetch(`${API}/modifier-groups/${grpId}/options/${optId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ name: editOptVals.name, price_adjustment: editOptVals.price_adjustment }),
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      const data = await parseJson(res);
      if (!res.ok) throw new Error(flatErrors(data));
      setGroups((prev) =>
        prev.map((g) =>
          g.id === grpId
            ? { ...g, options: g.options.map((o) => (o.id === optId ? data : o)) }
            : g
        )
      );
      cancelEditOpt();
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setSaveOptError(err.message || "Failed to save option.");
    } finally {
      setSavingOpt(false);
    }
  }

  async function handleDeleteOpt(grpId, optId) {
    if (!window.confirm("Delete this option? This cannot be undone.")) return;
    setDeletingOptId(optId);
    try {
      const res = await fetch(`${API}/modifier-groups/${grpId}/options/${optId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (res.status === 401 || res.status === 403) throw { status: res.status };
      if (!res.ok) {
        const data = await parseJson(res);
        throw new Error(data.detail || "Failed to delete option.");
      }
      setGroups((prev) =>
        prev.map((g) =>
          g.id === grpId
            ? { ...g, options: g.options.filter((o) => o.id !== optId) }
            : g
        )
      );
      if (editOptId === optId) cancelEditOpt();
    } catch (err) {
      if (err.status === 401 || err.status === 403) handleApiError(err, navigate);
      else setSaveOptError(err.message || "Failed to delete option.");
    } finally {
      setDeletingOptId(null);
    }
  }

  const filteredVariants = filterVarProd
    ? variants.filter((v) => String(v.product) === filterVarProd)
    : variants;

  const filteredGroups = filterGrpProd
    ? groups.filter((g) => String(g.product_id) === filterGrpProd)
    : groups;

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label">
          <span style={{ marginRight: "-1px" }}>🔧</span> Variants &amp; Modifiers
        </span>
      </div>

      {/* ======= VARIANTS ======= */}
      <div style={{ padding: "20px 20px 4px" }}>
        <p style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.55, margin: 0 }}>
          Product Variants
        </p>
      </div>

      <div className="inv-create-panel">
        <p className="inv-create-panel__title">Add Variant</p>
        <form onSubmit={handleAddVariant}>
          <div className="inv-create-grid">
            <div className="inv-field">
              <label>Product</label>
              <select className="inv-text-input" value={addVarProd}
                onChange={(e) => setAddVarProd(e.target.value)} disabled={addingVar}>
                <option value="">— Select product —</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="inv-field">
              <label>Variant Name</label>
              <input className="inv-text-input" placeholder="e.g. Large" value={addVarName}
                onChange={(e) => setAddVarName(e.target.value)} disabled={addingVar} />
            </div>
            <div className="inv-field">
              <label>SKU</label>
              <input className="inv-text-input" placeholder="e.g. PROD-LG-001" value={addVarSku}
                onChange={(e) => setAddVarSku(e.target.value)} disabled={addingVar} />
            </div>
            <div className="inv-field">
              <label>Unit Price</label>
              <input className="inv-text-input" type="number" step="0.01" min="0" placeholder="0.00"
                value={addVarPrice} onChange={(e) => setAddVarPrice(e.target.value)} disabled={addingVar} />
            </div>
            <div className="inv-field">
              <label>Stock Qty (optional)</label>
              <input className="inv-text-input" type="number" min="0" placeholder="—"
                value={addVarStock} onChange={(e) => setAddVarStock(e.target.value)} disabled={addingVar} />
            </div>
          </div>
          <div className="inv-create-actions" style={{ marginTop: "12px" }}>
            <button type="submit" disabled={addingVar}>{addingVar ? "Adding..." : "Add Variant"}</button>
          </div>
          {addVarError && <p className="inv-error" style={{ marginTop: "8px" }}>{addVarError}</p>}
        </form>
      </div>

      <div style={{ padding: "0 20px 10px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 500, opacity: 0.7 }}>Filter:</span>
        <select className="inv-text-input" style={{ maxWidth: "220px" }} value={filterVarProd}
          onChange={(e) => setFilterVarProd(e.target.value)}>
          <option value="">All Products</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {varLoading && <p className="rpt-loading">Loading variants...</p>}
      {!varLoading && varError && <p className="orders-load-error">{varError}</p>}
      {!varLoading && !varError && (
        filteredVariants.length === 0 ? (
          <p className="rpt-empty" style={{ padding: "0 4px" }}>No variants yet. Add one above to get started.</p>
        ) : (
          <>
            {saveVarError && <p className="inv-error" style={{ padding: "0 20px" }}>{saveVarError}</p>}
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th admin-th--no-sort">Product</th>
                  <th className="admin-th admin-th--no-sort">Variant Name</th>
                  <th className="admin-th admin-th--no-sort">SKU</th>
                  <th className="admin-th admin-th--no-sort">Price</th>
                  <th className="admin-th admin-th--no-sort">Stock</th>
                  <th className="admin-th admin-th--no-sort no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariants.map((v) =>
                  editVarId === v.id ? (
                    <tr key={v.id}>
                      <td className="td-name">{v.product_name}</td>
                      <td>
                        <input className="inv-text-input" value={editVarVals.name}
                          onChange={(e) => setEditVarVals((p) => ({ ...p, name: e.target.value }))} />
                      </td>
                      <td>
                        <input className="inv-text-input" value={editVarVals.sku}
                          onChange={(e) => setEditVarVals((p) => ({ ...p, sku: e.target.value }))} />
                      </td>
                      <td>
                        <input className="inv-text-input" type="number" step="0.01" min="0"
                          value={editVarVals.unit_price}
                          onChange={(e) => setEditVarVals((p) => ({ ...p, unit_price: e.target.value }))} />
                      </td>
                      <td>
                        <input className="inv-text-input" type="number" min="0" placeholder="—"
                          value={editVarVals.stock_quantity}
                          onChange={(e) => setEditVarVals((p) => ({ ...p, stock_quantity: e.target.value }))} />
                      </td>
                      <td className="td-actions">
                        <button type="button" className="table-action-btn"
                          onClick={() => handleSaveVar(v.id)} disabled={savingVar}>
                          {savingVar ? "Saving..." : "Save"}
                        </button>
                        <button type="button" className="table-action-btn"
                          onClick={cancelEditVar} disabled={savingVar}>Cancel</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={v.id}>
                      <td className="td-name">{v.product_name}</td>
                      <td>{v.name}</td>
                      <td>{v.sku}</td>
                      <td>${parseFloat(v.unit_price).toFixed(2)}</td>
                      <td>{v.stock_quantity !== null ? v.stock_quantity : "—"}</td>
                      <td className="td-actions">
                        <button type="button" className="table-action-btn"
                          onClick={() => startEditVar(v)}>Edit</button>
                        <button type="button" className="table-action-btn"
                          onClick={() => handleDeleteVar(v.id)} disabled={deletingVarId === v.id}>
                          {deletingVarId === v.id ? "Deleting..." : "Delete"}
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

      {/* ======= MODIFIER GROUPS ======= */}
      <div style={{ padding: "28px 20px 4px" }}>
        <p style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.55, margin: 0 }}>
          Modifier Groups &amp; Options
        </p>
      </div>

      <div className="inv-create-panel">
        <p className="inv-create-panel__title">Add Modifier Group</p>
        <form onSubmit={handleAddGroup}>
          <div className="inv-create-grid">
            <div className="inv-field">
              <label>Product</label>
              <select className="inv-text-input" value={addGrpProd}
                onChange={(e) => { setAddGrpProd(e.target.value); loadVarsForProduct(e.target.value); }}
                disabled={addingGrp}>
                <option value="">— Select product —</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="inv-field">
              <label>Variant</label>
              <select className="inv-text-input" value={addGrpVar}
                onChange={(e) => setAddGrpVar(e.target.value)}
                disabled={addingGrp || !addGrpProd}>
                <option value="">— Select variant —</option>
                {addGrpVars.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="inv-field">
              <label>Group Name</label>
              <input className="inv-text-input" placeholder="e.g. Milk Type" value={addGrpName}
                onChange={(e) => setAddGrpName(e.target.value)} disabled={addingGrp} />
            </div>
            <div className="inv-field">
              <label>Min Selections</label>
              <input className="inv-text-input" type="number" min="0" value={addGrpMin}
                onChange={(e) => setAddGrpMin(e.target.value)} disabled={addingGrp} />
            </div>
            <div className="inv-field">
              <label>Max Selections</label>
              <input className="inv-text-input" type="number" min="1" value={addGrpMax}
                onChange={(e) => setAddGrpMax(e.target.value)} disabled={addingGrp} />
            </div>
            <div className="inv-field" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="checkbox" checked={addGrpRequired}
                  onChange={(e) => setAddGrpRequired(e.target.checked)} disabled={addingGrp} />
                Required
              </label>
            </div>
          </div>
          <div className="inv-create-actions">
            <button type="submit" disabled={addingGrp}>{addingGrp ? "Adding..." : "Add Group"}</button>
          </div>
          {addGrpError && <p className="inv-error" style={{ marginTop: "8px" }}>{addGrpError}</p>}
        </form>
      </div>

      <div style={{ padding: "0 20px 10px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 500, opacity: 0.7 }}>Filter:</span>
        <select className="inv-text-input" style={{ maxWidth: "220px" }} value={filterGrpProd}
          onChange={(e) => setFilterGrpProd(e.target.value)}>
          <option value="">All Products</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {grpLoading && <p className="rpt-loading">Loading modifier groups...</p>}
      {!grpLoading && grpError && <p className="orders-load-error">{grpError}</p>}
      {!grpLoading && !grpError && (
        filteredGroups.length === 0 ? (
          <p className="rpt-empty" style={{ padding: "0 4px" }}>No modifier groups yet. Add one above to get started.</p>
        ) : (
          <>
            {saveGrpError && <p className="inv-error" style={{ padding: "0 20px" }}>{saveGrpError}</p>}
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th admin-th--no-sort">Product</th>
                  <th className="admin-th admin-th--no-sort">Variant</th>
                  <th className="admin-th admin-th--no-sort">Group Name</th>
                  <th className="admin-th admin-th--no-sort">Required</th>
                  <th className="admin-th admin-th--no-sort">Min</th>
                  <th className="admin-th admin-th--no-sort">Max</th>
                  <th className="admin-th admin-th--no-sort no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((g) => (
                  <Fragment key={g.id}>
                    {editGrpId === g.id ? (
                      <tr>
                        <td className="td-name">{g.product_name}</td>
                        <td>{g.variant_name}</td>
                        <td>
                          <input className="inv-text-input" value={editGrpVals.name}
                            onChange={(e) => setEditGrpVals((p) => ({ ...p, name: e.target.value }))} />
                        </td>
                        <td>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                            <input type="checkbox" checked={editGrpVals.required}
                              onChange={(e) => setEditGrpVals((p) => ({ ...p, required: e.target.checked }))} />
                            {editGrpVals.required ? "Yes" : "No"}
                          </label>
                        </td>
                        <td>
                          <input className="inv-text-input" type="number" min="0" style={{ width: "64px" }}
                            value={editGrpVals.min_selections}
                            onChange={(e) => setEditGrpVals((p) => ({ ...p, min_selections: e.target.value }))} />
                        </td>
                        <td>
                          <input className="inv-text-input" type="number" min="1" style={{ width: "64px" }}
                            value={editGrpVals.max_selections}
                            onChange={(e) => setEditGrpVals((p) => ({ ...p, max_selections: e.target.value }))} />
                        </td>
                        <td className="td-actions">
                          <button type="button" className="table-action-btn"
                            onClick={() => handleSaveGrp(g.id)} disabled={savingGrp}>
                            {savingGrp ? "Saving..." : "Save"}
                          </button>
                          <button type="button" className="table-action-btn"
                            onClick={cancelEditGrp} disabled={savingGrp}>Cancel</button>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td className="td-name">{g.product_name}</td>
                        <td>{g.variant_name}</td>
                        <td>{g.name}</td>
                        <td>{g.required ? "Yes" : "No"}</td>
                        <td>{g.min_selections}</td>
                        <td>{g.max_selections}</td>
                        <td className="td-actions">
                          <button type="button" className="table-action-btn"
                            onClick={() => toggleExpand(g.id)}>
                            {expandedGrpId === g.id ? "▲" : "▼"} Options ({g.options.length})
                          </button>
                          <button type="button" className="table-action-btn"
                            onClick={() => startEditGrp(g)}>Edit</button>
                          <button type="button" className="table-action-btn"
                            onClick={() => handleDeleteGrp(g.id)} disabled={deletingGrpId === g.id}>
                            {deletingGrpId === g.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    )}

                    {expandedGrpId === g.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: "16px 28px 20px", background: "rgba(0,0,0,0.18)" }}>
                          <p style={{ fontWeight: 600, marginBottom: "10px", fontSize: "0.9rem" }}>
                            Options for &ldquo;{g.name}&rdquo;
                          </p>
                          {saveOptError && <p className="inv-error" style={{ marginBottom: "8px" }}>{saveOptError}</p>}

                          {g.options.length === 0 ? (
                            <p className="rpt-empty" style={{ marginBottom: "12px" }}>No options yet.</p>
                          ) : (
                            <table className="admin-table" style={{ marginBottom: "14px" }}>
                              <thead>
                                <tr>
                                  <th className="admin-th admin-th--no-sort">Option Name</th>
                                  <th className="admin-th admin-th--no-sort">Price Adjustment</th>
                                  <th className="admin-th admin-th--no-sort no-print">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {g.options.map((opt) =>
                                  editOptId === opt.id ? (
                                    <tr key={opt.id}>
                                      <td>
                                        <input className="inv-text-input" value={editOptVals.name}
                                          onChange={(e) => setEditOptVals((p) => ({ ...p, name: e.target.value }))} />
                                      </td>
                                      <td>
                                        <input className="inv-text-input" type="number" step="0.01"
                                          value={editOptVals.price_adjustment}
                                          onChange={(e) => setEditOptVals((p) => ({ ...p, price_adjustment: e.target.value }))} />
                                      </td>
                                      <td className="td-actions">
                                        <button type="button" className="table-action-btn"
                                          onClick={() => handleSaveOpt(g.id, opt.id)} disabled={savingOpt}>
                                          {savingOpt ? "Saving..." : "Save"}
                                        </button>
                                        <button type="button" className="table-action-btn"
                                          onClick={cancelEditOpt} disabled={savingOpt}>Cancel</button>
                                      </td>
                                    </tr>
                                  ) : (
                                    <tr key={opt.id}>
                                      <td>{opt.name}</td>
                                      <td>{fmtAdj(opt.price_adjustment)}</td>
                                      <td className="td-actions">
                                        <button type="button" className="table-action-btn"
                                          onClick={() => startEditOpt(opt)}>Edit</button>
                                        <button type="button" className="table-action-btn"
                                          onClick={() => handleDeleteOpt(g.id, opt.id)}
                                          disabled={deletingOptId === opt.id}>
                                          {deletingOptId === opt.id ? "Deleting..." : "Delete"}
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          )}

                          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
                            <div className="inv-field" style={{ margin: 0, minWidth: "160px" }}>
                              <label>Option Name</label>
                              <input className="inv-text-input" placeholder="e.g. Oat Milk"
                                value={addOptName} onChange={(e) => setAddOptName(e.target.value)}
                                disabled={addingOpt} />
                            </div>
                            <div className="inv-field" style={{ margin: 0, minWidth: "110px" }}>
                              <label>Price Adj. ($)</label>
                              <input className="inv-text-input" type="number" step="0.01"
                                placeholder="0.00" value={addOptPrice}
                                onChange={(e) => setAddOptPrice(e.target.value)}
                                disabled={addingOpt} />
                            </div>
                            <button type="button" className="table-action-btn"
                              style={{ alignSelf: "flex-end", padding: "6px 14px" }}
                              onClick={() => handleAddOption(g.id)} disabled={addingOpt}>
                              {addingOpt ? "Adding..." : "+ Add Option"}
                            </button>
                          </div>
                          {addOptError && <p className="inv-error" style={{ marginTop: "6px" }}>{addOptError}</p>}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </>
        )
      )}
    </div>
  );
}
