// ADMIN.JS - Admin dashboard layout and routing
import "./Admin.css";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated, logout } from "./api/auth";
import AdminLogin from "./pages/Admin/AdminLogin";
import Dashboard from "./pages/Admin/dashboard";
import Reports from "./pages/Admin/reports";
import Inventory from "./pages/Admin/inventory";
import ProductCatalog from "./pages/Admin/prod-cat";
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

  return (
    <div className="admin-dash-wrap">
      
        <nav>
            <p>Hello {userName}!</p>
            <Link to="/admin/account">Account Settings</Link>
            <a onClick={handleLogout} style={{cursor: "pointer"}}>Log Out</a>
        </nav>
        <nav>
            <Link to="/admin">Home</Link>
            <Link to="/admin/reports">Reports</Link>
            <Link to="/admin/inventory">Inventory</Link>
            <Link to="/admin/catalog">Product Catalog</Link>
            <Link to="/admin/orders">Orders</Link>
        </nav>
          

      <div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/catalog" element={<ProductCatalog />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/account" element={<AccountSettings />} />
        </Routes>
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
