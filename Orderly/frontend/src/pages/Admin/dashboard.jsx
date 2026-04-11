// DASHBOARD.JSX - Admin dashboard overview
import { useEffect, useState } from "react";

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[date.getMonth()]} ${day}${suffix}, ${date.getFullYear()}`;
}

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

  const today = formatDate(new Date());
  const newMessages = 0; // placeholder until messages feature is built

  // placeholder until file access tracking is built
  const recentFiles = [];

  return (
    <div className="admin-dash">
      <h1>Dashboard Home</h1>

      <div className="dash-info-bar">
        <p>Today is {today}</p>
        {/* calendar widget placeholder */}
        <span className="dash-inbox-disabled" title="Pending further development">✉ Inbox ({newMessages})</span>
      </div>

      <div className="dash-recent-file">
        <p className="dash-recent-label">Pick Up Where You Left Off</p>
        {recentFiles.length === 0 ? (
          <p className="dash-recent-value">No recently accessed files.</p>
        ) : (
          <div className="dash-recent-grid">
            {recentFiles.map((file, i) => (
              <div className="dash-file-card" key={i}>
                <div className="dash-file-icon">{file.type}</div>
                <div className="dash-file-info">
                  <p className="dash-file-name">{file.name}</p>
                  <p className="dash-file-accessed">Accessed {file.accessed}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
