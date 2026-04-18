import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Orders from "../pages/Admin/orders";
import AdminOrderDetail from "../pages/Admin/AdminOrderDetail";
import { handleApiError } from "../api/handleApiError";
import { pushRecentOrder } from "../utils/recentOrders";

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

jest.mock("../utils/recentOrders", () => ({
  pushRecentOrder: jest.fn(),
}));

function makeResponse({
  ok = true,
  status = 200,
  body = {},
  contentType = "application/json",
} = {}) {
  return Promise.resolve({
    ok,
    status,
    headers: {
      get: (name) =>
        String(name).toLowerCase() === "content-type" ? contentType : null,
    },
    json: async () => body,
  });
}

function makeOrdersResponse({
  results = [],
  count = results.length,
  next = null,
  previous = null,
} = {}) {
  return {
    count,
    next,
    previous,
    results,
  };
}

function makeOrder(overrides = {}) {
  return {
    id: 1042,
    date: "2026-04-14T14:30:00Z",
    customerId: 25,
    status: "PENDING",
    taxAmount: "1.20",
    totalDue: "13.20",
    createdAt: "2026-04-14T14:10:00Z",
    updatedAt: "2026-04-14T14:30:00Z",
    items: [
      {
        itemId: 1,
        productName: "Latte",
        variantName: "Large",
        quantity: 2,
        unitPriceCharged: "6.00",
        itemTotal: "12.00",
        modifiers: [],
      },
    ],
    ...overrides,
  };
}

