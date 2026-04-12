import "@testing-library/jest-dom";
import { render, screen, within, cleanup } from "@testing-library/react";
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

function mockFetch({
  meResponse = {
    firstName: "Biz",
    lastName: "Admin",
    email: "business1@example.com",
    role: "BUSINESS",
  },
  categoriesResponse = { results: [] },
  productsResponse = { results: [] },
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

    if (requestUrl.includes("/api/v1/products?pageSize=100")) {
      return Promise.resolve({
        ok: true,
        json: async () => productsResponse,
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
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
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
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
      screen.queryByRole("heading", { name: /^inventory$/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  test("business user can access admin dashboard", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin");

    expect(await screen.findByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /dashboard home/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("admin shell shows all active routes on dashboard", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin");

    expect(
      await screen.findByRole("heading", { name: /dashboard home/i })
    ).toBeInTheDocument();

    const nav = screen.getByRole("navigation");
    expect(
      within(nav).getByRole("link", { name: /^reports$/i })
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /^inventory$/i })
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /product catalog/i })
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /^orders$/i })
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

    renderAdminAt("/admin");

    expect(
      await screen.findByRole("heading", { name: /dashboard home/i })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: /^reports$/i }));
    expect(
      await screen.findByRole("heading", { name: /^reports$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/recent reports/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: /^inventory$/i }));
    expect(
      await screen.findByRole("heading", { name: /^inventory$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/recent inventory reports/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("link", { name: /product catalog/i })
    );
    expect(
      await screen.findByPlaceholderText(/search products/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/recent catalogs/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: /^orders$/i }));
    expect(
      await screen.findByRole("heading", { name: /^orders$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/recent orders/i)).toBeInTheDocument();
  });

  test("layout persists on reports route", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/reports");

    expect(
      await screen.findByRole("heading", { name: /^reports$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("layout persists on inventory route", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/inventory");

    expect(
      await screen.findByRole("heading", { name: /^inventory$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
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
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("layout persists on orders route", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/orders");

    expect(
      await screen.findByRole("heading", { name: /^orders$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/welcome,\s*biz!/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText(/user\s*\|\s*biz/i)).toBeInTheDocument();
  });

  test("dashboard shows deferred inbox control and recent files placeholder", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin");

    expect(
      await screen.findByRole("heading", { name: /dashboard home/i })
    ).toBeInTheDocument();

    const inbox = screen.getByText(/inbox \(0\)/i);
    expect(inbox.tagName).toBe("SPAN");
    expect(inbox).toHaveClass("dash-inbox-disabled");

    expect(screen.getByText(/pick up where you left off/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no recently accessed files\./i)
    ).toBeInTheDocument();
  });

  test("reports sidebar shows deferred actions as visible but inactive", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/reports");

    expect(
      await screen.findByRole("heading", { name: /^reports$/i })
    ).toBeInTheDocument();

    const openReport = screen.getByText(/open report/i);
    const generateReport = screen.getByText(/generate report/i);

    expect(openReport.tagName).toBe("SPAN");
    expect(generateReport.tagName).toBe("SPAN");
    expect(openReport).toHaveClass("sidebar-link-disabled");
    expect(generateReport).toHaveClass("sidebar-link-disabled");
    expect(screen.getByRole("link", { name: /go back/i })).toHaveAttribute(
      "href",
      "/admin"
    );
  });

  test("inventory sidebar shows deferred actions as visible but inactive", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/inventory");

    expect(
      await screen.findByRole("heading", { name: /^inventory$/i })
    ).toBeInTheDocument();

    const openInventoryReport = screen.getByText(/open inventory report/i);
    expect(openInventoryReport.tagName).toBe("SPAN");
    expect(openInventoryReport).toHaveClass("sidebar-link-disabled");
  });

  test("catalog sidebar shows deferred actions as visible but inactive", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/catalog");

    expect(
      await screen.findByPlaceholderText(/search products/i)
    ).toBeInTheDocument();

    const openCatalog = screen.getByText(/open catalog/i);
    const productLookup = screen.getByText(/product lookup/i);

    expect(openCatalog.tagName).toBe("SPAN");
    expect(productLookup.tagName).toBe("SPAN");
    expect(openCatalog).toHaveClass("sidebar-link-disabled");
    expect(productLookup).toHaveClass("sidebar-link-disabled");
  });

  test("orders sidebar shows deferred actions as visible but inactive", async () => {
    auth.isAuthenticated.mockReturnValue(true);
    localStorage.setItem("accessToken", "fake-business-token");

    renderAdminAt("/admin/orders");

    expect(
      await screen.findByRole("heading", { name: /^orders$/i })
    ).toBeInTheDocument();

    const openOrder = screen.getByText(/open order/i);
    const searchHistory = screen.getByText(/search history/i);
    const returnsRefunds = screen.getByText(/returns & refunds/i);
    const shipping = screen.getByText(/shipping/i);

    for (const el of [openOrder, searchHistory, returnsRefunds, shipping]) {
      expect(el.tagName).toBe("SPAN");
      expect(el).toHaveClass("sidebar-link-disabled");
    }
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

    expect(
      await screen.findByRole("heading", { name: /account settings/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/biz admin/i)).toBeInTheDocument();
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