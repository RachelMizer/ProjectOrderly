import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminExportPage from "../pages/Admin/AdminExportPage.jsx";

beforeEach(() => {
  localStorage.setItem("accessToken", "fake-token");
  global.fetch = jest.fn();
  global.URL.createObjectURL = jest.fn(() => "blob:test-url");
  global.URL.revokeObjectURL = jest.fn();
});

test("sanity check renders real AdminExportPage", () => {
  render(<AdminExportPage />);

  screen.debug();

  expect(screen.getByText("Export Data")).toBeInTheDocument();
  expect(screen.getByText(/Download business data as CSV files/i)).toBeInTheDocument();
});

test("renders export page content", () => {
  render(<AdminExportPage />);

  expect(screen.getByText(/export data/i)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /orders/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /products/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /inventory/i })).toBeInTheDocument();
  expect(screen.getByText(/date range/i)).toBeInTheDocument();
});

test("updates date inputs", () => {
  render(<AdminExportPage />);

  const inputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);

  fireEvent.change(inputs[0], { target: { value: "2026-04-01" } });
  fireEvent.change(inputs[1], { target: { value: "2026-04-24" } });

  expect(inputs[0]).toHaveValue("2026-04-01");
  expect(inputs[1]).toHaveValue("2026-04-24");
  expect(screen.getByText(/filtered: 2026-04-01/i)).toBeInTheDocument();
});

test("downloads orders csv", async () => {
  const clickMock = jest.fn();

  jest.spyOn(document, "createElement").mockImplementation((tagName) => {
    const element = document.createElementNS("http://www.w3.org/1999/xhtml", tagName);
    if (tagName === "a") element.click = clickMock;
    return element;
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    blob: async () => new Blob(["csv"]),
  });

  render(<AdminExportPage />);

  fireEvent.click(screen.getByRole("button", { name: /download orders csv/i }));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/export/orders?startDate="),
      expect.objectContaining({
        headers: { Authorization: "Bearer fake-token" },
      })
    );
  });

  expect(URL.createObjectURL).toHaveBeenCalled();
  expect(clickMock).toHaveBeenCalled();
  expect(URL.revokeObjectURL).toHaveBeenCalled();

  document.createElement.mockRestore();
});

test("downloads products csv", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    blob: async () => new Blob(["csv"]),
  });

  render(<AdminExportPage />);

  fireEvent.click(screen.getByRole("button", { name: /download products csv/i }));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/api/v1/reports/export/products`,
      expect.any(Object)
    );
  });
});

test("downloads inventory csv", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    blob: async () => new Blob(["csv"]),
  });

  render(<AdminExportPage />);

  fireEvent.click(screen.getByRole("button", { name: /download inventory csv/i }));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/api/v1/reports/export/inventory`,
      expect.any(Object)
    );
  });
});

test("shows server error when export fails", async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
  });

  render(<AdminExportPage />);

  fireEvent.click(screen.getByRole("button", { name: /download orders csv/i }));

  expect(await screen.findByText(/server returned 500/i)).toBeInTheDocument();
});

test("shows network error when export request fails", async () => {
  fetch.mockRejectedValueOnce(new Error("Network request failed"));

  render(<AdminExportPage />);

  fireEvent.click(screen.getByRole("button", { name: /download inventory csv/i }));

  expect(await screen.findByText(/network request failed/i)).toBeInTheDocument();
});