import "./App.css";

import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import StoreFront from "./pages/StoreFront";
import { useEffect } from "react";
import ProductPage from "./pages/ProductPage";
import { logout, isAuthenticated } from "./api/auth";
import CartPage from "./pages/Cart";






function AppContent() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const firstName = storedUser?.firstName || "";

  useEffect(() => {
  async function loadProfile() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/users/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        </>
      )}

{loggedIn && (
  <>
    {" | "}
    <Link to="/profile">Profile</Link>
    {" | "}
    <button onClick={handleLogout}>Logout</button>
  </>
)}

<img src="/img/ico_cart.png" alt="cart" />
<Link to="/cart">Cart</Link>
</nav>


      <Routes>
        <Route path="/" element={<StoreFront />} />
        <Route path="/register" element={<Register setLoggedIn={setLoggedIn} />} />
        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        <Route path="/password-reset" element={<ResetPasswordRequest />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    <footer><p>© Quick Sip Cafe 2026</p></footer>
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
