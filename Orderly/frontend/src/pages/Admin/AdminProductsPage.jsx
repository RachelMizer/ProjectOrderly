import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../api/handleApiError";

export default function AdminProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("accessToken");

        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/admin/products",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 403) {
          throw { status: 403 };
        }

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.results)) {
          setProducts(data.results);
        } else {
          setProducts([]);
        }
      } catch (error) {
        if (error.status === 403) {
          handleApiError(error, navigate);
        } else {
          console.error("Failed to load admin products:", error);
          setErrorMessage(error.message || "Unable to load products");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [navigate]);

  return (
    <div>
      <h2>Admin Products</h2>

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
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={{ paddingRight: "1rem" }}>{product.id}</td>
                <td style={{ paddingRight: "1rem" }}>{product.name}</td>
                <td style={{ paddingRight: "1rem" }}>
                  {product.category?.name || product.categoryName || "—"}
                </td>
                <td style={{ paddingRight: "1rem" }}>
                  {product.description || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}