import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "../App";
import * as auth from "../api/auth";

jest.mock("../api/auth", () => ({
  isAuthenticated: jest.fn(),
  logout: jest.fn(),
}));

function setUser(role, firstName = "Biz") {
  localStorage.setItem(
    "user",
    JSON.stringify({
      firstName,
      role,
    })
  );
}

describe("Admin navigation and layout (US4.2)", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    global.fetch = jest.fn((url) => {
      const requestUrl = String(url);

      if (requestUrl.includes("/api/v1/categories")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ results: [] }),
        });
      }

      if (
        requestUrl.includes("/api/v1/products") &&
        !requestUrl.includes("/api/v1/admin/products")
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ results: [] }),
        });
      }

      if (requestUrl.includes("/api/v1/orders/draft")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: null }),
        });
      }

      if (requestUrl.includes("/api/v1/users/me")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ firstName: "Biz", role: "BUSINESS" }),
        });
      }

      if (requestUrl.includes("/api/v1/admin/products")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("business user sees persistent admin nav links on admin home", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS");

    window.history.pushState({}, "", "/admin");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /admin dashboard/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /dashboard home/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^products$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /suppliers/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inventory/i })).toBeInTheDocument();
  });

  test("business user can route to products and keeps admin layout", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS");

    window.history.pushState({}, "", "/admin/products");
    render(<App />);

    expect(await screen.findByText(/admin products/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /admin dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /dashboard home/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /suppliers/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inventory/i })).toBeInTheDocument();
  });

  test("business user can route to suppliers and keeps admin layout", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS");

    window.history.pushState({}, "", "/admin/suppliers");
    render(<App />);

    expect(await screen.findByText(/admin suppliers/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /admin dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^products$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inventory/i })).toBeInTheDocument();
  });

  test("business user can route to inventory and keeps admin layout", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS");

    window.history.pushState({}, "", "/admin/inventory");
    render(<App />);

    expect(await screen.findByText(/admin inventory/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /admin dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^products$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /suppliers/i })).toBeInTheDocument();
  });

  test("admin nav is not visible to customer", () => {
    auth.isAuthenticated.mockReturnValue(true);
    setUser("CUSTOMER", "Customer");

    window.history.pushState({}, "", "/");
    render(<App />);

    expect(
      screen.queryByRole("link", { name: /admin dashboard/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /dashboard home/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /suppliers/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /inventory/i })
    ).not.toBeInTheDocument();
  });

  test("logged out user is redirected to login from admin route", async () => {
    auth.isAuthenticated.mockReturnValue(false);

    window.history.pushState({}, "", "/admin");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /^login$/i })
    ).toBeInTheDocument();
  });

  test("customer is redirected home from admin route", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    setUser("CUSTOMER", "Customer");

    window.history.pushState({}, "", "/admin/inventory");
    render(<App />);

    expect(await screen.findByText(/filter the menu/i)).toBeInTheDocument();
    expect(screen.queryByText(/admin inventory/i)).not.toBeInTheDocument();
  });
});