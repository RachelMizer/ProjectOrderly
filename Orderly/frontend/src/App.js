import "./App.css";

import axios from "axios";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";

import { logout, isAuthenticated } from "./api/auth";

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/")
      .then((response) => {
        console.log("Backend connected:", response.data);
      })
      .catch((error) => {
        console.error("Connection error:", error);
      });
  }, []);

  async function handleLogout() {
    try {
      await logout();
      alert("Successfully logged out");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message || "Logout failed");
    }
  }

  const loggedIn = isAuthenticated();

  return (
    <div>
      <h1>Orderly frontend running...</h1>

      <nav>
        <Link to="/">Home</Link> |{" "}

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
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<h2>Home Page</h2>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
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