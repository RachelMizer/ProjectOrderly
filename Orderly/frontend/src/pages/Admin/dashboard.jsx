// DASHBOARD.JSX - Admin dashboard overview
import { useEffect, useState } from "react";

const API = "http://localhost:8000/api/v1";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API}/categories`),
          fetch(`${API}/products?pageSize=100`),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        setCategories(catData.results || []);
        setProducts(prodData.results || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  if (loading) return <p className="admin-loading">Loading...</p>;

  return (
    <div className="admin-dash">
      <h1>Dashboard</h1>

    </div>
  );
}
