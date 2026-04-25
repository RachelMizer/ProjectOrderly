import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

import { handleApiError } from "../api/handleApiError";
import { MemoryRouter } from "react-router-dom";
import AdminProductsPage from "../pages/Admin/AdminProductsPage";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../api/auth", () => ({
  getAuthHeaders: jest.fn(() => ({
    Authorization: "Bearer fake-token",
  })),
}));

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
  variantsByProduct = {},
  overrides = [],
} = {}) {
  const oneTimeOverrides = [...overrides];

  global.fetch = jest.fn((input, init = {}) => {
    const url = (typeof input === "string" ? input : input?.url) || "";
    const method = (init?.method || input?.method || "GET").toUpperCase();

    const overrideIndex = oneTimeOverrides.findIndex(
      (o) => url.includes(o.path) && method === o.method.toUpperCase()
    );

    if (overrideIndex !== -1) {
      const override = oneTimeOverrides.splice(overrideIndex, 1)[0];
      return makeResponse(override.response);
    }

    if (
      method === "GET" &&
      url.includes("/api/v1/admin/products/") &&
      url.includes("/variants")
    ) {
      const match = url.match(/\/admin\/products\/(\d+)\/variants/);
      const productId = Number(match?.[1]);
      return makeResponse({
        status: 200,
        body: { results: variantsByProduct[productId] || [] },
      });
    }

    if (method === "GET" && url.includes("/api/v1/admin/products")) {
      return makeResponse({
        status: 200,
        body: { results: products },
      });
    }

    if (method === "GET" && url.includes("/api/v1/categories")) {
      return makeResponse({
        status: 200,
        body: { results: categories },
      });
    }

    if (method === "GET" && url.includes("/api/v1/admin/suppliers")) {
      return makeResponse({
        status: 200,
        body: { results: suppliers },
      });
    }

    return makeResponse({
      status: 200,
      body: {},
    });
  });
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminProductsPage />
    </MemoryRouter>
  );
}

function getProductTable() {
  return screen.getByRole("table");
}

