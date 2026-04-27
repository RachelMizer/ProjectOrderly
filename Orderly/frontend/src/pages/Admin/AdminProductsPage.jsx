import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveRecentView } from "../../utils/recentViews";
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

  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  function stampUpdated() {
    setLastUpdated(new Date());
  }

  const [savingVariant, setSavingVariant] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantProductId, setVariantProductId] = useState(null);

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

      const productList = Array.isArray(productsData.results) ? productsData.results : [];
      setProducts(productList);
      setCategories(Array.isArray(categoriesData.results) ? categoriesData.results : []);
      setSuppliers(Array.isArray(suppliersData.results) ? suppliersData.results : []);
      saveRecentView({
        section:  "catalog",
        label:    "Product Catalog",
        sublabel: `${productList.length} product${productList.length !== 1 ? "s" : ""}`,
        path:     "/admin/catalog",
        state:    null,
      });
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

  function handleVariantChange(e) {
    const { name, value } = e.target;
    setVariantFormData((prev) => ({ ...prev, [name]: value }));
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

  async function handleDelete(productId) {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
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
      stampUpdated();

      setVariantsByProduct((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });

      if (expandedProductId === productId) {
        setExpandedProductId(null);
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

      stampUpdated();
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
    if (!window.confirm("Are you sure you want to delete this variant? This action cannot be undone.")) return;
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
      stampUpdated();

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

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function getSortValue(product, key) {
    switch (key) {
      case "id":        return product.id;
      case "name":      return product.name?.toLowerCase() ?? "";
      case "category":  return getCategoryName(product).toLowerCase();
      case "supplier":  return getSupplierName(product).toLowerCase();
      case "description": return (product.description ?? "").toLowerCase();
      default:          return "";
    }
  }

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          getCategoryName(p).toLowerCase().includes(q) ||
          getSupplierName(p).toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
        );
      })
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const av = getSortValue(a, sortKey);
    const bv = getSortValue(b, sortKey);
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function SortIndicator({ col }) {
    if (sortKey !== col) return <span className="sort-indicator sort-indicator--inactive">⇅</span>;
    return <span className="sort-indicator">{sortDir === "asc" ? "▲" : "▼"}</span>;
  }

  const printTimestamp = new Date().toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });

  return (
    <div>
      <div className="print-only print-page-header">
        <h2 className="print-page-title">Product Catalog</h2>
        <p className="print-page-date">As of {printTimestamp}</p>
      </div>
      <div className="submenu-bar">
        <span className="submenu-label"><span style={{marginRight:"-1px"}}>🛍️</span>Product Catalog</span>
        <div className="submenu-actions">
          <div className="submenu-filter-group">
            <input
              className="submenu-search"
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="button" className="submenu-action submenu-action--clear" onClick={() => setSearchQuery("")}>
              &times;&#x202F;CLEAR FILTERS
            </button>
          </div>
          <span className="submenu-divider" />
          <button type="button" className="submenu-action" onClick={() => navigate("/admin/catalog/new")}>
            + CREATE NEW PRODUCT
          </button>
          <button type="button" className="submenu-action" onClick={() => navigate("/admin/categories")}>
            + ADD CATEGORY
          </button>
          <button type="button" className="submenu-action" onClick={() => navigate("/admin/export")}>
            <span style={{marginRight:"-1px"}}>📤</span>EXPORT
          </button>
          <button type="button" className="submenu-action" onClick={() => window.print()}>
            <span style={{marginRight:"-1px"}}>🖨️</span>PRINT
          </button>
        </div>
      </div>

      {lastUpdated && (
        <p className="catalog-last-updated">
          Last updated: {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {loading && <p>Loading products...</p>}
      {!loading && errorMessage && <p>{errorMessage}</p>}
      {!loading && !errorMessage && products.length === 0 && (
        <p>No products found.</p>
      )}

      {!loading && !errorMessage && products.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-th" onClick={() => handleSort("id")}>
                ID <SortIndicator col="id" />
              </th>
              <th className="admin-th" onClick={() => handleSort("name")}>
                Name <SortIndicator col="name" />
              </th>
              <th className="admin-th" onClick={() => handleSort("category")}>
                Category <SortIndicator col="category" />
              </th>
              <th className="admin-th" onClick={() => handleSort("supplier")} style={{minWidth: "140px"}}>
                Supplier <SortIndicator col="supplier" />
              </th>
              <th className="admin-th" onClick={() => handleSort("description")}>
                Description <SortIndicator col="description" />
              </th>
              <th className="admin-th admin-th--no-sort no-print">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedProducts.map((product) => (
              <>
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td className="td-name">{product.name}</td>
                  <td>{getCategoryName(product)}</td>
                  <td>{getSupplierName(product)}</td>
                  <td className="td-description">{product.description || "—"}</td>
                  <td className="td-actions">
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => navigate(`/admin/catalog/edit/${product.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => toggleVariants(product.id)}
                    >
                      {expandedProductId === product.id ? "Hide Options" : "Edit Options"}
                    </button>
                  </td>
                </tr>

                {expandedProductId === product.id && (
                  <tr key={`variants-${product.id}`}>
                    <td colSpan="6" className="variants-row-cell">
                      <h4>
                        {editingVariant
                          ? `Edit Option for ${product.name}`
                          : `Options for ${product.name}`}
                      </h4>

                      <form className="variant-form" onSubmit={handleVariantSubmit}>
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
                        <button type="submit" className="variant-action-btn" disabled={savingVariant}>
                          {savingVariant
                            ? editingVariant ? "Updating..." : "Creating..."
                            : editingVariant ? "Save Option" : "Add Option"}
                        </button>
                        {(editingVariant || variantProductId === product.id) && (
                          <button type="button" className="variant-action-btn" onClick={resetVariantForm}>
                            Cancel
                          </button>
                        )}
                      </form>

                      {variantLoading && <p>Loading variants...</p>}

                      {!variantLoading && (variantsByProduct[product.id] || []).length === 0 && (
                        <p>No variants found for this product.</p>
                      )}

                      {!variantLoading && (variantsByProduct[product.id] || []).length > 0 && (
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th className="admin-th admin-th--no-sort">ID</th>
                              <th className="admin-th admin-th--no-sort">Name</th>
                              <th className="admin-th admin-th--no-sort">SKU</th>
                              <th className="admin-th admin-th--no-sort">Unit Price</th>
                              <th className="admin-th admin-th--no-sort">Stock</th>
                              <th className="admin-th admin-th--no-sort">Reorder</th>
                              <th className="admin-th admin-th--no-sort no-print">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(variantsByProduct[product.id] || []).map((variant) => (
                              <tr key={variant.id}>
                                <td>{variant.id}</td>
                                <td>{variant.name}</td>
                                <td>{variant.sku ?? "—"}</td>
                                <td>{variant.unit_price ?? "—"}</td>
                                <td>{variant.stock_quantity ?? "—"}</td>
                                <td>{variant.reorder_level ?? "—"}</td>
                                <td className="td-actions">
                                  <button
                                    type="button"
                                    className="variant-action-btn"
                                    onClick={() => startEditVariant(product.id, variant)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="variant-action-btn"
                                    onClick={() => handleVariantDelete(product.id, variant.id)}
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