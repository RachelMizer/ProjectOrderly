// src/__tests__/Checkout.test.jsx
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Checkout from "../pages/Checkout";

jest.mock("../api/orders", () => ({
  submitOrder: jest.fn(),
}));

import { submitOrder } from "../api/orders";

global.fetch = jest.fn();

function renderCheckout(route = "/checkout") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/orders/:orderId" element={<div>Order Detail Page</div>} />
        <Route path="/cart" element={<div>Cart Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const draftOrder = { id: 50 };

const detailOrder = {
  id: 50,
  taxAmount: "0.50",
  items: [
    {
      itemId: 1,
      productName: "Latte",
      variantName: "Large",
      quantity: 2,
      itemTotal: "10.00",
      modifiers: [
        {
          optionId: 1,
          name: "Extra Shot",
          priceAdjustmentCharged: "1.00",
        },
      ],
    },
  ],
};

describe("Checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("accessToken", "fake-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        firstName: "Kenny",
        lastName: "B",
        streetAddress: "123 Main",
        city: "Raleigh",
        state: "NC",
        zipcode: "27601",
        phone: "9195551234",
      })
    );

    fetch.mockImplementation((url, options = {}) => {
      if (url.includes("settings")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ taxRate: 7.2 }),
        });
      }

      if (url.includes("/orders/draft")) {
        return Promise.resolve({
          ok: true,
          json: async () => draftOrder,
        });
      }

      if (url.includes("/orders/50") && !options.method) {
        return Promise.resolve({
          ok: true,
          json: async () => detailOrder,
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  test("redirects to login when not authenticated", async () => {
    localStorage.removeItem("accessToken");
    renderCheckout();
    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });

  test("renders loading state", () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    renderCheckout();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders empty cart state", async () => {
    fetch.mockImplementation((url, options = {}) => {
      if (url.includes("/orders/draft")) {
        return Promise.resolve({
          ok: true,
          json: async () => draftOrder,
        });
      }

      if (url.includes("/orders/50") && !options.method) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 50, taxAmount: "0.00", items: [] }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderCheckout();

    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/go back to cart/i)).toBeInTheDocument();
  });

  test("renders order review and totals", async () => {
    renderCheckout();

    expect(await screen.findByText(/checkout/i)).toBeInTheDocument();
    expect(screen.getByText(/latte/i)).toBeInTheDocument();
    expect(screen.getByText(/extra shot/i)).toBeInTheDocument();
    expect(screen.getByText(/qty: 2/i)).toBeInTheDocument();

    // Updated assertions
    expect(screen.getAllByText("$10.00").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/\(\+\$1\.00\)/i)).toBeInTheDocument();
    expect(screen.getByText("$10.72")).toBeInTheDocument();
    });

  test("prefills payment fields from stored user", async () => {
    renderCheckout();

    expect(await screen.findByDisplayValue("Kenny B")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123 Main")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Raleigh")).toBeInTheDocument();
    expect(screen.getByDisplayValue("NC")).toBeInTheDocument();
    expect(screen.getByDisplayValue("27601")).toBeInTheDocument();
  });

  test("shows cardLast4 field for credit card", async () => {
    renderCheckout();
    expect(
      await screen.findByLabelText(/last 4 digits of card/i)
    ).toBeInTheDocument();
  });

  test("switches to other payment details field", async () => {
    renderCheckout();

    const select = await screen.findByLabelText(/payment type/i);
    fireEvent.change(select, { target: { value: "OTHER" } });

    expect(await screen.findByLabelText(/payment details/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/last 4 digits of card/i)
    ).not.toBeInTheDocument();
  });

  test("submits credit card order and navigates to order detail", async () => {
    submitOrder.mockResolvedValue({ id: 50 });

    renderCheckout();

    await screen.findByText(/checkout/i);

    fireEvent.change(screen.getByLabelText(/last 4 digits of card/i), {
      target: { value: "1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => {
      expect(submitOrder).toHaveBeenCalledWith(50, {
        paymentType: "CREDIT_CARD",
        cardLast4: "1234",
      });
    });

    expect(await screen.findByText(/order detail page/i)).toBeInTheDocument();
  });

  test("submits OTHER payment type correctly", async () => {
    submitOrder.mockResolvedValue({ id: 50 });

    renderCheckout();

    await screen.findByText(/checkout/i);

    fireEvent.change(screen.getByLabelText(/payment type/i), {
      target: { value: "OTHER" },
    });

    fireEvent.change(screen.getByLabelText(/payment details/i), {
      target: { value: "Gift card" },
    });

    fireEvent.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => {
      expect(submitOrder).toHaveBeenCalledWith(50, {
        paymentType: "OTHER",
        otherDetails: "Gift card",
      });
    });
  });

  test("shows submission error", async () => {
    submitOrder.mockRejectedValue(new Error("Order submission failed"));

    renderCheckout();

    await screen.findByText(/checkout/i);

    fireEvent.change(screen.getByLabelText(/last 4 digits of card/i), {
      target: { value: "1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /place order/i }));

    expect(
      await screen.findByText(/order submission failed/i)
    ).toBeInTheDocument();
  });
});