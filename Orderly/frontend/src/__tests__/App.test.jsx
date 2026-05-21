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
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
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

    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("orders/draft"),
      expect.any(Object)
    );
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

  test("renders login route", () => {
    isAuthenticated.mockReturnValue(false);

    window.history.pushState({}, "", "/login");

    render(<App />);

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("renders register route", () => {
    isAuthenticated.mockReturnValue(false);

    window.history.pushState({}, "", "/register");

    render(<App />);

    expect(screen.getByText("Register Page")).toBeInTheDocument();
  });

  test("renders product detail route", () => {
    isAuthenticated.mockReturnValue(false);

    window.history.pushState({}, "", "/product/1");

    render(<App />);

    expect(screen.getByText("Product Page")).toBeInTheDocument();
  });

  test("renders cart route", () => {
    isAuthenticated.mockReturnValue(false);

    window.history.pushState({}, "", "/cart");

    render(<App />);

    expect(screen.getByText("Cart Page")).toBeInTheDocument();
  });

  test("renders checkout route", () => {
    isAuthenticated.mockReturnValue(false);

    window.history.pushState({}, "", "/checkout");

    render(<App />);

    expect(screen.getByText("Checkout Page")).toBeInTheDocument();
  });

  test("renders order history route", () => {
    isAuthenticated.mockReturnValue(true);

    localStorage.setItem(
      "user",
      JSON.stringify({
        firstName:"Kenny",
        role:"CUSTOMER"
      })
    );

    window.history.pushState({}, "", "/orders");

    render(<App />);

    expect(
      screen.getByText(/your account/i)
    ).toBeInTheDocument();
  });

  test("renders order detail route", () => {
    isAuthenticated.mockReturnValue(true);

    localStorage.setItem(
      "user",
      JSON.stringify({ firstName: "Kenny", role: "CUSTOMER" })
    );

    window.history.pushState({}, "", "/orders/123");

    render(<App />);

    expect(screen.getByText("Order Detail Page")).toBeInTheDocument();
  });

  test("reset password request route renders app shell", () => {
    window.history.pushState({}, "", "/reset-password-request");

    render(<App />);

    expect(
      screen.getByText(/welcome!/i)
    ).toBeInTheDocument();
  });

  test("reset password route renders app shell", () => {
    window.history.pushState({}, "", "/reset-password/token123");

    render(<App />);

    expect(
      screen.getByText(/welcome!/i)
    ).toBeInTheDocument();
  });
  test("business user sees account navigation", () => {
    isAuthenticated.mockReturnValue(true);

    localStorage.setItem(
      "user",
      JSON.stringify({
        firstName:"Kenny",
        role:"STORE_MANAGER"
      })
    );

    render(<App />);

    expect(
      screen.getByText(/your account/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/logout/i)
    ).toBeInTheDocument();
  });

  test("renders admin route", () => {
    isAuthenticated.mockReturnValue(true);

    localStorage.setItem(
      "user",
      JSON.stringify({
        firstName:"Kenny",
        role:"STORE_MANAGER"
      })
    );

    window.history.pushState({}, "", "/admin");

    render(<App />);

    expect(
      screen.getByText("Admin App")
    ).toBeInTheDocument();
  });
});