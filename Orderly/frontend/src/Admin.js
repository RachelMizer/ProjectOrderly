// ADMIN.JS - Admin dashboard layout and routing
import "./Admin.css";
import API_HOST from './config';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated, logout } from "./api/auth";
import AdminLogin from "./pages/Admin/AdminLogin";
import Dashboard from "./pages/Admin/dashboard";
import SupportDashboard from "./pages/Admin/SupportDashboard";
import TicketDashboard from "./pages/Admin/TicketDashboard";
import TicketCreateForm from "./pages/Admin/TicketCreateForm";
import TicketDetail from "./pages/Admin/TicketDetail";
import MyTickets from "./pages/Admin/MyTickets";
import BacklogPage from "./pages/Admin/BacklogPage";
import BacklogItemDetail from "./pages/Admin/BacklogItemDetail";
import FeatureRequestForm from "./pages/Admin/FeatureRequestForm";
import AdminAccountDetail from "./pages/Admin/AdminAccountDetail";
import CustomerAccountDetail from "./pages/Admin/CustomerAccountDetail";
import UserAccountsDashboard from "./pages/Admin/UserAccountsDashboard";
import AccountsListPage from "./pages/Admin/AccountsListPage";
import SupportTeamRoster from "./pages/Admin/SupportTeamRoster";
import TicketArchivePage from "./pages/Admin/TicketArchivePage";
import AccountCreatePage from "./pages/Admin/AccountCreatePage";
import AnnouncementsPage from "./pages/Admin/AnnouncementsPage";
import KnowledgeBasePage from "./pages/Admin/KnowledgeBasePage";
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
import AdminCategoriesPage from "./pages/Admin/AdminCategoriesPage";
import AdminVariantsModifiersPage from "./pages/Admin/AdminVariantsModifiersPage";
import LocationManagementPage from "./pages/Admin/LocationManagementPage";
import LocationCreatePage from "./pages/Admin/LocationCreatePage";
import LocationDetailPage from "./pages/Admin/LocationDetailPage";
import RegionManagementPage from "./pages/Admin/RegionManagementPage";
import { removeRecentOrder } from "./utils/recentOrders";

const STATUS_COLORS = { ONLINE: "#22c55e", BUSY: "#f472b6", AWAY: "#9ca3af", OFFLINE: "transparent" };
const STATUS_LABELS = { ONLINE: "Online", BUSY: "Busy", AWAY: "Away", OFFLINE: "Offline" };

