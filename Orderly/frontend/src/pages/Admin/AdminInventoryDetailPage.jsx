import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchInventoryItem, updateInventoryItem } from "../../api/adminInventory";
import { getAuthHeaders } from "../../api/auth";
import { handleApiError } from "../../api/handleApiError";
import { formatPhone } from "../../utils/formatPhone";

const SUPPLIERS_URL = "http://127.0.0.1:8000/api/v1/admin/suppliers";

const UNIT_OPTIONS = [
  { value: "units", label: "Units" },
  { value: "oz",    label: "Ounces (oz)" },
  { value: "lb",    label: "Pounds (lb)" },
  { value: "g",     label: "Grams (g)" },
  { value: "ml",    label: "Milliliters (ml)" },
  { value: "l",     label: "Liters (L)" },
];

const UNIT_LABELS = {
  units: "Units", oz: "oz", lb: "lb", g: "g", ml: "ml", l: "L",
};

function fmt(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

export default function AdminInventoryDetailPage() {
  const { itemId } = useParams();
  const navigate   = useNavigate();

  const [item, setItem]         = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Stock edit state
  const [stockEdit, setStockEdit]           = useState({ stock_quantity: "", unit_of_measure: "units", reorder_level: "" });
  const [stockSaving, setStockSaving]       = useState(false);
  const [stockSuccess, setStockSuccess]     = useState(false);
  const [stockError, setStockError]         = useState("");

  // Supplier edit state
  const [supplierId, setSupplierId]         = useState("");
  const [supplierSaving, setSupplierSaving] = useState(false);
  const [supplierSuccess, setSupplierSuccess] = useState(false);
  const [supplierError, setSupplierError]   = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [itemData, suppRes] = await Promise.all([
          fetchInventoryItem(itemId),
          fetch(SUPPLIERS_URL, { headers: { ...getAuthHeaders() } }),
        ]);
        setItem(itemData);
        setStockEdit({
          stock_quantity:  String(itemData.stock_quantity ?? ""),
          unit_of_measure: itemData.unit_of_measure || "units",
          reorder_level:   itemData.reorder_level != null ? String(itemData.reorder_level) : "",
        });
        setSupplierId(itemData.supplier?.id ? String(itemData.supplier.id) : "");
        const suppData = suppRes.ok ? await suppRes.json() : { results: [] };
        setSuppliers(suppData.results || []);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          handleApiError(err, navigate);
        } else {
          setError(err.message || "Unable to load item.");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [itemId]);

  async function handleSaveStock() {
    setStockSaving(true);
    setStockError("");
    setStockSuccess(false);
    try {
      const payload = {
        stock_quantity:  stockEdit.stock_quantity === "" ? 0 : parseFloat(stockEdit.stock_quantity),
        unit_of_measure: stockEdit.unit_of_measure,
        reorder_level:   stockEdit.reorder_level === "" ? null : parseFloat(stockEdit.reorder_level),
      };
      const updated = await updateInventoryItem(itemId, payload);
      setItem(updated);
      setStockEdit({
        stock_quantity:  String(updated.stock_quantity ?? ""),
        unit_of_measure: updated.unit_of_measure || "units",
        reorder_level:   updated.reorder_level != null ? String(updated.reorder_level) : "",
      });
      setStockSuccess(true);
      setTimeout(() => setStockSuccess(false), 3000);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleApiError(err, navigate);
      } else {
        const d = err?.response?.data;
        setStockError(
          d?.stock_quantity?.[0] || d?.unit_of_measure?.[0] || d?.reorder_level?.[0] ||
          d?.message || err.message || "Failed to save."
        );
      }
    } finally {
      setStockSaving(false);
    }
  }

  async function handleSaveSupplier() {
    setSupplierSaving(true);
    setSupplierError("");
    setSupplierSuccess(false);
    try {
      const payload = { supplier_id: supplierId ? parseInt(supplierId) : null };
      const updated = await updateInventoryItem(itemId, payload);
      setItem(updated);
      setSupplierId(updated.supplier?.id ? String(updated.supplier.id) : "");
      setSupplierSuccess(true);
      setTimeout(() => setSupplierSuccess(false), 3000);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleApiError(err, navigate);
      } else {
        setSupplierError(err.message || "Failed to save supplier.");
      }
    } finally {
      setSupplierSaving(false);
    }
  }

  if (loading) return <div><div className="submenu-bar"><span className="submenu-label">Supply Detail</span></div><p className="rpt-loading">Loading...</p></div>;
  if (error)   return <div><div className="submenu-bar"><span className="submenu-label">Supply Detail</span></div><p className="orders-load-error">{error}</p></div>;
  if (!item)   return null;

  const stock      = parseFloat(item.stock_quantity);
  const reorder    = item.reorder_level != null ? parseFloat(item.reorder_level) : null;
  const isOut      = stock === 0;
  const isLow      = !isOut && reorder != null && stock <= reorder;
  const isCritical = isLow && stock <= reorder * 0.5;
  const unitLabel  = UNIT_LABELS[item.unit_of_measure] || item.unit_of_measure;

  const selectedSupplier = suppliers.find((s) => String(s.id) === supplierId) || null;
  const supplierChanged  = supplierId !== (item.supplier?.id ? String(item.supplier.id) : "");
  const stockChanged     = (
    stockEdit.stock_quantity  !== String(item.stock_quantity ?? "") ||
    stockEdit.unit_of_measure !== item.unit_of_measure ||
    stockEdit.reorder_level   !== (item.reorder_level != null ? String(item.reorder_level) : "")
  );

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label"><span style={{ marginRight: "-1px" }}>📦</span> Supply Detail</span>
        <div className="submenu-actions">
          <button type="button" className="submenu-action" onClick={() => navigate("/admin/inventory")}>
            <span style={{ marginRight: "-4px" }}>⬅️</span> BACK TO INVENTORY
          </button>
        </div>
      </div>

      <div className="supply-det-header">
        <h1 className="supply-det-name">{item.name}</h1>
        <div className="supply-det-badges">
          {isOut                  && <span className="inv-badge inv-badge--out">Out of Stock</span>}
          {isCritical && !isOut   && <span className="inv-badge inv-badge--critical">Critical Stock</span>}
          {isLow && !isCritical   && <span className="inv-badge inv-badge--low-stock">Low Stock</span>}
          {!isOut && !isLow       && <span className="inv-badge inv-badge--completed">In Stock</span>}
        </div>
      </div>

      <div className="supply-det-grid">

        {/* Stock Details */}
        <div className="supply-det-card">
          <p className="supply-det-card__title">Stock Details</p>
          <div className="supply-det-rows">
            <div className="supply-det-row supply-det-row--col">
              <label className="supply-det-row__label">Current Stock</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="po-qty-input supply-det-input"
                value={stockEdit.stock_quantity}
                onChange={(e) => setStockEdit((p) => ({ ...p, stock_quantity: e.target.value }))}
              />
            </div>
            <div className="supply-det-row supply-det-row--col">
              <label className="supply-det-row__label">Unit of Measure</label>
              <select
                className="rpt-month-select supply-det-select"
                value={stockEdit.unit_of_measure}
                onChange={(e) => setStockEdit((p) => ({ ...p, unit_of_measure: e.target.value }))}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div className="supply-det-row supply-det-row--col">
              <label className="supply-det-row__label">Reorder Level</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="po-qty-input supply-det-input"
                value={stockEdit.reorder_level}
                placeholder="—"
                onChange={(e) => setStockEdit((p) => ({ ...p, reorder_level: e.target.value }))}
              />
            </div>
          </div>

          <div className="supply-det-save-row">
            {stockSuccess && <span className="inv-save-success">Saved!</span>}
            {stockError   && <span className="inv-error">{stockError}</span>}
            <button
              type="button"
              className="table-action-btn supply-det-save-btn"
              onClick={handleSaveStock}
              disabled={stockSaving || !stockChanged}
            >
              {stockSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Supplier */}
        <div className="supply-det-card">
          <div className="supply-det-card__title-row">
            <p className="supply-det-card__title">Supplier</p>
            <button
              type="button"
              className="supply-det-new-supplier"
              onClick={() => navigate("/admin/suppliers/new")}
            >
              + New Supplier
            </button>
          </div>
          <div className="supply-det-rows">
            <div className="supply-det-row supply-det-row--col">
              <span className="supply-det-row__label">Assigned Supplier</span>
              <select
                className="rpt-month-select supply-det-select"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">— None —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {selectedSupplier && (
              <>
                {selectedSupplier.email && (
                  <div className="supply-det-row">
                    <span className="supply-det-row__label">Email</span>
                    <span className="supply-det-row__value">{selectedSupplier.email}</span>
                  </div>
                )}
                {selectedSupplier.phone && (
                  <div className="supply-det-row">
                    <span className="supply-det-row__label">Phone</span>
                    <span className="supply-det-row__value">{formatPhone(selectedSupplier.phone)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="supply-det-save-row">
            {supplierSuccess && <span className="inv-save-success">Saved!</span>}
            {supplierError   && <span className="inv-error">{supplierError}</span>}
            <button
              type="button"
              className="table-action-btn supply-det-save-btn"
              onClick={handleSaveSupplier}
              disabled={supplierSaving || !supplierChanged}
            >
              {supplierSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Used In Products */}
        {item.affected_products?.length > 0 && (
          <div className="supply-det-card">
            <p className="supply-det-card__title">Used In Products</p>
            <ul className="supply-det-product-list">
              {item.affected_products.map((name) => (
                <li key={name} className="supply-det-product-list__item">{name}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
