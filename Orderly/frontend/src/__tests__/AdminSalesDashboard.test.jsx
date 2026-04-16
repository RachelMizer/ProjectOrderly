import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminSalesDashboard from "../pages/Admin/AdminSalesDashboard";
import { fetchSalesSummary } from "../api/adminReports";
import { saveRecentView } from "../utils/recentViews";

jest.mock("../api/adminReports", () => ({
  fetchSalesSummary: jest.fn(),
}));

jest.mock("../utils/recentViews", () => ({
  saveRecentView: jest.fn(),
}));

jest.mock("recharts", () => {
  const React = require("react");
  return {
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ children }) => <div data-testid="bar">{children}</div>,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    LabelList: () => <div data-testid="label-list" />,
  };
});

function renderDashboard({ route = "/admin/reports/sales", state } = {}) {
  const entries = state ? [{ pathname: route, state }] : [route];

  return render(
    <MemoryRouter initialEntries={entries}>
      <Routes>
        <Route path="/admin/reports/sales" element={<AdminSalesDashboard />} />
      </Routes>
    </MemoryRouter>
  );
}

function makeSummaryResponse(overrides = {}) {
  return {
    totalRevenue: 12345.67,
    totalOrders: 321,
    groupBy: "month",
    breakdown: [
      { period: "2026-01-01", revenue: 1100, orders: 21 },
      { period: "2026-02-01", revenue: 2200, orders: 43 },
      { period: "2026-04-01", revenue: 4500, orders: 77 },
    ],
    availableYears: ["2025", "2026"],
    availableMonths: [
      { value: "03-2026", label: "March 2026" },
      { value: "04-2026", label: "April 2026" },
    ],
    products: [
      {
        rank: 1,
        name: "Latte",
        variant: "Large",
        unit_price: "5.50",
        units_sold: 120,
        revenue: "660.00",
      },
      {
        rank: 2,
        name: "Mocha",
        variant: "Medium",
        unit_price: "6.00",
        units_sold: 95,
        revenue: "570.00",
      },
    ],
    ...overrides,
  };
}

describe("US5.4 Sales Summary Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading state first, then renders dashboard layout and summary stats", async () => {
    fetchSalesSummary.mockResolvedValue(makeSummaryResponse());

    renderDashboard();

    expect(screen.getByText(/loading sales data/i)).toBeInTheDocument();

    expect(await screen.findByText(/\$12,345\.67/i)).toBeInTheDocument();

    expect(screen.getByText(/sales summary/i)).toBeInTheDocument();
    expect(
        screen.getByPlaceholderText(/search product or variant/i)
    ).toBeInTheDocument();
    expect(
        screen.getByRole("button", { name: /> export/i })
    ).toBeInTheDocument();
    expect(
        screen.getByRole("button", { name: /> print/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/\$12,345\.67/i)).toBeInTheDocument();
    expect(screen.getByText(/^321$/)).toBeInTheDocument();
    expect(screen.getByText(/sales by product/i)).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.queryByText(/loading sales data/i)).not.toBeInTheDocument();

    expect(fetchSalesSummary).toHaveBeenCalledWith({
        year: expect.any(String),
        month: null,
    });
});

  test("uses month from route state on first load and shows month-specific period label", async () => {
    fetchSalesSummary.mockResolvedValue(
      makeSummaryResponse({
        groupBy: "day",
        breakdown: [
          { period: "2026-04-01", revenue: 100, orders: 3 },
          { period: "2026-04-02", revenue: 200, orders: 5 },
        ],
        availableMonths: [{ value: "04-2026", label: "April 2026" }],
      })
    );

    renderDashboard({
      state: { month: "04-2026" },
    });

    expect(
      await screen.findByText((content, element) => {
        return (
          element?.classList?.contains("rpt-period-label") &&
          /april 2026/i.test(content)
        );
      })
    ).toBeInTheDocument();

    expect(fetchSalesSummary).toHaveBeenCalledWith({
      year: "2026",
      month: "04-2026",
    });

    expect(saveRecentView).toHaveBeenCalledWith(
      expect.objectContaining({
        section: "reports-sales",
        label: "Sales Summary",
        path: "/admin/reports/sales",
        state: { month: "04-2026" },
      })
    );
  });

  test("re-fetches when the year filter changes and shows clear filters", async () => {
    fetchSalesSummary.mockResolvedValue(makeSummaryResponse());

    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    const selects = screen.getAllByRole("combobox");
    const yearSelect = selects[0];

    await userEvent.selectOptions(yearSelect, "2025");

    await waitFor(() => {
      expect(fetchSalesSummary).toHaveBeenLastCalledWith({
        year: "2025",
        month: null,
      });
    });

    expect(
      screen.getByRole("button", { name: /clear filters/i })
    ).toBeInTheDocument();
  });

  test("shows error state when the API request fails", async () => {
    fetchSalesSummary.mockRejectedValue(new Error("Failed to load sales data."));

    renderDashboard();

    expect(
      await screen.findByText(/failed to load sales data/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/loading sales data/i)).not.toBeInTheDocument();
  });

  test("shows empty state when there are no products", async () => {
    fetchSalesSummary.mockResolvedValue(
      makeSummaryResponse({
        products: [],
      })
    );

    renderDashboard();

    await screen.findByText(/sales by product/i);

    expect(screen.getAllByText(/no data available/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/no sales data to display yet/i)
    ).toBeInTheDocument();
  });

  test("shows no-results message when the search filters everything out", async () => {
    fetchSalesSummary.mockResolvedValue(
      makeSummaryResponse({
        products: [],
      })
    );

    renderDashboard();

    await screen.findByText(/sales by product/i);

    const searchInput = screen.getByPlaceholderText(
      /search product or variant/i
    );
    await userEvent.type(searchInput, "zzz-no-match");

    expect(
      screen.getByText(/no results match your search/i)
    ).toBeInTheDocument();
  });

  test("renders top-selling product card and product table from API data", async () => {
    fetchSalesSummary.mockResolvedValue(makeSummaryResponse());

    renderDashboard({
        state: { month: "04-2026" },
    });

    // wait for loaded state
    await screen.findByText(/\$12,345\.67/i);

    // ✅ Top selling product section
    expect(
        screen.getByText(/top selling product for/i)
    ).toBeInTheDocument();

    // ✅ Product name + variant (split safely)
    expect(screen.getByText(/^latte$/i)).toBeInTheDocument();
    expect(screen.getByText(/^large$/i)).toBeInTheDocument();

    // ✅ Sales + units
    expect(
        screen.getByText(/total sales:\s*\$\s*660\.00/i)
        ).toBeInTheDocument();

    expect(
        screen.getByText(/units sold:\s*120/i)
        ).toBeInTheDocument();

    // ✅ Table headers
    expect(
        screen.getByRole("columnheader", { name: /product/i })
    ).toBeInTheDocument();
    expect(
        screen.getByRole("columnheader", { name: /variant/i })
    ).toBeInTheDocument();
    expect(
        screen.getByRole("columnheader", { name: /unit price/i })
    ).toBeInTheDocument();
    expect(
        screen.getByRole("columnheader", { name: /total revenue/i })
    ).toBeInTheDocument();

    // ✅ Table rows
    expect(screen.getByText(/^latte$/i)).toBeInTheDocument();
    expect(screen.getByText(/^mocha$/i)).toBeInTheDocument();
    });
});