import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../api/handleApiError";

export default function AdminProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    supplier: "",
    description: "",
  });

  useEffect(() => {
    async function loadPageData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("accessToken");

        const [productsResponse, categoriesResponse, suppliersResponse] =
          await Promise.all([
            fetch("http://127.0.0.1:8000/api/v1/admin/products", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://127.0.0.1:8000/api/v1/categories", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://127.0.0.1:8000/api/v1/admin/suppliers", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (
          productsResponse.status === 403 ||
          categoriesResponse.status === 403 ||
          suppliersResponse.status === 403
        ) {
          throw { status: 403 };
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

        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else if (Array.isArray(productsData.results)) {
          setProducts(productsData.results);
        } else {
          setProducts([]);
        }

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else if (Array.isArray(categoriesData.results)) {
          setCategories(categoriesData.results);
        } else {
          setCategories([]);
        }

        if (Array.isArray(suppliersData)) {
          setSuppliers(suppliersData);
        } else if (Array.isArray(suppliersData.results)) {
          setSuppliers(suppliersData.results);
        } else {
          setSuppliers([]);
        }
      } catch (error) {
        if (error.status === 403) {
          handleApiError(error, navigate);
        } else {
          console.error("Failed to load admin product page data:", error);
          setErrorMessage(error.message || "Unable to load page data");
        }
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
      const token = localStorage.getItem("accessToken");

      const url = editingProduct
        ? `http://127.0.0.1:8000/api/v1/admin/products/${editingProduct.id}`
        : "http://127.0.0.1:8000/api/v1/admin/products";

      const method = editingProduct ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 403) {
        throw { status: 403 };
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
      if (error.status === 403) {
        handleApiError(error, navigate);
      } else if (error.status === 400) {
        setErrorMessage(error.data?.message || "Validation error");
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(productId) {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 403) {
        throw { status: 403 };
      }

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));

      if (editingProduct?.id === productId) {
        resetForm();
      }
    } catch (error) {
      if (error.status === 403) {
        handleApiError(error, navigate);
      } else {
        setErrorMessage(error.message);
      }
    }
  }

  return (
    <div>
      <h2>Admin Products</h2>

      <h3>{editingProduct ? "Edit Product" : "Create Product"}</h3>

      <form onSubmit={handleSubmit}>
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
                  <button type="button" onClick={() => handleDelete(product.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}