// ADMIN.JS - Admin dashboard layout and routing
import "./Admin.css";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated, logout } from "./api/auth";
import AdminLogin from "./pages/Admin/AdminLogin";
import Dashboard from "./pages/Admin/dashboard";
import Reports from "./pages/Admin/reports";
import AdminInventoryPage from "./pages/Admin/AdminInventoryPage";
import AdminSalesDashboard from "./pages/Admin/AdminSalesDashboard";
import AdminProductPerformance from "./pages/Admin/AdminProductPerformance";
import ProductCatalog from "./pages/Admin/AdminProductsPage";
import AdminProductFormPage from "./pages/Admin/AdminProductFormPage";
import AdminSupplierFormPage from "./pages/Admin/AdminSupplierFormPage";
import Orders from "./pages/Admin/orders";
import AccountSettings from "./pages/Admin/admin-acct";

function AdminLayout() {
  const [authorized, setAuthorized] = useState(null);
  const [userName, setUserName] = useState("");
  const location = useLocation();

  useEffect(() => {
    document.title = "Orderly";
    const link = document.querySelector("link[rel='icon']");
    if (link) link.href = "/o_favicon.ico";
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      setAuthorized(false);
      return;
    }

    const token = localStorage.getItem("accessToken");
    fetch("http://localhost:8000/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((user) => {
        if (user.role !== "BUSINESS") {
          setAuthorized(false);
        } else {
          setAuthorized(true);
          setUserName(user.firstName || user.email || "Admin");
        }
      })
      .catch(() => setAuthorized(false));
  }, []);

  function handleLogout() {
    logout();
    window.location.href = "/admin/login";
  }

  if (authorized === null) return null;
  if (authorized === false) return <Navigate to="/admin/login" replace />;

  const path = location.pathname;

  function SidebarMenu() {
    if (path.startsWith("/admin/reports/sales")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">Sales Summary</p>
        <p className="sidebar-desc">View total revenue, units sold, top products, and revenue trends. Filter by year or month to drill into specific periods.</p>
        <Link to="/admin/reports" className="sidebar-back sidebar-back--sub">« Return to Reports Dashboard</Link>
        <Link to="/admin" className="sidebar-back">« Go Back</Link>
      </div>
    );

    if (path.startsWith("/admin/reports/products")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">Product Performance</p>
        <p className="sidebar-desc">Browse product rankings or select a product to view its revenue trend, best period, and detailed breakdown by day or month.</p>
        <Link to="/admin/reports" className="sidebar-back sidebar-back--sub">« Return to Reports Dashboard</Link>
        <Link to="/admin" className="sidebar-back">« Go Back</Link>
      </div>
    );

    if (path.startsWith("/admin/reports")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">Reports</p>
        <p className="sidebar-desc">View sales performance, product trends, and business metrics. Use filters to drill down by date, product, or category.</p>
        {path !== "/admin/reports" && (
          <Link to="/admin/reports" className="sidebar-back">« Back to Reports Dashboard</Link>
        )}
        <Link to="/admin" className="sidebar-back">« Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/inventory")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">Inventory</p>
        <p className="sidebar-desc">Track and update stock levels for all inventory items. Toggle ingredient availability to control which beverages are offered, and manage count-based items by quantity and reorder level.</p>
        <Link to="/admin" className="sidebar-back">« Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/catalog")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">Product Catalog</p>
        <p className="sidebar-desc">Browse and manage the full product catalog. Add new items, edit existing products, update pricing, and control which items are active and visible to customers.</p>
        <Link to="/admin" className="sidebar-back">« Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/orders")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">Orders</p>
        <p className="sidebar-sub">Recent Orders</p>
        {/* fetch recent orders here when endpoint is available */}
        <p className="sidebar-empty">No recent files.</p>
        <div className="sidebar-actions">
          <span className="sidebar-link-disabled" title="Pending further development">» Open Order</span>
          <span className="sidebar-link-disabled" title="Pending further development">» Search History</span>
          <span className="sidebar-link-disabled" title="Pending further development">» Returns & Refunds</span>
          <span className="sidebar-link-disabled" title="Pending further development">» Shipping</span>
        </div>
        <Link to="/admin" className="sidebar-back">« Return to Dashboard</Link>
      </div>
    );

    return null;
  }

  return (
    <div className="admin-dash-wrap">

      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <h1 className="orderly-head">Orderly</h1>
        </Link>
        <SidebarMenu />
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <p className="admin-welcome">Welcome, {userName}!</p>
          <div className="admin-topbar-actions">
            <Link to="/admin/account">⚙ Account Settings</Link>
            <a onClick={handleLogout} style={{cursor: "pointer"}}>Logout</a>
          </div>
        </div>

        <nav className="admin-nav-cards">
          <Link to="/admin/reports" className="nav-card" style={{backgroundImage: "url('/img/rep_button.png')"}}><span>Reports</span></Link>
          <Link to="/admin/inventory" className="nav-card" style={{backgroundImage: "url('/img/inv_button.png')"}}><span>Inventory</span></Link>
          <Link to="/admin/catalog" className="nav-card" style={{backgroundImage: "url('/img/prodcat_button.png')"}}><span>Product Catalog</span></Link>
          <Link to="/admin/orders" className="nav-card" style={{backgroundImage: "url('/img/ord_button.png')"}}><span>Orders</span></Link>
        </nav>

        <div className="admin-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/sales" element={<AdminSalesDashboard />} />
            <Route path="/reports/products" element={<AdminProductPerformance />} />
            <Route path="/inventory" element={<AdminInventoryPage />} />
            <Route path="/catalog" element={<ProductCatalog />} />
            <Route path="/catalog/new" element={<AdminProductFormPage />} />
            <Route path="/catalog/edit/:productId" element={<AdminProductFormPage />} />
            <Route path="/suppliers/new" element={<AdminSupplierFormPage />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/account" element={<AccountSettings />} />
          </Routes>
        </div>

        <div className="admin-footer">
          <span>USER | {userName.toUpperCase()}</span>
        </div>
      </div>

    </div>
  );
}

export default function Admin() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/*" element={<AdminLayout />} />
    </Routes>
  );
}
