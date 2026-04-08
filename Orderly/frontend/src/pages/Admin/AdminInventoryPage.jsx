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
        console.log("Backend validation response:", backendData);

        if (backendData?.stock_quantity?.length) {
          setSaveError(backendData.stock_quantity[0]);
        } else if (backendData?.reorder_level?.length) {
          setSaveError(backendData.reorder_level[0]);
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

      {!loading && !errorMessage && (
        <>
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