import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminProductsPage from "../pages/Admin/AdminProductsPage";
import * as auth from "../api/auth";
import { handleApiError } from "../api/handleApiError";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../api/auth", () => ({
  isAuthenticated: jest.fn(),
  getAuthHeaders: jest.fn(() => ({
    Authorization: "Bearer fake-token",
  })),
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

global.fetch = jest.fn();

function setBusinessUser() {
  localStorage.setItem("user", JSON.stringify({ role: "STORE_MANAGER" }));
  localStorage.setItem("accessToken", "fake-token");
  auth.isAuthenticated.mockReturnValue(true);
}

function makeResponse({
  ok = true,
  status = 200,
  body = {},
  contentType = "application/json",
}) {
  return Promise.resolve({
    ok,
    status,
    headers: {
      get: (name) =>
        name?.toLowerCase() === "content-type" ? contentType : null,
    },
    json: async () => body,
  });
}

function setupFetch({
  products = [],
  categories = [],
  suppliers = [],
  overrides = [],
} = {}) {
  const oneTimeOverrides = [...overrides];

  fetch.mockImplementation((input, init = {}) => {
    const url = (typeof input === "string" ? input : input?.url) || "";
    const method = (init?.method || input?.method || "GET").toUpperCase();

    const overrideIndex = oneTimeOverrides.findIndex(
      (o) => url.includes(o.path) && method === o.method.toUpperCase()
    );

    if (overrideIndex !== -1) {
      const override = oneTimeOverrides.splice(overrideIndex, 1)[0];
      return makeResponse(override.response);
    }

    if (method === "GET" && url.includes("/admin/products")) {
      return makeResponse({
        status: 200,
        body: { results: products },
      });
    }

    if (method === "GET" && url.includes("/categories")) {
      return makeResponse({
        status: 200,
        body: { results: categories },
      });
    }

    if (method === "GET" && url.includes("/admin/suppliers")) {
      return makeResponse({
        status: 200,
        body: { results: suppliers },
      });
    }

    return makeResponse({
      status: 200,
      body: { results: [] },
    });
  });
}

describe("Admin Products CRUD UI", () => {
  const originalConfirm = window.confirm;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  test("loads and displays product list", async () => {
    setBusinessUser();

    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: 1,
          supplier: 1,
          description: "Espresso with milk",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/latte/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/espresso with milk/i)).toBeInTheDocument();
  });

  test("shows empty state when no products exist", async () => {
    setBusinessUser();

    setupFetch({
      products: [],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  test("create button navigates to create product page", async () => {
    setBusinessUser();

    setupFetch({
      products: [],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    await screen.findByText(/no products found/i);

    fireEvent.click(
      screen.getByRole("button", { name: /\+ create new product/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/admin/catalog/new");
  });

  test("edit button navigates to edit product page", async () => {
    setBusinessUser();

    setupFetch({
      products: [
        {
          id: 1,
          name: "House Coffee",
          category: 1,
          supplier: 1,
          description: "Original description",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/house coffee/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/catalog/edit/1");
  });

  test("add supplier button navigates to add supplier page", async () => {
    setBusinessUser();

    setupFetch({
      products: [],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    await screen.findByText(/no products found/i);

    fireEvent.click(
      screen.getByRole("button", { name: /\+ add supplier/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/admin/suppliers/new");
  });

  test("deletes a product and removes it from the UI", async () => {
    setBusinessUser();

    setupFetch({
      products: [
        {
          id: 1,
          name: "Delete Me",
          category: 1,
          supplier: 1,
          description: "Remove this item",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      overrides: [
        {
          method: "DELETE",
          path: "/admin/products/1",
          response: {
            ok: true,
            status: 204,
            body: {},
            contentType: "",
          },
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/delete me/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText(/delete me/i)).not.toBeInTheDocument();
    });
  });

  test("shows delete error when backend delete fails", async () => {
    setBusinessUser();

    setupFetch({
      products: [
        {
          id: 1,
          name: "Cannot Delete",
          category: 1,
          supplier: 1,
          description: "Delete should fail",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      overrides: [
        {
          method: "DELETE",
          path: "/admin/products/1",
          response: {
            ok: false,
            status: 500,
            body: {
              message: "Failed to delete product",
            },
          },
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/cannot delete/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(window.confirm).toHaveBeenCalled();

    expect(
      await screen.findByText(/failed to delete product/i)
    ).toBeInTheDocument();
  });

  test("403 on initial load triggers unauthorized handling", async () => {
    setBusinessUser();

    setupFetch({
      overrides: [
        {
          method: "GET",
          path: "/admin/products",
          response: {
            ok: false,
            status: 403,
            body: {},
          },
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
    });
  });
});