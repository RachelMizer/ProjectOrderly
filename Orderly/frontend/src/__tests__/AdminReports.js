import {
  fetchProductPerformance,
  fetchSalesSummary,
} from "../api/adminReports";

global.fetch = jest.fn();

const createMockResponse = (data, ok = true, status = 200) => ({
  ok,
  status,
  headers: {
    get: (key) => (key === "content-type" ? "application/json" : null),
  },
  json: jest.fn().mockResolvedValue(data),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("adminReports API", () => {
  test("fetchProductPerformance without params", async () => {
    const mockData = { results: [] };
    fetch.mockResolvedValue(createMockResponse(mockData));

    const result = await fetchProductPerformance();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(
      "http://127.0.0.1:8000/api/v1/admin/reports/product-performance"
    );
    expect(result).toEqual(mockData);
  });

  test("fetchProductPerformance with all params", async () => {
    const mockData = { results: [{ name: "Latte" }] };
    fetch.mockResolvedValue(createMockResponse(mockData));

    const result = await fetchProductPerformance({
      name: "Latte",
      variant: "Large",
      year: "2026",
      month: "04",
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(
      "http://127.0.0.1:8000/api/v1/admin/reports/product-performance?name=Latte&variant=Large&year=2026&month=04"
    );
    expect(result).toEqual(mockData);
  });

  test("fetchProductPerformance throws detail message on failure", async () => {
    fetch.mockResolvedValue(
      createMockResponse({ detail: "performance failed" }, false, 500)
    );

    await expect(fetchProductPerformance()).rejects.toThrow(
      "performance failed"
    );
  });

  test("fetchProductPerformance throws default message on failure with no detail", async () => {
    fetch.mockResolvedValue(createMockResponse({}, false, 500));

    await expect(fetchProductPerformance()).rejects.toThrow(
      "Failed to load product performance data."
    );
  });

  test("fetchSalesSummary with month builds day-grouped date range", async () => {
    const mockData = { summary: [] };
    fetch.mockResolvedValue(createMockResponse(mockData));

    const result = await fetchSalesSummary({ month: "03-2024" });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(
      "http://127.0.0.1:8000/api/v1/reports/sales/summary?startDate=2024-03-01&endDate=2024-03-31&groupBy=day"
    );
    expect(result).toEqual(mockData);
  });

  test("fetchSalesSummary with year builds month-grouped date range", async () => {
    const mockData = { summary: [] };
    fetch.mockResolvedValue(createMockResponse(mockData));

    const result = await fetchSalesSummary({ year: "2025" });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(
      "http://127.0.0.1:8000/api/v1/reports/sales/summary?startDate=2025-01-01&endDate=2025-12-31&groupBy=month"
    );
    expect(result).toEqual(mockData);
  });

  test("fetchSalesSummary default case uses fallback date range", async () => {
    const mockData = { summary: [] };
    fetch.mockResolvedValue(createMockResponse(mockData));

    const result = await fetchSalesSummary();

    expect(fetch).toHaveBeenCalledTimes(1);

    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain(
      "http://127.0.0.1:8000/api/v1/reports/sales/summary?"
    );
    expect(calledUrl).toContain("startDate=2020-01-01");
    expect(calledUrl).toContain("endDate=");
    expect(calledUrl).toContain("groupBy=month");

    expect(result).toEqual(mockData);
  });

  test("fetchSalesSummary throws detail message on failure", async () => {
    fetch.mockResolvedValue(
      createMockResponse({ detail: "sales failed" }, false, 500)
    );

    await expect(fetchSalesSummary()).rejects.toThrow("sales failed");
  });

  test("fetchSalesSummary throws default message on failure with no detail", async () => {
    fetch.mockResolvedValue(createMockResponse({}, false, 500));

    await expect(fetchSalesSummary()).rejects.toThrow(
      "Failed to load sales summary."
    );
  });

  test("returns empty object when response content-type is not json", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => "text/html",
      },
      json: jest.fn(),
    });

    const result = await fetchProductPerformance();

    expect(result).toEqual({});
  });
});