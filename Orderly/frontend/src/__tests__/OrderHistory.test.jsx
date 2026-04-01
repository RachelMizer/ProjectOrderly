import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import OrderHistory from "../pages/Orders/OrderHistory";
import OrderDetail from "../pages/Orders/OrderDetail";
import * as ordersApi from "../api/orders";

jest.mock("../api/orders");

describe("Order History Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderWithRoutes(initialRoute = "/order-history") {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );
  }

  const order28 = {
    id: 28,
    date: "2026-06-21T14:30:00Z",
    subtotal: "10.00",
    taxAmount: "0.07",
    totalDue: "10.07",
    status: "PENDING",
    createdAt: "2026-06-20T14:30:00Z",
    updatedAt: "2026-06-21T14:30:00Z",
  };

  const order15 = {
    id: 15,
    date: "2026-04-18T14:30:00Z",
    subtotal: "20.00",
    taxAmount: "0.14",
    totalDue: "20.14",
    status: "COMPLETED",
    createdAt: "2026-04-18T14:30:00Z",
    updatedAt: "2026-04-18T14:30:00Z",
  };

  test("renders loading state before orders load", () => {
    ordersApi.getOrderHistory.mockImplementation(
      () =>
        new Promise(() => {
          // intentionally unresolved
        })
    );

    renderWithRoutes();

    expect(screen.getByText(/loading order history/i)).toBeInTheDocument();
  });

  test("renders past orders correctly", async () => {
    ordersApi.getOrderHistory.mockResolvedValue({
      count: 2,
      pageSize: 25,
      next: null,
      previous: null,
      results: [order28, order15],
    });

    renderWithRoutes();

    expect(
      await screen.findByRole("heading", { name: /order history/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/status:\s*pending/i)).toBeInTheDocument();
    expect(screen.getByText(/status:\s*completed/i)).toBeInTheDocument();
    expect(screen.getByText(/total:\s*\$10\.07/i)).toBeInTheDocument();
    expect(screen.getByText(/total:\s*\$20\.14/i)).toBeInTheDocument();
    expect(screen.getByText(/page\s*1/i)).toBeInTheDocument();
  });

  test("shows empty state when customer has no past orders", async () => {
    ordersApi.getOrderHistory.mockResolvedValue({
      count: 0,
      pageSize: 25,
      next: null,
      previous: null,
      results: [],
    });

    renderWithRoutes();

    expect(await screen.findByText(/no past orders found/i)).toBeInTheDocument();
  });

  test("shows error message when order history request fails", async () => {
    ordersApi.getOrderHistory.mockRejectedValue(
      new Error("Failed to fetch order history")
    );

    renderWithRoutes();

    expect(
      await screen.findByText(/failed to fetch order history/i)
    ).toBeInTheDocument();
  });

  test("loads first page with default pagination values", async () => {
    ordersApi.getOrderHistory.mockResolvedValue({
      count: 0,
      pageSize: 25,
      next: null,
      previous: null,
      results: [],
    });

    renderWithRoutes();

    await screen.findByText(/no past orders found/i);

    expect(ordersApi.getOrderHistory).toHaveBeenCalledWith({
      page: 1,
      pageSize: 25,
    });
  });

  test("next and previous buttons are disabled when no next or previous page exists", async () => {
    ordersApi.getOrderHistory.mockResolvedValue({
      count: 1,
      pageSize: 25,
      next: null,
      previous: null,
      results: [order28],
    });

    renderWithRoutes();

    expect(await screen.findByText(/total:\s*\$10\.07/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  test("next button loads next page", async () => {
    ordersApi.getOrderHistory
      .mockResolvedValueOnce({
        count: 30,
        pageSize: 25,
        next: "/api/v1/orders/me?page=2&pageSize=25",
        previous: null,
        results: [order28],
      })
      .mockResolvedValueOnce({
        count: 30,
        pageSize: 25,
        next: null,
        previous: "/api/v1/orders/me?page=1&pageSize=25",
        results: [order15],
      });

    renderWithRoutes();

    expect(await screen.findByText(/total:\s*\$10\.07/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(ordersApi.getOrderHistory).toHaveBeenLastCalledWith({
        page: 2,
        pageSize: 25,
      });
    });

    expect(await screen.findByText(/total:\s*\$20\.14/i)).toBeInTheDocument();
    expect(screen.getByText(/page\s*2/i)).toBeInTheDocument();
  });

  test("previous button loads previous page after navigating forward", async () => {
    ordersApi.getOrderHistory
      .mockResolvedValueOnce({
        count: 30,
        pageSize: 25,
        next: "/api/v1/orders/me?page=2&pageSize=25",
        previous: null,
        results: [order28],
      })
      .mockResolvedValueOnce({
        count: 30,
        pageSize: 25,
        next: null,
        previous: "/api/v1/orders/me?page=1&pageSize=25",
        results: [order15],
      })
      .mockResolvedValueOnce({
        count: 30,
        pageSize: 25,
        next: "/api/v1/orders/me?page=2&pageSize=25",
        previous: null,
        results: [order28],
      });

    renderWithRoutes();

    expect(await screen.findByText(/total:\s*\$10\.07/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText(/total:\s*\$20\.14/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /previous/i }));

    await waitFor(() => {
      expect(ordersApi.getOrderHistory).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 25,
      });
    });

    expect(await screen.findByText(/total:\s*\$10\.07/i)).toBeInTheDocument();
    expect(screen.getByText(/page\s*1/i)).toBeInTheDocument();
  });

  test("clicking an order navigates to order detail page", async () => {
    ordersApi.getOrderHistory.mockResolvedValue({
      count: 1,
      pageSize: 25,
      next: null,
      previous: null,
      results: [order28],
    });

    ordersApi.getOrderDetail.mockResolvedValue({
      id: 28,
      date: "2026-06-21T14:30:00Z",
      status: "PENDING",
      taxAmount: "0.07",
      totalDue: "10.07",
      items: [],
      createdAt: "2026-06-20T14:30:00Z",
      updatedAt: "2026-06-21T14:30:00Z",
    });

    renderWithRoutes();

    const totalText = await screen.findByText(/total:\s*\$10\.07/i);
    const clickableOrderCard = totalText.closest("div");

    fireEvent.click(clickableOrderCard);

    expect(await screen.findByText(/order #28/i)).toBeInTheDocument();
    expect(await screen.findByText(/total:\s*\$10\.07/i)).toBeInTheDocument();
  });
});