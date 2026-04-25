import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminPurchaseOrderPage from "../pages/Admin/AdminPurchaseOrderPage";

jest.mock("../api/auth", () => ({
  getAuthHeaders: () => ({ Authorization: "Bearer test-token" }),
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

const lowStockItems = [
  {
    id: 1,
    name: "Coffee Beans",
    unitOfMeasure: "LB",
    stockQuantity: "3.25",
    reorderLevel: "10",
    supplierName: "Fresh Farms Co",
  },
  {
    id: 2,
    name: "Milk",
    unitOfMeasure: "L",
    stockQuantity: "2",
    reorderLevel: "5",
    supplierName: "",
  },
];

beforeEach(() => {
  global.fetch = jest.fn();
  global.URL.createObjectURL = jest.fn(() => "blob:test-url");
  global.URL.revokeObjectURL = jest.fn();
  window.print = jest.fn();
});

describe("AdminPurchaseOrderPage", () => {
  test("renders loading state first", () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ inventoryItems: [] }),
    });

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading low-stock inventory/i)).toBeInTheDocument();
  });

  test("renders empty state message", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ inventoryItems: [] }),
    });

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/no low-stock inventory items found/i)
    ).toBeInTheDocument();
  });

  test("renders low stock inventory rows", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ inventoryItems: lowStockItems }),
    });

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/coffee beans/i)).toBeInTheDocument();
    expect(screen.getByText(/fresh farms co/i)).toBeInTheDocument();
    expect(screen.getByText(/milk/i)).toBeInTheDocument();
    expect(screen.getByText(/no supplier assigned/i)).toBeInTheDocument();
    expect(screen.getByText(/2 items on this order/i)).toBeInTheDocument();
  });

  test("calculates default order quantities", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ inventoryItems: lowStockItems }),
    });

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    await screen.findByText(/coffee beans/i);

    const qtyInputs = screen.getAllByRole("spinbutton");

    expect(qtyInputs[0]).toHaveValue(7);
    expect(qtyInputs[1]).toHaveValue(3);
  });

  test("updates order quantity input", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ inventoryItems: lowStockItems }),
    });

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    await screen.findByText(/coffee beans/i);

    const qtyInputs = screen.getAllByRole("spinbutton");

    fireEvent.change(qtyInputs[0], {
      target: { value: "12" },
    });

    expect(qtyInputs[0]).toHaveValue(12);
  });

  test("can deselect one item", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ inventoryItems: lowStockItems }),
    });

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    await screen.findByText(/coffee beans/i);

    const checkboxes = screen.getAllByRole("checkbox");

    fireEvent.click(checkboxes[1]);

    expect(screen.getByText(/1 item on this order/i)).toBeInTheDocument();
  });

  test("can toggle all items off and disable export", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ inventoryItems: lowStockItems }),
    });

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    await screen.findByText(/coffee beans/i);

    const selectAll = screen.getAllByRole("checkbox")[0];

    fireEvent.click(selectAll);

    expect(screen.getByText(/0 items on this order/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export csv/i })).toBeDisabled();
  });

  test("exports selected items to csv", async () => {
    const clickMock = jest.fn();

    jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      const element = document.createElementNS("http://www.w3.org/1999/xhtml", tagName);
      if (tagName === "a") {
        element.click = clickMock;
      }
      return element;
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ inventoryItems: lowStockItems }),
    });

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    await screen.findByText(/coffee beans/i);

    fireEvent.click(screen.getByRole("button", { name: /export csv/i }));

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();

    document.createElement.mockRestore();
  });

  test("renders network error message", async () => {
    fetch.mockRejectedValueOnce(new Error("Network request failed"));

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/network request failed/i)).toBeInTheDocument();
  });

  test("renders failed load error message", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/failed to load low-stock inventory/i)
    ).toBeInTheDocument();
  });

  test("clicks print button", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ inventoryItems: [] }),
    });

    render(
      <MemoryRouter>
        <AdminPurchaseOrderPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /print/i }));

    expect(window.print).toHaveBeenCalled();
  });

  test("allows notes to be entered", async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ inventoryItems: lowStockItems }),
    });

    render(
        <MemoryRouter>
        <AdminPurchaseOrderPage />
        </MemoryRouter>
    );

    await screen.findByText(/coffee beans/i);

    const notes = screen.getByPlaceholderText(/notes/i);

    fireEvent.change(notes, {
        target: { value: "Please deliver by Friday." },
    });

    expect(notes).toHaveValue("Please deliver by Friday.");
    expect(
        screen.getAllByText(/please deliver by friday/i)
    ).toHaveLength(2);
    });
});