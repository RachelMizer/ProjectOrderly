import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { handleApiError } from "../../api/handleApiError";
import { getAuthHeaders } from "../../api/auth";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/v1`;

function buildValidationMessage(data, fallback = "Validation error") {
  if (!data || typeof data !== "object") return fallback;
  if (data.message) return data.message;

  const messages = Object.entries(data).flatMap(([field, value]) => {
    if (Array.isArray(value)) return value.map((msg) => `${field}: ${msg}`);
    return [`${field}: ${String(value)}`];
  });

  return messages.length ? messages.join(" | ") : fallback;
}

export default function AdminProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const imageInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    supplier: "",
    description: "",
    has_variants: true,
    has_modifiers: false,
    image: null,
  });

  const [variantData, setVariantData] = useState({
    name: "",
    sku: "",
    unit_price: "",
    stock_quantity: "",
  });

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    try {
      setLoading(true);
      setErrorMessage("");

      // Fetch categories
      try {
        const categoriesRes = await fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() });
        console.log("Categories status:", categoriesRes.status);
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          console.log("Categories data:", categoriesData);
          setCategories(Array.isArray(categoriesData.results) ? categoriesData.results : []);
        }
      } catch (err) {
        console.error("Categories fetch error:", err);
      }

      // Fetch suppliers
      try {
        const suppliersRes = await fetch(`${API_BASE}/admin/suppliers`, { headers: getAuthHeaders() });
        console.log("Suppliers status:", suppliersRes.status);
        if (suppliersRes.ok) {
          const suppliersData = await suppliersRes.json();
          console.log("Suppliers data:", suppliersData);
          setSuppliers(Array.isArray(suppliersData.results) ? suppliersData.results : []);
        }
      } catch (err) {
        console.error("Suppliers fetch error:", err);
      }

      if (isEditing) {
        const productRes = await fetch(`${API_BASE}/admin/products/${productId}`, { headers: getAuthHeaders() });
        if (productRes.status === 401 || productRes.status === 403) throw { status: productRes.status };
        if (!productRes.ok) throw new Error("Failed to load product");
        const product = await productRes.json();
        setFormData({
          name: product.name || "",
          category: String(product.category?.id || product.category || ""),
          supplier: String(product.supplier?.id || product.supplier || ""),
          description: product.description || "",
          has_variants: product.has_variants ?? true,
          has_modifiers: product.has_modifiers ?? false,
          image: null,
        });
        if (product.imageUrl) setImagePreview(product.imageUrl);
      }
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleApiError(error, navigate);
      } else {
        setErrorMessage(error.message || "Unable to load page data");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleVariantChange(e) {
    const { name, value } = e.target;
    setVariantData((prev) => ({ ...prev, [name]: value }));
  }

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files[0] || null;
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleRemoveImage() {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const url = isEditing
        ? `${API_BASE}/admin/products/${productId}`
        : `${API_BASE}/admin/products`;
      const method = isEditing ? "PATCH" : "POST";

      let body;
      let headers = { ...getAuthHeaders() };

      if (formData.image) {
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("category", Number(formData.category));
        if (formData.supplier) fd.append("supplier", Number(formData.supplier));
        if (formData.description) fd.append("description", formData.description);
        fd.append("has_variants", formData.has_variants);
        fd.append("has_modifiers", formData.has_modifiers);
        fd.append("image", formData.image);
        body = fd;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          name: formData.name,
          category: Number(formData.category),
          supplier: formData.supplier ? Number(formData.supplier) : null,
          description: formData.description,
          has_variants: formData.has_variants,
          has_modifiers: formData.has_modifiers,
        });
      }

      const response = await fetch(url, { method, headers, body });

      let data = {};
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) data = await response.json();

      if (response.status === 401 || response.status === 403) throw { status: response.status };
      if (response.status === 400) throw { status: 400, data };
      if (!response.ok)
        throw new Error(isEditing ? "Failed to update product" : "Failed to create product");

      // If creating a new product and variant fields are filled, create the first variant
      if (!isEditing && variantData.sku && variantData.unit_price) {
        const variantPayload = {
          name: variantData.name || formData.name,
          sku: variantData.sku,
          unit_price: variantData.unit_price,
          stock_quantity: variantData.stock_quantity !== "" ? Number(variantData.stock_quantity) : null,
        };

        const variantResponse = await fetch(
          `${API_BASE}/admin/products/${data.id}/variants`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify(variantPayload),
          }
        );

        if (variantResponse.status === 401 || variantResponse.status === 403)
          throw { status: variantResponse.status };

        if (!variantResponse.ok) {
          let variantError = {};
          const vct = variantResponse.headers.get("content-type") || "";
          if (vct.includes("application/json")) variantError = await variantResponse.json();
          throw { status: 400, data: variantError };
        }
      }

      navigate("/admin/catalog");
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleApiError(error, navigate);
      } else if (error.status === 400) {
        setErrorMessage(buildValidationMessage(error.data));
      } else {
        setErrorMessage(error.message || "Failed to save product");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-create-prod">
      <h2>{isEditing ? "Edit Product" : "Create A New Product"}</h2>

      {loading && <p>Loading...</p>}

      {!loading && (
        <form onSubmit={handleSubmit}>
          {errorMessage && <p>{errorMessage}</p>}

          <table className="product-form-table">
            <tbody>
              <tr>
                <td className="form-label-cell"><label>Product Name *</label></td>
                <td>
                  <input
                    name="name"
                    placeholder="Product name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td className="form-label-cell"><label>Category *</label></td>
                <td>
                  <select name="category" required value={formData.category} onChange={handleChange}>
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="form-label-cell"><label>Supplier</label></td>
                <td>
                  <select name="supplier" value={formData.supplier} onChange={handleChange}>
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="form-label-cell"><label>Description</label></td>
                <td>
                  <textarea
                    name="description"
                    placeholder="Product description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </td>
              </tr>
              <tr>
                <td className="form-label-cell"><label>Options</label></td>
                <td className="form-checkbox-cell">
                  <label>
                    <input
                      type="checkbox"
                      name="has_variants"
                      checked={formData.has_variants}
                      onChange={handleChange}
                    />
                    {" "}Has Variants
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="has_modifiers"
                      checked={formData.has_modifiers}
                      onChange={handleChange}
                    />
                    {" "}Has Modifiers
                  </label>
                </td>
              </tr>
              {!isEditing && (
                <>
                  <tr>
                    <td className="form-label-cell"><label>SKU</label></td>
                    <td>
                      <input
                        name="sku"
                        placeholder="SKU"
                        value={variantData.sku}
                        onChange={handleVariantChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="form-label-cell"><label>Unit Price</label></td>
                    <td>
                      <input
                        name="unit_price"
                        placeholder="0.00"
                        type="number"
                        min="0"
                        step="0.01"
                        value={variantData.unit_price}
                        onChange={handleVariantChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="form-label-cell"><label>Stock Quantity</label></td>
                    <td>
                      <input
                        name="stock_quantity"
                        placeholder="Leave blank if not tracked"
                        type="number"
                        min="0"
                        value={variantData.stock_quantity}
                        onChange={handleVariantChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="form-label-cell"><label>Variant Name</label></td>
                    <td>
                      <input
                        name="name"
                        placeholder="e.g. Small, 12oz, Default (uses product name if blank)"
                        value={variantData.name}
                        onChange={handleVariantChange}
                      />
                    </td>
                  </tr>
                </>
              )}
              <tr>
                <td className="form-label-cell"><label>Product Image</label></td>
                <td>
                  <input
                    ref={imageInputRef}
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  {imagePreview && (
                    <div>
                      <br />
                      <img src={imagePreview} alt="Product preview" className="product-img-preview" />
                      <button type="button" onClick={handleRemoveImage}>Remove Image</button>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? isEditing ? "Updating..." : "Creating..."
                : isEditing ? "Update Product" : "Create Product"}
            </button>
            <button type="button" onClick={() => navigate("/admin/catalog")}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
