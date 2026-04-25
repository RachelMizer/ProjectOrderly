import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminProductPerformance from "../pages/Admin/AdminProductPerformance";
import {
  fetchProductPerformance,
  fetchSalesSummary,
} from "../api/adminReports";
import { saveRecentView } from "../utils/recentViews";

jest.mock("../api/adminReports", () => ({
  fetchProductPerformance: jest.fn(),
  fetchSalesSummary: jest.fn(),
}));

jest.mock("../utils/recentViews", () => ({
  saveRecentView: jest.fn(),
}));

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="chart-wrap">{children}</div>,
  BarChart: ({ children, data }) => (
    <div data-testid="bar-chart" data-points={data?.length || 0}>
      {children}
    </div>
  ),
  Bar: ({ children }) => <div data-testid="bar">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: ({ content }) => (
    <div data-testid="tooltip">
      {typeof content?.type === "function"
        ? content.type({
            active: true,
            label: "APR '26",
            payload: [
              {
                value: 100.5,
                payload: { units_sold: 20 },
              },
            ],
          })
        : null}
    </div>
  ),
  LabelList: () => <div data-testid="label-list" />,
}));

describe("AdminProductPerformance", () => {
  const productsResponse = {
    products: [
      { name: "Latte", variant: "Large" },
      { name: "Mocha", variant: "Medium" },
    ],
  };

  const salesResponse = {
    products: [
      {
        name: "Latte",
        variant: "Large",
        category: "Coffee",
        units_sold: 20,
        revenue: "100.50",
      },
      {
        name: "Mocha",
        variant: "Medium",
        category: "Coffee",
        units_sold: 10,
        revenue: "50.25",
      },
      {
        name: "Tea",
        variant: "Small",
        category: "Tea",
        units_sold: 5,
        revenue: "20.00",
      },
    ],
    available_years: ["2025", "2026"],
    available_months: [
      { value: "04-2026", label: "April 2026" },
      { value: "03-2026", label: "March 2026" },
    ],
  };

  const detailResponse = {
    selected: {
      name: "Latte",
      variant: "Large",
      granularity: "monthly",
      total_revenue: "100.50",
      total_units: 20,
      best_period: "April 2026",
      breakdown: [
        {
          label: "April 2026",
          month_key: "04-2026",
          units_sold: 20,
          revenue: "100.50",
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    fetchProductPerformance.mockImplementation((args = {}) => {
      if (args.name && args.variant) {
        return Promise.resolve(detailResponse);
      }
      return Promise.resolve(productsResponse);
    });

    fetchSalesSummary.mockResolvedValue(salesResponse);
  });

  function getComboboxes() {
    return screen.getAllByRole("combobox");
  }

  async function getRankingRows() {
    return await screen.findAllByTitle(/click to view full performance/i);
  }

  test("renders loading state while products are loading", () => {
    fetchProductPerformance.mockReturnValue(new Promise(() => {}));
    fetchSalesSummary.mockReturnValue(new Promise(() => {}));

    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders rankings table after initial load", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    expect(await screen.findByText(/product rankings/i)).toBeInTheDocument();
    expect(screen.getByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("Mocha")).toBeInTheDocument();
    expect(screen.getAllByRole("cell", { name: "Tea" })[0]).toBeInTheDocument();
  });

  test("renders empty rankings state", async () => {
    fetchSalesSummary.mockResolvedValue({
      products: [],
      available_years: [],
      available_months: [],
    });

    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    expect(
      await screen.findByText(/no sales data available/i)
    ).toBeInTheDocument();
  });

  test("filters rankings by category", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    await screen.findByText("Latte");

    const selects = getComboboxes();
    const categorySelect = selects[3];

    fireEvent.change(categorySelect, {
      target: { value: "Tea" },
    });

    expect(screen.getAllByRole("cell", { name: "Tea" })[0]).toBeInTheDocument();
    expect(screen.queryByText("Latte")).not.toBeInTheDocument();
    expect(screen.queryByText("Mocha")).not.toBeInTheDocument();
  });

  test("sorts rankings by revenue", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    await screen.findByText("Latte");

    fireEvent.click(screen.getByText(/revenue/i));

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Tea");
    expect(rows[3]).toHaveTextContent("Latte");
  });

  test("clicking a ranking row loads detail", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    const rows = await getRankingRows();
    fireEvent.click(rows[0]);

    expect(await screen.findByText(/latte — large/i)).toBeInTheDocument();
    expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
  });

  test("renders chart after selecting product", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    const rows = await getRankingRows();
    fireEvent.click(rows[0]);

    expect(await screen.findByTestId("chart-wrap")).toBeInTheDocument();
  });

  test("handles detail fetch error", async () => {
    fetchProductPerformance
      .mockResolvedValueOnce(productsResponse)
      .mockRejectedValueOnce(new Error("Failed to load product data."));

    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    const rows = await getRankingRows();
    fireEvent.click(rows[0]);

    expect(
      await screen.findByText(/failed to load product data/i)
    ).toBeInTheDocument();
  });

  test("clear filters resets search + category", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    await screen.findByText("Latte");

    const selects = getComboboxes();
    const categorySelect = selects[3];

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "latte" },
    });

    fireEvent.change(categorySelect, {
      target: { value: "Coffee" },
    });

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(screen.getByPlaceholderText(/search/i)).toHaveValue("");
    expect(categorySelect).toHaveValue("");
  });

  test("saves recent view (rankings)", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    await screen.findByText("Latte");

    await waitFor(() => {
      expect(saveRecentView).toHaveBeenCalled();
    });
  });

  test("saves recent view (detail)", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    const rows = await getRankingRows();
    fireEvent.click(rows[0]);

    await waitFor(() => {
      expect(saveRecentView).toHaveBeenCalled();
    });
  });

  test("toggles sort direction when same column is clicked twice", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    await screen.findByText("Latte");

    fireEvent.click(screen.getByText(/revenue/i));
    fireEvent.click(screen.getByText(/revenue/i));

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Latte");
    expect(rows[3]).toHaveTextContent("Tea");
  });

  test("changes sort key and resets sort direction when a different column is clicked", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    await screen.findByText("Latte");

    fireEvent.click(screen.getByText(/revenue/i));
    fireEvent.click(screen.getAllByText("Product")[0]);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Latte");
    expect(rows[2]).toHaveTextContent("Mocha");
    expect(rows[3]).toHaveTextContent("Tea");
  });

  test("shows year-to-date label when month is cleared", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    await screen.findByText("Latte");

    const selects = screen.getAllByRole("combobox");
    const monthSelect = selects[2];

    fireEvent.change(monthSelect, { target: { value: "" } });

    expect(
      await screen.findByText(/year-to-date/i)
    ).toBeInTheDocument();
  });

  test("shows all time label when both year and month are cleared", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    await screen.findByText("Latte");

    const selects = screen.getAllByRole("combobox");
    const yearSelect = selects[1];
    const monthSelect = selects[2];

    fireEvent.change(yearSelect, { target: { value: "" } });
    fireEvent.change(monthSelect, { target: { value: "" } });

    expect(await screen.findByText(/all time/i)).toBeInTheDocument();
  });

  test("renders tooltip revenue and units in detail view", async () => {
    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    const rows = await screen.findAllByTitle(/click to view full performance/i);
    fireEvent.click(rows[0]);

    expect(await screen.findByText(/revenue:\s*\$100\.50/i)).toBeInTheDocument();
    expect(screen.getByText(/units sold:\s*20/i)).toBeInTheDocument();
  });

  test("renders daily detail view labels when selected product granularity is daily", async () => {
    fetchProductPerformance.mockImplementation((args = {}) => {
      if (args.name && args.variant) {
        return Promise.resolve({
          selected: {
            name: "Latte",
            variant: "Large",
            granularity: "daily",
            total_revenue: "100.50",
            total_units: 20,
            best_period: "Day 5",
            breakdown: [
              {
                label: "Day 5",
                date_key: "2026-04-05",
                units_sold: 20,
                revenue: "100.50",
              },
            ],
          },
        });
      }
      return Promise.resolve(productsResponse);
    });

    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    const rows = await screen.findAllByTitle(/click to view full performance/i);
    fireEvent.click(rows[0]);

    expect(await screen.findByText(/best day/i)).toBeInTheDocument();
    expect(screen.getByText(/daily revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/daily breakdown/i)).toBeInTheDocument();
    expect(screen.getAllByText("Day 5").length).toBeGreaterThan(0);
  });

  test("renders no chart when selected product has empty breakdown", async () => {
    fetchProductPerformance.mockImplementation((args = {}) => {
      if (args.name && args.variant) {
        return Promise.resolve({
          selected: {
            name: "Latte",
            variant: "Large",
            granularity: "monthly",
            total_revenue: "0.00",
            total_units: 0,
            best_period: "N/A",
            breakdown: [],
          },
        });
      }
      return Promise.resolve(productsResponse);
    });

    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    const rows = await screen.findAllByTitle(/click to view full performance/i);
    fireEvent.click(rows[0]);

    expect(await screen.findByText(/latte — large/i)).toBeInTheDocument();
    expect(screen.queryByTestId("chart-wrap")).not.toBeInTheDocument();
  });

  test("uses fallback product load error when initial fetch rejects without message", async () => {
    fetchProductPerformance.mockRejectedValueOnce({});

    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    expect(await screen.findByText(/failed to load products\./i)).toBeInTheDocument();
  });

  test("uses fallback detail load error when selected product fetch rejects without message", async () => {
    fetchProductPerformance
      .mockResolvedValueOnce(productsResponse)
      .mockRejectedValueOnce({});

    render(<MemoryRouter><AdminProductPerformance /></MemoryRouter>);

    const rows = await screen.findAllByTitle(/click to view full performance/i);
    fireEvent.click(rows[0]);

    expect(
      await screen.findByText(/failed to load product data\./i)
    ).toBeInTheDocument();
  });
});