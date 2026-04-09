import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminProductsPage from "../pages/Admin/AdminProductsPage";
import * as auth from "../api/auth";
import { handleApiError } from "../api/handleApiError";

jest.mock("../api/auth", () => ({
  isAuthenticated: jest.fn(),
  getAuthHeaders: jest.fn(),
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

global.fetch = jest.fn();

function mockJsonResponse(body, { status = 200, ok = true, contentType = "application/json" } = {}) {
  return Promise.resolve({
    ok,
    status,
    json: async () => body,
    headers: {
      get: jest.fn((name) =>
        name?.toLowerCase() === "content-type" ? contentType : null
      ),
    },
  });
}

function setBusinessUser() {
  localStorage.setItem("user", JSON.stringify({ role: "BUSINESS" }));
  localStorage.setItem("accessToken", "fake-token");
  auth.isAuthenticated.mockReturnValue(true);
  auth.getAuthHeaders.mockReturnValue({
    Authorization: "Bearer fake-token",
  });
}

function mockInitialLoad(products = [], categories = [], suppliers = []) {
  fetch
    .mockImplementationOnce(() =>
      mockJsonResponse({ results: products }, { status: 200, ok: true })
    )
    .mockImplementationOnce(() =>
      mockJsonResponse({ results: categories }, { status: 200, ok: true })
    )
    .mockImplementationOnce(() =>
      mockJsonResponse({ results: suppliers }, { status: 200, ok: true })
    );
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
      [
        {
          id: 1,
          name: "Test Product",
          category: 1,
          supplier: 1,
          description: "Test desc",
        },
      ],
      [{ id: 1, name: "Coffee" }],
      [{ id: 1, name: "Good Supply" }]
    );

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/test product/i)).toBeInTheDocument();
    expect(screen.getAllByText(/coffee/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/good supply/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/test desc/i)).toBeInTheDocument();
  });

  test("shows no products found when product list is empty", async () => {
    setBusinessUser();

    mockInitialLoad(
      [],
      [{ id: 1, name: "Coffee" }],
      [{ id: 1, name: "Good Supply" }]
    );

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  test("create product updates UI immediately", async () => {
    setBusinessUser();

    mockInitialLoad(
      [],
      [{ id: 1, name: "Coffee" }],
      [{ id: 1, name: "Good Supply" }]
    );

    fetch.mockImplementationOnce(() =>
      mockJsonResponse(
        {
          id: 2,
          name: "New Product",
          category: 1,
          supplier: 1,
          description: "Created in test",
          has_variants: true,
          has_modifiers: false,
        },
        { status: 201, ok: true }
      )
    );

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
    expect(screen.getByText(/created in test/i)).toBeInTheDocument();
  });

  test("validation errors show in UI", async () => {
    setBusinessUser();

    mockInitialLoad(
      [],
      [{ id: 1, name: "Coffee" }],
      [{ id: 1, name: "Good Supply" }]
    );

    fetch.mockImplementationOnce(() =>
      mockJsonResponse(
        { message: "Name is required" },
        { status: 400, ok: false }
      )
    );

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

  test("403 on initial load calls handleApiError", async () => {
    setBusinessUser();

    fetch
      .mockImplementationOnce(() =>
        mockJsonResponse({}, { status: 403, ok: false })
      )
      .mockImplementationOnce(() =>
        mockJsonResponse({ results: [] }, { status: 200, ok: true })
      )
      .mockImplementationOnce(() =>
        mockJsonResponse({ results: [] }, { status: 200, ok: true })
      );

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
    });

    expect(handleApiError).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403 }),
      expect.any(Function)
    );
  });
});