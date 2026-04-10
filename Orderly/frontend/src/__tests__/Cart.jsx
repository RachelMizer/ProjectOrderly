import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProductPage from "../pages/ProductPage";

global.crypto = {
  randomUUID: () => "test-uuid",
};

global.fetch = jest.fn();

const mockProduct = {
  results: [{ id: 1, name: "Latte", description: "Coffee" }],
};

const mockVariants = {
  results: [
    { id: 101, name: "Small", unitPrice: 4.0, stockQuantity: 10 },
    { id: 102, name: "Large", unitPrice: 6.0, stockQuantity: 0 },
  ],
};

const mockModifiers = {
  groups: [
    {
      id: 1,
      name: "Extras",
      minSelections: 0,
      maxSelections: 2,
      options: [{ id: 201, name: "Shot", priceAdjustment: "1.00" }],
    },
  ],
};

function renderPage(route = "/product/1") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<div>Cart Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProductPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockModifiers),
        });
      }

      if (url.includes("/products/1/variants/102/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      if (url.includes("/orders/draft")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 999 }),
        });
      }

      if (url.includes("/orders/items")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ orderItemId: 555 }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  test("renders product name", async () => {
    renderPage();
    expect(await screen.findByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("Coffee")).toBeInTheDocument();
  });

  test("selects variant and updates price", async () => {
    renderPage();

    await screen.findByText("Latte");

    const radio = await screen.findByLabelText(/large/i);
    fireEvent.click(radio);

    await waitFor(() => {
      expect(screen.getByText("$6.00")).toBeInTheDocument();
    });
  });

  test("shows out of stock message", async () => {
    renderPage();

    await screen.findByText("Latte");

    const radio = await screen.findByLabelText(/large/i);
    fireEvent.click(radio);

    await waitFor(() => {
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /add to cart/i })
    ).not.toBeInTheDocument();
  });

  test("selects modifier and updates total price", async () => {
    renderPage();

    await screen.findByText("Latte");

    await waitFor(() => {
      const calls = fetch.mock.calls.map((call) => call[0]);
      expect(calls.some((url) => url.includes("/modifiers"))).toBe(true);
    });

    const option = await screen.findByLabelText(/shot/i);
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText("$5.00")).toBeInTheDocument();
    });
  });

  test("calls add to cart flow and navigates to cart", async () => {
    renderPage();

    await screen.findByText("Latte");

    const button = await screen.findByRole("button", { name: /add to cart/i });
    fireEvent.click(button);

    await waitFor(() => {
      const calls = fetch.mock.calls.map((call) => call[0]);
      expect(calls.some((url) => url.includes("/orders/draft"))).toBe(true);
      expect(calls.some((url) => url.includes("/orders/items"))).toBe(true);
    });

    expect(await screen.findByText(/cart page/i)).toBeInTheDocument();
  });
});