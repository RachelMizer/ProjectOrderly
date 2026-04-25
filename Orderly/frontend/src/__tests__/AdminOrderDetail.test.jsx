import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminOrderDetail from "../pages/Admin/AdminOrderDetail";
import { handleApiError } from "../api/handleApiError";
import { pushRecentOrder, removeRecentOrder } from "../utils/recentOrders";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ orderId: "123" }),
  useNavigate: () => mockNavigate,
}));

jest.mock("../api/auth", () => ({
  getAuthHeaders: () => ({ Authorization: "Bearer fake-token" }),
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

jest.mock("../utils/recentOrders", () => ({
  pushRecentOrder: jest.fn(),
  removeRecentOrder: jest.fn(),
}));

const mockOrder = {
  id: 123,
  status: "PENDING",
  date: "2026-04-24T14:30:00Z",
  createdAt: "2026-04-24T14:30:00Z",
  updatedAt: "2026-04-24T15:30:00Z",
  customerFirstName: "Kenny",
  customerLastName: "Bacdayan",
  customerId: 7,
  taxAmount: "2.50",
  totalDue: "27.50",
  items: [
    {
      itemId: 1,
      productName: "Latte",
      variantName: "Large",
      quantity: 2,
      unitPriceCharged: "5.50",
      itemTotal: "11.00",
      modifiers: [
        {
          id: 10,
          name: "Extra Shot",
          priceAdjustmentCharged: "1.00",
        },
      ],
    },
    {
      itemId: 2,
      productName: "Bagel",
      variantName: "Plain",
      quantity: 1,
      unitPriceCharged: "3.00",
      itemTotal: "3.00",
      modifiers: [],
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  window.print = jest.fn();

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => mockOrder,
  });
});

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminOrderDetail />
    </MemoryRouter>
  );
}

describe("AdminOrderDetail", () => {
  test("renders loading state", () => {
    renderPage();

    expect(screen.getByText(/loading order/i)).toBeInTheDocument();
  });

  test("renders order detail data", async () => {
    renderPage();

    await screen.findAllByText(/order #123/i);
    expect(screen.getByText(/kenny bacdayan/i)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/latte/i)).toBeInTheDocument();
    expect(screen.getByText(/bagel/i)).toBeInTheDocument();
    expect(screen.getByText(/extra shot/i)).toBeInTheDocument();
    expect(screen.getAllByText("$11.00")[0]).toBeInTheDocument();
  });

  test("pushes recent order after successful load", async () => {
    renderPage();

    await screen.findAllByText(/order #123/i);

    expect(pushRecentOrder).toHaveBeenCalledWith(mockOrder);
  });

  test("renders totals", async () => {
    renderPage();

    await screen.findAllByText(/order #123/i);

    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
    expect(screen.getByText("$25.00")).toBeInTheDocument();
    expect(screen.getByText("$2.50")).toBeInTheDocument();
    expect(screen.getByText("$27.50")).toBeInTheDocument();
  });

  test("prints order detail", async () => {
    renderPage();

    await screen.findAllByText(/order #123/i);

    fireEvent.click(screen.getByRole("button", { name: /print/i }));

    expect(window.print).toHaveBeenCalled();
  });

  test("navigates back to admin orders", async () => {
    renderPage();

    await screen.findAllByText(/order #123/i);

    fireEvent.click(screen.getByRole("button", { name: /back to orders/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/orders");
  });

  test("marks pending order complete", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockOrder,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

    renderPage();

    await screen.findByText(/pending/i);

    fireEvent.click(screen.getByRole("button", { name: /mark complete/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/123/complete",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    expect(await screen.findByText(/order marked as complete/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  test("shows complete order error", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockOrder,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

    renderPage();

    await screen.findByText(/pending/i);

    fireEvent.click(screen.getByRole("button", { name: /mark complete/i }));

    expect(
      await screen.findByText(/failed to complete order/i)
    ).toBeInTheDocument();
  });

  test("does not show mark complete button for completed order", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        ...mockOrder,
        status: "COMPLETED",
      }),
    });

    renderPage();

    expect(await screen.findByText(/completed/i)).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /mark complete/i })
    ).not.toBeInTheDocument();
  });

  test("renders cancelled status badge", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        ...mockOrder,
        status: "CANCELLED",
      }),
    });

    renderPage();

    expect(await screen.findByText(/cancelled/i)).toBeInTheDocument();
  });

  test("renders customer id fallback", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        ...mockOrder,
        customerFirstName: "",
        customerLastName: "",
        customerId: 99,
      }),
    });

    renderPage();

    expect(await screen.findByText(/customer #99/i)).toBeInTheDocument();
  });


  test("renders empty items message", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        ...mockOrder,
        items: [],
      }),
    });

    renderPage();

    expect(await screen.findByText(/no items on this order/i)).toBeInTheDocument();
  });

  test("shows load error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    renderPage();

    expect(await screen.findByText(/failed to load order/i)).toBeInTheDocument();
  });

  test("handles not found and removes recent order", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    renderPage();

    expect(await screen.findByText(/order not found/i)).toBeInTheDocument();

    expect(removeRecentOrder).toHaveBeenCalledWith(123);
  });

  test("handles auth error on load", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    renderPage();

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        { status: 401 },
        mockNavigate
      );
    });
  });

  test("handles auth error on mark complete", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockOrder,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({}),
      });

    renderPage();

    await screen.findByText(/pending/i);

    fireEvent.click(screen.getByRole("button", { name: /mark complete/i }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        { status: 403 },
        mockNavigate
      );
    });
  });
});