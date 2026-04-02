import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StoreFront from "../pages/StoreFront";

// Mock fetch globally
global.fetch = jest.fn();

const mockProducts = {
  results: [
    {
      id: 1,
      name: "Latte"
    }
  ]
};

const mockVariants = {
  results: [
    {
      id: 101,
      name: "Small",
      unitPrice: 4.5,
      stockQuantity: 10,
      sku: "LATTE-S"
    }
  ]
};

const mockCategories = {
  results: [
    { id: 1, name: "Coffee" }
  ]
};

describe("StoreFront - Product Browsing (US3.1.1)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock all fetch calls
    fetch.mockImplementation((url) => {
      if (url.includes("/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories)
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants)
        });
      }

      if (url.includes("/products")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts)
        });
      }

      return Promise.reject("Unknown API call");
    });
  });

  test("renders product list from API", async () => {
    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    expect(await screen.findByText("Latte")).toBeInTheDocument();
  });

  test("displays variant name and price", async () => {
    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    expect(await screen.findByText("Small")).toBeInTheDocument();
    expect(await screen.findByText("$4.50")).toBeInTheDocument();
  });

  test("shows Add to Cart controls when in stock", async () => {
    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    await screen.findByText("Latte");

    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  test("shows Out of Stock when quantity is 0", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories)
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [
                {
                  id: 101,
                  name: "Small",
                  unitPrice: 4.5,
                  stockQuantity: 0
                }
              ]
            })
        });
      }

      if (url.includes("/products")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts)
        });
      }
    });

    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    expect(await screen.findByText("Out of Stock")).toBeInTheDocument();
  });

  test("filters products by category", async () => {
    render(
        <MemoryRouter>
        <StoreFront />
        </MemoryRouter>
    );

    await screen.findByText("Latte");

    const dropdowns = screen.getAllByRole("combobox");
    const filterDropdown = dropdowns[0];

    fireEvent.change(filterDropdown, { target: { value: "1" } });

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/products?categoryId=1"
        );
    });
    });
  test("renders View Details link", async () => {
    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    const link = await screen.findByText("View Details");

    expect(link).toHaveAttribute("href", "/product/1");
  });

  test("handles API failure gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("API failure"));

    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});