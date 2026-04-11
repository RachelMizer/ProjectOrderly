import {
  getGuestCartEmail,
  getOrderDetail,
  mergeGuestCart,
  submitOrder,
  getOrderHistory,
} from "../api/orders";

jest.mock("../api/auth", () => ({
  getAuthHeaders: jest.fn(() => ({
    Authorization: "Bearer fake-token",
  })),
}));

describe("orders API", () => {
  beforeEach(() => {
    localStorage.setItem("accessToken", "fake-token");
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
    global.crypto = {
      randomUUID: jest.fn(() => "test-uuid"),
    };
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(window, "dispatchEvent");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockResponse({
    ok = true,
    status = 200,
    data = {},
    contentType = "application/json",
  } = {}) {
    return Promise.resolve({
      ok,
      status,
      headers: {
        get: jest.fn(() => contentType),
      },
      json: jest.fn().mockResolvedValue(data),
    });
  }

  describe("getGuestCartEmail", () => {
    test("returns existing guest cart email from localStorage", () => {
      localStorage.setItem("guestCartEmail", "guest_existing@cart.local");

      const result = getGuestCartEmail();

      expect(result).toBe("guest_existing@cart.local");
      expect(global.crypto.randomUUID).not.toHaveBeenCalled();
    });

    test("creates and stores a guest cart email when none exists", () => {
      const result = getGuestCartEmail();

      expect(result).toBe("guest_test-uuid@cart.local");
      expect(localStorage.getItem("guestCartEmail")).toBe(
        "guest_test-uuid@cart.local"
      );
      expect(global.crypto.randomUUID).toHaveBeenCalled();
    });
  });

  describe("getOrderDetail", () => {
    test("returns order detail on success", async () => {
      const mockData = { id: 15, status: "COMPLETED" };
      fetch.mockImplementation(() => mockResponse({ data: mockData }));

      const result = await getOrderDetail(15);

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/15",
        expect.objectContaining({
            method: "GET",
            credentials: "include",
            headers: expect.objectContaining({
            "Content-Type": "application/json",
            }),
        })
        );
      expect(result).toEqual(mockData);
    });

    test("throws backend message when response is not ok", async () => {
      fetch.mockImplementation(() =>
        mockResponse({
          ok: false,
          status: 404,
          data: { message: "Order not found" },
        })
      );

      await expect(getOrderDetail(999)).rejects.toMatchObject({
        message: "Order not found",
        response: {
          status: 404,
          data: { message: "Order not found" },
        },
      });
    });

    test("throws default error when non-json response fails", async () => {
      fetch.mockImplementation(() =>
        mockResponse({
          ok: false,
          status: 500,
          contentType: "text/html",
        })
      );

      await expect(getOrderDetail(1)).rejects.toMatchObject({
        message: "Failed to fetch order detail",
        response: {
          status: 500,
          data: {},
        },
      });
    });

    test("handles invalid json response safely", async () => {
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: jest.fn(() => "application/json") },
        json: jest.fn().mockRejectedValue(new Error("bad json")),
      });

      const result = await getOrderDetail(20);

      expect(result).toEqual({});
    });
  });

  describe("mergeGuestCart", () => {
    test("returns early when no guest cart email exists", async () => {
      localStorage.setItem("accessToken", "fake-token");

      await mergeGuestCart();

      expect(fetch).not.toHaveBeenCalled();
    });

    test("returns early when no access token exists", async () => {
      localStorage.setItem("guestCartEmail", "guest@test.com");

      await mergeGuestCart();

      expect(fetch).not.toHaveBeenCalled();
    });

    test("removes guest email and dispatches cart-updated even when guest draft has no id", async () => {
      localStorage.setItem("guestCartEmail", "guest@test.com");
      localStorage.setItem("accessToken", "fake-token");

      fetch.mockImplementation(() =>
        mockResponse({
          data: { id: null },
        })
      );

      await mergeGuestCart();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem("guestCartEmail")).toBeNull();
      expect(window.dispatchEvent).toHaveBeenCalled();
    });

    test("merges guest cart items and modifiers into authenticated cart", async () => {
      localStorage.setItem("guestCartEmail", "guest@test.com");
      localStorage.setItem("accessToken", "fake-token");

      fetch
        .mockImplementationOnce(() =>
          mockResponse({ data: { id: 123 } })
        )
        .mockImplementationOnce(() =>
          mockResponse({
            data: {
              items: [
                {
                  variantId: 10,
                  quantity: 2,
                  modifiers: [{ optionId: 901 }, { optionId: 902 }],
                },
                {
                  variantId: 20,
                  quantity: 1,
                  modifiers: [],
                },
              ],
            },
          })
        )
        .mockImplementationOnce(() =>
          mockResponse({ data: { id: 500 } })
        )
        .mockImplementationOnce(() =>
          mockResponse({ data: { orderItemId: 700 } })
        )
        .mockImplementationOnce(() =>
          mockResponse({ data: {} })
        )
        .mockImplementationOnce(() =>
          mockResponse({ data: {} })
        )
        .mockImplementationOnce(() =>
          mockResponse({ data: { orderItemId: 701 } })
        );

      await mergeGuestCart();

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/draft",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ guestEmail: "guest@test.com" }),
        })
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/123?guestEmail=guest%40test.com"
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/draft",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({}),
        })
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/items",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ variantId: 10, quantity: 2 }),
        })
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/items/700/modifiers",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ modifierId: 901, quantity: 1 }),
        })
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/items/700/modifiers",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ modifierId: 902, quantity: 1 }),
        })
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/items",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ variantId: 20, quantity: 1 }),
        })
      );

      expect(localStorage.getItem("guestCartEmail")).toBeNull();
      expect(window.dispatchEvent).toHaveBeenCalled();
    });

    test("does not create authenticated cart items when guest cart is empty", async () => {
      localStorage.setItem("guestCartEmail", "guest@test.com");
      localStorage.setItem("accessToken", "fake-token");

      fetch
        .mockImplementationOnce(() =>
          mockResponse({ data: { id: 123 } })
        )
        .mockImplementationOnce(() =>
          mockResponse({ data: { items: [] } })
        );

      await mergeGuestCart();

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(localStorage.getItem("guestCartEmail")).toBeNull();
      expect(window.dispatchEvent).toHaveBeenCalled();
    });

    test("swallows merge errors, logs them, and still cleans up", async () => {
      localStorage.setItem("guestCartEmail", "guest@test.com");
      localStorage.setItem("accessToken", "fake-token");

      fetch.mockRejectedValue(new Error("network failure"));

      await mergeGuestCart();

      expect(console.error).toHaveBeenCalled();
      expect(localStorage.getItem("guestCartEmail")).toBeNull();
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
  });

  describe("submitOrder", () => {
    test("submits order successfully", async () => {
      const payload = { paymentType: "CREDIT_CARD", cardLast4: "1234" };
      const responseData = { id: 50, status: "PENDING" };
      fetch.mockImplementation(() => mockResponse({ data: responseData }));

      const result = await submitOrder(50, payload);

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/50/submit",
        expect.objectContaining({
          method: "PATCH",
          credentials: "include",
          body: JSON.stringify(payload),
        })
      );
      expect(result).toEqual(responseData);
    });

    test("throws backend detail on submit failure", async () => {
      fetch.mockImplementation(() =>
        mockResponse({
          ok: false,
          status: 400,
          data: { detail: "Invalid payment" },
        })
      );

      await expect(
        submitOrder(50, { paymentType: "CREDIT_CARD" })
      ).rejects.toMatchObject({
        message: "Invalid payment",
        response: {
          status: 400,
          data: { detail: "Invalid payment" },
        },
      });
    });
  });

  describe("getOrderHistory", () => {
    test("gets order history with default pagination", async () => {
      const responseData = { results: [], count: 0 };
      fetch.mockImplementation(() => mockResponse({ data: responseData }));

      const result = await getOrderHistory();

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/me?page=1&pageSize=25",
        expect.objectContaining({
          method: "GET",
          credentials: "include",
        })
      );
      expect(result).toEqual(responseData);
    });

    test("gets order history with custom pagination", async () => {
      fetch.mockImplementation(() =>
        mockResponse({ data: { results: [{ id: 1 }] } })
      );

      await getOrderHistory({ page: 2, pageSize: 10 });

      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/orders/me?page=2&pageSize=10",
        expect.any(Object)
      );
    });

    test("throws default error when order history fetch fails without json body", async () => {
      fetch.mockImplementation(() =>
        mockResponse({
          ok: false,
          status: 500,
          contentType: "text/plain",
        })
      );

      await expect(getOrderHistory()).rejects.toMatchObject({
        message: "Failed to fetch order history",
        response: {
          status: 500,
          data: {},
        },
      });
    });
  });
});