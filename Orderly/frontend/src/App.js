import "./App.css";

import { useState, useEffect } from "react";

// Router
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

// Auth Pages
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import ResetPasswordRequest from "./pages/Auth/ResetPasswordRequest";
import ResetPassword from "./pages/Auth/ResetPassword";
import StoreFront from "./pages/StoreFront";

import ProductPage from "./pages/ProductPage";
import Profile from "./pages/Auth/Profile";

// Storefront & Customer Pages
import OrderHistory from "./pages/Orders/OrderHistory";
import OrderDetails from "./pages/Orders/OrderDetail";

import CartPage from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin from "./Admin";

// Admin Components
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminLayout from "./components/admin/AdminLayout";

// Admin Pages
import AdminDashboardHome from "./pages/Admin/AdminDashboardHome";
import AdminProductsPage from "./pages/Admin/AdminProductsPage";
import AdminSuppliersPage from "./pages/Admin/AdminSuppliersPage";
import AdminInventoryPage from "./pages/Admin/AdminInventoryPage";

// API
import { logout, isAuthenticated } from "./api/auth";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
}

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === "1") return `1-${digits.slice(1,4)}-${digits.slice(4,7)}-${digits.slice(7)}`;
  return raw;
}

function AppContent() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(getStoredUser);
  const [storeLogo, setStoreLogo] = useState(null);
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeHours, setStoreHours] = useState("");
  const [storeTagline, setStoreTagline] = useState("");
  const [showTagline, setShowTagline] = useState(false);

  const role = user?.role?.toUpperCase();
  const firstName = user?.firstName || "";

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/settings/")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data) return;
        if (data.storeName)    document.title = data.storeName;
        if (data.favicon) {
          const link = document.querySelector("link[rel='icon']");
          if (link) link.href = data.favicon;
        }
        if (data.storeImage)   setStoreLogo(data.storeImage);
        if (data.storeAddress) setStoreAddress(data.storeAddress);
        if (data.storePhone)   setStorePhone(data.storePhone);
        if (data.hours)        setStoreHours(data.hours);
        if (data.storeTagline) setStoreTagline(data.storeTagline);
        setShowTagline(data.showTagline ?? false);

        // Apply storefront theme
        const root = document.documentElement;
        if (data.pageBackgroundColor)    root.style.setProperty("--sf-page-bg",          data.pageBackgroundColor);
        if (data.headerSpecialTextColor) root.style.setProperty("--sf-header-special",   data.headerSpecialTextColor);
        if (data.headerTextColor)        root.style.setProperty("--sf-header-text",       data.headerTextColor);
        if (data.navBgColor)             root.style.setProperty("--sf-nav-bg",            data.navBgColor);
        if (data.navLinkColor)           root.style.setProperty("--sf-nav-link",          data.navLinkColor);
        if (data.navTextColor)           root.style.setProperty("--sf-nav-text",          data.navTextColor);
        if (data.mainLinkColor)          root.style.setProperty("--sf-main-link",         data.mainLinkColor);
        if (data.mainTextColor)          root.style.setProperty("--sf-main-text",         data.mainTextColor);
        if (data.footerBgColor)          root.style.setProperty("--sf-footer-bg",         data.footerBgColor);
        if (data.footerLinkColor)        root.style.setProperty("--sf-footer-link",       data.footerLinkColor);
        if (data.btnBgColor)             root.style.setProperty("--sf-btn-bg",            data.btnBgColor);
        if (data.btnTextColor)           root.style.setProperty("--sf-btn-text",          data.btnTextColor);
        if (data.sectionBg1Color)        root.style.setProperty("--sf-section-bg-1",      data.sectionBg1Color);
        if (data.sectionBg2Color)        root.style.setProperty("--sf-section-bg-2",      data.sectionBg2Color);

        if (data.fontChoice) {
          const fontMap = {
            arimo:    "'Arimo', sans-serif",
            lora:     "'Lora', serif",
            roboto:   "'RobotoCondensed', sans-serif",
            playfair: "'PlayfairDisplay', serif",
            raleway:  "'Raleway', sans-serif",
            munson:   "'Munson', serif",
          };
          const family = fontMap[data.fontChoice] || fontMap.munson;
          root.style.setProperty("--sf-font", family);
        }

        try { localStorage.setItem("sf_theme", JSON.stringify(data)); } catch {}
      })
      .catch(() => {});
  }, []);

  // Load profile on login
  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const profile = await response.json();
          const existingUser = getStoredUser() || {};

          const mergedUser = {
            ...existingUser,
            ...profile,
            role: existingUser?.role || profile.role,
          };

          localStorage.setItem("user", JSON.stringify(mergedUser));
          setUser(mergedUser);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    if (loggedIn) {
      loadProfile();
    } else {
      setUser(null);
    }
  }, [loggedIn]);

