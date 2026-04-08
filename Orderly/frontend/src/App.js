import "./App.css";

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import ResetPasswordRequest from "./pages/Auth/ResetPasswordRequest";
import ResetPassword from "./pages/Auth/ResetPassword";
import StoreFront from "./pages/StoreFront";

import ProductPage from "./pages/ProductPage";
import Profile from "./pages/Auth/Profile";

import OrderHistory from "./pages/Orders/OrderHistory";
import OrderDetails from "./pages/Orders/OrderDetail";

import CartPage from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin from "./Admin";

import { logout, isAuthenticated } from "./api/auth";


function AppContent() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [cartCount, setCartCount] = useState(0);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const firstName = storedUser?.firstName || "";

  // Load profile on login
  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const profile = await response.json();
          localStorage.setItem("user", JSON.stringify(profile));
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    if (loggedIn) {
      loadProfile();
    }
  }, [loggedIn]);

  // Fetch cart count
  async function fetchCartCount() {
    const token = localStorage.getItem("accessToken");
    const guestEmail = !token ? localStorage.getItem("guestCartEmail") : null;

    if (!token && !guestEmail) { setCartCount(0); return; }

    try {
      const draftRes = await fetch("http://localhost:8000/api/v1/orders/draft", {
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
        ? `http://localhost:8000/api/v1/orders/${draft.id}?guestEmail=${encodeURIComponent(guestEmail)}`
        : `http://localhost:8000/api/v1/orders/${draft.id}`;

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
        <img src="/img/QSlogo.png" alt="Quick Sip Cafe" />
      </header>

      <nav>
        <h3>{loggedIn ? `Welcome, ${firstName}!` : "Welcome!"}</h3>
        {" | "}
        <Link to="/">Home</Link>

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
            <Link to="/profile">Profile</Link>
            {" | "}
            <Link to="/order-history">Orders</Link>
            {" | "}
            <button onClick={handleLogout}>Logout</button>
          </>
        )}

        <div className="cart-nav-item">
          <img src="/img/ico_cart.png" alt="cart" />
          <Link to="/cart">Cart</Link>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>
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
      </Routes>

      <footer>
        <p>All Content © Quick Sip Cafe 2026</p>
        <p>Powered by Orderly</p>
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