describe("AdminProductsPage", () => {
  const originalConfirm = window.confirm;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("accessToken", "fake-token");
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  test("shows loading state", () => {
    global.fetch = jest.fn(() => new Promise(() => {}));

    renderPage();

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  test("renders products table", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    renderPage();

    const table = await screen.findByRole("table");

    expect(within(table).getByText(/^latte$/i)).toBeInTheDocument();
    expect(within(table).getByText(/^coffee$/i)).toBeInTheDocument();
    expect(within(table).getByText(/^main supplier$/i)).toBeInTheDocument();
    expect(within(table).getByText(/hot drink/i)).toBeInTheDocument();
  });

  test("shows empty state", async () => {
    setupFetch({
      products: [],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    renderPage();

    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  test("shows error message when products fail to load", async () => {
    setupFetch({
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      overrides: [
        {
          method: "GET",
          path: "/api/v1/admin/products",
          response: {
            ok: false,
            status: 500,
            body: {},
          },
        },
      ],
    });

    renderPage();

    expect(
      await screen.findByText(/failed to load products/i)
    ).toBeInTheDocument();
  });

  test("403 on initial load calls unauthorized handler", async () => {
    setupFetch({
      overrides: [
        {
          method: "GET",
          path: "/api/v1/admin/products",
          response: {
            ok: false,
            status: 403,
            body: {},
          },
        },
      ],
    });

    renderPage();

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
    });
  });

  test("create new product button navigates to create product page", async () => {
    setupFetch({
      products: [],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    renderPage();

    await screen.findByText(/no products found/i);

    fireEvent.click(
      screen.getByRole("button", { name: /\+ create new product/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/admin/catalog/new");
  });

  test("add supplier button navigates to supplier page", async () => {
    setupFetch({
      products: [],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    renderPage();

    await screen.findByText(/no products found/i);

    fireEvent.click(
      screen.getByRole("button", { name: /\+ add supplier/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/admin/suppliers/new");
  });

  test("edit button navigates to edit product page", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "House Coffee",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Original description",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    renderPage();

    await screen.findByText(/original description/i);

    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/catalog/edit/1");
  });

  test("shows backend validation error on variant save", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: { 1: [] },
      overrides: [
        {
          method: "POST",
          path: "/api/v1/admin/products/1/variants",
          response: {
            ok: false,
            status: 400,
            body: { message: "Variant already exists" },
          },
        },
      ],
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    await screen.findByText(/options for latte/i);

    fireEvent.change(screen.getByPlaceholderText(/variant name/i), {
      target: { value: "Small" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^sku$/i), {
      target: { value: "LATTE-S" },
    });
    fireEvent.change(screen.getByPlaceholderText(/unit price/i), {
      target: { value: "4.50" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add option/i }));

    expect(
      await screen.findByText(/variant already exists/i)
    ).toBeInTheDocument();
  });

  test("deletes a product and removes it from the UI", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Delete Me",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Remove this item",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      overrides: [
        {
          method: "DELETE",
          path: "/api/v1/admin/products/1",
          response: {
            ok: true,
            status: 204,
            body: {},
            contentType: "",
          },
        },
      ],
    });

    renderPage();

    await screen.findByText(/remove this item/i);
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText(/^delete me$/i)).not.toBeInTheDocument();
    });
  });

  test("shows delete error when backend delete fails", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Cannot Delete",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Delete should fail",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      overrides: [
        {
          method: "DELETE",
          path: "/api/v1/admin/products/1",
          response: {
            ok: false,
            status: 500,
            body: {},
          },
        },
      ],
    });

    renderPage();

    await screen.findByText(/delete should fail/i);
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(window.confirm).toHaveBeenCalled();

    expect(
      await screen.findByText(/failed to delete product/i)
    ).toBeInTheDocument();
  });

  test("manage options loads variants and shows variant table", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: {
        1: [
          {
            id: 101,
            name: "Large",
            sku: "LATTE-L",
            unit_price: "5.50",
            stock_quantity: 10,
            reorder_level: 3,
          },
        ],
      },
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));

    expect(await screen.findByText(/options for latte/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading variants/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/^large$/i)).toBeInTheDocument();
    expect(screen.getByText(/latte-l/i)).toBeInTheDocument();
  });

  test("manage options shows empty variant state", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: {
        1: [],
      },
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));

    expect(
      await screen.findByText(/no variants found for this product/i)
    ).toBeInTheDocument();
  });

  test("hide options collapses variant section", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: {
        1: [],
      },
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    await screen.findByText(/options for latte/i);

    fireEvent.click(screen.getByRole("button", { name: /hide options/i }));

    await waitFor(() => {
      expect(screen.queryByText(/options for latte/i)).not.toBeInTheDocument();
    });
  });

  test("creates a variant and updates UI immediately", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: { 1: [] },
      overrides: [
        {
          method: "POST",
          path: "/api/v1/admin/products/1/variants",
          response: {
            ok: true,
            status: 201,
            body: {
              id: 201,
              name: "Medium",
              sku: "LATTE-M",
              unit_price: "5.00",
              stock_quantity: 8,
              reorder_level: 2,
            },
          },
        },
      ],
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    await screen.findByText(/options for latte/i);

    fireEvent.change(screen.getByPlaceholderText(/variant name/i), {
      target: { value: "Medium" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^sku$/i), {
      target: { value: "LATTE-M" },
    });
    fireEvent.change(screen.getByPlaceholderText(/unit price/i), {
      target: { value: "5.00" },
    });
    fireEvent.change(screen.getByPlaceholderText(/stock quantity/i), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByPlaceholderText(/reorder level/i), {
      target: { value: "2" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add option/i }));

    expect(await screen.findByText(/^medium$/i)).toBeInTheDocument();
    expect(screen.getByText(/latte-m/i)).toBeInTheDocument();
  });

  test("editing a variant populates form and saves changes", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: {
        1: [
          {
            id: 101,
            name: "Large",
            sku: "LATTE-L",
            unit_price: "5.50",
            stock_quantity: 10,
            reorder_level: 3,
          },
        ],
      },
      overrides: [
        {
          method: "PATCH",
          path: "/api/v1/admin/products/1/variants/101",
          response: {
            ok: true,
            status: 200,
            body: {
              id: 101,
              name: "Large Updated",
              sku: "LATTE-L",
              unit_price: "5.75",
              stock_quantity: 12,
              reorder_level: 4,
            },
          },
        },
      ],
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    await screen.findByText(/^large$/i);

    const variantTable = screen.getAllByRole("table")[1];
    fireEvent.click(within(variantTable).getByRole("button", { name: /^edit$/i }));

    expect(
      screen.getByRole("heading", { name: /edit option for latte/i })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/variant name/i), {
      target: { value: "Large Updated" },
    });
    fireEvent.change(screen.getByPlaceholderText(/unit price/i), {
      target: { value: "5.75" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save option/i }));

    expect(await screen.findByText(/large updated/i)).toBeInTheDocument();
  });

  test("variant validation error is shown", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: { 1: [] },
      overrides: [
        {
          method: "POST",
          path: "/api/v1/admin/products/1/variants",
          response: {
            ok: false,
            status: 400,
            body: {
              unit_price: ["Must be greater than 0"],
            },
          },
        },
      ],
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    await screen.findByText(/options for latte/i);

    fireEvent.change(screen.getByPlaceholderText(/variant name/i), {
      target: { value: "Small" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^sku$/i), {
      target: { value: "LATTE-S" },
    });
    fireEvent.change(screen.getByPlaceholderText(/unit price/i), {
      target: { value: "0" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add option/i }));

    expect(
      await screen.findByText(/unit_price: must be greater than 0/i)
    ).toBeInTheDocument();
  });

  test("variant load failure is shown", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      overrides: [
        {
          method: "GET",
          path: "/api/v1/admin/products/1/variants",
          response: {
            ok: false,
            status: 500,
            body: {},
          },
        },
      ],
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));

    expect(
      await screen.findByText(/failed to load variants/i)
    ).toBeInTheDocument();
  });

  test("deletes a variant and removes it from the UI", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: {
        1: [
          {
            id: 101,
            name: "Large",
            sku: "LATTE-L",
            unit_price: "5.50",
            stock_quantity: 10,
            reorder_level: 3,
          },
        ],
      },
      overrides: [
        {
          method: "DELETE",
          path: "/api/v1/admin/products/1/variants/101",
          response: {
            ok: true,
            status: 204,
            body: {},
            contentType: "",
          },
        },
      ],
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    await screen.findByText(/^large$/i);

    const variantTable = screen.getAllByRole("table")[1];
    const deleteButtons = within(variantTable).getAllByRole("button", {
      name: /^delete$/i,
    });
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText(/latte-l/i)).not.toBeInTheDocument();
    });
  });

  test("deleting a product resets open variant state", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: { 1: [] },
      overrides: [
        {
          method: "DELETE",
          path: "/api/v1/admin/products/1",
          response: {
            ok: true,
            status: 204,
            body: {},
            contentType: "",
          },
        },
      ],
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    await screen.findByText(/options for latte/i);

    const table = getProductTable();
    fireEvent.click(within(table).getByRole("button", { name: /^delete$/i }));

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText(/^latte$/i)).not.toBeInTheDocument();
    });
  });

  test("shows auth error path when initial load returns 401", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      });

    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401 }),
        mockNavigate
      );
    });
  });

  test("shows fallback page-load error when initial fetch throws without message", async () => {
    fetch.mockRejectedValueOnce({});

    render(<AdminProductsPage />);

    expect(await screen.findByText(/unable to load page data/i)).toBeInTheDocument();
  });

  test("shows explicit load-products error", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      });

    render(<AdminProductsPage />);

    expect(await screen.findByText(/failed to load products/i)).toBeInTheDocument();
  });

  test("search filters products by description text", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 1,
              name: "Latte",
              description: "Espresso with milk",
              category: { id: 1, name: "Coffee" },
              supplier: { id: 1, name: "Acme" },
              has_variants: true,
              has_modifiers: false,
            },
            {
              id: 2,
              name: "Tea",
              description: "Green tea",
              category: { id: 2, name: "Tea" },
              supplier: null,
              has_variants: false,
              has_modifiers: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      });

    render(<AdminProductsPage />);

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "espresso" },
    });

    expect(screen.getByText("Latte")).toBeInTheDocument();
    expect(screen.queryByText("Tea")).not.toBeInTheDocument();
  });

  test("sort toggles when the same column header is clicked twice", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 2,
              name: "Tea",
              description: "Green tea",
              category: { id: 2, name: "Tea" },
              supplier: null,
              has_variants: false,
              has_modifiers: false,
            },
            {
              id: 1,
              name: "Latte",
              description: "Espresso with milk",
              category: { id: 1, name: "Coffee" },
              supplier: { id: 1, name: "Acme" },
              has_variants: true,
              has_modifiers: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      });

    render(<AdminProductsPage />);

    expect(await screen.findByText("Tea", { selector: ".td-name" }))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole("columnheader", { name: /name/i }));
    fireEvent.click(screen.getByRole("columnheader", { name: /name/i }));

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Tea");
    expect(rows[2]).toHaveTextContent("Latte");
  });

  test("loads variants when expanding a product row", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 1,
              name: "Latte",
              description: "Espresso with milk",
              category: { id: 1, name: "Coffee" },
              supplier: { id: 1, name: "Acme" },
              has_variants: true,
              has_modifiers: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 10,
              name: "Large",
              sku: "LATTE-L",
              unit_price: "5.99",
              stock_quantity: 12,
            },
          ],
        }),
      });

    render(<AdminProductsPage />);

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));

    expect(await screen.findByText("Large")).toBeInTheDocument();
    expect(screen.getByText("LATTE-L")).toBeInTheDocument();
  });

  test("shows fallback variant load error when variants fetch throws", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 1,
              name: "Latte",
              description: "Espresso with milk",
              category: { id: 1, name: "Coffee" },
              supplier: { id: 1, name: "Acme" },
              has_variants: true,
              has_modifiers: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockRejectedValueOnce({});

    render(<AdminProductsPage />);

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));

    expect(await screen.findByText(/unable to load variants/i)).toBeInTheDocument();
  });

  test("deletes a product successfully", async () => {
    window.confirm = jest.fn(() => true);

    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 1,
              name: "Latte",
              description: "Espresso with milk",
              category: { id: 1, name: "Coffee" },
              supplier: { id: 1, name: "Acme" },
              has_variants: true,
              has_modifiers: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: jest.fn(),
      });

    render(<AdminProductsPage />);

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText("Latte")).not.toBeInTheDocument();
    });
  });

  test("does not delete a product when confirmation is cancelled", async () => {
    window.confirm = jest.fn(() => false);

    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 1,
              name: "Latte",
              description: "Espresso with milk",
              category: { id: 1, name: "Coffee" },
              supplier: { id: 1, name: "Acme" },
              has_variants: true,
              has_modifiers: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      });

    render(<AdminProductsPage />);

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  test("shows delete failure message when product delete fails", async () => {
    window.confirm = jest.fn(() => true);

    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 1,
              name: "Latte",
              description: "Espresso with milk",
              category: { id: 1, name: "Coffee" },
              supplier: { id: 1, name: "Acme" },
              has_variants: true,
              has_modifiers: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      });

    render(<AdminProductsPage />);

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(await screen.findByText(/failed to delete product/i)).toBeInTheDocument();
  });

  test("shows variant delete failure message", async () => {
    window.confirm = jest.fn(() => true);

    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 1,
              name: "Latte",
              description: "Espresso with milk",
              category: { id: 1, name: "Coffee" },
              supplier: { id: 1, name: "Acme" },
              has_variants: true,
              has_modifiers: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 10,
              name: "Large",
              sku: "LATTE-L",
              unit_price: "5.99",
              stock_quantity: 12,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      });

    render(<AdminProductsPage />);

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    expect(await screen.findByText("Large")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[1]);

    expect(await screen.findByText(/failed to delete variant/i)).toBeInTheDocument();
  });

  test("clear filters resets product search", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: 1,
          supplier: 1,
          description: "Espresso drink",
        },
        {
          id: 2,
          name: "Green Tea",
          category: 2,
          supplier: 1,
          description: "Tea drink",
        },
      ],
      categories: [
        { id: 1, name: "Coffee" },
        { id: 2, name: "Tea" },
      ],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    renderPage();

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search products/i), {
      target: { value: "latte" },
    });

    expect(screen.queryByText("Green Tea")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(screen.getByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("Green Tea")).toBeInTheDocument();
  });

  test("export and print buttons trigger actions", async () => {
    window.print = jest.fn();

    setupFetch({
      products: [],
      categories: [],
      suppliers: [],
    });

    renderPage();

    await screen.findByText(/no products found/i);

    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/export");

    fireEvent.click(screen.getByRole("button", { name: /print/i }));
    expect(window.print).toHaveBeenCalled();
  });

  test("renders fallback category supplier and description values", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Mystery Product",
          category: 99,
          supplier: 88,
          description: "",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    renderPage();

    const table = await screen.findByRole("table");

    expect(within(table).getByText(/mystery product/i)).toBeInTheDocument();
    expect(within(table).getAllByText("—")).toHaveLength(3);
  });

  test("shows category load error", async () => {
    setupFetch({
      products: [],
      suppliers: [],
      overrides: [
        {
          method: "GET",
          path: "/api/v1/categories",
          response: {
            ok: false,
            status: 500,
            body: {},
          },
        },
      ],
    });

    renderPage();

    expect(
      await screen.findByText(/failed to load categories/i)
    ).toBeInTheDocument();
  });

  test("shows supplier load error", async () => {
    setupFetch({
      products: [],
      categories: [],
      overrides: [
        {
          method: "GET",
          path: "/api/v1/admin/suppliers",
          response: {
            ok: false,
            status: 500,
            body: {},
          },
        },
      ],
    });

    renderPage();

    expect(
      await screen.findByText(/failed to load suppliers/i)
    ).toBeInTheDocument();
  });

  test("does not delete product when confirmation is cancelled", async () => {
    window.confirm = jest.fn(() => false);

    setupFetch({
      products: [
        {
          id: 1,
          name: "Keep Product",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Do not delete",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
    });

    renderPage();

    await screen.findByText(/do not delete/i);

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(screen.getByText(/keep product/i)).toBeInTheDocument();
  });

  test("does not delete variant when confirmation is cancelled", async () => {
    window.confirm = jest.fn(() => false);

    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: {
        1: [
          {
            id: 101,
            name: "Large",
            sku: "LATTE-L",
            unit_price: "5.50",
            stock_quantity: 10,
            reorder_level: 3,
          },
        ],
      },
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    await screen.findByText(/^large$/i);

    const variantTable = screen.getAllByRole("table")[1];

    fireEvent.click(
      within(variantTable).getByRole("button", { name: /^delete$/i })
    );

    expect(window.confirm).toHaveBeenCalled();
    expect(screen.getByText(/latte-l/i)).toBeInTheDocument();
  });

  test("shows variant delete error when backend delete fails", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: {
        1: [
          {
            id: 101,
            name: "Large",
            sku: "LATTE-L",
            unit_price: "5.50",
            stock_quantity: 10,
            reorder_level: 3,
          },
        ],
      },
      overrides: [
        {
          method: "DELETE",
          path: "/api/v1/admin/products/1/variants/101",
          response: {
            ok: false,
            status: 500,
            body: {},
          },
        },
      ],
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    await screen.findByText(/^large$/i);

    const variantTable = screen.getAllByRole("table")[1];

    fireEvent.click(
      within(variantTable).getByRole("button", { name: /^delete$/i })
    );

    expect(
      await screen.findByText(/failed to delete variant/i)
    ).toBeInTheDocument();
  });

  test("cancel button resets variant form", async () => {
    setupFetch({
      products: [
        {
          id: 1,
          name: "Latte",
          category: { id: 1, name: "Coffee" },
          supplier: { id: 1, name: "Main Supplier" },
          description: "Hot drink",
        },
      ],
      categories: [{ id: 1, name: "Coffee" }],
      suppliers: [{ id: 1, name: "Main Supplier" }],
      variantsByProduct: { 1: [] },
    });

    renderPage();

    await screen.findByText(/hot drink/i);
    fireEvent.click(screen.getByRole("button", { name: /edit options/i }));
    await screen.findByText(/options for latte/i);

    const nameInput = screen.getByPlaceholderText(/variant name/i);

    fireEvent.change(nameInput, {
      target: { value: "Small" },
    });

    expect(nameInput).toHaveValue("Small");

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(nameInput).toHaveValue("");
  });
});