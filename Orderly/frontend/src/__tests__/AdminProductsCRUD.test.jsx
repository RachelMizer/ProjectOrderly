import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminProductsPage from "../pages/Admin/AdminProductsPage";
import * as auth from "../api/auth";

jest.mock("../api/auth", () => ({
  isAuthenticated: jest.fn(),
  getAuthHeaders: jest.fn(() => ({
    Authorization: "Bearer fake-token",
  })),
}));

global.fetch = jest.fn();

function setBusinessUser() {
  localStorage.setItem("user", JSON.stringify({ role: "BUSINESS" }));
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

function getFormSelects() {
  return screen.getAllByRole("combobox");
}

describe("Admin Products CRUD UI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.alert = jest.fn();
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

  test("creates a product and updates UI immediately", async () => {
    setBusinessUser();

    setupFetch({
      products: [],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      overrides: [
        {
          method: "POST",
          path: "/admin/products",
          response: {
            ok: true,
            status: 201,
            body: {
              id: 2,
              name: "Mocha",
              category: 1,
              supplier: 1,
              description: "Chocolate espresso drink",
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

    await screen.findByText(/no products found/i);

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: "Mocha" },
    });

    const selects = getFormSelects();
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "1" } });

    fireEvent.change(screen.getByPlaceholderText(/description/i), {
      target: { value: "Chocolate espresso drink" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^create product$/i }));

    await waitFor(() => {
      expect(screen.getByText(/mocha/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/chocolate espresso drink/i)).toBeInTheDocument();
  });

  test("enters edit mode and updates a product in the UI", async () => {
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
      overrides: [
        {
          method: "PATCH",
          path: "/admin/products/1",
          response: {
            ok: true,
            status: 200,
            body: {
              id: 1,
              name: "House Coffee Updated",
              category: 1,
              supplier: 1,
              description: "Updated description",
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

    expect(await screen.findByText(/house coffee/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

    expect(screen.getByText(/edit product/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: "House Coffee Updated" },
    });

    fireEvent.change(screen.getByPlaceholderText(/description/i), {
      target: { value: "Updated description" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^update product$/i }));

    await waitFor(() => {
      expect(screen.getByText(/house coffee updated/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/updated description/i)).toBeInTheDocument();
    expect(screen.queryByText(/^house coffee$/i)).not.toBeInTheDocument();
  });

  test("cancel edit resets form and returns to create mode", async () => {
    setBusinessUser();

    setupFetch({
      products: [
        {
          id: 1,
          name: "Chai Tea Latte",
          category: 1,
          supplier: 1,
          description: "Spiced tea",
        },
      ],
      categories: [{ id: 1, name: "Tea" }],
      suppliers: [{ id: 1, name: "Tea Supplier" }],
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/chai tea latte/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    expect(screen.getByText(/edit product/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: "Temporary Name" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^create product$/i })
      ).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/name/i)).toHaveValue("");
    expect(screen.getByText(/chai tea latte/i)).toBeInTheDocument();
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

    await waitFor(() => {
      expect(screen.queryByText(/delete me/i)).not.toBeInTheDocument();
    });
  });

  test("shows backend validation error in the UI", async () => {
    setBusinessUser();

    setupFetch({
      products: [],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      overrides: [
        {
          method: "POST",
          path: "/admin/products",
          response: {
            ok: false,
            status: 400,
            body: {
              message: "Name already exists",
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

    await screen.findByText(/no products found/i);

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: "Duplicate Product" },
    });

    const selects = getFormSelects();
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "1" } });

    fireEvent.change(screen.getByPlaceholderText(/description/i), {
      target: { value: "Duplicate description" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^create product$/i }));

    expect(await screen.findByText(/name already exists/i)).toBeInTheDocument();
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
      expect(window.alert).toHaveBeenCalledWith(
        "You do not have permission to access this page."
      );
    });
  });
});