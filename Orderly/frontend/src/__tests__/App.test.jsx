import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";

jest.mock("../api/auth", () => ({
  logout: jest.fn(),
  isAuthenticated: jest.fn(),
}));

import { logout, isAuthenticated } from "../api/auth";

jest.mock("../pages/StoreFront", () => () => <div>Store Page</div>);
jest.mock("../pages/Auth/Login", () => () => <div>Login Page</div>);
jest.mock("../pages/Auth/Register", () => () => <div>Register Page</div>);
jest.mock("../pages/Auth/Profile", () => () => <div>Profile Page</div>);
jest.mock("../pages/Cart", () => () => <div>Cart Page</div>);
jest.mock("../pages/Auth/ResetPasswordRequest", () => () => <div>Reset Password Request</div>);
jest.mock("../pages/Auth/ResetPassword", () => () => <div>Reset Password</div>);
jest.mock("../pages/ProductPage", () => () => <div>Product Page</div>);
jest.mock("../pages/Orders/OrderHistory", () => () => <div>Order History Page</div>);
jest.mock("../pages/Orders/OrderDetail", () => () => <div>Order Detail Page</div>);
jest.mock("../pages/Checkout", () => () => <div>Checkout Page</div>);
jest.mock("../Admin", () => () => <div>Admin App</div>);
jest.mock("../components/admin/ProtectedAdminRoute", () => () => <div>Protected Admin Route</div>);
jest.mock("../components/admin/AdminLayout", () => () => <div>Admin Layout</div>);
jest.mock("../pages/Admin/AdminDashboardHome", () => () => <div>Admin Dashboard Home</div>);
jest.mock("../pages/Admin/AdminProductsPage", () => () => <div>Admin Products Page</div>);
jest.mock("../pages/Admin/AdminSuppliersPage", () => () => <div>Admin Suppliers Page</div>);
jest.mock("../pages/Admin/AdminInventoryPage", () => () => <div>Admin Inventory Page</div>);

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.alert = jest.fn();
    global.fetch = jest.fn();
  });

  test("removes invalid stored user JSON and falls back safely", () => {
    isAuthenticated.mockReturnValue(false);
    localStorage.setItem("user", "{bad json");

    render(<App />);

    expect(screen.getByText("Welcome!")).toBeInTheDocument();
    expect(localStorage.getItem("user")).toBeNull();
  });

  test("shows logged out navigation", () => {
    isAuthenticated.mockReturnValue(false);

    render(<App />);

    expect(screen.getByText("Welcome!")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  test("shows logged in navigation with user name", () => {
    isAuthenticated.mockReturnValue(true);
    localStorage.setItem(
      "user",
      JSON.stringify({ firstName: "Kenny", role: "CUSTOMER" })
    );

    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ firstName: "Kenny", role: "CUSTOMER" }),
    });

    render(<App />);

    expect(screen.getByText(/welcome, kenny/i)).toBeInTheDocument();
    expect(screen.getByText(/your account/i)).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("does not show cart badge when there is no token and no guest cart email", async () => {
    isAuthenticated.mockReturnValue(false);

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector(".cart-badge")).not.toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  test("sets cart count to zero when fetchCartCount request fails", async () => {
    isAuthenticated.mockReturnValue(false);
    localStorage.setItem("guestCartEmail", "guest@example.com");

    fetch.mockRejectedValue(new Error("network failed"));

    render(<App />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(document.querySelector(".cart-badge")).not.toBeInTheDocument();
  });

  test("logout success clears token and calls logout", async () => {
    isAuthenticated.mockReturnValue(true);
    logout.mockResolvedValue(undefined);

    localStorage.setItem("accessToken", "token");
    localStorage.setItem(
        "user",
        JSON.stringify({ firstName: "Kenny", role: "CUSTOMER" })
    );

    render(<App />);

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
        expect(logout).toHaveBeenCalled();
    });

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(window.alert).toHaveBeenCalledWith("Successfully logged out");
    });

  test("logout failure shows alert with fallback message", async () => {
    isAuthenticated.mockReturnValue(true);
    logout.mockRejectedValue(new Error("Boom"));

    localStorage.setItem("accessToken", "token");
    localStorage.setItem(
      "user",
      JSON.stringify({ firstName: "Kenny", role: "CUSTOMER" })
    );

    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ firstName: "Kenny", role: "CUSTOMER" }),
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(<App />);

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
    });

    expect(window.alert).toHaveBeenCalledWith("Boom");

    consoleSpy.mockRestore();
  });

  test("logout failure uses default message when error has no message", async () => {
    isAuthenticated.mockReturnValue(true);
    logout.mockRejectedValue({});

    localStorage.setItem("accessToken", "token");
    localStorage.setItem(
      "user",
      JSON.stringify({ firstName: "Kenny", role: "CUSTOMER" })
    );

    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ firstName: "Kenny", role: "CUSTOMER" }),
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(<App />);

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
    });

    expect(window.alert).toHaveBeenCalledWith("Logout failed");

    consoleSpy.mockRestore();
  });
});