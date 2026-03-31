import "./App.css";

import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";

import { logout, isAuthenticated } from "./api/auth";
import { handleApiError } from "./api/handleApiError";

// Safe user parsing helper
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
}

// Protected admin route
function ProtectedAdminRoute({ children }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "BUSINESS") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminProductsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function testAccess() {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/admin/products",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 403) {
          throw { status: 403 };
        }
      } catch (error) {
        handleApiError(error, navigate);
      }
    }

    testAccess();
  }, [navigate]);

  return <h2>Admin Products</h2>;
}

function AppContent() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  const user = getStoredUser();
  const role = user?.role;

  async function handleLogout() {
    try {
      await logout();

      // Clear all auth-related storage
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
    <div>
      <h1>Orderly frontend running...</h1>

      <nav>
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

            {role === "BUSINESS" && (
              <>
                {" | "}
                <Link to="/admin/products">Admin Products</Link>
                {" | "}
                <Link to="/admin/suppliers">Admin Suppliers</Link>
                {" | "}
                <Link to="/admin/inventory">Admin Inventory</Link>
              </>
            )}

            {" | "}
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<h2>Home Page</h2>} />

        <Route
          path="/register"
          element={<Register setLoggedIn={setLoggedIn} />}
        />

        <Route
          path="/login"
          element={<Login setLoggedIn={setLoggedIn} />}
        />

        <Route path="/password-reset" element={<ResetPasswordRequest />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/admin/products"
          element={
            <ProtectedAdminRoute>
              <AdminProductsPage />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/suppliers"
          element={
            <ProtectedAdminRoute>
              <h2>Admin Suppliers</h2>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/inventory"
          element={
            <ProtectedAdminRoute>
              <h2>Admin Inventory</h2>
            </ProtectedAdminRoute>
          }
        />
      </Routes>
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