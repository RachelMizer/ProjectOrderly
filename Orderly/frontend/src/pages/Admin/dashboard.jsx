// DASHBOARD.JSX - Admin dashboard overview
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentViews } from "../../utils/recentViews";

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[date.getMonth()]} ${day}${suffix}, ${date.getFullYear()}`;
}

const API = `${process.env.REACT_APP_API_URL}/api/v1`;

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentViews, setRecentViews] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    setRecentViews(getRecentViews());
  }, []);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  if (loading) return <p className="admin-loading">Loading...</p>;

  const today = formatDate(new Date());
  const newMessages = 0; // placeholder until messages feature is built

  return (
    <div className="admin-dash">
      <h1>Dashboard Home</h1>

      <div className="dash-info-bar">
        <p>Today is {today}</p>
        <span className="dash-inbox-disabled" title="Pending further development">✉ Inbox ({newMessages})</span>
      </div>

      <div className="dash-recent-file">
        <p className="dash-recent-label">Pick Up Where You Left Off</p>
        {recentViews.length === 0 ? (
          <p className="dash-recent-value">No recent activity yet. Visit a section to get started.</p>
        ) : (
          <div className="dash-recent-grid">
            {recentViews.map((view) => (
              <div
                className="dash-file-card"
                key={view.section}
                onClick={() => navigate(view.path, view.state ? { state: view.state } : undefined)}
              >
                <div className="dash-file-info">
                  <p className="dash-file-name">{view.label}</p>
                  <p className="dash-file-accessed">{view.sublabel}</p>
                  {view.timestamp && (
                    <p className="dash-file-last-visited">Last visited {formatDate(new Date(view.timestamp))}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
