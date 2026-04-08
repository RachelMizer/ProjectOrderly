/**
 * Admin Inventory Management Page
 *
 * Displays and manages hybrid inventory controls for business admins.
 *
 * Inventory is separated into two categories:
 * 1. Ingredient-Controlled Beverage Availability
 *    - Core ingredients whose stock determines drink availability
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

const UNIT_LABELS = {
  units: "Units",
  oz: "Ounces",
  lb: "Pounds",
  g: "Grams",
  ml: "Milliliters",
  l: "Liters",
};

const DEPENDENCY_INGREDIENTS = [
  "Milk",
  "Espresso Beans",
  "Mocha Syrup",
  "Green Tea Leaves",
];

const AFFECTED_DRINKS = {
  Milk: ["Latte", "Cappuccino", "Mocha"],
  "Espresso Beans": ["Latte", "Cappuccino", "Mocha"],
  "Mocha Syrup": ["Mocha"],
  "Green Tea Leaves": ["Green Tea"],
};

export default function AdminInventoryPage() {
  const navigate = useNavigate();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [savingItemId, setSavingItemId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const [createError, setCreateError] = useState("");
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

  function getEditValue(itemId, fieldName, fallbackValue) {
    return editValues[itemId]?.[fieldName] ?? fallbackValue ?? "";
  }

  function handleEditChange(itemId, fieldName, value) {
    setEditValues((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [fieldName]: value,
      },
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
        prev.map((inventoryItem) =>
          inventoryItem.id === updatedItem.id ? updatedItem : inventoryItem
        )
      );

      setEditValues((prev) => ({
        ...prev,
        [item.id]: {},
      }));
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

  function handleCreateChange(fieldName, value) {
    setNewItem((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
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

  function handleCancelCreate() {
    setCreateError("");
    setNewItem({
      name: "",
      stock_quantity: "",
      unit_of_measure: "units",
      reorder_level: "",
    });
  }

  const ingredientItems = inventoryItems.filter((item) =>
    DEPENDENCY_INGREDIENTS.includes(item.name)
  );

  const countBasedItems = inventoryItems.filter(
    (item) => !DEPENDENCY_INGREDIENTS.includes(item.name)
  );

  return (
    <div>
      <h2>Admin Inventory</h2>

      {loading && <p>Loading inventory...</p>}

      {!loading && errorMessage && <p>{errorMessage}</p>}

      {!loading && saveError && saveError !== "{}" && (
        <p style={{ color: "red", fontWeight: "bold" }}>{saveError}</p>
      )}

      {!loading && createError && (
        <p style={{ color: "red", fontWeight: "bold" }}>{createError}</p>
      )}

      {!loading && !errorMessage && (
        <>
          <section style={{ marginBottom: "2rem" }}>
            <h3>Create Inventory Item</h3>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ marginRight: "1rem" }}>
                Name:{" "}
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(event) =>
                    handleCreateChange("name", event.target.value)
                  }
                />
              </label>

              <label style={{ marginRight: "1rem" }}>
                Stock Quantity:{" "}
                <input
                  type="number"
                  step="0.01"
                  value={newItem.stock_quantity}
                  onChange={(event) =>
                    handleCreateChange("stock_quantity", event.target.value)
                  }
                  style={{ width: "90px" }}
                />
              </label>

              <label style={{ marginRight: "1rem" }}>
                Unit of Measure:{" "}
                <select
                  value={newItem.unit_of_measure}
                  onChange={(event) =>
                    handleCreateChange("unit_of_measure", event.target.value)
                  }
                >
                  <option value="units">Units</option>
                  <option value="oz">Ounces</option>
                  <option value="lb">Pounds</option>
                  <option value="g">Grams</option>
                  <option value="ml">Milliliters</option>
                  <option value="l">Liters</option>
                </select>
              </label>

              <label style={{ marginRight: "1rem" }}>
                Reorder Level:{" "}
                <input
                  type="number"
                  step="0.01"
                  value={newItem.reorder_level}
                  onChange={(event) =>
                    handleCreateChange("reorder_level", event.target.value)
                  }
                  style={{ width: "90px" }}
                />
              </label>

              <button
                type="button"
                onClick={handleCreateItem}
                disabled={creating}
                style={{ marginRight: "0.5rem" }}
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
          </section>

          <section>
            <h3>Ingredient-Controlled Beverage Availability</h3>

            {ingredientItems.length === 0 && (
              <p>No dependency-controlled ingredients found.</p>
            )}

            {ingredientItems.map((item) => (
              <div
                key={item.id}
                style={{
                  marginBottom: "1rem",
                  opacity: Number(item.stock_quantity) === 0 ? 0.7 : 1,
                }}
              >
                <strong>
                  {item.name}
                  {Number(item.stock_quantity) === 0 && (
                    <span style={{ color: "red", marginLeft: "0.5rem" }}>
                      (UNAVAILABLE)
                    </span>
                  )}
                </strong>

                <div>
                  Stock: {item.stock_quantity}{" "}
                  {UNIT_LABELS[item.unit_of_measure] || item.unit_of_measure}
                </div>

                <div>Reorder Level: {item.reorder_level ?? "—"}</div>

                <div>
                  Affects: {AFFECTED_DRINKS[item.name]?.join(", ") || "—"}
                </div>

                <div style={{ marginTop: "0.5rem" }}>
                  <label style={{ marginRight: "1rem" }}>
                    Stock Quantity:{" "}
                    <input
                      type="number"
                      step="0.01"
                      value={getEditValue(
                        item.id,
                        "stock_quantity",
                        item.stock_quantity
                      )}
                      onChange={(event) =>
                        handleEditChange(
                          item.id,
                          "stock_quantity",
                          event.target.value
                        )
                      }
                      style={{ width: "90px" }}
                    />
                  </label>

                  <label style={{ marginRight: "1rem" }}>
                    Reorder Level:{" "}
                    <input
                      type="number"
                      step="0.01"
                      value={getEditValue(
                        item.id,
                        "reorder_level",
                        item.reorder_level
                      )}
                      onChange={(event) =>
                        handleEditChange(
                          item.id,
                          "reorder_level",
                          event.target.value
                        )
                      }
                      style={{ width: "90px" }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleSave(item)}
                    disabled={savingItemId === item.id}
                  >
                    {savingItemId === item.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </section>

          <hr />

          <section>
            <h3>Count-Based Inventory Items</h3>

            {countBasedItems.length === 0 && (
              <p>No count-based inventory items found.</p>
            )}

            {countBasedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  marginBottom: "1rem",
                  opacity: Number(item.stock_quantity) === 0 ? 0.7 : 1,
                }}
              >
                <strong>
                  {item.name}
                  {Number(item.stock_quantity) === 0 && (
                    <span style={{ color: "red", marginLeft: "0.5rem" }}>
                      (OUT OF STOCK)
                    </span>
                  )}
                </strong>

                <div>
                  Stock: {item.stock_quantity}{" "}
                  {UNIT_LABELS[item.unit_of_measure] || item.unit_of_measure}
                </div>

                <div>Reorder Level: {item.reorder_level ?? "—"}</div>

                <div style={{ marginTop: "0.5rem" }}>
                  <label style={{ marginRight: "1rem" }}>
                    Stock Quantity:{" "}
                    <input
                      type="number"
                      step="0.01"
                      value={getEditValue(
                        item.id,
                        "stock_quantity",
                        item.stock_quantity
                      )}
                      onChange={(event) =>
                        handleEditChange(
                          item.id,
                          "stock_quantity",
                          event.target.value
                        )
                      }
                      style={{ width: "90px" }}
                    />
                  </label>

                  <label style={{ marginRight: "1rem" }}>
                    Reorder Level:{" "}
                    <input
                      type="number"
                      step="0.01"
                      value={getEditValue(
                        item.id,
                        "reorder_level",
                        item.reorder_level
                      )}
                      onChange={(event) =>
                        handleEditChange(
                          item.id,
                          "reorder_level",
                          event.target.value
                        )
                      }
                      style={{ width: "90px" }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleSave(item)}
                    disabled={savingItemId === item.id}
                  >
                    {savingItemId === item.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}