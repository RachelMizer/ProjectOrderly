import "@testing-library/jest-dom";
import { render, screen, cleanup } from "@testing-library/react";
import App from "../App";
import * as auth from "../api/auth";

jest.mock("../api/auth", () => ({
  isAuthenticated: jest.fn(),
  logout: jest.fn(),
  getAuthHeaders: jest.fn(() => ({ Authorization: "Bearer fake-token" })),
}));

function setUser(role, firstName = "Biz") {
  localStorage.setItem("user", JSON.stringify({ role, firstName }));
}

function mockFetch({
  meResponse = {
    firstName: "Biz",
    lastName: "Admin",
    email: "business1@example.com",
    role: "BUSINESS",
  },
  categoriesResponse = { results: [] },
  storefrontProductsResponse = { results: [] },
  adminProductsResponse = { results: [] },
  suppliersResponse = { results: [] },
} = {}) {
  global.fetch = jest.fn((url) => {
    const requestUrl = String(url);

    if (requestUrl.includes("/api/v1/users/me")) {
      return Promise.resolve({
        ok: true,
        json: async () => meResponse,
      });
    }

    if (requestUrl.includes("/api/v1/categories")) {
      return Promise.resolve({
        ok: true,
        json: async () => categoriesResponse,
      });
    }

    if (
      requestUrl.includes("/api/v1/products?pageSize=100") ||
      (requestUrl.includes("/api/v1/products") &&
        !requestUrl.includes("/api/v1/admin/products"))
    ) {
      return Promise.resolve({
        ok: true,
        json: async () => storefrontProductsResponse,
      });
    }

    if (requestUrl.includes("/api/v1/admin/products")) {
      return Promise.resolve({
        ok: true,
        json: async () => adminProductsResponse,
      });
    }

    if (requestUrl.includes("/api/v1/admin/suppliers")) {
      return Promise.resolve({
        ok: true,
        json: async () => suppliersResponse,
      });
    }

    if (requestUrl.includes("/api/v1/orders/draft")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: null }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
  });
}

describe("Admin RBAC", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    jest.clearAllMocks();
    mockFetch();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  test("logged out user cannot access admin route", async () => {
    auth.isAuthenticated.mockReturnValue(false);

    window.history.pushState({}, "", "/admin/catalog");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /orderly/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/product catalog/i)
    ).not.toBeInTheDocument();
  });

  test("customer cannot access admin route", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-customer-token");
    setUser("CUSTOMER", "Customer");

    mockFetch({
      meResponse: {
        firstName: "Customer",
        lastName: "User",
        email: "customer@example.com",
        role: "CUSTOMER",
      },
    });

    window.history.pushState({}, "", "/admin/catalog");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /orderly/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/product catalog/i)
    ).not.toBeInTheDocument();
  });

  test("business user can access admin route", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS", "Biz");

    window.history.pushState({}, "", "/admin/catalog");
    render(<App />);

    expect(
      await screen.findByPlaceholderText(/search products/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\+ create new product/i })
    ).toBeInTheDocument();
  });

  test("admin links not visible to customer on storefront", () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-customer-token");
    setUser("CUSTOMER", "Customer");

    window.history.pushState({}, "", "/");
    render(<App />);

    expect(screen.getByText(/filters/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /product catalog/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^reports$/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^inventory$/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^orders$/i })
    ).not.toBeInTheDocument();
  });

  test("admin links visible to business user", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS", "Biz");

    window.history.pushState({}, "", "/admin");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /dashboard home/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^reports$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^inventory$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /product catalog/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^orders$/i })
    ).toBeInTheDocument();
  });
});