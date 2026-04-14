import "@testing-library/jest-dom";
import { render, screen, within, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Admin from "../Admin";
import * as auth from "../api/auth";

jest.mock("../api/auth", () => ({
  isAuthenticated: jest.fn(),
  logout: jest.fn(),
  getAuthHeaders: jest.fn(() => ({ Authorization: "Bearer fake-business-token" })),
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

function createJsonResponse(data, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    headers: {
      get: (name) =>
        String(name).toLowerCase() === "content-type" ? "application/json" : null,
    },
    json: async () => data,
  });
}

function mockFetch({
  meResponse = {
    firstName: "Biz",
    lastName: "Admin",
    email: "business1@example.com",
    role: "BUSINESS",
  },
  productsResponse = {
    results: [
      {
        id: 1,
        name: "Latte",
        category: { id: 10, name: "Coffee" },
        supplier: { id: 100, name: "Brew Source NC" },
        description: "Espresso with steamed milk",
      },
      {
        id: 2,
        name: "Cake Pop",
        category: { id: 12, name: "Bakery" },
        supplier: { id: 101, name: "Hearth & Heart Bakery" },
        description: "Sweet bakery treat",
      },
    ],
  },
  productDetailResponse = {
    id: 1,
    name: "Latte",
    category: { id: 10, name: "Coffee" },
    supplier: { id: 100, name: "Brew Source NC" },
    description: "Espresso with steamed milk",
    has_variants: true,
    has_modifiers: true,
    imageUrl: "http://127.0.0.1:8000/media/latte.jpg",
  },
  categoriesResponse = {
    results: [
      { id: 10, name: "Coffee" },
      { id: 11, name: "Tea" },
      { id: 12, name: "Bakery" },
    ],
  },
  suppliersResponse = {
    results: [
      { id: 100, name: "Brew Source NC" },
      { id: 101, name: "Hearth & Heart Bakery" },
    ],
  },
  variantsByProduct = {
    1: {
      results: [
        {
          id: 501,
          name: "Small",
          sku: "LATTE-SM",
          unit_price: "4.50",
          stock_quantity: 10,
          reorder_level: 3,
        },
        {
          id: 502,
          name: "Large",
          sku: "LATTE-LG",
          unit_price: "5.50",
          stock_quantity: 5,
          reorder_level: 2,
        },
      ],
    },
    2: {
      results: [],
    },
  },
} = {}) {
  global.fetch = jest.fn((url, options = {}) => {
    const requestUrl = String(url);
    const method = String(options.method || "GET").toUpperCase();

    if (requestUrl.includes("/api/v1/users/me")) {
      return createJsonResponse(meResponse);
    }

    if (
      requestUrl.match(/\/api\/v1\/admin\/products\/\d+$/) &&
      method === "GET"
    ) {
      return createJsonResponse(productDetailResponse);
    }

    if (
      requestUrl.endsWith("/api/v1/admin/products") &&
      method === "GET"
    ) {
      return createJsonResponse(productsResponse);
    }

    if (requestUrl.includes("/api/v1/categories") && method === "GET") {
      return createJsonResponse(categoriesResponse);
    }

    if (requestUrl.includes("/api/v1/admin/suppliers") && method === "GET") {
      return createJsonResponse(suppliersResponse);
    }

    if (
      requestUrl.match(/\/api\/v1\/admin\/products\/\d+\/variants$/) &&
      method === "GET"
    ) {
      const productId = Number(requestUrl.match(/products\/(\d+)\/variants/)?.[1]);
      return createJsonResponse(variantsByProduct[productId] || { results: [] });
    }

    if (
      requestUrl.match(/\/api\/v1\/admin\/products\/\d+$/) &&
      method === "DELETE"
    ) {
      return createJsonResponse({}, true, 204);
    }

    if (
      requestUrl.match(/\/api\/v1\/admin\/products\/\d+\/variants\/\d+$/) &&
      method === "DELETE"
    ) {
      return createJsonResponse({}, true, 204);
    }

    if (
      requestUrl.endsWith("/api/v1/admin/products") &&
      method === "POST"
    ) {
      return createJsonResponse({ id: 999, name: "New Product" }, true, 201);
    }

    if (
      requestUrl.match(/\/api\/v1\/admin\/products\/\d+$/) &&
      method === "PATCH"
    ) {
      return createJsonResponse({ id: 1, name: "Updated Product" }, true, 200);
    }

    if (
      requestUrl.match(/\/api\/v1\/admin\/products\/\d+\/variants$/) &&
      method === "POST"
    ) {
      return createJsonResponse(
        {
          id: 777,
          name: "Medium",
          sku: "LATTE-MD",
          unit_price: "5.00",
          stock_quantity: 12,
          reorder_level: 4,
        },
        true,
        201
      );
    }

    if (
      requestUrl.match(/\/api\/v1\/admin\/products\/\d+\/variants\/\d+$/) &&
      method === "PATCH"
    ) {
      return createJsonResponse(
        {
          id: 501,
          name: "Small Updated",
          sku: "LATTE-SM",
          unit_price: "4.75",
          stock_quantity: 11,
          reorder_level: 3,
        },
        true,
        200
      );
    }

    if (
      requestUrl.endsWith("/api/v1/admin/suppliers") &&
      method === "POST"
    ) {
      return createJsonResponse({ id: 333, name: "New Supplier" }, true, 201);
    }

    return createJsonResponse({});
  });
}

function renderAdminAt(path = "/admin/catalog") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("UX5.2 Admin product management UI", () => {
  const originalLocation = window.location;
  const originalConfirm = window.confirm;
  const originalCreateObjectURL = URL.createObjectURL;

  beforeEach(() => {
    cleanup();
    localStorage.clear();
    jest.clearAllMocks();

    auth.isAuthenticated.mockReturnValue(true);
    auth.logout.mockImplementation(() => {});
    localStorage.setItem("accessToken", "fake-business-token");

    mockFetch();

    delete window.location;
    window.location = { href: "" };

    window.confirm = jest.fn(() => true);
    URL.createObjectURL = jest.fn(() => "blob:preview-image");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  afterAll(() => {
    window.location = originalLocation;
    window.confirm = originalConfirm;
    URL.createObjectURL = originalCreateObjectURL;
  });

  test("catalog route renders product management page and product rows", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Latte")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+ create new product/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+ add supplier/i })).toBeInTheDocument();
    expect(screen.getByText("Cake Pop")).toBeInTheDocument();
    expect(screen.getByText("Brew Source NC")).toBeInTheDocument();
    expect(screen.getByText("Hearth & Heart Bakery")).toBeInTheDocument();
  });

  test("catalog shows empty state when no products are returned", async () => {
    mockFetch({
      productsResponse: { results: [] },
    });

    renderAdminAt("/admin/catalog");

    expect(await screen.findByText(/no products found\./i)).toBeInTheDocument();
  });

  test("catalog search filters visible products", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("Cake Pop")).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/search products/i), "cake");

    expect(screen.queryByText("Latte")).not.toBeInTheDocument();
    expect(screen.getByText("Cake Pop")).toBeInTheDocument();
  });

  test("catalog sort toggles when clicking sortable headers", async () => {
    mockFetch({
      productsResponse: {
        results: [
          {
            id: 2,
            name: "Zebra Cake",
            category: { id: 12, name: "Bakery" },
            supplier: { id: 101, name: "Hearth & Heart Bakery" },
            description: "Bakery item",
          },
          {
            id: 1,
            name: "Americano",
            category: { id: 10, name: "Coffee" },
            supplier: { id: 100, name: "Brew Source NC" },
            description: "Coffee drink",
          },
        ],
      },
    });

    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Zebra Cake")).toBeInTheDocument();
    expect(screen.getByText("Americano")).toBeInTheDocument();

    const nameHeader = screen.getByRole("columnheader", { name: /name/i });

    await userEvent.click(nameHeader);

    let rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Americano")).toBeInTheDocument();

    await userEvent.click(nameHeader);

    rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Zebra Cake")).toBeInTheDocument();
  });

  test("create new product button routes to create product form", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /\+ create new product/i })
    );

    expect(
      await screen.findByRole("heading", { name: /create a new product/i })
    ).toBeInTheDocument();

    expect(await screen.findByPlaceholderText("Product name")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("SKU")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("0.00")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Leave blank if not tracked")).toBeInTheDocument();
    expect(
      await screen.findByPlaceholderText("e.g. Small, 12oz, Default (uses product name if blank)")
    ).toBeInTheDocument();
  });

  test("add supplier button routes to supplier form", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /\+ add supplier/i })
    );

    expect(
      await screen.findByRole("heading", { name: /add new supplier/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/supplier name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contact@supplier\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
  });

  test("edit button routes to edit product form and hides create-only variant fields", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    const latteRow = screen.getByText("Latte").closest("tr");
    await userEvent.click(
      within(latteRow).getByRole("button", { name: /^edit$/i })
    );

    expect(
      await screen.findByRole("heading", { name: /edit product/i })
    ).toBeInTheDocument();

    expect(await screen.findByDisplayValue("Latte")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Espresso with steamed milk")).toBeInTheDocument();

    expect(screen.queryByPlaceholderText("SKU")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("0.00")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Leave blank if not tracked")).not.toBeInTheDocument();
  });

  test("create form submits product and optional first variant, then returns to catalog", async () => {
    renderAdminAt("/admin/catalog/new");

    expect(
      await screen.findByRole("heading", { name: /create a new product/i })
    ).toBeInTheDocument();

    await userEvent.type(
      await screen.findByPlaceholderText("Product name"),
      "Vanilla Latte"
    );

    const selects = await screen.findAllByRole("combobox");
    await userEvent.selectOptions(selects[0], "10");
    await userEvent.selectOptions(selects[1], "100");

    await userEvent.type(await screen.findByPlaceholderText("SKU"), "VAN-LATTE-SM");
    await userEvent.type(await screen.findByPlaceholderText("0.00"), "5.25");
    await userEvent.type(
      await screen.findByPlaceholderText("Leave blank if not tracked"),
      "8"
    );
    await userEvent.type(
      await screen.findByPlaceholderText("e.g. Small, 12oz, Default (uses product name if blank)"),
      "Small"
    );

    await userEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/admin/products",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/admin/products/999/variants",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    expect(await screen.findByText("Latte")).toBeInTheDocument();
  });

  test("edit form submits update and returns to catalog", async () => {
    renderAdminAt("/admin/catalog/edit/1");

    expect(
      await screen.findByRole("heading", { name: /edit product/i })
    ).toBeInTheDocument();

    const nameInput = await screen.findByDisplayValue("Latte");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Updated Latte");

    await userEvent.click(screen.getByRole("button", { name: /update product/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/admin/products/1",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    expect(await screen.findByText("Latte")).toBeInTheDocument();
  });

  test("supplier form submits and returns to catalog", async () => {
    renderAdminAt("/admin/suppliers/new");

    expect(
      await screen.findByRole("heading", { name: /add new supplier/i })
    ).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/supplier name/i), "Local Roaster");
    await userEvent.type(screen.getByPlaceholderText(/contact@supplier\.com/i), "hello@localroaster.com");
    await userEvent.type(screen.getByPlaceholderText(/phone number/i), "9195558888");

    await userEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/admin/suppliers",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    expect(await screen.findByText("Latte")).toBeInTheDocument();
  });

  test("delete product removes row after confirmation", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    const latteRow = screen.getByText("Latte").closest("tr");
    await userEvent.click(
      within(latteRow).getByRole("button", { name: /^delete$/i })
    );

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    await waitFor(() => {
      expect(screen.queryByText("Latte")).not.toBeInTheDocument();
    });
  });

  test("edit options expands variant panel and loads existing variants", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    const latteRow = screen.getByText("Latte").closest("tr");
    await userEvent.click(
      within(latteRow).getByRole("button", { name: /edit options/i })
    );

    expect(
      await screen.findByRole("heading", { name: /options for latte/i })
    ).toBeInTheDocument();

    expect(await screen.findByText("Small")).toBeInTheDocument();
    expect(screen.getByText("Large")).toBeInTheDocument();
    expect(screen.getByText("LATTE-SM")).toBeInTheDocument();
  });

  test("variant panel shows empty state when selected product has no variants", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Cake Pop")).toBeInTheDocument();

    const cakePopRow = screen.getByText("Cake Pop").closest("tr");
    await userEvent.click(
      within(cakePopRow).getByRole("button", { name: /edit options/i })
    );

    expect(
      await screen.findByRole("heading", { name: /options for cake pop/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/no variants found for this product\./i)
    ).toBeInTheDocument();
  });

  test("add option creates a new variant", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    const latteRow = screen.getByText("Latte").closest("tr");
    await userEvent.click(
      within(latteRow).getByRole("button", { name: /edit options/i })
    );

    expect(
      await screen.findByRole("heading", { name: /options for latte/i })
    ).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/variant name/i), "Medium");
    await userEvent.type(screen.getByPlaceholderText("SKU"), "LATTE-MD");
    await userEvent.type(screen.getByPlaceholderText("Unit price"), "5.00");
    await userEvent.type(screen.getByPlaceholderText("Stock quantity"), "12");
    await userEvent.type(screen.getByPlaceholderText("Reorder level"), "4");

    await userEvent.click(screen.getByRole("button", { name: /add option/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/admin/products/1/variants",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    expect(await screen.findByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("LATTE-MD")).toBeInTheDocument();
  });

  test("editing a variant prepopulates form and saves changes", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    const latteRow = screen.getByText("Latte").closest("tr");
    await userEvent.click(
      within(latteRow).getByRole("button", { name: /edit options/i })
    );

    expect(await screen.findByText("Small")).toBeInTheDocument();

    const smallRow = screen.getByText("Small").closest("tr");
    await userEvent.click(
      within(smallRow).getByRole("button", { name: /^edit$/i })
    );

    expect(
      await screen.findByRole("heading", { name: /edit option for latte/i })
    ).toBeInTheDocument();

    const variantName = screen.getByDisplayValue("Small");
    await userEvent.clear(variantName);
    await userEvent.type(variantName, "Small Updated");

    const unitPrice = screen.getByDisplayValue("4.50");
    await userEvent.clear(unitPrice);
    await userEvent.type(unitPrice, "4.75");

    await userEvent.click(screen.getByRole("button", { name: /save option/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/admin/products/1/variants/501",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    expect(await screen.findByText("Small Updated")).toBeInTheDocument();
  });

  test("delete variant removes it after confirmation", async () => {
    renderAdminAt("/admin/catalog");

    expect(await screen.findByText("Latte")).toBeInTheDocument();

    const latteRow = screen.getByText("Latte").closest("tr");
    await userEvent.click(
      within(latteRow).getByRole("button", { name: /edit options/i })
    );

    expect(await screen.findByText("Small")).toBeInTheDocument();

    const smallRow = screen.getByText("Small").closest("tr");
    await userEvent.click(
      within(smallRow).getByRole("button", { name: /^delete$/i })
    );

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this variant? This action cannot be undone."
    );

    await waitFor(() => {
      expect(screen.queryByText("Small")).not.toBeInTheDocument();
    });
  });

  test("create product form supports image preview and remove image", async () => {
    renderAdminAt("/admin/catalog/new");

    expect(
      await screen.findByRole("heading", { name: /create a new product/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByPlaceholderText("Product name")
    ).toBeInTheDocument();

    const file = new File(["image-bytes"], "latte.png", { type: "image/png" });
    const fileInput = document.querySelector('input[type="file"][name="image"]');

    expect(fileInput).not.toBeNull();

    await userEvent.upload(fileInput, file);

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(await screen.findByAltText(/product preview/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /remove image/i }));
    expect(screen.queryByAltText(/product preview/i)).not.toBeInTheDocument();
  });

  test("cancel from create product form returns to catalog", async () => {
    renderAdminAt("/admin/catalog/new");

    expect(
      await screen.findByRole("heading", { name: /create a new product/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByPlaceholderText("Product name")
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(await screen.findByText("Latte")).toBeInTheDocument();
  });

  test("cancel from supplier form returns to catalog", async () => {
    renderAdminAt("/admin/suppliers/new");

    expect(
      await screen.findByRole("heading", { name: /add new supplier/i })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(await screen.findByText("Latte")).toBeInTheDocument();
  });
});