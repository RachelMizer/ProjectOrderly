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
    expect(
      screen.getByText(/browse and manage the full product catalog/i)
    ).toBeInTheDocument();
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
    expect(
      screen.getByText(/track and update stock levels/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("business user can route to reports and keeps admin layout", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");
    setUser("BUSINESS");

    window.history.pushState({}, "", "/admin/reports");
    render(<App />);

    // ✅ use unique content instead of "Reports"
    expect(await screen.findByText(/generate a report/i)).toBeInTheDocument();

    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();

    expect(
      screen.getByText(/view sales performance, product trends/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });
});