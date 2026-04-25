import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../components/ProductCard";

jest.mock("../api/orders", () => ({
  getGuestCartEmail: jest.fn(() => "guest@test.com"),
}));

describe("ProductCard", () => {
  const mockProduct = {
    id: 1,
    name: "Latte",
    description: "Hot coffee",
    variants: [
      { id: 101, name: "Small", unitPrice: 3.5, stockQuantity: 10 },
      { id: 102, name: "Large", unitPrice: 5.0, stockQuantity: 0 },
    ],
    defaultVariant: { id: 101, name: "Small", unitPrice: 3.5, stockQuantity: 10 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  test("renders product name and description", () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("Hot coffee")).toBeInTheDocument();
  });

  test("shows default variant price", () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText("$3.50")).toBeInTheDocument();
  });

  test("updates displayed price when a different variant is selected", () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("radio", { name: /large/i }));

    expect(screen.getByText("$5.00")).toBeInTheDocument();
  });

  test("shows out of stock and hides add to cart for unavailable variant", () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("radio", { name: /large/i }));

    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /add to cart/i })
    ).not.toBeInTheDocument();
  });

  test("calls draft and add-to-cart endpoints for guest user", async () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      `${process.env.REACT_APP_API_URL}/api/v1/orders/draft`,
      expect.objectContaining({
        method: "POST",
      })
    );

    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      `${process.env.REACT_APP_API_URL}/api/v1/orders/items`,
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  test("renders view and customize link", () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("link", { name: /view & customize/i })
    ).toHaveAttribute("href", "/product/1");
  });
});