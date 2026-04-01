import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../api/handleApiError";

export default function AdminProductsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function testAccess() {
      try {
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
      } catch (error) {
        handleApiError(error, navigate);
      }
    }

    testAccess();
  }, [navigate]);

  return (
    <div>
      <h2>Admin Products</h2>
      <p>Manage product-related admin tools here.</p>
    </div>
  );
}