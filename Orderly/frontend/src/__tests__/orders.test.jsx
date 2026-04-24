import "@testing-library/jest-dom";
import { render, screen, waitFor, act } from "@testing-library/react";
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

jest.mock("../api/auth", () => ({
  getAuthHeaders: jest.fn(() => ({ Authorization: "Bearer fake-token" })),
}));

function makeResponse({ ok = true, status = 200, body = {} } = {}) {
  return Promise.resolve({
    ok,
    status,
    headers: {
      get: (name) =>
        String(name).toLowerCase() === "content-type" ? "application/json" : null,
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
  return { count, next, previous, results };
}

function makeOrder(overrides = {}) {
  return {
    id: 1042,
    date: "2026-04-14T14:30:00Z",
    customerId: 25,
    customerFirstName: "Jane",
    customerLastName: "Doe",
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

function renderRoutes(route = "/admin/orders") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("UX5.9 Admin Orders Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    localStorage.clear();
    global.fetch = jest.fn();
  });

  test("loads pending orders on mount and renders the default orders table", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder({ id: 1042, status: "PENDING" }),
            makeOrder({ id: 1041, status: "PENDING", totalDue: "7.50" }),
          ],
          count: 2,
        }),
      })
    );

    renderRoutes();

    expect(screen.getByText(/loading orders/i)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /^orders$/i })).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/orders?page=1&pageSize=25&status=PENDING"),
      expect.any(Object)
    );

    expect(screen.getByPlaceholderText(/search orders/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /> export/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /> print/i })).toBeInTheDocument();

    expect(screen.getByText(/order #/i)).toBeInTheDocument();
    expect(screen.getByText(/^date/i)).toBeInTheDocument();
    expect(screen.getByText(/^customer/i)).toBeInTheDocument();
    expect(screen.getByText(/^status/i)).toBeInTheDocument();
    expect(screen.getByText(/^total/i)).toBeInTheDocument();
    expect(screen.getByText(/^actions$/i)).toBeInTheDocument();

    expect(screen.getByText("#1042")).toBeInTheDocument();
    expect(screen.getByText("#1041")).toBeInTheDocument();
    expect(screen.getAllByText(/pending/i).length).toBeGreaterThan(0);
  });

  test("renders empty state when no orders are returned", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({ results: [], count: 0 }),
      })
    );

    renderRoutes();

    expect(await screen.findByText(/no orders found/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^orders$/i })).toBeInTheDocument();
  });

  test("renders error state when the orders request fails", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        ok: false,
        status: 500,
        body: { message: "Failed to fetch orders" },
      })
    );

    renderRoutes();

    expect(
      await screen.findByText(/order record retrieval unsuccessful\./i)
    ).toBeInTheDocument();
  });

  test("filters visible results with client-side search", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder({ id: 1042, customerFirstName: "Jane", customerLastName: "Doe" }),
            makeOrder({ id: 1041, customerFirstName: "John", customerLastName: "Smith" }),
          ],
          count: 2,
        }),
      })
    );

    renderRoutes();

    expect(await screen.findByText("#1042")).toBeInTheDocument();
    expect(screen.getByText("#1041")).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/search orders/i), "1042");

    await waitFor(() => {
      expect(screen.getByText("#1042")).toBeInTheDocument();
      expect(screen.queryByText("#1041")).not.toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
  });

  test("supports cascading date filters and sends dateCreated when all are selected", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [
              makeOrder({ id: 1042, date: "2026-04-14T14:30:00Z" }),
              makeOrder({ id: 1041, date: "2025-03-01T09:00:00Z" }),
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

    renderRoutes();

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
    await waitFor(() => expect(monthSelect).not.toBeDisabled());

    await userEvent.selectOptions(monthSelect, "4");
    await waitFor(() => expect(daySelect).not.toBeDisabled());

    await userEvent.selectOptions(daySelect, "14");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("dateCreated=2026-04-14"),
        expect.any(Object)
      );
    });
  });

  test("applies completed status filter and hides mark complete action", async () => {
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
            results: [makeOrder({ id: 1041, status: "COMPLETED" })],
            count: 1,
          }),
        })
      );

    renderRoutes();

    expect(await screen.findByText("#1042")).toBeInTheDocument();

    const selects = screen.getAllByRole("combobox");
    const statusSelect = selects[0];

    await userEvent.selectOptions(statusSelect, "COMPLETED");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("status=COMPLETED"),
        expect.any(Object)
      );
    });

    expect(await screen.findByText("#1041")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mark complete/i })).not.toBeInTheDocument();
  });

  test("clear filters resets search and date/status filters back to default pending fetch", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042, status: "PENDING" })],
            count: 1,
          }),
        })
      )
      .mockResolvedValue(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042, status: "PENDING" })],
            count: 1,
          }),
        })
      );

    renderRoutes();

    expect(await screen.findByText("#1042")).toBeInTheDocument();

    const search = screen.getByPlaceholderText(/search orders/i);
    const selects = screen.getAllByRole("combobox");
    const statusSelect = selects[0];
    const yearSelect = selects[1];

    await userEvent.type(search, "1042");
    await userEvent.selectOptions(statusSelect, "COMPLETED");
    await userEvent.selectOptions(yearSelect, "2026");

    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(search).toHaveValue("");
    expect(statusSelect).toHaveValue("");
    expect(yearSelect).toHaveValue("");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.not.stringContaining("status="),
        expect.any(Object)
      );
    });
  });

  test("shows Mark Complete only for pending orders and updates row optimistically on success", async () => {
    jest.useFakeTimers();

    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [
              makeOrder({ id: 1042, status: "PENDING" }),
              makeOrder({ id: 1041, status: "COMPLETED", totalDue: "7.50" }),
            ],
            count: 2,
          }),
        })
      )
      .mockResolvedValueOnce(makeResponse({ body: {} }));

    renderRoutes();

    expect(await screen.findByText("#1042")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark complete/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /mark complete/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("/api/v1/orders/1042/complete"),
        expect.objectContaining({ method: "PATCH" })
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0);
    });
    expect(screen.queryByRole("button", { name: /mark complete/i })).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
  });

  test("shows inline error feedback when mark complete fails", async () => {
    jest.useFakeTimers();

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
          body: { message: "boom" },
        })
      );

    renderRoutes();

    expect(await screen.findByText("#1042")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /mark complete/i }));

    expect(await screen.findByText(/failed to complete order\./i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark complete/i })).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.queryByText(/failed to complete order\./i)).not.toBeInTheDocument();
  });

  test("passes 403 list-load errors to handleApiError", async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({ ok: false, status: 403, body: {} }));

    renderRoutes();

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        expect.objectContaining({ status: 403 }),
        expect.any(Function)
      );
    });
  });

  test("clicking an order id navigates to detail and stores the recent order", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042, customerFirstName: "Jane", customerLastName: "Doe" })],
            count: 1,
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrder({ id: 1042, customerFirstName: "Jane", customerLastName: "Doe" }),
        })
      );

    renderRoutes();

    await userEvent.click(await screen.findByText("#1042"));

    await waitFor(() => {
      expect(pushRecentOrder).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1042, customerFirstName: "Jane" })
      );
    });

    expect(await screen.findAllByText(/order #1042/i)).toHaveLength(2);
  });
});

