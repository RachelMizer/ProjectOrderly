import { Navigate, Outlet } from "react-router-dom";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
}

export default function ProtectedAdminRoute() {
  const user = getStoredUser();
  const role = user?.role?.toUpperCase();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "BUSINESS" && role !== "EXECUTIVE") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}