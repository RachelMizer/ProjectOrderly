import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import OrderDetail from "../pages/Orders/OrderDetail";
import * as ordersApi from "../api/orders";

jest.mock("../api/orders");

describe("Order Detail Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderOrderDetail(route = "/orders/15") {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );
  }

  test("renders loading state before order detail loads", () => {
    ordersApi.getOrderDetail.mockImplementation(
      () =>
        new Promise(() => {
          // intentionally unresolved
        })
    );

    renderOrderDetail();

    expect(screen.getByText(/loading order/i)).toBeInTheDocument();
  });

  test("renders order detail using id and totalDue", async () => {
    ordersApi.getOrderDetail.mockResolvedValue({
      id: 15,
      date: "2026-04-18T14:30:00Z",
      status: "COMPLETED",
      taxAmount: "0.50",
      totalDue: "9.50",
      items: [
        {
          itemId: 1,
          productName: "Chai",
          variantName: "Medium",
          quantity: 2,
          unitPriceCharged: "4.50",
          itemTotal: "9.00",
          modifiers: [],
        },
      ],
      createdAt: "2026-04-18T14:26:23Z",
      updatedAt: "2026-04-18T14:30:00Z",
    });

    renderOrderDetail();

    expect(await screen.findByText(/order #15/i)).toBeInTheDocument();
    expect(screen.getByText(/status:/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(screen.getByText(/tax:/i)).toBeInTheDocument();
    expect(screen.getByText(/\$0.50/)).toBeInTheDocument();
    expect(screen.getByText(/total:/i)).toBeInTheDocument();
    expect(screen.getByText(/\$9.50/)).toBeInTheDocument();
    expect(screen.getByText(/chai/i)).toBeInTheDocument();
    expect(screen.getByText(/x\s*2/i)).toBeInTheDocument();
  });

  test("renders modifiers when present", async () => {
    ordersApi.getOrderDetail.mockResolvedValue({
      id: 21,
      date: "2026-04-18T14:30:00Z",
      status: "COMPLETED",
      taxAmount: "0.75",
      totalDue: "12.75",
      items: [
        {
          itemId: 1,
          productName: "Coffee",
          variantName: "Large",
          quantity: 1,
          unitPriceCharged: "10.00",
          itemTotal: "12.00",
          modifiers: [
            {
              optionId: 1,
              name: "Extra Shot",
              priceAdjustmentCharged: "2.00",
            },
          ],
        },
      ],
      createdAt: "2026-04-18T14:26:23Z",
      updatedAt: "2026-04-18T14:30:00Z",
    });

    renderOrderDetail("/orders/21");

    expect(await screen.findByText(/order #21/i)).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /modifications/i })).toBeInTheDocument();
    expect(screen.getByText(/extra shot/i)).toBeInTheDocument();
  });

  test("shows empty items message when order has no items", async () => {
    ordersApi.getOrderDetail.mockResolvedValue({
      id: 30,
      date: "2026-04-18T14:30:00Z",
      status: "COMPLETED",
      taxAmount: "0.00",
      totalDue: "0.00",
      items: [],
      createdAt: "2026-04-18T14:26:23Z",
      updatedAt: "2026-04-18T14:30:00Z",
    });

    renderOrderDetail("/orders/30");

    expect(await screen.findByText(/no items in this order/i)).toBeInTheDocument();
  });

  test("shows error when order detail request fails", async () => {
    ordersApi.getOrderDetail.mockRejectedValue(
      new Error("Failed to fetch order detail")
    );

    renderOrderDetail();

    expect(
      await screen.findByText(/failed to fetch order detail/i)
    ).toBeInTheDocument();
  });

  test("calls getOrderDetail with route orderId", async () => {
    ordersApi.getOrderDetail.mockResolvedValue({
      id: 99,
      date: "2026-04-18T14:30:00Z",
      status: "COMPLETED",
      taxAmount: "1.00",
      totalDue: "11.00",
      items: [],
      createdAt: "2026-04-18T14:26:23Z",
      updatedAt: "2026-04-18T14:30:00Z",
    });

    renderOrderDetail("/orders/99");

    await screen.findByText(/order #99/i);

    expect(ordersApi.getOrderDetail).toHaveBeenCalledWith("99");
  });
});