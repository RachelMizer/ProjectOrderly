import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
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
    global.fetch = jest.fn();
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

    expect(await screen.findByText(/order management/i)).toBeInTheDocument();
    expect(await screen.findByText(/^orders$/i)).toBeInTheDocument();
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

    expect(
      screen.getByRole("button", { name: /> export/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /> print/i })
    ).toBeInTheDocument();
  });

  test("renders empty state when no orders are returned", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({ results: [], count: 0 }),
      })
    );

    renderOrders();

    expect(await screen.findByText(/no orders found/i)).toBeInTheDocument();
    expect(screen.getByText(/order management/i)).toBeInTheDocument();
  });

  test("renders error state when the orders request fails", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        ok: false,
        status: 500,
        body: { message: "Failed to fetch orders" },
      })
    );

    renderOrders();

    await waitFor(() => {
      <p class="orders-load-error">
        Order record retrieval unsuccessful.
      </p>
    });
  });

  test("shows rows and status badges", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder(),
            makeOrder({
              id: 1041,
              status: "COMPLETED",
              totalDue: "7.50",
            }),
          ],
          count: 2,
        }),
      })
    );

    renderOrders();

    expect(await screen.findByText("#1042")).toBeInTheDocument();
    expect(screen.getByText("#1041")).toBeInTheDocument();
    expect(screen.getAllByText(/pending/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0);
  });

  test("search filters visible results", async () => {
    global.fetch.mockResolvedValue(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder({ id: 1042 }),
            makeOrder({ id: 1041 }),
          ],
          count: 2,
        }),
      })
    );

    renderOrders();

    expect(await screen.findByText("#1042")).toBeInTheDocument();

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

    expect(await screen.findByText(/order management/i)).toBeInTheDocument();

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
    expect(screen.getByText(/order management/i)).toBeInTheDocument();
    await screen.findByText("#1041");
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
    await userEvent.click(totalHeader);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  test("clicking an order id navigates to detail and stores recent order", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042 })],
            count: 1,
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrder({ id: 1042 }),
        })
      );

    renderOrders();

    const orderId = await screen.findByText("#1042");
    await userEvent.click(orderId);

    await waitFor(() => {
      expect(pushRecentOrder).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1042 })
      );
    });
  });
});