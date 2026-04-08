import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminProductsPage from "../pages/Admin/AdminProductsPage";

describe("AdminProductsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading state", () => {
    global.fetch = jest.fn(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  test("renders products table", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ id: 1, name: "Latte", category: { name: "Coffee" } }]
      })
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Latte")).toBeInTheDocument();
  });

  test("shows empty state", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] })
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  test("shows error message", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/failed to load products/i)
    ).toBeInTheDocument();
  });
});