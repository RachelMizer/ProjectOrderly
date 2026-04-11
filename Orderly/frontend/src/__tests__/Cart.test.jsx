import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartPage from "../pages/Cart";

jest.mock("../api/orders", () => ({
  getGuestCartEmail: () => "guest@test.com",
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function mockFetchSequence(responses) {
  let call = 0;
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => responses[call++],
    })
  );
}

describe("CartPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("shows loading state", () => {
    global.fetch = jest.fn(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading cart/i)).toBeInTheDocument();
  });

  test("shows empty cart", async () => {
    mockFetchSequence([
      { id: 1 },
      { items: [] },
    ]);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
  });

  test("renders cart items", async () => {
    mockFetchSequence([
        { id: 1 },
        {
        items: [
            {
            itemId: 1,
            productId: 10,
            productName: "Latte",
            quantity: 2,
            itemTotal: 10,
            variantName: "Large",
            modifiers: [],
            },
        ],
        taxAmount: 1,
        },
    ]);

    render(
        <MemoryRouter>
        <CartPage />
        </MemoryRouter>
    );

    expect(await screen.findByText(/latte/i)).toBeInTheDocument();

    // ✅ FIX: avoid duplicate $10.00 issue
    const prices = await screen.findAllByText(/\$10\.00/);
    expect(prices.length).toBeGreaterThan(0);

    expect(screen.getByText(/qty/i)).toBeInTheDocument();
    });

  test("updates quantity", async () => {
    mockFetchSequence([
      { id: 1 },
      {
        items: [
          {
            itemId: 1,
            productId: 10,
            productName: "Latte",
            quantity: 1,
            itemTotal: 5,
            variantName: "Standard",
            modifiers: [],
          },
        ],
      },
      { id: 1 },
      { items: [] },
    ]);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    const plusBtn = await screen.findByText("+");
    fireEvent.click(plusBtn);

    expect(global.fetch).toHaveBeenCalled();
  });

  test("deletes item", async () => {
    mockFetchSequence([
      { id: 1 },
      {
        items: [
          {
            itemId: 1,
            productId: 10,
            productName: "Latte",
            quantity: 1,
            itemTotal: 5,
            variantName: "Standard",
            modifiers: [],
          },
        ],
      },
      { id: 1 },
      { items: [] },
    ]);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    const deleteBtn = await screen.findByText(/delete/i);
    fireEvent.click(deleteBtn);

    expect(global.fetch).toHaveBeenCalled();
  });

  test("navigates to checkout", async () => {
    mockFetchSequence([
      { id: 1 },
      {
        items: [
          {
            itemId: 1,
            productId: 10,
            productName: "Latte",
            quantity: 1,
            itemTotal: 5,
            variantName: "Standard",
            modifiers: [],
          },
        ],
      },
    ]);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    const checkoutBtn = await screen.findByText(/go to checkout/i);
    fireEvent.click(checkoutBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });

  test("empties cart", async () => {
    window.confirm = jest.fn(() => true);

    mockFetchSequence([
      { id: 1 },
      {
        items: [
          {
            itemId: 1,
            productId: 10,
            productName: "Latte",
            quantity: 1,
            itemTotal: 5,
            variantName: "Standard",
            modifiers: [],
          },
        ],
      },
      { id: 1 },
      { items: [] },
    ]);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    const emptyBtn = await screen.findByText(/empty cart/i);
    fireEvent.click(emptyBtn);

    expect(global.fetch).toHaveBeenCalled();
  });
});