async function fetchCartCount() {
    const token = localStorage.getItem("accessToken");
    const guestEmail = !token ? localStorage.getItem("guestCartEmail") : null;

    if (!token && !guestEmail) { setCartCount(0); return; }

    try {
      const draftRes = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/orders/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(guestEmail ? { guestEmail } : {})
      });

      const draft = await draftRes.json();
      if (!draft.id) { setCartCount(0); return; }

      const detailUrl = guestEmail
        ? `${process.env.REACT_APP_API_URL}/api/v1/orders/${draft.id}?guestEmail=${encodeURIComponent(guestEmail)}`
        : `${process.env.REACT_APP_API_URL}/api/v1/orders/${draft.id}`;

      const detailRes = await fetch(detailUrl, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });

      const data = await detailRes.json();
      const totalQty = (data.items || []).reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQty);

    } catch {
      setCartCount(0);
    }
  }

  // Update cart count on login, logout, or cart events
  useEffect(() => {
    fetchCartCount();

    window.addEventListener("cart-updated", fetchCartCount);
    return () => window.removeEventListener("cart-updated", fetchCartCount);
  }, [loggedIn]);


  // Logout
  async function handleLogout() {
    try {
      await logout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setLoggedIn(false);
      setCartCount(0);
      alert("Successfully logged out");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message || "Logout failed");
    }
  }

  return (
    <div className="wrapper">
      <header>
        <img src={storeLogo || "/img/logo.png"} alt="Store Logo" />
        {(storeAddress || storePhone || storeHours) && (
          <div className="header-side-info">
            {(storeAddress || storePhone) && (
              <div className="header-info">
                <p><strong style={{ color: "var(--sf-header-special)" }}>Visit Us</strong></p>
                {storeAddress && <p style={{ whiteSpace: "pre", color: "var(--sf-header-text)" }}>{storeAddress}</p>}
                {storePhone && <p style={{ color: "var(--sf-header-text)" }}>📞 {formatPhone(storePhone)}</p>}
              </div>
            )}
            {storeHours && (
              <div className="header-hours">
                <p><strong style={{ color: "var(--sf-header-special)" }}>Hours</strong></p>
                <p style={{ whiteSpace: "pre", color: "var(--sf-header-text)" }}>{storeHours}</p>
              </div>
            )}
          </div>
        )}
      </header>

      {showTagline && storeTagline && (
        <h2 className="store-tagline">{storeTagline}</h2>
      )}

      <nav>
        <h3>{loggedIn ? `Welcome, ${firstName}!` : "Welcome!"}</h3>

        {" | "}
        <Link to="/">Store</Link>

        {!loggedIn && (
          <>
            {" | "}
            <Link to="/register">Register</Link>
            {" | "}
            <Link to="/login">Login</Link>
          </>
        )}

        {loggedIn && (
          <>
            {" | "}
            <Link to="/profile"><span style={{ fontWeight: "normal", fontFamily: "sans-serif", marginRight: "3px", fontSize: "1.1em" }}>⚙</span>Your Account</Link>
          </>
        )}

        <div className="cart-nav-item">
          <svg className="cart-nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <Link to="/cart">Cart</Link>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>

        {loggedIn && (
          <>
            {" | "}
            <button onClick={handleLogout} style={{ fontSize: "0.85rem", padding: "3px 10px" }}>Logout</button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<StoreFront />} />
        <Route path="/register" element={<Register setLoggedIn={setLoggedIn} />} />
        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        <Route path="/password-reset" element={<ResetPasswordRequest />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardHome />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="suppliers" element={<AdminSuppliersPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
          </Route>
        </Route>
      </Routes>

      <footer>
        <p>All Content © Quick Sip Cafe 2026</p>
        <p>Powered by <span style={{ fontFamily: "'Renner', sans-serif", letterSpacing: "0.09rem", fontWeight: "bold" }}>Orderly</span></p>
      </footer>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;