import "./App.css";

import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import StoreFront from "./pages/StoreFront";

import { logout, isAuthenticated } from "./api/auth";

function AppContent() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const firstName = storedUser?.first_name || "";

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
    <div className="wrapper">
      <header>
        <img src="/img/HDlogo.png" alt="Happy Desk Logo" />
        <h3>Make your desk happy today</h3>
      </header>

      <nav>

        <h3>{loggedIn ? `Welcome, ${firstName}!` : "Welcome!"}</h3>

        <Link to="/">Home</Link>

        {!loggedIn && (
          <>
            {" | "}
            <Link to="/register">Register</Link>
            {" | "}
            <Link to="/login">Login</Link>
            {" | "}
            <img src="/img/ico_cart.png" alt="cart" /><p className="cart-PH" title="not an active link">Cart</p>
          </>
        )}

      {/* <Link to="/password-reset">Forgot Password</Link> */}

        {loggedIn && (
          <>
            {" | "}
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<StoreFront />} />
        <Route path="/register" element={<Register setLoggedIn={setLoggedIn} />} />
        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        <Route path="/password-reset" element={<ResetPasswordRequest />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
