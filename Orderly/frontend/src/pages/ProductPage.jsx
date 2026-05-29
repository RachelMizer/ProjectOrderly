import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getGuestCartEmail } from "../api/orders";
import API_HOST from '../config';

function flatMsg(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.map(flatMsg).join("; ");
  if (typeof val === "object") {
    return Object.entries(val)
      .map(([k, v]) => `${k}: ${flatMsg(v)}`)
      .join("; ");
  }
  return String(val);
}

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = localStorage.getItem("accessToken");

  const editItemId = searchParams.get('editItem');
  const editVariantId = Number(searchParams.get('variantId'));
  const editModifierIds = searchParams.get('modifiers')
    ? searchParams.get('modifiers').split(',').map(Number)
    : [];
  const isEditMode = Boolean(editItemId);


  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [modifierGroups, setModifierGroups] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingModifiers, setLoadingModifiers] = useState(false);
  const [cartError, setCartError] = useState(null);

  // ----------------------------------------------------
  // Load product + variants
  // ----------------------------------------------------
  useEffect(() => {
    async function loadProduct() {
      try {
        const prodRes = await fetch(`${API_HOST}/api/v1/products`);
        const prodData = await prodRes.json();

        const found = prodData.results.find(p => p.id === Number(id));
        if (!found) {
          setLoading(false);
          return;
        }

        setProduct(found);

        const variantRes = await fetch(
          `${API_HOST}/api/v1/products/${id}/variants`
        );
        const variantData = await variantRes.json();

        const v = variantData.results || [];
        setVariants(v);

        if (v.length > 0) {
          const preSelected = editVariantId
            ? v.find(variant => variant.id === editVariantId) || v[0]
            : v[0];
          setSelectedVariant(preSelected);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading product:", err);
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  // ----------------------------------------------------
  // Load modifiers when selectedVariant changes
  // ----------------------------------------------------
  useEffect(() => {
    if (!selectedVariant) return;

    async function loadModifiers() {
      setLoadingModifiers(true);

      try {
        const res = await fetch(
          `${API_HOST}/api/v1/products/${id}/variants/${selectedVariant.id}/modifiers`
        );
        const data = await res.json();

        setModifierGroups(data.groups || []);

        if (isEditMode && editModifierIds.length > 0) {
          const preSelected = {};
          for (const group of data.groups || []) {
            const matchingIds = group.options
              .map(o => o.id)
              .filter(optId => editModifierIds.includes(optId));
            if (matchingIds.length > 0) {
              preSelected[group.id] = matchingIds;
            }
          }
          setSelectedOptions(preSelected);
        } else {
          setSelectedOptions({});
        }
      } catch (err) {
        console.error("Error loading modifiers:", err);
      }

      setLoadingModifiers(false);
    }

    loadModifiers();
  }, [selectedVariant, id]);

  // ----------------------------------------------------
  // Handle selecting a modifier option
  // ----------------------------------------------------
  function handleOptionSelect(group, optionId) {
    setSelectedOptions(prev => {
      const current = prev[group.id] || [];

      if (group.maxSelections === 1) {
        return { ...prev, [group.id]: [optionId] };
      }

      const isSelected = current.includes(optionId);

      if (isSelected) {
        return {
          ...prev,
          [group.id]: current.filter(id => id !== optionId)
        };
      }

      if (current.length >= group.maxSelections) {
        return prev;
      }

      return {
        ...prev,
        [group.id]: [...current, optionId]
      };
    });
  }

  // ----------------------------------------------------
  // Price calculation
  // ----------------------------------------------------
  const basePrice = selectedVariant ? Number(selectedVariant.unitPrice) : 0;

  const selectedIds = Object.values(selectedOptions).flat();

  const modifiersTotal = modifierGroups
    .flatMap(g => g.options)
    .filter(o => selectedIds.includes(o.id))
    .reduce((sum, option) => sum + parseFloat(option.priceAdjustment ?? 0), 0);

  const totalPrice = basePrice + modifiersTotal;

  // ----------------------------------------------------
  // ADD TO CART LOGIC
  // ----------------------------------------------------
  const guestEmail = accessToken ? null : getGuestCartEmail();

  async function getDraftOrder() {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_HOST}/api/v1/orders/draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(guestEmail ? { guestEmail } : {})
    });
    if (res.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
      throw new Error("Session expired. Please log in again.");
    }
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      throw new Error(data?.message || `Could not reach cart (${res.status})`);
    }
    return data;
  }

  async function addItemToOrder(variantId, quantity) {
    const res = await fetch(`${API_HOST}/api/v1/orders/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
      },
      body: JSON.stringify({
        variantId,
        quantity,
        ...(guestEmail && { guestEmail })
      })
    });
    if (res.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
      throw new Error("Session expired. Please log in again.");
    }
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      throw new Error(flatMsg(data?.message) || `Failed to add item to cart (${res.status})`);
    }
    return data;
  }

  async function addModifiers(orderItemId) {
    const allSelected = Object.values(selectedOptions).flat();

    for (const modifierId of allSelected) {
      const res = await fetch(
        `${API_HOST}/api/v1/orders/items/${orderItemId}/modifiers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` })
          },
          body: JSON.stringify({
            modifierId,
            quantity: 1,
            ...(guestEmail && { guestEmail })
          })
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = flatMsg(errData?.message) || flatMsg(errData?.error) || `Failed to add modifier (${res.status})`;
        throw new Error(msg);
      }
    }
  }

  async function handleAddToCart() {
    setCartError(null);
    try {
      if (isEditMode) {
        const patchRes = await fetch(`${API_HOST}/api/v1/orders/items/${editItemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` })
          },
          body: JSON.stringify({
            quantity: 0,
            ...(guestEmail && { guestEmail })
          })
        });
        if (!patchRes.ok) {
          const d = await patchRes.json().catch(() => ({}));
          throw new Error(flatMsg(d?.message) || `Could not remove old item (${patchRes.status})`);
        }
      }

      await getDraftOrder();
      const item = await addItemToOrder(selectedVariant.id, 1);

      if (selectedIds.length > 0) {
        await addModifiers(item.orderItemId);
      }

      window.dispatchEvent(new Event("cart-updated"));
      navigate("/cart");
    } catch (err) {
      console.error("Error adding to cart:", err);
      setCartError(err.message || "Something went wrong. Please try again.");
    }
  }

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------
  if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;
  if (!product) return <div style={{ padding: "2rem" }}>Product not found.</div>;

  return (
    <div className="ind-product-pg">
      <h1>{product.name}</h1>

      {product.description && <p className="prod-desc2">{product.description}</p>}

      {product.imageUrl
        ? <img src={product.imageUrl} alt={product.name} className="img" />
        : <div className="img">Placeholder</div>
      }

      {/* ================================
          VARIANT SECTION
         ================================ */}
      <div className="variant-wrapper">
        {variants.length > 1 && (
          <div className="variant-section">
            <h3>Choose an option</h3>

            <div className="variant-options">
              {variants.map(v => (
                <div key={v.id} className="variant-option">
                  <label>
                    <input
                      type="radio"
                      name="variant"
                      checked={selectedVariant?.id === v.id}
                      onChange={() => setSelectedVariant(v)}
                    />
                    {v.name} — ${Number(v.unitPrice).toFixed(2)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================================
          MODIFIER SECTION
         ================================ */}
      <div className="prod-opts">
        {loadingModifiers && <p>Loading options…</p>}

        {!loadingModifiers && modifierGroups.length > 0 && (
          <div className="modifier-section">
            {modifierGroups.map(group => (
              <div key={group.id} className="modifier-group">
                <h4>
                  {group.name}
                  {group.required && " *"}
                </h4>

                <p>
                  {group.minSelections === group.maxSelections
                    ? `Choose ${group.minSelections}`
                    : `Choose ${group.minSelections}–${group.maxSelections}`}
                </p>

                <div className="modifier-options">
                  {group.options.map(option => {
                    const isChecked =
                      selectedOptions[group.id]?.includes(option.id) || false;

                    const isMaxed =
                      group.maxSelections > 1 &&
                      (selectedOptions[group.id]?.length || 0) >=
                        group.maxSelections &&
                      !isChecked;

                    return (
                      <div key={option.id} className="modifier-option">
                        <label>
                          <input
                            type={
                              group.maxSelections === 1 ? "radio" : "checkbox"
                            }
                            name={`group-${group.id}`}
                            checked={isChecked}
                            disabled={isMaxed}
                            onChange={() =>
                              handleOptionSelect(group, option.id)
                            }
                          />
                          {option.name}
                          {parseFloat(option.priceAdjustment) > 0 &&
                            ` (+$${parseFloat(option.priceAdjustment).toFixed(
                              2
                            )})`}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================================
          PRICE + ADD TO CART
         ================================ */}
      {!loadingModifiers && variants.length <= 1 && modifierGroups.length === 0 && (
        <p className="prod-no-addons">This product doesn't have any add-ons or modifications.</p>
      )}

      {cartError && (
        <p style={{ color: "#c0392b", margin: "0.5rem 0" }}>{cartError}</p>
      )}

      <p className="price-label">Total: <span className="price">${totalPrice.toFixed(2)}</span></p>

      {selectedVariant && selectedVariant.stockQuantity !== null && Number(selectedVariant.stockQuantity) === 0 ? (
        <p className="OOS">Out of Stock</p>
      ) : (
        <button className="cust-button" onClick={handleAddToCart}>
          {isEditMode ? "Update Item" : "Add to Cart"}
        </button>
      )}
    </div>
  );
};

export default ProductPage;
