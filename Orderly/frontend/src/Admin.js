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
import AdminOrderDetail from "./pages/Admin/AdminOrderDetail";
import AccountSettings from "./pages/Admin/admin-acct";
import AdminSettingsHub from "./pages/Admin/AdminSettingsHub";
import AdminBusinessSettings from "./pages/Admin/AdminBusinessSettings";
import AdminStorefrontSettings from "./pages/Admin/AdminStorefrontSettings";
import AdminExportPage from "./pages/Admin/AdminExportPage";
import AdminPurchaseOrderPage from "./pages/Admin/AdminPurchaseOrderPage";
import AdminInventoryDetailPage from "./pages/Admin/AdminInventoryDetailPage";
import AdminSuppliersPage from "./pages/Admin/AdminSuppliersPage";
import { removeRecentOrder } from "./utils/recentOrders";

function AdminLayout() {
  const [authorized, setAuthorized] = useState(null);
  const [userName, setUserName] = useState("");
  const [recentOrdersKey, setRecentOrdersKey] = useState(0);
  const location = useLocation();
  const path = location.pathname;

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
    fetch(`${process.env.REACT_APP_API_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((user) => {
        if (user.role !== "BUSINESS") {
          setAuthorized(false);
        } else {
          setAuthorized(true);
          setUserName(user.username || user.firstName || user.email || "Admin");
        }
      })
      .catch(() => setAuthorized(false));
  }, []);

  function handleLogout() {
    logout();
    window.location.href = "/admin/login";
  }

  useEffect(() => {
    if (!path.startsWith("/admin/orders")) return;
    const stored = JSON.parse(localStorage.getItem("orderly_recent_orders") || "[]");
    if (stored.length === 0) return;
    const token = localStorage.getItem("accessToken");
    Promise.all(
      stored.map((o) =>
        fetch(`http://127.0.0.1:8000/api/v1/orders/${o.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => (r.status === 404 ? o.id : null))
      )
    ).then((staleIds) => {
      const toRemove = staleIds.filter(Boolean);
      if (toRemove.length > 0) {
        toRemove.forEach((id) => removeRecentOrder(id));
        setRecentOrdersKey((k) => k + 1);
      }
    });
  }, [path]);

  if (authorized === null) return null;
  if (authorized === false) return <Navigate to="/admin/login" replace />;

  function SidebarMenu() {
    if (path.startsWith("/admin/export")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title"><span style={{marginRight:"-1px"}}>📥</span>Export Data</p>
        <p className="sidebar-desc">Download orders, products, or inventory as CSV files for use in spreadsheets or other tools.</p>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/purchase-order")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title"><span style={{marginRight:"-1px"}}>🛒</span> Purchase Order</p>
        <p className="sidebar-desc">Review low-stock inventory items and generate a purchase order to send to your supplier.</p>
        <Link to="/admin/reports" className="sidebar-back sidebar-back--sub">⬅️ Return to Reports Dashboard</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/reports/sales")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title"><span style={{marginRight:"-1px"}}>💰</span>Sales Summary</p>
        <p className="sidebar-desc">View total revenue, units sold, top products, and revenue trends. Filter by year or month to drill into specific periods.</p>
        <Link to="/admin/reports" className="sidebar-back sidebar-back--sub">⬅️ Return to Reports Dashboard</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Go Back</Link>
      </div>
    );

    if (path.startsWith("/admin/reports/products")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">Product Performance</p>
        <p className="sidebar-desc">Browse product rankings or select a product to view its revenue trend, best period, and detailed breakdown by day or month.</p>
        <Link to="/admin/reports" className="sidebar-back sidebar-back--sub">⬅️ Return to Reports Dashboard</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Go Back</Link>
      </div>
    );

    if (path.startsWith("/admin/reports")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title"><span style={{marginRight:"-1px"}}>📊</span>Reports</p>
        <p className="sidebar-desc">View sales performance, product trends, and business metrics. Use filters to drill down by date, product, or category.</p>
        {path !== "/admin/reports" && (
          <Link to="/admin/reports" className="sidebar-back">⬅️ Back to Reports Dashboard</Link>
        )}
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/inventory")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title"><span style={{marginRight:"-1px"}}>📋</span>Inventory</p>
        <p className="sidebar-desc">Track and update stock levels for all inventory items. Toggle ingredient availability to control which beverages are offered, and manage count-based items by quantity and reorder level.</p>
        <Link to="/admin/suppliers" className="sidebar-btn">🏭 SUPPLIER MANAGEMENT</Link>
        {path !== "/admin/inventory" && (
          <Link to="/admin/inventory" className="sidebar-back sidebar-back--sub" style={{marginTop:"14px", marginBottom:"-12px"}}>⬅️ Return to Inventory</Link>
        )}
        <Link to="/admin" className="sidebar-back" style={{marginTop:"20px"}}>⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/suppliers")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title"><span style={{marginRight:"-1px"}}>🏭</span>Supplier Management</p>
        <p className="sidebar-desc">View, add, and edit supplier contact information. Suppliers can be assigned to individual inventory items.</p>
        <Link to="/admin/catalog" className="sidebar-back sidebar-back--sub">⬅️ Return to Catalog</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/catalog")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title"><span style={{marginRight:"-1px"}}>🛍️</span>Product Catalog</p>

        <p className="sidebar-desc">
          Browse and manage the full product catalog. Add new items, edit existing
          products, update pricing, and control which items are active and visible
          to customers. Use the Manage Suppliers link to view and edit supplier contacts.
        </p>

        <Link to="/admin/suppliers" className="sidebar-btn">🏭 SUPPLIER MANAGEMENT</Link>
        <Link to="/admin" className="sidebar-back" style={{marginTop:"20px"}}>⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/settings/business")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">Business Settings</p>
        <p className="sidebar-desc">Manage tax rate, business contact information, and address details.</p>
        <Link to="/admin/settings" className="sidebar-back sidebar-back--sub">⬅️ Return to Settings</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/settings/storefront")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title" style={{whiteSpace:"normal"}}><span style={{marginRight:"-1px"}}>⚙️</span>Branding and Storefront Management</p>
        <p className="sidebar-desc">Manage customer-facing details and configuration for the online storefront.</p>
        <Link to="/admin/settings" className="sidebar-back sidebar-back--sub">⬅️ Return to Settings</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Go Back</Link>
      </div>
    );

    if (path.startsWith("/admin/settings")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title sidebar-title--sm" style={{whiteSpace:"normal"}}><span style={{marginRight:"-1px"}}>⚙️</span>Settings Management</p>
        <p className="sidebar-desc">Configure business and storefront settings for your Orderly instance.</p>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/orders")) {
      const recentOrders = JSON.parse(localStorage.getItem("orderly_recent_orders") || "[]");
      return (
        <div className="sidebar-menu" key={recentOrdersKey}>
          <p className="sidebar-title sidebar-title--sm"><span style={{marginRight:"-1px"}}>🧾</span>Order Management</p>
          <div className="sidebar-recent-orders">
            <p className="sidebar-sub sidebar-sub--boxed">Recent Orders</p>
            {recentOrders.length === 0 ? (
              <p className="sidebar-empty">No orders yet.</p>
            ) : (
              recentOrders.map((o) => (
                <Link key={o.id} to={`/admin/orders/${o.id}`} className="sidebar-recent-order">
                  <span className="sidebar-recent-order__id">#{o.id}</span>
                  <span className="sidebar-recent-order__name">{o.customerName}</span>
                </Link>
              ))
            )}
          </div>
          <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
          </div>
    );
}

    return null;
  }

  return (
    <div className="admin-dash-wrap">

      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <h1 className="orderly-head">Orderly</h1>
          <p className="orderly-tagline">Management&nbsp;Suite<br />for Business</p>
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
          <Link to="/admin/catalog" className="nav-card nav-card--wrap" style={{backgroundImage: "url('/img/prodcat_button.png')"}}><span>Product Catalog</span></Link>
          <Link to="/admin/orders" className="nav-card" style={{backgroundImage: "url('/img/ord_button.png')"}}><span>Orders</span></Link>
          <Link to="/admin/settings" className="nav-card nav-card--sm" style={{backgroundImage: "url('/img/sett_button.png')"}}><span>Business<br />&amp; Store Settings</span></Link>
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
            <Route path="/orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/settings" element={<AdminSettingsHub />} />
            <Route path="/settings/business" element={<AdminBusinessSettings />} />
            <Route path="/settings/storefront" element={<AdminStorefrontSettings />} />
            <Route path="/export" element={<AdminExportPage />} />
            <Route path="/purchase-order" element={<AdminPurchaseOrderPage />} />
            <Route path="/inventory/:itemId" element={<AdminInventoryDetailPage />} />
            <Route path="/suppliers" element={<AdminSuppliersPage />} />
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
  useEffect(() => {
    // Add admin-specific body class
    document.body.classList.add("admin-body");
    return () => {
      document.body.classList.remove("admin-body");
    };
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/*" element={<AdminLayout />} />
    </Routes>
  );
}
