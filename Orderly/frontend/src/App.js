import "./App.css";

import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import ResetPasswordRequest from "./pages/Auth/ResetPasswordRequest";
import ResetPassword from "./pages/Auth/ResetPassword";
import Profile from "./pages/Auth/Profile";

import OrderHistory from "./pages/Orders/OrderHistory";

import { logout, isAuthenticated } from "./api/auth";
import OrderDetails from "./pages/Orders/OrderDetail";

function AppContent() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  async function handleLogout() {
    try {
      await logout();
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
            <Link to="/order-history">Order History</Link>


            {" | "}
            <Link to="/profile">Profile</Link>
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
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/profile" element={<Profile />} />
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