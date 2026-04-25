import "@testing-library/jest-dom";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Admin from "../Admin";
import * as auth from "../api/auth";

jest.mock("../api/auth", () => ({
  isAuthenticated: jest.fn(),
  logout: jest.fn(),
  getAuthHeaders: jest.fn(() => ({
    Authorization: "Bearer fake-business-token",
  })),
}));

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
  productsResponse = { results: [] },
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

    if (requestUrl.includes("/api/v1/products?pageSize=100")) {
      return makeJsonResponse(productsResponse);
    }

    if (requestUrl.includes("/api/v1/admin/inventory")) {
      return makeJsonResponse(inventoryResponse);
    }

    if (requestUrl.includes("orders/years")) {
      return makeJsonResponse([]);
    }

    return makeJsonResponse({});
  });
}

function renderAdminAt(path = "/admin") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("UX5.1 Admin navigation shell, layout, and RBAC", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    cleanup();
    localStorage.clear();
    jest.clearAllMocks();
    auth.logout.mockImplementation(() => {});
    mockFetch();

    delete window.location;
    window.location = { href: "" };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  test("logged out user is redirected to admin login", async () => {
    auth.isAuthenticated.mockReturnValue(false);

    renderAdminAt("/admin");

    expect(
      await screen.findByRole("heading", { name: /orderly/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/welcome,\s*biz!/i)).not.toBeInTheDocument();
  });

  test("non-business user is redirected to admin login", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-customer-token");

    mockFetch({
      meResponse: {
        firstName: "Customer",
        email: "customer@example.com",
        role: "CUSTOMER",
      },
    });

    renderAdminAt("/admin/inventory");

    expect(
      await screen.findByRole("heading", { name: /orderly/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/ingredient-controlled beverage availability/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/welcome,\s*customer!/i)).not.toBeInTheDocument();
  });

  test("business user can access admin dashboard", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin");

    expect(await screen.findByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /dashboard home/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^reports$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^inventory$/i })).toBeInTheDocument();
  });

  test("admin shell shows all active routes on dashboard", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin");

    expect(
      await screen.findByRole("heading", { name: /dashboard home/i })
    ).toBeInTheDocument();

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

    expect(
      screen.getByRole("link", { name: /account settings/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/^logout$/i)).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("admin link states are routable to reports, inventory, catalog, and orders", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

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

    renderAdminAt("/admin");

    expect(
      await screen.findByRole("heading", { name: /dashboard home/i })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: /^reports$/i }));
    expect(await screen.findByText(/generate a report/i)).toBeInTheDocument();
    expect(screen.getByText(/sales summary/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: /^inventory$/i }));
    expect(
      await screen.findByText(/toggle ingredient availability to control which beverages are offered/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/inventory management/i)).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: /supply inventory/i })
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("link", { name: /product catalog/i })
    );
    expect(
      await screen.findByPlaceholderText(/search products/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/\+ create new product/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: /^orders$/i }));
    expect(
      await screen.findByRole("heading", { name: /^all orders$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/recent orders/i)).toBeInTheDocument();
  });

  test("layout persists on reports route", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/reports");

    expect(await screen.findByText(/generate a report/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^inventory$/i })).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("layout persists on inventory route", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

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

    renderAdminAt("/admin/inventory");

    expect(
      await screen.findByText(/toggle ingredient availability to control which beverages are offered/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/inventory management/i)).toBeInTheDocument();
    expect(screen.getByText(/loading inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^orders$/i })).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("layout persists on catalog route", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/catalog");

    expect(
      await screen.findByPlaceholderText(/search products/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^reports$/i })).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("layout persists on orders route", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/orders");

    expect(
      await screen.findByRole("heading", { name: /^all orders$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^inventory$/i })).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("dashboard shows deferred inbox control and recent files placeholder", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin");

    expect(
      await screen.findByRole("heading", { name: /dashboard home/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/pick up where you left off/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/no recent activity yet\. visit a section to get started\./i)
    ).toBeInTheDocument();

    expect(screen.getByText(/pick up where you left off/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no recent activity yet\. visit a section to get started\./i)
    ).toBeInTheDocument();
  });

  test("reports sidebar shows current sidebar content", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/reports");

    expect(await screen.findByText(/generate a report/i)).toBeInTheDocument();
    expect(
      screen.getByText(/view sales performance, product trends, and business metrics/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /return to dashboard/i })
    ).toHaveAttribute("href", "/admin");
  });

  test("inventory sidebar shows current sidebar content", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    mockFetch({
      inventoryResponse: [],
    });

    renderAdminAt("/admin/inventory");

    expect(
      await screen.findByText(/toggle ingredient availability to control which beverages are offered/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/track and update stock levels for all inventory items/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /return to dashboard/i })
    ).toHaveAttribute("href", "/admin");
  });

  test("catalog sidebar shows current sidebar content", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/catalog");

    expect(
      await screen.findByPlaceholderText(/search products/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/browse and manage the full product catalog/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /return to dashboard/i })
    ).toHaveAttribute("href", "/admin");
  });

  test("orders sidebar shows deferred actions as visible but inactive", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/orders");

    expect(
      await screen.findByRole("heading", { name: /^all orders$/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/recent orders/i)).toBeInTheDocument();
    expect(screen.getByText(/no orders yet/i)).toBeInTheDocument();
  });

  test("account settings page renders account information and permissions", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    mockFetch({
      meResponse: {
        firstName: "Biz",
        lastName: "Admin",
        email: "business1@example.com",
        role: "BUSINESS",
      },
    });

    renderAdminAt("/admin/account");

    expect(await screen.findByRole("heading", { name: /biz admin/i })).toBeInTheDocument();
    expect(screen.getByText(/business1@example\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/manage inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/manage product catalog/i)).toBeInTheDocument();
    expect(screen.getByText(/manage orders/i)).toBeInTheDocument();
  });

  test("logout clears auth and routes user to admin login", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin");

    expect(await screen.findByText(/welcome,\s*biz!/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText(/^logout$/i));

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe("/admin/login");
  });
});