function AdminLayout() {
  const [authorized, setAuthorized] = useState(null);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [recentOrdersKey, setRecentOrdersKey] = useState(0);
  const [ticketSearch, setTicketSearch] = useState("");
  const [myStatus, setMyStatus] = useState("ONLINE");
  const [teamStatuses, setTeamStatuses] = useState([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
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
    fetch(`${API_HOST}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((user) => {
        if (user.role !== "STORE_MANAGER" && user.role !== "EMPLOYEE" && user.role !== "EXECUTIVE" && user.role !== "SUPPORT") {
          setAuthorized(false);
        } else {
          setAuthorized(true);
          setUserRole(user.role);
          setUserName(user.firstName || user.username || user.email || "Admin");
          localStorage.setItem("currentUserId", user.id);
          if (user.role === "SUPPORT") {
            fetch(`${API_HOST}/api/v1/users/my-status/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => { if (data) setMyStatus(data.status); })
              .catch(() => {});
          }
        }
      })
      .catch(() => setAuthorized(false));
  }, []);

  useEffect(() => {
    if (!authorized) return;
    const token = localStorage.getItem("accessToken");
    fetch(`${API_HOST}/api/v1/support/announcements/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((data) => setAnnouncements(data.results || []))
      .catch(() => {});
  }, [authorized]);

  useEffect(() => {
    if (!authorized || userRole !== "SUPPORT") return;
    function fetchTeam() {
      const token = localStorage.getItem("accessToken");
      fetch(`${API_HOST}/api/v1/users/team-status/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : { members: [] }))
        .then((data) => setTeamStatuses(data.members || []))
        .catch(() => {});
    }
    fetchTeam();
    const interval = setInterval(fetchTeam, 30000);
    return () => clearInterval(interval);
  }, [authorized, userRole]);

  useEffect(() => {
    if (!authorized || userRole !== "SUPPORT") return;
    function sendHeartbeat() {
      const token = localStorage.getItem("accessToken");
      fetch(`${API_HOST}/api/v1/users/heartbeat/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [authorized, userRole]);

  function handleLogout() {
    const token = localStorage.getItem("accessToken");
    fetch(`${API_HOST}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .catch(() => {})
      .finally(() => {
        logout();
        window.location.href = "/admin/login";
      });
  }

  function handleStatusChange(newStatus) {
    const token = localStorage.getItem("accessToken");
    setMyStatus(newStatus);
    setStatusDropdownOpen(false);
    fetch(`${API_HOST}/api/v1/users/my-status/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((r) => {
        if (r.ok) {
          setTeamStatuses((prev) =>
            prev.map((m) =>
              m.id === Number(localStorage.getItem("currentUserId")) ? { ...m, status: newStatus } : m
            )
          );
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (!path.startsWith("/admin/orders")) return;
    const stored = JSON.parse(localStorage.getItem("orderly_recent_orders") || "[]");
    if (stored.length === 0) return;
    const token = localStorage.getItem("accessToken");
    Promise.all(
      stored.map((o) =>
        fetch(`${API_HOST}/api/v1/orders/${o.id}`, {
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

  function handleTicketSearch(e) {
    e.preventDefault();
    const id = ticketSearch.trim();
    if (id) {
      navigate(`/admin/support/tickets/${id}`);
      setTicketSearch("");
    }
  }

  function handleDismissAnnouncement(id) {
    const token = localStorage.getItem("accessToken");
    fetch(`${API_HOST}/api/v1/support/announcements/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  function SidebarMenu() {
    if (userRole === "SUPPORT") return (
      <div className="sidebar-menu">
        {/* Team Announcements */}
        {announcements.length > 0 && (
          <div className="sidebar-announcements">
            <p className="sidebar-announcements__heading">📢 Team Announcements</p>
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="sidebar-announcement">
                <p className="sidebar-announcement__body">{a.body}</p>
                <button className="sidebar-announcement__dismiss" onClick={() => handleDismissAnnouncement(a.id)} title="Dismiss">×</button>
              </div>
            ))}
          </div>
        )}

        {/* Status toggle */}
        <p style={{fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".1rem", color: "rgba(255,255,255,0.9)", margin: "0 0 3px 2px", fontWeight: 700}}>Your Status</p>
        <div
          className="sidebar-status-bar"
          onClick={(e) => { e.stopPropagation(); setStatusDropdownOpen((o) => !o); }}
        >
          <span
            className="presence-dot"
            style={{
              background: myStatus === "OFFLINE" ? "transparent" : STATUS_COLORS[myStatus] || "#22c55e",
              border: myStatus === "OFFLINE" ? "2px solid #9ca3af" : "none",
            }}
          />
          <span className="sidebar-status-bar__label">{STATUS_LABELS[myStatus] || myStatus}</span>
          <span style={{fontSize: ".65rem", color: "white"}}>▾</span>
          {statusDropdownOpen && (
            <div className="sidebar-status-dropdown" onClick={(e) => e.stopPropagation()}>
              {["ONLINE", "BUSY", "AWAY"].map((s) => (
                <div key={s} className="sidebar-status-option" onClick={() => handleStatusChange(s)}>
                  <span className="presence-dot" style={{ background: STATUS_COLORS[s] }} />
                  {STATUS_LABELS[s]}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="sidebar-title" style={{marginTop: "10px", fontSize: "1.15rem", letterSpacing: ".18rem"}}>Support Options</p>
        <p className="sidebar-sub sidebar-sub--search">Ticket Search</p>
        <form className="sidebar-ticket-search" onSubmit={handleTicketSearch} style={{marginBottom: "14px"}}>
          <input
            type="text"
            className="sidebar-ticket-search__input"
            placeholder="Ticket ID"
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
          />
          <button type="submit" className="sidebar-ticket-search__btn">Go</button>
        </form>
        <Link to="/admin/support/tickets" className="sidebar-btn">🎫 Ticket Dashboard</Link>
        <Link to="/admin/support/archive" className="sidebar-btn" style={{marginTop: "6px"}}>🗄️ Ticket Archive</Link>
        <Link to="/admin/support/backlog" className="sidebar-btn" style={{marginTop: "6px"}}>📋 Backlog</Link>
        <Link to="/admin/support/knowledge" className="sidebar-btn" style={{marginTop: "6px"}}>📖 Knowledge Base</Link>
        <Link to="/admin/feature-request" className="sidebar-btn" style={{marginTop: "6px"}}>💡 Feature Request</Link>
        <div style={{marginTop: "16px", marginBottom: "4px", borderTop: "1px solid rgba(255,255,255,0.2)"}} />
        <Link to="/admin/support/announcements" className="sidebar-btn">📢 Team Announcements</Link>
        <Link to="/admin/support/accounts" className="sidebar-btn" style={{marginTop: "6px"}}>👤 User Accounts Dashboard</Link>
        <Link to="/admin/support/team" className="sidebar-btn" style={{marginTop: "6px"}}>👥 Team Roster</Link>
        <a href="/manual/support/index.html" target="_blank" rel="noreferrer" className="sidebar-btn" style={{marginTop: "6px", marginBottom: "16px"}}>📘 Support Manual</a>
        {path !== "/admin" && (
          <Link to="/admin" className="sidebar-back" style={{marginTop: "4px"}}>⬅️ Return to Dashboard</Link>
        )}

        {/* Team presence list */}
        {teamStatuses.length > 0 && (
          <div className="sidebar-team-list">
            <p className="sidebar-team-list__heading">Team Member Status</p>
            {teamStatuses.map((m) => (
              <div key={m.id} className="sidebar-team-member">
                <span
                  className="presence-dot"
                  style={{
                    background: m.status === "OFFLINE" ? "transparent" : STATUS_COLORS[m.status] || "#9ca3af",
                    border: m.status === "OFFLINE" ? "2px solid #9ca3af" : "none",
                  }}
                />
                <span
                  className="sidebar-team-member__name"
                  style={{
                    color: m.status === "OFFLINE" ? "#8faabf" : m.status === "BUSY" ? "#4a5568" : m.status === "ONLINE" ? "#33638b" : m.status === "AWAY" ? "#9ca3af" : undefined,
                    fontWeight: m.status === "ONLINE" ? "800" : undefined,
                    fontStyle: m.status === "BUSY" || m.status === "AWAY" ? "italic" : undefined,
                  }}
                >{m.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );

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

    if (path.startsWith("/admin/categories")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title"><span style={{marginRight:"-1px"}}>🏷️</span>Category Management</p>
        <p className="sidebar-desc">Create, rename, and delete product categories. Categories group your products on the storefront.</p>
        <Link to="/admin/catalog" className="sidebar-back sidebar-back--sub">⬅️ Return to Catalog</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/variants-modifiers")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title"><span style={{marginRight:"-1px"}}>🔧</span>Variants &amp; Modifiers</p>
        <p className="sidebar-desc">Add product variants, create modifier groups, and manage the options within each group.</p>
        <Link to="/admin/catalog" className="sidebar-back sidebar-back--sub">⬅️ Return to Catalog</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
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
        <Link to="/admin/categories" className="sidebar-btn">🏷️ CATEGORY MANAGEMENT</Link>
        <Link to="/admin/variants-modifiers" className="sidebar-btn">🔧 VARIANTS &amp; MODIFIERS</Link>
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

    if (path === "/admin/locations/regions") return (
      <div className="sidebar-menu">
        <p className="sidebar-title">🗺️ Region Management</p>
        <p className="sidebar-desc">Add countries, regions, and states/provinces. These are used when creating or editing locations.</p>
        <Link to="/admin/locations" className="sidebar-back sidebar-back--sub">⬅️ Back to Locations</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path === "/admin/locations/new") return (
      <div className="sidebar-menu">
        <p className="sidebar-title">📍 New Location</p>
        <p className="sidebar-desc">Add a new company location. Set up your regions and states first before creating locations.</p>
        <Link to="/admin/locations/regions" className="sidebar-btn" style={{ marginBottom: "8px" }}>🗺️ Manage Regions</Link>
        <Link to="/admin/locations" className="sidebar-back sidebar-back--sub">⬅️ Back to Locations</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

    if (/^\/admin\/locations\/\d+$/.test(path)) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">📍 Location Detail</p>
        <p className="sidebar-desc">Edit this location's information and manager assignment. Changes are saved when you click Save Changes.</p>
        <Link to="/admin/locations" className="sidebar-back sidebar-back--sub">⬅️ Back to Locations</Link>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/locations")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">📍 Location Management</p>
        <p className="sidebar-desc">View all company locations. Filter by country, region, state, or city. Use the search bar to find a specific store.</p>
        <Link to="/admin/locations/regions" className="sidebar-btn">🗺️ Manage Regions</Link>
        <Link to="/admin/locations/new" className="sidebar-btn" style={{ marginTop: "6px" }}>+ New Location</Link>
        <Link to="/admin" className="sidebar-back" style={{ marginTop: "12px" }}>⬅️ Return to Dashboard</Link>
      </div>
    );

    if (path.startsWith("/admin/feature-request")) return (
      <div className="sidebar-menu">
        <p className="sidebar-title">💡 Feature Requests</p>
        <p className="sidebar-desc">Submit ideas and improvements directly to the support team's backlog for review.</p>
        <Link to="/admin" className="sidebar-back">⬅️ Return to Dashboard</Link>
      </div>
    );

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
            <Link to="/admin/support/my-tickets">Help</Link>
            <a href="/manual/01-introduction.html" target="_blank" rel="noreferrer">User Manual</a>
            <Link to="/admin/account"><span style={{fontSize: "1.1rem", marginRight: "2px"}}>⚙</span>Account Settings</Link>
            <a onClick={handleLogout} style={{cursor: "pointer"}}>Logout</a>
          </div>
        </div>

        {userRole !== "SUPPORT" && (
          <nav className="admin-nav-cards">
            <Link to="/admin/reports" className="nav-card" style={{backgroundImage: "url('/img/rep_button.png')"}}><span>Reports</span></Link>
            {userRole !== "EXECUTIVE" && (
              <Link to="/admin/inventory" className="nav-card" style={{backgroundImage: "url('/img/inv_button.png')"}}><span>Inventory</span></Link>
            )}
            {userRole !== "EXECUTIVE" && (
              <Link to="/admin/catalog" className="nav-card nav-card--wrap" style={{backgroundImage: "url('/img/prodcat_button.png')"}}><span>Product Catalog</span></Link>
            )}
            {userRole !== "EXECUTIVE" && (
              <Link to="/admin/orders" className="nav-card" style={{backgroundImage: "url('/img/ord_button.png')"}}><span>Orders</span></Link>
            )}
            <Link to="/admin/settings" className="nav-card nav-card--sm" style={{backgroundImage: "url('/img/sett_button.png')"}}><span>Business &amp;<br />Store Settings</span></Link>
            {userRole === "EXECUTIVE" && (
              <Link to="/admin/locations" className="nav-card nav-card--sm" style={{backgroundImage: "url('/img/loc_button.png')"}}><span>Location<br />Management</span></Link>
            )}
          </nav>
        )}

        <div className="admin-content">
          <Routes>
            <Route path="/" element={userRole === "SUPPORT" ? <SupportDashboard /> : <Dashboard userRole={userRole} />} />
            <Route path="/feature-request" element={<FeatureRequestForm />} />
            <Route path="/support/accounts" element={<UserAccountsDashboard />} />
            <Route path="/support/accounts/support" element={<AccountsListPage role="SUPPORT" />} />
            <Route path="/support/accounts/support/new" element={<AccountCreatePage role="SUPPORT" />} />
            <Route path="/support/accounts/executive" element={<AccountsListPage role="EXECUTIVE" />} />
            <Route path="/support/accounts/executive/new" element={<AccountCreatePage role="EXECUTIVE" />} />
            <Route path="/support/accounts/store-manager" element={<AccountsListPage role="STORE_MANAGER" />} />
            <Route path="/support/accounts/store-manager/new" element={<AccountCreatePage role="STORE_MANAGER" />} />
            <Route path="/support/accounts/employee" element={<AccountsListPage role="EMPLOYEE" />} />
            <Route path="/support/accounts/employee/new" element={<AccountCreatePage role="EMPLOYEE" />} />
            <Route path="/support/accounts/customer" element={<AccountsListPage role="CUSTOMER" />} />
            <Route path="/support/accounts/customer/new" element={<AccountCreatePage role="CUSTOMER" />} />
            <Route path="/support/accounts/customer/:userId" element={<CustomerAccountDetail />} />
            <Route path="/support/accounts/:userId" element={<AdminAccountDetail />} />
            <Route path="/support/team" element={<SupportTeamRoster />} />
            <Route path="/support/my-tickets" element={<MyTickets />} />
            <Route path="/support/backlog" element={<BacklogPage />} />
            <Route path="/support/backlog/:itemId" element={<BacklogItemDetail />} />
            <Route path="/support/announcements" element={<AnnouncementsPage />} />
            <Route path="/support/knowledge" element={<KnowledgeBasePage />} />
            <Route path="/support/tickets" element={<TicketDashboard />} />
            <Route path="/support/archive" element={<TicketArchivePage />} />
            <Route path="/support/tickets/new" element={<TicketCreateForm />} />
            <Route path="/support/tickets/:ticketId" element={<TicketDetail />} />
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
            <Route path="/categories" element={<AdminCategoriesPage />} />
            <Route path="/variants-modifiers" element={<AdminVariantsModifiersPage />} />
            <Route path="/locations" element={<LocationManagementPage />} />
            <Route path="/locations/new" element={<LocationCreatePage />} />
            <Route path="/locations/regions" element={<RegionManagementPage />} />
            <Route path="/locations/:locationId" element={<LocationDetailPage />} />
          </Routes>
        </div>

        <div className="admin-footer">
          <span>{userRole} USER | {userName.toUpperCase()}</span>
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
