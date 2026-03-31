import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import OrderDetail from "../pages/Orders/OrderDetail";
import * as ordersApi from "../api/orders";

jest.mock("../api/orders");

describe("Order Detail Page", () => {
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
    });

    render(
      <MemoryRouter initialEntries={["/orders/15"]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/order #15/i)).toBeInTheDocument();
    expect(screen.getByText(/status:/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(screen.getByText(/tax: \$0.50/i)).toBeInTheDocument();
    expect(screen.getByText(/total: \$9.50/i)).toBeInTheDocument();
  });

  test("does not depend on old orderId or totalPaymentDue fields", async () => {
    ordersApi.getOrderDetail.mockResolvedValue({
      id: 22,
      date: "2026-04-18T14:30:00Z",
      status: "COMPLETED",
      taxAmount: "1.00",
      totalDue: "11.00",
      items: [],
    });

    render(
      <MemoryRouter initialEntries={["/orders/22"]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/order #22/i)).toBeInTheDocument();
    expect(screen.getByText(/total: \$11.00/i)).toBeInTheDocument();
  });
});