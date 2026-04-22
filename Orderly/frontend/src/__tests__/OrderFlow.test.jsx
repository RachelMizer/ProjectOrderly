import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import OrderDetail from "../pages/Orders/OrderDetail";
import OrderHistory from "../pages/Orders/OrderHistory";
import AdminOrderDetail from "../pages/Admin/AdminOrderDetail";

jest.mock("../api/orders", () => ({
  getOrderDetail: jest.fn(),
  getOrderHistory: jest.fn(),
  cancelOrder: jest.fn(),
}));

import {
  getOrderDetail,
  getOrderHistory,
  cancelOrder,
} from "../api/orders";

describe("ORDER SYSTEM - PR TESTS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  test("Cancel button shows only for PENDING orders", async () => {
    getOrderDetail.mockResolvedValue({
      id: 1,
      status: "PENDING",
      items: [],
      totalDue: 10,
    });

    render(
      <MemoryRouter initialEntries={["/orders/1"]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("button", { name: /cancel order/i })
    ).toBeTruthy();
  });

  test("Cancel button NOT visible for non-pending orders", async () => {
    getOrderDetail.mockResolvedValue({
      id: 1,
      status: "COMPLETED",
      items: [],
    });

    render(
      <MemoryRouter initialEntries={["/orders/1"]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /cancel order/i })
      ).toBeNull();
    });
  });

  test("Successful cancel removes button", async () => {
    getOrderDetail.mockResolvedValue({
      id: 1,
      status: "PENDING",
      items: [],
    });

    cancelOrder.mockResolvedValue({
      message: "Order cancelled successfully.",
    });

    render(
      <MemoryRouter initialEntries={["/orders/1"]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const btn = await screen.findByRole("button", { name: /cancel order/i });

    fireEvent.click(btn);

    await waitFor(() => {
      expect(cancelOrder).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /cancel order/i })
      ).toBeNull();
    });
  });

  test("Cancel failure shows returned error message", async () => {
    getOrderDetail.mockResolvedValue({
      id: 1,
      status: "PENDING",
      items: [],
    });

    cancelOrder.mockRejectedValue(new Error("fail"));

    render(
      <MemoryRouter initialEntries={["/orders/1"]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const btn = await screen.findByRole("button", { name: /cancel order/i });

    fireEvent.click(btn);

    expect(await screen.findByText(/fail/i)).toBeTruthy();
  });

  test("Order history table renders", async () => {
    getOrderHistory.mockResolvedValue({
      results: [
        {
          id: 1,
          status: "COMPLETED",
          totalDue: 20,
        },
      ],
    });

    render(
      <MemoryRouter>
        <OrderHistory />
      </MemoryRouter>
    );

    expect(await screen.findByText(/your order history/i)).toBeTruthy();
  });

  test("Clicking order row navigates", async () => {
    getOrderHistory.mockResolvedValue({
      results: [
        {
          id: 1,
          status: "COMPLETED",
          totalDue: 20,
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={["/order-history"]}>
        <Routes>
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/orders/:orderId" element={<div>DETAIL PAGE</div>} />
        </Routes>
      </MemoryRouter>
    );

    const rowCell = await screen.findByText((content) => {
      const text = content.replace(/\s+/g, " ").trim();
      return text === "# 1" || text === "#1";
    });

    fireEvent.click(rowCell);

    await waitFor(() => {
      expect(screen.getByText("DETAIL PAGE")).toBeTruthy();
    });
  });

  test("Admin page loads without crashing", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/orders/1"]}>
        <Routes>
          <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/order detail/i)).toBeTruthy();
  });
});