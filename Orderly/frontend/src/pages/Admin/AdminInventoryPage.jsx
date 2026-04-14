/**
 * Admin Inventory Management Page
 *
 * Displays and manages hybrid inventory controls for business admins.
 *
 * Inventory is separated into two categories:
 * 1. Ingredient-Controlled Beverage Availability
 *    - Core ingredients whose stock determines drink availability
 *    - Toggle switch marks ingredient in/out of stock
 *    - Example: Milk affects Latte, Cappuccino, and Mocha
 *
 * 2. Count-Based Inventory Items
 *    - Standard stock-tracked items managed by quantity
 *    - Example: bakery ingredients, supplies, prepared/countable goods
 *
 * This page fetches inventory from the admin inventory API and groups items
 * for easier operational management within the admin dashboard.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchInventory,
  updateInventoryItem,
  createInventoryItem,
} from "../../api/adminInventory";
import { handleApiError } from "../../api/handleApiError";
import { saveRecentView } from "../../utils/recentViews";

const UNIT_LABELS = {
  units: "Units",
  oz: "oz",
  lb: "lb",
  g: "g",
  ml: "ml",
  l: "L",
};


function isNegative(value) {
  if (value === "" || value === null || value === undefined) return false;
  return Number(value) < 0;
}

export default function AdminInventoryPage() {
  const navigate = useNavigate();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [savingItemId, setSavingItemId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [successItemId, setSuccessItemId] = useState(null);
  const [activatingItemId, setActivatingItemId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [ingredientSortKey, setIngredientSortKey] = useState("name");
  const [ingredientSortDir, setIngredientSortDir] = useState("asc");
  const [countSortKey, setCountSortKey] = useState("name");
  const [countSortDir, setCountSortDir] = useState("asc");

  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    stock_quantity: "",
    unit_of_measure: "units",
    reorder_level: "",
  });

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await fetchInventory();
        setInventoryItems(data);
        saveRecentView({
          section:  "inventory",
          label:    "Inventory",
          sublabel: `${data.length} item${data.length !== 1 ? "s" : ""}`,
          path:     "/admin/inventory",
          state:    null,
        });
      } catch (error) {
        if (error?.response?.status === 403) {
          handleApiError(error, navigate);
        } else {
          console.error("Failed to load inventory:", error);
          setErrorMessage(error.message || "Unable to load inventory");
        }
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, [navigate]);

  function flashSuccess(itemId) {
    setSuccessItemId(itemId);
    setTimeout(
      () => setSuccessItemId((prev) => (prev === itemId ? null : prev)),
      2500
    );
  }

  function flashCreateSuccess() {
    setCreateSuccess(true);
    setTimeout(() => setCreateSuccess(false), 2500);
  }

  function getEditValue(itemId, fieldName, fallback) {
    return editValues[itemId]?.[fieldName] ?? fallback ?? "";
  }

  function handleEditChange(itemId, fieldName, value) {
    setEditValues((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [fieldName]: value },
    }));
  }

  async function handleSave(item) {
    try {
      setSavingItemId(item.id);
      setSaveError("");

      const stockQuantity = getEditValue(
        item.id,
        "stock_quantity",
        item.stock_quantity
      );
      const reorderLevel = getEditValue(
        item.id,
        "reorder_level",
        item.reorder_level
      );

      const payload = {
        stock_quantity:
          stockQuantity === "" || stockQuantity === null
            ? null
            : Number(stockQuantity),
        reorder_level:
          reorderLevel === "" || reorderLevel === null
            ? null
            : Number(reorderLevel),
      };

      const updatedItem = await updateInventoryItem(item.id, payload);

      setInventoryItems((prev) =>
        prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
      );
      setEditValues((prev) => ({ ...prev, [item.id]: {} }));
      setActivatingItemId(null);
      flashSuccess(item.id);
    } catch (error) {
      if (error?.response?.status === 403) {
        handleApiError(error, navigate);
      } else {
        console.error("Failed to update inventory item:", error);
        const backendData = error?.response?.data;
        if (backendData?.stock_quantity?.length) {
          setSaveError(backendData.stock_quantity[0]);
        } else if (backendData?.reorder_level?.length) {
          setSaveError(backendData.reorder_level[0]);
        } else if (backendData?.non_field_errors?.length) {
          setSaveError(backendData.non_field_errors[0]);
        } else if (typeof backendData === "string" && backendData.trim()) {
          setSaveError(backendData);
        } else if (backendData?.message) {
          setSaveError(backendData.message);
        } else if (backendData?.detail) {
          setSaveError(backendData.detail);
        } else {
          setSaveError("Unable to save inventory item");
        }
      }
    } finally {
      setSavingItemId(null);
    }
  }

  async function handleToggleAvailability(item) {
    const isAvailable = Number(item.stock_quantity) > 0;

    if (isAvailable) {
      // Toggle OFF: immediately zero out stock and save
      try {
        setSavingItemId(item.id);
        setSaveError("");
        const updatedItem = await updateInventoryItem(item.id, {
          stock_quantity: 0,
          reorder_level: null,
        });
        setInventoryItems((prev) =>
          prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
        );
        setEditValues((prev) => ({ ...prev, [item.id]: {} }));
        flashSuccess(item.id);
      } catch (error) {
        if (error?.response?.status === 403) {
          handleApiError(error, navigate);
        } else {
          const backendData = error?.response?.data;
          if (backendData?.reorder_level?.length) {
            setSaveError(backendData.reorder_level[0]);
          } else if (backendData?.stock_quantity?.length) {
            setSaveError(backendData.stock_quantity[0]);
          } else if (backendData?.non_field_errors?.length) {
            setSaveError(backendData.non_field_errors[0]);
          } else if (backendData?.detail) {
            setSaveError(backendData.detail);
          } else {
            setSaveError("Unable to mark ingredient unavailable");
          }
        }
      } finally {
        setSavingItemId(null);
      }
    } else {
      // Toggle ON: prompt admin to enter a new stock quantity
      setActivatingItemId(item.id);
      setEditValues((prev) => ({
        ...prev,
        [item.id]: {
          ...prev[item.id],
          stock_quantity: prev[item.id]?.stock_quantity ?? "",
        },
      }));
    }
  }

  function handleCreateChange(fieldName, value) {
    setNewItem((prev) => ({ ...prev, [fieldName]: value }));
  }

  async function handleCreateItem() {
    try {
      setCreating(true);
      setCreateError("");

      const payload = {
        name: newItem.name,
        stock_quantity:
          newItem.stock_quantity === "" ? null : Number(newItem.stock_quantity),
        unit_of_measure: newItem.unit_of_measure,
        reorder_level:
          newItem.reorder_level === "" ? null : Number(newItem.reorder_level),
      };

      const createdItem = await createInventoryItem(payload);

      setInventoryItems((prev) =>
        [...prev, createdItem].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewItem({
        name: "",
        stock_quantity: "",
        unit_of_measure: "units",
        reorder_level: "",
      });
      flashCreateSuccess();
    } catch (error) {
      if (error?.response?.status === 403) {
        handleApiError(error, navigate);
      } else {
        console.error("Failed to create inventory item:", error);
        const backendData = error?.response?.data;
        if (backendData?.name?.length) {
          setCreateError(backendData.name[0]);
        } else if (backendData?.stock_quantity?.length) {
          setCreateError(backendData.stock_quantity[0]);
        } else if (backendData?.reorder_level?.length) {
          setCreateError(backendData.reorder_level[0]);
        } else if (backendData?.unit_of_measure?.length) {
          setCreateError(backendData.unit_of_measure[0]);
        } else if (backendData?.non_field_errors?.length) {
          setCreateError(backendData.non_field_errors[0]);
        } else if (backendData?.message) {
          setCreateError(backendData.message);
        } else if (backendData?.detail) {
          setCreateError(backendData.detail);
        } else {
          setCreateError("Unable to create inventory item");
        }
      }
    } finally {
      setCreating(false);
    }
  }

  function handleSort(key, currentKey, currentDir, setKey, setDir) {
    if (currentKey === key) {
      setDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setKey(key);
      setDir("asc");
    }
  }

  function getSortValue(item, key) {
    switch (key) {
      case "name":
        return item.name?.toLowerCase() ?? "";
      case "stock_quantity":
        return Number(item.stock_quantity) ?? 0;
      case "reorder_level":
        return item.reorder_level === null || item.reorder_level === undefined
          ? Infinity
          : Number(item.reorder_level);
      default:
        return "";
    }
  }

  function sortItems(items, key, dir) {
    return [...items].sort((a, b) => {
      const av = getSortValue(a, key);
      const bv = getSortValue(b, key);
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }

  function SortIndicator({ tableKey, col, tableDir }) {
    if (tableKey !== col)
      return (
        <span className="sort-indicator sort-indicator--inactive">⇅</span>
      );
    return (
      <span className="sort-indicator">{tableDir === "asc" ? "▲" : "▼"}</span>
    );
  }

  function handleCancelCreate() {
    setCreateError("");
    setShowCreate(false);
    setNewItem({
      name: "",
      stock_quantity: "",
      unit_of_measure: "units",
      reorder_level: "",
    });
  }

  const query = searchQuery.trim().toLowerCase();

  const ingredientItems = sortItems(
    inventoryItems
      .filter((item) => item.affected_products?.length > 0)
      .filter((item) => !query || item.name.toLowerCase().includes(query)),
    ingredientSortKey,
    ingredientSortDir
  );

  const countBasedItems = sortItems(
    inventoryItems
      .filter((item) => !item.affected_products?.length)
      .filter((item) => !query || item.name.toLowerCase().includes(query)),
    countSortKey,
    countSortDir
  );

  return (
    <div>
      {/* Submenu bar */}
      <div className="submenu-bar">
        <span className="submenu-label">Inventory Management</span>
        <div className="submenu-actions">
          <input
            className="submenu-search"
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="button" className="submenu-action submenu-action--clear rpt-clear-filters" onClick={() => setSearchQuery("")}>
            &times;&#x202F;CLEAR FILTERS
          </button>
          <button
            type="button"
            className="submenu-action"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "CANCEL" : "+ ADD ITEM"}
          </button>
        </div>
      </div>

      {/* Create item panel */}
      {showCreate && (
        <div className="inv-create-panel">
          <p className="submenu-label inv-create-panel__title">
            New Inventory Item
          </p>
          <div className="inv-create-grid">
            <div className="inv-field">
              <label>Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => handleCreateChange("name", e.target.value)}
                placeholder="Item name"
                className="inv-text-input"
              />
            </div>

            <div className="inv-field">
              <label>Stock Qty</label>
              <input
                type="number"
                step="0.01"
                value={newItem.stock_quantity}
                onChange={(e) =>
                  handleCreateChange("stock_quantity", e.target.value)
                }
                className={`inv-qty-input${isNegative(newItem.stock_quantity) ? " inv-input-error" : ""}`}
              />
            </div>

            <div className="inv-field">
              <label>Unit</label>
              <select
                value={newItem.unit_of_measure}
                onChange={(e) =>
                  handleCreateChange("unit_of_measure", e.target.value)
                }
                className="inv-unit-select"
              >
                <option value="units">Units</option>
                <option value="oz">Ounces</option>
                <option value="lb">Pounds</option>
                <option value="g">Grams</option>
                <option value="ml">Milliliters</option>
                <option value="l">Liters</option>
              </select>
            </div>

            <div className="inv-field">
              <label>Reorder Level</label>
              <input
                type="number"
                step="0.01"
                value={newItem.reorder_level}
                onChange={(e) =>
                  handleCreateChange("reorder_level", e.target.value)
                }
                className={`inv-qty-input${isNegative(newItem.reorder_level) ? " inv-input-error" : ""}`}
              />
            </div>

            <div className="inv-create-actions">
              <button
                type="button"
                onClick={handleCreateItem}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={handleCancelCreate}
                disabled={creating}
              >
                Cancel
              </button>
            </div>
          </div>

          {createError && <p className="inv-error">{createError}</p>}
          {createSuccess && (
            <p className="inv-save-success">Item created successfully.</p>
          )}
        </div>
      )}

      {/* Load / global error / save error */}
      {loading && <p>Loading inventory...</p>}
      {!loading && errorMessage && (
        <p className="inv-error">{errorMessage}</p>
      )}
      {!loading && saveError && saveError !== "{}" && (
        <p className="inv-error">{saveError}</p>
      )}

      {!loading && !errorMessage && (
        <>
          {/* ── Section 1: Ingredient-Controlled ── */}
          <h3 className="inv-section-header">
            Ingredient-Controlled Beverage Availability
          </h3>

          {ingredientItems.length === 0 ? (
            <p className="rpt-empty">No dependency-controlled ingredients found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th
                    className="admin-th inv-th-left"
                    onClick={() =>
                      handleSort(
                        "name",
                        ingredientSortKey,
                        ingredientSortDir,
                        setIngredientSortKey,
                        setIngredientSortDir
                      )
                    }
                  >
                    Ingredient{" "}
                    <SortIndicator
                      tableKey={ingredientSortKey}
                      col="name"
                      tableDir={ingredientSortDir}
                    />
                  </th>
                  <th className="admin-th admin-th--no-sort">Affects</th>
                  <th
                    className="admin-th"
                    onClick={() =>
                      handleSort(
                        "stock_quantity",
                        ingredientSortKey,
                        ingredientSortDir,
                        setIngredientSortKey,
                        setIngredientSortDir
                      )
                    }
                  >
                    Current Stock{" "}
                    <SortIndicator
                      tableKey={ingredientSortKey}
                      col="stock_quantity"
                      tableDir={ingredientSortDir}
                    />
                  </th>
                  <th className="admin-th admin-th--no-sort">Available</th>
                  <th className="admin-th admin-th--no-sort">Update Stock</th>
                  <th
                    className="admin-th"
                    onClick={() =>
                      handleSort(
                        "reorder_level",
                        ingredientSortKey,
                        ingredientSortDir,
                        setIngredientSortKey,
                        setIngredientSortDir
                      )
                    }
                  >
                    Reorder Level{" "}
                    <SortIndicator
                      tableKey={ingredientSortKey}
                      col="reorder_level"
                      tableDir={ingredientSortDir}
                    />
                  </th>
                  <th className="admin-th admin-th--no-sort">Save</th>
                </tr>
              </thead>
              <tbody>
                {ingredientItems.map((item) => {
                  const isAvailable = Number(item.stock_quantity) > 0;
                  const isActivating = activatingItemId === item.id;
                  const stockVal = getEditValue(
                    item.id,
                    "stock_quantity",
                    item.stock_quantity
                  );
                  const reorderVal = getEditValue(
                    item.id,
                    "reorder_level",
                    item.reorder_level
                  );

                  return (
                    <tr
                      key={item.id}
                      className={!isAvailable ? "inv-row--dim" : ""}
                    >
                      <td className="td-name inv-td-left">
                        {item.name}
                        {!isAvailable && (
                          <span className="inv-badge inv-badge--unavailable">
                            Unavailable
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="inv-affects">
                          {item.affected_products?.join(", ") || "—"}
                        </span>
                      </td>

                      <td>
                        {item.stock_quantity}{" "}
                        {UNIT_LABELS[item.unit_of_measure] ||
                          item.unit_of_measure}
                      </td>

                      <td>
                        <div className="inv-toggle-cell">
                          <label
                            className="inv-toggle"
                            aria-label={`Toggle ${item.name} availability`}
                          >
                            <input
                              type="checkbox"
                              checked={isAvailable}
                              disabled={savingItemId === item.id}
                              onChange={() => handleToggleAvailability(item)}
                            />
                            <span className="inv-toggle-slider" />
                          </label>
                          {isActivating && (
                            <span className="inv-activate-hint">
                              Enter qty &amp; save
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className={[
                            "inv-qty-input",
                            isNegative(stockVal) ? "inv-input-error" : "",
                            isActivating ? "inv-qty-input--activate" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          value={stockVal}
                          onChange={(e) =>
                            handleEditChange(
                              item.id,
                              "stock_quantity",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className={`inv-qty-input${isNegative(reorderVal) ? " inv-input-error" : ""}`}
                          value={reorderVal}
                          onChange={(e) =>
                            handleEditChange(
                              item.id,
                              "reorder_level",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        {successItemId === item.id ? (
                          <span className="inv-save-success">Saved!</span>
                        ) : (
                          <button
                            type="button"
                            className="table-action-btn"
                            onClick={() => handleSave(item)}
                            disabled={savingItemId === item.id}
                          >
                            {savingItemId === item.id ? "Saving..." : "Save"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ── Section 2: Count-Based ── */}
          <h3 className="inv-section-header">Count-Based Inventory</h3>

          {countBasedItems.length === 0 ? (
            <p>No count-based inventory items found.</p>
          ) : (
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th
                    className="admin-th inv-th-left"
                    onClick={() =>
                      handleSort(
                        "name",
                        countSortKey,
                        countSortDir,
                        setCountSortKey,
                        setCountSortDir
                      )
                    }
                  >
                    Item{" "}
                    <SortIndicator
                      tableKey={countSortKey}
                      col="name"
                      tableDir={countSortDir}
                    />
                  </th>
                  <th
                    className="admin-th"
                    onClick={() =>
                      handleSort(
                        "stock_quantity",
                        countSortKey,
                        countSortDir,
                        setCountSortKey,
                        setCountSortDir
                      )
                    }
                  >
                    Current Stock{" "}
                    <SortIndicator
                      tableKey={countSortKey}
                      col="stock_quantity"
                      tableDir={countSortDir}
                    />
                  </th>
                  <th className="admin-th admin-th--no-sort">Update Stock</th>
                  <th
                    className="admin-th"
                    onClick={() =>
                      handleSort(
                        "reorder_level",
                        countSortKey,
                        countSortDir,
                        setCountSortKey,
                        setCountSortDir
                      )
                    }
                  >
                    Reorder Level{" "}
                    <SortIndicator
                      tableKey={countSortKey}
                      col="reorder_level"
                      tableDir={countSortDir}
                    />
                  </th>
                  <th className="admin-th admin-th--no-sort">Save</th>
                </tr>
              </thead>
              <tbody>
                {countBasedItems.map((item) => {
                  const isOutOfStock = Number(item.stock_quantity) === 0;
                  const stockVal = getEditValue(
                    item.id,
                    "stock_quantity",
                    item.stock_quantity
                  );
                  const reorderVal = getEditValue(
                    item.id,
                    "reorder_level",
                    item.reorder_level
                  );

                  return (
                    <tr
                      key={item.id}
                      className={isOutOfStock ? "inv-row--dim" : ""}
                    >
                      <td className="td-name inv-td-left">
                        {item.name}
                        {isOutOfStock && (
                          <span className="inv-badge inv-badge--out">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      <td>
                        {item.stock_quantity}{" "}
                        {UNIT_LABELS[item.unit_of_measure] ||
                          item.unit_of_measure}
                      </td>

                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className={`inv-qty-input${isNegative(stockVal) ? " inv-input-error" : ""}`}
                          value={stockVal}
                          onChange={(e) =>
                            handleEditChange(
                              item.id,
                              "stock_quantity",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className={`inv-qty-input${isNegative(reorderVal) ? " inv-input-error" : ""}`}
                          value={reorderVal}
                          onChange={(e) =>
                            handleEditChange(
                              item.id,
                              "reorder_level",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        {successItemId === item.id ? (
                          <span className="inv-save-success">Saved!</span>
                        ) : (
                          <button
                            type="button"
                            className="table-action-btn"
                            onClick={() => handleSave(item)}
                            disabled={savingItemId === item.id}
                          >
                            {savingItemId === item.id ? "Saving..." : "Save"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
