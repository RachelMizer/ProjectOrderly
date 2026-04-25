import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StoreFront from "../pages/StoreFront";

global.fetch = jest.fn();

const mockProducts = {
  results: [{ id: 1, name: "Latte" }]
};

const mockVariants = {
  results: [
    {
      id: 101,
      name: "Small",
      unitPrice: 4.5,
      stockQuantity: 10
    }
  ]
};

const mockCategories = {
  results: [{ id: 1, name: "Coffee" }]
};

describe("StoreFront", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fetch.mockImplementation((url) => {
      if (url.includes("categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCategories) });
      }

      if (url.includes("variants")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockVariants) });
      }

      if (url.includes("products")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockProducts) });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  test("renders product", async () => {
    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    expect(await screen.findByText("Latte")).toBeInTheDocument();
  });

  test("displays price", async () => {
    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    expect(await screen.findByText("$4.50")).toBeInTheDocument();
  });

  test("shows Add to Cart button", async () => {
    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    expect(await screen.findByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });

  test("filters by category checkbox", async () => {
    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    const checkbox = await screen.findByRole("checkbox", { name: /coffee/i });

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test("renders view link", async () => {
    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    const link = await screen.findByRole("link", { name: /view & customize/i });

    expect(link).toHaveAttribute("href", "/product/1");
  });

  test("handles API failure", async () => {
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