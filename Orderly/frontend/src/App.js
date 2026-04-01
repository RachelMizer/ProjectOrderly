import "./App.css";

// React
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
import Profile from "./pages/Auth/Profile";

// Storefront & Customer Pages
import StoreFront from "./pages/StoreFront";
import ProductPage from "./pages/ProductPage";
import OrderHistory from "./pages/Orders/OrderHistory";
import OrderDetails from "./pages/Orders/OrderDetail";

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

function AppContent() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  const user = getStoredUser();
  const role = user?.role?.toUpperCase();
  const firstName = user?.firstName || "";

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const profile = await response.json();
          const existingUser = getStoredUser();

          const mergedUser = {
            ...existingUser,
            ...profile,
            role: existingUser?.role || profile.role,
          };

          localStorage.setItem("user", JSON.stringify(mergedUser));
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    if (loggedIn) {
      loadProfile();
    }
  }, [loggedIn]);

  async function handleLogout() {
    try {
      await logout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setLoggedIn(false);
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
        <h2>Your pause, perfected.</h2>
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
            {" | "}
            <Link to="/password-reset">Forgot Password</Link>
          </>
        )}

        {loggedIn && (
          <>
            {" | "}
            <Link to="/profile">Profile</Link>
            {" | "}
            <Link to="/order-history">Order History</Link>

            {role === "BUSINESS" && (
              <>
                {" | "}
                <Link to="/admin">Admin Dashboard</Link>
              </>
            )}

            {" | "}
            <button onClick={handleLogout}>Logout</button>
          </>
        )}

        <img src="/img/ico_cart.png" alt="cart" />
        <p className="cart-PH">Cart</p>
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
        <p>© Quick Sip Cafe 2026</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;