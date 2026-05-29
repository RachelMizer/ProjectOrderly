// DASHBOARD.JSX - Admin dashboard overview
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentViews } from "../../utils/recentViews";
import { fetchInventory } from "../../api/adminInventory";

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
               : day === 2 || day === 22 ? "nd"
               : day === 3 || day === 23 ? "rd" : "th";
  return `${months[date.getMonth()]} ${day}${suffix}, ${date.getFullYear()}`;
}

import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;

export default function Dashboard({ userRole }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentViews, setRecentViews] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [storeName, setStoreName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("accessToken");
        const [catRes, prodRes, settRes] = await Promise.all([
          fetch(`${API}/categories`),
          fetch(`${API}/products?pageSize=100`),
          fetch(`${API}/settings/`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        const settData = settRes.ok ? await settRes.json() : {};
        setCategories(catData.results || []);
        setProducts(prodData.results || []);
        if (settData.storeName) setStoreName(settData.storeName);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadInventoryAlerts() {
      try {
        const items = await fetchInventory();
        const tracked = items
          .filter((i) => i.stock_quantity !== null && i.stock_quantity !== undefined)
          .sort((a, b) => {
            const aFlagged = Number(a.stock_quantity) === 0 || (a.reorder_level !== null && a.reorder_level !== undefined && Number(a.stock_quantity) <= Number(a.reorder_level));
            const bFlagged = Number(b.stock_quantity) === 0 || (b.reorder_level !== null && b.reorder_level !== undefined && Number(b.stock_quantity) <= Number(b.reorder_level));
            if (aFlagged !== bFlagged) return aFlagged ? -1 : 1;
            return Number(a.stock_quantity) - Number(b.stock_quantity);
          })
          .slice(0, 6);
        setInventoryAlerts(tracked);
      } catch (err) {
        console.error("Failed to load inventory alerts:", err);
      }
    }
    loadInventoryAlerts();
  }, []);

  useEffect(() => {
    const EXECUTIVE_BLOCKED = ["inventory", "catalog", "orders"];
    const all = getRecentViews();
    const visible = userRole === "EXECUTIVE"
      ? all.filter((v) => !EXECUTIVE_BLOCKED.includes(v.section))
      : all;
    setRecentViews(visible);
  }, [userRole]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  if (loading) return <p className="admin-loading">Loading...</p>;

  const today = formatDate(new Date());

  return (
    <div className="admin-dash">
      <h1>{storeName ? `Dashboard Home for ${storeName}` : "Dashboard Home"}</h1>

      <div className="dash-info-bar">
        <p><span style={{marginRight:"-1px"}}>📅</span>Today is {today}</p>
      </div>

      <div className="dash-recent-file">
        <p className="dash-recent-label"><span style={{marginRight:"-1px"}}>🔖</span>Pick Up Where You Left Off</p>
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

      {userRole !== "EXECUTIVE" && <div className="dash-low-stock-section">
          <p
            className="dash-low-stock-label"
            onClick={() => navigate("/admin/inventory")}
          >
            <span style={{marginRight:"-1px"}}>📋</span>Inventory Alerts
          </p>
          {inventoryAlerts.length === 0 ? (
            <p className="dash-recent-value">No inventory items to display. Add items in the Inventory section.</p>
          ) : (
          <div className="dash-low-stock-grid">
            {inventoryAlerts.map((item) => {
              const reorder = Number(item.reorder_level);
              const stock = Number(item.stock_quantity);
              const isOutOfStock = stock === 0;
              const isLowStock = !isOutOfStock && item.reorder_level !== null &&
                item.reorder_level !== undefined &&
                stock <= reorder;
              const isCritical = isLowStock && stock <= reorder * 0.5;
              return (
                <div className={`dash-low-stock-tile${isOutOfStock ? " dash-low-stock-tile--out" : isLowStock ? " dash-low-stock-tile--low-stock" : ""}`} key={item.id}>
                  <p className="dash-low-stock-tile__name">
                    {item.name}
                    {isOutOfStock && (
                      <span className="inv-badge inv-badge--out">Out of Stock</span>
                    )}
                    {isLowStock && (
                      <span className={`inv-badge ${isCritical ? "inv-badge--critical" : "inv-badge--low-stock"}`}>Low Stock</span>
                    )}
                  </p>
                  <p className="dash-low-stock-tile__stock">
                    <strong>In Stock:</strong> <strong style={Number(item.stock_quantity) === 0 ? { color: "#c0392b" } : undefined}>{item.stock_quantity}</strong>
                  </p>
                  <p className="dash-low-stock-tile__reorder">
                    Reorder At: {item.reorder_level ?? "—"}
                  </p>
                </div>
              );
            })}
          </div>
          )}
        </div>}

    </div>
  );
}
