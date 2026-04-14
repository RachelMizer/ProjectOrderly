import "@testing-library/jest-dom";
import { render, screen, cleanup } from "@testing-library/react";
import App from "../App";
import * as auth from "../api/auth";

jest.mock("../api/auth", () => ({
  isAuthenticated: jest.fn(),
  logout: jest.fn(),
  getAuthHeaders: jest.fn(() => ({
    Authorization: "Bearer fake-business-token",
  })),
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

function makeJsonResponse(body, ok = true) {
  return Promise.resolve({
    ok,
    headers: {
      get: (name) =>
        String(name).toLowerCase() === "content-type"
          ? "application/json"
          : null,
    },
    json: async () => body,
  });
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
  inventoryResponse = [],
} = {}) {
  global.fetch = jest.fn((url) => {
    const requestUrl = String(url);

    if (requestUrl.includes("/api/v1/users/me")) {
      return makeJsonResponse(meResponse);
    }

    if (requestUrl.includes("/api/v1/categories")) {
      return makeJsonResponse(categoriesResponse);
    }

    if (
      requestUrl.includes("/api/v1/products?pageSize=100") ||
      (requestUrl.includes("/api/v1/products") &&
        !requestUrl.includes("/api/v1/admin/products"))
    ) {
      return makeJsonResponse(storefrontProductsResponse);
    }

    if (requestUrl.includes("/api/v1/admin/products")) {
      return makeJsonResponse(adminProductsResponse);
    }

    if (requestUrl.includes("/api/v1/admin/suppliers")) {
      return makeJsonResponse(suppliersResponse);
    }

    if (requestUrl.includes("/api/v1/admin/inventory")) {
      return makeJsonResponse(inventoryResponse);
    }

    if (requestUrl.includes("/api/v1/orders/draft")) {
      return makeJsonResponse({ id: null });
    }

    return makeJsonResponse({});
  });
}

describe("Admin navigation and layout (US4.2)", () => {
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

  test("business user sees persistent admin nav links on admin home", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS");

    window.history.pushState({}, "", "/admin");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /dashboard home/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^reports$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^inventory$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /product catalog/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^orders$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /account settings/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/^logout$/i)).toBeInTheDocument();
  });

  test("business user can route to catalog and keeps admin layout", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS");

    window.history.pushState({}, "", "/admin/catalog");
    render(<App />);

    const elements = await screen.findAllByText(/product catalog/i);
    expect(elements.length).toBeGreaterThan(0);

    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText(/recent catalogs/i)).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("business user can route to inventory and keeps admin layout", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS");

    mockFetch({
      inventoryResponse: [
        {
          id: 1,
          name: "Milk",
          stock_quantity: 10,
          reorder_level: 2,
          unit_of_measure: "l",
          affected_products: ["Latte"],
        },
      ],
    });

    window.history.pushState({}, "", "/admin/inventory");
    render(<App />);

    expect(
      await screen.findByText(/ingredient-controlled beverage availability/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /count-based inventory/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText(/recent inventory reports/i)).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("business user can route to reports and keeps admin layout", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS");

    window.history.pushState({}, "", "/admin/reports");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /^reports$/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText(/recent reports/i)).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("business user can route to orders and keeps admin layout", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS");

    window.history.pushState({}, "", "/admin/orders");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /^orders$/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText(/recent orders/i)).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("admin nav is not visible to customer on storefront", () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-customer-token");
    setUser("CUSTOMER", "Customer");

    window.history.pushState({}, "", "/");
    render(<App />);

    expect(screen.getByText(/filter the menu/i)).toBeInTheDocument();
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

  test("logged out user is redirected to storefront from admin route", async () => {
    auth.isAuthenticated.mockReturnValue(false);

    window.history.pushState({}, "", "/admin");
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
      screen.queryByRole("heading", { name: /dashboard home/i })
    ).not.toBeInTheDocument();
  });

  test("customer cannot access admin route and remains on storefront", async () => {
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

    window.history.pushState({}, "", "/admin/inventory");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /orderly/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /^inventory$/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^inventory$/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /product catalog/i })
    ).not.toBeInTheDocument();
  });
});