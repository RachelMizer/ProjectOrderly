import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Reports from "../pages/Admin/reports";
import { fetchSalesSummary } from "../api/adminReports";

const mockNavigate = jest.fn();
let capturedBarProps = null;
let capturedLabelListProps = null;
let capturedTooltipProps = null;
let capturedXAxisProps = null;
let capturedYAxisProps = null;

jest.mock("../api/adminReports", () => ({
  fetchSalesSummary: jest.fn(),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: (props) => {
    capturedXAxisProps = props;
    return <div data-testid="x-axis">{props.tickFormatter?.("March")}</div>;
  },
  YAxis: (props) => {
    capturedYAxisProps = props;
    return <div data-testid="y-axis">{props.tickFormatter?.(2500)}</div>;
  },
  Tooltip: (props) => {
    capturedTooltipProps = props;

    return (
      <div data-testid="tooltip">
        <div data-testid="tooltip-zero">
          {props.content?.type?.({
            active: true,
            payload: [{ value: 0, payload: { orders: 0 } }],
            label: "March",
          })}
        </div>

        <div data-testid="tooltip-filled">
          {props.content?.type?.({
            active: true,
            payload: [{ value: 2500, payload: { orders: 12 } }],
            label: "March",
          })}
        </div>

        <div data-testid="tooltip-inactive">
          {props.content?.type?.({
            active: false,
            payload: [{ value: 2500, payload: { orders: 12 } }],
            label: "March",
          })}
        </div>
      </div>
    );
  },
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: (props) => {
    capturedBarProps = props;
    return (
      <button
        type="button"
        data-testid="bar-click-target"
        onClick={() =>
          props.onClick?.({ label: "March", revenue: 2500, orders: 12 })
        }
      >
        {props.children}
      </button>
    );
  },
  LabelList: (props) => {
    capturedLabelListProps = props;
    return (
      <div data-testid="label-list">
        <span data-testid="label-zero">{props.formatter?.(0)}</span>
        <span data-testid="label-small">{props.formatter?.(250)}</span>
        <span data-testid="label-large">{props.formatter?.(2500)}</span>
      </div>
    );
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>
  );
}

describe("Reports page extra coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedBarProps = null;
    capturedLabelListProps = null;
    capturedTooltipProps = null;
    capturedXAxisProps = null;
    capturedYAxisProps = null;
  });

  test("renders tooltip values for non-zero revenue and hides zero/inactive tooltip states", async () => {
    fetchSalesSummary.mockResolvedValueOnce({
      breakdown: [{ period: "2026-03-01", revenue: 2500, orders: 12 }],
    });

    renderPage();

    await screen.findByText(/Revenue by Month/);

    expect(screen.getByText("Revenue: $2,500.00")).toBeInTheDocument();
    expect(screen.getByText("Orders: 12")).toBeInTheDocument();

    expect(screen.getByTestId("tooltip-zero")).toBeEmptyDOMElement();
    expect(screen.getByTestId("tooltip-inactive")).toBeEmptyDOMElement();
  });

  test("covers axis and label formatters", async () => {
    fetchSalesSummary.mockResolvedValueOnce({
      breakdown: [{ period: "2026-03-01", revenue: 2500, orders: 12 }],
    });

    renderPage();

    await screen.findByText(/Revenue by Month/);

    expect(screen.getByTestId("x-axis")).toHaveTextContent("MARCH");
    expect(screen.getByTestId("y-axis")).toHaveTextContent("$2,500");

    expect(screen.getByTestId("label-zero")).toHaveTextContent("");
    expect(screen.getByTestId("label-small")).toHaveTextContent("$250");
    expect(screen.getByTestId("label-large")).toHaveTextContent("$2.5k");
  });

  test("passes pointer cursor style to revenue bars", async () => {
    fetchSalesSummary.mockResolvedValueOnce({
      breakdown: [{ period: "2026-03-01", revenue: 2500, orders: 12 }],
    });

    renderPage();

    await screen.findByText(/Revenue by Month/);

    expect(capturedBarProps.style).toEqual({ cursor: "pointer" });
    expect(capturedBarProps.dataKey).toBe("revenue");
  });

  test("navigates when bar is clicked with a valid month", async () => {
    const currentYear = String(new Date().getFullYear());

    fetchSalesSummary.mockResolvedValueOnce({
      breakdown: [{ period: "2026-03-01", revenue: 2500, orders: 12 }],
    });

    renderPage();

    await screen.findByText(/Revenue by Month/);
    fireEvent.click(screen.getByTestId("bar-click-target"));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/reports/sales", {
      state: { month: `03-${currentYear}` },
    });
  });

  test("does not navigate for unknown month label", async () => {
    fetchSalesSummary.mockResolvedValueOnce({
      breakdown: [{ period: "2026-03-01", revenue: 2500, orders: 12 }],
    });

    renderPage();

    await screen.findByText(/Revenue by Month/);

    capturedBarProps.onClick({ label: "NotAMonth", revenue: 2500, orders: 12 });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("does not navigate when click payload is missing or zero", async () => {
    fetchSalesSummary.mockResolvedValueOnce({
      breakdown: [{ period: "2026-03-01", revenue: 2500, orders: 12 }],
    });

    renderPage();

    await screen.findByText(/Revenue by Month/);

    capturedBarProps.onClick(undefined);
    capturedBarProps.onClick({ label: "March", revenue: 0, orders: 0 });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});