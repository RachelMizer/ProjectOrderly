import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../api/auth";
import { handleApiError } from "../../api/handleApiError";

const API_ADMIN_BASE = "http://127.0.0.1:8000/api/v1/admin";

function fmt(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return "0";
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

export default function AdminPurchaseOrderPage() {
  const navigate = useNavigate();
  const [items, setItems]         = useState([]);
  const [orderQtys, setOrderQtys] = useState({});
  const [selected, setSelected]   = useState({});
  const [notes, setNotes]         = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const today    = new Date();
  const poDate   = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const poNumber = `PO-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_ADMIN_BASE}/inventory/low-stock`, { headers: { ...getAuthHeaders() } });
        if (res.status === 401 || res.status === 403) throw { status: res.status };
        if (!res.ok) throw new Error("Failed to load low-stock inventory.");

        const data     = await res.json();
        const invItems = data.inventoryItems || [];
        setItems(invItems);

        const qtys = {};
        const sel  = {};
        invItems.forEach((item) => {
          qtys[item.id] = Math.max(0, Math.ceil(parseFloat(item.reorderLevel) - parseFloat(item.stockQuantity)));
          sel[item.id]  = true;
        });
        setOrderQtys(qtys);
        setSelected(sel);
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          handleApiError(err, navigate);
        } else {
          setError(err.message || "Unable to load data.");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedItems = items.filter((i) => selected[i.id]);
  const allSelected   = items.length > 0 && items.every((i) => selected[i.id]);

  function toggleAll() {
    const allOn = items.every((i) => selected[i.id]);
    const next  = {};
    items.forEach((i) => { next[i.id] = !allOn; });
    setSelected(next);
  }

  function toggleItem(id) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleQtyChange(id, val) {
    setOrderQtys((prev) => ({ ...prev, [id]: val }));
  }

  function exportCSV() {
    const header = ["Item", "Unit", "Current Stock", "Reorder Level", "Supplier", "Order Qty"];
    const rows   = selectedItems.map((i) => [
      `"${i.name}"`, i.unitOfMeasure, fmt(i.stockQuantity), fmt(i.reorderLevel),
      `"${i.supplierName || "No supplier assigned"}"`, orderQtys[i.id] ?? 0,
    ]);
    const csv  = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${poNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label"><span style={{ marginRight: "-1px" }}>🛒</span> Purchase Order</span>
        <div className="submenu-actions">
          <button type="button" className="submenu-action" onClick={() => navigate("/admin/reports")}>
            <span style={{ marginRight: "-4px" }}>⬅️</span> BACK TO REPORTS
          </button>
          <span className="submenu-divider" />
          <button type="button" className="submenu-action" onClick={exportCSV} disabled={selectedItems.length === 0}>
            <span style={{ marginRight: "-1px" }}>📤</span>EXPORT CSV
          </button>
          <button type="button" className="submenu-action" onClick={() => window.print()}>
            <span style={{ marginRight: "-1px" }}>🖨️</span>PRINT
          </button>
        </div>
      </div>

      {loading && <p className="rpt-loading">Loading low-stock inventory...</p>}
      {!loading && error && <p className="orders-load-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="po-print-header print-only">
            <h2 className="po-print-header__title">Purchase Order</h2>
            <div className="po-print-header__meta">
              <span>{poNumber}</span>
              <span>{poDate}</span>
            </div>
          </div>

          <div className="po-control-bar no-print">
            <div className="po-control-bar__field">
              <label className="po-control-bar__label">PO Number</label>
              <span className="po-control-bar__value">{poNumber}</span>
            </div>
            <div className="po-control-bar__field">
              <label className="po-control-bar__label">Date</label>
              <span className="po-control-bar__value">{poDate}</span>
            </div>
            <div className="po-control-bar__field">
              <label className="po-control-bar__label">Items Selected</label>
              <span className="po-control-bar__value">{selectedItems.length} of {items.length}</span>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="rpt-empty">No low-stock inventory items found — everything is well stocked!</p>
          ) : (
            <>
              <div className="po-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-th no-print">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </th>
                    <th className="admin-th">Item</th>
                    <th className="admin-th">Unit</th>
                    <th className="admin-th">Current Stock</th>
                    <th className="admin-th">Reorder Level</th>
                    <th className="admin-th">Supplier</th>
                    <th className="admin-th">Order Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className={!selected[item.id] ? "po-row--deselected no-print" : ""}
                    >
                      <td className="no-print">
                        <input
                          type="checkbox"
                          checked={!!selected[item.id]}
                          onChange={() => toggleItem(item.id)}
                        />
                      </td>
                      <td className="td-name">{item.name}</td>
                      <td>{item.unitOfMeasure}</td>
                      <td>{fmt(item.stockQuantity)}</td>
                      <td>{fmt(item.reorderLevel)}</td>
                      <td className={!item.supplierName ? "po-no-supplier" : ""}>{item.supplierName || "No supplier assigned"}</td>
                      <td>
                        <input
                          type="number"
                          className="po-qty-input no-print"
                          min="0"
                          value={orderQtys[item.id] ?? ""}
                          onChange={(e) => handleQtyChange(item.id, e.target.value)}
                          disabled={!selected[item.id]}
                        />
                        <span className="print-only">{orderQtys[item.id] ?? 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <div className="po-footer">
                <hr className="po-footer__rule" />
                <p className="po-footer__count">
                  {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} on this order
                </p>
              </div>

              <div className="po-notes">
                <textarea
                  className="po-notes__input no-print"
                  placeholder="Notes / special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
                {notes && (
                  <p className="po-notes__print print-only"><strong>Notes:</strong> {notes}</p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