function renderOrders(route = "/admin/orders") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("UI5.9 Admin Orders Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("shows loading state before orders load", () => {
    global.fetch.mockImplementation(
      () =>
        new Promise(() => {
          // unresolved on purpose
        })
    );

    renderOrders();

    expect(screen.getByText(/loading orders/i)).toBeInTheDocument();
  });

  test("renders the orders page layout with all column headers and row structure", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder(),
            makeOrder({
              id: 1041,
              status: "COMPLETED",
              totalDue: "7.50",
              customerId: 18,
              date: "2026-04-13T10:15:00Z",
            }),
          ],
          count: 2,
        }),
      })
    );

    renderOrders();

    expect(await screen.findByText(/^orders$/i)).toBeInTheDocument();
    expect(screen.getByText(/order management/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search orders/i)).toBeInTheDocument();

    expect(screen.getByText(/order #/i)).toBeInTheDocument();
    expect(screen.getByText(/^date/i)).toBeInTheDocument();
    expect(screen.getByText(/^customer/i)).toBeInTheDocument();
    expect(screen.getByText(/^status/i)).toBeInTheDocument();
    expect(screen.getByText(/^total/i)).toBeInTheDocument();
    expect(screen.getByText(/^actions$/i)).toBeInTheDocument();

    expect(screen.getByText("#1042")).toBeInTheDocument();
    expect(screen.getByText("#1041")).toBeInTheDocument();
    expect(screen.getByText("$13.20")).toBeInTheDocument();
    expect(screen.getByText("$7.50")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /> export/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /> print/i })).toBeInTheDocument();
  });

  test("renders empty state when no orders are returned", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({ results: [], count: 0 }),
      })
    );

    renderOrders();

    expect(await screen.findByText(/no orders found/i)).toBeInTheDocument();
    expect(screen.getByText(/^orders$/i)).toBeInTheDocument();
  });

  test("renders error state when the orders request fails", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        ok: false,
        status: 500,
        body: {},
      })
    );

    renderOrders();

    expect(
      await screen.findByText(/order record retrieval unsuccessful/i)
    ).toBeInTheDocument();
  });

  test("calls handleApiError on 403 from the orders request", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        ok: false,
        status: 403,
        body: {},
      })
    );

    renderOrders();

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
    });
  });

  test("shows Mark Complete only for pending orders", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder({ id: 1042, status: "PENDING" }),
            makeOrder({ id: 1041, status: "COMPLETED" }),
            makeOrder({ id: 1040, status: "CANCELLED" }),
          ],
          count: 3,
        }),
      })
    );

    renderOrders();

    expect(await screen.findByText("#1042")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button", { name: /mark complete/i });
    expect(buttons).toHaveLength(1);
  });

  test("marks a pending order complete and shows success feedback", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042, status: "PENDING" })],
            count: 1,
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          ok: true,
          status: 200,
          body: {},
        })
      );

    renderOrders();

    const button = await screen.findByRole("button", {
      name: /mark complete/i,
    });

    await userEvent.click(button);

    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/v1/orders/1042/complete"),
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );

    expect(
      await screen.findByText(/marked complete\./i)
    ).toBeInTheDocument();

    // success message
    expect(await screen.findByText(/marked complete\./i)).toBeInTheDocument();

    // status badge (specific)
    expect(
      screen.getByText((_, el) =>
        el?.classList.contains("inv-badge--completed")
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /mark complete/i })
    ).not.toBeInTheDocument();

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText(/marked complete\./i)).not.toBeInTheDocument();
    });
  });

  test("shows error feedback when mark complete fails", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042, status: "PENDING" })],
            count: 1,
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          ok: false,
          status: 500,
          body: {},
        })
      );

    renderOrders();

    const button = await screen.findByRole("button", {
      name: /mark complete/i,
    });

    await userEvent.click(button);

    expect(
      await screen.findByText(/failed to complete order\./i)
    ).toBeInTheDocument();

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(
        screen.queryByText(/failed to complete order\./i)
      ).not.toBeInTheDocument();
    });
  });

  test("calls handleApiError on 401 during mark complete", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042, status: "PENDING" })],
            count: 1,
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          ok: false,
          status: 401,
          body: {},
        })
      );

    renderOrders();

    const button = await screen.findByRole("button", {
      name: /mark complete/i,
    });

    await userEvent.click(button);

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
    });
  });

  test("filters orders by search query", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder({ id: 1042, customerId: 25 }),
            makeOrder({ id: 1041, customerId: 99 }),
          ],
          count: 2,
        }),
      })
    );

    renderOrders();

    expect(await screen.findByText("#1042")).toBeInTheDocument();
    expect(screen.getByText("#1041")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search orders/i);
    await userEvent.type(searchInput, "1042");

    expect(screen.getByText("#1042")).toBeInTheDocument();
    expect(screen.queryByText("#1041")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clear filters/i })
    ).toBeInTheDocument();
  });

  test("filters by status and updates the results", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [
              makeOrder({ id: 1042, status: "PENDING" }),
              makeOrder({ id: 1041, status: "COMPLETED" }),
            ],
            count: 2,
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042, status: "PENDING" })],
            count: 1,
          }),
        })
      );

    renderOrders();

    expect(await screen.findByText(/^orders$/i)).toBeInTheDocument();

    const selects = screen.getAllByRole("combobox");
    const statusSelect = selects[0];

    await userEvent.selectOptions(statusSelect, "PENDING");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("status=PENDING"),
        expect.any(Object)
      );
    });
  });

  test("shows available years from loaded data and enables cascading date filters", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder({ id: 1042, date: "2026-04-14T14:30:00Z" }),
            makeOrder({ id: 1041, date: "2025-03-01T09:00:00Z" }),
          ],
          count: 2,
        }),
      })
    );

    renderOrders();

    expect(await screen.findByText("#1042")).toBeInTheDocument();

    const selects = screen.getAllByRole("combobox");
    const yearSelect = selects[1];
    const monthSelect = selects[2];
    const daySelect = selects[3];

    expect(screen.getByRole("option", { name: "2026" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "2025" })).toBeInTheDocument();

    expect(monthSelect).toBeDisabled();
    expect(daySelect).toBeDisabled();

    await userEvent.selectOptions(yearSelect, "2026");
    expect(monthSelect).not.toBeDisabled();

    await userEvent.selectOptions(monthSelect, "4");
    expect(daySelect).not.toBeDisabled();
  });

  test("applies full date filter and sends dateCreated query param", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [
              makeOrder({ id: 1042, date: "2026-04-14T14:30:00Z" }),
              makeOrder({ id: 1041, date: "2026-04-12T10:00:00Z" }),
            ],
            count: 2,
          }),
        })
      )
      .mockResolvedValue(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042, date: "2026-04-14T14:30:00Z" })],
            count: 1,
          }),
        })
      );

    renderOrders();

    expect(await screen.findByText("#1042")).toBeInTheDocument();

    const selects = screen.getAllByRole("combobox");
    const yearSelect = selects[1];
    const monthSelect = selects[2];
    const daySelect = selects[3];

    await userEvent.selectOptions(yearSelect, "2026");
    await userEvent.selectOptions(monthSelect, "4");
    await userEvent.selectOptions(daySelect, "14");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("dateCreated=2026-04-14"),
        expect.any(Object)
      );
    });
  });

  test("clear filters resets search and title", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder({ id: 1042, customerId: 25 }),
            makeOrder({ id: 1041, customerId: 99 }),
          ],
          count: 2,
        }),
      })
    );

    renderOrders();

    expect(await screen.findByText("#1042")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search orders/i);
    await userEvent.type(searchInput, "1042");

    const clearButton = screen.getByRole("button", {
      name: /clear filters/i,
    });

    await userEvent.click(clearButton);

    expect(searchInput).toHaveValue("");
    expect(screen.getByText(/^orders$/i)).toBeInTheDocument();
    expect(screen.getByText("#1041")).toBeInTheDocument();
  });

  test("supports pagination controls and page indicator", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042 })],
            count: 50,
            next: "http://127.0.0.1:8000/api/v1/orders?page=2&pageSize=25",
            previous: null,
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1017 })],
            count: 50,
            next: null,
            previous: "http://127.0.0.1:8000/api/v1/orders?page=1&pageSize=25",
          }),
        })
      );

    renderOrders();

    expect(await screen.findByText(/pg 1 of 2/i)).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /next >/i });
    expect(nextButton).toBeEnabled();

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/pg 2 of 2/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /< prev/i })).toBeEnabled();
  });

  test("sorts rows when clicking sortable headers", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder({ id: 1040, totalDue: "9.00" }),
            makeOrder({ id: 1042, totalDue: "13.20" }),
            makeOrder({ id: 1041, totalDue: "11.50" }),
          ],
          count: 3,
        }),
      })
    );

    renderOrders();

    expect(await screen.findByText("#1040")).toBeInTheDocument();

    const totalHeader = screen.getByText(/^total/i);
    fireEvent.click(totalHeader);

    let rows = screen.getAllByRole("row");
    let bodyRows = rows.slice(1);
    expect(within(bodyRows[0]).getByText("#1040")).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText("#1041")).toBeInTheDocument();
    expect(within(bodyRows[2]).getByText("#1042")).toBeInTheDocument();

    fireEvent.click(totalHeader);

    rows = screen.getAllByRole("row");
    bodyRows = rows.slice(1);
    expect(within(bodyRows[0]).getByText("#1042")).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText("#1041")).toBeInTheDocument();
    expect(within(bodyRows[2]).getByText("#1040")).toBeInTheDocument();
  });

  test("navigates to order detail when clicking an order number and records recent order", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042, customerId: 25 })],
            count: 1,
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrder({
            id: 1042,
            customerId: 25,
            status: "PENDING",
            taxAmount: "1.20",
            totalDue: "13.20",
            items: [
              {
                itemId: 1,
                productName: "Latte",
                variantName: "Large",
                quantity: 2,
                unitPriceCharged: "6.00",
                itemTotal: "12.00",
                modifiers: [],
              },
            ],
          }),
        })
      );

    renderOrders();

    const orderLink = await screen.findByText("#1042");
    await userEvent.click(orderLink);

    expect(pushRecentOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1042,
        customerId: 25,
      })
    );

    expect(await screen.findByText(/customer #25/i)).toBeInTheDocument();
    expect(screen.getByText(/^items$/i)).toBeInTheDocument();
    expect(screen.getByText(/latte/i)).toBeInTheDocument();
  });

  test("order detail page loads, shows totals, and allows back navigation", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrder({
          id: 1042,
          customerId: 25,
          status: "COMPLETED",
          taxAmount: "1.20",
          totalDue: "13.20",
          items: [
            {
              itemId: 1,
              productName: "Latte",
              variantName: "Large",
              quantity: 2,
              unitPriceCharged: "6.00",
              itemTotal: "12.00",
              modifiers: [{ id: 1, name: "Oat Milk", priceAdjustmentCharged: 0.5 }],
            },
          ],
        }),
      })
    );

    renderOrders("/admin/orders/1042");

    expect(await screen.findByText(/customer #25/i)).toBeInTheDocument();
    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
    expect(screen.getAllByText("$12.00").length).toBeGreaterThan(0);
    expect(screen.getByText("$1.20")).toBeInTheDocument();
    expect(screen.getByText(/oat milk/i)).toBeInTheDocument();

    const backButton = screen.getByRole("button", { name: /back to orders/i });
    expect(backButton).toBeInTheDocument();
  });

  test("order detail page shows error state when request fails", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        ok: false,
        status: 500,
        body: {},
      })
    );

    renderOrders("/admin/orders/1042");

    expect(await screen.findByText(/failed to load order/i)).toBeInTheDocument();
  });

  test("order detail page shows not found message on 404", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        ok: false,
        status: 404,
        body: {},
      })
    );

    renderOrders("/admin/orders/9999");

    expect(await screen.findByText(/order not found/i)).toBeInTheDocument();
  });

  test("order detail page marks order complete and shows success feedback", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrder({
            id: 1042,
            status: "PENDING",
            customerId: 25,
            taxAmount: "1.20",
            totalDue: "13.20",
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          ok: true,
          status: 200,
          body: {},
        })
      );

    renderOrders("/admin/orders/1042");

    const button = await screen.findByRole("button", {
      name: /mark complete/i,
    });

    await userEvent.click(button);

    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/v1/orders/1042/complete"),
      expect.objectContaining({
        method: "PATCH",
      })
    );

    expect(
      await screen.findByText(/order marked as complete\./i)
    ).toBeInTheDocument();

    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /mark complete/i })
    ).not.toBeInTheDocument();
  });

  test("order detail page shows empty items message when no items exist", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrder({
          id: 1042,
          items: [],
          status: "COMPLETED",
        }),
      })
    );

    renderOrders("/admin/orders/1042");

    expect(await screen.findByText(/no items on this order/i)).toBeInTheDocument();
  });

  test("requests the orders endpoint on initial load", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [makeOrder()],
          count: 1,
        }),
      })
    );

    renderOrders();

    await screen.findByText("#1042");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/orders?page=1&pageSize=25"),
      expect.any(Object)
    );
  });
});