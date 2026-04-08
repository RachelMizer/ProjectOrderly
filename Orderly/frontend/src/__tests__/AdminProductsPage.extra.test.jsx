// src/__tests__/AdminProductsPage.extra.test.jsx
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminProductsPage from "../pages/Admin/AdminProductsPage";

describe("AdminProductsPage extra coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("accessToken", "fake-token");
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

  test("shows empty state", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  test("renders returned products", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            name: "Latte",
            category: { name: "Coffee" },
            description: "Hot drink",
          },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/latte/i)).toBeInTheDocument();
    expect(screen.getByText(/coffee/i)).toBeInTheDocument();
    expect(screen.getByText(/hot drink/i)).toBeInTheDocument();
  });

  test("shows generic error on failed load", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/failed to load products/i)).toBeInTheDocument();
  });
});