describe("UX5.9 Admin Order Detail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    localStorage.clear();
    global.fetch = jest.fn();
  });

  test("loads order detail, renders items and totals, and stores recent order", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrder({
          id: 2042,
          customerFirstName: "Ava",
          customerLastName: "Taylor",
          items: [
            {
              itemId: 1,
              productName: "Latte",
              variantName: "Large",
              quantity: 2,
              unitPriceCharged: "6.00",
              itemTotal: "12.00",
              modifiers: [{ id: 5, name: "Oat Milk", priceAdjustmentCharged: 0.75 }],
            },
          ],
          taxAmount: "1.20",
          totalDue: "13.20",
        }),
      })
    );

    renderRoutes("/admin/orders/2042");

    expect(await screen.findAllByText(/order #2042/i)).toHaveLength(2);
    expect(screen.getByText(/ava taylor/i)).toBeInTheDocument();
    expect(screen.getByText(/^items$/i)).toBeInTheDocument();
    expect(screen.getByText("Latte")).toBeInTheDocument();
    expect(screen.getByText(/oat milk/i)).toBeInTheDocument();
    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
    expect(screen.getByText(/tax/i)).toBeInTheDocument();
    expect(screen.getByText(/^total$/i)).toBeInTheDocument();

    expect(pushRecentOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2042, customerFirstName: "Ava" })
    );
  });

  test("renders order-not-found state for 404 responses", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({ ok: false, status: 404, body: { message: "missing" } })
    );

    renderRoutes("/admin/orders/9999");

    expect(await screen.findByText(/order not found\./i)).toBeInTheDocument();
  });

  test("marks an order complete from the detail page and clears success feedback after 3 seconds", async () => {
    jest.useFakeTimers();

    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrder({ id: 3001, status: "PENDING" }),
        })
      )
      .mockResolvedValueOnce(makeResponse({ body: {} }));

    renderRoutes("/admin/orders/3001");

    expect(await screen.findAllByText(/order #3001/i)).toHaveLength(2);

    await userEvent.click(screen.getByRole("button", { name: /mark complete/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("/api/v1/orders/3001/complete"),
        expect.objectContaining({ method: "PATCH" })
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0);
    });
    expect(screen.queryByRole("button", { name: /mark complete/i })).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
  });

  test("passes detail-page 403 errors to handleApiError", async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({ ok: false, status: 403, body: {} }));

    renderRoutes("/admin/orders/2042");

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        expect.objectContaining({ status: 403 }),
        expect.any(Function)
      );
    });
  });

  test("renders no-items row when order detail has no items", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrder({
          id: 4001,
          items: [],
          taxAmount: "0.50",
          totalDue: "9.50",
        }),
      })
    );

    renderRoutes("/admin/orders/4001");

    expect(await screen.findAllByText(/order #4001/i)).toHaveLength(2);
    expect(screen.getByText(/no items on this order\./i)).toBeInTheDocument();
    expect(await screen.findAllByText(/order #4001/i)).toHaveLength(2);

    expect(
      screen.getByText(/no items on this order\./i)
    ).toBeInTheDocument();
  });
});
describe("UX5.9 Admin Orders Page additional coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    localStorage.clear();
    global.fetch = jest.fn();
  });

  test("passes 401 mark-complete errors to handleApiError", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1042, status: "PENDING" })],
            count: 1,
          }),
        })
      )
      .mockResolvedValueOnce(makeResponse({ ok: false, status: 401, body: {} }));

    renderRoutes();

    expect(await screen.findByText("#1042")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /mark complete/i }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401 }),
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /mark complete/i })).toBeEnabled();
    });
  });

  test("sorts by total ascending then descending when the total header is clicked twice", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder({ id: 1001, totalDue: "20.00", date: "2026-04-14T14:30:00Z" }),
            makeOrder({ id: 1002, totalDue: "5.00", date: "2026-04-13T14:30:00Z" }),
            makeOrder({ id: 1003, totalDue: "12.00", date: "2026-04-12T14:30:00Z" }),
          ],
          count: 3,
        }),
      })
    );

    renderRoutes();

    expect(await screen.findByText("#1001")).toBeInTheDocument();

    const totalHeader = screen.getByText(/^total/i).closest("th");
    expect(totalHeader).toBeInTheDocument();

    await userEvent.click(totalHeader);

    let orderLinks = screen.getAllByText(/#100\d/).map((node) => node.textContent);
    expect(orderLinks).toEqual(["#1002", "#1003", "#1001"]);

    await userEvent.click(totalHeader);

    orderLinks = screen.getAllByText(/#100\d/).map((node) => node.textContent);
    expect(orderLinks).toEqual(["#1001", "#1003", "#1002"]);
  });

  test("sorts by customer id, renders fallback values, and shows unknown statuses as-is", async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({
        body: makeOrdersResponse({
          results: [
            makeOrder({
              id: 1101,
              customerId: 30,
              customerFirstName: "",
              customerLastName: "",
              date: null,
              totalDue: null,
              status: "REFUNDED",
            }),
            makeOrder({
              id: 1102,
              customerId: 11,
              customerFirstName: "Amy",
              customerLastName: "Adams",
              status: "CANCELLED",
              totalDue: "4.00",
            }),
          ],
          count: 2,
        }),
      })
    );

    renderRoutes();

    expect(await screen.findByText("#1101")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByText("REFUNDED")).toBeInTheDocument();

    const customerHeader = screen.getByText(/^customer/i).closest("th");
    expect(customerHeader).toBeInTheDocument();

    await userEvent.click(customerHeader);

    const orderLinks = screen.getAllByText(/#110\d/).map((node) => node.textContent);
    expect(orderLinks).toEqual(["#1102", "#1101"]);
  });

  test("supports next and previous pagination and updates the page label", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1201 })],
            count: 30,
            next: "http://127.0.0.1:8000/api/v1/orders?page=2&pageSize=25&status=PENDING",
            previous: null,
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1202 })],
            count: 30,
            next: null,
            previous: "http://127.0.0.1:8000/api/v1/orders?page=1&pageSize=25&status=PENDING",
          }),
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          body: makeOrdersResponse({
            results: [makeOrder({ id: 1201 })],
            count: 30,
            next: "http://127.0.0.1:8000/api/v1/orders?page=2&pageSize=25&status=PENDING",
            previous: null,
          }),
        })
      );

    renderRoutes();

    expect(await screen.findByText("#1201")).toBeInTheDocument();
    expect(screen.getByText("1 order")).toBeInTheDocument();
    expect(screen.getByText("Pg 1 of 2")).toBeInTheDocument();

    let nextButton = screen.getByRole("button", { name: /next/i });
    let prevButton = screen.getByRole("button", { name: /prev/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("#1202")).toBeInTheDocument();
    expect(screen.getByText("Pg 2 of 2")).toBeInTheDocument();

    nextButton = screen.getByRole("button", { name: /next/i });
    prevButton = screen.getByRole("button", { name: /prev/i });

    expect(prevButton).toBeEnabled();
    expect(nextButton).toBeDisabled();

    await userEvent.click(prevButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("page=1&pageSize=25&status=PENDING"),
        expect.any(Object)
      );
    });

    expect(await screen.findByText("#1201")).toBeInTheDocument();
    expect(screen.getByText("Pg 1 of 2")).toBeInTheDocument();
  });
});
