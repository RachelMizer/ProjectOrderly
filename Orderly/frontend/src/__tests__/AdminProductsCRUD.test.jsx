import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminProductsPage from "../pages/Admin/AdminProductsPage";
import * as auth from "../api/auth";

jest.mock("../api/auth", () => ({
  isAuthenticated: jest.fn(),
}));

global.fetch = jest.fn();

function setBusinessUser() {
  localStorage.setItem("user", JSON.stringify({ role: "BUSINESS" }));
  localStorage.setItem("accessToken", "fake-token");
  auth.isAuthenticated.mockReturnValue(true);
}

// AdminProductsPage expects arrays or { results: [...] }, not { data: [...] }
function mockInitialLoad(products = [], categories = [], suppliers = []) {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => products,
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => categories,
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => suppliers,
    });
}

describe("Admin Products CRUD UI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.alert = jest.fn();
  });

  test("loads and displays product list", async () => {
    setBusinessUser();

    mockInitialLoad(
      [{ id: 1, name: "Test Product", category: 1, supplier: 1, description: "Test desc" }],
      [{ id: 1, name: "Coffee" }],
      [{ id: 1, name: "Good Supply" }]
    );

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/test product/i)).toBeInTheDocument();
  });

  test("create product updates UI immediately", async () => {
    setBusinessUser();

    mockInitialLoad(
      [],
      [{ id: 1, name: "Coffee" }],
      [{ id: 1, name: "Good Supply" }]
    );

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 2,
        name: "New Product",
        category: 1,
        supplier: 1,
        description: "Created in test",
      }),
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    await screen.findByText(/no products found/i);

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
    target: { value: "New Product" },
    });

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "1" } });

    fireEvent.change(screen.getByPlaceholderText(/description/i), {
    target: { value: "Created in test" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^create product$/i }));

    expect(await screen.findByText(/new product/i)).toBeInTheDocument();
  });

  test("validation errors show in UI", async () => {
    setBusinessUser();

    mockInitialLoad(
      [],
      [{ id: 1, name: "Coffee" }],
      [{ id: 1, name: "Good Supply" }]
    );

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: "Name is required",
      }),
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    await screen.findByText(/no products found/i);

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /^create product$/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  test("403 triggers alert", async () => {
    setBusinessUser();

    fetch.mockRejectedValueOnce({ status: 403 });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/unable to load page data|admin products/i)
    ).toBeInTheDocument();

    expect(window.alert).toHaveBeenCalledWith(
      "You do not have permission to access this page."
    );
  });
});