import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "../App";
import * as auth from "../api/auth";

jest.mock("../api/auth", () => ({
  isAuthenticated: jest.fn(),
  logout: jest.fn(),
}));

function setUser(role) {
  localStorage.setItem("user", JSON.stringify({ role }));
}

describe("Admin RBAC", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("❌ logged out user cannot access admin route", () => {
    auth.isAuthenticated.mockReturnValue(false);

    window.history.pushState({}, "", "/admin/products");

    render(<App />);

    expect(
        screen.getByRole("heading", { name: /^login$/i })
    ).toBeInTheDocument();
    });

  test("❌ customer cannot access admin route", () => {
    auth.isAuthenticated.mockReturnValue(true);
    setUser("CUSTOMER");

    window.history.pushState({}, "", "/admin/products");

    render(<App />);

    expect(screen.getByText(/filter the menu/i)).toBeInTheDocument();
    expect(screen.queryByText(/admin products/i)).not.toBeInTheDocument();
    });

  test("✅ business user CAN access admin route", () => {
    auth.isAuthenticated.mockReturnValue(true);
    setUser("BUSINESS");

    window.history.pushState({}, "", "/admin/products");

    render(<App />);

    expect(screen.getByText(/admin products/i)).toBeInTheDocument();
  });

  test("❌ admin links not visible to customer", () => {
    auth.isAuthenticated.mockReturnValue(true);
    setUser("CUSTOMER");

    render(<App />);

    expect(
      screen.queryByText(/admin dashboard/i)
    ).not.toBeInTheDocument();
  });

  test("✅ admin links visible to business user", () => {
    auth.isAuthenticated.mockReturnValue(true);
    setUser("BUSINESS");

    render(<App />);

    expect(
      screen.getByText(/admin dashboard/i)
    ).toBeInTheDocument();
  });
});