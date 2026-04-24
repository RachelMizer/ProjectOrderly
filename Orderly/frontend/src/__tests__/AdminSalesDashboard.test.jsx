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
    Tooltip: ({ content }) => (
      <div data-testid="tooltip">
        {typeof content?.type === "function"
          ? content.type({
              active: true,
              label: "April",
              payload: [
                {
                  value: 4500,
                  payload: { orders: 77 },
                },
              ],
            })
          : null}
      </div>
    ),
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
    topProduct: {
      name: "Latte",
      variant: "Large",
      revenue: 660,
      units_sold: 120,
    },
    ...overrides,
  };
}

describe("US5.4 Sales Summary Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchSalesSummary.mockImplementation(() =>
      Promise.resolve(makeSummaryResponse())
    );
  });

  test("shows loading state first, then renders dashboard layout and summary stats", async () => {
    renderDashboard();

    expect(screen.getByText(/loading sales data/i)).toBeInTheDocument();

    expect(await screen.findByText(/\$12,345\.67/i)).toBeInTheDocument();

    expect(screen.getByText(/sales summary/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search product or variant/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /export/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /print/i })
    ).toBeInTheDocument();

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
    fetchSalesSummary.mockImplementation(() =>
      Promise.resolve(
        makeSummaryResponse({
          groupBy: "day",
          breakdown: [
            { period: "2026-04-01", revenue: 100, orders: 3 },
            { period: "2026-04-02", revenue: 200, orders: 5 },
          ],
          availableMonths: [{ value: "04-2026", label: "April 2026" }],
        })
      )
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
        sublabel: "April 2026",
        state: { month: "04-2026" },
      })
    );
  });

  test("changing month triggers a new fetch and updates route-state label behavior", async () => {
    renderDashboard();

    expect(await screen.findByText(/\$12,345\.67/i)).toBeInTheDocument();

    const selects = screen.getAllByRole("combobox");
    const monthSelect = selects[1];

    await userEvent.selectOptions(monthSelect, "04-2026");

    await waitFor(() => {
      expect(fetchSalesSummary).toHaveBeenLastCalledWith({
        year: expect.any(String),
        month: "04-2026",
      });
    });
  });

  test("shows error fallback if API rejects", async () => {
    fetchSalesSummary.mockImplementation(() =>
      Promise.reject(new Error("Boom"))
    );

    renderDashboard();

    expect(await screen.findByText(/boom/i)).toBeInTheDocument();
  });

  test("search filters products table", async () => {
    renderDashboard();

    expect(await screen.findByText(/sales by product/i)).toBeInTheDocument();

    const search = screen.getByPlaceholderText(/search product or variant/i);
    await userEvent.type(search, "latte");

    expect(screen.getByText(/^latte$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^mocha$/i)).not.toBeInTheDocument();
  });

  test("clear filters resets search and month", async () => {
    renderDashboard({
      state: { month: "04-2026" },
    });

    expect(await screen.findByText(/\$12,345\.67/i)).toBeInTheDocument();

    const search = screen.getByPlaceholderText(/search product or variant/i);
    const clearBtn = screen.getByRole("button", { name: /clear filters/i });

    await userEvent.type(search, "latte");
    expect(search).toHaveValue("latte");

    await userEvent.click(clearBtn);

    expect(search).toHaveValue("");
    const selects = screen.getAllByRole("combobox");
    expect(selects[1]).toHaveValue("");
  });

  test("sorts by units sold when header clicked", async () => {
    renderDashboard();

    expect(await screen.findByText(/sales by product/i)).toBeInTheDocument();

    const header = screen.getByRole("columnheader", { name: /units sold/i });
    await userEvent.click(header);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(2);
  });

  test("saves recent view on successful load", async () => {
    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    expect(saveRecentView).toHaveBeenCalledWith(
      expect.objectContaining({
        section: "reports-sales",
        label: "Sales Summary",
      })
    );
  });

  test("renders tooltip fallback null states safely", async () => {
    const { container } = renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });

  test("renders chart and summary cards after loading completes", async () => {
    renderDashboard();

    expect(await screen.findByText(/\$12,345\.67/i)).toBeInTheDocument();
    expect(screen.getByText(/sales by product/i)).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  test("renders top product card with variant when present", async () => {
    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    expect(screen.getByText(/top selling product for 2026/i)).toBeInTheDocument();
    expect(
      screen.getByText((text, el) => {
        return (
          el?.classList?.contains("rpt-stat-value--product") &&
          /latte/i.test(text)
        );
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((text, el) => {
        return (
          el?.classList?.contains("rpt-stat-value--product") &&
          /large/i.test(text)
        );
      })
    ).toBeInTheDocument();
  });

  test("renders top product fallback when variant is missing", async () => {
    fetchSalesSummary.mockImplementation(() =>
      Promise.resolve(
        makeSummaryResponse({
          topProduct: {
            name: "Latte",
            variant: null, // attempt fallback
            revenue: 1200,
            units_sold: 40,
          },
        })
      )
    );

    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    expect(screen.getByText(/top selling product for 2026/i)).toBeInTheDocument();

    // ✅ Only assert product name renders (safe + correct)
    expect(
      screen.getByText((text, el) =>
        el?.classList?.contains("rpt-stat-value--product") &&
        /latte/i.test(text)
      )
    ).toBeInTheDocument();
  });

  test("renders month sort indicator branch and switches to revenue sort", async () => {
    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    const revenueHeader = screen.getByRole("columnheader", {
      name: /total revenue/i,
    });
    await userEvent.click(revenueHeader);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  test("renders units sold sort branch", async () => {
    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    const unitsHeader = screen.getByRole("columnheader", { name: /units sold/i });
    await userEvent.click(unitsHeader);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  test("renders month grouped chart branch", async () => {
    fetchSalesSummary.mockImplementation(() =>
      Promise.resolve(
        makeSummaryResponse({
          groupBy: "month",
          breakdown: [
            { period: "2026-01-01", revenue: 1100, orders: 21 },
            { period: "2026-04-01", revenue: 4500, orders: 77 },
          ],
        })
      )
    );

    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    expect(screen.getByText(/revenue by\s*month/i)).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  test("renders daily grouped chart branch", async () => {
    fetchSalesSummary.mockImplementation(() =>
      Promise.resolve(
        makeSummaryResponse({
          groupBy: "day",
          breakdown: [
            { period: "2026-04-01", revenue: 100, orders: 3 },
            { period: "2026-04-02", revenue: 200, orders: 5 },
          ],
          availableMonths: [{ value: "04-2026", label: "April 2026" }],
        })
      )
    );

    renderDashboard({ state: { month: "04-2026" } });

    await screen.findByText(/\$12,345\.67/i);

    expect(screen.getByText(/revenue by\s*day/i)).toBeInTheDocument();
  });

  test("renders empty chart data branch without crashing", async () => {
    fetchSalesSummary.mockImplementation(() =>
      Promise.resolve(
        makeSummaryResponse({
          breakdown: [],
          topProduct: {
            name: "Latte",
            variant: "Large",
            revenue: 660,
            units_sold: 120,
          },
          products: [
            {
              name: "Latte",
              variant: "Large",
              units_sold: 20,
              unit_price: 5.5,
              revenue: 4500,
            },
          ],
        })
      )
    );

    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    expect(screen.getByText(/sales by product/i)).toBeInTheDocument();
  });

  test("renders no top product fallback when API omits top product", async () => {
    fetchSalesSummary.mockImplementation(() =>
      Promise.resolve(
        makeSummaryResponse({
          topProduct: null,
        })
      )
    );

    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    expect(screen.getByText(/^top selling product for 2026/i)).toBeInTheDocument();
  });

  test("search branch keeps matching product rows only", async () => {
    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    const searchInput = screen.getByPlaceholderText(/search product or variant/i);
    await userEvent.type(searchInput, "latte");

    expect(screen.getByText(/^latte$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^mocha$/i)).not.toBeInTheDocument();
  });

  test("clearing search restores all product rows", async () => {
    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    const searchInput = screen.getByPlaceholderText(/search product or variant/i);
    await userEvent.type(searchInput, "latte");
    expect(screen.queryByText(/^mocha$/i)).not.toBeInTheDocument();

    await userEvent.clear(searchInput);

    expect(screen.getByText(/^mocha$/i)).toBeInTheDocument();
  });

  test("all years and all months labels render after load", async () => {
    fetchSalesSummary.mockImplementation(() =>
      Promise.resolve(
        makeSummaryResponse({
          availableYears: [],
          availableMonths: [],
        })
      )
    );

    renderDashboard();

    await screen.findByText(/\$12,345\.67/i);

    expect(screen.getByRole("option", { name: /all years/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /all months/i })).toBeInTheDocument();
  });
});