/**
 * AdminProductsPage
 *
 * Business-only admin interface for managing product catalog data.
 *
 * Responsibilities:
 * - Display all products available in the admin catalog
 * - Create, edit, and delete products
 * - Display variants associated with each product
 * - Create, edit, and delete variants for a selected product
 * - Enforce frontend alignment with backend admin product/variant endpoints
 * - Handle validation, RBAC/authorization errors, and loading states
 *
 * Backend Endpoints Used:
 * - GET/POST    /api/v1/admin/products
 * - PATCH/DELETE /api/v1/admin/products/{productId}
 * - GET/POST    /api/v1/admin/products/{productId}/variants
 * - PATCH/DELETE /api/v1/admin/products/{productId}/variants/{variantId}
 *
 * Access:
 * - Protected by ProtectedAdminRoute
 * - Intended for BUSINESS role users only
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../api/handleApiError";
import { getAuthHeaders } from "../../api/auth";

const API_BASE = "http://127.0.0.1:8000/api/v1";

function buildValidationMessage(data, fallback = "Validation error") {
  if (!data || typeof data !== "object") return fallback;
  if (data.message) return data.message;

  const messages = Object.entries(data).flatMap(([field, value]) => {
    if (Array.isArray(value)) {
      return value.map((msg) => `${field}: ${msg}`);
    }
    return [`${field}: ${String(value)}`];
  });

  return messages.length ? messages.join(" | ") : fallback;
}

export default function AdminProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [variantsByProduct, setVariantsByProduct] = useState({});
  const [expandedProductId, setExpandedProductId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [variantLoading, setVariantLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [creating, setCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [savingVariant, setSavingVariant] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantProductId, setVariantProductId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    supplier: "",
    description: "",
  });

  const [variantFormData, setVariantFormData] = useState({
    name: "",
    sku: "",
    unit_price: "",
    stock_quantity: "",
    reorder_level: "",
  });

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [productsResponse, categoriesResponse, suppliersResponse] =
        await Promise.all([
          fetch(`${API_BASE}/admin/products`, {
            headers: {
              ...getAuthHeaders(),
            },
          }),
          fetch(`${API_BASE}/categories`, {
            headers: {
              ...getAuthHeaders(),
            },
          }),
          fetch(`${API_BASE}/admin/suppliers`, {
            headers: {
              ...getAuthHeaders(),
            },
          }),
        ]);

      if (
        productsResponse.status === 401 ||
        productsResponse.status === 403 ||
        categoriesResponse.status === 401 ||
        categoriesResponse.status === 403 ||
        suppliersResponse.status === 401 ||
        suppliersResponse.status === 403
      ) {
        throw { status: productsResponse.status || 403 };
      }

      if (!productsResponse.ok) {
        throw new Error("Failed to load products");
      }

      if (!categoriesResponse.ok) {
        throw new Error("Failed to load categories");
      }

      if (!suppliersResponse.ok) {
        throw new Error("Failed to load suppliers");
      }

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();
      const suppliersData = await suppliersResponse.json();

      setProducts(Array.isArray(productsData.results) ? productsData.results : []);
      setCategories(Array.isArray(categoriesData.results) ? categoriesData.results : []);
      setSuppliers(Array.isArray(suppliersData.results) ? suppliersData.results : []);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleApiError(error, navigate);
      } else {
        console.error("Failed to load admin product page data:", error);
        setErrorMessage(error.message || "Unable to load page data");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleVariantChange(e) {
    const { name, value } = e.target;
    setVariantFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      supplier: "",
      description: "",
    });
  }

  function resetVariantForm() {
    setEditingVariant(null);
    setVariantProductId(null);
    setVariantFormData({
      name: "",
      sku: "",
      unit_price: "",
      stock_quantity: "",
      reorder_level: "",
    });
  }

  function startEdit(product) {
    setErrorMessage("");
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      category: String(product.category?.id || product.category || ""),
      supplier: String(product.supplier?.id || product.supplier || ""),
      description: product.description || "",
    });
  }

  function startCreateVariant(productId) {
    setErrorMessage("");
    setExpandedProductId(productId);
    setVariantProductId(productId);
    setEditingVariant(null);
    setVariantFormData({
      name: "",
      sku: "",
      unit_price: "",
      stock_quantity: "",
      reorder_level: "",
    });
  }

  function startEditVariant(productId, variant) {
    setErrorMessage("");
    setExpandedProductId(productId);
    setVariantProductId(productId);
    setEditingVariant(variant);
    setVariantFormData({
      name: variant.name || "",
      sku: variant.sku || "",
      unit_price: variant.unit_price || "",
      stock_quantity:
        variant.stock_quantity === null || variant.stock_quantity === undefined
          ? ""
          : String(variant.stock_quantity),
      reorder_level:
        variant.reorder_level === null || variant.reorder_level === undefined
          ? ""
          : String(variant.reorder_level),
    });
  }

  function getCategoryName(product) {
    if (product.category?.name) {
      return product.category.name;
    }

    const categoryId = product.category?.id || product.category;
    const match = categories.find((category) => category.id === categoryId);

    return match?.name || "—";
  }

  function getSupplierName(product) {
    if (product.supplier?.name) {
      return product.supplier.name;
    }

    const supplierId = product.supplier?.id || product.supplier;
    const match = suppliers.find((supplier) => supplier.id === supplierId);

    return match?.name || "—";
  }

  async function loadVariants(productId) {
    try {
      setVariantLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE}/admin/products/${productId}/variants`,
        {
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw { status: response.status };
      }

      if (!response.ok) {
        throw new Error("Failed to load variants");
      }

      const data = await response.json();

      setVariantsByProduct((prev) => ({
        ...prev,
        [productId]: Array.isArray(data.results) ? data.results : [],
      }));
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleApiError(error, navigate);
      } else {
        setErrorMessage(error.message || "Unable to load variants");
      }
    } finally {
      setVariantLoading(false);
    }
  }

  async function toggleVariants(productId) {
    if (expandedProductId === productId) {
      setExpandedProductId(null);
      resetVariantForm();
      return;
    }

    setExpandedProductId(productId);
    setVariantProductId(productId);
    setEditingProduct(null);

    setVariantFormData({
      name: "",
      sku: "",
      unit_price: "",
      stock_quantity: "",
      reorder_level: "",
    });

    if (!variantsByProduct[productId]) {
      await loadVariants(productId);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCreating(true);
    setErrorMessage("");

    const payload = {
      name: formData.name,
      category: Number(formData.category),
      supplier: Number(formData.supplier),
      description: formData.description,
      has_variants: true,
      has_modifiers: false,
    };

    try {
      const url = editingProduct
        ? `${API_BASE}/admin/products/${editingProduct.id}`
        : `${API_BASE}/admin/products`;

      const method = editingProduct ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.status === 401 || response.status === 403) {
        throw { status: response.status };
      }

      if (response.status === 400) {
        throw { status: 400, data };
      }

      if (!response.ok) {
        throw new Error(
          editingProduct ? "Failed to update product" : "Failed to create product"
        );
      }

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProduct.id ? data : product
          )
        );
      } else {
        setProducts((prev) => [data, ...prev]);
      }

      resetForm();
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleApiError(error, navigate);
      } else if (error.status === 400) {
        setErrorMessage(buildValidationMessage(error.data));
      } else {
        setErrorMessage(error.message || "Failed to save product");
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(productId) {
    try {
      setErrorMessage("");

      const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw { status: response.status };
      }

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));

      setVariantsByProduct((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });

      if (expandedProductId === productId) {
        setExpandedProductId(null);
      }

      if (editingProduct?.id === productId) {
        resetForm();
      }

      if (variantProductId === productId) {
        resetVariantForm();
      }
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleApiError(error, navigate);
      } else {
        setErrorMessage(error.message || "Failed to delete product");
      }
    }
  }

  async function handleVariantSubmit(e) {
    e.preventDefault();

    if (!variantProductId) {
      setErrorMessage("Choose a product before saving a variant");
      return;
    }

    setSavingVariant(true);
    setErrorMessage("");

    const payload = {
      name: variantFormData.name,
      sku: variantFormData.sku,
      unit_price: variantFormData.unit_price,
      stock_quantity:
        variantFormData.stock_quantity === ""
          ? null
          : Number(variantFormData.stock_quantity),
      reorder_level:
        variantFormData.reorder_level === ""
          ? null
          : Number(variantFormData.reorder_level),
    };

    try {
      const url = editingVariant
        ? `${API_BASE}/admin/products/${variantProductId}/variants/${editingVariant.id}`
        : `${API_BASE}/admin/products/${variantProductId}/variants`;

      const method = editingVariant ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.status === 401 || response.status === 403) {
        throw { status: response.status };
      }

      if (response.status === 400) {
        throw { status: 400, data };
      }

      if (!response.ok) {
        throw new Error(
          editingVariant ? "Failed to update variant" : "Failed to create variant"
        );
      }

      setVariantsByProduct((prev) => {
        const currentVariants = prev[variantProductId] || [];

        if (editingVariant) {
          return {
            ...prev,
            [variantProductId]: currentVariants.map((variant) =>
              variant.id === editingVariant.id ? data : variant
            ),
          };
        }

        return {
          ...prev,
          [variantProductId]: [data, ...currentVariants],
        };
      });

      resetVariantForm();
      setExpandedProductId(variantProductId);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleApiError(error, navigate);
      } else if (error.status === 400) {
        setErrorMessage(buildValidationMessage(error.data));
      } else {
        setErrorMessage(error.message || "Failed to save variant");
      }
    } finally {
      setSavingVariant(false);
    }
  }

  async function handleVariantDelete(productId, variantId) {
    try {
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE}/admin/products/${productId}/variants/${variantId}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw { status: response.status };
      }

      if (!response.ok) {
        throw new Error("Failed to delete variant");
      }

      setVariantsByProduct((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).filter(
          (variant) => variant.id !== variantId
        ),
      }));

      if (editingVariant?.id === variantId) {
        resetVariantForm();
      }
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleApiError(error, navigate);
      } else {
        setErrorMessage(error.message || "Failed to delete variant");
      }
    }
  }

  return (
    <div>
      <h2>Admin Products</h2>

      <h3>{editingProduct ? "Edit Product" : "Create Product"}</h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          name="name"
          placeholder="Name"
          required
          value={formData.name}
          onChange={handleChange}
        />

        <select
          name="category"
          required
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          name="supplier"
          required
          value={formData.supplier}
          onChange={handleChange}
        >
          <option value="">Select Supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>

        <input
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <button type="submit" disabled={creating}>
          {creating
            ? editingProduct
              ? "Updating..."
              : "Creating..."
            : editingProduct
            ? "Update Product"
            : "Create Product"}
        </button>

        {editingProduct && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <hr />

      {loading && <p>Loading products...</p>}
      {!loading && errorMessage && <p>{errorMessage}</p>}
      {!loading && !errorMessage && products.length === 0 && (
        <p>No products found.</p>
      )}

      {!loading && !errorMessage && products.length > 0 && (
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingRight: "1rem" }}>ID</th>
              <th style={{ textAlign: "left", paddingRight: "1rem" }}>Name</th>
              <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                Category
              </th>
              <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                Supplier
              </th>
              <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                Description
              </th>
              <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <>
                <tr key={product.id}>
                  <td style={{ paddingRight: "1rem" }}>{product.id}</td>
                  <td style={{ paddingRight: "1rem" }}>{product.name}</td>
                  <td style={{ paddingRight: "1rem" }}>
                    {getCategoryName(product)}
                  </td>
                  <td style={{ paddingRight: "1rem" }}>
                    {getSupplierName(product)}
                  </td>
                  <td style={{ paddingRight: "1rem" }}>
                    {product.description || "—"}
                  </td>
                  <td style={{ paddingRight: "1rem" }}>
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleVariants(product.id)}
                      style={{ marginRight: "0.5rem" }}
                    >
                      {expandedProductId === product.id
                        ? "Hide Options"
                        : "Manage Options"}
                    </button>
                    
                  </td>
                </tr>

                {expandedProductId === product.id && (
                  <tr key={`variants-${product.id}`}>
                    <td colSpan="6" style={{ padding: "1rem", background: "#f8f8f8" }}>
                      <h4>
                        {editingVariant
                          ? `Edit Option for ${product.name}`
                          : `Options for ${product.name}`}
                      </h4>

                      <form onSubmit={handleVariantSubmit} style={{ marginBottom: "1rem" }}>
                        <input
                          name="name"
                          placeholder="Variant name"
                          required
                          value={variantFormData.name}
                          onChange={handleVariantChange}
                        />

                        <input
                          name="sku"
                          placeholder="SKU"
                          required
                          value={variantFormData.sku}
                          onChange={handleVariantChange}
                        />

                        <input
                          name="unit_price"
                          placeholder="Unit price"
                          required
                          value={variantFormData.unit_price}
                          onChange={handleVariantChange}
                        />

                        <input
                          name="stock_quantity"
                          placeholder="Stock quantity"
                          value={variantFormData.stock_quantity}
                          onChange={handleVariantChange}
                        />

                        <input
                          name="reorder_level"
                          placeholder="Reorder level"
                          value={variantFormData.reorder_level}
                          onChange={handleVariantChange}
                        />

                        <button type="submit" disabled={savingVariant}>
                          {savingVariant
                            ? editingVariant
                              ? "Updating Variant..."
                              : "Creating Variant..."
                            : editingVariant
                            ? "Save Option"
                            : "Add Option"}
                        </button>

                        {(editingVariant || variantProductId === product.id) && (
                          <button type="button" onClick={resetVariantForm}>
                            Cancel
                          </button>
                        )}
                      </form>

                      {variantLoading && <p>Loading variants...</p>}

                      {!variantLoading &&
                        (variantsByProduct[product.id] || []).length === 0 && (
                          <p>No variants found for this product.</p>
                        )}

                      {!variantLoading &&
                        (variantsByProduct[product.id] || []).length > 0 && (
                          <table>
                            <thead>
                              <tr>
                                <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                                  ID
                                </th>
                                <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                                  Name
                                </th>
                                <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                                  SKU
                                </th>
                                <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                                  Unit Price
                                </th>
                                <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                                  Stock
                                </th>
                                <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                                  Reorder
                                </th>
                                <th style={{ textAlign: "left", paddingRight: "1rem" }}>
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(variantsByProduct[product.id] || []).map((variant) => (
                                <tr key={variant.id}>
                                  <td style={{ paddingRight: "1rem" }}>{variant.id}</td>
                                  <td style={{ paddingRight: "1rem" }}>{variant.name}</td>
                                  <td style={{ paddingRight: "1rem" }}>{variant.sku}</td>
                                  <td style={{ paddingRight: "1rem" }}>
                                    {variant.unit_price}
                                  </td>
                                  <td style={{ paddingRight: "1rem" }}>
                                    {variant.stock_quantity ?? "—"}
                                  </td>
                                  <td style={{ paddingRight: "1rem" }}>
                                    {variant.reorder_level ?? "—"}
                                  </td>
                                  <td style={{ paddingRight: "1rem" }}>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        startEditVariant(product.id, variant)
                                      }
                                      style={{ marginRight: "0.5rem" }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleVariantDelete(product.id, variant.id)
                                      }
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}